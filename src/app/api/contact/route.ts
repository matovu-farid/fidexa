import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit } from "@/lib/rate-limit";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(200),
  email: z.string().trim().email().max(320),
  message: z.string().trim().min(1).max(10_000),
  website: z.string().max(200).optional(),
}).strict();

export async function POST(req: Request) {
  const contentLength = Number(req.headers.get("content-length") || 0);
  if (contentLength > 12_000) {
    return NextResponse.json({ error: "Message is too large" }, { status: 413 });
  }

  let body: unknown;
  try {
    const reader = req.body?.getReader();
    if (!reader) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    const chunks: Uint8Array[] = [];
    let totalBytes = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > 12_000) {
        await reader.cancel();
        return NextResponse.json({ error: "Message is too large" }, { status: 413 });
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
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }
  if (parsed.data.website) {
    return NextResponse.json({ success: true });
  }
  const rateLimit = await checkRateLimit(req, "contact");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests" }, {
      status: 429,
      headers: { "Retry-After": String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))) },
    });
  }
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Contact is temporarily unavailable" }, { status: 503 });
  }
  const { name, email, message } = parsed.data;

  const { error } = await new Resend(apiKey).emails.send({
    from: "Fidexa Contact <contact@fidexa.org>",
    to: process.env.CONTACT_EMAIL || "matovufarid@gmail.com",
    replyTo: email,
    subject: `New inquiry from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  });

  if (error) {
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
