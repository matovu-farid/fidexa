import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai("gpt-3.5-turbo"),
    system: "You are an AI assistant for Fidexa, responsible for conducting interviews with clients to gather detailed information about the project they wish to create.",
    messages,
  });

  return result.toDataStreamResponse();
}
