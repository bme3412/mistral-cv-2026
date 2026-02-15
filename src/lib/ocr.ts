import { getMistralClient } from "./mistral";

/**
 * Parse a document (PDF, DOCX image, etc.) using Mistral OCR.
 * Returns extracted text and structured sections.
 *
 * Note: Mistral OCR (mistral-ocr-2505) excels at:
 * - Complex document layouts
 * - Tables and charts
 * - Interleaved images and text
 * - Mathematical expressions
 * - Handwriting
 *
 * For best results with a Word resume:
 * 1. Export the .docx as PDF first
 * 2. Upload the PDF to this endpoint
 */
export async function parseResumeWithOCR(fileBuffer: Buffer, fileName: string) {
  const client = getMistralClient();

  // Upload the file to Mistral's file storage
  const arrayBuffer = fileBuffer.buffer.slice(
    fileBuffer.byteOffset,
    fileBuffer.byteOffset + fileBuffer.byteLength
  ) as ArrayBuffer;
  const blob = new Blob([arrayBuffer]);
  const file = new File([blob], fileName);

  const uploadedFile = await client.files.upload({
    file,
    purpose: "ocr" as any,
  });

  // Process with OCR
  // Note: The exact OCR API shape may vary — check Mistral docs for latest.
  // This is the expected pattern based on their documentation.
  const ocrResult = await client.ocr.process({
    model: "mistral-ocr-2505",
    document: {
      type: "file",
      fileId: uploadedFile.id,
    },
  });

  return ocrResult;
}

/**
 * Use Mistral chat to structure raw OCR text into resume sections.
 * This takes the raw extracted text and asks the model to organize it.
 */
export async function structureOCROutput(rawText: string) {
  const client = getMistralClient();

  const response = await client.chat.complete({
    model: "mistral-small-latest",
    responseFormat: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a resume parser. Given raw OCR text from a resume document, 
extract and structure it into JSON with this schema:
{
  "name": "string",
  "title": "string",
  "sections": [
    {
      "heading": "string (e.g., 'Experience', 'Education', 'Skills')",
      "content": "string (the full text content of this section)",
      "items": [
        {
          "title": "string (job title, degree, etc.)",
          "organization": "string",
          "dateRange": "string",
          "bullets": ["string"]
        }
      ]
    }
  ]
}
Return ONLY valid JSON, no other text.`,
      },
      {
        role: "user",
        content: rawText,
      },
    ],
  });

  try {
    const content = response.choices?.[0]?.message?.content;
    if (typeof content === "string") {
      return JSON.parse(content);
    }
    return null;
  } catch {
    console.error("[OCR] Failed to parse structured output");
    return null;
  }
}
