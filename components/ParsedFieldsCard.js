'use client';

import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Edit3, MapPin, Users, User, Calendar } from 'lucide-react';

export default function ParsedFieldsCard({ fields, onFieldChange, disabled }) {
  const fieldIcons = {
    address: MapPin,
    buyer: User,
    seller: Users,
    date: Calendar
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    if (confidence >= 0.3) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const formatFieldName = (fieldName) => {
    switch (fieldName) {
      case 'address': return 'Property Address';
      case 'buyer': return 'Buyer';
      case 'seller': return 'Seller';
      case 'date': return 'Date';
      default: return fieldName;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            <Edit3 className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Extracted Fields</h2>
        </div>
        {fields.confidence > 0 && (
          <Badge className={`${getConfidenceColor(fields.confidence)} px-3 py-1 text-sm font-medium`}>
            {Math.round(fields.confidence * 100)}% confidence
          </Badge>
        )}
      </div>

      <div className="space-y-5">
        {Object.entries(fields).map(([key, value]) => {
          if (key === 'confidence') return null;
          
          const Icon = fieldIcons[key];
          const hasValue = value && value.trim();
          
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2 text-sm font-medium text-gray-700">
                {Icon && <Icon className="h-4 w-4 text-gray-500" />}
                {formatFieldName(key)}
                {!hasValue && (
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-600 border-orange-200">
                    Empty
                  </Badge>
                )}
              </Label>
              <Input
                id={key}
                type={key === 'date' ? 'date' : 'text'}
                value={value || ''}
                onChange={(e) => onFieldChange(key, e.target.value)}
                placeholder={`Enter ${formatFieldName(key).toLowerCase()}...`}
                disabled={disabled}
                className={`h-11 rounded-xl bg-white/80 backdrop-blur-sm border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 ${
                  !hasValue ? 'border-orange-300 bg-orange-50/50' : ''
                }`}
              />
            </div>
          );
        })}
        
        {fields.confidence === 0 && (
          <div className="text-center py-12 text-gray-500">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Edit3 className="h-8 w-8 text-gray-300" />
            </div>
            <p className="font-medium text-gray-600 mb-1">No fields extracted yet</p>
            <p className="text-sm text-gray-400">Enter instructions above and click "Extract Fields"</p>
          </div>
        )}
      </div>
    </div>
  );
}