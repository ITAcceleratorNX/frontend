import React, { forwardRef, useMemo, useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { cn } from '@/shared/lib/utils';

const DatePicker = forwardRef(({
  /** default — текущий “карточный” вид; input — как обычный текстовый инпут */
  variant = 'default',
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
  /** "dropdown" — выбор месяца и года из выпадающих списков (удобно для даты рождения) */
  captionLayout = 'label',
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

  const isValidTypedDate = (ddMMyyyy) => {
    if (!ddMMyyyy || ddMMyyyy.length !== 10) return false;
    const [day, month, year] = ddMMyyyy.split('.').map(Number);
    if (!(day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1900 && year <= 2100)) return false;
    const date = new Date(year, month - 1, day);
    if (!(date.getDate() === day && date.getMonth() === month - 1 && date.getFullYear() === year)) return false;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (minDate) {
      const min = new Date(minDate);
      min.setHours(0, 0, 0, 0);
      if (checkDate < min) return false;
    }

    if (maxDate) {
      const max = new Date(maxDate);
      max.setHours(0, 0, 0, 0);
      if (checkDate > max) return false;
    }

    if (!allowFutureDates) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (checkDate > today) return false;
    }

    return true;
  };

  // Обработчик потери фокуса
  const handleInputBlur = (e) => {
    // Если дата введена полностью, но невалидна/вне ограничений — откатываем к value (или очищаем)
    if (inputValue && inputValue.length === 10 && !isValidTypedDate(inputValue)) {
      if (dateValue) {
        setInputValue(format(dateValue, 'dd.MM.yyyy', { locale: ru }));
      } else {
        setInputValue('');
      }
    }

    // Если введена неполная дата — восстанавливаем из value (или очищаем)
    if (inputValue && inputValue.length > 0 && inputValue.length < 10) {
      if (dateValue) setInputValue(format(dateValue, 'dd.MM.yyyy', { locale: ru }));
      else setInputValue('');
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
  const isInputVariant = variant === 'input';
  const isAccountVariant = variant === 'account';
  const isSlateVariant = variant === 'slate';
  const isDarkVariant = variant === 'dark';
  const isCompactVariant = isInputVariant || isAccountVariant || isSlateVariant || isDarkVariant;

  const showInternalLabel = Boolean(label || hasInlineLabel);

  /** Сброс системной/глобальной обводки у text input (иначе «прямоугольник» внутри скруглённого контейнера). */
  const inputResetClassName =
    '!border-0 !border-transparent border-none bg-transparent p-0 shadow-none ' +
    'outline-none outline-0 ring-0 ring-offset-0 ' +
    'focus:outline-none focus:ring-0 focus:ring-offset-0 ' +
    'focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 ' +
    'appearance-none';

  const compactContainerClassName = cn(
    'relative flex w-full items-center',
    isInputVariant && 'h-12 rounded-2xl border border-gray-200 bg-white px-4 focus-within:ring-2 focus-within:ring-[#31876D]/30 focus-within:border-[#31876D]/50',
    isAccountVariant && 'h-10 rounded-xl border border-gray-200 bg-white px-3 focus-within:ring-2 focus-within:ring-[#31876D]/20 focus-within:border-[#31876D]',
    isSlateVariant && 'h-10 rounded-xl border border-slate-200 bg-white px-3 focus-within:ring-2 focus-within:ring-[#273655]/20 focus-within:border-[#273655]',
    isDarkVariant && 'h-9 rounded-xl border border-white/30 bg-transparent px-3 focus-within:border-white/60',
    error && 'border-red-500',
    disabled && 'cursor-not-allowed opacity-50',
    className.includes('[&_input]:bg-transparent') && !isDarkVariant && 'bg-transparent',
  );

  const compactInputClassName = cn(
    inputResetClassName,
    'h-full min-w-0 flex-1 pr-10',
    isDarkVariant
      ? 'text-sm text-white placeholder:text-white/60'
      : 'text-sm text-[#273655] placeholder:text-gray-400',
    disabled && 'cursor-not-allowed',
  );

  const compactCalendarButtonClassName = cn(
    'absolute top-1/2 -translate-y-1/2 h-8 w-8 shrink-0 p-0 shadow-none hover:!-translate-y-1/2 transition-none',
    isInputVariant ? 'right-2' : 'right-1',
    isDarkVariant
      ? 'text-white/90 hover:bg-white/10 hover:text-white'
      : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900',
    disabled && 'cursor-not-allowed opacity-50',
  );

  const sharedInputProps = {
    ref: (node) => {
      inputRef.current = node;
      if (typeof ref === 'function') {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    },
    type: 'text',
    value: inputValue,
    onChange: handleInputChange,
    onBlur: handleInputBlur,
    onKeyDown: handleKeyDown,
    disabled,
    placeholder: hasInlineLabel ? '' : placeholder,
    maxLength: 10,
    ...props,
  };

  const calendarPopover = (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className={cn(
            isCompactVariant
              ? compactCalendarButtonClassName
              : cn(
                  'absolute top-1/2 -translate-y-1/2 h-8 w-8 shrink-0 p-0 shadow-none',
                  'right-1 hover:bg-gray-200 text-gray-600 hover:text-gray-900',
                  'hover:!-translate-y-1/2 transition-none',
                  disabled && 'cursor-not-allowed opacity-50',
                ),
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
          captionLayout={captionLayout}
          {...(captionLayout === 'dropdown' && {
            startMonth: new Date(1900, 0),
            endMonth: new Date(),
            defaultMonth:
              dateValue ||
              (() => {
                const d = new Date();
                d.setFullYear(d.getFullYear() - 25);
                d.setMonth(0);
                d.setDate(1);
                return d;
              })(),
            hideNavigation: true,
          })}
          disabled={(date) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);

            if (minDate) {
              const min = new Date(minDate);
              min.setHours(0, 0, 0, 0);
              if (checkDate < min) {
                return true;
              }
            }

            if (maxDate) {
              const max = new Date(maxDate);
              max.setHours(0, 0, 0, 0);
              if (checkDate > max) {
                return true;
              }
            }

            if (!allowFutureDates && checkDate > today) {
              return true;
            }

            return false;
          }}
        />
      </PopoverContent>
    </Popover>
  );

  return (
    <div className={cn('w-full', className)}>
      {isCompactVariant ? (
        <>
          {showInternalLabel && (
            <label className="text-sm font-medium text-[#273655] mb-1 block">
              {label || placeholder}
            </label>
          )}
          <div className={compactContainerClassName}>
            <input {...sharedInputProps} className={compactInputClassName} />
            {calendarPopover}
          </div>
        </>
      ) : (
        <div
          className={cn(
            'relative flex flex-col items-start justify-center rounded-3xl p-3',
            !hasNoBorder && 'border border-gray-300',
            'focus-within:ring-2 focus-within:ring-[#00A991] focus-within:border-transparent',
            !isGrayBackground && 'hover:bg-gray-50 transition-colors',
            isGrayBackground && 'bg-gray-100',
            error && 'border-red-500 border-2',
            disabled && 'cursor-not-allowed opacity-50',
            (label || hasInlineLabel) ? 'min-h-[60px]' : 'min-h-[48px]',
            className.includes('[&_input]:bg-transparent') && 'bg-transparent'
          )}
        >
          {(label || hasInlineLabel) && (
            <label className="text-sm font-medium text-[#273655] mb-1">
              {label || placeholder}
            </label>
          )}
          <div className="relative flex w-full items-center">
            <input
              {...sharedInputProps}
              className={cn(
                inputResetClassName,
                'w-full min-w-0',
                'text-base font-sf-pro-text text-[#737373] placeholder:text-[#A6A6A6]',
                'pr-8',
                disabled && 'cursor-not-allowed'
              )}
            />
            {calendarPopover}
          </div>
        </div>
      )}
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