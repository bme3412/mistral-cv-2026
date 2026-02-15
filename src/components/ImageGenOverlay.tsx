"use client";

import { useEffect, useMemo, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  Image as ImageIcon,
  Download,
  Check,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type GenerationPhase =
  | "idle"
  | "interpreting"
  | "generating"
  | "downloading"
  | "complete"
  | "revealed";

interface Props {
  open: boolean;
  chapterTitle: string;
  phase: GenerationPhase;
  onCancel: () => void;
}

interface StepDef {
  id: "interpreting" | "generating" | "downloading" | "complete";
  title: string;
  description: string;
  Icon: typeof Sparkles;
}

const STEPS: StepDef[] = [
  {
    id: "interpreting",
    title: "Mistral Agent",
    description: "Interpreting the image prompt...",
    Icon: Sparkles,
  },
  {
    id: "generating",
    title: "FLUX 1.1 [pro] Ultra",
    description: "Generating high-fidelity image...",
    Icon: ImageIcon,
  },
  {
    id: "downloading",
    title: "File Storage",
    description: "Downloading from Mistral servers...",
    Icon: Download,
  },
  {
    id: "complete",
    title: "Complete",
    description: "Image ready",
    Icon: Check,
  },
];

const PHASE_ORDER: Record<GenerationPhase, number> = {
  idle: 0,
  interpreting: 1,
  generating: 2,
  downloading: 3,
  complete: 4,
  revealed: 5,
};

export default function ImageGenOverlay({
  open,
  chapterTitle,
  phase,
  onCancel,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    panelRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  const progressPct = useMemo(() => {
    const phaseIndex = PHASE_ORDER[phase];
    return Math.min(100, Math.max(0, (phaseIndex / 4) * 100));
  }, [phase]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            className="relative z-10 w-full max-w-xl rounded-2xl border border-white/[0.14] bg-[#13161d]/90 backdrop-blur-xl p-6 shadow-2xl shadow-black/50 outline-none"
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 10 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
          >
            <div className="flex items-start justify-between gap-3 mb-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground/65">
                  Generation Pipeline
                </p>
                <h4 className="text-sm sm:text-base text-foreground mt-1">
                  Generating visual for:{" "}
                  <span className="font-semibold">{chapterTitle}</span>
                </h4>
              </div>
              <button
                onClick={onCancel}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/70 hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
            </div>

            <div className="h-1.5 rounded-full bg-white/[0.07] overflow-hidden mb-5">
              <motion.div
                className="h-full bg-gradient-to-r from-mistral-orange/60 to-mistral-orange"
                initial={{ width: "8%" }}
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            </div>

            <div className="space-y-3">
              {STEPS.map((step, index) => {
                const currentOrder = PHASE_ORDER[phase];
                const stepOrder = index + 1;
                const isComplete = currentOrder > stepOrder;
                const isActive =
                  (step.id !== "complete" && phase === step.id) ||
                  (step.id === "complete" &&
                    (phase === "complete" || phase === "revealed"));
                const isWaiting = !isComplete && !isActive;
                const Icon = isComplete ? Check : step.Icon;

                return (
                  <motion.div
                    key={step.id}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 transition-all",
                      isActive
                        ? "border-mistral-orange/45 bg-mistral-orange/10"
                        : isComplete
                          ? "border-emerald-500/30 bg-emerald-500/5 opacity-85"
                          : "border-white/[0.08] bg-white/[0.02]"
                    )}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center border",
                        isActive
                          ? "border-mistral-orange/45 text-mistral-orange"
                          : isComplete
                            ? "border-emerald-500/35 text-emerald-400"
                            : "border-white/[0.14] text-muted-foreground/60"
                      )}
                    >
                      {isActive && step.id !== "complete" ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {step.title}
                      </p>
                      <p
                        className={cn(
                          "text-xs",
                          isWaiting
                            ? "text-muted-foreground/55"
                            : "text-muted-foreground/80"
                        )}
                      >
                        {step.description}
                      </p>
                    </div>
                    {isActive && (
                      <motion.span
                        className="h-2.5 w-2.5 rounded-full bg-mistral-orange"
                        animate={{ opacity: [0.35, 1, 0.35] }}
                        transition={{ duration: 1.2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

