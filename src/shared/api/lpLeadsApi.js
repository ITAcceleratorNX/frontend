import api from './axios';

/**
 * Путь к списку лидов с лендингов. Если бэкенд вешает роут иначе — задайте в .env:
 *   VITE_LP_LEADS_GET_PATH=/api/leads/landing-pages
 */
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

/** Явные ключи, где бэкенд кладёт массив заявок */
function normalizeItemsArray(data) {
  if (!data) return [];
  if (Array.isArray(data)) return data;

  const tryKeys = ['leads', 'items', 'rows', 'records', 'list', 'results', 'payload', 'body'];
  for (const key of tryKeys) {
    if (Array.isArray(data[key])) return data[key];
  }

  if (Array.isArray(data.data)) return data.data;
  if (data.success && Array.isArray(data.result)) return data.result;

  // { data: { leads: [...] } } и похожие вложения (один уровень)
  if (data.data && typeof data.data === 'object' && !Array.isArray(data.data)) {
    const inner = data.data;
    for (const key of tryKeys) {
      if (Array.isArray(inner[key])) return inner[key];
    }
  }

  // Последний шанс: обход дерева в поисках массива объектов «как лиды»
  const found = findLeadArrayDeep(data, 0);
  if (import.meta.env.DEV && found.length === 0 && typeof data === 'object') {
    // eslint-disable-next-line no-console
    console.warn(
      '[lpLeadsApi] Не удалось извлечь массив лидов из ответа. Ключи корня:',
      Object.keys(data),
    );
  }
  return found;
}

function findLeadArrayDeep(node, depth) {
  if (depth > 6 || node == null) return [];
  if (Array.isArray(node)) {
    if (node.length === 0) return [];
    return isLikelyLeadRow(node[0]) ? node : [];
  }
  if (typeof node !== 'object') return [];

  for (const v of Object.values(node)) {
    if (Array.isArray(v) && v.length > 0 && isLikelyLeadRow(v[0])) return v;
  }
  for (const v of Object.values(node)) {
    if (v && typeof v === 'object') {
      const inner = findLeadArrayDeep(v, depth + 1);
      if (inner.length) return inner;
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

export const lpLeadsApi = {
  /**
   * @param {object} [params]
   * @returns {Promise<{ items: object[], total: number }>}
   */
  async getLandingPageLeads(params = {}) {
    const path = getListPath();
    const response = await api.get(path, { params });
    return parseLandingLeadsResponse(response.data);
  },
};
