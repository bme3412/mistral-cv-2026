import { NextRequest, NextResponse } from "next/server";
import { parseResumeWithOCR, structureOCROutput } from "@/lib/ocr";

/**
 * POST /api/ocr
 *
 * Upload a resume document (PDF recommended) for OCR extraction.
 * Returns both raw text and structured sections.
 *
 * Body: FormData with "file" field
 * Returns: { extractedText, structuredContent }
 */
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Send a PDF or image as 'file' in FormData." },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 1: OCR extraction
    const ocrResult = await parseResumeWithOCR(buffer, file.name);

    // Step 2: Structure the raw text using Mistral chat
    const rawText =
      typeof ocrResult === "string"
        ? ocrResult
        : JSON.stringify(ocrResult, null, 2);

    const structured = await structureOCROutput(rawText);

    return NextResponse.json({
      extractedText: rawText,
      structuredContent: structured,
    });
  } catch (error: any) {
    console.error("[OCR] Error:", error);
    return NextResponse.json(
      { error: error.message || "OCR processing failed" },
      { status: 500 }
    );
  }
}
