"use client";

import { motion } from "framer-motion";
import { ChevronDown, Languages, Sparkles } from "lucide-react";
import type { Locale } from "@/types";

interface Props {
  locale: Locale;
  onToggleLocale: (locale: Locale) => void;
}

const COPY = {
  en: {
    builtWith: "Built with Mistral AI",
    tagline: "Tech Investing + Applied AI",
    intro:
      "15 years of technology investing paired with nights and weekends shipping applied AI products. Sciences Po 2009.",
    explore: "Explore",
    localeLabel: "FR",
    mastheadLabel: "Boston / Paris",
  },
  fr: {
    builtWith: "Construit avec Mistral AI",
    tagline: "Investissement tech + IA appliquée",
    intro:
      "15 ans d'investissement tech, complétés par des produits IA appliquée construits le soir et le week-end.",
    explore: "Explorer",
    localeLabel: "EN",
    mastheadLabel: "Boston / Paris",
  },
};

export default function Hero({ locale, onToggleLocale }: Props) {
  const copy = COPY[locale];

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Editorial dark background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_35%,rgba(233,122,46,0.12),rgba(17,19,24,0.92)_60%,rgba(17,19,24,1)_100%)]" />
        <div className="absolute inset-0 vignette" />
      </div>

      {/* Locale toggle */}
      <div className="absolute top-6 left-6 inline-flex items-start gap-3">
        <div className="h-11 w-11 rounded-full border border-white/[0.14] bg-white/[0.03] flex items-center justify-center">
          <span className="font-serif text-xl leading-none tracking-[-0.02em] text-foreground/90">
            B.
          </span>
        </div>
        <div className="pt-1.5">
          <p className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground/60">
            Brendan
          </p>
          <p className="text-[11px] text-muted-foreground/75">
            {copy.mastheadLabel}
          </p>
        </div>
      </div>

      <button
        onClick={() => onToggleLocale(locale === "en" ? "fr" : "en")}
        className="absolute top-6 right-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.12] bg-white/[0.03] text-xs tracking-[0.16em] uppercase text-muted-foreground hover:text-foreground hover:bg-white/[0.05] transition-colors"
        aria-label={locale === "en" ? "Switch to French" : "Passer en anglais"}
        title={locale === "en" ? "Switch to French" : "Passer en anglais"}
      >
        <Languages className="w-3.5 h-3.5" />
        {copy.localeLabel}
      </button>

      {/* Content */}
      <motion.div
        className="text-center max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Mistral badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-10 rounded-full border border-white/[0.12] bg-white/[0.03] text-xs font-medium tracking-wide text-muted-foreground"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Sparkles className="w-3.5 h-3.5 text-mistral-orange" />
          {copy.builtWith}
        </motion.div>

        {/* Name */}
        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-[-0.02em] mb-4 leading-[0.92]">
          <span className="text-gradient">Brendan</span>{" "}
          <span className="text-foreground/90">.</span>
          {/* TODO: Add last name */}
        </h1>

        {/* Tagline */}
        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-5 font-sans tracking-[-0.01em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {copy.tagline}
        </motion.p>

        <motion.p
          className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-12 leading-relaxed tracking-[0.01em]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {copy.intro}
        </motion.p>
      </motion.div>

      {/* Scroll indicator */}
      <motion.a
        href="#timeline"
        className="absolute bottom-10 flex flex-col items-center gap-2 text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
      >
        <span className="text-xs font-medium tracking-widest uppercase">
          {copy.explore}
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.a>
    </section>
  );
}
