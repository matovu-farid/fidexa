import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
