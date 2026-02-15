import { NextRequest, NextResponse } from "next/server";
import {
  startConversation,
  continueConversation,
  getOrCreateAgent,
  getMistralClient,
} from "@/lib/mistral";
import type { AgentRequest } from "@/types";

function hasOutputContent(
  output: unknown
): output is { content: unknown | unknown[] } {
  return (
    !!output &&
    typeof output === "object" &&
    "content" in output &&
    (output as any).content != null
  );
}

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
 * POST /api/agent
 *
 * Start a new conversation or continue an existing one.
 *
 * Body: { message: string, conversationId?: string }
 * Returns: { conversationId, content, imageUrl?, toolUsed? }
 *
 * For streaming, see /api/agent/stream (TODO: add streaming route)
 */
export async function POST(req: NextRequest) {
  try {
    const body: AgentRequest = await req.json();
    const { message, conversationId } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let response;

    if (conversationId) {
      // Continue existing conversation
      response = await continueConversation(conversationId, message);
    } else {
      // Start new conversation
      response = await startConversation(message);
    }

    // Extract the assistant's response content
    // The Conversations API returns outputs as an array of entries
    const outputs = response.outputs || [];
    const resolvedConversationId = response.conversationId || conversationId;
    let content = "";
    let imageUrl: string | undefined;
    let toolUsed: string | undefined;

    for (const output of outputs) {
      if (!hasOutputContent(output)) continue;

      for (const chunk of Array.isArray(output.content)
        ? output.content
        : [output.content]) {
        if (typeof chunk === "string") {
          content += chunk;
        } else if ((chunk as any)?.type === "text" && (chunk as any)?.text) {
          content += (chunk as any).text;
        } else if ((chunk as any)?.type === "tool_file") {
          // Agent generated an image
          toolUsed = "image_generation";
          const fileId = getToolFileId(chunk);

          if (!fileId) {
            console.warn("[Agent] tool_file chunk missing file id:", {
              chunkType: (chunk as any)?.type,
              chunkKeys: Object.keys(chunk as object),
            });
            continue;
          }

          try {
            const client = getMistralClient();
            const fileData = await client.files.download({
              fileId,
            });
            imageUrl = await toImageDataUrl(fileData);
          } catch (err) {
            console.error("[Agent] Failed to download generated image:", err);
          }
        }
      }
    }

    if (!resolvedConversationId) {
      return NextResponse.json(
        { error: "Conversation ID missing from response" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversationId: resolvedConversationId,
      content: content || "I'm ready to tell you about Brendan's experience. What would you like to know?",
      imageUrl,
      toolUsed,
    });
  } catch (error: any) {
    console.error("[Agent] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process request" },
      { status: 500 }
    );
  }
}
