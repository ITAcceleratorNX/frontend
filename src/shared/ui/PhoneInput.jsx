import React from 'react';
import { cn } from '@/shared/lib/utils/cn';
import { formatPhoneNumber } from '@/shared/lib/phone';
import { getFormInputClass } from '@/shared/ui/FormSelect.jsx';

/* eslint-disable react/prop-types */
export function PhoneInput({
  label,
  value = '',
  onChange,
  onBlur,
  error,
  placeholder = '+7 (XXX) XXX-XX-XX',
  disabled = false,
  required = false,
  className,
  inputClassName,
  labelClassName,
  id,
  name,
  variant = 'default',
}) {
  const handleChange = (e) => {
    onChange?.(formatPhoneNumber(e.target.value));
  };

  const field = (
    <input
      id={id}
      name={name}
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      disabled={disabled}
      placeholder={placeholder}
      className={cn(getFormInputClass(variant), inputClassName)}
    />
  );

  if (!label) {
    return (
      <div className={className}>
        {field}
        {error ? <p className="mt-1 text-sm text-red-600">{error}</p> : null}
      </div>
    );
  }

  return (
    <label
      className={cn('flex flex-col gap-1 text-xs font-medium text-gray-600', labelClassName, className)}
    >
      <span>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {field}
      {error ? <p className="text-sm font-normal text-red-600">{error}</p> : null}
    </label>
  );
}

export default PhoneInput;
/* eslint-enable react/prop-types */
