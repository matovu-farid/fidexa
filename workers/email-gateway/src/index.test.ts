import { describe, expect, it, vi } from "vitest";
import { createSignedRequest, handleInboundEmail, isAllowedRecipient } from "./index";

describe("email gateway", () => {
  it("allows only the five configured Fidexa aliases", () => {
    expect(isAllowedRecipient("HELLO@FIDEXA.ORG")).toBe(true);
    expect(isAllowedRecipient("random@fidexa.org")).toBe(false);
    expect(isAllowedRecipient("hello@other.example")).toBe(false);
  });

  it("forwards independently while ingesting", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: Hello",
      "Message-ID: <abc@example.com>",
      "Content-Type: text/plain",
      "",
      "Hi",
    ].join("\r\n"));
    const forward = vi.fn(async () => ({ success: true }));
    const fetch = vi.fn(async () => new Response("ok", { status: 202 }));
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put: vi.fn(async () => undefined) },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "Hello", "message-id": "<abc@example.com>" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: true,
      forward,
      setReject: vi.fn(),
    } as never, env, ctx, fetch);

    expect(forward).toHaveBeenCalledWith("matovu90@gmail.com");
    expect(fetch).toHaveBeenCalledWith("https://fidexa.org/api/inbox/ingest", expect.objectContaining({ method: "POST" }));
  });

  it("removes staged R2 objects when Fidexa rejects ingestion", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: Hello",
      "Content-Type: text/plain",
      "",
      "Hi",
    ].join("\r\n"));
    const forward = vi.fn(async () => ({ success: true }));
    const fetch = vi.fn(async () => new Response("bad request", { status: 400 }));
    const put = vi.fn(async () => undefined);
    const remove = vi.fn(async () => undefined);
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put, delete: remove },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "Hello" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: true,
      forward,
      setReject: vi.fn(),
    } as never, env, ctx, fetch);

    expect(put).toHaveBeenCalledTimes(1);
    expect(remove).toHaveBeenCalledWith(expect.arrayContaining([expect.stringMatching(/^raw\//)]));
  });

  it("retains staged objects when the ingest response is uncertain", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: Hello",
      "Content-Type: text/plain",
      "",
      "Hi",
    ].join("\r\n"));
    const forward = vi.fn(async () => ({ success: true }));
    const fetch = vi.fn(async () => { throw new Error("network timeout"); });
    const remove = vi.fn(async () => undefined);
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put: vi.fn(async () => undefined), delete: remove },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "Hello" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: true,
      forward,
      setReject: vi.fn(),
    } as never, env, ctx, fetch);

    expect(remove).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("retains staged objects when the app returns a server error", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: Hello",
      "Content-Type: text/plain",
      "",
      "Hi",
    ].join("\r\n"));
    const forward = vi.fn(async () => ({ success: true }));
    const fetch = vi.fn(async () => new Response("server error", { status: 500 }));
    const remove = vi.fn(async () => undefined);
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put: vi.fn(async () => undefined), delete: remove },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "Hello" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: true,
      forward,
      setReject: vi.fn(),
    } as never, env, ctx, fetch);

    expect(remove).not.toHaveBeenCalled();
  });

  it("rejects the message when Fidexa ingestion remains unavailable", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: Retry me",
      "Content-Type: text/plain",
      "",
      "Hi",
    ].join("\r\n"));
    const setReject = vi.fn();
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put: vi.fn(async () => undefined), delete: vi.fn(async () => undefined) },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "Retry me" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: true,
      forward: vi.fn(async () => ({ success: true })),
      setReject,
    } as never, env, ctx, async () => { throw new Error("network timeout"); });

    expect(setReject).toHaveBeenCalledWith("Temporary inbox processing failure");
  });

  it("removes staged objects when the API confirms a duplicate", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: Hello",
      "Content-Type: text/plain",
      "",
      "Hi",
    ].join("\r\n"));
    const forward = vi.fn(async () => ({ success: true }));
    const fetch = vi.fn(async () => new Response(JSON.stringify({ ok: true, duplicate: true }), { status: 200, headers: { "content-type": "application/json" } }));
    const remove = vi.fn(async () => undefined);
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put: vi.fn(async () => undefined), delete: remove },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "Hello" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: true,
      forward,
      setReject: vi.fn(),
    } as never, env, ctx, fetch);

    expect(remove).toHaveBeenCalledWith(expect.arrayContaining([expect.stringMatching(/^raw\//)]));
  });

  it("does not forward a message containing a rejected attachment", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: Unsafe file",
      "Content-Type: multipart/mixed; boundary=mail",
      "",
      "--mail",
      "Content-Type: text/plain",
      "",
      "See attached.",
      "--mail",
      "Content-Type: application/pdf",
      "Content-Disposition: attachment; filename=brief.pdf",
      "Content-Transfer-Encoding: base64",
      "",
      "TVqQAA==",
      "--mail--",
      "",
    ].join("\r\n"));
    const forward = vi.fn(async () => ({ success: true }));
    const fetch = vi.fn(async () => new Response("ok", { status: 202 }));
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put: vi.fn(async () => undefined), delete: vi.fn(async () => undefined) },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "Unsafe file" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: true,
      forward,
      setReject: vi.fn(),
    } as never, env, ctx, fetch);

    expect(forward).not.toHaveBeenCalled();
    expect(fetch).toHaveBeenCalledWith("https://fidexa.org/api/inbox/ingest", expect.objectContaining({ method: "POST" }));
  });

  it("does not forward when Cloudflare marks the message as non-forwardable", async () => {
    const raw = new TextEncoder().encode([
      "From: customer@example.com",
      "To: hello@fidexa.org",
      "Subject: No loop",
      "Content-Type: text/plain",
      "",
      "Hi",
    ].join("\r\n"));
    const forward = vi.fn(async () => ({ success: true }));
    const fetch = vi.fn(async () => new Response("ok", { status: 202 }));
    const ctx = { waitUntil: vi.fn() } as unknown as ExecutionContext;
    const env = {
      FIDEXA_APP_URL: "https://fidexa.org",
      GMAIL_FORWARD_TO: "matovu90@gmail.com",
      INBOX_INGEST_SECRET: "ingest-secret-123456",
      INBOX_BUCKET: { put: vi.fn(async () => undefined), delete: vi.fn(async () => undefined) },
    } as never;

    await handleInboundEmail({
      from: "customer@example.com",
      to: "hello@fidexa.org",
      headers: new Headers({ subject: "No loop" }),
      raw: new ReadableStream({ start(controller) { controller.enqueue(raw); controller.close(); } }),
      rawSize: raw.byteLength,
      canBeForwarded: false,
      forward,
      setReject: vi.fn(),
    } as never, env, ctx, fetch);

    expect(forward).not.toHaveBeenCalled();
  });

  it("signs the timestamped request body", async () => {
    const signed = await createSignedRequest("{}", "secret-123456", 1700000000);
    expect(signed.headers.get("x-inbox-timestamp")).toBe("1700000000");
    expect(signed.headers.get("x-inbox-signature")).toMatch(/^v1=/);
  });
});
