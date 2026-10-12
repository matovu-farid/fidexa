import { createAgentGuide } from "@/lib/agent-guide";

export const dynamic = "force-static";

export function GET() {
  return new Response(createAgentGuide(true), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
