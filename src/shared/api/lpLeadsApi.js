import api from './axios';

function getListPath() {
  const fromEnv = import.meta.env.VITE_LP_LEADS_GET_PATH;
  return (typeof fromEnv === 'string' && fromEnv.trim()) || '/leads/landing-pages';
}

function isLikelyLeadRow(item) {
  return (
    item &&
    typeof item === 'object' &&
    ('phone' in item || 'name' in item || 'landing_page' in item || 'service_type' in item)
  );
}

function normalizeItemsArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const tryKeys = ['leads', 'items', 'rows', 'records', 'list', 'results', 'payload', 'body'];
  for (const key of tryKeys) {
    if (Array.isArray(data[key])) return data[key];
  }

  if (Array.isArray(data.data)) return data.data;
  if (data.success && Array.isArray(data.result)) return data.result;

  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    const inner = data.data;
    for (const key of tryKeys) {
      if (Array.isArray(inner[key])) return inner[key];
    }
  }

  return [];
}

function parseLandingLeadsResponse(data) {
  const items = normalizeItemsArray(data);
  if (Array.isArray(data)) {
    return { items, total: items.length };
  }
  const rawTotal = data?.total ?? data?.count ?? data?.meta?.total;
  const total = typeof rawTotal === 'number' && Number.isFinite(rawTotal) ? rawTotal : items.length;
  return { items, total };
}

function buildListQueryParams(params = {}) {
  const out = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === '' || value === undefined || value === null) continue;
    out[key] = value;
  }
  return out;
}

export const lpLeadsApi = {
  /**
   * @param {object} [params]
   * @returns {Promise<{ items: object[], total: number }>}
   */
  async getLandingPageLeads(params = {}) {
    const path = getListPath();
    const response = await api.get(path, { params: buildListQueryParams(params) });
    return parseLandingLeadsResponse(response.data);
  },

  /**
   * @param {number|string} id
   * @returns {Promise<object>}
   */
  async getLandingPageLeadById(id) {
    const path = `${getListPath()}/${id}`;
    const response = await api.get(path);
    return response.data?.lead ?? response.data;
  },

  /**
   * @param {number|string} id
   * @param {object} body
   * @returns {Promise<object>}
   */
  async updateLandingPageLead(id, body) {
    const path = `${getListPath()}/${id}`;
    const response = await api.patch(path, body);
    return response.data?.lead ?? response.data;
  },

  /**
   * @param {object} [params] — те же фильтры, что у списка (без limit/offset)
   */
  async exportLandingPageLeads(params = {}) {
    const { limit, offset, ...rest } = params;
    const path = `${getListPath()}/export`;
    const response = await api.get(path, {
      params: buildListQueryParams(rest),
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lp_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  },
};
