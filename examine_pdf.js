const fs = require('fs');
const { PDFDocument } = require('pdf-lib');

async function examinePDF() {
  try {
    console.log('Loading VM Takehome Document.pdf...');
    
    // Read the PDF file
    const pdfBytes = fs.readFileSync('./VM_Takehome_Document.pdf');
    
    // Load the PDF
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    console.log('PDF loaded successfully!');
    console.log('Number of pages:', pdfDoc.getPageCount());
    
    // Get the PDF form (if it exists)
    const form = pdfDoc.getForm();
    
    // Get all form fields
    const fields = form.getFields();
    
    console.log('\n=== PDF FORM ANALYSIS ===');
    console.log('Total form fields found:', fields.length);
    
    if (fields.length === 0) {
      console.log('No existing AcroForm fields detected in the PDF.');
      console.log('The PDF appears to be a standard document without form fields.');
    } else {
      console.log('\nExisting AcroForm fields:');
      fields.forEach((field, index) => {
        console.log(`${index + 1}. Field Name: "${field.getName()}"`);
        console.log(`   Field Type: ${field.constructor.name}`);
        
        // Try to get field value if it exists
        try {
          if (field.constructor.name === 'PDFTextField') {
            console.log(`   Current Value: "${field.getText() || '(empty)'}"`);
          } else if (field.constructor.name === 'PDFCheckBox') {
            console.log(`   Checked State: ${field.isChecked()}`);
          } else if (field.constructor.name === 'PDFRadioGroup') {
            console.log(`   Selected Option: "${field.getSelected() || '(none)'}"`);
          }
        } catch (e) {
          console.log(`   Value: (unable to read)`);
        }
        console.log('');
      });
    }
    
    // Check pages for any text content that might indicate where fields should be
    console.log('\n=== PAGE CONTENT ANALYSIS ===');
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      console.log(`Page ${index + 1}: ${page.getWidth()}x${page.getHeight()}`);
    });
    
    console.log('\n=== CONCLUSION ===');
    if (fields.length === 0) {
      console.log('✓ PDF examination complete: No existing AcroForm fields found.');
      console.log('✓ This means we will need to programmatically create the 4 required fields:');
      console.log('  - Address');
      console.log('  - Buyer'); 
      console.log('  - Seller');
      console.log('  - Date');
    } else {
      console.log('✓ PDF examination complete: Found existing form fields.');
      console.log('✓ We can work with the existing field structure.');
    }
    
  } catch (error) {
    console.error('Error examining PDF:', error);
  }
}

// Run the examination
examinePDF();