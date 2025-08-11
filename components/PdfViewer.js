'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Loader2, AlertCircle } from 'lucide-react';

export default function PdfViewer({ pdfBlob, loading }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isTemplate, setIsTemplate] = useState(false);

  // Create object URL from blob with proper cleanup
  useEffect(() => {
    if (pdfBlob) {
      try {
        // Cleanup previous URL
        if (pdfUrl) {
          window.URL.revokeObjectURL(pdfUrl);
        }
        
        // Create new URL with cache-busting query
        const url = window.URL.createObjectURL(pdfBlob);
        const cacheBustedUrl = `${url}?t=${Date.now()}`;
        setPdfUrl(cacheBustedUrl);
        setError(null);
        setIsTemplate(false);
        
        console.log('PDF blob loaded, size:', pdfBlob.size, 'bytes');
        
        // Cleanup function
        return () => {
          window.URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error creating PDF URL:', err);
        setError('Failed to load PDF');
      }
    } else {
      // Clear URL when no blob
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl.split('?')[0]); // Remove cache-busting query before revoking
      }
      setPdfUrl(null);
      setError(null);
      setIsTemplate(false);
    }
  }, [pdfBlob]);

  // Load template PDF from API
  const loadTemplatePDF = useCallback(async () => {
    try {
      console.log('Loading template PDF from /api/pdf');
      setError(null);
      
      const response = await fetch('/api/pdf', {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load template PDF: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      // Cleanup previous URL
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl.split('?')[0]);
      }
      
      // Create new URL with cache-busting
      const url = window.URL.createObjectURL(blob);
      const cacheBustedUrl = `${url}?t=${Date.now()}`;
      setPdfUrl(cacheBustedUrl);
      setIsTemplate(true);
      
      const pdfSize = response.headers.get('x-pdf-size') || blob.size;
      console.log(`Template PDF loaded: ${pdfSize} bytes`);
      
      return blob;
    } catch (err) {
      console.error('Error loading template PDF:', err);
      setError('Failed to load template PDF');
      return null;
    }
  }, [pdfUrl]);

  // Expose loadTemplatePDF to parent component
  useEffect(() => {
    if (window) {
      window.loadTemplatePDF = loadTemplatePDF;
    }
  }, [loadTemplatePDF]);

  return (
    <div className="glass-card rounded-2xl shadow-lg h-[600px] lg:h-[700px] overflow-hidden">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200/50">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <h2 className="text-xl font-semibold text-gray-800">PDF Preview</h2>
      </div>
      
      <div className="h-[calc(100%-88px)]">
        {loading ? (
          <div className="flex items-center justify-center h-full pdf-viewer-bg">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600 font-medium">Generating PDF...</p>
              <p className="text-gray-400 text-sm mt-1">Please wait while we fill your form</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-full bg-red-50">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-red-700 font-medium">Error Loading PDF</p>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
        ) : pdfUrl ? (
          <div className="h-full bg-gray-100">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0"
              title="PDF Preview"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full pdf-viewer-bg">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/80 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-2">No PDF Generated</p>
              <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                Extract fields from your instructions and click "Fill PDF" to generate your completed form
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}