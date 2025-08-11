'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2, FileText } from 'lucide-react';

export default function InstructionInput({ value, onChange, onExtract, loading }) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  // Debounce the input value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 500);

    return () => clearTimeout(timer);
  }, [value]);

  // Handle extract with debounced value
  const handleExtract = useCallback(() => {
    onExtract(debouncedValue);
  }, [onExtract, debouncedValue]);

  // Handle key press (Enter + Ctrl/Cmd to extract)
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleExtract();
    }
  }, [handleExtract]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Natural Language Instructions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            placeholder="Enter your instructions here, e.g., 'The property at 123 Main St was sold by John Doe to Jane Smith on June 15, 2025.'"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[120px] resize-none"
            disabled={loading}
          />
          <p className="text-sm text-muted-foreground">
            Tip: Press Ctrl+Enter to extract fields quickly
          </p>
        </div>
        
        <Button 
          onClick={handleExtract}
          disabled={loading || !value.trim()}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Extracting Fields...
            </>
          ) : (
            'Extract Fields'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}