const STORAGE_KEY = 'extraspace_lead_source';

/** Reads lead source saved from the (removed) survey, if any — used at registration. */
export function getStoredLeadSource() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
}
