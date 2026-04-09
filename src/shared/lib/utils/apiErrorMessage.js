/**
 * Текст ошибки из ответа API (axios). Бэкенд отдаёт message и/или error.
 * @param {unknown} error
 * @param {string} [fallback]
 * @returns {string}
 */
export function getApiErrorMessage(error, fallback = '') {
  const data = error?.response?.data;
  if (!data) {
    return fallback;
  }
  const raw = data.message ?? data.error;
  if (typeof raw === 'string' && raw.trim()) {
    return raw.trim();
  }
  if (raw && typeof raw === 'object') {
    const joined = Object.values(raw)
      .flat()
      .filter(Boolean)
      .map(String)
      .join(', ');
    if (joined.trim()) {
      return joined.trim();
    }
  }
  return fallback;
}
