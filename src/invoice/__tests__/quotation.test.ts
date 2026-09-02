import { PDFDocument } from "pdf-lib";
import { describe, expect, it } from "vitest";

import { calculateQuotation } from "../calculator";
import { renderQuotation } from "../renderer";
import type { QuotationRequest } from "../schema";

const quotation: QuotationRequest = {
  quotationNumber: "FDX-Q-2026-001",
  issueDate: "2026-09-02",
  validUntil: "2026-10-02",
  client: { name: "CJ Engineering" },
  currency: "UGX",
  hourlyRate: 150_000,
  groups: [{ description: "Alerton Compass optimisation", hours: 4 }],
};

describe("quotation PDF renderer", () => {
  it("renders a client quotation with the invoice design language and no invoice-only status", async () => {
    const result = await renderQuotation(calculateQuotation(quotation));
    const document = await PDFDocument.load(result.pdfBytes);
    const text = result.visibleText.join(" ");

    expect(document.getPageCount()).toBe(1);
    expect(text).toContain("Quotation");
    expect(text).toContain("Valid Until");
    expect(text).toContain("Description");
    expect(text).toContain("Amount");
    expect(text).toContain("1.");
    expect(text.match(/\+256 705 222 144/g)).toHaveLength(2);
    expect(text).toContain("Authorized Signature");
    expect(text).not.toContain("Awaiting Payment");
    expect(text).not.toContain("Tax / VAT");
    expect(text).not.toContain("hours");
  });
});
