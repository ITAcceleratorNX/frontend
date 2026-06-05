/** WhatsApp phone (digits only, no +). */
export const LP_WHATSAPP_PHONE = '77783911425';

/** Pre-filled messages per LP service type (ТЗ: один текст на все WA-переходы LP). */
export const LP_WHATSAPP_MESSAGES = {
  individual:
    'Здравствуйте! Хочу узнать подробнее про индивидуальное хранение и забронировать бокс.',
  cloud: 'Здравствуйте! Хочу узнать подробнее про облачное хранение.',
  camera: 'Здравствуйте! Хочу узнать подробнее про камеру хранения на короткий срок.',
};

/** Map LP pathname → service type key. */
export const LP_PATH_SERVICE_TYPE = {
  '/lp/arenda-boksa-almaty': 'individual',
  '/lp/oblachnoe-hranenie-almaty': 'cloud',
  '/lp/kamera-hraneniya-almaty': 'camera',
};

/**
 * @param {'individual'|'cloud'|'camera'|string} serviceType
 * @returns {string} wa.me URL with encoded pre-filled text
 */
export function buildLpWhatsAppLink(serviceType) {
  const message =
    LP_WHATSAPP_MESSAGES[serviceType] || LP_WHATSAPP_MESSAGES.individual;
  return `https://wa.me/${LP_WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
}

/**
 * Resolve service type from current pathname (for floating WA on LP routes).
 * @param {string} pathname
 * @returns {'individual'|'cloud'|'camera'|null}
 */
export function getLpServiceTypeFromPath(pathname) {
  return LP_PATH_SERVICE_TYPE[pathname] ?? null;
}
