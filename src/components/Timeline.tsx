"use client";

import { getSortedChapters } from "@/data/chapters";
import TimelineChapter from "./TimelineChapter";
import type { Locale } from "@/types";

interface Props {
  locale: Locale;
}

export default function Timeline({ locale }: Props) {
  const chapters = getSortedChapters();

  return (
    <section id="timeline" className="relative max-w-6xl mx-auto px-6 py-28">
      {/* Timeline container */}
      <div className="relative">
        {/* Vertical center line (hidden on mobile) */}
        <div className="timeline-line hidden md:block" />

        {/* Chapter cards */}
        {chapters.map((chapter, index) => (
          <TimelineChapter
            key={chapter.id}
            chapter={chapter}
            index={index}
            side={index % 2 === 0 ? "left" : "right"}
            locale={locale}
          />
        ))}
      </div>
    </section>
  );
}
