import React, { forwardRef } from 'react';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker as MUIDatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import updateLocale from 'dayjs/plugin/updateLocale';
import localizedFormat from 'dayjs/plugin/localizedFormat';

// Настройка dayjs для русской локализации
dayjs.extend(updateLocale);
dayjs.extend(localizedFormat);
dayjs.locale('ru');

// Настройка русской локализации
dayjs.updateLocale('ru', {
  weekStart: 1, // Понедельник как первый день недели (российский стандарт)
  formats: {
    LT: 'HH:mm',
    LTS: 'HH:mm:ss',
    L: 'DD.MM.YYYY',
    LL: 'D MMMM YYYY г.',
    LLL: 'D MMMM YYYY г., HH:mm',
    LLLL: 'dddd, D MMMM YYYY г., HH:mm'
  }
});

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
  
  // Преобразование значения в dayjs объект
  const dayJsValue = value ? dayjs(value) : null;
  
  // Обработчик изменения даты
  const handleChange = (newValue) => {
    if (newValue && newValue.isValid()) {
      // Отправляем дату в формате YYYY-MM-DD
      onChange(newValue.format('YYYY-MM-DD'));
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
      
      <LocalizationProvider 
        dateAdapter={AdapterDayjs} 
        adapterLocale="ru"
        localeText={{
          // Русские переводы для интерфейса picker
          cancelButtonLabel: 'Отмена',
          clearButtonLabel: 'Очистить',
          okButtonLabel: 'ОК',
          todayButtonLabel: 'Сегодня',
          datePickerToolbarTitle: 'Выберите дату',
          timePickerToolbarTitle: 'Выберите время',
          dateTimePickerToolbarTitle: 'Выберите дату и время',
          pickersCalendarHeaderSwitchViewIcon: 'Изменить вид',
          pickersCalendarHeaderPreviousMonth: 'Предыдущий месяц',
          pickersCalendarHeaderNextMonth: 'Следующий месяц',
        }}
      >
        <MUIDatePicker 
          value={dayJsValue}
          onChange={handleChange}
          disabled={disabled}
          format="DD.MM.YYYY"
          ref={ref}
          slotProps={{
            textField: {
              placeholder: placeholder,
              fullWidth: true,
              error: !!error,
              helperText: error,
              sx: {
                '& .MuiOutlinedInput-root': {
                  height: '40px', // Уменьшаю высоту для соответствия Input полям
                  minHeight: '40px',
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: '16px',
                  backgroundColor: '#F5F6FA',
                  borderRadius: '8px',
                  padding: 0, // Убираю дополнительные отступы
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: '2px solid #273655',
                  },
                  '&.Mui-error fieldset': {
                    border: '2px solid #ef4444',
                  },
                  '& .MuiOutlinedInput-input': {
                    padding: '12px 14px', // Точные отступы как в Input
                    height: 'auto',
                    lineHeight: '1.5',
                  },
                },
                '& .MuiInputLabel-root': {
                  display: 'none', // Скрываю MUI label, так как у нас есть свой
                },
                '& .MuiFormHelperText-root': {
                  fontFamily: "'Nunito Sans', sans-serif",
                  fontSize: '12px',
                  color: '#ef4444',
                  marginLeft: 0,
                  marginTop: '4px',
                },
                // Убираю лишние отступы
                margin: 0,
                '& .MuiInputBase-root': {
                  margin: 0,
                },
              },
            },
          }}
          {...props}
        />
      </LocalizationProvider>
    </div>
  );
});

DatePicker.displayName = 'DatePicker';

export default DatePicker; 