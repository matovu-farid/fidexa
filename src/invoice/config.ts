export const FIDEXA_BRAND = {
  navy: "#101828",
  purple: "#7C5CFC",
  mint: "#37D6C0",
  slate: "#667085",
  border: "#D0D5DD",
  paper: "#FFFFFF",
} as const;

export const INVOICE_LAYOUT = {
  pageWidth: 595.28,
  pageHeight: 841.89,
  margin: 48,
  contentWidth: 499.28,
  tableHeaderHeight: 28,
  groupTitleHeight: 22,
  taskHeight: 18,
  groupGap: 10,
  continuationHeaderHeight: 62,
  finalPageReserve: 184,
} as const;

export const DEFAULT_INVOICE_CONFIG = {
  currency: "UGX" as const,
  terms: "Net 30",
  status: "AWAITING PAYMENT" as const,
  hourlyRate: 125_000,
  outputDirectory: "generated/invoices",
  senderName: "Fidexa Software Studio",
  senderEmail: "sales@fidexa.org",
  phone: "+256 705 222 144",
  signaturePath: "public/fidexa-signature.png",
  website: "fidexa.org",
} as const;
