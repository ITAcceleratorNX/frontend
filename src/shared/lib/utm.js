/**
 * UTM params parsing and mapping to lead_source.
 * Used for first-visit tracking (2GIS, TikTok, Instagram, WhatsApp, etc.)
 */

const VISITOR_ID_COOKIE = 'extraspace_visitor_id';
const VISITOR_ID_MAX_AGE_DAYS = 365;

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

const VALID_LEAD_SOURCES = ['site', 'whatsapp', '2gis', 'instagram', 'tiktok', 'ads'];

/** Normalize utm_source to our lead_source enum */
const UTM_SOURCE_TO_LEAD = {
  site: 'site',
  whatsapp: 'whatsapp',
  '2gis': '2gis',
  '2 gis': '2gis',
  '2gis.ru': '2gis',
  instagram: 'instagram',
  ig: 'instagram',
  tiktok: 'tiktok',
  tt: 'tiktok',
  ads: 'ads',
  ad: 'ads',
  google: 'ads',
  yandex: 'ads',
  facebook: 'ads',
  vk: 'ads',
  telegram: 'ads',
};

/**
 * @returns {Record<string, string>} UTM params from window.location.search
 */
export function getUtmParams() {
  if (typeof window === 'undefined') return {};
  const search = new URLSearchParams(window.location.search);
  const params = {};
  UTM_KEYS.forEach((key) => {
    const value = search.get(key);
    if (value) params[key] = value.trim();
  });
  return params;
}

/**
 * @param {string} [utmSource] raw utm_source value
 * @returns {string|null} lead_source enum or null if unknown
 */
export function mapUtmSourceToLeadSource(utmSource) {
  if (!utmSource || typeof utmSource !== 'string') return null;
  const normalized = utmSource.toLowerCase().trim();
  if (UTM_SOURCE_TO_LEAD[normalized]) return UTM_SOURCE_TO_LEAD[normalized];
  if (VALID_LEAD_SOURCES.includes(normalized)) return normalized;
  return 'ads';
}

/**
 * @returns {boolean}
 */
export function hasUtmParams() {
  const params = getUtmParams();
  return Object.keys(params).length > 0;
}

/**
 * Get or create visitor id (cookie, 1 year). Used for first-visit tracking.
 * @returns {string}
 */
export function getOrCreateVisitorId() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp(`${VISITOR_ID_COOKIE}=([^;]+)`));
  if (match) return match[1];
  const id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  const expires = new Date();
  expires.setDate(expires.getDate() + VISITOR_ID_MAX_AGE_DAYS);
  document.cookie = `${VISITOR_ID_COOKIE}=${id}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
  return id;
}

/**
 * Remove UTM params from URL without reload (replaceState).
 */
export function cleanUrlFromUtm() {
  if (typeof window === 'undefined' || !window.history?.replaceState) return;
  const url = new URL(window.location.href);
  let changed = false;
  UTM_KEYS.forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  });
  if (changed) {
    const newUrl = url.pathname + (url.search || '') + (url.hash || '');
    window.history.replaceState({}, '', newUrl);
  }
}
