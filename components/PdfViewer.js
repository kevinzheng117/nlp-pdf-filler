'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { FileText, Loader2, AlertCircle } from 'lucide-react';

export default function PdfViewer({ pdfBlob, loading }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);

  // Create object URL from blob
  useEffect(() => {
    if (pdfBlob) {
      try {
        const url = window.URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setError(null);
        
        // Cleanup previous URL
        return () => {
          window.URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error('Error creating PDF URL:', err);
        setError('Failed to load PDF');
      }
    } else {
      setPdfUrl(null);
      setError(null);
    }
  }, [pdfBlob]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          PDF Preview
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-80px)]">
        {loading ? (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Generating PDF...</p>
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
          <div className="h-full">
            <iframe
              src={pdfUrl}
              className="w-full h-full border-0 rounded-b-lg"
              title="PDF Preview"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground font-medium">No PDF Generated</p>
              <p className="text-muted-foreground/80 text-sm mt-1">
                Extract fields and click "Fill PDF" to generate
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}