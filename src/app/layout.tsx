import type { Metadata } from "next";
import localFont from "next/font/local";
import { PostHogIdentity } from "@/lib/auth-client";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/data/site";
import { createPageMetadata, siteVerification } from "@/lib/seo";
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
  ...createPageMetadata(site.pages[0]),
  metadataBase: new URL(site.url),
  verification: siteVerification(process.env),
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="help" type="text/plain" href={`${site.url}/llms.txt`} title="Fidexa public studio and product guide" />
      </head>
      <body className={`${fidexaSans.variable} antialiased`}>
        <PostHogIdentity />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
