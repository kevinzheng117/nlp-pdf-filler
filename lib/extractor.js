// Simple date extraction and LLM service
async function simpleLLMExtract(text, prompt) {
  try {
    // For now, implement a simple rule-based fallback
    // In a production environment, you would integrate with actual LLM service
    
    // This is a simplified fallback that tries to extract based on common patterns
    const lowerText = text.toLowerCase();
    
    if (prompt.includes('address')) {
      // Try to find address patterns
      const addressMatch = text.match(/(?:address|property|location|at)\s*:?\s*([^,\n]+(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\b)?)/i);
      if (addressMatch) return addressMatch[1].trim();
      
      // Try numeric address pattern
      const numericMatch = text.match(/(\d+\s+[^,\n]+(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\b)?)/i);
      if (numericMatch) return numericMatch[1].trim();
    }
    
    if (prompt.includes('buyer')) {
      // Try to find buyer patterns
      const buyerMatch = text.match(/(?:buyer|purchased?\s+by|sold\s+to|to)\s*:?\s*([^,\n]+?)(?:\s+(?:on|from|,|\n|$))/i);
      if (buyerMatch) return buyerMatch[1].trim();
    }
    
    if (prompt.includes('seller')) {
      // Try to find seller patterns  
      const sellerMatch = text.match(/(?:seller|sold\s+by|from)\s*:?\s*([^,\n]+?)(?:\s+(?:to|on|,|\n|$))/i);
      if (sellerMatch) return sellerMatch[1].trim();
    }
    
    return '';
  } catch (error) {
    console.error('Simple LLM extract error:', error);
    return '';
  }
}

// Regex patterns for different fields
const PATTERNS = {
  // Address patterns - looking for street addresses
  address: [
    /(?:address|property|location|at)\s*:?\s*([^,\n]+(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\b[^,\n]*)?)/i,
    /(\d+\s+[^,\n]+(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\b[^,\n]*)?)/i,
    /(?:property|located)\s+(?:at\s+)?([^,\n]+(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\b[^,\n]*)?)/i
  ],
  
  // Buyer patterns - person or entity purchasing
  buyer: [
    /(?:buyer|purchased?\s+by|sold\s+to|to)\s*:?\s*([^,\n]+?)(?:\s+(?:on|from|,|\n|$))/i,
    /([^,\n]+?)\s+(?:purchased|bought)/i,
    /sold\s+to\s+([^,\n]+?)(?:\s+(?:on|from|,|\n|$))/i
  ],
  
  // Seller patterns - person or entity selling
  seller: [
    /(?:seller|sold\s+by|from)\s*:?\s*([^,\n]+?)(?:\s+(?:to|on|,|\n|$))/i,
    /([^,\n]+?)\s+(?:sold|transferred)/i,
    /from\s+([^,\n]+?)(?:\s+(?:to|on|,|\n|$))/i
  ]
};

// Extract using regex patterns
function extractWithRegex(text, fieldType) {
  const patterns = PATTERNS[fieldType] || [];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const result = match[1].trim();
      // Clean up common issues
      const cleaned = result
        .replace(/^(the|a|an)\s+/i, '') // Remove articles
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      if (cleaned.length > 2) { // Minimum viable result
        return {
          value: cleaned,
          confidence: 0.8 // High confidence for regex matches
        };
      }
    }
  }
  
  return {
    value: '',
    confidence: 0.0
  };
}

// Extract date using chrono-node
function extractDate(text) {
  try {
    // Handle "today's date" or "today"
    if (/today'?s?\s+date|today/i.test(text)) {
      const today = new Date();
      return {
        value: today.toISOString().split('T')[0], // YYYY-MM-DD format
        confidence: 1.0
      };
    }
    
    const parsed = chrono.parseDate(text);
    if (parsed) {
      return {
        value: parsed.toISOString().split('T')[0], // YYYY-MM-DD format
        confidence: 0.9
      };
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }
  
  return {
    value: '',
    confidence: 0.0
  };
}

// Use LLM to fill missing or low-confidence fields
async function fillMissingWithLLM(text, currentResults) {
  const missingFields = [];
  
  // Identify fields that need LLM extraction
  Object.entries(currentResults).forEach(([field, result]) => {
    if (field !== 'confidence' && (!result.value || result.confidence < 0.5)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length === 0) {
    return currentResults;
  }
  
  try {
    const prompt = `Extract the following information from the text and return ONLY a valid JSON object with these exact keys: ${missingFields.join(', ')}.

Rules:
- address: Street address or property location
- buyer: Person or entity purchasing/acquiring the property  
- seller: Person or entity selling/transferring the property
- date: Date in YYYY-MM-DD format, or empty string if no date found

Return ONLY the JSON object, no other text:`;

    const llmResponse = await extractWithLLM(text, prompt);
    
    // Try to parse the LLM response as JSON
    const llmData = JSON.parse(llmResponse);
    
    // Update results with LLM data for missing fields
    missingFields.forEach(field => {
      if (llmData[field] && llmData[field].trim()) {
        currentResults[field] = {
          value: llmData[field].trim(),
          confidence: 0.7 // Medium confidence for LLM results
        };
      }
    });
    
  } catch (error) {
    console.error('LLM extraction failed:', error);
    // Keep existing results if LLM fails
  }
  
  return currentResults;
}

// Main extraction function
export async function extractFields(text) {
  try {
    console.log('Extracting fields from:', text);
    
    // Step 1: Try regex extraction first
    const regexResults = {
      address: extractWithRegex(text, 'address'),
      buyer: extractWithRegex(text, 'buyer'), 
      seller: extractWithRegex(text, 'seller'),
      date: extractDate(text)
    };
    
    console.log('Regex results:', regexResults);
    
    // Step 2: Use LLM for missing or low-confidence fields
    const finalResults = await fillMissingWithLLM(text, regexResults);
    
    console.log('Final results:', finalResults);
    
    // Step 3: Calculate overall confidence
    const confidenceScores = Object.values(finalResults)
      .filter(result => result.confidence !== undefined)
      .map(result => result.confidence);
    
    const overallConfidence = confidenceScores.length > 0 
      ? confidenceScores.reduce((sum, conf) => sum + conf, 0) / confidenceScores.length 
      : 0.0;
    
    // Step 4: Format output according to spec
    const output = {
      address: finalResults.address.value || '',
      buyer: finalResults.buyer.value || '',
      seller: finalResults.seller.value || '',
      date: finalResults.date.value || '',
      confidence: Math.round(overallConfidence * 100) / 100 // Round to 2 decimal places
    };
    
    console.log('Output:', output);
    return output;
    
  } catch (error) {
    console.error('Extraction error:', error);
    
    // Return empty result on error
    return {
      address: '',
      buyer: '',
      seller: '',
      date: '',
      confidence: 0.0
    };
  }
}

// Mapping from extraction field names to PDF AcroForm field names
export const FIELD_MAPPING = {
  address: 'propertyAddress',
  buyer: 'buyer',
  seller: 'seller', 
  date: 'date'
};

// Helper function to map extracted fields to PDF field names
export function mapToPDFFields(extractedData) {
  const pdfData = {};
  
  Object.entries(extractedData).forEach(([key, value]) => {
    if (FIELD_MAPPING[key]) {
      pdfData[FIELD_MAPPING[key]] = value;
    }
  });
  
  return pdfData;
}