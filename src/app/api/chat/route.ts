import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";
import { z } from "zod";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const parsed = z.object({ messages: z.array(z.object({ role: z.enum(["user", "assistant", "system"]), content: z.string().max(200_000) })).max(100) }).safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Invalid messages" }, { status: 400 });
  const { messages } = parsed.data;

  const result = streamText({
    model: openai("gpt-3.5-turbo"),
    system: "You are an AI assistant for Fidexa, responsible for conducting interviews with clients to gather detailed information about the project they wish to create.",
    messages,
  });

  return result.toDataStreamResponse();
}
