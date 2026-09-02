# Fidexa Invoice MCP Server Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone MCP server that calculates Fidexa invoices from private hour estimates and generates branded client and internal PDFs with automatic A4 pagination.

**Architecture:** Keep a pure Zod-backed domain model and calculator separate from a PDF renderer and an MCP stdio server. The MCP layer validates requests, invokes the calculator, writes a client PDF, an internal statement PDF, and a JSON audit bundle, then returns paths and redacted totals.

**Tech Stack:** TypeScript, Node.js stdio, `@modelcontextprotocol/sdk`, Zod, `pdf-lib`, Vitest, and `tsx`.

---

## File map

- Create: `src/invoice/schema.ts` — request, normalized calculation, and result schemas.
- Create: `src/invoice/config.ts` — Fidexa colors, document dimensions, typography, and output defaults.
- Create: `src/invoice/calculator.ts` — pure validation-adjacent calculations and rounding.
- Create: `src/invoice/renderer.ts` — client/internal PDF drawing and content-driven pagination.
- Create: `src/invoice/index.ts` — public invoice service that coordinates calculation, rendering, and audit output.
- Create: `src/mcp/invoice-server.ts` — MCP stdio server and tool definitions.
- Create: `src/invoice/__tests__/calculator.test.ts` — calculation and validation tests.
- Create: `src/invoice/__tests__/renderer.test.ts` — PDF output and pagination tests.
- Create: `src/invoice/__tests__/service.test.ts` — bundle writing and privacy tests.
- Create: `src/mcp/__tests__/invoice-server.test.ts` — MCP tool integration tests.
- Create: `scripts/invoice-mcp.ts` — executable local launcher.
- Create: `docs/invoice-mcp-server.md` — setup, input examples, and MCP client configuration.
- Modify: `package.json` — dependencies and scripts.
- Modify: `tsconfig.json` — include Node-side server sources without changing the Next.js aliases.
- Modify: `.gitignore` — ignore generated invoice bundles.

### Task 1: Add dependencies and test harness

**Files:**
- Modify: `package.json`
- Modify: `tsconfig.json`
- Modify: `.gitignore`
- Create: `vitest.config.ts`

- [ ] Add runtime dependencies `@modelcontextprotocol/sdk` and `pdf-lib`, and development dependencies `tsx` and `vitest`.
- [ ] Add scripts `invoice:mcp` (`tsx scripts/invoice-mcp.ts`) and `test` (`vitest run`).
- [ ] Set the server launcher to use the repository’s TypeScript module settings without importing Next-only code.
- [ ] Add `generated/invoices/` to `.gitignore` while keeping source fixtures tracked.
- [ ] Configure Vitest to include `src/**/*.test.ts` and `src/**/__tests__/**/*.test.ts`.
- [ ] Run `pnpm test -- --passWithNoTests` and confirm the empty harness exits successfully.

### Task 2: Implement the invoice domain model and calculator

**Files:**
- Create: `src/invoice/schema.ts`
- Create: `src/invoice/calculator.ts`
- Create: `src/invoice/config.ts`
- Create: `src/invoice/__tests__/calculator.test.ts`

- [ ] Write failing tests for direct groups, nested tasks, per-group and per-task rate overrides, quarter-hour precision, UGX rounding, tax, and final totals.
- [ ] Write failing validation tests for missing metadata, invalid dates, negative hours/rates, invalid tax, mixed direct/nested groups, unsupported currencies, and empty descriptions.
- [ ] Run `pnpm test -- src/invoice/__tests__/calculator.test.ts` and confirm the tests fail because the domain functions do not exist.
- [ ] Define Zod schemas for `InvoiceRequest`, `InvoiceGroup`, `InvoiceTask`, `CalculatedInvoice`, and the redacted client summary.
- [ ] Implement `calculateInvoice(request)` with the exact formulas in the design spec and integer UGX amounts.
- [ ] Ensure normalized output preserves descriptions, includes private hours/rates only in internal calculation data, and never mutates the request.
- [ ] Add the Fidexa palette and layout constants: navy `#101828`, purple `#7C5CFC`, mint `#37D6C0`, slate `#667085`, A4 `595.28×841.89` points, and 48-point document margins.
- [ ] Run the calculator test file and confirm it passes.

### Task 3: Implement the branded PDF renderer

**Files:**
- Create: `src/invoice/renderer.ts`
- Create: `src/invoice/__tests__/renderer.test.ts`

