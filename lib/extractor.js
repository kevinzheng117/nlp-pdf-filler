// Simple date parsing function
function parseDate(text) {
  try {
    // Handle "today's date" or "today"
    if (/today'?s?\s+date|today/i.test(text)) {
      const today = new Date();
      return today.toISOString().split('T')[0]; // YYYY-MM-DD format
    }
    
    // Try various date formats
    const datePatterns = [
      // YYYY-MM-DD format
      /(\d{4}-\d{1,2}-\d{1,2})/,
      // MM/DD/YYYY or MM/DD/YY format
      /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
      // Month DD, YYYY format (e.g., "June 15, 2025")
      /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/i,
      // MM-DD-YYYY format
      /(\d{1,2}-\d{1,2}-\d{4})/
    ];
    
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1];
        
        // Parse the matched date string
        let parsedDate;
        
        if (dateStr.includes('/')) {
          // Handle MM/DD/YYYY or MM/DD/YY
          const parts = dateStr.split('/');
          let year = parseInt(parts[2]);
          if (year < 100) {
            year += 2000; // Convert YY to 20YY
          }
          parsedDate = new Date(year, parseInt(parts[0]) - 1, parseInt(parts[1]));
        } else if (dateStr.includes('-') && dateStr.match(/^\d{4}-/)) {
          // Handle YYYY-MM-DD
          parsedDate = new Date(dateStr);
        } else if (dateStr.includes('-')) {
          // Handle MM-DD-YYYY
          const parts = dateStr.split('-');
          parsedDate = new Date(parseInt(parts[2]), parseInt(parts[0]) - 1, parseInt(parts[1]));
        } else {
          // Handle month name format
          parsedDate = new Date(dateStr);
        }
        
        if (parsedDate && !isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      }
    }
    
    return '';
  } catch (error) {
    console.error('Date parsing error:', error);
    return '';
  }
}

// Simple rule-based extraction function
async function simpleLLMExtract(text, prompt) {
  try {
    // This implements rule-based extraction as fallback
    
    if (prompt.includes('address')) {
      // Try to find address patterns
      const addressMatch = text.match(/(?:address)\s*:?\s*([^;,\n]+?)(?:\s*[;,.]|\s*$)/i);
      if (addressMatch) return addressMatch[1].trim();
      
      // Try numeric address pattern
      const numericMatch = text.match(/(\d+\s+[^;,\n]+?(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\.?))\b/i);
      if (numericMatch) return numericMatch[1].trim();
    }
    
    if (prompt.includes('buyer')) {
      // Try to find buyer patterns
      const buyerPatterns = [
        /(?:buyer)\s*:?\s*([^;,\n.]+?)(?:\s*[;,.]|\s*$)/i,
        /(?:buyer\s+is)\s+([^;,\n.]+)\.?/i
      ];
      
      for (const pattern of buyerPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    }
    
    if (prompt.includes('seller')) {
      // Try to find seller patterns  
      const sellerPatterns = [
        /(?:seller)\s*:?\s*([^;,\n.]+?)(?:\s*[;,.]|\s*$)/i,
        /(?:seller\s+is)\s+([^;,\n.]+)\.?/i
      ];
      
      for (const pattern of sellerPatterns) {
        const match = text.match(pattern);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
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
    /(?:address|property|location)\s*:?\s*([^;,\n]+?)(?:\s*[;,]|\s*$)/i,
    /(\d+\s+[^;,\n]+?(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\.?))\b/i,
    /(?:at|located at)\s+([^;,\n]+?(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place)\.?))\b/i
  ],
  
  // Buyer patterns - person or entity purchasing
  buyer: [
    /(?:buyer)\s*:?\s*([^;,\n]+?)(?:\s*[;,]|\s*$)/i,
    /(?:purchased\s+by|sold\s+to|to)\s+([^;,\n]+?)(?:\s+(?:on|from|[;,]|\n|$))/i,
    /([^;,\n]+?)\s+(?:purchased|bought)/i,
    /(?:buyer\s+is)\s+([^;,\n.]+)\.?/i
  ],
  
  // Seller patterns - person or entity selling
  seller: [
    /(?:seller)\s*:?\s*([^;,\n]+?)(?:\s*[;,]|\s*$)/i,
    /(?:sold\s+by|from)\s+([^;,\n]+?)(?:\s+(?:to|on|[;,]|\n|$))/i,
    /([^;,\n]+?)\s+(?:sold|transferred)/i,
    /(?:seller\s+is)\s+([^;,\n.]+)\.?/i
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

// Extract date using simple date parsing
function extractDate(text) {
  try {
    const dateStr = parseDate(text);
    if (dateStr) {
      return {
        value: dateStr,
        confidence: 0.9
      };
    }
  } catch (error) {
    console.error('Date extraction error:', error);
  }
  
  return {
    value: '',
    confidence: 0.0
  };
}

// Use simple rule-based approach to fill missing fields
async function fillMissingWithLLM(text, currentResults) {
  const missingFields = [];
  
  // Identify fields that need extraction
  Object.entries(currentResults).forEach(([field, result]) => {
    if (field !== 'confidence' && (!result.value || result.confidence < 0.5)) {
      missingFields.push(field);
    }
  });
  
  if (missingFields.length === 0) {
    return currentResults;
  }
  
  try {
    // Use simple rule-based extraction for missing fields
    for (const field of missingFields) {
      let extractedValue = '';
      
      if (field === 'address') {
        extractedValue = await simpleLLMExtract(text, 'extract address');
      } else if (field === 'buyer') {
        extractedValue = await simpleLLMExtract(text, 'extract buyer');
      } else if (field === 'seller') {
        extractedValue = await simpleLLMExtract(text, 'extract seller');
      } else if (field === 'date') {
        extractedValue = parseDate(text);
      }
      
      if (extractedValue && extractedValue.trim()) {
        currentResults[field] = {
          value: extractedValue.trim(),
          confidence: 0.7 // Medium confidence for fallback results
        };
      }
    }
    
  } catch (error) {
    console.error('Fallback extraction failed:', error);
    // Keep existing results if fallback fails
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
    
    // Step 2: Use fallback for missing or low-confidence fields
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