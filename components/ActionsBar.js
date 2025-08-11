'use client';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { FileDown, FileText, RotateCcw, Loader2, FileX } from 'lucide-react';

export default function ActionsBar({ 
  onFillPdf, 
  onDownloadPdf, 
  onReset,
  onResetToTemplate, 
  loadingFill, 
  hasFields, 
  hasPdf 
}) {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={onFillPdf}
          disabled={loadingFill || !hasFields}
          className="flex-1 min-w-[140px] h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingFill ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Filling PDF...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Fill PDF
            </>
          )}
        </Button>

        <Button
          onClick={onDownloadPdf}
          disabled={!hasPdf || loadingFill}
          variant="outline"
          className="flex-1 min-w-[140px] h-12 bg-white/80 backdrop-blur-sm border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-xl shadow-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileDown className="mr-2 h-5 w-5" />
          Download PDF
        </Button>

        <Button
          onClick={onReset}
          disabled={loadingFill}
          variant="ghost"
          className="min-w-[110px] h-12 bg-white/60 backdrop-blur-sm hover:bg-white/80 text-gray-600 font-medium rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
      
      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        {!hasFields && (
          <span className="bg-orange-100 text-orange-700 px-3 py-1.5 rounded-lg font-medium">
            No fields to fill
          </span>
        )}
        {hasFields && !hasPdf && (
          <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium">
            Ready to fill PDF
          </span>
        )}
        {hasPdf && (
          <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg font-medium">
            PDF ready for download
          </span>
        )}
      </div>
    </div>
  );
}