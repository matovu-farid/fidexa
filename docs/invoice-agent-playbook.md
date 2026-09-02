# Fidexa Invoice and Quotation Agent Playbook

This playbook is for feature agents that need to create a Fidexa invoice or quotation through the `fidexa-invoices` MCP server.

## Operating rules

- Use the MCP server for validation, arithmetic, pagination, and PDF creation. Do not calculate totals manually in the agent and do not edit PDF coordinates directly.
- Treat hours and hourly rates as private internal pricing inputs. They must never be copied into the client-facing document or the final client response.
- Use `UGX` and integer hourly rates. Hours may use quarter-hour precision.
- Use the supplied Fidexa letterhead automatically. Do not replace the logo, signature, phone number, or palette in an individual request.
- Do not invent client locations, tax, payment details, status, or client email addresses. Omit unknown optional fields.
- Check the returned total and output paths before reporting success.

## Standard workflow

1. Identify the document type: invoice or quotation.
2. Collect the document number, issue date, client name, and either due date or validity date.
3. Normalize the work scope into primary groups. Use nested tasks when a primary item needs an internal breakdown.
4. Estimate private hours for each group or task. Record the assumptions in the agent's internal reasoning or project notes, not in the client PDF.
5. Choose the approved UGX hourly rate for the work.
6. Call `calculate_invoice` or `calculate_quotation`.
7. Review every group subtotal, the subtotal, tax, and total. If the result is not commercially correct, revise the private hours/rate and calculate again.
8. Call `create_invoice` or `create_quotation` with the validated request.
9. Confirm that the returned client PDF exists and that the client summary contains no hours or hourly rate.
10. Return the client PDF path. Keep the internal statement and calculation JSON restricted to Fidexa staff.

## Invoice request template

```json
{
  "invoiceNumber": "FDX-2026-001",
  "issueDate": "2026-09-02",
  "dueDate": "2026-10-02",
  "terms": "Net 30",
  "client": { "name": "CJ Engineering" },
  "currency": "UGX",
  "hourlyRate": 150000,
  "groups": [
    {
      "description": "Preventative maintenance of Alerton supervisor server operating system",
      "tasks": [
        { "description": "Pre-change health checks and backup verification", "hours": 2 },
        { "description": "Operating system maintenance and patching", "hours": 4 }
      ]
    },
    { "description": "Alerton Compass software optimisation", "hours": 8 }
  ]
}
```

## Quotation request template

Use the same structure, replacing `invoiceNumber` with `quotationNumber`, and `dueDate` with `validUntil`:

```json
{
  "quotationNumber": "FDX-Q-2026-001",
  "issueDate": "2026-09-02",
  "validUntil": "2026-10-02",
  "terms": "Net 30",
  "client": { "name": "CJ Engineering" },
  "currency": "UGX",
  "hourlyRate": 150000,
  "groups": [
    { "description": "Alerton Compass software optimisation", "hours": 8 }
  ]
}
```

## Output handling

`create_invoice` produces `client-invoice.pdf`, `internal-statement.pdf`, and `calculation.json`. `create_quotation` produces the equivalent quotation PDF, internal estimate, and audit JSON. The client documents use `Description` and `Amount`, number primary groups, hide hours/rates, use the shared Fidexa letterhead and signature, and paginate long scopes across A4 pages.

The agent should report the client document, document number, client name, currency, and final total. It should not expose the internal statement path or calculation details unless the user is an authorized Fidexa operator explicitly asking for them.

For server setup, request schemas, formulas, and error behavior, see [`invoice-mcp-server.md`](./invoice-mcp-server.md). The ready-to-run Alerton examples are [`bms-invoice-request.json`](../examples/bms-invoice-request.json) and [`bms-quotation-request.json`](../examples/bms-quotation-request.json).
