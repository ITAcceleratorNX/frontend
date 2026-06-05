import React from 'react';
import { cn } from '@/shared/lib/utils/cn';
import DatePicker from '@/shared/ui/DatePicker.jsx';

/* eslint-disable react/prop-types */
/**
 * Единое поле даты для форм и фильтров (DRY-обёртка над DatePicker).
 * Значение: строка YYYY-MM-DD или ''.
 */
export function DateField({
  label,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  required = false,
  variant = 'account',
  labelClassName,
  className,
  placeholder = 'ДД.ММ.ГГГГ',
  allowFutureDates = true,
  minDate = null,
  maxDate = null,
  captionLayout = 'label',
  id,
  ...props
}) {
  const picker = (
    <DatePicker
      id={id}
      variant={variant}
      value={value || ''}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      disabled={disabled}
      placeholder={placeholder}
      allowFutureDates={allowFutureDates}
      minDate={minDate}
      maxDate={maxDate}
      captionLayout={captionLayout}
      className={className}
      {...props}
    />
  );

  if (!label) return picker;

  return (
    <label
      htmlFor={id}
      className={cn('flex flex-col gap-1 text-xs font-medium text-gray-600', labelClassName)}
    >
      <span>
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {picker}
    </label>
  );
}

export default DateField;
/* eslint-enable react/prop-types */
