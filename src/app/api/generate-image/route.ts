import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAgent, getMistralClient } from "@/lib/mistral";
import { getChapterById } from "@/data/chapters";
import type { ImageGenRequest } from "@/types";

function getToolFileId(chunk: unknown): string | undefined {
  const c = chunk as any;
  return (
    c?.file_id ||
    c?.fileId ||
    c?.file?.id ||
    c?.file?.file_id ||
    c?.file?.fileId ||
    c?.tool_file?.file_id ||
    c?.tool_file?.fileId
  );
}

async function toImageDataUrl(fileData: unknown): Promise<string> {
  let bytes: Buffer;
  const value = fileData as any;
  const isReadableStream =
    value &&
    typeof value === "object" &&
    typeof value.getReader === "function";

  if (typeof value?.arrayBuffer === "function") {
    const arrayBuffer = await value.arrayBuffer();
    bytes = Buffer.from(arrayBuffer);
  } else if (isReadableStream) {
    const arrayBuffer = await new Response(value as ReadableStream).arrayBuffer();
    bytes = Buffer.from(arrayBuffer);
  } else if (Buffer.isBuffer(value)) {
    bytes = value;
  } else if (value instanceof ArrayBuffer) {
    bytes = Buffer.from(value);
  } else if (ArrayBuffer.isView(value)) {
    bytes = Buffer.from(value.buffer, value.byteOffset, value.byteLength);
  } else if (Buffer.isBuffer(value?.data)) {
    bytes = value.data;
  } else if (value?.data instanceof ArrayBuffer) {
    bytes = Buffer.from(value.data);
  } else if (
    value?.data &&
    typeof value.data === "object" &&
    typeof value.data.getReader === "function"
  ) {
    const arrayBuffer = await new Response(
      value.data as ReadableStream
    ).arrayBuffer();
    bytes = Buffer.from(arrayBuffer);
  } else if (ArrayBuffer.isView(value?.data)) {
    bytes = Buffer.from(
      value.data.buffer,
      value.data.byteOffset,
      value.data.byteLength
    );
  } else if (typeof value === "string") {
    if (value.startsWith("data:image/")) return value;
    bytes = Buffer.from(value, "base64");
  } else {
    throw new Error(
      `Unsupported file download payload: ${Object.prototype.toString.call(value)}`
    );
  }

  return `data:image/png;base64,${bytes.toString("base64")}`;
}

/**
 * POST /api/generate-image
 *
 * Generate a visual for a specific resume chapter using the agent's
 * built-in FLUX1.1 [pro] Ultra image generation tool.
 *
 * Body: { chapterId: string, prompt?: string }
 * Returns: { imageUrl: string, chapterId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body: ImageGenRequest = await req.json();
    const { chapterId, prompt: customPrompt } = body;

    // Get the chapter data
    const chapter = getChapterById(chapterId);
    if (!chapter) {
      return NextResponse.json(
        { error: `Chapter "${chapterId}" not found` },
        { status: 404 }
      );
    }

    const client = getMistralClient();
    const agentId = await getOrCreateAgent();

    // Use the chapter's pre-written image prompt, or a custom override
    const imagePrompt =
      customPrompt ||
      chapter.imagePrompt ||
      `A cinematic, editorial illustration representing: ${chapter.title} — ${chapter.subtitle}`;

    // Ask the agent to generate an image
    // The agent has ImageGenerationTool enabled, so we instruct it to use it
    const response = await client.beta.conversations.start({
      agentId,
      inputs: `Please generate an image with this exact prompt (use your image generation tool): "${imagePrompt}"`,
      store: false, // Don't persist image-gen conversations
    });

    // Extract the generated image from the response
    let imageUrl: string | null = null;
    const outputs = response.outputs || [];

    for (const output of outputs) {
      if (output.content) {
        for (const chunk of Array.isArray(output.content) ? output.content : [output.content]) {
          if (typeof chunk === "object" && chunk.type === "tool_file") {
            const fileId = getToolFileId(chunk);

            if (!fileId) {
              console.warn("[ImageGen] tool_file chunk missing file id:", {
                chunkType: (chunk as any)?.type,
                chunkKeys: Object.keys(chunk as object),
              });
              continue;
            }

            try {
              const fileData = await client.files.download({
                fileId,
              });
              imageUrl = await toImageDataUrl(fileData);
            } catch (err) {
              console.error("[ImageGen] Failed to download:", err);
            }
          }
        }
      }
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image generation did not produce a result. The agent may need a different prompt." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      imageUrl,
      chapterId,
    });
  } catch (error: any) {
    console.error("[ImageGen] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate image" },
      { status: 500 }
    );
  }
}
