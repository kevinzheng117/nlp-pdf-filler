// Test script for extraction API
const testExamples = [
  "The property at 123 Main St was sold by John Doe to Jane Smith on June 15, 2025.",
  "On 6/15/25, Jane Smith purchased 123 Main St from John Doe.",
  "Seller Acme LLC; Buyer Beta Inc; Address 45 River Rd; Date 2025-06-15.",
  "123 Main Street, Pittsburgh transferred from Acme LLC to Beta Inc.", // date missing
  "Buyer is Jane. Seller is John. Address 123 Main St. Today's date."
];

async function testExtraction() {
  console.log('🚀 Testing Extraction API\n');
  
  for (let i = 0; i < testExamples.length; i++) {
    const text = testExamples[i];
    console.log(`\n📝 Test ${i + 1}:`);
    console.log(`Input: "${text}"`);
    console.log('─'.repeat(60));
    
    try {
      const response = await fetch('http://localhost:3000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
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
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  console.log('\n🏁 Testing complete!');
}

// Run the test
testExtraction();