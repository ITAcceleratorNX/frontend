/**
 * Lead submission for LP forms.
 *
 * Sends full payload to the backend (or stub). Merges:
 *  - form fields (name, phone, service_type, page_section, [client_type])
 *  - GCLID / UTM attribution snapshot from localStorage
 *  - meta (landing_page, submitted_at, user_agent, referrer)
 *
 * Endpoint resolution:
 *  - VITE_LEAD_ENDPOINT env (e.g. "/api/leads") — wins if set
 *  - otherwise falls back to existing backend route used by site form: POST /submit-lead via shared axios client
 *
 * Bot protection:
 *  - Honeypot — caller should pre-check `honeypot` field (we also re-check here for safety).
 *  - Rate limit — 1 successful submit per 60s per browser (sessionStorage).
 *
 * Always also fires GTM `form_submit_lead` on success (caller can choose to fire as well — duplication is harmless because GA4 dedups).
 */

import api from '@/shared/api/axios.js';
import { normalizePhoneForSubmit } from '@/shared/lib/phone.js';
import { getAttribution } from '@/shared/lib/attribution.js';
import { trackEvent, LP_EVENTS } from '@/shared/lib/analytics.js';

const RATE_LIMIT_KEY = 'extraspace_lp_last_submit_at';
const RATE_LIMIT_MS = 60 * 1000;

const isBrowser = () => typeof window !== 'undefined';

function isRateLimited() {
  if (!isBrowser()) return false;
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return false;
    const last = Number(raw);
    if (Number.isNaN(last)) return false;
    return Date.now() - last < RATE_LIMIT_MS;
  } catch {
    return false;
  }
}

/**
 * Returns seconds remaining until next submit is allowed (0 if not limited).
 * Used by UI to show a countdown on the submit button.
 */
export function getRateLimitSecondsLeft() {
  if (!isBrowser()) return 0;
  try {
    const raw = sessionStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return 0;
    const last = Number(raw);
    if (Number.isNaN(last)) return 0;
    const elapsed = Date.now() - last;
    if (elapsed >= RATE_LIMIT_MS) return 0;
    return Math.ceil((RATE_LIMIT_MS - elapsed) / 1000);
  } catch {
    return 0;
  }
}

function markSubmitted() {
  if (!isBrowser()) return;
  try {
    sessionStorage.setItem(RATE_LIMIT_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

/**
 * @typedef {Object} LeadInput
 * @property {string} name
 * @property {string} phone               raw or formatted; will be normalized to +7XXXXXXXXXX
 * @property {'individual'|'camera'|'cloud'} service_type
 * @property {'b2c'|'b2b'} [client_type]
 * @property {string} [page_section]      e.g. "hero" | "mini_form" | "phone_gating" | "final_cta"
 * @property {string} [honeypot]          must stay empty
 * @property {boolean} [agreement]        consent checkbox
 */

/**
 * @param {LeadInput} input
 * @returns {Promise<{ ok: boolean, error?: string, payload: object }>}
 */
export async function submitLead(input) {
  const trimmedName = (input?.name || '').trim();
  const phone = normalizePhoneForSubmit(input?.phone || '');

  if (input?.honeypot) {
    // Bot — pretend success so they don't retry, but never call backend.
    return { ok: true, payload: { honeypot: true } };
  }

  if (isRateLimited()) {
    return {
      ok: false,
      error: 'rate_limited',
      payload: { name: trimmedName, phone, service_type: input?.service_type },
    };
  }

  const attribution = getAttribution() || {};

  const payload = {
    name: trimmedName,
    phone,
    service_type: input?.service_type,
    ...(input?.client_type ? { client_type: input.client_type } : {}),
    landing_page:
      attribution.landing_page ||
      (isBrowser() ? window.location.pathname : undefined),
    page_section: input?.page_section || 'unknown',
    ...(attribution.gclid ? { gclid: attribution.gclid } : {}),
    ...(attribution.utm_source ? { utm_source: attribution.utm_source } : {}),
    ...(attribution.utm_medium ? { utm_medium: attribution.utm_medium } : {}),
    ...(attribution.utm_campaign ? { utm_campaign: attribution.utm_campaign } : {}),
    ...(attribution.utm_content ? { utm_content: attribution.utm_content } : {}),
    ...(attribution.utm_term ? { utm_term: attribution.utm_term } : {}),
    ...(attribution.first_visit_at ? { first_visit_at: attribution.first_visit_at } : {}),
    submitted_at: new Date().toISOString(),
    user_agent: isBrowser() ? navigator.userAgent : '',
    referrer: isBrowser() ? document.referrer || '' : '',
  };

  const explicitEndpoint = import.meta.env.VITE_LEAD_ENDPOINT;

  try {
    let ok = false;

    if (explicitEndpoint) {
      const res = await fetch(explicitEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      ok = res.ok;
    } else {
      // Fallback to the existing backend lead endpoint already in production.
      const res = await api.post('/submit-lead', payload);
      ok = !!res?.data?.success || res?.status === 200 || res?.status === 201;
    }

    if (ok) {
      markSubmitted();
      trackEvent(LP_EVENTS.FORM_SUBMIT_LEAD, payload);
      return { ok: true, payload };
    }

    return { ok: false, error: 'bad_response', payload };
  } catch (err) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[submitLead] failed', err, payload);
    }
    return { ok: false, error: 'network', payload };
  }
}
