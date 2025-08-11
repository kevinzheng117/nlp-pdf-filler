import { NextResponse } from "next/server";
import { extractFields } from "../../../lib/extractor.js";

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Text parameter is required and must be a string" },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json(
        { error: "Text parameter cannot be empty" },
        { status: 400 }
      );
    }

    console.log("Extraction request received:", text);

    // Extract fields using rules-first approach with LLM fallback
    const result = await extractFields(text);

    console.log("Extraction result:", result);

    // Filter out debug spans for frontend consumption
    const { _spans, ...frontendResult } = result;

    // Return the structured result (without spans)
    return NextResponse.json(frontendResult);
  } catch (error) {
    console.error("API extraction error:", error);

    // Return error response
    return NextResponse.json(
      {
        error: "Failed to process extraction request",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      message:
        'Extract API endpoint. Use POST with { "text": "your text here" }',
      example: {
        text: "The property at 123 Main St was sold by John Doe to Jane Smith on June 15, 2025.",
      },
      response_format: {
        address: "string or empty",
        buyer: "string or empty",
        seller: "string or empty",
        date: "YYYY-MM-DD or empty",
        confidence: "0.0 to 1.0",
        _spans: "debug info (filtered out in production)",
      },
    },
    { status: 200 }
  );
}
