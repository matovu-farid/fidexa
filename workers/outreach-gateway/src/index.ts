import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { createOutreachMcpServer } from "./mcp";
import { authenticateMcpRequest, claimMcpRequestId } from "./mcp-transport";
import { type OutreachEnv } from "./env";
import { handleReportingRequest } from "./routes";
import { recordResendEvent, verifyAndParseResendWebhook } from "./resend-webhook";
import { requireBinding } from "./env";
import { BodyTooLargeError, contentLengthWithinLimit, readTextWithinLimit } from "./limits";
import { cleanupExpiredEvidence, cleanupExpiredNonces, recordScheduledFailure } from "./retention";
import { syncZohoReplies } from "./zoho";

function json(value: unknown, status = 200): Response {
  return new Response(JSON.stringify(value), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });
}

export default {
  async fetch(request: Request, env: OutreachEnv): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/reporting/")) return handleReportingRequest(request, env);
    if (url.pathname === "/webhooks/resend") {
      if (request.method !== "POST") return json({ error: "method_not_allowed" }, 405);
      if (!contentLengthWithinLimit(request.headers.get("content-length"))) return json({ error: "request_too_large" }, 413);
      let payload: string;
      try {
        payload = await readTextWithinLimit(request.body);
      } catch (error) {
        if (error instanceof BodyTooLargeError) return json({ error: "request_too_large" }, 413);
        throw error;
      }
      try {
        const event = await verifyAndParseResendWebhook(payload, request.headers, env.RESEND_WEBHOOK_SECRET ?? "");
        const providerEventId = request.headers.get("svix-id");
        if (!providerEventId) return json({ error: "invalid_webhook" }, 400);
        const result = await recordResendEvent(requireBinding(env.OUTREACH_DB, "OUTREACH_DB"), event, payload, new Date().toISOString(), providerEventId);
        return json({ ok: true, ...result });
      } catch {
        return json({ error: "invalid_webhook" }, 400);
      }
    }
    if (url.pathname !== "/mcp") return json({ error: "not_found" }, 404);
    const origin = request.headers.get("origin");
    if (origin && origin !== env.OUTREACH_APP_ORIGIN) return json({ error: "origin_not_allowed" }, 403);
    if (!contentLengthWithinLimit(request.headers.get("content-length"))) return json({ error: "request_too_large" }, 413);

    let body: string;
    try {
      body = request.method === "POST" ? await readTextWithinLimit(request.body) : "";
    } catch (error) {
      if (error instanceof BodyTooLargeError) return json({ error: "request_too_large" }, 413);
      throw error;
    }
    const secrets = {
      operator: env.MCP_OPERATOR_SECRET ?? "",
      reviewer: env.MCP_REVIEWER_SECRET ?? "",
    } as const;
    const auth = await authenticateMcpRequest(request, secrets, body);
    if (!auth) return json({ error: "unauthorized" }, 401);
    if (auth.kind === "signed" && !await claimMcpRequestId(requireBinding(env.OUTREACH_DB, "OUTREACH_DB"), auth.role, auth.requestId, new Date().toISOString(), auth.timestamp)) {
      return json({ error: "replayed_request" }, 401);
    }

    const server = createOutreachMcpServer(auth.role, env);
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
      enableJsonResponse: true,
    });
    await server.connect(transport);
    const transportRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: request.method === "POST" ? body : undefined,
    });
    return transport.handleRequest(transportRequest);
  },

  async scheduled(controller: ScheduledController, env: OutreachEnv, ctx: ExecutionContext): Promise<void> {
    const now = new Date(controller.scheduledTime).toISOString();
    const db = requireBinding(env.OUTREACH_DB, "OUTREACH_DB");
    const scheduled = (task: string, work: Promise<unknown>) => work.catch(async (error) => recordScheduledFailure(db, task, now, error));
    const tasks: Promise<unknown>[] = [scheduled("retention_evidence", cleanupExpiredEvidence(env, now)), scheduled("retention_nonces", cleanupExpiredNonces(db, now))];
    if (String(env.SYNC_ENABLED) === "true") tasks.push(scheduled("zoho_sync", syncZohoReplies(env, now)));
    ctx.waitUntil(Promise.allSettled(tasks));
  },
};
