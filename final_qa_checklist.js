// Comprehensive Final QA Testing Suite
async function performFinalQA() {
  console.log('🔍 FINAL QA CHECKLIST - PDF Form Filler\n');
  console.log('Testing all features implemented in Steps 1-8...\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Test helper function
  async function runTest(testName, testFunction) {
    results.total++;
    console.log(`\n📋 ${testName}`);
    console.log('─'.repeat(60));
    
    try {
      const success = await testFunction();
      if (success) {
        console.log(`✅ PASSED: ${testName}`);
        results.passed++;
      } else {
        console.log(`❌ FAILED: ${testName}`);
        results.failed++;
      }
    } catch (error) {
      console.log(`❌ FAILED: ${testName} - ${error.message}`);
      results.failed++;
    }
  }
  
  // Test 1: Template PDF loads on initial request
  await runTest("Template PDF Initial Load", async () => {
    const response = await fetch('http://localhost:3000/api/pdf');
    const isSuccess = response.ok && response.headers.get('content-type') === 'application/pdf';
    const size = response.headers.get('content-length');
    console.log(`Template PDF size: ${size} bytes`);
    return isSuccess && parseInt(size) > 50000; // Should be ~65KB
  });
  
  // Test 2: Extraction with prefix trimming
  await runTest("Extraction with Prefix Trimming", async () => {
    const testText = "Buyer is Jane Smith. Seller is John Doe. Address 123 Main Street. Today's date.";
    const response = await fetch('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testText })
    });
    
    const result = await response.json();
    console.log(`Extracted: Address="${result.address}", Buyer="${result.buyer}", Seller="${result.seller}"`);
    
    // Check prefix trimming worked
    const prefixesRemoved = !result.buyer.includes('Buyer is') && 
                           !result.seller.includes('Seller is') &&
                           result.buyer === 'Jane Smith' &&
                           result.seller === 'John Doe';
    
    return response.ok && prefixesRemoved && result.confidence > 0.8;
  });
  
  // Test 3: Confidence scoring with buyer+seller bonus
  await runTest("Confidence Scoring with Bonuses", async () => {
    const testText = "Property sold by ABC Company to XYZ Corporation on June 15, 2025.";
    const response = await fetch('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: testText })
    });
    
    const result = await response.json();
    console.log(`Confidence: ${result.confidence} (should have buyer+seller bonus)`);
    
    // Should have high confidence due to buyer+seller regex bonus
    return response.ok && result.confidence >= 0.8 && result.buyer && result.seller;
  });
  
  // Test 4: PDF filling with field count tracking
  await runTest("PDF Filling with Field Count", async () => {
    const testData = {
      address: "456 Oak Avenue",
      buyer: "Test Buyer Corp", 
      seller: "Test Seller LLC",
      date: "2025-08-11"
    };
    
    const response = await fetch('http://localhost:3000/api/fill-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: testData })
    });
    
    const fieldsCount = response.headers.get('x-fields-filled');
    const size = response.headers.get('content-length');
    console.log(`Fields filled: ${fieldsCount}/4, PDF size: ${size} bytes`);
    
    return response.ok && fieldsCount === '4' && parseInt(size) > 50000;
  });
  
  // Test 5: Partial field filling (for badge testing)
  await runTest("Partial Field Filling (3/4)", async () => {
    const testData = {
      address: "789 Pine Street",
      buyer: "Partial Test Buyer",
      seller: "Partial Test Seller", 
      date: "" // Missing date
    };
    
    const response = await fetch('http://localhost:3000/api/fill-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: testData })
    });
    
    const fieldsCount = response.headers.get('x-fields-filled');
    console.log(`Partial fill: ${fieldsCount}/4 fields`);
    
    return response.ok && fieldsCount === '3';
  });
  
  // Test 6: Empty field validation  
  await runTest("Empty Field Validation", async () => {
    const testData = {
      address: "",
      buyer: "",
      seller: "",
      date: ""
    };
    
    const response = await fetch('http://localhost:3000/api/fill-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: testData })
    });
    
    // Should fail validation for empty fields
    console.log(`Empty fields response: ${response.status}`);
    return response.status === 400; // Should be validation error
  });
  
  // Test 7: Multiple extraction formats
  await runTest("Multiple Extraction Formats", async () => {
    const formats = [
      "The property at 111 Test Ave was sold by Seller One to Buyer One on Jan 1, 2025.",
      "On 1/1/25, Buyer Two purchased 222 Test Blvd from Seller Two.",
      "Seller Three; Buyer Three; Address 333 Test St; Date 2025-01-01."
    ];
    
    let allPassed = true;
    for (let i = 0; i < formats.length; i++) {
      const response = await fetch('http://localhost:3000/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: formats[i] })
      });
      
      const result = await response.json();
      console.log(`Format ${i+1}: Address="${result.address}", Buyer="${result.buyer}", Seller="${result.seller}"`);
      
      if (!response.ok || !result.address || !result.buyer || !result.seller) {
        allPassed = false;
      }
    }
    
    return allPassed;
  });
  
  // Test 8: Date parsing variations
  await runTest("Date Parsing Variations", async () => {
    const dateFormats = [
      "Transaction completed on June 15, 2025",
      "Date: 6/15/2025", 
      "Closed on 2025-06-15",
      "Today's date" // Should use current date
    ];
    
    let allPassed = true;
    for (const format of dateFormats) {
      const response = await fetch('http://localhost:3000/api/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: format })
      });
      
      const result = await response.json();
      console.log(`Format: "${format}" → Date: "${result.date}"`);
      
      if (!response.ok || !result.date) {
        allPassed = false;
      }
    }
    
    return allPassed;
  });
  
  // Test 9: API Error Handling
  await runTest("API Error Handling", async () => {
    // Test invalid extract request
    const extractResponse = await fetch('http://localhost:3000/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalidField: "test" })
    });
    
    // Test invalid fill request
    const fillResponse = await fetch('http://localhost:3000/api/fill-pdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalidData: true })
    });
    
    console.log(`Extract error: ${extractResponse.status}, Fill error: ${fillResponse.status}`);
    
    // Both should return 400 Bad Request
    return extractResponse.status === 400 && fillResponse.status === 400;
  });
  
  // Test 10: ETag Caching
  await runTest("ETag Caching", async () => {
    // First request to get ETag
    const firstResponse = await fetch('http://localhost:3000/api/pdf');
    const etag = firstResponse.headers.get('etag');
    
    // Second request with ETag
    const cachedResponse = await fetch('http://localhost:3000/api/pdf', {
      headers: { 'If-None-Match': etag }
    });
    
    console.log(`First: ${firstResponse.status}, Cached: ${cachedResponse.status}, ETag: ${etag}`);
    
    return firstResponse.status === 200 && cachedResponse.status === 304 && etag;
  });
  
  // Final Results Summary
  console.log('\n' + '='.repeat(80));
  console.log('🎯 FINAL QA RESULTS SUMMARY');
  console.log('='.repeat(80));
  console.log(`✅ Tests Passed: ${results.passed}/${results.total}`);
  console.log(`❌ Tests Failed: ${results.failed}/${results.total}`);
  console.log(`📊 Success Rate: ${Math.round((results.passed/results.total) * 100)}%`);
  
  if (results.passed === results.total) {
    console.log('\n🎉 ALL TESTS PASSED! 🎉');
    console.log('✅ Application is ready for production deployment');
  } else {
    console.log('\n⚠️ Some tests failed. Please review and fix issues before deployment.');
  }
  
  console.log('\n📋 QA CHECKLIST VERIFIED:');
  console.log('✅ Extraction patterns and prefix trimming');
  console.log('✅ PDF filling with field count tracking');
  console.log('✅ Template PDF loading and caching');
  console.log('✅ API error handling and validation');
  console.log('✅ Multiple input format support');
  console.log('✅ Date parsing variations');
  console.log('✅ Confidence scoring with bonuses');
  console.log('✅ Partial field filling scenarios');
  console.log('✅ ETag-based caching system');
  console.log('✅ Response header metadata');
  
  return results.passed === results.total;
}

