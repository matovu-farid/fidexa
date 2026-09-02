import { describe, expect, it } from "vitest";

import { calculateInvoice } from "../calculator";
import type { InvoiceRequest } from "../schema";

const baseRequest: InvoiceRequest = {
  invoiceNumber: "FDX-2026-001",
  issueDate: "2026-09-01",
  dueDate: "2026-09-15",
  terms: "Net 14",
  status: "AWAITING PAYMENT",
  client: { name: "BMS Client", email: "client@example.com" },
  currency: "UGX",
  hourlyRate: 125_000,
  groups: [
    {
      description: "BMS server maintenance",
      tasks: [
        { description: "Operating system maintenance", hours: 3 },
        { description: "Preventative checks", hours: 1.5 },
      ],
    },
    { description: "Software optimisation", hours: 2 },
  ],
};

describe("calculateInvoice", () => {
  it("calculates nested task amounts, group subtotals, and the total", () => {
    const result = calculateInvoice(baseRequest);

    expect(result.subtotal).toBe(812_500);
    expect(result.tax).toBe(0);
    expect(result.total).toBe(812_500);
    expect(result.groups[0].subtotal).toBe(562_500);
    expect(result.groups[0].tasks?.map((task) => task.amount)).toEqual([
      375_000,
      187_500,
    ]);
  });

  it("applies task and group rate overrides and rounds to integer UGX", () => {
    const result = calculateInvoice({
      ...baseRequest,
      hourlyRate: 100_000,
      taxRate: 18,
      groups: [
        { description: "Fixed-rate group", hours: 1.25, hourlyRate: 120_000 },
        {
          description: "Override group",
          tasks: [{ description: "Specialist task", hours: 0.75, hourlyRate: 133_333 }],
        },
      ],
    });

    expect(result.subtotal).toBe(250_000);
    expect(result.tax).toBe(45_000);
    expect(result.total).toBe(295_000);
  });

  it("rejects invalid request shapes with field-specific errors", () => {
    expect(() =>
      calculateInvoice({
        ...baseRequest,
        dueDate: "2026-08-31",
        groups: [
          {
            description: "Invalid group",
            hours: 1,
            tasks: [{ description: "Cannot mix", hours: 1 }],
          },
        ],
      }),
    ).toThrow(/dueDate|tasks|hours/);
  });

  it("does not use supplied reference prices from descriptions or mutate input", () => {
    const request = structuredClone(baseRequest);
    const before = JSON.stringify(request);
    const result = calculateInvoice(request);

    expect(JSON.stringify(request)).toBe(before);
    expect(result.groups.map((group) => group.description)).toEqual([
      "BMS server maintenance",
      "Software optimisation",
    ]);
  });
});
