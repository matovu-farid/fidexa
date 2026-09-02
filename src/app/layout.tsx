import type { Metadata } from "next";
import localFont from "next/font/local";
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
  title: "Fidexa — Software Studio",
  description: "Fidexa builds end-to-end software products for companies and their customers.",
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
      <body className={`${fidexaSans.variable} antialiased`}>{children}</body>
    </html>
  );
}
