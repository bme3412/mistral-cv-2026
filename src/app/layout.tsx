import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fontHeading = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontBody = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Brendan — Tech Investing + Applied AI | Built with Mistral AI",
  description:
    "An interactive resume at the intersection of tech investing and applied AI, built with Mistral's Agents API, image generation, OCR, and embeddings.",
  openGraph: {
    title: "Brendan — Tech Investing + Applied AI",
    description:
      "An interactive resume at the intersection of tech investing and applied AI, built with Mistral AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${fontHeading.variable} ${fontBody.variable} ${fontMono.variable}`}
    >
      <body className="font-sans noise">{children}</body>
    </html>
  );
}
