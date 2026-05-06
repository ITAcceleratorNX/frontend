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
 * @param {string} eventName
 * @param {Record<string, any>} [params]
 */
export function trackEvent(eventName, params = {}) {
  if (typeof window === 'undefined') return;
  window.dataLayer = window.dataLayer || [];
  try {
    window.dataLayer.push({ event: eventName, ...params });
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.debug('[lp/analytics]', eventName, params);
    }
  } catch {
    /* ignore */
  }
}

/**
 * Inject GTM container into <head> + <noscript> iframe into <body>.
 * Idempotent — multiple LP mounts won't double-load.
 *
 * @param {string|undefined} containerId e.g. "GTM-XXXXXX"
 */
export function ensureGtmInjected(containerId) {
  if (typeof window === 'undefined' || !containerId) return;
  if (window.__lpGtmInjected) return;
  window.__lpGtmInjected = true;

  // Init dataLayer + gtm.start exactly per Google's snippet.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(containerId)}`;
  document.head.appendChild(script);

  // <noscript> iframe fallback.
  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(containerId)}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);
}
