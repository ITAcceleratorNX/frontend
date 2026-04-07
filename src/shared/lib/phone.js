/**
 * Kazakhstan mobile phone: same formatting as registration (+7 (XXX) XXX-XX-XX).
 */

/** Matches formatted display used in RegisterForm validation */
export const KZ_PHONE_DISPLAY_REGEX =
  /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/;

/**
 * @param {string} value
 * @returns {string}
 */
export function formatPhoneNumber(value) {
  if (!value || value.trim() === '') {
    return '';
  }

  const numbers = value.replace(/\D/g, '');

  if (numbers.length === 0) {
    return '';
  }

  let cleaned = numbers;
  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }

  if (cleaned && !cleaned.startsWith('7')) {
    cleaned = '7' + cleaned;
  }

  cleaned = cleaned.slice(0, 11);

  let formatted = '';
  if (cleaned.length > 0) {
    formatted = '+7';
    if (cleaned.length > 1) {
      formatted += ' (' + cleaned.slice(1, 4);
    }
    if (cleaned.length > 4) {
      formatted += ') ' + cleaned.slice(4, 7);
    }
    if (cleaned.length > 7) {
      formatted += '-' + cleaned.slice(7, 9);
    }
    if (cleaned.length > 9) {
      formatted += '-' + cleaned.slice(9, 11);
    }
  }

  return formatted;
}

/**
 * @param {string} value
 * @returns {boolean}
 */
export function isValidKzPhoneDisplay(value) {
  return KZ_PHONE_DISPLAY_REGEX.test(value || '');
}
