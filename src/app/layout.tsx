import type { Metadata } from "next";
import localFont from "next/font/local";
import { PostHogIdentity } from "@/lib/auth-client";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const fidexaSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-fidexa-sans",
  display: "swap",
  weight: "100 900",
  style: "normal",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.fidexa.org"),
  title: "Fidexa — Software Studio",
  description: "Fidexa builds end-to-end software products for companies and their customers.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Fidexa",
    title: "Fidexa — Software Studio",
    description: "Fidexa builds end-to-end software products for companies and their customers.",
    images: [{ url: "/projects/rishi-library.png", width: 1280, height: 720, alt: "Rishi reading library product showcase" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fidexa — Software Studio",
    description: "Fidexa builds end-to-end software products for companies and their customers.",
    images: ["/projects/rishi-library.png"],
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${fidexaSans.variable} antialiased`}>
        <PostHogIdentity />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
