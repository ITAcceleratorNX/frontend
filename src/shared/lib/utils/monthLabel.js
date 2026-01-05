/**
 * Функция для правильного склонения слова "месяц" на русском языке
 * @param {number|string} months - Количество месяцев
 * @returns {string} - Строка с правильно склоненным словом "месяц"
 */
export const getMonthLabel = (months) => {
  const num = parseInt(months, 10);
  if (num === 1) return "1 месяц";
  if (num >= 2 && num <= 4) return `${num} месяца`;
  return `${num} месяцев`;
};

