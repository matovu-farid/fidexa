import {
  PDFDocument,
  PDFImage,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { DEFAULT_INVOICE_CONFIG, FIDEXA_BRAND, INVOICE_LAYOUT } from "./config";
import { formatUGX } from "./calculator";
import type { CalculatedGroup, CalculatedInvoice, CalculatedQuotation } from "./schema";

type Color = ReturnType<typeof rgb>;

export type RenderedPage = {
  continuation: boolean;
  hasTableHeader: boolean;
  hasTotals: boolean;
  text: string;
};

export type RenderedPdf = {
  pdfBytes: Uint8Array;
  pageCount: number;
  pages: RenderedPage[];
  visibleText: string[];
};

type PageState = RenderedPage & { textParts: string[] };
type CalculatedDocument = CalculatedInvoice | CalculatedQuotation;

function isQuotation(document: CalculatedDocument): document is CalculatedQuotation {
  return "quotationNumber" in document;
}

function documentNumber(document: CalculatedDocument): string {
  return isQuotation(document) ? document.quotationNumber : document.invoiceNumber;
}

function formatInvoiceDate(date: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

const color = (hex: string): Color => {
  const value = hex.replace("#", "");
  return rgb(
    Number.parseInt(value.slice(0, 2), 16) / 255,
    Number.parseInt(value.slice(2, 4), 16) / 255,
    Number.parseInt(value.slice(4, 6), 16) / 255,
  );
};

const NAVY = color(FIDEXA_BRAND.navy);
const PURPLE = color(FIDEXA_BRAND.purple);
const MINT = color(FIDEXA_BRAND.mint);
const SLATE = color(FIDEXA_BRAND.slate);
const BORDER = color(FIDEXA_BRAND.border);
const WHITE = color(FIDEXA_BRAND.paper);

function yFromTop(page: PDFPage, top: number, height = 0): number {
  return page.getHeight() - top - height;
}

function textWidth(font: PDFFont, text: string, size: number): number {
  return font.widthOfTextAtSize(text, size);
}

function drawText(
  page: PDFPage,
  state: PageState,
  text: string,
  x: number,
  top: number,
  font: PDFFont,
  size: number,
  fill: Color,
): void {
  page.drawText(text, { x, y: yFromTop(page, top, size), font, size, color: fill });
  state.textParts.push(text);
}

function drawRightText(
  page: PDFPage,
  state: PageState,
  text: string,
  right: number,
  top: number,
  font: PDFFont,
  size: number,
  fill: Color,
): void {
  drawText(page, state, text, right - textWidth(font, text, size), top, font, size, fill);
}

function drawWrappedText(
  page: PDFPage,
  state: PageState,
  text: string,
  x: number,
  top: number,
  width: number,
  font: PDFFont,
  size: number,
  fill: Color,
  lineHeight = size + 3,
): number {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (line && textWidth(font, candidate, size) > width) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);

  lines.forEach((lineText, index) => {
    drawText(page, state, lineText, x, top + index * lineHeight, font, size, fill);
  });
  return Math.max(1, lines.length) * lineHeight;
}

function drawRule(page: PDFPage, x: number, top: number, width: number, fill = BORDER): void {
  page.drawRectangle({ x, y: yFromTop(page, top, 1), width, height: 1, color: fill });
}

function drawLogo(page: PDFPage, state: PageState, x: number, top: number, fonts: Fonts): void {
  const markScale = 0.5;
  const markPath = "M12 11H37L30.27 19H19V22.43H28.62L22.47 30.42H19V37H12V11Z";
  const purplePath = "M12 11H37L30.27 19H19V15.2H12V11Z";
  const mintPath = "M19 22.43H28.62L22.47 30.42H19V22.43Z";
  const markOriginX = x - 12 * markScale;
  const markOriginY = page.getHeight() - top + 11 * markScale;
  page.drawSvgPath(markPath, { x: markOriginX, y: markOriginY, scale: markScale, color: NAVY });
  page.drawSvgPath(purplePath, { x: markOriginX, y: markOriginY, scale: markScale, color: PURPLE });
  page.drawSvgPath(mintPath, { x: markOriginX, y: markOriginY, scale: markScale, color: MINT });
  drawText(page, state, "fidexa", x + 33, top, fonts.bold, 18, NAVY);
  drawText(page, state, "SOFTWARE STUDIO", x, top + 27, fonts.bold, 7, SLATE);
}

type Fonts = { regular: PDFFont; bold: PDFFont };

function drawFullHeader(
  page: PDFPage,
  state: PageState,
  document: CalculatedDocument,
  internal: boolean,
  fonts: Fonts,
): number {
  page.drawRectangle({ x: 0, y: page.getHeight() - 4, width: page.getWidth(), height: 4, color: MINT });
  drawLogo(page, state, INVOICE_LAYOUT.margin, 48, fonts);

  const right = page.getWidth() - INVOICE_LAYOUT.margin;
  drawRightText(
    page,
    state,
    internal ? (isQuotation(document) ? "Internal Estimate" : "Internal Statement") : isQuotation(document) ? "Quotation" : "Invoice",
    right,
    45,
    fonts.bold,
    internal ? 15 : 24,
    NAVY,
  );
  drawRightText(page, state, documentNumber(document), right, 78, fonts.bold, 10, PURPLE);
  page.drawRectangle({ x: right - 54, y: yFromTop(page, 101, 3), width: 54, height: 3, color: PURPLE });

  drawText(page, state, "From", INVOICE_LAYOUT.margin, 132, fonts.bold, 8, SLATE);
  drawText(page, state, "Fidexa Software Studio", INVOICE_LAYOUT.margin, 148, fonts.bold, 10, NAVY);
  drawText(page, state, DEFAULT_INVOICE_CONFIG.senderEmail, INVOICE_LAYOUT.margin, 165, fonts.regular, 9, SLATE);
  drawText(page, state, DEFAULT_INVOICE_CONFIG.phone, INVOICE_LAYOUT.margin, 181, fonts.regular, 9, SLATE);

  const clientX = INVOICE_LAYOUT.margin + INVOICE_LAYOUT.contentWidth / 2;
  drawText(page, state, "Bill To", clientX, 132, fonts.bold, 8, SLATE);
  drawWrappedText(page, state, document.client.name, clientX, 148, 210, fonts.bold, 10, NAVY);
  if (document.client.email) drawText(page, state, document.client.email, clientX, 165, fonts.regular, 9, SLATE);
  if (document.client.address) drawWrappedText(page, state, document.client.address, clientX, 181, 210, fonts.regular, 8, SLATE);

  drawRule(page, INVOICE_LAYOUT.margin, 218, INVOICE_LAYOUT.contentWidth);
  const columns = isQuotation(document)
    ? [
        ["Issue Date", formatInvoiceDate(document.issueDate)],
        ["Valid Until", document.validUntil ? formatInvoiceDate(document.validUntil) : "—"],
        ["Terms", document.terms],
      ]
    : [
        ["Issue Date", formatInvoiceDate(document.issueDate)],
        ["Due Date", document.dueDate ? formatInvoiceDate(document.dueDate) : "—"],
        ["Terms", document.terms],
      ];
  const columnWidth = INVOICE_LAYOUT.contentWidth / columns.length;
  columns.forEach(([label, value], index) => {
    const x = INVOICE_LAYOUT.margin + index * columnWidth;
    drawText(page, state, label, x, 239, fonts.bold, 7, SLATE);
    drawText(page, state, value, x, 258, fonts.bold, 10, NAVY);
  });
  return 304;
}

function drawContinuationHeader(
  page: PDFPage,
  state: PageState,
  document: CalculatedDocument,
  internal: boolean,
  fonts: Fonts,
): number {
  page.drawRectangle({ x: 0, y: page.getHeight() - 4, width: page.getWidth(), height: 4, color: MINT });
  drawLogo(page, state, INVOICE_LAYOUT.margin, 38, fonts);
  const right = page.getWidth() - INVOICE_LAYOUT.margin;
  drawRightText(page, state, internal ? (isQuotation(document) ? "Internal Estimate" : "Internal Statement") : isQuotation(document) ? "Quotation" : "Invoice", right, 36, fonts.bold, internal ? 10 : 16, NAVY);
  drawRightText(page, state, documentNumber(document), right, 59, fonts.bold, 8, PURPLE);
  drawText(page, state, "Line Items Continued", INVOICE_LAYOUT.margin, 110, fonts.bold, 8, SLATE);
  drawText(page, state, "Additional Service Groups", right - 144, 110, fonts.regular, 8, SLATE);
  return 138;
}

function drawTableHeader(
  page: PDFPage,
  state: PageState,
  internal: boolean,
  top: number,
  fonts: Fonts,
): number {
  const left = INVOICE_LAYOUT.margin + 12;
  const right = page.getWidth() - INVOICE_LAYOUT.margin - 12;
  const width = right - left;
  page.drawRectangle({
    x: left,
    y: yFromTop(page, top, INVOICE_LAYOUT.tableHeaderHeight),
    width,
    height: INVOICE_LAYOUT.tableHeaderHeight,
    color: NAVY,
  });
  if (internal) {
    drawText(page, state, "Description", left + 12, top + 9, fonts.bold, 8, WHITE);
    drawRightText(page, state, "Hours", right - 188, top + 9, fonts.bold, 8, WHITE);
    drawRightText(page, state, "Rate", right - 92, top + 9, fonts.bold, 8, WHITE);
  } else {
    drawText(page, state, "Description", left + 12, top + 9, fonts.bold, 8, WHITE);
  }
  drawRightText(page, state, "Amount", right - 10, top + 9, fonts.bold, 8, WHITE);
  return top + INVOICE_LAYOUT.tableHeaderHeight + 10;
}

function groupHeight(group: CalculatedGroup): number {
  return 24 + (group.tasks?.length ?? 0) * INVOICE_LAYOUT.taskHeight + INVOICE_LAYOUT.groupGap;
}

function drawGroup(
  page: PDFPage,
  state: PageState,
  group: CalculatedGroup,
  groupNumber: number,
  top: number,
  internal: boolean,
  fonts: Fonts,
): number {
  const left = INVOICE_LAYOUT.margin + 12;
  const descriptionLeft = left + 20;
  const right = page.getWidth() - INVOICE_LAYOUT.margin - 22;
  const amountRight = right;
  drawText(page, state, `${groupNumber}.`, left, top, fonts.bold, 9, NAVY);
  drawText(page, state, group.description, descriptionLeft, top, fonts.bold, 9, NAVY);
  drawRightText(page, state, formatUGX(group.subtotal), amountRight, top, fonts.bold, 9, NAVY);

  let cursor = top + 20;
  for (const task of group.tasks ?? []) {
    drawText(page, state, task.description, descriptionLeft + 16, cursor, fonts.regular, 8, SLATE);
    if (internal) {
      drawRightText(page, state, `${task.hours} hours`, right - 172, cursor, fonts.regular, 7.5, SLATE);
      drawRightText(page, state, formatUGX(task.effectiveHourlyRate), right - 78, cursor, fonts.regular, 7.5, SLATE);
    }
    drawRightText(page, state, formatUGX(task.amount), amountRight, cursor, fonts.regular, 8, internal ? NAVY : SLATE);
    cursor += INVOICE_LAYOUT.taskHeight;
  }
  return top + groupHeight(group);
}

function drawFinalSection(
  page: PDFPage,
  state: PageState,
  document: CalculatedDocument,
  cursor: number,
  fonts: Fonts,
  signature: PDFImage | undefined,
): void {
  const top = Math.max(585, cursor + 18);
  const left = INVOICE_LAYOUT.margin;
  const right = page.getWidth() - INVOICE_LAYOUT.margin;
  const bandWidth = 208;
  const bandLeft = right - bandWidth;

  drawText(page, state, "Thank you for building with Fidexa.", left, top + 20, fonts.bold, 11, NAVY);

  if (signature) {
    page.drawImage(signature, {
      x: left,
      y: yFromTop(page, top + 42, 60),
      width: 110,
      height: 60,
    });
    drawText(page, state, "Authorized Signature", left, top + 106, fonts.regular, 7, SLATE);
  }

  page.drawRectangle({ x: bandLeft, y: yFromTop(page, top - 4, 80), width: bandWidth, height: 80, color: NAVY });
  page.drawRectangle({ x: bandLeft + 16, y: yFromTop(page, top + 10, 3), width: 36, height: 3, color: PURPLE });
  drawText(page, state, "Subtotal", bandLeft + 16, top + 28, fonts.regular, 9, color("#D0D5DD"));
  drawRightText(page, state, `${formatUGX(document.subtotal)} UGX`, right - 16, top + 28, fonts.regular, 9, color("#D0D5DD"));
  drawText(page, state, isQuotation(document) ? "Total" : "Total Due", bandLeft + 16, top + 52, fonts.bold, 8, WHITE);
  drawRightText(page, state, `${formatUGX(document.total)} UGX`, right - 16, top + 47, fonts.bold, 14, WHITE);

  const dividerTop = 742;
  drawRule(page, left, dividerTop, INVOICE_LAYOUT.contentWidth);
  drawRightText(page, state, "fidexa.org", right, 761, fonts.bold, 9, NAVY);
  drawRightText(page, state, DEFAULT_INVOICE_CONFIG.senderEmail, right, 781, fonts.regular, 8, SLATE);
  drawRightText(page, state, DEFAULT_INVOICE_CONFIG.phone, right, 797, fonts.regular, 8, SLATE);
  drawRightText(page, state, "Software Studio for Products & Partnerships.", right, 813, fonts.regular, 7, SLATE);
}

function drawContinuationFooter(page: PDFPage, state: PageState, fonts: Fonts): void {
  drawRule(page, INVOICE_LAYOUT.margin, 742, INVOICE_LAYOUT.contentWidth);
  drawText(page, state, "Line Items Continued", INVOICE_LAYOUT.margin, 761, fonts.bold, 7, SLATE);
  drawRightText(page, state, "Continued on next page", page.getWidth() - INVOICE_LAYOUT.margin, 761, fonts.regular, 8, SLATE);
}

function paginate(document: CalculatedDocument): CalculatedGroup[][] {
  const groups = document.groups;
  const totalHeight = groups.reduce((sum, group) => sum + groupHeight(group), 0);
  if (totalHeight <= 220) return [groups];

  const pages: CalculatedGroup[][] = [];
  let remaining = [...groups];
  const take = (capacity: number) => {
    const page: CalculatedGroup[] = [];
    let used = 0;
    while (remaining.length && (page.length === 0 || used + groupHeight(remaining[0]) <= capacity)) {
      const next = remaining.shift()!;
      page.push(next);
      used += groupHeight(next);
    }
    pages.push(page);
  };

  take(350);
  while (remaining.length) {
    const remainingHeight = remaining.reduce((sum, group) => sum + groupHeight(group), 0);
    take(remainingHeight <= 420 ? 420 : 520);
  }
  return pages;
}

async function render(documentData: CalculatedDocument, internal: boolean): Promise<RenderedPdf> {
  const document = await PDFDocument.create();
  const fonts: Fonts = {
    regular: await document.embedFont(StandardFonts.Helvetica),
    bold: await document.embedFont(StandardFonts.HelveticaBold),
  };
  const signature = internal
    ? undefined
    : await document.embedPng(await readFile(join(process.cwd(), DEFAULT_INVOICE_CONFIG.signaturePath)));
  const groupedPages = paginate(documentData);
  const pageStates: PageState[] = [];
  let nextGroupNumber = 1;

  groupedPages.forEach((groups, index) => {
    const page = document.addPage([INVOICE_LAYOUT.pageWidth, INVOICE_LAYOUT.pageHeight]);
    const isFirst = index === 0;
    const isLast = index === groupedPages.length - 1;
    const state: PageState = {
      continuation: !isFirst,
      hasTableHeader: true,
      hasTotals: isLast,
      textParts: [],
      text: "",
    };
    pageStates.push(state);

    const tableTop = isFirst
      ? drawFullHeader(page, state, documentData, internal, fonts)
      : drawContinuationHeader(page, state, documentData, internal, fonts);
    let cursor = drawTableHeader(page, state, internal, tableTop, fonts);
    groups.forEach((group) => {
      cursor = drawGroup(page, state, group, nextGroupNumber, cursor, internal, fonts);
      nextGroupNumber += 1;
    });

    if (isLast) drawFinalSection(page, state, documentData, cursor, fonts, signature);
    else drawContinuationFooter(page, state, fonts);
    state.text = state.textParts.join(" ");
  });

  const pdfBytes = await document.save();
  return {
    pdfBytes,
    pageCount: pageStates.length,
    pages: pageStates.map(({ textParts: _textParts, ...page }) => page),
    visibleText: pageStates.flatMap((page) => page.textParts),
  };
}

export function renderInvoice(invoice: CalculatedInvoice): Promise<RenderedPdf> {
  return render(invoice, false);
}

export function renderInternalStatement(invoice: CalculatedInvoice): Promise<RenderedPdf> {
  return render(invoice, true);
}

export function renderQuotation(quotation: CalculatedQuotation): Promise<RenderedPdf> {
  return render(quotation, false);
}

export function renderInternalQuotationStatement(quotation: CalculatedQuotation): Promise<RenderedPdf> {
  return render(quotation, true);
}
