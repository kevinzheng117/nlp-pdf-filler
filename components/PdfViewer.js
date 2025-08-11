"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileText, Loader2, AlertCircle } from "lucide-react";

export default function PdfViewer({ pdfBlob, loading }) {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [error, setError] = useState(null);
  const [isTemplate, setIsTemplate] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(false);

  // Create object URL from blob with proper cleanup
  useEffect(() => {
    if (pdfBlob) {
      try {
        // Cleanup previous URL
        if (pdfUrl) {
          window.URL.revokeObjectURL(pdfUrl);
        }

        // Create new URL without cache-busting (more stable for iframe)
        const url = window.URL.createObjectURL(pdfBlob);
        setPdfUrl(url);
        setError(null);
        setIsTemplate(false);

        // Cleanup function
        return () => {
          window.URL.revokeObjectURL(url);
        };
      } catch (err) {
        console.error("Error creating PDF URL:", err);
        setError("Failed to load PDF");
      }
    } else {
      // Clear URL when no blob
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }
      setPdfUrl(null);
      setError(null);
      setIsTemplate(false);
    }
  }, [pdfBlob]);

  // Load template PDF from API
  const loadTemplatePDF = useCallback(async () => {
    try {
      setError(null);
      setTemplateLoading(true);

      const response = await fetch("/api/pdf", {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load template PDF: ${response.status}`);
      }

      const blob = await response.blob();

      // Cleanup previous URL
      if (pdfUrl) {
        window.URL.revokeObjectURL(pdfUrl);
      }

      // Create new URL without cache-busting (more stable for iframe)
      const url = window.URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsTemplate(true);

      const pdfSize = response.headers.get("x-pdf-size") || blob.size;
      setTemplateLoading(false);

      return blob;
    } catch (err) {
      console.error("Error loading template PDF:", err);
      setError("Failed to load template PDF");
      setTemplateLoading(false);
      return null;
    }
  }, []); // Remove pdfUrl dependency to prevent infinite re-renders

  // Load template PDF automatically on mount if no PDF blob is provided
  useEffect(() => {
    if (!pdfBlob && !pdfUrl) {
      loadTemplatePDF();
    }
  }, []); // Only run on mount

  return (
    <div className="glass-card rounded-2xl shadow-lg h-[600px] lg:h-[700px] overflow-hidden">
      <div className="flex items-center gap-3 p-6 border-b border-gray-200/50">
        <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
          <FileText className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800">PDF Preview</h2>
          {isTemplate && (
            <p className="text-sm text-green-600 font-medium">
              Template • Ready to fill
            </p>
          )}
          {pdfUrl && !isTemplate && (
            <p className="text-sm text-blue-600 font-medium">
              Filled • Ready to download
            </p>
          )}
        </div>
      </div>

      <div className="h-[calc(100%-88px)]">
        {loading || templateLoading ? (
          <div className="flex items-center justify-center h-full pdf-viewer-bg">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-500" />
              <p className="text-gray-600 font-medium">Generating PDF...</p>
              <p className="text-gray-400 text-sm mt-1">
                Please wait while we fill your form
              </p>
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
            <embed
              src={pdfUrl}
              type="application/pdf"
              className="w-full h-full border-0"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full pdf-viewer-bg">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/80 rounded-2xl flex items-center justify-center shadow-lg">
                <FileText className="h-10 w-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium text-lg mb-2">
                No PDF Generated
              </p>
              <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                Extract fields from your instructions and click "Fill PDF" to
                generate your completed form
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
