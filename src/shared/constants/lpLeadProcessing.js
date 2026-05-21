/** LP lead processing enums — mirror of backend lpLeadProcessing.js */

export const PROCESSING_STATE = ['unprocessed', 'has_data', 'closed'];

export const PROCESSING_STATE_LABELS = {
  unprocessed: 'Не обработан',
  has_data: 'Есть данные',
  closed: 'Закрыт',
};

export const LEAD_STATUS_OPTIONS = [
  { value: 'new', label: 'Новый' },
  { value: 'in_work', label: 'В работе' },
  { value: 'no_answer', label: 'Не дозвонились' },
  { value: 'consultation_done', label: 'Консультация проведена' },
  { value: 'interested', label: 'Заинтересован' },
  { value: 'booking', label: 'Бронь / оформление' },
  { value: 'paid_client', label: 'Оплатил / стал клиентом' },
  { value: 'refused', label: 'Отказ' },
  { value: 'not_target', label: 'Нецелевой' },
  { value: 'duplicate', label: 'Дубль' },
];

export const LEAD_QUALITY_OPTIONS = [
  { value: 'hot', label: 'Горячий' },
  { value: 'warm', label: 'Тёплый' },
  { value: 'cold', label: 'Холодный' },
  { value: 'not_target', label: 'Нецелевой' },
  { value: 'duplicate', label: 'Дубль' },
  { value: 'spam', label: 'Спам / ошибочная заявка' },
];

export const ACTUAL_INTEREST_OPTIONS = [
  { value: 'individual_storage', label: 'Индивидуальное хранение' },
  { value: 'cloud_storage', label: 'Облачное хранение' },
  { value: 'camera_storage', label: 'Камера хранения' },
  { value: 'delivery', label: 'Доставка' },
  { value: 'unknown', label: 'Не знает, что выбрать' },
  { value: 'other', label: 'Другое' },
];

export const REQUEST_SCENARIO_OPTIONS = [
  { value: 'relocation_renovation', label: 'Переезд / ремонт' },
  { value: 'furniture_storage', label: 'Хранение мебели' },
  { value: 'seasonal_items', label: 'Сезонные вещи' },
  { value: 'luggage', label: 'Чемоданы / сумки' },
  { value: 'documents_archive', label: 'Документы / архив' },
  { value: 'business_goods', label: 'Товары для бизнеса' },
  { value: 'equipment', label: 'Оборудование' },
  { value: 'temporary_storage', label: 'Временное хранение' },
  { value: 'long_term_storage', label: 'Долгосрочное хранение' },
  { value: 'price_inquiry', label: 'Просто узнаёт цену' },
  { value: 'other', label: 'Другое' },
];

export const STORAGE_DURATION_OPTIONS = [
  { value: 'up_to_1_day', label: 'До 1 дня' },
  { value: '1_7_days', label: '1–7 дней' },
  { value: '1_2_weeks', label: '1–2 недели' },
  { value: 'up_to_1_month', label: 'До 1 месяца' },
  { value: '1_3_months', label: '1–3 месяца' },
  { value: '3_plus_months', label: '3+ месяца' },
  { value: 'not_specified', label: 'Не уточнили' },
];

export const STORAGE_ITEMS_OPTIONS = [
  { value: 'luggage', label: 'Чемоданы / сумки' },
  { value: 'furniture', label: 'Мебель' },
  { value: 'appliances', label: 'Бытовая техника' },
  { value: 'seasonal_items', label: 'Сезонные вещи' },
  { value: 'documents_archive', label: 'Документы / архив' },
  { value: 'business_goods', label: 'Товар для бизнеса' },
  { value: 'equipment', label: 'Оборудование' },
  { value: 'personal_items', label: 'Личные вещи' },
  { value: 'other', label: 'Другое' },
];

export const REJECTION_REASON_OPTIONS = [
  { value: 'expensive', label: 'Дорого' },
  { value: 'bad_location', label: 'Не подходит локация' },
  { value: 'bad_duration', label: 'Не подходит срок хранения' },
  { value: 'bad_format', label: 'Не подходит формат услуги' },
  { value: 'found_alternative', label: 'Нашёл другой вариант' },
  { value: 'no_response', label: 'Не отвечает' },
  { value: 'just_curious', label: 'Просто интересовался' },
  { value: 'service_unavailable', label: 'Нужна услуга, которой нет' },
  { value: 'wrong_request', label: 'Ошибочная заявка' },
  { value: 'other', label: 'Другое' },
];

export const NEXT_ACTION_OPTIONS = [
  { value: 'call_back', label: 'Перезвонить' },
  { value: 'whatsapp', label: 'Написать в WhatsApp' },
  { value: 'send_terms', label: 'Отправить условия' },
  { value: 'await_decision', label: 'Ждём решения клиента' },
  { value: 'await_payment', label: 'Ждём оплату' },
  { value: 'no_action', label: 'Закрыто, действие не требуется' },
];

