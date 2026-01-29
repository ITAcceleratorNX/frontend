import api from './axios';

/**
 * Track first visit (public, no auth). Idempotent on backend.
 * @param {{ visitor_id: string, lead_source: string, utm_source?: string, utm_medium?: string, utm_campaign?: string, utm_content?: string, utm_term?: string }} payload
 */
export async function trackVisit(payload) {
  const { visitor_id, lead_source, utm_source, utm_medium, utm_campaign, utm_content, utm_term } = payload;
  await api.post('/visits/track', {
    visitor_id,
    lead_source,
    ...(utm_source && { utm_source }),
    ...(utm_medium && { utm_medium }),
    ...(utm_campaign && { utm_campaign }),
    ...(utm_content && { utm_content }),
    ...(utm_term && { utm_term }),
  });
}
