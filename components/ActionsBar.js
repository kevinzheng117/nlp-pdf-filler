'use client';

import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { FileDown, FileText, RotateCcw, Loader2 } from 'lucide-react';

export default function ActionsBar({ 
  onFillPdf, 
  onDownloadPdf, 
  onReset, 
  loadingFill, 
  hasFields, 
  hasPdf 
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={onFillPdf}
            disabled={loadingFill || !hasFields}
            className="flex-1 min-w-[120px]"
            variant={hasFields ? "default" : "secondary"}
          >
            {loadingFill ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Filling PDF...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Fill PDF
              </>
            )}
          </Button>

          <Button
            onClick={onDownloadPdf}
            disabled={!hasPdf || loadingFill}
            variant="outline"
            className="flex-1 min-w-[120px]"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Download PDF
          </Button>

          <Button
            onClick={onReset}
            disabled={loadingFill}
            variant="ghost"
            className="min-w-[100px]"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset
          </Button>
        </div>
        
        <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
          {!hasFields && (
            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
              No fields to fill
            </span>
          )}
          {hasFields && !hasPdf && (
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
              Ready to fill PDF
            </span>
          )}
          {hasPdf && (
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
              PDF ready for download
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}