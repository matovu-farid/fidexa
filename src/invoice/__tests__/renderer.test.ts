import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { calculateInvoice } from "../calculator";
import { renderInternalStatement, renderInvoice } from "../renderer";
import type { InvoiceRequest } from "../schema";

const invoice: InvoiceRequest = {
  invoiceNumber: "FDX-2026-001",
  issueDate: "2026-09-01",
  dueDate: "2026-09-15",
  terms: "Net 14",
  status: "AWAITING PAYMENT",
  client: { name: "BMS Client", email: "client@example.com" },
  currency: "UGX",
  hourlyRate: 125_000,
  groups: [
    {
      description: "BMS server maintenance",
      tasks: [
        { description: "Operating system maintenance", hours: 3 },
        { description: "Preventative checks", hours: 1.5 },
      ],
    },
    { description: "Software optimisation", hours: 2 },
  ],
};

describe("invoice PDF renderer", () => {
  it("renders a branded one-page client invoice without private pricing data", async () => {
    const result = await renderInvoice(calculateInvoice(invoice));
    const document = await PDFDocument.load(result.pdfBytes);
    const text = result.visibleText.join(" ");

    expect(document.getPageCount()).toBe(1);
    expect(result.pages).toHaveLength(1);
    expect(result.pages[0]).toMatchObject({ hasTableHeader: true, hasTotals: true, continuation: false });
    expect(text).toContain("1.");
    expect(text).toContain("Description");
    expect(text).toContain("Amount");
    expect(text).toContain("Total Due");
    expect(text.match(/\+256 705 222 144/g)).toHaveLength(2);
    expect(text).toContain("Authorized Signature");
    expect(text).not.toContain("Tax / VAT");
    expect(text).not.toContain("Awaiting Payment");
    expect(text).not.toContain("Payment Details");
    expect(text).not.toContain("Please replace client, project, tax, and payment details before sending.");
    expect(text).not.toContain("Page 2 of 2");
    expect(text).not.toContain("hours");
    expect(text).not.toContain("125,000");
  });

  it("paginates long invoices, repeats the table header, and reserves totals for the final page", async () => {
    const longInvoice = calculateInvoice({
      ...invoice,
      groups: Array.from({ length: 18 }, (_, index) => ({
        description: `Service group ${index + 1}`,
        tasks: [
          { description: "Planning", hours: 1 },
          { description: "Implementation", hours: 2 },
        ],
      })),
    });

    const result = await renderInvoice(longInvoice);

    expect(result.pageCount).toBeGreaterThan(1);
    expect(result.pages.slice(0, -1).every((page) => page.hasTableHeader)).toBe(true);
    expect(result.pages.slice(0, -1).every((page) => !page.hasTotals)).toBe(true);
    expect(result.pages.at(-1)).toMatchObject({ hasTableHeader: true, hasTotals: true });
    expect(result.pages.slice(1).every((page) => page.continuation)).toBe(true);
    expect(result.visibleText.join(" ")).toContain("18.");
  });

  it("keeps hours and effective rates in the internal statement", async () => {
    const result = await renderInternalStatement(calculateInvoice(invoice));

    expect(result.pages[0]).toMatchObject({ hasTableHeader: true, hasTotals: true });
    expect(result.visibleText.join(" ")).toContain("hours");
    expect(result.visibleText.join(" ")).toContain("125,000");
  });
});
