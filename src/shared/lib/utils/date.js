/**
 * Форматирование дат для отображения (календарь, периоды аренды).
 */

const RU_LOCALE = 'ru-RU';

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
