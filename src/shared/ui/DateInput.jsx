import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const DateInput = ({ 
  value, 
  onChange, 
  className = '', 
  placeholder = 'Выберите дату',
  disabled = false
}) => {
  // Форматирование даты для отображения в инпуте
  const formattedValue = value ? format(new Date(value), 'dd.MM.yyyy', { locale: ru }) : '';

  // Обработчик изменения даты через строку
  const handleDateChange = (e) => {
    const dateString = e.target.value;

    // Простая валидация формата даты (дд.мм.гггг)
    if (/^(\d{2})\.(\d{2})\.(\d{4})$/.test(dateString)) {
      const [day, month, year] = dateString.split('.');
      // Создаем дату с учетом месяца (0-11)
      const date = new Date(year, month - 1, day);
      
      if (!isNaN(date.getTime())) {
        onChange(date.toISOString());
        return;
      }
    }

    // Если формат некорректный, просто обновляем текстовое значение
    e.target.value = dateString;
  };

  return (
    <input
      type="text"
      value={formattedValue}
      onChange={handleDateChange}
      className={`px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1e2c4f] ${className}`}
      placeholder={placeholder}
      disabled={disabled}
    />
  );
}; 