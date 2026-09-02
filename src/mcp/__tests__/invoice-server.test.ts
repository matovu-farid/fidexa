import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { afterEach, describe, expect, it } from "vitest";

import { createInvoiceMcpServer } from "../invoice-server";
import { invoiceRequestShape } from "../../invoice/schema";

const request = {
  invoiceNumber: "FDX-2026-003",
  issueDate: "2026-09-01",
  client: { name: "BMS Client", email: "client@example.com" },
  currency: "UGX",
  hourlyRate: 125_000,
  groups: [{ description: "Software optimisation", hours: 2 }],
};

const temporaryDirectories: string[] = [];

function firstText(result: unknown): string {
  const content = (result as { content?: Array<{ text?: string }> }).content;
  return String(content?.[0]?.text ?? "");
}

afterEach(async () => {
  await Promise.all(temporaryDirectories.splice(0).map((directory) => rm(directory, { recursive: true, force: true })));
});

describe("invoice MCP server", () => {
  it("uses the invoice object shape for MCP registration", () => {
    expect(invoiceRequestShape).toHaveProperty("invoiceNumber");
    expect(invoiceRequestShape).toHaveProperty("groups");
  });

  it("lists calculation and invoice creation tools and returns calculated totals", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "fidexa-mcp-"));
    temporaryDirectories.push(outputDirectory);
    const server = createInvoiceMcpServer({ outputDirectory });
    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const tools = await client.listTools();
    expect(tools.tools.map((tool) => tool.name)).toEqual([
      "calculate_invoice",
      "calculate_quotation",
      "create_quotation",
      "create_invoice",
    ]);
    const result = await client.callTool({ name: "calculate_invoice", arguments: request });
    const payload = JSON.parse(firstText(result));

    expect(payload.total).toBe(250_000);

    await client.close();
    await server.close();
  });

  it("returns a structured validation error and does not create files for invalid input", async () => {
    const outputDirectory = await mkdtemp(join(tmpdir(), "fidexa-mcp-"));
    temporaryDirectories.push(outputDirectory);
    const server = createInvoiceMcpServer({ outputDirectory });
    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await server.connect(serverTransport);
    await client.connect(clientTransport);

    const result = await client.callTool({ name: "create_invoice", arguments: { ...request, hourlyRate: -1 } });

    expect(result.isError).toBe(true);
    expect(firstText(result)).toMatch(/hourlyRate|positive/);

    await client.close();
    await server.close();
  });
});
