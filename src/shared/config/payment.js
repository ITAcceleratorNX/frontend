/**
 * Online payment feature flag.
 * Set VITE_ONLINE_PAYMENT_ENABLED=false to show manager-contact modal instead of payment flow.
 * Default: true (online payment enabled).
 */
export const isOnlinePaymentEnabled = false;

/** Manager contact for when online payment is disabled (exact text from product). */
export const PAYMENT_DISABLED_CONTACT = {
  phone: '+7 778 391 1425',
  phoneRaw: '77783911425',
  whatsAppUrl: 'https://wa.me/77783911425',
};
