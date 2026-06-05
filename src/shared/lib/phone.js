/**
 * Kazakhstan mobile phone: same formatting as registration (+7 (XXX) XXX-XX-XX).
 */

/** Matches formatted display used across the app (+7 (XXX) XXX-XX-XX and spaced variants). */
export const KZ_PHONE_DISPLAY_REGEX =
  /^\+7\s?\(?\d{3}\)?\s?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;

export const KZ_PHONE_REQUIRED_MESSAGE = 'Телефон обязателен для заполнения';

export const KZ_PHONE_INVALID_MESSAGE =
  'Номер телефона должен быть в формате +7 (XXX) XXX-XX-XX';

/** Rules for react-hook-form `register('phone', RHF_PHONE_RULES)` */
export const RHF_PHONE_RULES = {
  required: KZ_PHONE_REQUIRED_MESSAGE,
  pattern: {
    value: KZ_PHONE_DISPLAY_REGEX,
    message: KZ_PHONE_INVALID_MESSAGE,
  },
};

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

/**
 * Formats stored/API phone (+7XXXXXXXXXX) for display in inputs.
 * @param {string} phone
 * @returns {string}
 */
export function formatPhoneForDisplay(phone) {
  if (!phone) return '';
  const numbers = phone.replace(/\D/g, '');
  let cleaned = numbers.startsWith('8') ? `7${numbers.slice(1)}` : numbers;
  if (cleaned && !cleaned.startsWith('7')) cleaned = `7${cleaned}`;
  return formatPhoneNumber(cleaned);
}

/**
 * @param {string} value
 * @param {{ required?: boolean }} [opts]
 * @returns {string|null} error message or null if valid
 */
export function validateKzPhone(value, { required = false } = {}) {
  if (!value || !String(value).trim()) {
    return required ? KZ_PHONE_REQUIRED_MESSAGE : null;
  }
  return isValidKzPhoneDisplay(value) ? null : KZ_PHONE_INVALID_MESSAGE;
}

/**
 * Converts any phone input to +7XXXXXXXXXX for API requests.
 * @param {string} value
 * @returns {string}
 */
export function normalizePhoneForSubmit(value) {
  if (!value || value.trim() === '') return '';

  const numbers = value.replace(/\D/g, '');
  let cleaned = numbers;

  if (cleaned.startsWith('8')) {
    cleaned = '7' + cleaned.slice(1);
  }
  if (cleaned && !cleaned.startsWith('7')) {
    cleaned = '7' + cleaned;
  }

  cleaned = cleaned.slice(0, 11);
  return cleaned.startsWith('7') ? `+7${cleaned.slice(1)}` : '';
}
