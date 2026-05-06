import api from './axios';

/**
 * Заявки с лендингов LP-1/2/3 (форма submitLead).
 *
 * GET /leads/landing-pages — query-параметры (опционально на бэкенде):
 *   limit, offset — пагинация
 *   service_type — individual | camera | cloud
 *   landing_page — точный путь, напр. /lp/arenda-boksa-almaty
 *   client_type — b2c | b2b
 *   q — поиск по имени/телефону
 *   date_from, date_to — ISO-дата (день)
 *
 * Ответ:
 *   - массив объектов → total = длина массива
 *   - объект с массивом + total | count — серверная пагинация
 */
function normalizeItemsArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.leads)) return data.leads;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.items)) return data.items;
  if (data.success && Array.isArray(data.result)) return data.result;
  return [];
}

function parseLandingLeadsResponse(data) {
  const items = normalizeItemsArray(data);
  if (Array.isArray(data)) {
    return { items, total: items.length };
  }
  const rawTotal = data?.total ?? data?.count;
  const total = typeof rawTotal === 'number' && Number.isFinite(rawTotal) ? rawTotal : items.length;
  return { items, total };
}

export const lpLeadsApi = {
  /**
   * @param {object} [params]
   * @returns {Promise<{ items: object[], total: number }>}
   */
  async getLandingPageLeads(params = {}) {
    const response = await api.get('/leads/landing-pages', { params });
    return parseLandingLeadsResponse(response.data);
  },
};
