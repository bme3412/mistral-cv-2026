import { Chapter } from "@/types";

/**
 * RESUME CHAPTERS
 * ================
 * Single source of truth for all resume content.
 * Add, remove, or reorder — everything else adapts automatically.
 */

export const chapters: Chapter[] = [
  // ──────────────────────────────────────────────────────────
  // CHAPTER 1: The Global Investor
  // ──────────────────────────────────────────────────────────
  {
    id: "global-investor",
    order: 1,
    title: "The Global Investor",
    subtitle:
      "A technology investor with global perspective and deep domain expertise across 200+ technology companies.",
    dateRange: "2011 – 2026",
    bulletPoints: [
      "Brendan began his career in institutional asset management in 2010 after studying in Boston. He also attended Sciences Po in Paris in Spring 2009. ",
      "Over 15 years, he developed deep domain expertise across 200+ technology companies spanning software, semiconductors, AI infrastructure, and application-layer platforms.",
      "He has traveled to 56 countries — including Australia, Indonesia, Chile, South Africa, China...etc*.",
      "Based in Boston + Cape Cod",
      "*Argentina, Australia, Austria, Belgium, Brazil, Canada, Chile, China, Czech Republic, Denmark, Egypt, Finland, France, Germany, Hong Kong, Iceland, Indonesia, Italy, Japan, Malaysia, Netherlands, New Zealand, Norway, Portugal, Singapore, South Africa, Spain, Sweden, Switzerland, Thailand, United Kingdom, United States, Uruguay, Vietnam.",
    ],
    imagePrompt:
      "Cinematic editorial portrait of a Boston-based global technology investor in a refined office at dusk, subtle world map with highlighted routes across 56 countries, travel passports and notebooks on desk, faint Paris postcard and Sciences Po 2009 reference pinned on a board, atmosphere of disciplined long-horizon research, warm amber and deep navy tones, photorealistic, high detail",
    tags: [
      "Technology Investing",
      "Global Equities",
      "Sciences Po '09",
      "56 Countries",
      "Boston",
    ],
  },

  // ──────────────────────────────────────────────────────────
  // CHAPTER 2: The $5B Strategy
  // ──────────────────────────────────────────────────────────
  {
    id: "five-billion-strategy",
    order: 2,
    title: "The $5B Strategy",
    subtitle:
      "A front-row seat to the most consequential era in technology markets — and a key role in 10x-ing the portfolio.",
    dateRange: "2015 – 2026",
    bulletPoints: [
      "Brendan was a key member of the team that scaled a global technology equity strategy from roughly $500M to over $5B in AUM — a 10x expansion driven by sustained outperformance, not asset gathering.",
      "He invested through the full cycle: pre-pandemic cloud acceleration, pandemic-era digital adoption, the 2022 rate shock, and the generative AI inflection — adapting process to each regime while maintaining conviction.",
      "He built repeatable, institutional-grade research workflows that reduced preparation time by 60% — a foreshadowing of the automation instincts he'd later apply to AI engineering.",
    ],
    imagePrompt:
      "High-end cinematic scene of a global technology equity strategy war room showing growth from $500M to $5B over a decade, multiple monitors with long-term performance curves and market regime markers (pre-pandemic, pandemic, post-pandemic), documents on software, semiconductors, and AI infrastructure, visual cue of faster research workflows with automated dashboards, institutional and precise mood, photorealistic, dramatic teal-orange lighting",
    tags: [
      "$500M → $5B",
      "19–21% CAGR",
      "Semiconductors",
      "Software",
      "AI Infrastructure",
      "Process Design",
    ],
  },

  // ──────────────────────────────────────────────────────────
  // CHAPTER 3: The Builder
  // ──────────────────────────────────────────────────────────
  {
    id: "the-builder",
    order: 3,
    title: "The Builder",
    subtitle:
      "A builder of applied AI products that solve real problems.",
    dateRange: "2022 – 2026",
    bulletPoints: [
      "Brendan is shipping full-stack AI applications (Python + TypeScript + Next.js + Vercel) integrated with frontier model APIs.",
      "He is AWS Certified (Cloud Practitioner, AI Practitioner) and Nvidia certified (GenAI/LLM Professional, Agentic AI Professional)",
      "Brendan is targeting Applied AI Engineer roles — positions where deep domain knowledge in technology markets can be applied to solve real problems.",
    ],
    projects: [
      {
        name: "Traverse",
        url: "https://traverse-mu.vercel.app/",
        description:
          "AI visa application auditor covering 37,800+ travel corridors in 100+ languages. Built for a hackathon — reviews documents like an immigration expert to catch the errors that cause preventable rejections.",
        status: "Hackathon",
      },
      {
        name: "LLM DCF Model",
        url: "https://llm-dcf.vercel.app/",
        description:
          "AI-powered discounted cash flow model generator. Select a ticker, adjust segment-level growth assumptions with real earnings context, and get a fair value estimate — institutional-grade financial modeling in the browser.",
        status: "Live",
      },
      {
        name: "Clarity 3.0",
        url: "https://bme-clarity-3.vercel.app/",
        description:
          "RAG-powered earnings analysis system. Upload transcripts, ask questions in natural language, get cited answers grounded in the source material. The research workflow Brendan wished existed for 15 years.",
        status: "Live",
      },
      {
        name: "EuroTrip Planner",
        url: "https://eurotrip-planner.vercel.app/",
        description:
          "Personalized European travel recommendations across 220+ cities with real-time weather, crowd, and seasonal event data. Data-driven trip planning from someone who's visited 56 countries.",
        status: "In Development",
      },
      {
        name: "Full Project Portfolio",
        url: "https://vercel.com/brendans-projects-5b1c1e68/bme-projects-nov2025",
        description:
          "The complete collection — every app Brendan has built and deployed.",
        status: "Portfolio",
      },
    ],
    imagePrompt:
      "Cinematic applied-AI builder workspace in Boston with dual monitors showing TypeScript, Python, Next.js, and deployed Vercel dashboards, visible project cards for AI tools in progress, certification badges for AWS and NVIDIA on a side display, notebook with role target notes for Applied AI Engineer, mood of focused execution and real-world problem solving, photorealistic, modern editorial style, rich contrast and depth",
    tags: [
      "TypeScript",
      "Next.js",
      "RAG Systems",
      "Vercel",

      "NVIDIA Cert",
  
      "Applied AI",
    ],
  },
];

// ─── Helpers ────────────────────────────────────────────────

export function getSortedChapters(): Chapter[] {
  return [...chapters].sort((a, b) => a.order - b.order);
}

export function getChapterById(id: string): Chapter | undefined {
  return chapters.find((ch) => ch.id === id);
}

export function buildResumeText(): string {
  return getSortedChapters()
    .map(
      (ch) =>
        `## ${ch.title} (${ch.dateRange})\n${ch.subtitle}\n${ch.bulletPoints.map((bp) => `- ${bp}`).join("\n")}\nSkills: ${ch.tags.join(", ")}`
    )
    .join("\n\n");
}

export function getAllTags(): string[] {
  const tagSet = new Set<string>();
  chapters.forEach((ch) => ch.tags.forEach((t) => tagSet.add(t)));
  return Array.from(tagSet).sort();
}
