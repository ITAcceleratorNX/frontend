/* eslint-disable react/prop-types */
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '../model/constants';

const DocumentTypeSelect = ({ value, onChange, disabled, placeholder = 'Тип документа' }) => (
  <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
    <SelectTrigger className="h-9 w-full rounded-lg border-gray-200 text-sm">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {DOCUMENT_TYPES.map((type) => (
        <SelectItem key={type} value={type}>
          {DOCUMENT_TYPE_LABELS[type]}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

export default DocumentTypeSelect;
