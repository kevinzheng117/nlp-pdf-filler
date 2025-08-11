import { PDFDocument } from 'pdf-lib';
import fs from 'fs';
import path from 'path';
import { FIELD_MAPPING } from './extractor.js';

// Load the original PDF template
async function loadPDFTemplate() {
  try {
    const pdfPath = path.join(process.cwd(), 'VM_Takehome_Document.pdf');
    const pdfBytes = fs.readFileSync(pdfPath);
    const pdfDoc = await PDFDocument.load(pdfBytes);
    return pdfDoc;
  } catch (error) {
    console.error('Error loading PDF template:', error);
    throw new Error('Failed to load PDF template');
  }
}

// Fill PDF form fields with extracted data
export async function fillPDFFields(extractedData) {
  try {
    console.log('Filling PDF with data:', extractedData);
    
    // Load the PDF template
    const pdfDoc = await loadPDFTemplate();
    
    // Get the PDF form
    const form = pdfDoc.getForm();
    
    // Get all available fields for debugging
    const fields = form.getFields();
    console.log('Available PDF fields:', fields.map(field => field.getName()));
    
    // Map extracted data to PDF field names using FIELD_MAPPING
    const pdfFieldData = {};
    Object.entries(extractedData).forEach(([key, value]) => {
      if (FIELD_MAPPING[key] && value) {
        pdfFieldData[FIELD_MAPPING[key]] = value;
      }
    });
    
    console.log('Mapped PDF field data:', pdfFieldData);
    
    // Fill each field
    Object.entries(pdfFieldData).forEach(([fieldName, fieldValue]) => {
      try {
        console.log(`Filling field "${fieldName}" with value "${fieldValue}"`);
        
        // Get the field by name
        const field = form.getTextField(fieldName);
        
        if (field) {
          // Set the field value
          field.setText(String(fieldValue));
          console.log(`✅ Successfully filled field "${fieldName}"`);
        } else {
          console.warn(`⚠️ Field "${fieldName}" not found in PDF`);
        }
      } catch (fieldError) {
        console.error(`❌ Error filling field "${fieldName}":`, fieldError);
      }
    });
    
    // Generate the filled PDF bytes
    const filledPdfBytes = await pdfDoc.save();
    
    console.log('✅ PDF filled successfully, size:', filledPdfBytes.length, 'bytes');
    
    return {
      success: true,
      pdfBytes: filledPdfBytes,
      fieldsCount: Object.keys(pdfFieldData).length,
      message: `Successfully filled ${Object.keys(pdfFieldData).length} fields`
    };
    
  } catch (error) {
    console.error('Error filling PDF:', error);
    return {
      success: false,
      error: error.message,
      pdfBytes: null
    };
  }
}

// Utility function to validate extracted data format
export function validateExtractedData(data) {
  const requiredFields = ['address', 'buyer', 'seller', 'date'];
  const errors = [];
  
  if (!data || typeof data !== 'object') {
    errors.push('Data must be an object');
    return { valid: false, errors };
  }
  
  // Check if at least one field has a value
  const hasData = requiredFields.some(field => data[field] && data[field].trim());
  if (!hasData) {
    errors.push('At least one field (address, buyer, seller, date) must have a value');
  }
  
  // Validate date format if provided
  if (data.date && data.date.trim()) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Helper function to create sample test data
export function createSampleData() {
  return {
    address: '123 Main Street, New York, NY',
    buyer: 'Jane Smith',
    seller: 'John Doe',
    date: '2025-08-11',
    confidence: 0.85
  };
}