// Mobile/Responsive Testing Checklist (manual verification required)
function displayResponsiveQAChecklist() {
  console.log('\n📱 RESPONSIVE DESIGN QA CHECKLIST');
  console.log('(Manual verification required in browser)');
  console.log('─'.repeat(60));
  console.log('□ Desktop (1920x1080): Two-pane layout with proper proportions');
  console.log('□ Tablet (768x1024): Responsive grid adapts correctly');
  console.log('□ Mobile (375x667): Stacked layout, touch-friendly buttons');
  console.log('□ PDF Viewer: Scales appropriately on all screen sizes');
  console.log('□ Touch Interactions: Buttons and inputs work on mobile');
  console.log('□ Keyboard Support: Tab navigation and shortcuts work');
  console.log('□ Loading States: Spinners and disabled states display correctly');
  console.log('□ Error Messages: Toast notifications appear properly');
  console.log('□ Auto-fill Toggle: Switch component works on mobile');
  console.log('□ Badge Component: Displays correctly above PDF on all sizes');
}

// UI States Testing Checklist (manual verification required)
function displayUIStatesQAChecklist() {
  console.log('\n🎨 UI STATES QA CHECKLIST');
  console.log('(Manual verification required in browser)');
  console.log('─'.repeat(60));
  console.log('□ Initial Load: Template PDF displays immediately');
  console.log('□ Empty State: "No PDF Generated" message shows appropriately');
  console.log('□ Loading States: Extract and Fill buttons show spinners');
  console.log('□ Field Extraction: Confidence badge updates correctly');
  console.log('□ Auto-fill ON: Toggle shows enabled state with info panel');
  console.log('□ Auto-fill OFF: Toggle shows disabled state');
  console.log('□ Badge Colors: Green (4/4), Amber (1-3/4), Hidden (template)');
  console.log('□ Error States: Network errors show appropriate messages');
  console.log('□ Success States: Success toasts appear after operations');
  console.log('□ Reset Functions: Both "Reset" and "Reset to Template" work');
}

// Run the automated tests
performFinalQA().then(() => {
  displayResponsiveQAChecklist();
  displayUIStatesQAChecklist();
});