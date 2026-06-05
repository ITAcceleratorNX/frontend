/* eslint-disable react/prop-types */
import React from 'react';
import { FormSelect } from '@/shared/ui/FormSelect.jsx';
import { DOCUMENT_TYPES, DOCUMENT_TYPE_LABELS } from '../model/constants';

const DOCUMENT_TYPE_OPTIONS = DOCUMENT_TYPES.map((type) => ({
  value: type,
  label: DOCUMENT_TYPE_LABELS[type],
}));

const DocumentTypeSelect = ({ value, onChange, disabled, placeholder = 'Тип документа' }) => (
  <FormSelect
    value={value}
    onChange={onChange}
    options={DOCUMENT_TYPE_OPTIONS}
    placeholder={placeholder}
    disabled={disabled}
    variant="default"
    labelVariant="default"
  />
);

export default DocumentTypeSelect;
