// Test script to verify UI component functionality
const testCases = [
  "The property at 123 Main St was sold by John Doe to Jane Smith on June 15, 2025.",
  "On 6/15/25, Jane Smith purchased 123 Main St from John Doe.",
  "Seller Acme LLC; Buyer Beta Inc; Address 45 River Rd; Date 2025-06-15."
];

async function testUIWorkflow() {
  console.log('🧪 Testing UI Component Workflow\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testText = testCases[i];
    console.log(`\n📝 Test ${i + 1}:`);
    console.log(`Input: "${testText}"`);
    console.log('─'.repeat(60));
    
    try {
      // Step 1: Extract fields (simulating UI call)
      console.log('🔍 Step 1: Extracting fields...');
      const extractResponse = await fetch('http://localhost:3000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: testText })
      });

      if (!extractResponse.ok) {
        throw new Error(`Extract failed: ${extractResponse.status}`);
      }

      const extractedFields = await extractResponse.json();
      console.log('✅ Extracted fields:');
      console.log(`   Address: "${extractedFields.address}"`);
      console.log(`   Buyer: "${extractedFields.buyer}"`);
      console.log(`   Seller: "${extractedFields.seller}"`);
      console.log(`   Date: "${extractedFields.date}"`);
      console.log(`   Confidence: ${extractedFields.confidence}`);

      // Step 2: Fill PDF (simulating UI call)
      console.log('📄 Step 2: Filling PDF...');
      const fillResponse = await fetch('http://localhost:3000/api/fill-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: extractedFields })
      });

      if (!fillResponse.ok) {
        const errorData = await fillResponse.json();
        throw new Error(`Fill PDF failed: ${JSON.stringify(errorData)}`);
      }

      const fieldsCount = fillResponse.headers.get('x-fields-filled');
      const contentLength = fillResponse.headers.get('content-length');
      
      console.log('✅ PDF filled successfully:');
      console.log(`   Fields filled: ${fieldsCount}`);
      console.log(`   PDF size: ${contentLength} bytes`);
      console.log(`   Status: Ready for download/view`);

    } catch (error) {
      console.log('❌ Test failed:', error.message);
    }
  }
  
  console.log('\n🎉 UI workflow testing complete!');
  console.log('\n📋 Component State Flow Summary:');
  console.log('1. InstructionInput: Text input → Extract button → API call');
  console.log('2. ParsedFieldsCard: Display extracted fields → Allow editing');
  console.log('3. ActionsBar: Fill PDF → Download PDF → Reset buttons');
  console.log('4. PdfViewer: Display PDF blob → Enable download');
}

// Run the test
testUIWorkflow();