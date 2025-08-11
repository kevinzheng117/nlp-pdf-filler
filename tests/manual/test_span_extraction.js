const { extractFields } = require("./lib/extractor.js");

// Test cases from the requirements
const TEST_CASES = [
  {
    name: "1. Buyer tail in address",
    text: "January 20, 2028: Robert Wilson transferred ownership of 90 Sunset Blvd to Angela White.",
    expected: {
      date: "2028-01-20",
      seller: "Robert Wilson",
      buyer: "Angela White",
      address: "90 Sunset Blvd",
    },
  },
  {
    name: "2. Seller tail in address",
    text: "On 6/15/25, Jane Smith purchased 123 Main St from John Doe.",
    expected: {
      date: "2025-06-15",
      buyer: "Jane Smith",
      seller: "John Doe",
      address: "123 Main St",
    },
  },
  {
    name: "3. Legal phrasing + action verb cut",
    text: "The undersigned seller, Red Rock Holdings, hereby conveys 22 Pine Ct to Blue Lake Ventures effective the 15th day of September, 2026.",
    expected: {
      seller: "Red Rock Holdings",
      buyer: "Blue Lake Ventures",
      address: "22 Pine Ct",
      date: "2026-09-15",
    },
  },
  {
    name: "4. Prefixes to trim",
    text: "Buyer is Emily Chen. Seller is Omar Khan. Address 500 Oak Ave. Date 2025-12-01.",
    expected: {
      buyer: "Emily Chen",
      seller: "Omar Khan",
      address: "500 Oak Ave",
      date: "2025-12-01",
    },
  },
  {
    name: "5. Grantor/Grantee terms",
    text: "Grantor: Acme LLC; Grantee: Beta Inc; Property at 45 River Rd; Closing on 03/02/2024.",
    expected: {
      seller: "Acme LLC",
      buyer: "Beta Inc",
      address: "45 River Rd",
      date: "2024-03-02",
    },
  },
  {
    name: "6. Noise before the signal",
    text: "It rained yesterday, but Sarah Lee sold the property at 14 Cherry Lane to Michael Jordan on April 5, 2027.",
    expected: {
      seller: "Sarah Lee",
      buyer: "Michael Jordan",
      address: "14 Cherry Lane",
      date: "2027-04-05",
    },
  },
  {
    name: "7. Lowercase & compact",
    text: "buyer is maria gomez seller is liam jones address 301 king st date 2026-06-30",
    expected: {
      buyer: "maria gomez",
      seller: "liam jones",
      address: "301 king st",
      date: "2026-06-30",
    },
  },
  {
    name: "8. Multiple delimiters",
    text: 'Buyer: "Peter Parker" | Seller: "Bruce Wayne" | Address: 177A Bleecker St | Date: 05/05/2029',
    expected: {
      buyer: "Peter Parker",
      seller: "Bruce Wayne",
      address: "177A Bleecker St",
      date: "2029-05-05",
    },
  },
  {
    name: "9. Missing date (should not leak)",
    text: "123 Main Street transferred from Acme LLC to Beta Inc.",
    expected: {
      address: "123 Main Street",
      seller: "Acme LLC",
      buyer: "Beta Inc",
      date: "",
    },
  },
  {
    name: "10. Ambiguous names near address",
    text: "At 12-14 Oak Ave Unit 3B, HomeCorps sold to PropertyInc on 08/01/2025.",
    expected: {
      address: "12-14 Oak Ave Unit 3B",
      seller: "HomeCorps",
      buyer: "PropertyInc",
      date: "2025-08-01",
    },
  },
];

// Helper function to compare results
function compareResults(actual, expected, testName) {
  console.log(`\n=== ${testName} ===`);
  console.log("Expected:", expected);
  console.log("Actual:  ", {
    address: actual.address,
    buyer: actual.buyer,
    seller: actual.seller,
    date: actual.date,
  });
  console.log("Spans:   ", actual._spans);
  console.log("Confidence:", actual.confidence);

  const fields = ["address", "buyer", "seller", "date"];
  let passed = true;

  for (const field of fields) {
    if (actual[field] !== expected[field]) {
      console.log(
        `❌ ${field}: expected "${expected[field]}", got "${actual[field]}"`
      );
      passed = false;
    } else {
      console.log(`✅ ${field}: "${actual[field]}"`);
    }
  }

  return passed;
}

// Run all tests
async function runTests() {
  console.log("🧪 Testing Span-Based Extraction with Overlap Resolution\n");

  let passedTests = 0;
  let totalTests = TEST_CASES.length;

  for (const testCase of TEST_CASES) {
    try {
      const result = await extractFields(testCase.text);
      const passed = compareResults(result, testCase.expected, testCase.name);

      if (passed) {
        passedTests++;
      }

      console.log(passed ? "✅ PASSED" : "❌ FAILED");
    } catch (error) {
      console.log(`\n=== ${testCase.name} ===`);
      console.error("❌ ERROR:", error.message);
    }
  }

  console.log(`\n📊 Test Results: ${passedTests}/${totalTests} tests passed`);

  if (passedTests === totalTests) {
    console.log(
      "🎉 All tests passed! Span-based extraction is working correctly."
    );
  } else {
    console.log("⚠️  Some tests failed. Check the output above for details.");
  }
}

// Additional edge case tests
const EDGE_CASES = [
  {
    name: "Edge Case: Complete overlap",
    text: "John Doe sold 123 Main St to John Doe on 2025-01-01",
    expected: {
      seller: "John Doe",
      buyer: "John Doe",
      address: "123 Main St",
      date: "2025-01-01",
    },
  },
  {
    name: "Edge Case: Partial overlap at start",
    text: "Robert Johnson sold 456 Oak Ave to Johnson LLC on 2025-02-15",
    expected: {
      seller: "Robert Johnson",
      buyer: "Johnson LLC",
      address: "456 Oak Ave",
      date: "2025-02-15",
    },
  },
  {
    name: "Edge Case: Multiple addresses",
    text: "Property at 123 First St was sold by ABC Corp to XYZ Inc, but the actual address is 456 Second Ave on 2025-03-20",
    expected: {
      seller: "ABC Corp",
      buyer: "XYZ Inc",
      address: "123 First St", // Should get the first one
      date: "2025-03-20",
    },
  },
];

async function runEdgeCaseTests() {
  console.log("\n🧪 Testing Edge Cases\n");

  let passedTests = 0;
  let totalTests = EDGE_CASES.length;

  for (const testCase of EDGE_CASES) {
    try {
      const result = await extractFields(testCase.text);
      const passed = compareResults(result, testCase.expected, testCase.name);

      if (passed) {
        passedTests++;
      }

      console.log(passed ? "✅ PASSED" : "❌ FAILED");
    } catch (error) {
      console.log(`\n=== ${testCase.name} ===`);
      console.error("❌ ERROR:", error.message);
    }
  }

  console.log(
    `\n📊 Edge Case Results: ${passedTests}/${totalTests} tests passed`
  );
}

// Run the tests
async function main() {
  await runTests();
  await runEdgeCaseTests();
}

// Run the tests
main().catch(console.error);
