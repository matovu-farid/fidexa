import { z } from "zod";

const descriptionSchema = z.string().trim().min(1, "Description is required");
const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format")
  .refine((value) => !Number.isNaN(Date.parse(`${value}T00:00:00Z`)), "Date is invalid");
const hoursSchema = z
  .number()
  .finite()
  .nonnegative("Hours cannot be negative")
  .refine((value) => Number.isInteger(value * 4), "Hours must use quarter-hour precision");
const rateSchema = z.number().int("Hourly rate must be an integer").positive("Hourly rate must be positive");

export const invoiceTaskSchema = z.object({
  description: descriptionSchema,
  hours: hoursSchema,
  hourlyRate: rateSchema.optional(),
});

export const invoiceGroupSchema = z
  .object({
    description: descriptionSchema,
    tasks: z.array(invoiceTaskSchema).min(1, "A group must contain at least one task").optional(),
    hours: hoursSchema.optional(),
    hourlyRate: rateSchema.optional(),
  })
  .superRefine((group, ctx) => {
    if ((group.tasks && group.hours !== undefined) || (!group.tasks && group.hours === undefined)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["tasks"],
        message: "Provide either direct hours or nested tasks, but not both",
      });
    }
  });

const invoiceRequestValidationShape = {
  invoiceNumber: z.string().trim().min(1, "Invoice number is required"),
  issueDate: isoDateSchema,
  dueDate: isoDateSchema.optional(),
  terms: z.string().trim().min(1).default("Net 30"),
  status: z.enum(["DRAFT", "AWAITING PAYMENT", "PAID", "VOID"]).default("AWAITING PAYMENT"),
  client: z.object({
    name: descriptionSchema,
    email: z.string().email().optional(),
    address: z.string().trim().min(1).optional(),
  }),
  currency: z.literal("UGX").default("UGX"),
  hourlyRate: rateSchema,
  taxRate: z.number().finite().min(0).max(100).default(0),
  groups: z.array(invoiceGroupSchema).min(1, "At least one line-item group is required"),
};

export const invoiceRequestSchema = z
  .object(invoiceRequestValidationShape)
  .superRefine((request, ctx) => {
    if (request.dueDate && request.dueDate < request.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dueDate"],
        message: "Due date cannot be earlier than issue date",
      });
    }
  });

const quotationRequestValidationShape = {
  quotationNumber: z.string().trim().min(1, "Quotation number is required"),
  issueDate: isoDateSchema,
  validUntil: isoDateSchema.optional(),
  terms: z.string().trim().min(1).default("Net 30"),
  client: z.object({
    name: descriptionSchema,
    email: z.string().email().optional(),
    address: z.string().trim().min(1).optional(),
  }),
  currency: z.literal("UGX").default("UGX"),
  hourlyRate: rateSchema,
  taxRate: z.number().finite().min(0).max(100).default(0),
  groups: z.array(invoiceGroupSchema).min(1, "At least one line-item group is required"),
};

export const quotationRequestSchema = z
  .object(quotationRequestValidationShape)
  .superRefine((request, ctx) => {
    if (request.validUntil && request.validUntil < request.issueDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["validUntil"],
        message: "Valid-until date cannot be earlier than issue date",
      });
    }
  });

const mcpGroupSchema = z.object({
  description: z.string(),
  tasks: z.array(invoiceTaskSchema).optional(),
  hours: z.number().optional(),
  hourlyRate: z.number().optional(),
});

const mcpClientSchema = z.object({
  name: z.string(),
  email: z.string().optional(),
  address: z.string().optional(),
});

export const invoiceRequestShape = {
  invoiceNumber: z.string(),
  issueDate: z.string(),
  dueDate: z.string().optional(),
  terms: z.string().optional(),
  status: z.enum(["DRAFT", "AWAITING PAYMENT", "PAID", "VOID"]).optional(),
  client: mcpClientSchema,
  currency: z.literal("UGX").optional(),
  hourlyRate: z.number(),
  taxRate: z.number().optional(),
  groups: z.array(mcpGroupSchema),
};

export const quotationRequestShape = {
  quotationNumber: z.string(),
  issueDate: z.string(),
  validUntil: z.string().optional(),
  terms: z.string().optional(),
  client: mcpClientSchema,
  currency: z.literal("UGX").optional(),
  hourlyRate: z.number(),
  taxRate: z.number().optional(),
  groups: z.array(mcpGroupSchema),
};

export type InvoiceRequest = z.input<typeof invoiceRequestSchema>;
export type QuotationRequest = z.input<typeof quotationRequestSchema>;
export type InvoiceTask = z.infer<typeof invoiceTaskSchema>;
export type InvoiceGroup = z.infer<typeof invoiceGroupSchema>;
export type NormalizedInvoiceRequest = z.output<typeof invoiceRequestSchema>;
export type NormalizedQuotationRequest = z.output<typeof quotationRequestSchema>;

export type CalculatedTask = InvoiceTask & {
  effectiveHourlyRate: number;
  amount: number;
};

export type CalculatedGroup = Omit<InvoiceGroup, "tasks" | "hourlyRate"> & {
  effectiveHourlyRate: number;
  tasks?: CalculatedTask[];
  subtotal: number;
};

export type CalculatedInvoice = Omit<NormalizedInvoiceRequest, "groups"> & {
  groups: CalculatedGroup[];
  subtotal: number;
  tax: number;
  total: number;
};

export type CalculatedQuotation = Omit<NormalizedQuotationRequest, "groups"> & {
  groups: CalculatedGroup[];
  subtotal: number;
  tax: number;
  total: number;
};

export type ClientInvoiceSummary = {
  invoiceNumber: string;
  clientName: string;
  currency: "UGX";
  subtotal: number;
  tax: number;
  total: number;
  groupCount: number;
};

export type ClientQuotationSummary = Omit<ClientInvoiceSummary, "invoiceNumber"> & {
  quotationNumber: string;
};
