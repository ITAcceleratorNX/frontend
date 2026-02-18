/**
 * Форматирование дат для отображения (календарь, периоды аренды).
 */

const RU_LOCALE = 'ru-RU';

/**
 * Возвращает сегодняшнюю дату в формате YYYY-MM-DD по локальному времени пользователя.
 * Используйте вместо toISOString().split('T')[0], который даёт UTC-дату (может быть "вчера" при UTC+N).
 * @returns {string}
 */
export function getTodayLocalDateString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Форматирует дату для календаря и периодов.
 * @param {string|Date} dateInput - Дата (ISO строка или Date)
 * @param {Intl.DateTimeFormatOptions} [options] - Опции Intl (например { day: '2-digit', month: 'short' })
 * @returns {string}
 */
export function formatCalendarDate(dateInput, options = {}) {
  if (dateInput == null) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '';
  const opts = Object.keys(options).length
    ? options
    : { day: '2-digit', month: '2-digit', year: 'numeric' };
  return date.toLocaleDateString(RU_LOCALE, opts);
}

/**
 * Форматирует дату в длинном виде (например: "15 января 2025 г.").
 * @param {string|Date} dateInput - Дата (ISO строка или Date)
 * @returns {string}
 */
export function formatCalendarDateLong(dateInput) {
  if (dateInput == null) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(RU_LOCALE, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Форматирует дату с временем (например: "15.02.2025, 14:30").
 * @param {string|Date} dateInput - Дата (ISO строка или Date)
 * @returns {string}
 */
export function formatCalendarDateTime(dateInput) {
  if (dateInput == null) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString(RU_LOCALE, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
