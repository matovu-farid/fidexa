import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { calculateInvoice, calculateQuotation } from "../invoice/calculator";
import { createInvoiceBundle, createQuotationBundle, type InvoiceBundleOptions } from "../invoice";
import {
  invoiceRequestSchema,
  invoiceRequestShape,
  quotationRequestSchema,
  quotationRequestShape,
} from "../invoice/schema";

function validationError(error: z.ZodError) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ") }],
  };
}

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
      inputSchema: invoiceRequestShape,
    },
    async (request: unknown) => {
      const parsed = invoiceRequestSchema.safeParse(request);
      if (!parsed.success) return validationError(parsed.error);
      const calculation = calculateInvoice(parsed.data);
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
      inputSchema: quotationRequestShape,
    },
    async (request: unknown) => {
      const parsed = quotationRequestSchema.safeParse(request);
      if (!parsed.success) return validationError(parsed.error);
      const calculation = calculateQuotation(parsed.data);
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
      inputSchema: quotationRequestShape,
    },
    async (request: unknown) => {
      const parsed = quotationRequestSchema.safeParse(request);
      if (!parsed.success) return validationError(parsed.error);
      const result = await createQuotationBundle(parsed.data, options);
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
      inputSchema: invoiceRequestShape,
    },
    async (request: unknown) => {
      const parsed = invoiceRequestSchema.safeParse(request);
      if (!parsed.success) return validationError(parsed.error);
      const result = await createInvoiceBundle(parsed.data, options);
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
      };
    },
  );

  return server;
}
