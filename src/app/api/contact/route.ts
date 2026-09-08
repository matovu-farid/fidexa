import { Resend } from "resend";
import { NextResponse } from "next/server";
import { z } from "zod";

export async function POST(req: Request) {
  const parsed = z.object({ name: z.string().trim().min(1).max(120), email: z.string().email().max(320), message: z.string().trim().min(1).max(20_000) }).safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  const { name, email, message } = parsed.data;

  if (!name || !email || !message) {
    return NextResponse.json({ error: "All fields are required" }, { status: 400 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
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
