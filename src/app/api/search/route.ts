import { NextRequest, NextResponse } from "next/server";
import { semanticSearch } from "@/lib/embeddings";
import type { SearchRequest } from "@/types";

/**
 * POST /api/search
 *
 * Semantic search over resume chapters using Mistral embeddings.
 *
 * Body: { query: string, topK?: number }
 * Returns: { results: SearchResult[] }
 */
export async function POST(req: NextRequest) {
  try {
    const body: SearchRequest = await req.json();
    const { query, topK = 3 } = body;

    if (!query || typeof query !== "string") {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    const results = await semanticSearch(query, topK);

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("[Search] Error:", error);
    return NextResponse.json(
      { error: error.message || "Search failed" },
      { status: 500 }
    );
  }
}
