import {
  invoiceRequestSchema,
  quotationRequestSchema,
  type CalculatedGroup,
  type CalculatedInvoice,
  type CalculatedQuotation,
  type ClientInvoiceSummary,
  type ClientQuotationSummary,
  type InvoiceRequest,
  type NormalizedInvoiceRequest,
  type NormalizedQuotationRequest,
  type QuotationRequest,
} from "./schema";

const roundUGX = (value: number) => Math.round(value);

export function calculateInvoice(input: InvoiceRequest): CalculatedInvoice {
  const request = invoiceRequestSchema.parse(input);

  return calculateParsedRequest(request);
}

function calculateParsedRequest(request: NormalizedInvoiceRequest): CalculatedInvoice {
  const groups = calculateGroups(request);
  const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
  const tax = roundUGX((subtotal * request.taxRate) / 100);

  return {
    ...request,
    groups,
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

export function calculateQuotation(input: QuotationRequest): CalculatedQuotation {
  const request = quotationRequestSchema.parse(input);
  const groups = calculateGroups(request);
  const subtotal = groups.reduce((sum, group) => sum + group.subtotal, 0);
  const tax = roundUGX((subtotal * request.taxRate) / 100);

  return {
    ...request,
    groups,
    subtotal,
    tax,
    total: subtotal + tax,
  };
}

function calculateGroups(request: {
  hourlyRate: number;
  groups: NormalizedInvoiceRequest["groups"] | NormalizedQuotationRequest["groups"];
}): CalculatedGroup[] {
  return request.groups.map((group) => {
    const groupRate = group.hourlyRate ?? request.hourlyRate;

    if (group.tasks) {
      const tasks = group.tasks.map((task) => {
        const effectiveHourlyRate = task.hourlyRate ?? groupRate;
        return {
          ...task,
          effectiveHourlyRate,
          amount: roundUGX(task.hours * effectiveHourlyRate),
        };
      });

      return {
        description: group.description,
        effectiveHourlyRate: groupRate,
        tasks,
        subtotal: tasks.reduce((sum, task) => sum + task.amount, 0),
      };
    }

    const amount = roundUGX((group.hours ?? 0) * groupRate);
    return {
      description: group.description,
      hours: group.hours,
      effectiveHourlyRate: groupRate,
      subtotal: amount,
    };
  });
}

export function toClientInvoiceSummary(invoice: CalculatedInvoice): ClientInvoiceSummary {
  return {
    invoiceNumber: invoice.invoiceNumber,
    clientName: invoice.client.name,
    currency: invoice.currency,
    subtotal: invoice.subtotal,
    tax: invoice.tax,
    total: invoice.total,
    groupCount: invoice.groups.length,
  };
}

export function toClientQuotationSummary(quotation: CalculatedQuotation): ClientQuotationSummary {
  return {
    quotationNumber: quotation.quotationNumber,
    clientName: quotation.client.name,
    currency: quotation.currency,
    subtotal: quotation.subtotal,
    tax: quotation.tax,
    total: quotation.total,
    groupCount: quotation.groups.length,
  };
}

export function formatUGX(amount: number): string {
  return new Intl.NumberFormat("en-UG", { maximumFractionDigits: 0 }).format(amount);
}
