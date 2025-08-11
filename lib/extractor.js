import { parseDate } from "./utils.js";
import { PATTERNS, postProcessPatterns, datePatterns } from "./patterns.js";

// Span-based extraction result
class ExtractionSpan {
  constructor(value, start, end, confidence, method) {
    this.value = value;
    this.start = start;
    this.end = end;
    this.confidence = confidence;
    this.method = method;
  }
}

// Extract field with span information
function extractWithRegexAndSpan(text, fieldType) {
  const patterns = PATTERNS[fieldType] || [];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      // Get the first capture group (index 1) or the full match
      let result = match[1] || match[0];

      if (result) {
        // Use the actual match position for the span
        const start = match.index + match[0].indexOf(result);
        const end = start + result.length;

        // Apply post-processing to clean up the extracted value
        const cleaned = postProcessField(result, fieldType);

        if (cleaned.length > 2) {
          // Minimum viable result
          return new ExtractionSpan(
            cleaned,
            start,
            end,
            0.8, // High confidence for regex matches
            "regex"
          );
        }
      }
    }
  }

  return new ExtractionSpan("", -1, -1, 0.0, "none");
}

// Extract date with span information
function extractDateWithSpan(text) {
  try {
    const dateStr = parseDate(text);
    if (dateStr) {
      // Find the date span in the original text
      for (const pattern of datePatterns) {
        const match = text.match(pattern);
        if (match) {
          const start = match.index;
          const end = start + match[1].length;

          return new ExtractionSpan(dateStr, start, end, 0.9, "date_parser");
        }
      }
    }
  } catch (error) {
    console.error("Date extraction error:", error);
  }

  return new ExtractionSpan("", -1, -1, 0.0, "none");
}

// Post-processing function to clean up extracted values
function postProcessField(value, fieldType) {
  if (!value || typeof value !== "string") return "";

  // Step 1: Trim and collapse whitespace
  let cleaned = value.trim().replace(/\s+/g, " ");

  // Step 2: Strip leading phrases based on field type
  if (postProcessPatterns[fieldType]) {
    cleaned = cleaned.replace(postProcessPatterns[fieldType], "");
  }

  // Step 3: For address, cut at action verbs and prepositions if present
  if (fieldType === "address") {
    cleaned = cleaned.replace(
      /\s+(was|sold|transferred|conveyed|to|from|date)\b.*$/i,
      ""
    );
  }

  // Step 4: Strip trailing prepositions and articles
  cleaned = cleaned.replace(/\s+(to|from|by|at|in|on|the|a|an)\s*$/i, "");

  // Step 5: For buyer/seller, cut at common field boundaries
  if (fieldType === "buyer" || fieldType === "seller") {
    cleaned = cleaned.replace(/\s+(seller|buyer|address|date)\s+.*$/i, "");
  }

  // Step 6: If multiple clauses, split on delimiters and take first non-empty
  const parts = cleaned.split(/[,.;]/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.length > 0) {
      return trimmed;
    }
  }

  return cleaned;
}

// Overlap resolver with priority-based trimming
function resolveOverlaps(spans, originalText) {
  const fieldPriority = ["date", "seller", "buyer", "address"]; // Higher priority first
  const resolvedSpans = { ...spans };
  let trimmedCount = 0;

  // Sort fields by priority
  const sortedFields = fieldPriority.filter(
    (field) => resolvedSpans[field] && resolvedSpans[field].start >= 0
  );

  // Process each field in priority order
  for (let i = 0; i < sortedFields.length; i++) {
    const currentField = sortedFields[i];
    const currentSpan = resolvedSpans[currentField];

    // Check for overlaps with higher priority fields
    for (let j = 0; j < i; j++) {
      const higherPriorityField = sortedFields[j];
      const higherPrioritySpan = resolvedSpans[higherPriorityField];

      // Check if there's an overlap
      if (
        currentSpan.start < higherPrioritySpan.end &&
        currentSpan.end > higherPrioritySpan.start
      ) {
        // There's an overlap - trim the lower priority field
        let newStart = currentSpan.start;
        let newEnd = currentSpan.end;

        // Trim from the left if overlap is at the beginning
        if (currentSpan.start < higherPrioritySpan.start) {
          newEnd = higherPrioritySpan.start;
        }
        // Trim from the right if overlap is at the end
        else if (currentSpan.end > higherPrioritySpan.end) {
          newStart = higherPrioritySpan.end;
        }
        // Complete overlap - clear the field
        else {
          newStart = -1;
          newEnd = -1;
        }

        // Update the span
        if (newStart >= 0 && newEnd > newStart) {
          // Extract the trimmed text from the original source text
          const trimmedText = originalText.substring(newStart, newEnd);

          // Apply post-processing to clean up the trimmed text
          const cleaned = postProcessField(trimmedText, currentField);
          if (cleaned.length > 2) {
            resolvedSpans[currentField] = new ExtractionSpan(
              cleaned,
              newStart,
              newEnd,
              currentSpan.confidence - 0.05, // Penalty for trimming
              currentSpan.method
            );
            trimmedCount++;
          } else {
            // Trimmed result is too short, clear the field
            resolvedSpans[currentField] = new ExtractionSpan(
              "",
              -1,
              -1,
              0.0,
              "none"
            );
            trimmedCount++;
          }
        } else {
          // No meaningful content left, clear the field
          resolvedSpans[currentField] = new ExtractionSpan(
            "",
            -1,
            -1,
            0.0,
            "none"
          );
          trimmedCount++;
        }
      }
    }
  }

  return { resolvedSpans, trimmedCount };
}

