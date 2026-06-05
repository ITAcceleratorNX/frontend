import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select.jsx';
import { cn } from '@/shared/lib/utils/cn';

const EMPTY_VALUE = '__empty__';

const VARIANT_TRIGGER = {
  default:
    'h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 shadow-none focus:ring-2 focus:ring-[#00A991]/20 focus:border-[#00A991] [&>svg]:text-[#00A991]',
  account:
    'h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#273655] shadow-none focus:ring-2 focus:ring-[#31876D]/20 focus:border-[#31876D] [&>svg]:text-gray-400',
  slate:
    'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 shadow-none focus:ring-2 focus:ring-[#273655]/20 focus:border-[#273655] [&>svg]:text-gray-400',
};

const VARIANT_INPUT = {
  default:
    'h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 focus:border-[#00A991] focus:outline-none focus:ring-2 focus:ring-[#00A991]/20',
  account:
    'h-10 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm text-[#273655] focus:border-[#31876D] focus:outline-none focus:ring-2 focus:ring-[#31876D]/20',
  slate:
    'h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:border-[#273655] focus:outline-none focus:ring-2 focus:ring-[#273655]/20',
};

const LABEL_STYLES = {
  default: 'text-sm font-medium text-gray-700',
  compact: 'text-xs font-medium text-gray-600',
  slate: 'text-sm font-medium text-slate-600',
};

export function getFormInputClass(variant = 'default') {
  return VARIANT_INPUT[variant] || VARIANT_INPUT.default;
}

export function getFormSelectTriggerClass(variant = 'default') {
  return VARIANT_TRIGGER[variant] || VARIANT_TRIGGER.default;
}

function toSelectValue(value) {
  if (value === '' || value == null) return EMPTY_VALUE;
  return String(value);
}

function fromSelectValue(value) {
  return value === EMPTY_VALUE ? '' : value;
}

/* eslint-disable react/prop-types */
export function FormSelect({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Не выбрано',
  disabled = false,
  variant = 'default',
  labelVariant = 'compact',
  className,
  triggerClassName,
  contentClassName,
  labelClassName,
  itemClassName,
  triggerStart,
  id,
  ...props
}) {
  const select = (
    <Select
      value={toSelectValue(value)}
      onValueChange={(v) => onChange?.(fromSelectValue(v))}
      disabled={disabled}
      {...props}
    >
      <SelectTrigger
        id={id}
        className={cn(VARIANT_TRIGGER[variant], triggerStart && 'flex items-center gap-1.5', triggerClassName)}
      >
        {triggerStart}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={cn('z-[100] rounded-xl border border-gray-200', contentClassName)}>
        {options.map((o, index) => {
          const itemValue = toSelectValue(o.value);
          return (
            <SelectItem
              key={`${itemValue}-${index}`}
              value={itemValue}
              className={o.itemClassName || itemClassName}
            >
              {o.label}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );

  if (!label) return select;

  return (
    <label
      htmlFor={id}
      className={cn('flex flex-col gap-1', LABEL_STYLES[labelVariant], labelClassName, className)}
    >
      {label}
      {select}
    </label>
  );
}

export default FormSelect;
/* eslint-enable react/prop-types */
