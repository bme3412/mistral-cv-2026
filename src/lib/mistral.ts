import { Mistral } from "@mistralai/mistralai";
import { buildResumeText, getSortedChapters } from "@/data/chapters";

// ============================================================
// MISTRAL CLIENT SINGLETON
// ============================================================

let _client: Mistral | null = null;

export function getMistralClient(): Mistral {
  if (!_client) {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
      throw new Error(
        "MISTRAL_API_KEY is not set. Add it to your .env.local file."
      );
    }
    _client = new Mistral({ apiKey });
  }
  return _client;
}

// ============================================================
// AGENT MANAGEMENT
// ============================================================

let _agentId: string | null = process.env.MISTRAL_AGENT_ID || null;

/**
 * Build the system instructions for the resume agent.
 * This is the agent's "personality" and knowledge base.
 */
function buildAgentInstructions(): string {
  const resumeContent = buildResumeText();
  const chapters = getSortedChapters();
  const allProjects = chapters.flatMap((chapter) =>
    (chapter.projects || []).map((project) => ({
      chapterTitle: chapter.title,
      ...project,
    }))
  );
  const projectIndex =
    allProjects.length > 0
      ? allProjects
          .map(
            (project) =>
              `- ${project.name} (${project.chapterTitle})\n  Live: ${project.url}\n  Description: ${project.description}\n  Status: ${project.status || "Unspecified"}`
          )
          .join("\n")
      : "- No project cards are currently listed in the chapter data.";

  return `You are an AI agent representing Brendan's professional experience and dual-track operating profile.
You are embedded in an interactive resume website that Brendan built to showcase real, shipped work.

## Your Role
- Answer questions about Brendan's background, skills, project work, and operating approach
- Be professional, warm, and genuinely enthusiastic about his work
- Speak in third person about Brendan (not first person)
- Keep the narrative additive: tech investing + applied AI (avoid framing it as a career switch)
- Be specific with technologies, architecture choices, and project links; avoid inventing confidential metrics
- When asked "why should we hire/accept Brendan", make a compelling case using concrete evidence from projects and operating methods

## Positioning Anchor
Brendan is a dual-track operator:
- Day-track: tech investing with strong operating range and disciplined execution process
- Night-track: applied AI products shipped publicly, with demo-first proof and technical depth
- Location and context: Boston-based, studied abroad at Sciences Po in Paris during Spring semester 2009, with a global technology lens
- Career arc highlight: helped scale a global tech equity strategy from about $500M to $5B while navigating pre-, during-, and post-pandemic regime shifts
- Technical arc highlight: learned Python during the pandemic, became an early daily AI user, and now ships deployed GenAI apps independently
- Current target: applied AI roles where domain context and software execution are both required

## Flagship Project Evidence
${projectIndex}

## Timeline Content
${resumeContent}

## Tool Usage Guidelines
- **Image Generation**: When a user asks to "visualize" something, or asks for an illustration 
  of a career chapter, or when it would enhance the conversation, generate an image using 
  the image generation tool. Use cinematic, editorial, photorealistic prompts.
- **Web Search**: When asked about current events, recent developments in AI/tech, or 
  anything that might need up-to-date information, use web search.
- **Code Interpreter**: When asked to demonstrate technical skills, run calculations, 
  or show code examples, use the code interpreter.

## Personality
- Knowledgeable and articulate, but not arrogant
- Shows genuine passion for the intersection of finance and AI
- Can discuss both high-level strategy and low-level implementation details
- Acknowledges areas of growth honestly while emphasizing learning velocity
- Occasionally surfaces interesting connections between different parts of the career journey

## Important Context
This resume is being shared as part of a Mistral AI hackathon application.
The app itself demonstrates proficiency with Mistral's Agents API, image generation,
OCR, embeddings, and streaming — all built with TypeScript and Next.js.
When relevant, mention that this app was built entirely using Mistral's API ecosystem.
When asked about projects, ONLY use projects listed in chapter data.
Do not invent repo URLs. If GitHub links are not explicitly provided, say they are not listed in the current profile data.`;
}

/**
 * Get or create the resume agent.
 * Idempotent — returns cached agent ID if already created.
 */
export async function getOrCreateAgent(): Promise<string> {
  if (_agentId) return _agentId;

  const client = getMistralClient();

  try {
    const agent = await client.beta.agents.create({
      model: "mistral-medium-latest",
      name: "Resume Agent",
      description:
        "An AI agent representing Brendan's professional experience",
      instructions: buildAgentInstructions(),
      tools: [
        { type: "web_search" },
        { type: "image_generation" },
        { type: "code_interpreter" },
      ],
    });

    _agentId = agent.id;
    console.log(`[Mistral] Agent created: ${_agentId}`);
    return _agentId;
  } catch (error) {
    console.error("[Mistral] Failed to create agent:", error);
    throw new Error("Failed to create Mistral agent");
  }
}

/**
 * Start a new conversation with the resume agent.
 */
export async function startConversation(userMessage: string) {
  const client = getMistralClient();
  const agentId = await getOrCreateAgent();

  const response = await client.beta.conversations.start({
    agentId,
    inputs: userMessage,
    store: true,
  });

  return response;
}

/**
 * Continue an existing conversation.
 */
export async function continueConversation(
  conversationId: string,
  userMessage: string
) {
  const client = getMistralClient();

  const response = await client.beta.conversations.append({
    conversationId,
    conversationAppendRequest: {
      inputs: userMessage,
    },
  });

  return response;
}

/**
 * Start a streaming conversation (for real-time chat UX).
 */
export async function startConversationStream(userMessage: string) {
  const client = getMistralClient();
  const agentId = await getOrCreateAgent();

  const stream = await client.beta.conversations.startStream({
    agentId,
    inputs: userMessage,
    store: true,
  });

  return stream;
}

/**
 * Continue a streaming conversation.
 */
export async function continueConversationStream(
  conversationId: string,
  userMessage: string
) {
  const client = getMistralClient();

  const stream = await client.beta.conversations.appendStream({
    conversationId,
    conversationAppendStreamRequest: {
      inputs: userMessage,
    },
  });

  return stream;
}

/**
 * Download an image file from Mistral's file storage.
 * Returns a base64 data URL.
 */
export async function downloadAgentImage(
  fileId: string
): Promise<string> {
  const client = getMistralClient();

  const fileBytes = await client.files.download({ fileId });
  const value = fileBytes as any;
  const isReadableStream =
    value &&
    typeof value === "object" &&
    typeof value.getReader === "function";

  let bytes: Buffer;
  if (typeof value?.arrayBuffer === "function") {
    const arrayBuffer = await value.arrayBuffer();
    bytes = Buffer.from(arrayBuffer);
  } else if (isReadableStream) {
    const arrayBuffer = await new Response(
      value as ReadableStream<Uint8Array>
    ).arrayBuffer();
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
      value.data as ReadableStream<Uint8Array>
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
      `Unsupported image download payload: ${Object.prototype.toString.call(value)}`
    );
  }

  return `data:image/png;base64,${bytes.toString("base64")}`;
}
