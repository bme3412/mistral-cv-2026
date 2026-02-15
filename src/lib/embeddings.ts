import { getMistralClient } from "./mistral";
import { getSortedChapters } from "@/data/chapters";
import type { SearchResult } from "@/types";

// ============================================================
// EMBEDDINGS CACHE
// ============================================================

interface ChapterEmbedding {
  chapterId: string;
  chapterTitle: string;
  text: string;
  embedding: number[];
}

let _embeddingsCache: ChapterEmbedding[] | null = null;

/**
 * Generate and cache embeddings for all chapter content.
 * Called once on first search request, then reused.
 */
async function getChapterEmbeddings(): Promise<ChapterEmbedding[]> {
  if (_embeddingsCache) return _embeddingsCache;

  const client = getMistralClient();
  const chapters = getSortedChapters();

  // Build searchable text for each chapter
  const chapterTexts = chapters.map((ch) => ({
    chapterId: ch.id,
    chapterTitle: ch.title,
    text: `${ch.title}. ${ch.subtitle}. ${ch.bulletPoints.join(". ")}. Skills: ${ch.tags.join(", ")}`,
  }));

  // Generate embeddings in a single batch call
  const response = await client.embeddings.create({
    model: "mistral-embed",
    inputs: chapterTexts.map((ct) => ct.text),
  });

  _embeddingsCache = chapterTexts.map((ct, i) => ({
    ...ct,
    embedding: response.data[i].embedding,
  }));

  console.log(
    `[Embeddings] Cached ${_embeddingsCache.length} chapter embeddings`
  );
  return _embeddingsCache;
}

/**
 * Cosine similarity between two vectors.
 */
function cosineSimilarity(a: number[], b: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  return denominator === 0 ? 0 : dotProduct / denominator;
}

/**
 * Semantic search over resume content.
 * Returns the topK most relevant chapters for a given query.
 */
export async function semanticSearch(
  query: string,
  topK: number = 3
): Promise<SearchResult[]> {
  const client = getMistralClient();
  const chapterEmbeddings = await getChapterEmbeddings();

  // Generate embedding for the query
  const queryResponse = await client.embeddings.create({
    model: "mistral-embed",
    inputs: [query],
  });
  const queryEmbedding = queryResponse.data[0].embedding;

  // Score each chapter by cosine similarity
  const scored = chapterEmbeddings.map((ce) => ({
    chapterId: ce.chapterId,
    chapterTitle: ce.chapterTitle,
    excerpt: ce.text.slice(0, 200) + (ce.text.length > 200 ? "…" : ""),
    score: cosineSimilarity(queryEmbedding, ce.embedding),
  }));

  // Sort by score descending and take topK
  return scored.sort((a, b) => b.score - a.score).slice(0, topK);
}

/**
 * Invalidate the embeddings cache.
 * Call this if chapters are updated at runtime (unlikely in production).
 */
export function invalidateEmbeddingsCache(): void {
  _embeddingsCache = null;
}
