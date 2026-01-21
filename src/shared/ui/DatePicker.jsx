import React, { forwardRef, useMemo, useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';

const DatePicker = forwardRef(({ 
  label, 
  value, 
  onChange, 
  onBlur,
  error, 
  disabled = false,
  className = '',
  placeholder = 'ДД.ММ.ГГГГ',
  minDate = null, // Минимальная дата (по умолчанию null - нет ограничения)
  maxDate = null, // Максимальная дата (по умолчанию null - нет ограничения)
  allowFutureDates = false, // Разрешить будущие даты (по умолчанию false - только прошлые)
  ...props 
}, ref) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef(null);
  
  // Преобразование строкового значения в объект Date
  const dateValue = useMemo(() => {
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return undefined;
    }
    
    try {
      // Проверяем, что значение в формате YYYY-MM-DD
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (dateRegex.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
      }
      // Если формат другой, пытаемся преобразовать
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date;
      }
      return undefined;
    } catch (error) {
      console.warn('Ошибка при парсинге даты:', error);
      return undefined;
    }
  }, [value]);

  // Обновляем inputValue при изменении value
  useEffect(() => {
    if (dateValue) {
      setInputValue(format(dateValue, 'dd.MM.yyyy', { locale: ru }));
    } else {
      setInputValue('');
    }
  }, [dateValue]);
  
  // Обработчик выбора даты из календаря
  const handleSelect = (date) => {
    if (onChange) {
      if (date) {
        // Преобразуем дату в формат YYYY-MM-DD
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateString = `${year}-${month}-${day}`;
        onChange(dateString);
        // Закрываем календарь после выбора
        setOpen(false);
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      } else {
        onChange('');
      }
    }
    if (onBlur) {
      onBlur();
    }
  };

  // Форматирование введенного текста с маской ДД.ММ.ГГГГ
  const formatInputValue = (text) => {
    // Удаляем все нецифровые символы
    const digits = text.replace(/\D/g, '');

    // Ограничиваем до 8 цифр (ддммгггг)
    const limitedDigits = digits.slice(0, 8);

    // Форматируем с точками
    let formatted = '';
    for (let i = 0; i < limitedDigits.length; i++) {
      if (i === 2 || i === 4) {
        formatted += '.';
      }
      formatted += limitedDigits[i];
    }

    return formatted;
  };

  // Обработчик изменения текстового ввода
  const handleInputChange = (e) => {
    const newValue = e.target.value;
    const formatted = formatInputValue(newValue);
    setInputValue(formatted);

    // Если введена полная дата (10 символов: ДД.ММ.ГГГГ), пытаемся преобразовать
    if (formatted.length === 10) {
      const [day, month, year] = formatted.split('.').map(Number);

      // Валидация даты
      if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100) {
        const date = new Date(year, month - 1, day);

        // Проверяем, что дата валидна (например, не 31 февраля)
        if (date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year) {
          // Проверяем минимальную дату, если указана
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const checkDate = new Date(date);
          checkDate.setHours(0, 0, 0, 0);

          let isValid = true;

          // Если указана минимальная дата, проверяем её
          if (minDate) {
            const min = new Date(minDate);
            min.setHours(0, 0, 0, 0);
            if (checkDate < min) {
              isValid = false;
            }
          }

          // Если не разрешены будущие даты, проверяем это
          if (!allowFutureDates && checkDate > today) {
            isValid = false;
          }

          if (isValid) {
            const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            if (onChange) {
              onChange(dateString);
            }
            return;
          }
        }
      }
    }
  };

  // Обработчик потери фокуса
  const handleInputBlur = (e) => {
    // Если значение неполное или невалидное, очищаем или оставляем как есть
    if (inputValue && inputValue.length < 10) {
      // Если введена неполная дата, пытаемся восстановить из value
      if (dateValue) {
        setInputValue(format(dateValue, 'dd.MM.yyyy', { locale: ru }));
      } else {
        setInputValue('');
      }
    }

    if (onBlur) {
      onBlur();
    }
  };

  // Обработчик нажатия клавиш
  const handleKeyDown = (e) => {
    // Разрешаем удаление, навигацию и т.д.
    if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter'].includes(e.key)) {
      return;
    }

    // Разрешаем только цифры
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const hasInlineLabel = !label && placeholder;
  const isGrayBackground = className.includes('[&>div]:bg-gray-100');
  const hasNoBorder = className.includes('[&>div]:border-0');

  return (
    <div className={cn('w-full', className)}>
      <div className={cn(
        "relative flex flex-col items-start justify-center rounded-3xl p-3",
        !hasNoBorder && "border border-gray-300",
        "focus-within:ring-2 focus-within:ring-[#00A991] focus-within:border-transparent",
        !isGrayBackground && "hover:bg-gray-50 transition-colors",
        isGrayBackground && "bg-gray-100",
        error && "border-red-500 border-2",
        disabled && "cursor-not-allowed opacity-50",
        (label || hasInlineLabel) ? "min-h-[60px]" : "min-h-[48px]",
        className.includes('[&_input]:bg-transparent') && "bg-transparent"
      )}>
        {(label || hasInlineLabel) && (
          <label className="text-sm font-medium text-[#273655] mb-1">
            {label || placeholder}
          </label>
        )}
        <div className="relative flex items-center w-full">
          <input
            ref={(node) => {
              inputRef.current = node;
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
            }}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            placeholder={hasInlineLabel ? "" : placeholder}
            maxLength={10}
            className={cn(
              "w-full bg-transparent border-0 outline-none",
              "text-base font-sf-pro-text text-[#737373] placeholder:text-[#A6A6A6]",
              "pr-8",
              disabled && "cursor-not-allowed"
            )}
            {...props}
          />
          <Popover open={open} onOpenChange={setOpen} modal={false}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                disabled={disabled}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 p-0 hover:bg-gray-200",
                  "text-gray-600 hover:text-gray-900",
                  "hover:!-translate-y-1/2 transition-none",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                onClick={(e) => {
                  e.preventDefault();
                  if (!disabled) {
                    setOpen((v) => !v);
                  }
                }}
              >
                <CalendarIcon className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-[9999] pointer-events-auto"
              align="end"
              sideOffset={8}
              collisionPadding={8}
              onOpenAutoFocus={(e) => {
                e.preventDefault();
              }}
              onInteractOutside={(e) => {
                const target = e.target;
                if (
                  target.closest('[data-radix-popper-content-wrapper]') ||
                  target.closest('button') ||
                  target === inputRef.current
                ) {
                  e.preventDefault();
                }
              }}
            >

            <Calendar
              mode="single"
              selected={dateValue}
              onSelect={handleSelect}
              initialFocus={false}
              locale={ru}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkDate = new Date(date);
                checkDate.setHours(0, 0, 0, 0);
                
                // Если указана минимальная дата, блокируем даты раньше неё
                if (minDate) {
                  const min = new Date(minDate);
                  min.setHours(0, 0, 0, 0);
                  if (checkDate < min) {
                    return true;
                  }
                }
                
                // Если указана максимальная дата, блокируем даты позже неё
                if (maxDate) {
                  const max = new Date(maxDate);
                  max.setHours(0, 0, 0, 0);
                  if (checkDate > max) {
                    return true;
                  }
                }
                
                // Если не разрешены будущие даты, блокируем их
                if (!allowFutureDates && checkDate > today) {
                  return true;
                }
                
                return false;
              }}
            />
            </PopoverContent>
          </Popover>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 mt-1 ml-1">
          {error}
        </p>
      )}
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker; 