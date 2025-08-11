// Test script that demonstrates the complete extraction + PDF filling workflow
import fs from 'fs';

async function testCompleteWorkflow() {
  console.log('🚀 Testing Complete Workflow: Extract + Fill PDF\n');
  
  const testText = "The property at 456 Oak Street was sold by Acme LLC to Beta Corporation on December 25, 2025.";
  
  console.log('📝 Step 1: Extract fields from natural language');
  console.log(`Input text: "${testText}"`);
  console.log('─'.repeat(60));
  
  try {
    // Step 1: Extract fields
    const extractResponse = await fetch('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: testText })
    });
    
    if (!extractResponse.ok) {
      throw new Error(`Extract API failed: ${extractResponse.status}`);
    }
    
    const extractedData = await extractResponse.json();
    
    console.log('✅ Extraction Result:');
    console.log(`   Address: "${extractedData.address}"`);
    console.log(`   Buyer: "${extractedData.buyer}"`);
    console.log(`   Seller: "${extractedData.seller}"`);
    console.log(`   Date: "${extractedData.date}"`);
    console.log(`   Confidence: ${extractedData.confidence}`);
    
    console.log('\n📄 Step 2: Fill PDF with extracted data');
    console.log('─'.repeat(60));
    
    // Step 2: Fill PDF with extracted data
    const fillResponse = await fetch('http://localhost:3000/api/fill-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: extractedData })
    });
    
    if (!fillResponse.ok) {
      const errorData = await fillResponse.json();
      throw new Error(`Fill PDF API failed: ${JSON.stringify(errorData)}`);
    }
    
    // Check response headers
    const contentType = fillResponse.headers.get('content-type');
    const contentLength = fillResponse.headers.get('content-length');
    const fieldsCount = fillResponse.headers.get('x-fields-filled');
    const message = fillResponse.headers.get('x-message');
    
    console.log('✅ PDF Filling Result:');
    console.log(`   Content-Type: ${contentType}`);
    console.log(`   Content-Length: ${contentLength} bytes`);
    console.log(`   Fields Filled: ${fieldsCount}`);
    console.log(`   Message: ${message}`);
    
    // Save the final PDF
    const pdfBuffer = await fillResponse.arrayBuffer();
    const fileName = 'complete_workflow_result.pdf';
    fs.writeFileSync(fileName, Buffer.from(pdfBuffer));
    console.log(`   📄 Final PDF saved as: ${fileName}`);
    
    console.log('\n🎉 Complete workflow test successful!');
    console.log('✅ Natural language → Extracted fields → Filled PDF');
    
  } catch (error) {
    console.log('❌ Workflow Error:', error.message);
  }
}

// Run the test
testCompleteWorkflow();