/**
 * Хелперы для производных статусов оплаты заказа.
 * Не используем «Частично оплачен» — по спецификации офлайн-оплаты заказ может быть
 * либо полностью оплачен, либо иметь «Оплачен текущий период», либо ждать оплату.
 */

const PAID_STATUS = 'PAID';

const parseYmd = (value) => {
  if (!value) return null;
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  const ymd = String(value).slice(0, 10);
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  const parsed = new Date(Date.UTC(y, m - 1, d));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const todayUtcMidnight = (now = new Date()) => {
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
};

/**
 * Сортирует order_payments по billing_period_start (NULL — в конец).
 */
const sortPaymentsByBillingStart = (payments) => {
  return [...payments].sort((a, b) => {
    const aDate = parseYmd(a?.billing_period_start);
    const bDate = parseYmd(b?.billing_period_start);
    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return aDate.getTime() - bDate.getTime();
  });
};

/**
 * Возвращает текущий биллинг-период заказа: order_payment, чей billing_period_start <= today < next.billing_period_start.
 * Для последнего периода — если today >= billing_period_start, он считается «текущим» до конца.
 * Возвращает null, если у заказа нет периодов с заполненным billing_period_start или today раньше первого.
 */
export const getCurrentBillingPeriod = (order, now = new Date()) => {
  const payments = Array.isArray(order?.order_payment) ? order.order_payment : [];
  if (payments.length === 0) return null;

  const today = todayUtcMidnight(now);
  const sorted = sortPaymentsByBillingStart(payments).filter(
    (p) => parseYmd(p.billing_period_start) != null
  );
  if (sorted.length === 0) return null;

  for (let i = 0; i < sorted.length; i += 1) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const currentStart = parseYmd(current.billing_period_start);
    const nextStart = next ? parseYmd(next.billing_period_start) : null;

    if (today < currentStart) {
      return null;
    }
    if (!nextStart || today < nextStart) {
      return current;
    }
  }
  return null;
};

/**
 * true, если у заказа есть «текущий» оплаченный период, но при этом заказ ещё не полностью оплачен.
 */
export const isCurrentPeriodPaidButOrderUnpaid = (order, now = new Date()) => {
  if (!order || order.payment_status === PAID_STATUS) return false;
  const current = getCurrentBillingPeriod(order, now);
  return current?.status === PAID_STATUS;
};
