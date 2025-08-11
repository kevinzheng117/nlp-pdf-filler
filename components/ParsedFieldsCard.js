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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Extracted Fields
          </div>
          {fields.confidence > 0 && (
            <Badge className={getConfidenceColor(fields.confidence)}>
              {Math.round(fields.confidence * 100)}% confidence
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(fields).map(([key, value]) => {
          if (key === 'confidence') return null;
          
          const Icon = fieldIcons[key];
          const hasValue = value && value.trim();
          
          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="flex items-center gap-2">
                {Icon && <Icon className="h-4 w-4" />}
                {formatFieldName(key)}
                {!hasValue && (
                  <Badge variant="outline" className="text-xs">
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
                className={!hasValue ? 'border-orange-200 bg-orange-50' : ''}
              />
            </div>
          );
        })}
        
        {fields.confidence === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Edit3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No fields extracted yet</p>
            <p className="text-sm">Enter instructions above and click "Extract Fields"</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}