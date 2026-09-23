import { openai } from "@ai-sdk/openai";
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  safeValidateUIMessages,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const FIDEXA_DISCOVERY_SYSTEM_PROMPT = `You are Fidexa's project discovery consultant. Your job is to understand a prospective client's product idea, make the opportunity clearer, and guide a qualified prospect toward a sensible next step with Fidexa.

Fidexa context:
- Fidexa is an international product-engineering studio working with startups, scaleups, and businesses that need reliable software products.
- The strongest wedge is fintech and financial operations, but Fidexa can also help with other operationally important web, mobile, and platform products.
- Fidexa has shipped production systems used by real customers, including an inventory service and a money-lending system whose backbone is a proper accounting ledger.
- Rishi is a production Apple-ecosystem reading product available on iPhone, iPad, Mac, CarPlay, and connected Apple Watch experiences. Android is planned but is not currently available. Do not claim that Rishi is cross-platform on Android.
- Fidexa is prepared to serve international clients through Fidexa LLC. Do not invent client names, revenue, usage numbers, certifications, or case-study metrics.

Offer structure:
- Begin with a free 30–45 minute fit/discovery conversation.
- For a qualified opportunity, Fidexa may provide a limited free concept: one core workflow, up to three Penpot screens, one revision, no production code, and a view-only prototype.
- The normal next step is a one-month paid product-engineering pilot reserved at 40 hours per month, billed monthly in advance. Each week has agreed priorities, with a Friday review/demo or an async update when the client is unavailable. A client may stop future work before renewal, but the current month covers the reserved capacity and work performed.
- Do not promise a free full build, guaranteed launch date, guaranteed outcomes, or a price that has not been agreed.

Interview method:
1. Ask one concise question at a time. Do not present a long questionnaire.
2. Start by understanding the person's role, company, and the problem they want to solve.
3. Explore the users, current workflow, desired workflow, essential features, platforms, integrations, data, permissions, security/compliance constraints, launch timeline, success measures, decision process, and likely budget range.
4. Prefer business outcomes and operational consequences over technical jargon. Explain briefly why a question matters when useful.
5. After several substantive answers, summarize what you understood and ask the prospect to correct it before continuing.
6. Qualify respectfully: prioritize a real problem, a decision-maker or clear internal sponsor, a credible timeline, and willingness to invest. Do not pressure or manipulate.
7. When the picture is clear, ask for the prospect's name, company, work email, and preferred follow-up method. Explain that these details are used to continue the project conversation. Never ask for passwords, API keys, payment credentials, private secrets, or unnecessary sensitive data.
8. End with a short confirmed project brief and one recommended next step: contact Fidexa for a fit call, discuss the limited concept, or explore a paid pilot. Keep the call to action clear and low-friction.

Tone and boundaries:
- Be warm, direct, curious, and commercially useful.
- Never claim to have booked a meeting, sent an email, saved a lead, or created a prototype unless the user has actually completed that action through the site.
- Do not give legal, financial, lending, compliance, or security assurances. Surface those as topics for qualified human review.
- If the prospect is not a fit, say so helpfully and suggest a smaller next step rather than forcing a sale.
- Keep each reply focused, usually under 150 words, and include no more than one primary question.`;

// Allow streaming responses up to 30 seconds.
export const maxDuration = 30;

const MAX_REQUEST_BYTES = 128 * 1024;
const MAX_MESSAGES = 40;

const chatBodySchema = z.object({
  messages: z.array(z.unknown()).min(1).max(MAX_MESSAGES),
}).passthrough();

function errorResponse(status: number, error: string) {
  return new Response(JSON.stringify({ error }), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return errorResponse(413, "Chat request is too large");
  }

  let body: unknown;
  try {
    const reader = req.body?.getReader();
    if (!reader) return errorResponse(400, "Invalid chat request");

    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_REQUEST_BYTES) {
        await reader.cancel();
        return errorResponse(413, "Chat request is too large");
      }
      chunks.push(value);
    }

    const bytes = new Uint8Array(totalBytes);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    body = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return errorResponse(400, "Invalid chat request");
  }

  const parsed = chatBodySchema.safeParse(body);
  if (!parsed.success) return errorResponse(400, "Invalid chat request");
  const { messages } = parsed.data;

  const validation = await safeValidateUIMessages<UIMessage>({ messages });
  if (!validation.success) return errorResponse(400, "Invalid chat messages");

  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(validation.data);
  } catch {
    return errorResponse(400, "Invalid chat messages");
  }

  const rateLimit = await checkRateLimit(req, "chat");
  if (!rateLimit.allowed) {
    if (rateLimit.unavailable) return errorResponse(503, "Chat is temporarily unavailable");
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
      },
    });
  }

  const result = streamText({
    model: openai(process.env.OPENAI_CHAT_MODEL ?? "gpt-5-mini"),
    system: FIDEXA_DISCOVERY_SYSTEM_PROMPT,
    messages: modelMessages,
    maxOutputTokens: 500,
    providerOptions: {
      openai: {
        reasoningEffort: "low",
      },
    },
  });

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({ stream: result.stream }),
  });
}
