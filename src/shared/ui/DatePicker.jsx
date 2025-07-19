import React, { forwardRef } from 'react';
import { DateInput } from "@nextui-org/react";
import { parseDate } from '@internationalized/date';
import 'dayjs/locale/ru';


const DatePicker = forwardRef(({ 
  label, 
  value, 
  onChange, 
  error, 
  disabled = false,
  className = '',
  placeholder = '',
  ...props 
}, ref) => {
  
  // Преобразование строкового значения в объект DateValue
  const dateValue = value ? parseDate(value) : null;
  
  // Обработчик изменения даты
  const handleChange = (newValue) => {
    if (newValue) {
      // Отправляем дату в формате YYYY-MM-DD
      onChange(newValue.toString());
    } else {
      onChange('');
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <DateInput
        ref={ref}
        value={dateValue}
          onChange={handleChange}
        isDisabled={disabled}
        label={placeholder}
        errorMessage={error}
        isInvalid={!!error}
        granularity="day"
        classNames={{
          inputWrapper: [
            "h-[40px]",
            "min-h-[40px]",
            "bg-slate-50",
            "rounded-md",
            "border",
            "border-gray-300",
            "hover:bg-gray-100",
            "data-[focus=true]:border-2",
            "data-[focus=true]:border-[#1e2c4f]",
            "group-data-[invalid=true]:border-2",
            "group-data-[invalid=true]:border-red-500",
          ],
          input: [
            "font-['Nunito Sans']",
            "text-base",
            "text-[#222]",
            "placeholder:text-[#A6A6A6]",
          ],
          label: "hidden",
          errorMessage: [
            "font-['Nunito Sans']",
            "text-xs",
            "text-red-500",
            "ml-0",
            "mt-1",
          ],
          }}
          {...props}
        />
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker; 