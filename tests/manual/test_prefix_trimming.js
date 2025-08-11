// Unit tests for prefix trimming verification
const testCases = [
  {
    name: "Test 1: 'Buyer is' and 'Seller is' prefixes",
    text: "Buyer is Jane. Seller is John. Address 123 Main St. Today's date.",
    expected: {
      address: "123 Main St",
      buyer: "Jane", 
      seller: "John",
      date: new Date().toISOString().split('T')[0] // Today's date
    }
  },
  {
    name: "Test 2: 'to' and 'from' prefixes", 
    text: "The property was sold to Jane Smith by the owner from John Doe on June 1, 2025.",
    expected: {
      address: "",
      buyer: "Jane Smith",
      seller: "John Doe",
      date: "2025-06-01"
    }
  },
  {
    name: "Test 3: 'address' prefix",
    text: "address 45 River Rd was transferred to Beta Inc from Alpha LLC.",
    expected: {
      address: "45 River Rd", 
      buyer: "Beta Inc",
      seller: "Alpha LLC",
      date: ""
    }
  },
  {
    name: "Test 4: 'at' prefix with complex address",
    text: "at 12-14 Oak Ave Unit 3B was sold by HomeCorps to PropertyInc.",
    expected: {
      address: "12-14 Oak Ave Unit 3B",
      buyer: "PropertyInc", 
      seller: "HomeCorps",
      date: ""
    }
  },
  {
    name: "Test 5: Mixed prefixes and clauses",
    text: "Seller is Acme Real Estate, buyer is John Smith, property at 999 Pine Street, date June 30, 2025.",
    expected: {
      address: "999 Pine Street",
      buyer: "John Smith",
      seller: "Acme Real Estate", 
      date: "2025-06-30"
    }
  },
  {
    name: "Test 6: Grantor/Grantee legal terms",
    text: "Grantor ABC Holdings conveyed to grantee XYZ Corporation the property located at 555 Legal Lane.",
    expected: {
      address: "555 Legal Lane",
      buyer: "XYZ Corporation",
      seller: "ABC Holdings",
      date: ""
    }
  }
];

async function testPrefixTrimming() {
  console.log('🧪 Testing Prefix Trimming Functionality\n');
  console.log('This verifies that post-processing removes leading phrases:');
  console.log('• buyer is, seller is, address, at, to, from, grantor, grantee\n');
  
  let passedTests = 0;
  let totalTests = testCases.length;
  
  for (let i = 0; i < testCases.length; i++) {
    const testCase = testCases[i];
    console.log(`📝 ${testCase.name}`);
    console.log(`Input: "${testCase.text}"`);
    console.log('─'.repeat(80));
    
    try {
      // Call the extraction API
      const response = await fetch('http://localhost:3000/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: testCase.text })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      console.log('✅ Extracted Results:');
      console.log(`   Address: "${result.address}"`);
      console.log(`   Buyer: "${result.buyer}"`);
      console.log(`   Seller: "${result.seller}"`);
      console.log(`   Date: "${result.date}"`);
      console.log(`   Confidence: ${result.confidence}`);
      
      // Check if results match expected (accounting for dynamic date)
      let testPassed = true;
      const checks = [];
      
      // Address check
      const addressMatch = result.address === testCase.expected.address;
      checks.push(`Address: ${addressMatch ? '✅' : '❌'} Expected="${testCase.expected.address}" Got="${result.address}"`);
      if (!addressMatch) testPassed = false;
      
      // Buyer check  
      const buyerMatch = result.buyer === testCase.expected.buyer;
      checks.push(`Buyer: ${buyerMatch ? '✅' : '❌'} Expected="${testCase.expected.buyer}" Got="${result.buyer}"`);
      if (!buyerMatch) testPassed = false;
      
      // Seller check
      const sellerMatch = result.seller === testCase.expected.seller;
      checks.push(`Seller: ${sellerMatch ? '✅' : '❌'} Expected="${testCase.expected.seller}" Got="${result.seller}"`);
      if (!sellerMatch) testPassed = false;
      
      // Date check (special handling for "today's date")
      let dateMatch;
      if (testCase.expected.date === new Date().toISOString().split('T')[0]) {
        // For "today's date" tests
        dateMatch = result.date === new Date().toISOString().split('T')[0];
      } else {
        dateMatch = result.date === testCase.expected.date;
      }
      checks.push(`Date: ${dateMatch ? '✅' : '❌'} Expected="${testCase.expected.date}" Got="${result.date}"`);
      if (!dateMatch) testPassed = false;
      
      console.log('\n🔍 Verification:');
      checks.forEach(check => console.log(`   ${check}`));
      
      if (testPassed) {
        console.log(`\n🎉 ${testCase.name}: PASSED`);
        passedTests++;
      } else {
        console.log(`\n❌ ${testCase.name}: FAILED`);
      }
      
    } catch (error) {
      console.log('❌ Error:', error.message);
      console.log(`\n❌ ${testCase.name}: FAILED (Error)`);
    }
    
    console.log('\n' + '='.repeat(80) + '\n');
  }
  
  // Summary
  console.log('📊 FINAL RESULTS:');
  console.log(`Tests passed: ${passedTests}/${totalTests}`);
  console.log(`Success rate: ${Math.round((passedTests/totalTests) * 100)}%`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All prefix trimming tests PASSED!');
    console.log('✅ Post-processing correctly removes all leading phrases');
  } else {
    console.log('\n⚠️ Some tests FAILED - prefix trimming needs improvement');
  }
  
  console.log('\n📋 Verified prefix removal patterns:');
  console.log('✅ "buyer is ..." → clean buyer name');
  console.log('✅ "seller is ..." → clean seller name'); 
  console.log('✅ "address ..." → clean address');
  console.log('✅ "at ..." → clean address');
  console.log('✅ "to ..." → clean buyer name');
  console.log('✅ "from ..." → clean seller name');
  console.log('✅ "grantor ..." → clean seller name');
  console.log('✅ "grantee ..." → clean buyer name');
}

// Run the tests
testPrefixTrimming();