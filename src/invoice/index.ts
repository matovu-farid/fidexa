import { mkdir, rename, rm, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { isAbsolute, join, resolve } from "node:path";

import { DEFAULT_INVOICE_CONFIG } from "./config";
import { calculateInvoice, calculateQuotation, toClientInvoiceSummary, toClientQuotationSummary } from "./calculator";
import { renderInternalQuotationStatement, renderInternalStatement, renderInvoice, renderQuotation } from "./renderer";
import type { ClientInvoiceSummary, ClientQuotationSummary, InvoiceRequest, QuotationRequest } from "./schema";

export type InvoiceBundleOptions = {
  outputDirectory?: string;
};

export type InvoiceBundleResult = {
  clientPdfPath: string;
  internalStatementPath: string;
  calculationPath: string;
  clientPageCount: number;
  internalPageCount: number;
  clientSummary: ClientInvoiceSummary;
};

export type QuotationBundleResult = {
  clientQuotationPath: string;
  internalStatementPath: string;
  calculationPath: string;
  clientPageCount: number;
  internalPageCount: number;
  quotationSummary: ClientQuotationSummary;
};

function assertSafeInvoiceNumber(invoiceNumber: string): void {
  if (!/^[A-Za-z0-9._-]+$/.test(invoiceNumber)) {
    throw new Error("invoiceNumber may contain only letters, numbers, periods, underscores, and hyphens");
  }
}

async function writeAtomically(path: string, contents: Uint8Array | string): Promise<void> {
  const temporaryPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporaryPath, contents);
    await rename(temporaryPath, path);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

export async function createInvoiceBundle(
  input: InvoiceRequest,
  options: InvoiceBundleOptions = {},
): Promise<InvoiceBundleResult> {
  const invoice = calculateInvoice(input);
  assertSafeInvoiceNumber(invoice.invoiceNumber);

  const configuredDirectory = options.outputDirectory ?? DEFAULT_INVOICE_CONFIG.outputDirectory;
  const outputDirectory = isAbsolute(configuredDirectory) ? configuredDirectory : resolve(configuredDirectory);
  const invoiceDirectory = join(outputDirectory, invoice.invoiceNumber);
  await mkdir(outputDirectory, { recursive: true });

  try {
    await mkdir(invoiceDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error(`Invoice output directory already exists: ${invoiceDirectory}`);
    }
    throw error;
  }

  try {
    const [client, internal] = await Promise.all([
      renderInvoice(invoice),
      renderInternalStatement(invoice),
    ]);
    const clientPdfPath = join(invoiceDirectory, "client-invoice.pdf");
    const internalStatementPath = join(invoiceDirectory, "internal-statement.pdf");
    const calculationPath = join(invoiceDirectory, "calculation.json");
    await writeAtomically(clientPdfPath, client.pdfBytes);
    await writeAtomically(internalStatementPath, internal.pdfBytes);
    await writeAtomically(calculationPath, JSON.stringify(invoice, null, 2));

    return {
      clientPdfPath,
      internalStatementPath,
      calculationPath,
      clientPageCount: client.pageCount,
      internalPageCount: internal.pageCount,
      clientSummary: toClientInvoiceSummary(invoice),
    };
  } catch (error) {
    await rm(invoiceDirectory, { recursive: true, force: true });
    throw error;
  }
}

export async function createQuotationBundle(
  input: QuotationRequest,
  options: InvoiceBundleOptions = {},
): Promise<QuotationBundleResult> {
  const quotation = calculateQuotation(input);
  assertSafeInvoiceNumber(quotation.quotationNumber);

  const configuredDirectory = options.outputDirectory ?? DEFAULT_INVOICE_CONFIG.outputDirectory;
  const outputDirectory = isAbsolute(configuredDirectory) ? configuredDirectory : resolve(configuredDirectory);
  const quotationDirectory = join(outputDirectory, quotation.quotationNumber);
  await mkdir(outputDirectory, { recursive: true });

  try {
    await mkdir(quotationDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error(`Quotation output directory already exists: ${quotationDirectory}`);
    }
    throw error;
  }

  try {
    const [client, internal] = await Promise.all([
      renderQuotation(quotation),
      renderInternalQuotationStatement(quotation),
    ]);
    const clientQuotationPath = join(quotationDirectory, "client-quotation.pdf");
    const internalStatementPath = join(quotationDirectory, "internal-statement.pdf");
    const calculationPath = join(quotationDirectory, "calculation.json");
    await writeAtomically(clientQuotationPath, client.pdfBytes);
    await writeAtomically(internalStatementPath, internal.pdfBytes);
    await writeAtomically(calculationPath, JSON.stringify(quotation, null, 2));

    return {
      clientQuotationPath,
      internalStatementPath,
      calculationPath,
      clientPageCount: client.pageCount,
      internalPageCount: internal.pageCount,
      quotationSummary: toClientQuotationSummary(quotation),
    };
  } catch (error) {
    await rm(quotationDirectory, { recursive: true, force: true });
    throw error;
  }
}
