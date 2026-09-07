import { NextResponse } from "next/server";
import { Resend } from "resend";
import {
  formatSmsEmail,
  isValidTwilioSignature,
  parseTwilioSmsPayload,
} from "../../../../../lib/twilio-sms";

export const runtime = "nodejs";

const xmlHeaders = { "Content-Type": "text/xml; charset=utf-8" };

export async function POST(req: Request) {
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const webhookUrl = process.env.TWILIO_WEBHOOK_URL;
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!authToken || !webhookUrl || !resendApiKey) {
    return NextResponse.json({ error: "Webhook is not configured" }, { status: 500 });
  }

  let payload: FormData;
  try {
    payload = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form payload" }, { status: 400 });
  }

  const signature = req.headers.get("x-twilio-signature") ?? "";
  if (!isValidTwilioSignature(webhookUrl, payload, signature, authToken)) {
    return NextResponse.json({ error: "Invalid Twilio signature" }, { status: 401 });
  }

  let message;
  try {
    message = parseTwilioSmsPayload(payload);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid Twilio payload" },
      { status: 400 },
    );
  }

  const resend = new Resend(resendApiKey);
  const { error } = await resend.emails.send({
    from: "Fidexa SMS <contact@fidexa.org>",
    to: process.env.SMS_FORWARD_EMAIL || "farid@fidexa.org",
    subject: `Inbound SMS from ${message.from}`,
    text: formatSmsEmail(message),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to deliver SMS email" }, { status: 502 });
  }

  return new Response("<Response></Response>", { headers: xmlHeaders });
}
