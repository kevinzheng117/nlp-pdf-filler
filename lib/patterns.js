// Date parsing patterns
export const datePatterns = [
  // YYYY-MM-DD format
  /(\d{4}-\d{1,2}-\d{1,2})/,
  // MM/DD/YYYY or MM/DD/YY format
  /(\d{1,2}\/\d{1,2}\/\d{2,4})/,
  // Month DD, YYYY format (e.g., "June 15, 2025")
  /((?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/i,
  // Legal format: "the 15th day of September, 2026"
  /(the\s+\d{1,2}(?:st|nd|rd|th)\s+day\s+of\s+(?:january|february|march|april|may|june|july|august|september|october|november|december),?\s+\d{4})/i,
  // Alternative legal format: "effective the 15th day of September, 2026"
  /(effective\s+the\s+\d{1,2}(?:st|nd|rd|th)\s+day\s+of\s+(?:january|february|march|april|may|june|july|august|september|october|november|december),?\s+\d{4})/i,
  // MM-DD-YYYY format
  /(\d{1,2}-\d{1,2}-\d{4})/,
];

// Field extraction patterns
export const PATTERNS = {
  // Buyer patterns - with improved right boundary lookaheads
  buyer: [
    // Simple buyer is pattern (highest priority for this format)
    /(?:buyer\s+is)\s+([^,.;\n]+?)(?=\s+(?:seller|address|date|[,.;])|\s*$)/i,
    // Pipe-delimited format (highest priority)
    /(?:buyer)\s*:?\s*"([^"]+)"(?=\s*[|,.;]|\s*$)/i,
    /(?:buyer)\s*:?\s*([^|,.;\n]+?)(?=\s*[|,.;]|\s*$)/i,
    // Legal document patterns
    /(?:conveys\s+[^,.;\n]+?\s+to\s+)([^,.;\n]+?)(?=\s+(?:effective|on|[,.;])|\s*$)/i,
    // Strict boundaries without named capture (for compatibility)
    /\bto\s+([^,.;\n]+?)(?=\s+(?:on|for|under|per|from|by)\b|[,.;]|$)/i,
    /sold by .*? to ([^,.;\n]+?)(?=\s+on\b|[,.;]|$)/i,
    /grantee\s*:?\s*([^,.;\n]+?)(?=\s|[,.;]|$)/i,
    /([^,.;\n]+?)\s+(?:purchased|bought)/i,
  ],

  // Seller patterns - with improved boundaries
  seller: [
    // Simple seller is pattern (highest priority for this format)
    /(?:seller\s+is)\s+([^,.;\n]+?)(?=\s+(?:buyer|address|date|[,.;])|\s*$)/i,
    // Pipe-delimited format (highest priority)
    /(?:seller)\s*:?\s*"([^"]+)"(?=\s*[|,.;]|\s*$)/i,
    /(?:seller)\s*:?\s*([^|,.;\n]+?)(?=\s*[|,.;]|\s*$)/i,
    // Legal document patterns
    /(?:undersigned\s+seller,?\s+)([^,.;\n]+?)(?=\s+(?:hereby|to|on|[,.;])|\s*$)/i,
    /(?:seller,?\s+)([^,.;\n]+?)(?=\s+(?:hereby|to|on|[,.;])|\s*$)/i,
    /(?:seller,?\s+)([^,.;\n]+?)(?=\s+(?:hereby|to|on|[,.;])|\s*$)/i,
    // More specific legal patterns
    /(?:seller,?\s+)([^,.;\n]+?)(?=\s+hereby|\s*$)/i,
    // Legal document seller pattern
    /(?:seller,?\s+)([^,.;\n]+?)(?=\s*[,.;]|\s+hereby|\s*$)/i,
    // Strict boundaries without named capture (for compatibility)
    /\bfrom\s+([^,.;\n]+?)(?=\s+(?:to|on)\b|[,.;]|$)/i,
    /\bsold\s+by\s+([^,.;\n]+?)(?=\s+(?:to|on)\b|[,.;]|$)/i,
    /grantor\s*:?\s*([^,.;\n]+?)(?=\s|[,.;]|$)/i,
    /([^,.;\n]+?)\s+(?:sold|transferred)/i,
  ],

  // Address patterns - with action verb cutoffs
  address: [
    // Numeric address pattern with unit support (highest priority)
    /(\d+(?:-\d+)?\s+[^,.;\n]+?(?:\s+(?:st|street|ave|avenue|rd|road|blvd|boulevard|dr|drive|ln|lane|ct|court|way|pl|place|unit)\b[^,.;\n]*)?)\b(?!\s+(?:date|\d{4}))/i,
    // Pipe-delimited format
    /(?:address)\s*:?\s*([^|,.;\n]+?)(?=\s*[|,.;]|\s*$)/i,
    // Action verb boundaries without named capture (for compatibility)
    /\b(?:property\s+at|located\s+at|address|at)\s+([^,.;\n]+?)(?=\s+(?:was|sold|transferred|conveyed|to|from)\b|[,.;]|$)/i,
    /(?:address\s+is)\s+([^,.;\n]+?)(?=\s*[,.;]|\s*$)/i,
    /(?:address)\s+([^,.;\n]+?)(?=\s+(?:was|is)\b|[,.;]|$)/i,
  ],
};

// Post-processing patterns for field cleanup
export const postProcessPatterns = {
  address: /^(at\s+|address\s+)/i,
  buyer: /^(buyer(\s+is)?\s+|to\s+)/i,
  seller:
    /^(seller\s+is\s+|seller\s+|from\s+|grantor\s+|sold\s+by\s+|is\s+|:\s*)/i,
  date: /^(date\s+is\s+|date\s+|on\s+)/i,
};
