// components/ContactSection.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone } from "lucide-react";

export default function ContactSection() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log("Form submitted:", { name, email, message });
    // Reset form fields
    setName("");
    setEmail("");
    setMessage("");
  };

  return (
    <section className="w-full py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 text-foreground">
          Contact Us
        </h2>
        <div className="grid md:grid-cols-2 gap-12">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-secondary text-foreground"
            />
            <Input
              type="email"
              placeholder="Your Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-secondary text-foreground"
            />
            <Textarea
              placeholder="Your Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="bg-secondary text-foreground"
              rows={6}
            />
            <Button
              type="submit"
              className="w-full text-lg py-6 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Send Message
            </Button>
          </form>
          <div className="space-y-6">
            <h3 className="text-2xl font-semibold mb-4 text-foreground">
              Get in Touch
            </h3>
            <p className="text-muted-foreground mb-6">
              We&apos;re here to help and answer any question you might have. We
              look forward to hearing from you.
            </p>
            <div className="space-y-4">
              <a
                href="tel:+11234567890"
                className="flex items-center text-accent hover:text-accent/80 transition-colors"
              >
                <Phone className="mr-2" /> +1 (123) 456-7890
              </a>
              <a
                href="tel:+19876543210"
                className="flex items-center text-accent hover:text-accent/80 transition-colors"
              >
                <Phone className="mr-2" /> +1 (987) 654-3210
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
