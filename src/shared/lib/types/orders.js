// Типы данных для заказов

/**
 * Статусы заказов
 */
export const ORDER_STATUSES = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  APPROVED: 'APPROVED',
  PROCESSING: 'PROCESSING'
};

/**
 * Статусы платежей
 */
export const PAYMENT_STATUSES = {
  PAID: 'PAID',
  UNPAID: 'UNPAID'
};

/**
 * Статусы договоров
 */
export const CONTRACT_STATUSES = {
  SIGNED: 'SIGNED',
  UNSIGNED: 'UNSIGNED'
};

/**
 * Статусы хранилищ
 */
export const STORAGE_STATUSES = {
  VACANT: 'VACANT',
  OCCUPIED: 'OCCUPIED',
  PENDING: 'PENDING'
};

/**
 * Типы маркировки груза
 */
export const CARGO_MARKS = {
  NO: 'NO',           // Обычный
  HEAVY: 'HEAVY',     // Тяжелый
  FRAGILE: 'FRAGILE'  // Хрупкий
};

/**
 * Типы хранилищ
 */
export const STORAGE_TYPES = {
  INDIVIDUAL: 'INDIVIDUAL',
  RACK: 'RACK'
};

/**
 * Функции для работы со статусами
 */
export const getOrderStatusText = (status) => {
  const texts = {
    [ORDER_STATUSES.INACTIVE]: 'Неактивный',
    [ORDER_STATUSES.APPROVED]: 'Подтвержден',
    [ORDER_STATUSES.PROCESSING]: 'В обработке',
    [ORDER_STATUSES.ACTIVE]: 'Активный'
  };
  return texts[status] || status;
};

export const getPaymentStatusText = (status) => {
  return status === PAYMENT_STATUSES.PAID ? 'Оплачено' : 'Не оплачено';
};

export const getContractStatusText = (status) => {
  return status === CONTRACT_STATUSES.SIGNED ? 'Подписан' : 'Не подписан';
};

export const getCargoMarkText = (mark) => {
  const texts = {
    [CARGO_MARKS.NO]: 'Обычный',
    [CARGO_MARKS.HEAVY]: 'Тяжелый',
    [CARGO_MARKS.FRAGILE]: 'Хрупкий'
  };
  return texts[mark] || mark;
};

/**
 * Функции для получения CSS классов статусов
 */
export const getOrderStatusClass = (status) => {
  const classes = {
    [ORDER_STATUSES.INACTIVE]: 'bg-red-100 text-red-700 border-red-200',
    [ORDER_STATUSES.APPROVED]: 'bg-green-100 text-green-700 border-green-200',
    [ORDER_STATUSES.PROCESSING]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    [ORDER_STATUSES.ACTIVE]: 'bg-blue-100 text-blue-700 border-blue-200'
  };
  return classes[status] || 'bg-gray-100 text-gray-700 border-gray-200';
};

export const getPaymentStatusClass = (status) => {
  return status === PAYMENT_STATUSES.PAID 
    ? 'bg-green-100 text-green-700' 
    : 'bg-red-100 text-red-700';
};

export const getContractStatusClass = (status) => {
  return status === CONTRACT_STATUSES.SIGNED 
    ? 'bg-green-100 text-green-700' 
    : 'bg-orange-100 text-orange-700';
}; 