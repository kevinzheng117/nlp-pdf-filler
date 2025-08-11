'use client';

import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Zap, Info } from 'lucide-react';

export default function AutoFillToggle({ enabled, onChange, disabled }) {
  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <Label htmlFor="auto-fill-toggle" className="text-lg font-semibold text-gray-800 cursor-pointer">
              Auto-fill after extract
            </Label>
            <p className="text-sm text-gray-600 mt-1">
              Automatically fill PDF when fields are extracted
            </p>
          </div>
        </div>
        
        <Switch
          id="auto-fill-toggle"
          checked={enabled}
          onCheckedChange={onChange}
          disabled={disabled}
          className="data-[state=checked]:bg-yellow-500"
        />
      </div>
      
      {enabled && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Auto-fill is enabled</p>
              <p>PDFs will be generated automatically after field extraction. The manual "Fill PDF" button remains available.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}