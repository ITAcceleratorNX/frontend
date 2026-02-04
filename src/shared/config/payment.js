/**
 * Fallback for online payment flag (e.g. outside personal account).
 * In personal account the real value is loaded from API (usePaymentSettings) and reflects DB.
 * Set VITE_ONLINE_PAYMENT_ENABLED=false to override default. Default: true.
 */
export const isOnlinePaymentEnabled = import.meta.env.VITE_ONLINE_PAYMENT_ENABLED !== 'false';

/** Manager contact for when online payment is disabled (exact text from product). */
export const PAYMENT_DISABLED_CONTACT = {
  phone: '+7 778 391 1425',
  phoneRaw: '77783911425',
  whatsAppUrl: 'https://wa.me/77783911425',
};
