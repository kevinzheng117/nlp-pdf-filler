import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Cache the template PDF data and ETag on startup
let templatePdfCache = null;
let templateETag = null;

function loadTemplatePDF() {
  if (!templatePdfCache) {
    try {
      const pdfPath = path.join(process.cwd(), 'VM_Takehome_Document.pdf');
      templatePdfCache = fs.readFileSync(pdfPath);
      
      // Generate ETag based on file content
      const hash = crypto.createHash('md5').update(templatePdfCache).digest('hex');
      templateETag = `"${hash}"`;
      
      console.log(`Template PDF loaded: ${templatePdfCache.length} bytes, ETag: ${templateETag}`);
    } catch (error) {
      console.error('Error loading template PDF:', error);
      throw new Error('Template PDF not found');
    }
  }
  return { data: templatePdfCache, etag: templateETag };
}

export async function GET(request) {
  try {
    console.log('Template PDF requested via GET /api/pdf');
    
    // Load the template PDF
    const { data: pdfData, etag } = loadTemplatePDF();
    
    // Check if client has cached version (If-None-Match header)
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      console.log('Client has cached version, returning 304');
      return new NextResponse(null, { status: 304 });
    }
    
    // Return the template PDF with proper headers
    return new NextResponse(pdfData, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="template.pdf"',
        'Content-Length': pdfData.length.toString(),
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'ETag': etag,
        'X-PDF-Type': 'template',
        'X-PDF-Size': pdfData.length.toString()
      }
    });
    
  } catch (error) {
    console.error('Error serving template PDF:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to load template PDF',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle HEAD requests for caching
export async function HEAD(request) {
  try {
    const { data: pdfData, etag } = loadTemplatePDF();
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': pdfData.length.toString(),
        'Cache-Control': 'public, max-age=0, must-revalidate',
        'ETag': etag,
        'X-PDF-Type': 'template'
      }
    });
  } catch (error) {
    return new NextResponse(null, { status: 500 });
  }
}