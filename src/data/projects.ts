import type { ProjectCase } from "@/types";

/**
 * Flagship software projects for the dual-track story.
 * Keep these demo-first: each card should have a live URL and a repo URL.
 */
export const projectCases: ProjectCase[] = [
  {
    id: "mistral-interactive-resume",
    name: "Mistral Interactive Resume",
    oneLiner: "A bilingual, agent-native resume experience with search and visuals.",
    problem:
      "Traditional resumes fail to show technical range, product judgment, and communication depth in one place.",
    technicalScope: [
      "Next.js App Router + TypeScript",
      "Mistral Agents API + Conversations API",
      "Image generation, OCR, and semantic embeddings",
    ],
    architectureNotes: [
      "Dynamic chapter system driven from a single typed source of truth",
      "Agent instructions generated from structured profile data",
      "Client-side chat continuity with conversation IDs",
    ],
    liveUrl: "https://tone-projects.vercel.app",
    repoUrl: "https://github.com/tone2412",
    impactNote:
      "Turns profile review into an interactive due-diligence flow with natural-language exploration.",
    status: "live",
  },
  {
    id: "news-appdev",
    name: "News App",
    oneLiner: "A lightweight news exploration app focused on retrieval and clear UX.",
    problem:
      "Staying current on fast-moving tech themes requires better filtering than generic feeds.",
    technicalScope: [
      "Frontend-first product build and deployment on Vercel",
      "Structured content browsing and navigation flows",
      "Rapid iteration with production-style deployment cycles",
    ],
    architectureNotes: [
      "Built for quick user feedback loops",
      "Designed to keep interfaces simple under changing content",
    ],
    liveUrl: "https://news-appdev.vercel.app",
    repoUrl: "https://github.com/tone2412",
    impactNote:
      "Demonstrates practical shipping velocity and product thinking under ambiguity.",
    status: "live",
  },
  {
    id: "finance-bot-v1",
    name: "Finance Bot v1",
    oneLiner: "An AI assistant concept for finance-oriented Q&A and workflow support.",
    problem:
      "Finance workflows involve repetitive synthesis tasks that can be accelerated with targeted AI assistance.",
    technicalScope: [
      "Prompt orchestration for finance-style reasoning",
      "Conversational UX for quick hypothesis testing",
      "Deployed prototype for rapid experimentation",
    ],
    architectureNotes: [
      "Designed as an internal workflow accelerator concept",
      "Optimized for concise, decision-support responses",
    ],
    liveUrl: "https://finance-bot-v1.vercel.app",
    repoUrl: "https://github.com/tone2412",
    impactNote:
      "Shows direct translation of domain knowledge into practical applied-AI tooling.",
    status: "prototype",
  },
  {
    id: "llm-sfs",
    name: "LLM SFS",
    oneLiner: "An experimental LLM application for advanced prompt and response workflows.",
    problem:
      "General-purpose chat interfaces often miss domain-specific control and evaluation behavior.",
    technicalScope: [
      "LLM-first interaction design",
      "Prompt patterns for controllable outputs",
      "Iteration-friendly deployment on Vercel",
    ],
    architectureNotes: [
      "Built as an experimentation surface for model behavior",
      "Supports rapid compare-and-refine loops",
    ],
    liveUrl: "https://llm-sfs.vercel.app",
    repoUrl: "https://github.com/tone2412",
    impactNote:
      "Demonstrates technical range in practical LLM app prototyping.",
    status: "prototype",
  },
  {
    id: "project-studio",
    name: "Project Studio",
    oneLiner: "A portfolio hub used to package and present multiple deployed experiments.",
    problem:
      "Projects lose signal when they are scattered across repos and temporary demos.",
    technicalScope: [
      "Portfolio-level information architecture",
      "Deployment-driven documentation style",
      "Reusable case-study framing",
    ],
    architectureNotes: [
      "Acts as an index layer for shipped products",
      "Supports storytelling across multiple technical domains",
    ],
    liveUrl: "https://tone-projects.vercel.app",
    repoUrl: "https://github.com/tone2412",
    impactNote:
      "Creates a coherent narrative layer across finance-aware and AI-native software projects.",
    status: "live",
  },
];

