// Test script to demonstrate extraction fixes
const testExamples = [
  {
    name: "Example 1 - Address cleanup (remove trailing phrases)",
    text: "The property at 123 Main St was sold by John Doe to Jane Smith on June 15, 2025.",
    expectedFixes: ["Address should be '123 Main St' (not include trailing phrases)"]
  },
  {
    name: "Example 2 - Seller from 'from' pattern",
    text: "On 6/15/25, Jane Smith purchased 123 Main St from John Doe.",
    expectedFixes: ["Seller should be 'John Doe' (captured from 'from John Doe')"]
  },
  {
    name: "Example 3 - Semicolon format with post-processing",
    text: "Seller Acme LLC; Buyer Beta Inc; Address 45 River Rd; Date 2025-06-15.",
    expectedFixes: ["All fields should be clean without prefixes"]
  },
  {
    name: "Example 4 - Confidence scoring with missing field",
    text: "123 Main Street, Pittsburgh transferred from Acme LLC to Beta Inc.",
    expectedFixes: ["Lower confidence due to missing date"]
  },
  {
    name: "Example 5 - Complex seller/buyer pattern",
    text: "Property sold by John Smith LLC to Jane Corporation on 2025-08-15.",
    expectedFixes: ["Both buyer and seller captured via regex (+0.1 confidence bonus)"]
  }
];

async function testExtractionFixes() {
  console.log('🔧 Testing Extraction Fixes\n');
  
  for (let i = 0; i < testExamples.length; i++) {
    const example = testExamples[i];
    console.log(`\n📝 ${example.name}`);
    console.log(`Input: "${example.text}"`);
    console.log('Expected fixes:', example.expectedFixes.join(', '));
    console.log('─'.repeat(80));
    
    try {
      const response = await fetch('http://localhost:3000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: example.text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log('✅ Result:');
      console.log(`   Address: "${result.address}"`);
      console.log(`   Buyer: "${result.buyer}"`);
      console.log(`   Seller: "${result.seller}"`);
      console.log(`   Date: "${result.date}"`);
      console.log(`   Confidence: ${result.confidence}`);
      
      // Analysis
      if (i === 0) {
        const addressIsClean = !result.address.includes('was sold') && !result.address.includes('to Jane');
        console.log(`   🎯 Address cleanup: ${addressIsClean ? '✅ FIXED' : '❌ NEEDS WORK'}`);
      }
      
      if (i === 1) {
        const sellerCaptured = result.seller === 'John Doe';
        console.log(`   🎯 Seller from 'from' pattern: ${sellerCaptured ? '✅ FIXED' : '❌ NEEDS WORK'}`);
      }
      
      if (i === 4) {
        const highConfidence = result.confidence >= 0.9;
        console.log(`   🎯 Confidence bonus for both buyer/seller: ${highConfidence ? '✅ APPLIED' : '❌ NOT APPLIED'}`);
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  console.log('\n🏁 Extraction fixes testing complete!');
  
  console.log('\n📋 Summary of Improvements:');
  console.log('✅ Non-greedy regex patterns that stop at delimiters');
  console.log('✅ Post-processing removes leading phrases (at, buyer is, seller is)');
  console.log('✅ Multiple clause handling splits on [,.;] and takes first');
  console.log('✅ Improved confidence scoring with bonuses and penalties');
  console.log('✅ Better seller capture from "from ..." patterns');
  console.log('✅ Cleaner address extraction without trailing content');
}

// Run the test
testExtractionFixes();