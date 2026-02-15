"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ImageIcon,
  Loader2,
  ExternalLink,
  RefreshCw,
  Expand,
} from "lucide-react";
import type { Chapter, Locale } from "@/types";
import { cn } from "@/lib/utils";
import ImageGenOverlay, { type GenerationPhase } from "./ImageGenOverlay";
import ImageLightbox from "./ImageLightbox";

interface Props {
  chapter: Chapter;
  index: number;
  side: "left" | "right";
  locale: Locale;
}

export default function TimelineChapter({ chapter, index, side, locale }: Props) {
  const isBuilderChapter = chapter.id === "the-builder";
  const [expandedBullets, setExpandedBullets] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [phase, setPhase] = useState<GenerationPhase>("idle");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const handleCancelGeneration = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (phaseTimerRef.current) {
      clearTimeout(phaseTimerRef.current);
      phaseTimerRef.current = null;
    }
    setOverlayOpen(false);
    setPhase("idle");
    setImageLoading(false);
  };

  const handleGenerateImage = async () => {
    if (imageLoading) return;

    setImageLoading(true);
    setImageError(null);
    setOverlayOpen(true);
    setPhase("interpreting");
    abortRef.current = new AbortController();

    phaseTimerRef.current = setTimeout(() => {
      setPhase((prev) =>
        prev === "interpreting" ? "generating" : prev
      );
    }, 2000);

    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          chapterId: chapter.id,
          prompt: chapter.imagePrompt,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate image");
      }

      const data = await res.json();
      setPhase("downloading");
      await sleep(550);
      setImageUrl(data.imageUrl);
      setPhase("complete");
      await sleep(1000);
      setOverlayOpen(false);
      setPhase("revealed");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setPhase("idle");
        return;
      }
      setImageError(err.message);
      setOverlayOpen(false);
      setPhase("idle");
    } finally {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
      abortRef.current = null;
      setImageLoading(false);
    }
  };

  const hasMoreBullets = isBuilderChapter && chapter.bulletPoints.length > 2;
  const visibleBullets =
    hasMoreBullets && !expandedBullets
      ? chapter.bulletPoints.slice(0, 2)
      : chapter.bulletPoints;
  const chapterProjects = chapter.projects || [];
  const hasMoreProjects = isBuilderChapter && chapterProjects.length > 3;
  const visibleProjects =
    hasMoreProjects && !showAllProjects
      ? chapterProjects.slice(0, 3)
      : chapterProjects;

  return (
    <motion.div
      id={chapter.id}
      className={cn(
        "relative flex w-full mb-16 md:mb-24",
        side === "left" ? "md:justify-start" : "md:justify-end md:mt-10"
      )}
      initial={{ opacity: 0, y: 30, x: side === "left" ? -20 : 20 }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: 0.1 }}
    >
      {/* Timeline dot */}
      <div className="absolute left-1/2 -translate-x-1/2 top-8 z-10 hidden md:block">
        <div className="w-3 h-3 rounded-full bg-mistral-orange shadow-lg shadow-mistral-orange/30" />
      </div>

      {/* Card */}
      <div
        className={cn(
          "w-full md:w-[calc(50%-2.75rem)] rounded-xl p-7 transition-all border border-white/[0.1] bg-[#171a20]/80 hover:bg-[#1a1d24]/90",
          side === "left" ? "md:mr-auto" : "md:ml-auto"
        )}
      >
        {/* Header */}
        <div className="mb-4">
          <span className="text-[10px] font-mono text-muted-foreground/50 tracking-[0.2em] uppercase">
            {locale === "en" ? `Chapter ${index + 1}` : `Chapitre ${index + 1}`}
          </span>
          <br />
          <span className="text-xs font-mono text-mistral-orange/80 tracking-wider">
            {chapter.dateRange}
          </span>
          <h3 className="font-serif text-[1.85rem] font-semibold tracking-[-0.015em] mt-1 text-foreground">
            {chapter.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 tracking-[0.01em]">
            {chapter.subtitle}
          </p>
        </div>

        {/* Bullet points */}
        <ul className="space-y-2.5 mb-5">
          {visibleBullets.map((bullet, i) => (
            (() => {
              const isFootnote = bullet.trim().startsWith("*");
              return (
            <li
              key={i}
              className={cn(
                "leading-relaxed pl-4 relative",
                isFootnote
                  ? "text-[11px] font-mono text-muted-foreground/62 pl-2 before:hidden"
                  : "text-sm text-muted-foreground/82 before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:rounded-full before:bg-mistral-orange/45"
              )}
            >
              {bullet}
            </li>
              );
            })()
          ))}
        </ul>

        {hasMoreBullets && (
          <button
            onClick={() => setExpandedBullets(!expandedBullets)}
            className="text-xs text-muted-foreground/65 hover:text-muted-foreground transition-colors mb-5"
          >
            {expandedBullets
              ? locale === "en"
                ? "Show fewer bullet points"
                : "Voir moins de points"
              : locale === "en"
                ? "Show all bullet points"
                : "Voir tous les points"}
          </button>
        )}

        {/* Projects */}
        {chapter.projects && chapter.projects.length > 0 && (
          <div className="mb-5 space-y-2">
            <span className="text-[10px] font-mono text-muted-foreground/50 uppercase tracking-wider">
              {locale === "en" ? "Shipped Projects" : "Projets livrés"}
            </span>
            {visibleProjects.map((project) => (
              <a
                key={project.name}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.07] border border-white/[0.05] hover:border-mistral-orange/20 transition-all group"
              >
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-mistral-orange mt-0.5 flex-shrink-0 transition-colors" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors">
                      {project.name}
                    </span>
                    {project.status && (
                      <span
                        className={cn(
                          "text-[9px] font-mono px-1.5 py-0.5 rounded-full",
                          project.status === "Live"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : project.status === "Hackathon"
                              ? "bg-violet-500/10 text-violet-400"
                              : project.status === "In Development"
                                ? "bg-amber-500/10 text-amber-400"
                                : "bg-white/[0.06] text-muted-foreground/60"
                        )}
                      >
                        {project.status}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/60 mt-0.5 leading-relaxed line-clamp-2-custom">
                    {project.description}
                  </p>
                </div>
              </a>
            ))}
            {hasMoreProjects && (
              <button
                onClick={() => setShowAllProjects(!showAllProjects)}
                className="text-xs text-muted-foreground/65 hover:text-muted-foreground transition-colors"
              >
                {showAllProjects
                  ? locale === "en"
                    ? "Show fewer projects"
                    : "Voir moins de projets"
                  : locale === "en"
                    ? "Show all projects"
                    : "Voir tous les projets"}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          {chapter.tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 text-[10px] font-medium tracking-[0.12em] uppercase rounded-full bg-white/[0.04] text-muted-foreground/85 border border-white/[0.09]"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Generated image */}
        {imageUrl && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
          >
            <motion.div
              className="relative rounded-xl overflow-hidden border border-white/[0.08] group"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.22 }}
            >
              <motion.img
                src={imageUrl}
                alt={`AI-generated visual for ${chapter.title}`}
                className="w-full rounded-xl"
                initial={{ filter: "blur(14px)", scale: 1.03, opacity: 0.72 }}
                animate={{ filter: "blur(0px)", scale: 1, opacity: 1 }}
                transition={{ duration: 0.62, ease: "easeOut" }}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/18 via-transparent to-transparent" />
            </motion.div>
            <div className="mt-2.5 rounded-lg border border-white/[0.08] bg-white/[0.02] px-3 py-2 flex items-center justify-between gap-2">
              <p className="text-[10px] font-mono text-muted-foreground/70 tracking-[0.05em]">
                Generated with FLUX 1.1 [pro] Ultra via Mistral
              </p>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleGenerateImage}
                  title={
                    locale === "en"
                      ? "Generate a new image variation"
                      : "Générer une nouvelle variation"
                  }
                  className="inline-flex items-center justify-center h-7 w-7 rounded-full border border-white/[0.12] text-muted-foreground/80 hover:text-foreground hover:border-white/[0.22] transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setLightboxOpen(true)}
                  className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border border-white/[0.12] text-muted-foreground/80 hover:text-foreground hover:border-white/[0.22] transition-colors"
                >
                  <Expand className="w-3.5 h-3.5" />
                  {locale === "en" ? "View Full" : "Plein écran"}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Image generation button */}
        {!imageUrl && (
          <button
            onClick={handleGenerateImage}
            disabled={imageLoading}
            title={
              locale === "en"
                ? "Generate an AI image for this chapter using Mistral's FLUX integration"
                : "Générer une image IA pour ce chapitre avec l'intégration FLUX de Mistral"
            }
            className={cn(
              "relative overflow-hidden flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg transition-all",
              imageLoading
                ? "bg-white/[0.04] text-muted-foreground cursor-wait"
                : "bg-mistral-orange/10 text-mistral-orange hover:bg-mistral-orange/20 border border-mistral-orange/25"
            )}
          >
            {!imageLoading && (
              <span className="absolute inset-0 shimmer opacity-45 pointer-events-none" />
            )}
            {imageLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {locale === "en"
                  ? "Generating with FLUX..."
                  : "Génération avec FLUX..."}
              </>
            ) : (
              <>
                <ImageIcon className="w-3.5 h-3.5" />
                {locale === "en" ? "Generate Visual" : "Générer un visuel"}
              </>
            )}
          </button>
        )}

        {/* Error state */}
        {imageError && (
          <p className="text-xs text-red-400/80 mt-2">{imageError}</p>
        )}
      </div>

      <ImageGenOverlay
        open={overlayOpen}
        chapterTitle={chapter.title}
        phase={phase}
        onCancel={handleCancelGeneration}
      />

      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        imageUrl={imageUrl}
        chapterTitle={chapter.title}
        prompt={chapter.imagePrompt}
      />
    </motion.div>
  );
}