export const LEAD_OUTCOME_OPTIONS = [
  { value: 'sale', label: 'Продажа' },
  { value: 'in_progress', label: 'В процессе' },
  { value: 'call_later', label: 'Перезвонить позже' },
  { value: 'potential_future', label: 'Потенциальный клиент на будущее' },
  { value: 'refused', label: 'Отказался' },
  { value: 'not_target', label: 'Нецелевой' },
  { value: 'duplicate', label: 'Дубль' },
  { value: 'no_contact', label: 'Не удалось связаться' },
];

export const PROCESSING_FILTER_OPTIONS = [
  { value: '', label: 'Все' },
  ...PROCESSING_STATE.map((v) => ({ value: v, label: PROCESSING_STATE_LABELS[v] })),
];

function withAllOption(options, allLabel = 'Все') {
  return [{ value: '', label: allLabel }, ...options];
}

export const LEAD_STATUS_FILTER_OPTIONS = withAllOption(LEAD_STATUS_OPTIONS);
export const LEAD_QUALITY_FILTER_OPTIONS = withAllOption(LEAD_QUALITY_OPTIONS);
export const ACTUAL_INTEREST_FILTER_OPTIONS = withAllOption(ACTUAL_INTEREST_OPTIONS);
export const LEAD_OUTCOME_FILTER_OPTIONS = withAllOption(LEAD_OUTCOME_OPTIONS);
export const REJECTION_REASON_FILTER_OPTIONS = withAllOption(REJECTION_REASON_OPTIONS);

const LABEL_MAPS = {
  lead_status: Object.fromEntries(LEAD_STATUS_OPTIONS.map((o) => [o.value, o.label])),
  lead_quality: Object.fromEntries(LEAD_QUALITY_OPTIONS.map((o) => [o.value, o.label])),
  actual_interest: Object.fromEntries(ACTUAL_INTEREST_OPTIONS.map((o) => [o.value, o.label])),
  request_scenario: Object.fromEntries(REQUEST_SCENARIO_OPTIONS.map((o) => [o.value, o.label])),
  storage_duration: Object.fromEntries(STORAGE_DURATION_OPTIONS.map((o) => [o.value, o.label])),
  storage_items: Object.fromEntries(STORAGE_ITEMS_OPTIONS.map((o) => [o.value, o.label])),
  rejection_reason: Object.fromEntries(REJECTION_REASON_OPTIONS.map((o) => [o.value, o.label])),
  next_action: Object.fromEntries(NEXT_ACTION_OPTIONS.map((o) => [o.value, o.label])),
  lead_outcome: Object.fromEntries(LEAD_OUTCOME_OPTIONS.map((o) => [o.value, o.label])),
};

export function displayValue(value) {
  if (value == null || value === '') return '—';
  return String(value);
}

export function getFieldLabel(field, code) {
  if (!code) return '—';
  return LABEL_MAPS[field]?.[code] || code;
}

export function getActionButtonLabel(processingState) {
  switch (processingState) {
    case 'unprocessed':
      return 'Обработать лид';
    case 'has_data':
      return 'Редактировать данные';
    case 'closed':
      return 'Посмотреть лид';
    default:
      return 'Открыть лид';
  }
}

export function processingStateBadgeClass(state) {
  switch (state) {
    case 'unprocessed':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'has_data':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'closed':
      return 'bg-gray-100 text-gray-700 border-gray-200';
    default:
      return 'bg-gray-50 text-gray-600 border-gray-200';
  }
}

/** Form fields sent on PATCH */
export const PROCESSING_FORM_KEYS = [
  'lead_status',
  'lead_quality',
  'actual_interest',
  'request_scenario',
  'storage_duration',
  'storage_items',
  'rejection_reason',
  'next_action',
  'next_contact_at',
  'lead_outcome',
  'manager_comment',
];

export function leadToFormState(lead) {
  if (!lead) return {};
  const nextContact = lead.next_contact_at
    ? new Date(lead.next_contact_at).toISOString().slice(0, 10)
    : '';
  return {
    lead_status: lead.lead_status || '',
    lead_quality: lead.lead_quality || '',
    actual_interest: lead.actual_interest || '',
    request_scenario: lead.request_scenario || '',
    storage_duration: lead.storage_duration || '',
    storage_items: lead.storage_items || '',
    rejection_reason: lead.rejection_reason || '',
    next_action: lead.next_action || '',
    next_contact_at: nextContact,
    lead_outcome: lead.lead_outcome || '',
    manager_comment: lead.manager_comment || '',
  };
}

export function formStateToPayload(form) {
  const payload = {};
  for (const key of PROCESSING_FORM_KEYS) {
    if (!Object.prototype.hasOwnProperty.call(form, key)) continue;
    const v = form[key];
    if (key === 'next_contact_at') {
      payload[key] = v ? new Date(`${v}T12:00:00`).toISOString() : null;
    } else if (key === 'manager_comment') {
      payload[key] = v?.trim() ? v.trim() : null;
    } else {
      payload[key] = v || null;
    }
  }
  return payload;
}
