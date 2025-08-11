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
    <div className="glass-card rounded-2xl p-6 shadow-lg">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-2 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <FileText className="h-4 w-4 text-white" />
          </div>
          Natural Language Instructions
        </h2>
        <p className="text-gray-600 text-sm">
          Describe your property transaction in plain English
        </p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-3">
          <Textarea
            placeholder="Example: The property at 123 Main St was sold by John Doe to Jane Smith on June 15, 2025."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyPress}
            className="min-h-[140px] resize-none border-gray-200 bg-white/80 backdrop-blur-sm rounded-xl text-gray-700 placeholder:text-gray-400 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 flex items-center gap-2">
            <span className="w-4 h-4 rounded bg-blue-100 flex items-center justify-center text-blue-600 text-[10px] font-medium">⌘</span>
            Press Ctrl+Enter to extract fields quickly
          </p>
        </div>
        
        <Button 
          onClick={handleExtract}
          disabled={loading || !value.trim()}
          className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Extracting Fields...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Extract Fields
            </>
          )}
        </Button>
      </div>
    </div>
  );
}