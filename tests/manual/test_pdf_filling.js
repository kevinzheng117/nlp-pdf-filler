// Test script for PDF filling API
import fs from 'fs';

const testCases = [
  {
    name: "Sample Data Test",
    data: { useSampleData: true }
  },
  {
    name: "Custom Data Test",
    data: {
      data: {
        address: '123 Main Street, Pittsburgh, PA',
        buyer: 'Jane Smith',
        seller: 'John Doe',
        date: '2025-08-11'
      }
    }
  },
  {
    name: "Partial Data Test",
    data: {
      data: {
        address: '456 Oak Avenue',
        buyer: 'ABC Corporation',
        seller: '',
        date: '2025-12-25'
      }
    }
  }
];

async function testPDFFilling() {
  console.log('🚀 Testing PDF Filling API\n');
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`\n📝 Test ${i + 1}: ${testCase.name}`);
    console.log(`Input:`, JSON.stringify(testCase.data, null, 2));
    console.log('─'.repeat(60));
    
    try {
      const response = await fetch('http://localhost:3000/api/fill-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testCase.data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }
      
      // Check if response is PDF
      const contentType = response.headers.get('content-type');
      const contentLength = response.headers.get('content-length');
      const fieldsCount = response.headers.get('x-fields-filled');
      const message = response.headers.get('x-message');
      
      console.log('✅ Success:');
      console.log(`   Content-Type: ${contentType}`);
      console.log(`   Content-Length: ${contentLength} bytes`);
      console.log(`   Fields Filled: ${fieldsCount}`);
      console.log(`   Message: ${message}`);
      
      // Save the PDF file for inspection
      const pdfBuffer = await response.arrayBuffer();
      const fileName = `filled_pdf_test_${i + 1}.pdf`;
      fs.writeFileSync(fileName, Buffer.from(pdfBuffer));
      console.log(`   📄 PDF saved as: ${fileName}`);
      
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  console.log('\n🏁 PDF Filling tests complete!');
}

// Test API documentation endpoint
async function testAPIDocumentation() {
  console.log('\n📚 Testing API Documentation (GET request)\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/fill-pdf', {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const docs = await response.json();
    console.log('✅ API Documentation:');
    console.log(JSON.stringify(docs, null, 2));
    
  } catch (error) {
    console.log('❌ Documentation Error:', error.message);
  }
}

// Run the tests
async function runAllTests() {
  await testAPIDocumentation();
  await testPDFFilling();
}

runAllTests();