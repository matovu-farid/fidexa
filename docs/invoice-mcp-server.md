# Fidexa Invoice MCP Server

This repository includes a standalone MCP server for producing Fidexa-branded invoices. The server accepts private hour estimates and a UGX hourly rate, performs the arithmetic itself, and writes a client PDF, an internal statement PDF, and a JSON calculation audit.

Feature agents should follow the dedicated [invoice and quotation agent playbook](./invoice-agent-playbook.md) for the end-to-end workflow and client/internal data boundary.

## Start the server

Install dependencies, then run:

```bash
pnpm invoice:mcp
```

The process uses MCP stdio transport, so configure an MCP-compatible client with:

```json
{
  "mcpServers": {
    "fidexa-invoices": {
      "command": "pnpm",
      "args": ["invoice:mcp"],
      "cwd": "/Users/faridmatovu/projects/fidexa"
    }
  }
}
```

Use the absolute repository path for `cwd` on each machine.

## Tools

### `calculate_invoice`

Validates the request and returns the normalized calculation without writing files. Use it when the calling AI needs to review subtotals and total before creating documents.

### `create_invoice`

Validates, calculates, and writes:

- `generated/invoices/<invoice-number>/client-invoice.pdf` — client-facing invoice with descriptions and UGX amounts only;
- `generated/invoices/<invoice-number>/internal-statement.pdf` — internal document with hours, effective rates, subtotals, tax, and total;
- `generated/invoices/<invoice-number>/calculation.json` — machine-readable audit of the normalized calculation.

An existing invoice-number directory is never overwritten.

### `calculate_quotation`

Validates and calculates a quotation using the same private hour estimates, UGX rate, nested groups, and arithmetic as an invoice, without writing files.

### `create_quotation`

Writes a client-facing `client-quotation.pdf`, an internal estimate statement, and a calculation JSON audit under `generated/invoices/<quotation-number>/`. Quotations use the same Fidexa layout and line-item structure as invoices, but show `Valid Until` instead of `Due Date`.

## Request shape

```json
{
  "invoiceNumber": "FDX-2026-004",
  "issueDate": "2026-09-02",
  "dueDate": "2026-10-02",
  "terms": "Net 30",
  "client": { "name": "CJ Engineering" },
  "currency": "UGX",
  "hourlyRate": 125000,
  "taxRate": 0,
  "groups": [
    {
      "description": "BMS server maintenance",
      "tasks": [
        { "description": "Operating system maintenance", "hours": 4 },
        { "description": "Preventative checks", "hours": 2 }
      ]
    },
    { "description": "Software optimisation", "hours": 5 }
  ]
}
```

Each group has either direct `hours` or nested `tasks`. A task can override the group rate, and a group can override the invoice rate. Hours use quarter-hour precision and all rates are integer UGX values.

The calculator applies:

```text
task amount = round(hours × effective hourly rate)
group subtotal = sum(task amounts) or round(group hours × group rate)
subtotal = sum(group subtotals)
tax = round(subtotal × taxRate / 100)
total = subtotal + tax
```

Quotation requests use the same shape with `quotationNumber` and optional `validUntil` in place of `invoiceNumber` and `dueDate`.

The supplied Alerton example is in `examples/bms-invoice-request.json`. Its reference prices are intentionally omitted; the example contains only normalized descriptions, private estimates, and a configurable rate. The planning baseline assumes one Alerton supervisor server, one operator workstation, and a small graphics/remapping batch. The calculated amount is deliberately derived from those hours; it is not forced to match a supplied target price. The hours are internal estimates, not values published by Honeywell or Alerton, and should be adjusted after confirming the server version, database setup, workstation count, number of graphics, and number of mapped points.

## PDF behavior

The PDF renderer follows the approved Fidexa invoice direction: actual Fidexa-style logo lockup, navy/mint/purple palette, generous padded layout, two-column client table, indented supporting tasks, no quantity column, and a navy final total band. Company locations are not included.

The shared Fidexa letterhead is used by both invoices and quotations. It includes the Fidexa logo lockup, mint top rule, `fidexa.org`, `sales@fidexa.org`, phone `+256 705 222 144`, and the supplied transparent signature image at `public/fidexa-signature.png`. The signature appears only on client-facing invoice and quotation PDFs above the `Authorized Signature` label; internal statements do not include it.

Short invoices and quotations remain on one A4 page. Long documents automatically span separate A4 pages, repeat the document identity and table header, label continuation pages, keep groups together where possible, and place totals only on the final page. Primary line items are numbered, the client-facing table uses `Description` and `Amount`, and the client PDFs omit private hours, rates, status, tax/VAT, and internal notes.

The client PDF does not contain hours or hourly rates. The internal statement and calculation JSON are the private record of how the invoice was priced.
