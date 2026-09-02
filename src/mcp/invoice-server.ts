import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

import { calculateInvoice, calculateQuotation } from "../invoice/calculator";
import { createInvoiceBundle, createQuotationBundle, type InvoiceBundleOptions } from "../invoice";
import { invoiceRequestSchema, quotationRequestSchema, type InvoiceRequest, type QuotationRequest } from "../invoice/schema";

export function createInvoiceMcpServer(options: InvoiceBundleOptions = {}): McpServer {
  const server = new McpServer({
    name: "fidexa-invoice-server",
    version: "0.1.0",
  });

  server.registerTool(
    "calculate_invoice",
    {
      title: "Calculate Fidexa invoice",
      description:
        "Validate a Fidexa invoice request and calculate UGX task amounts, group subtotals, tax, and total. The calling AI supplies private hour estimates; the server performs all arithmetic.",
      inputSchema: invoiceRequestSchema,
    },
    async (request) => {
      const calculation = calculateInvoice(request as InvoiceRequest);
      return {
        content: [{ type: "text", text: JSON.stringify(calculation, null, 2) }],
      };
    },
  );

  server.registerTool(
    "calculate_quotation",
    {
      title: "Calculate Fidexa quotation",
      description:
        "Validate a Fidexa quotation request and calculate UGX task amounts, group subtotals, tax, and total. The calling AI supplies private hour estimates; the server performs all arithmetic.",
      inputSchema: quotationRequestSchema,
    },
    async (request) => {
      const calculation = calculateQuotation(request as QuotationRequest);
      return {
        content: [{ type: "text", text: JSON.stringify(calculation, null, 2) }],
      };
    },
  );

  server.registerTool(
    "create_quotation",
    {
      title: "Create Fidexa quotation bundle",
      description:
        "Calculate and write a branded Fidexa client quotation PDF, an internal estimate PDF with hours and rates, and a calculation JSON audit. Client output never exposes private hours or rates; long quotations paginate across A4 pages automatically.",
      inputSchema: quotationRequestSchema,
    },
    async (request) => {
      const result = await createQuotationBundle(request as QuotationRequest, options);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  server.registerTool(
    "create_invoice",
    {
      title: "Create Fidexa invoice bundle",
      description:
        "Calculate and write a branded Fidexa client invoice PDF, an internal statement PDF with hours and rates, and a calculation JSON audit. Client output never exposes private hours or rates; long invoices paginate across A4 pages automatically.",
      inputSchema: invoiceRequestSchema,
    },
    async (request) => {
      const result = await createInvoiceBundle(request as InvoiceRequest, options);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  return server;
}
