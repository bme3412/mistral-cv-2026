"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl: string | null;
  chapterTitle: string;
  prompt: string;
}

export default function ImageLightbox({
  open,
  onOpenChange,
  imageUrl,
  chapterTitle,
  prompt,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[95vw] border-white/[0.12] bg-[#11141b]/95 backdrop-blur-xl p-4 sm:p-5">
        <DialogTitle className="text-sm font-medium text-foreground/90">
          {chapterTitle} — Full Visual
        </DialogTitle>
        {imageUrl && (
          <img
            src={imageUrl}
            alt={`Full generated visual for ${chapterTitle}`}
            className="w-full max-h-[72vh] object-contain rounded-lg border border-white/[0.08]"
          />
        )}
        <div className="rounded-lg border border-white/[0.08] bg-white/[0.02] p-3">
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60 mb-1">
            Prompt
          </p>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {prompt}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

