"use client";

import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import {
  ChevronDown,
  ChevronUp,
  History,
  Trash2,
  RotateCcw,
} from "lucide-react";

export default function HistoryList({ items, onReapply, onClear }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="glass-card rounded-xl p-4 shadow-sm border border-gray-200/50">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} history panel`}
        >
          <History className="h-4 w-4" />
          History
          <Badge variant="secondary" className="text-xs">
            {items.length}
          </Badge>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="h-8 px-2 text-gray-500 hover:text-red-600 hover:bg-red-50"
          aria-label="Clear history"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2">
          {items.map((text, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 rounded-lg bg-white/60 backdrop-blur-sm border border-gray-200/50 hover:bg-white/80 transition-colors"
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate pr-2">
                        {text}
                      </p>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-md">
                    <p className="text-sm">{text}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReapply(text)}
                className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 flex-shrink-0"
                aria-label={`Re-apply: ${text.substring(0, 50)}${
                  text.length > 50 ? "..." : ""
                }`}
              >
                <RotateCcw className="h-3 w-3" />
                <span className="ml-1 text-xs">Re-apply</span>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