// Simple rule-based extraction as fallback (without spans)
async function simpleLLMExtract(text, prompt) {
  try {
    if (prompt.includes("address")) {
      const addressMatch = text.match(
        /(?:address)\s*:?\s*([^;,\n]+?)(?:\s*[;,.]|\s*$)/i
      );
      if (addressMatch) return addressMatch[1].trim();

      const numericMatch = text.match(
        /(\d+\s+[^;,\n]+?(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\.?))\b/i
      );
      if (numericMatch) return numericMatch[1].trim();
    }

    if (prompt.includes("buyer")) {
      const buyerPatterns = [
        /(?:buyer)\s*:?\s*([^;,\n.]+?)(?:\s*[;,.]|\s*$)/i,
        /(?:buyer\s+is)\s+([^;,\n.]+)\.?/i,
      ];

      for (const pattern of buyerPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }

    if (prompt.includes("seller")) {
      const sellerPatterns = [
        /(?:seller)\s*:?\s*([^;,\n.]+?)(?:\s*[;,.]|\s*$)/i,
        /(?:seller\s+is)\s+([^;,\n.]+)\.?/i,
      ];

      for (const pattern of sellerPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }

    return "";
  } catch (error) {
    console.error("Simple LLM extract error:", error);
    return "";
  }
}

// Find span for LLM-extracted text (fallback when LLM doesn't provide spans)
function findSpanForText(text, extractedValue) {
  if (!extractedValue || !text) return { start: -1, end: -1 };

  const index = text.toLowerCase().indexOf(extractedValue.toLowerCase());
  if (index >= 0) {
    return { start: index, end: index + extractedValue.length };
  }

  return { start: -1, end: -1 };
}

// Use simple rule-based approach to fill missing fields (rules-only, no LLM)
async function fillMissingWithRules(text, currentSpans) {
  const missingFields = [];

  // Identify fields that need extraction
  Object.entries(currentSpans).forEach(([field, span]) => {
    if (field !== "confidence" && (!span.value || span.confidence < 0.5)) {
      missingFields.push(field);
    }
  });

  if (missingFields.length === 0) {
    return currentSpans;
  }

  try {
    // Use simple rule-based extraction for missing fields
    for (const field of missingFields) {
      let extractedValue = "";

      if (field === "address") {
        extractedValue = await simpleLLMExtract(text, "extract address");
      } else if (field === "buyer") {
        extractedValue = await simpleLLMExtract(text, "extract buyer");
      } else if (field === "seller") {
        extractedValue = await simpleLLMExtract(text, "extract seller");
      } else if (field === "date") {
        extractedValue = parseDate(text);
      }

      if (extractedValue && extractedValue.trim()) {
        // Apply post-processing to rule results too
        const cleaned = postProcessField(extractedValue.trim(), field);
        if (cleaned) {
          // Find span for the extracted text
          const span = findSpanForText(text, cleaned);
          currentSpans[field] = new ExtractionSpan(
            cleaned,
            span.start,
            span.end,
            0.6, // Lower confidence for fallback results
            "rules_fallback"
          );
        }
      }
    }
  } catch (error) {
    console.error("Rules fallback extraction failed:", error);
    // Keep existing results if fallback fails
  }

  return currentSpans;
}

// Main extraction function with span-based overlap resolution
async function extractFields(text) {
  try {
    console.log("Extracting fields from:", text);

    // Step 1: Try regex extraction first with spans
    const regexSpans = {
      address: extractWithRegexAndSpan(text, "address"),
      buyer: extractWithRegexAndSpan(text, "buyer"),
      seller: extractWithRegexAndSpan(text, "seller"),
      date: extractDateWithSpan(text),
    };

    console.log("Regex spans:", regexSpans);

    // Step 2: Resolve overlaps with priority-based trimming
    const { resolvedSpans, trimmedCount } = resolveOverlaps(regexSpans, text);

    console.log("Resolved spans:", resolvedSpans);
    console.log("Trimmed count:", trimmedCount);

    // Step 3: Use fallback for missing or low-confidence fields
    const finalSpans = await fillMissingWithRules(text, resolvedSpans);

    console.log("Final spans:", finalSpans);

    // Step 4: Calculate overall confidence with adjustments
    const fieldResults = Object.entries(finalSpans).filter(
      ([key]) => key !== "confidence"
    );
    const confidenceScores = fieldResults.map(
      ([, span]) => span.confidence || 0
    );

    // Base confidence: average of individual field confidences
    let overallConfidence =
      confidenceScores.length > 0
        ? confidenceScores.reduce((sum, conf) => sum + conf, 0) /
          confidenceScores.length
        : 0.0;

    // Additive confidence adjustments:

    // +0.1 if both buyer & seller found via regex (regardless of address)
    const buyerMethod = finalSpans.buyer?.method || "none";
    const sellerMethod = finalSpans.seller?.method || "none";
    const buyerValue = finalSpans.buyer?.value || "";
    const sellerValue = finalSpans.seller?.value || "";

    if (
      buyerMethod === "regex" &&
      sellerMethod === "regex" &&
      buyerValue &&
      sellerValue
    ) {
      overallConfidence += 0.1;
      console.log("Applied +0.1 bonus for both buyer & seller via regex");
    }

    // -0.1 for any rules fallback field
    const hasRulesFallbackField = fieldResults.some(
      ([, span]) => span.method === "rules_fallback"
    );
    if (hasRulesFallbackField) {
      overallConfidence -= 0.1;
      console.log("Applied -0.1 penalty for rules fallback fields");
    }

    // -0.05 if any field was trimmed due to overlap
    if (trimmedCount > 0) {
      overallConfidence -= 0.05;
      console.log("Applied -0.05 penalty for trimmed fields");
    }

    // Clamp confidence within bounds [0, 1]
    overallConfidence = Math.max(0.0, Math.min(1.0, overallConfidence));

    // Step 5: Format output with spans for debugging
    const output = {
      address: finalSpans.address?.value || "",
      buyer: finalSpans.buyer?.value || "",
      seller: finalSpans.seller?.value || "",
      date: finalSpans.date?.value || "",
      confidence: Math.round(overallConfidence * 100) / 100, // Round to 2 decimal places
      _spans: {
        address:
          finalSpans.address?.start >= 0
            ? [finalSpans.address.start, finalSpans.address.end]
            : null,
        buyer:
          finalSpans.buyer?.start >= 0
            ? [finalSpans.buyer.start, finalSpans.buyer.end]
            : null,
        seller:
          finalSpans.seller?.start >= 0
            ? [finalSpans.seller.start, finalSpans.seller.end]
            : null,
        date:
          finalSpans.date?.start >= 0
            ? [finalSpans.date.start, finalSpans.date.end]
            : null,
      },
    };

    console.log("Output:", output);
    return output;
  } catch (error) {
    console.error("Extraction error:", error);

    // Return empty result on error
    return {
      address: "",
      buyer: "",
      seller: "",
      date: "",
      confidence: 0.0,
      _spans: { address: null, buyer: null, seller: null, date: null },
    };
  }
}

// Mapping from extraction field names to PDF AcroForm field names
const FIELD_MAPPING = {
  address: "propertyAddress",
  buyer: "buyer",
  seller: "seller",
  date: "date",
};

// Helper function to map extracted fields to PDF field names
function mapToPDFFields(extractedData) {
  const pdfData = {};

  Object.entries(extractedData).forEach(([key, value]) => {
    if (FIELD_MAPPING[key] && key !== "_spans") {
      pdfData[FIELD_MAPPING[key]] = value;
    }
  });

  return pdfData;
}

// Export for CommonJS
module.exports = {
  extractFields,
  FIELD_MAPPING,
  mapToPDFFields,
};
