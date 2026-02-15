"use client";

import { useState } from "react";
import Hero from "@/components/Hero";
import Timeline from "@/components/Timeline";
import SemanticSearch from "@/components/SemanticSearch";
import ChatWidget from "@/components/ChatWidget";
import type { Locale } from "@/types";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("en");

  return (
    <main className="relative">
      {/* Hero — full viewport intro */}
      <Hero locale={locale} onToggleLocale={setLocale} />

      {/* Timeline — vertical career chapters */}
      <Timeline locale={locale} />

      {/* Semantic Search — embeddings-powered search */}
      <SemanticSearch locale={locale} />

      {/* Footer */}
      <footer className="border-t border-white/[0.06] py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs tracking-[0.01em] text-muted-foreground/55">
            {locale === "en"
              ? "Built with Mistral AI — Agents API, FLUX Image Generation, OCR, Embeddings"
              : "Construit avec Mistral AI — API des agents, génération d'images FLUX, OCR, embeddings"}
          </p>
          <div className="flex items-center gap-4">
            {/* TODO: Add your links */}
            <a
              href="https://github.com/bme3412/mistral-cv-2026"
              target="_blank"
              rel="noreferrer noopener"
              className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {/* Chat Widget — floating overlay */}
      <ChatWidget locale={locale} />
    </main>
  );
}