- [ ] Write failing tests that render a short invoice, extract page counts, assert a one-page result, and assert that client bytes do not contain `hours`, `rate`, or private hour values.
- [ ] Write a failing multi-page test with enough groups to force two pages and assert the continuation page has a repeated table header and the total appears only on the final page.
- [ ] Run the renderer tests and confirm they fail because the renderer does not exist.
- [ ] Implement PDF drawing with `pdf-lib`, including the Fidexa logo lockup as vector geometry plus the `fidexa` wordmark, invoice metadata, client block, date/status row, padded two-column table, nested group/subtotal rows, payment note, total band, and footer.
- [ ] Use a shared page-layout function so client and internal PDFs have identical geometry and only differ in visible fields.
- [ ] Implement content-driven pagination that keeps a group together where possible, repeats the compact header/table header on continuation pages, and reserves the final-page area for totals/payment/footer.
- [ ] Ensure the client renderer receives only calculated amounts and descriptions; the internal renderer receives hours and effective rates.
- [ ] Run renderer tests and confirm they pass.

### Task 4: Implement the invoice service and audit bundle

**Files:**
- Create: `src/invoice/index.ts`
- Create: `src/invoice/__tests__/service.test.ts`
- Modify: `.gitignore`

- [ ] Write failing tests for `createInvoiceBundle()` writing `client-invoice.pdf`, `internal-statement.pdf`, and `calculation.json` below `generated/invoices/<invoice-number>/`.
- [ ] Add a test proving a client PDF and returned client summary contain no private hours or rates while the internal PDF and JSON do.
- [ ] Add a test proving an existing invoice directory is rejected without an explicit overwrite option.
- [ ] Run the service tests and confirm they fail because the service does not exist.
- [ ] Implement the service to validate, calculate, render both PDFs, write the audit JSON, and return absolute paths, page counts, totals, and a redacted summary.
- [ ] Create directories only after validation and calculation succeed; write files atomically through temporary sibling files followed by rename.
- [ ] Run service tests and confirm they pass.

### Task 5: Expose the service over MCP stdio

**Files:**
- Create: `src/mcp/invoice-server.ts`
- Create: `src/mcp/__tests__/invoice-server.test.ts`
- Create: `scripts/invoice-mcp.ts`

- [ ] Write failing integration tests that start the MCP server over an in-memory transport, list `calculate_invoice` and `create_invoice`, call them with a valid request, and assert the response shape.
- [ ] Add an error test that sends an invalid request and asserts a structured MCP error without generated files.
- [ ] Run the MCP tests and confirm they fail because the server does not exist.
- [ ] Implement `calculate_invoice` as a read-only tool returning normalized totals and a private calculation breakdown for the calling AI.
- [ ] Implement `create_invoice` as the bundle-producing tool returning output paths, page counts, normalized totals, and a redacted client summary.
- [ ] Keep tool descriptions explicit: the AI must estimate private hours, the server performs arithmetic, and client documents never expose hours/rates.
- [ ] Implement `scripts/invoice-mcp.ts` to connect `InvoiceMcpServer` to `StdioServerTransport` and log diagnostics only to stderr.
- [ ] Run MCP integration tests and confirm they pass.

### Task 6: Add the BMS example and documentation

**Files:**
- Create: `docs/invoice-mcp-server.md`
- Create: `examples/bms-invoice-request.json`

- [ ] Add the five normalized BMS scope descriptions as an example request without using the supplied reference prices.
- [ ] Include private example estimates and a clearly labeled configurable UGX hourly rate so the example can produce a deterministic total.
- [ ] Document local startup, MCP client configuration, both tools, output paths, nested group input, and the client/internal privacy distinction.
- [ ] Document that invoices with many groups automatically span A4 pages and that totals appear on the final page.
- [ ] Run `pnpm test` and confirm all unit and integration tests pass.
- [ ] Run `pnpm exec tsc --noEmit` and confirm the project type-checks.
- [ ] Run `pnpm build` and confirm the existing Next.js site still builds.
- [ ] Run the example through the MCP service and inspect the generated PDFs and JSON audit file.

### Task 7: Final verification

**Files:**
- No source changes unless verification finds a defect.

- [ ] Verify the example client PDF contains Fidexa branding, UGX amounts, no company locations, no quantity column, and no private hours/rates.
- [ ] Verify the internal statement contains the same line-item groups plus hours, effective rates, group subtotals, and total.
- [ ] Verify a forced multi-page invoice has separate A4 pages, repeated continuation structure, no overlap, and totals only on the last page.
- [ ] Verify generated artifacts are ignored by Git and source changes are limited to the invoice tool, docs, and package configuration.
- [ ] Run `git status --short` and review the final diff before reporting completion.
