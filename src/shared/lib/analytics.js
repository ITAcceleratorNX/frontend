/**
 * Thin GTM dataLayer wrapper for LP pages.
 *
 * Per ТЗ section 7 — these 8 events feed Google Ads / GA4 conversions:
 *  1. page_view              (auto by GTM)
 *  2. phone_click            (click on "Показать номер" before modal opens)
 *  3. phone_revealed         (after successful submit — moment of phone reveal)
 *  4. whatsapp_click         (click on WhatsApp button)
 *  5. form_start             (first focus on form field)
 *  6. form_submit_lead       (successful submitLead response, full payload)
 *  7. booking_click          (any "Забронировать" CTA)
 *  8. cta_route_build        (click "Построить маршрут" in branches block)
 */

export const LP_EVENTS = {
  PHONE_CLICK: 'phone_click',
  PHONE_REVEALED: 'phone_revealed',
  WHATSAPP_CLICK: 'whatsapp_click',
  FORM_START: 'form_start',
  FORM_SUBMIT_LEAD: 'form_submit_lead',
  BOOKING_CLICK: 'booking_click',
  CTA_ROUTE_BUILD: 'cta_route_build',
};

/**
 * Push an event to GTM dataLayer. Safe in SSR / when dataLayer is missing.
 *
 * GTM-контейнер (GTM-KC2QCVNN) подключён напрямую в frontend/index.html —
 * никакой ленивой инжекции в JS не требуется.
 *
 * @param {string} eventName
 * @param {Record<string, any>} [params]
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  try {
    window.dataLayer.push({ event: eventName, ...params });
    if (import.meta.env.DEV) {
      console.debug('[lp/analytics]', eventName, params);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Клики по бронирующим CTA (канонично для GTM GA4/Google Ads micro-conversion).
 *
 * @param {object} opts
 * @param {'individual' | 'camera' | 'cloud'} opts.service_type
 * @param {string | null} [opts.box_size] — человекочитаемый размер с карточки (напр. «6 м²», «0.25 м³»), иначе null
 * @param {string} [opts.section] — hero | header | tariffs | ...
 */
export function trackBookingClick({ service_type, box_size = null, section } = {}) {
  if (!service_type) return;
  trackEvent(LP_EVENTS.BOOKING_CLICK, {
    landing_page: typeof window !== 'undefined' ? window.location.pathname : '',
    ...(section !== undefined ? { section } : {}),
    service_type,
    box_size,
  });
}
