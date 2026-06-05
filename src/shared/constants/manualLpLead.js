/** Маркеры и enum для ручных лидов — зеркало backend manualLpLead.js */

export const MANUAL_LANDING_PAGE = 'manual';
export const MANUAL_PAGE_SECTION = 'Ручной лид';

export const LEAD_CHANNEL_OPTIONS = [
  { value: 'landing', label: 'Лендинг' },
  { value: 'call', label: 'Звонок' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: '2gis', label: '2GIS' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'yandex_maps', label: 'Яндекс Карты' },
  { value: 'referral', label: 'Рекомендация' },
  { value: 'in_person', label: 'Личное обращение' },
  { value: 'other', label: 'Другое' },
];

export const MANUAL_SERVICE_TYPE_OPTIONS = [
  { value: 'individual', label: 'Индивидуальное хранение' },
  { value: 'cloud', label: 'Облачное хранение' },
  { value: 'camera', label: 'Камера хранения' },
  { value: 'undecided', label: 'Не определился' },
  { value: 'other', label: 'Другое' },
];

const LP_SERVICE_LABELS = {
  individual: 'LP-1 · Аренда бокса',
  camera: 'LP-2 · Камера хранения',
  cloud: 'LP-3 · Облачное хранение',
};

const MANUAL_SERVICE_LABELS = Object.fromEntries(
  MANUAL_SERVICE_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

const LEAD_CHANNEL_LABELS = Object.fromEntries(
  LEAD_CHANNEL_OPTIONS.map((o) => [o.value, o.label]),
);

export function isManualLpLead(lead) {
  if (!lead) return false;
  return (
    lead.is_manual === true ||
    lead.landing_page === MANUAL_LANDING_PAGE ||
    lead.page_section === MANUAL_PAGE_SECTION
  );
}

export const CLIENT_TYPE_OPTIONS = [
  { value: 'b2c', label: 'B2C' },
  { value: 'b2b', label: 'B2B' },
];

export const EMPTY_CLIENT_TYPE_OPTION = { value: '', label: 'Не выбрано' };

const CLIENT_TYPE_LABELS = Object.fromEntries(
  CLIENT_TYPE_OPTIONS.map((o) => [o.value, o.label]),
);

export function getLeadChannelLabel(code) {
  if (!code) return '—';
  return LEAD_CHANNEL_LABELS[code] || code;
}

export function getClientTypeLabel(code) {
  if (!code) return 'Не выбрано';
  return CLIENT_TYPE_LABELS[code] || code;
}

/** Источник для таблицы CRM: канал ручного лида или «Лендинг» для заявок с LP. */
export function getLeadSourceDisplayLabel(lead) {
  if (!lead) return '—';
  if (lead.lead_channel) {
    return lead.lead_channel_label || getLeadChannelLabel(lead.lead_channel);
  }
  if (!isManualLpLead(lead) && lead.landing_page) return 'Лендинг';
  return '—';
}

export function getServiceDisplayLabel(row) {
  if (!row?.service_type) return '—';
  if (isManualLpLead(row)) {
    return MANUAL_SERVICE_LABELS[row.service_type] || row.service_type;
  }
  return LP_SERVICE_LABELS[row.service_type] || row.service_type;
}
