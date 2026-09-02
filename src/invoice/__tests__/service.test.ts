import { readFile } from "node:fs/promises";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it, afterEach } from "vitest";

import { createInvoiceBundle } from "../index";
import type { InvoiceRequest } from "../schema";

const invoice: InvoiceRequest = {
  invoiceNumber: "FDX-2026-002",
  issueDate: "2026-09-01",
  client: { name: "BMS Client", email: "client@example.com" },
  hourlyRate: 125_000,
  groups: [{ description: "Software optimisation", hours: 2 }],
};

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("createInvoiceBundle", () => {
  it("writes client PDF, internal statement, and calculation audit files", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "fidexa-invoice-"));
    temporaryDirectories.push(outputDirectory);

    const result = await createInvoiceBundle(invoice, { outputDirectory });

    expect(result.clientPdfPath).toBe(join(outputDirectory, invoice.invoiceNumber, "client-invoice.pdf"));
    expect(result.internalStatementPath).toBe(join(outputDirectory, invoice.invoiceNumber, "internal-statement.pdf"));
    expect(result.calculationPath).toBe(join(outputDirectory, invoice.invoiceNumber, "calculation.json"));
    expect(result.clientSummary).not.toHaveProperty("hours");
    expect(result.clientSummary).not.toHaveProperty("hourlyRate");
    expect((await readFile(result.calculationPath, "utf8"))).toContain('"hours": 2');
  });

  it("rejects an existing invoice directory instead of overwriting it", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "fidexa-invoice-"));
    temporaryDirectories.push(outputDirectory);

    await createInvoiceBundle(invoice, { outputDirectory });

    await expect(createInvoiceBundle(invoice, { outputDirectory })).rejects.toThrow(/already exists/);
  });
});
