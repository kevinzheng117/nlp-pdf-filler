import { NextResponse } from 'next/server';
import { fillPDFFields, validateExtractedData, createSampleData } from '../../../lib/pdf-filler.js';

export async function POST(request) {
  try {
    // Parse request body
    const body = await request.json();
    const { data, useSampleData } = body;
    
    let extractedData;
    
    // Use sample data if requested or if no data provided
    if (useSampleData || !data) {
      extractedData = createSampleData();
      console.log('Using sample data:', extractedData);
    } else {
      extractedData = data;
    }
    
    // Validate the extracted data
    const validation = validateExtractedData(extractedData);
    if (!validation.valid) {
      return NextResponse.json(
        { 
          error: 'Invalid data format',
          details: validation.errors 
        },
        { status: 400 }
      );
    }
    
    console.log('Filling PDF with data:', extractedData);
    
    // Fill the PDF with the extracted data
    const result = await fillPDFFields(extractedData);
    
    if (!result.success) {
      return NextResponse.json(
        { 
          error: 'Failed to fill PDF',
          details: result.error 
        },
        { status: 500 }
      );
    }
    
    // Return the filled PDF as a response
    return new NextResponse(result.pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="filled_document.pdf"',
        'Content-Length': result.pdfBytes.length.toString(),
        'X-Fields-Filled': result.fieldsCount.toString(),
        'X-Message': result.message
      }
    });
    
  } catch (error) {
    console.error('PDF filling API error:', error);
    
    // Return error response
    return NextResponse.json(
      { 
        error: 'Failed to process PDF filling request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle GET requests to provide API documentation
export async function GET() {
  return NextResponse.json(
    { 
      message: 'PDF Filling API endpoint',
      usage: 'Send POST request with extracted data to fill PDF',
      example_request: {
        data: {
          address: '123 Main Street',
          buyer: 'Jane Smith',
          seller: 'John Doe', 
          date: '2025-08-11'
        }
      },
      sample_data_request: {
        useSampleData: true
      },
      response: 'Returns filled PDF file as binary data',
      field_mapping: {
        address: 'propertyAddress',
        buyer: 'buyer',
        seller: 'seller',
        date: 'date'
      }
    },
    { status: 200 }
  );
}