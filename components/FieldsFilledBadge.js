'use client';

import { Badge } from './ui/badge';
import { CheckCircle2, AlertCircle, Circle } from 'lucide-react';

export default function FieldsFilledBadge({ fieldsCount, isTemplate, isVisible }) {
  // Don't render if not visible or no fill attempt made
  if (!isVisible || fieldsCount === null || fieldsCount === undefined) {
    return null;
  }

  // Don't show badge when viewing template (unless explicitly showing filled count)
  if (isTemplate && fieldsCount === 0) {
    return null;
  }

  // Determine badge color and style based on fields filled
  const getBadgeStyle = (count) => {
    if (count === 4) {
      return {
        className: "bg-green-100 text-green-800 border-green-300 font-semibold shadow-sm",
        icon: CheckCircle2,
        iconColor: "text-green-600"
      };
    } else if (count >= 1 && count <= 3) {
      return {
        className: "bg-amber-100 text-amber-800 border-amber-300 font-semibold shadow-sm",
        icon: AlertCircle,
        iconColor: "text-amber-600"
      };
    } else {
      return {
        className: "bg-gray-100 text-gray-600 border-gray-300 font-medium shadow-sm",
        icon: Circle,
        iconColor: "text-gray-500"
      };
    }
  };

  const style = getBadgeStyle(fieldsCount);
  const Icon = style.icon;

  return (
    <div className="flex justify-center mb-4">
      <Badge 
        variant="outline" 
        className={`${style.className} px-3 py-1.5 text-sm flex items-center gap-2 transition-all duration-200`}
      >
        <Icon className={`h-4 w-4 ${style.iconColor}`} />
        <span>
          Filled {fieldsCount}/4 fields
          {fieldsCount === 4 && <span className="ml-1">✨</span>}
        </span>
      </Badge>
    </div>
  );
}