import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { datePatterns } from "./patterns.js";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Helper function to determine extraction health for UX warnings
export function getExtractionHealth({
  address,
  buyer,
  seller,
  date,
  confidence,
}) {
  const hasEmptyFields = !address || !buyer || !seller || !date;
  const isLowConfidence = confidence < 0.75;

  return {
    hasIssues: hasEmptyFields || isLowConfidence,
    hasEmptyFields,
    isLowConfidence,
    filledCount: [address, buyer, seller, date].filter(
      (field) => field && field.trim()
    ).length,
    totalFields: 4,
  };
}

// Date parsing function
export function parseDate(text) {
  try {
    // Handle "today's date" or "today"
    if (/today'?s?\s+date|today/i.test(text)) {
      const today = new Date();
      return today.toISOString().split("T")[0]; // YYYY-MM-DD format
    }

    // Try various date formats
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) {
        const dateStr = match[1];

        // Parse the matched date string
        let parsedDate;

        if (dateStr.includes("/")) {
          // Handle MM/DD/YYYY or MM/DD/YY
          const parts = dateStr.split("/");
          let year = parseInt(parts[2]);
          if (year < 100) {
            year += 2000; // Convert YY to 20YY
          }
          parsedDate = new Date(
            year,
            parseInt(parts[0]) - 1,
            parseInt(parts[1])
          );
        } else if (dateStr.includes("-") && dateStr.match(/^\d{4}-/)) {
          // Handle YYYY-MM-DD
          parsedDate = new Date(dateStr);
        } else if (dateStr.includes("-")) {
          // Handle MM-DD-YYYY
          const parts = dateStr.split("-");
          parsedDate = new Date(
            parseInt(parts[2]),
            parseInt(parts[0]) - 1,
            parseInt(parts[1])
          );
        } else if (dateStr.includes("the") && dateStr.includes("day of")) {
          // Handle legal format: "the 15th day of September, 2026"
          const dayMatch = dateStr.match(/(\d{1,2})(?:st|nd|rd|th)/);
          const monthMatch = dateStr.match(/day\s+of\s+(\w+)/);
          const yearMatch = dateStr.match(/(\d{4})/);

          if (dayMatch && monthMatch && yearMatch) {
            const day = parseInt(dayMatch[1]);
            const month = monthMatch[1].toLowerCase();
            const year = parseInt(yearMatch[1]);

            const monthIndex = [
              "january",
              "february",
              "march",
              "april",
              "may",
              "june",
              "july",
              "august",
              "september",
              "october",
              "november",
              "december",
            ].indexOf(month);

            if (monthIndex >= 0) {
              parsedDate = new Date(year, monthIndex, day);
            }
          }
        } else {
          // Handle month name format
          parsedDate = new Date(dateStr);
        }

        if (parsedDate && !isNaN(parsedDate.getTime())) {
          return parsedDate.toISOString().split("T")[0]; // YYYY-MM-DD format
        }
      }
    }

    return "";
  } catch (error) {
    console.error("Date parsing error:", error);
    return "";
  }
}
