import { maxSignatureSkewSeconds, signRequest, verifyRequestSignature } from "./signatures";
import { canCallTool, type McpRole } from "./tool-policy";

type McpAuthentication =
  | { kind: "bearer"; role: McpRole }
  | { kind: "signed"; role: McpRole; requestId: string; timestamp: number };

export async function claimMcpRequestId(db: D1Database, role: McpRole, requestId: string, now: string, signedTimestamp = Math.floor(Date.now() / 1_000)): Promise<boolean> {
  const expiresAt = new Date((signedTimestamp + maxSignatureSkewSeconds + 1) * 1_000).toISOString();
  const result = await db.prepare(
    "INSERT OR IGNORE INTO request_nonces (scope, request_id, expires_at, created_at) VALUES (?, ?, ?, ?)",
  ).bind(`mcp:${role}`, requestId, expiresAt, now).run();
  return result.meta?.changes === 1;
}

export function parseMcpRole(value: string | null): McpRole | null {
  return value === "operator" || value === "reviewer" ? value : null;
}

function signedMcpMessage(role: McpRole, requestId: string, body: string): string {
  return JSON.stringify([role, requestId, body]);
}

export async function buildMcpSignatureHeaders(
  secret: string,
  body: string,
  timestamp: number,
  requestId: string,
  role: McpRole,
): Promise<Headers> {
  const headers = new Headers();
  headers.set("x-mcp-role", role);
  headers.set("x-mcp-request-id", requestId);
  headers.set("x-mcp-timestamp", String(timestamp));
  headers.set("x-mcp-signature", await signRequest(secret, timestamp, signedMcpMessage(role, requestId, body)));
  return headers;
}

async function constantTimeSecretMatch(actual: string, expected: string): Promise<boolean> {
  const [actualDigest, expectedDigest] = await Promise.all([
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(actual)),
    crypto.subtle.digest("SHA-256", new TextEncoder().encode(expected)),
  ]);
  const actualBytes = new Uint8Array(actualDigest);
  const expectedBytes = new Uint8Array(expectedDigest);
  let difference = 0;
  for (let index = 0; index < actualBytes.length; index += 1) difference |= actualBytes[index]! ^ expectedBytes[index]!;
  return difference === 0;
}

async function authenticateBearerRequest(request: Request, secrets: Record<McpRole, string>): Promise<McpRole | null> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  if (!match) return null;
  const token = match[1] ?? "";
  const [operatorMatches, reviewerMatches] = await Promise.all([
    constantTimeSecretMatch(token, secrets.operator),
    constantTimeSecretMatch(token, secrets.reviewer),
  ]);
  if (operatorMatches && !reviewerMatches) return "operator";
  if (reviewerMatches && !operatorMatches) return "reviewer";
  return null;
}

export async function authenticateMcpRequest(request: Request, secrets: Record<McpRole, string>, body: string): Promise<McpAuthentication | null> {
  const bearerRole = await authenticateBearerRequest(request, secrets);
  if (bearerRole) return { kind: "bearer", role: bearerRole };
  if (request.headers.has("authorization")) return null;

  const role = parseMcpRole(request.headers.get("x-mcp-role"));
  const requestId = request.headers.get("x-mcp-request-id");
  const timestamp = Number(request.headers.get("x-mcp-timestamp"));
  const signature = request.headers.get("x-mcp-signature");
  if (!role || !requestId || !Number.isInteger(timestamp) || !signature) return null;
  if (!secrets[role]) return null;

  const valid = await verifyRequestSignature({ secret: secrets[role], timestamp, body: signedMcpMessage(role, requestId, body), signature });
  if (!valid) return null;

  const parsedBody = body ? safeJson(body) : null;
  const toolName = parsedBody && typeof parsedBody === "object" && "params" in parsedBody && parsedBody.params && typeof parsedBody.params === "object" && "name" in parsedBody.params
    ? String(parsedBody.params.name)
    : "initialize";
  if (toolName !== "initialize" && !canCallTool(role, toolName)) return null;
  return { kind: "signed", role, requestId, timestamp };
}

function safeJson(body: string): Record<string, unknown> | null {
  try {
    const value: unknown = JSON.parse(body);
    return value && typeof value === "object" ? value as Record<string, unknown> : null;
  } catch {
    return null;
  }
}
