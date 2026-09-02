// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InboxShell } from "./inbox-shell";

describe("InboxShell", () => {
  it("renders the private inbox chrome and an empty state", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ threads: [] }), { status: 200, headers: { "content-type": "application/json" } })));
    render(<InboxShell />);
    expect(screen.getByRole("heading", { name: "Inbox" })).toBeTruthy();
    await waitFor(() => expect(screen.getByText("Your inbox is clear.")).toBeTruthy());
  });
});
