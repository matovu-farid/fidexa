# Fidexa Invoice MCP Server Design

## Goal

Build a standalone MCP server in the Fidexa repository that accepts structured work scopes with private hour estimates, calculates UGX invoice values deterministically, and produces branded client and internal-statement PDFs using the approved Fidexa invoice design.

## Scope

The first version will:

- expose invoice-generation and calculation tools over MCP;
- accept client metadata, invoice metadata, nested line-item groups, estimated hours, and a configurable UGX hourly rate;
- calculate task amounts, group subtotals, tax, and the final total on the server;
- render a client-facing PDF that shows descriptions and UGX amounts but never hours or hourly rates;
- render an internal PDF that includes hours, rates, calculations, subtotals, and totals;
- automatically paginate long invoices across separate A4 pages;
- repeat the Fidexa invoice identity and table header on continuation pages;
- keep totals and payment details on the final page;
- write a calculation JSON audit file beside the PDFs;
- omit company-location fields from the input and output model.

The example BMS scope is a fixture and example input only. Its supplied prices are ignored. The first description is normalized to “Preventative maintenance of BMS server operating system”; the malformed `700,0000` value is not used.

## Non-goals

- Editing Penpot at invoice-generation time.
- Allowing an AI model to position PDF elements or perform arithmetic.
- Building a full invoice-management dashboard.
- Sending invoices by email.
- Storing customer records in a database.
- Inferring confidential internal hours from client-visible text without an explicit estimate in the MCP request.

## Approaches considered

### Standalone deterministic MCP server — selected

The MCP server owns validation, arithmetic, document layout, and file output. The calling AI supplies private estimates, while the server produces the authoritative calculation and both PDFs. This gives the best repeatability and keeps the approved design reusable from any MCP-compatible AI client.

### AI-driven Penpot editing/export

An AI could edit the Penpot invoice and export it for every request, but this makes arithmetic, pagination, and layout dependent on model actions. It is unsuitable for reliable financial documents.

### Web invoice editor behind MCP

A browser editor could provide manual overrides and previews, but it adds an application surface, persistence, and authentication before the core invoice workflow is proven. It can be added later without changing the calculation contract.

## Architecture

The implementation has four focused units:

1. `src/invoice/schema.ts` defines the validated input and output types.
2. `src/invoice/calculator.ts` performs pure monetary and subtotal calculations.
3. `src/invoice/renderer.ts` renders the client and internal A4 PDF documents, including pagination.
4. `src/mcp/invoice-server.ts` exposes the calculator and renderer through MCP tools and returns output paths plus calculation summaries.

Configuration lives in `src/invoice/config.ts` and contains the Fidexa brand tokens, default currency, default payment terms, output directory, and default hourly rate. Generated files live under `generated/invoices/<invoice-number>/` and are not imported by the website routes.

## MCP contract

The server will expose two tools.

### `calculate_invoice`

This validates an invoice request and returns the normalized item breakdown without writing files. It is useful for an AI to preview totals before producing documents.

Input shape:

```ts
type InvoiceRequest = {
  invoiceNumber: string;
  issueDate: string; // ISO date
  dueDate?: string; // ISO date
  terms?: string;
  status?: "DRAFT" | "AWAITING PAYMENT" | "PAID" | "VOID";
  client: {
    name: string;
    email?: string;
    address?: string;
  };
  currency?: "UGX";
  hourlyRate: number;
  taxRate?: number;
  groups: InvoiceGroup[];
};

type InvoiceGroup = {
  description: string;
  tasks?: InvoiceTask[];
  hours?: number;
  hourlyRate?: number;
};

type InvoiceTask = {
  description: string;
  hours: number;
  hourlyRate?: number;
};
```

Each group must provide either direct `hours` or one or more nested `tasks`, but not both. A group rate overrides the invoice rate for the group; a task rate overrides both. All rates are integer UGX values, and hours support quarter-hour precision.

The response includes normalized descriptions, hours, effective rates, task amounts, group subtotals, tax, and total. The amount formula is:

```text
task amount = round(hours × effective hourly rate)
group subtotal = sum(task amounts) or round(group hours × group rate)
subtotal = sum(group subtotals)
tax = round(subtotal × taxRate / 100)
total = subtotal + tax
```

### `create_invoice`

This accepts the same request, runs the calculation, writes `client-invoice.pdf`, `internal-statement.pdf`, and `calculation.json`, and returns absolute file paths, page counts, normalized totals, and a redacted client summary.

The MCP response must not include private hours or rates in the client summary. The internal calculation data remains in the internal PDF and JSON audit file.

## PDF design and pagination

The renderer will reproduce the approved Fidexa invoice direction:

- actual Fidexa logo lockup;
- navy primary color, mint status/accent color, purple invoice accent, and slate supporting text;
- generous A4 margins and consistent internal left/right padding;
- invoice title, invoice number, sender, client, dates, terms, and status;
- a two-column line-item table with an intentionally blank left header and `AMOUNT` on the right;
- group subtotal rows with indented supporting tasks;
- no quantity column;
- payment note and navy total band on the final page;
- Fidexa footer and contact details without company locations.

Pagination is content-driven. Page 1 starts with the complete invoice identity and client metadata. When line-item groups exceed the available space, subsequent pages repeat the compact invoice identity and table header, mark the continuation, and continue groups without splitting a group across pages where possible. The total band, payment details, and footer are placed only on the final page. A one-page invoice uses the same structure without continuation markers.

The client PDF renderer receives calculated amounts but never receives hours or hourly rates. The internal renderer receives the full calculation model and labels it as internal.

## Error handling and validation

The server rejects:

- missing invoice number, client name, or groups;
- non-ISO dates or a due date earlier than the issue date;
- empty descriptions;
- negative, non-finite, or unsupported hour values;
- zero or negative rates;
- tax rates below zero or above 100;
- mixed direct hours and nested tasks in one group;
- currencies other than UGX in v1;
- duplicate invoice numbers when output files already exist, unless an explicit overwrite flag is added in a later version.

Errors are returned as structured MCP tool errors with a concise field path and human-readable reason. No PDF is written unless the complete request validates and calculation succeeds.

## Testing strategy

Pure calculator tests will cover:

- direct line-item calculation;
- nested task amounts and group subtotals;
- quarter-hour precision and UGX rounding;
- tax and final total calculation;
- invalid mixed group shapes and negative values;
- the five supplied BMS descriptions as descriptions only, without using their example prices.

Renderer tests will cover:

- one-page output;
- multi-page output with repeated continuation structure;
- totals appearing only on the final page;
- client output containing no hour or rate text;
- internal output containing hours and effective rates;
- output-file naming and JSON audit contents.

MCP integration tests will invoke both tools through the server transport and verify the response schema and generated files.

## Acceptance criteria

The feature is complete when an MCP client can submit the structured BMS scope with private estimates and a UGX rate and receive:

1. a deterministic calculation summary;
2. a branded client PDF with amounts only;
3. a branded internal statement PDF with hours and rates;
4. a calculation JSON audit file;
5. correct one-page or multi-page pagination without overlapping content;
6. clear validation errors for malformed requests.

