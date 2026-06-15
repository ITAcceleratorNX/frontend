export const STATUS_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: ['UNPAID', 'MANUAL'], label: 'Не оплачено' },
  { value: 'PAID', label: 'Оплачено' },
];

export const STATUS_LABEL = {
  UNPAID: 'Не оплачено',
  MANUAL: 'Не оплачено',
  PAID: 'Оплачено',
  CANCELED: 'Отменён',
};

const currentYear = new Date().getFullYear();

export const MONTHS = [
  { value: '', label: 'Любой месяц' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: String(i + 1).padStart(2, '0') })),
];

export const YEARS = [
  { value: '', label: 'Любой год' },
  ...Array.from({ length: 6 }, (_, i) => ({ value: String(currentYear - i), label: String(currentYear - i) })),
];

export const isUnpaidStatus = (status) => status === 'UNPAID' || status === 'MANUAL';
