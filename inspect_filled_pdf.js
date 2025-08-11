const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function inspectFilledPDF() {
  try {
    console.log('🔍 Inspecting filled PDF...\n');
    
    // Read the filled PDF file
    const pdfBytes = fs.readFileSync('./filled_pdf_test_2.pdf');
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    console.log('PDF loaded successfully!');
    console.log('Number of pages:', pdfDoc.getPageCount());
    
    // Get the PDF form
    const form = pdfDoc.getForm();
    
    // Get all form fields
    const fields = form.getFields();
    
    console.log('\n=== FILLED PDF FIELD VALUES ===');
    console.log('Total form fields:', fields.length);
    
    if (fields.length > 0) {
      console.log('\nField values:');
      fields.forEach((field, index) => {
        console.log(`${index + 1}. Field Name: "${field.getName()}"`);
        console.log(`   Field Type: ${field.constructor.name}`);
        
        // Try to get field value
        try {
          if (field.constructor.name === 'PDFTextField') {
            const currentValue = field.getText();
            console.log(`   Current Value: "${currentValue || '(empty)'}"`);
          }
        } catch (e) {
          console.log(`   Value: (unable to read)`);
        }
        console.log('');
      });
    }
    
    console.log('✅ PDF inspection complete!');
    
  } catch (error) {
    console.error('Error inspecting PDF:', error);
  }
}

// Run the inspection
inspectFilledPDF();