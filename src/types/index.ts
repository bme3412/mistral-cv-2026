// ============================================================
// CHAPTER TYPES — The core data model for resume content
// ============================================================

export interface Chapter {
  /** Unique identifier (used for scroll targets, API refs) */
  id: string;
  /** Display order (allows reordering without array position) */
  order: number;
  /** Chapter title, e.g. "The AI Pivot" */
  title: string;
  /** Short subtitle, e.g. "From Portfolio Analysis to Engineering" */
  subtitle: string;
  /** Date range string, e.g. "2023 – Present" */
  dateRange: string;
  /** Resume bullet points for this chapter */
  bulletPoints: string[];
  /** Pre-written prompt for FLUX image generation via Mistral agent */
  imagePrompt: string;
  /** Skill/technology tags */
  tags: string[];
  /** Optional: featured projects with live links */
  projects?: {
    name: string;
    url: string;
    description: string;
    /** e.g. "Hackathon", "In Development", "Live" */
    status?: string;
  }[];
  /** Optional: hex color override for this chapter's accent */
  accentColor?: string;
}

// ============================================================
// CHAT / AGENT TYPES
// ============================================================

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** If the agent generated an image, its URL goes here */
  imageUrl?: string;
  /** Tool the agent used (for UI indicators) */
  toolUsed?: "image_generation" | "web_search" | "code_interpreter";
  timestamp: number;
}

export interface ConversationState {
  conversationId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
}

// ============================================================
// API REQUEST / RESPONSE TYPES
// ============================================================

export interface AgentRequest {
  message: string;
  conversationId?: string | null;
}

export interface AgentResponse {
  conversationId: string;
  content: string;
  imageUrl?: string;
  toolUsed?: string;
}

export interface ImageGenRequest {
  chapterId: string;
  prompt: string;
}

export interface ImageGenResponse {
  imageUrl: string; // base64 data URL or served URL
  chapterId: string;
}

export interface SearchRequest {
  query: string;
  topK?: number;
}

export interface SearchResult {
  chapterId: string;
  chapterTitle: string;
  excerpt: string;
  score: number;
}

export interface SearchResponse {
  results: SearchResult[];
}

export interface OcrRequest {
  // File will be sent as FormData
}

export interface OcrResponse {
  extractedText: string;
  structuredContent: {
    sections: Array<{
      heading: string;
      content: string;
    }>;
  };
}

export type Locale = "en" | "fr";

export interface ProjectCase {
  id: string;
  name: string;
  oneLiner: string;
  problem: string;
  technicalScope: string[];
  architectureNotes: string[];
  liveUrl: string;
  repoUrl: string;
  impactNote: string;
  status: "live" | "prototype" | "in-progress";
}

export interface FinanceEvidence {
  id: string;
  title: string;
  evidence: string[];
  methods: string[];
}
