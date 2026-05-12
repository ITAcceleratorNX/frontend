/**
 * GCLID / UTM attribution module for LP pages.
 *
 * Logic per ТЗ section 3.6:
 * 1. On page load — parse gclid/utm_* from URL.
 * 2. If no stored record (or older than 90 days) — create fresh record with all current params.
 * 3. If stored record is younger than 90 days AND no new gclid/utm in URL —
 *    keep first-touch fields (gclid, utm_*, first_visit_at, landing_page),
 *    only refresh last_visit_at.
 * 4. If new gclid OR new utm_* arrives in URL — overwrite all fields (last-click).
 * 5. On form submit — getAttribution() returns the snapshot to merge into payload.
 *
 * Storage key: extraspace_attribution (separate from existing extraspace_utm_params
 * used by the main site so we don't break legacy logic).
 */

const STORAGE_KEY = 'extraspace_attribution';
const TTL_DAYS = 90;
const TTL_MS = TTL_DAYS * 24 * 60 * 60 * 1000;

const TRACKED_PARAMS = [
  'gclid',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];

const isBrowser = () => typeof window !== 'undefined' && typeof localStorage !== 'undefined';

/**
 * @returns {Record<string, string>} Tracked params present in current URL.
 */
function readUrlParams() {
  if (!isBrowser()) return {};
  const search = new URLSearchParams(window.location.search);
  const found = {};
  TRACKED_PARAMS.forEach((key) => {
    const value = search.get(key);
    if (value) found[key] = value.trim();
  });
  return found;
}

function readStored() {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStored(record) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    /* ignore quota errors */
  }
}

function isExpired(record) {
  if (!record?.first_visit_at) return true;
  const firstVisit = Date.parse(record.first_visit_at);
  if (Number.isNaN(firstVisit)) return true;
  return Date.now() - firstVisit > TTL_MS;
}

function buildFreshRecord(urlParams) {
  if (!isBrowser()) return null;
  const now = new Date().toISOString();
  const record = {
    first_visit_at: now,
    last_visit_at: now,
    landing_page: window.location.pathname || '/',
    referrer: document.referrer || '',
  };
  TRACKED_PARAMS.forEach((key) => {
    if (urlParams[key]) record[key] = urlParams[key];
  });
  return record;
}

/**
 * Initialize attribution on LP mount (or app boot).
 *
 * Idempotent: subsequent calls within the same page load are safe — they bump
 * `last_visit_at` but only overwrite the rest if a *different* gclid/utm_*
 * arrived in the URL.
 *
 * @returns {object|null} The current attribution record (after init).
 */
export function initAttribution() {
  if (!isBrowser()) return null;
  const urlParams = readUrlParams();
  const stored = readStored();

  const hasUrlParams = TRACKED_PARAMS.some((key) => urlParams[key]);

  // Case 1 — no record yet, or it's older than 90 days → fresh record.
  if (!stored || isExpired(stored)) {
    const fresh = buildFreshRecord(urlParams);
    if (fresh) writeStored(fresh);
    return fresh;
  }

  // Case 2 — URL carries gclid/utm and at least one differs from stored → new
  // click from a different ad, last-click attribution kicks in (overwrite).
  if (hasUrlParams) {
    const isNewClick = TRACKED_PARAMS.some(
      (key) => urlParams[key] && urlParams[key] !== stored[key],
    );
    if (isNewClick) {
      const refreshed = buildFreshRecord(urlParams);
      if (refreshed) writeStored(refreshed);
      return refreshed;
    }
  }

  // Case 3 — same params (or none in URL) → keep first-touch, bump last_visit.
  const updated = {
    ...stored,
    last_visit_at: new Date().toISOString(),
  };
  writeStored(updated);
  return updated;
}

/**
 * Read current attribution snapshot for inclusion in payloads.
 * @returns {object|null}
 */
export function getAttribution() {
  if (!isBrowser()) return null;
  const stored = readStored();
  if (!stored) return null;
  if (isExpired(stored)) return null;
  return stored;
}

/**
 * For tests / manual reset.
 */
export function clearAttribution() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
