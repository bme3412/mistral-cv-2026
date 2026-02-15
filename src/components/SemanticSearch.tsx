"use client";

import { useState, useCallback } from "react";
import { Search, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { SearchResult } from "@/types";
import type { Locale } from "@/types";

interface Props {
  locale: Locale;
}

export default function SemanticSearch({ locale }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), topK: 5 }),
      });

      if (!res.ok) throw new Error("Search failed");

      const data = await res.json();
      setResults(data.results);
    } catch (err) {
      console.error("Search error:", err);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const scrollToChapter = (chapterId: string) => {
    const el = document.getElementById(chapterId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      // Brief highlight effect
      el.classList.add("ring-2", "ring-mistral-orange/50");
      setTimeout(
        () => el.classList.remove("ring-2", "ring-mistral-orange/50"),
        2000
      );
    }
  };

  return (
    <section className="max-w-2xl mx-auto px-6 py-16">
      <div className="text-center mb-8">
        <h2 className="font-serif text-2xl sm:text-3xl font-semibold tracking-[-0.015em] text-foreground">
          {locale === "en" ? "Semantic Search" : "Recherche sémantique"}
        </h2>
        <p className="text-sm text-muted-foreground mt-2 tracking-[0.01em]">
          {locale === "en"
            ? "Find the most relevant parts of my experience using Mistral embeddings"
            : "Trouvez les passages les plus pertinents de mon parcours grâce aux embeddings Mistral"}
        </p>
      </div>

      {/* Search input */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            locale === "en"
              ? 'Try "live demos", "AI certifications", or "investment process"'
              : "Essayez \"démos\", \"certifications IA\" ou \"processus d'investissement\""
          }
          className="w-full bg-white/[0.04] rounded-xl pl-11 pr-24 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-mistral-orange/50 border border-white/[0.06]"
        />
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1.5 text-xs font-medium rounded-lg bg-mistral-orange/10 text-mistral-orange hover:bg-mistral-orange/20 disabled:opacity-30 transition-colors border border-mistral-orange/20"
        >
          {isSearching ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            locale === "en" ? "Search" : "Rechercher"
          )}
        </button>
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {results.length > 0 && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {results.map((result, i) => (
              <motion.button
                key={result.chapterId}
                onClick={() => scrollToChapter(result.chapterId)}
                className="w-full text-left glass rounded-lg p-4 hover:bg-white/[0.06] transition-colors group"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-foreground">
                        {result.chapterTitle}
                      </span>
                      <span className="text-[10px] font-mono text-mistral-orange/60 px-1.5 py-0.5 rounded bg-mistral-orange/5">
                        {(result.score * 100).toFixed(0)}%
                        {locale === "en" ? " match" : " pertinence"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground/70 line-clamp-2">
                      {result.excerpt}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-mistral-orange transition-colors flex-shrink-0 mt-1" />
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {hasSearched && !isSearching && results.length === 0 && (
          <motion.p
            className="text-center text-sm text-muted-foreground/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {locale === "en"
              ? "No matching content found. Try a different query."
              : "Aucun résultat pertinent. Essayez une autre requête."}
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  );
}
