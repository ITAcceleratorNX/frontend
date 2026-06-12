import React, { useEffect, useMemo, useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { paymentsApi } from '../../../shared/api/paymentsApi';
import { ordersApi } from '../../../shared/api/ordersApi';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { getOrderStatusText } from '../../../shared/lib/types/orders';
import { formatCalendarDateLong } from '../../../shared/lib/utils/date';
import { CONTRACT_EXPIRY_STATUS, getOrderContractExpiry } from '../../../shared/lib/orderContractExpiry';
import OrderDetailView from './OrderDetailView';
import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  CreditCard,
  ExternalLink,
  FileText,
  Loader2,
} from 'lucide-react';

const VISIBLE_PAYMENTS = 4;

const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') return 'Индивидуальное';
  if (type === 'CLOUD') return 'Облачное';
  if (type === 'CAMERA') return 'Камера хранения';
  return type || '—';
};

const getPaymentType = (order) => {
  if (order.payment_type) return order.payment_type;
  return (order.order_payment?.length ?? 0) > 1 ? 'MONTHLY' : 'FULL';
};

const getPaymentTypeText = (order) => {
  const type = getPaymentType(order);
  if (type === 'MONTHLY') return 'Ежемесячная';
  if (type === 'FULL') return 'Полная';
  return '—';
};

const pluralDays = (n) => {
  const abs = Math.abs(n);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'дней';
  if (mod10 === 1) return 'день';
  if (mod10 >= 2 && mod10 <= 4) return 'дня';
  return 'дней';
};

const formatDaysRemaining = (expiry) => {
  if (expiry.status === CONTRACT_EXPIRY_STATUS.NO_END_DATE) {
    return 'Дата окончания не указана';
  }
  const days = expiry.daysRemaining;
  if (days == null) return 'Дата окончания не указана';
  if (days < 0) {
    const ago = Math.abs(days);
    return `Договор истёк ${ago} ${pluralDays(ago)} назад`;
  }
  if (days === 0) return 'Договор истекает сегодня';
  return `Осталось ${days} ${pluralDays(days)}`;
};

const getMonthName = (month) => {
  const names = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
  ];
  return names[month - 1] || month;
};

const formatPrice = (value) => {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${Number(value).toLocaleString('ru-RU')} ₸`;
};

const getServicesTotal = (order) =>
  (order.services || []).reduce((sum, service) => {
    const svc = service.OrderService || service.order_service;
    const price = svc?.total_price ?? svc?.amount;
    return sum + (price ? Number(price) : 0);
  }, 0);

const getMonthlyAmount = (order) => {
  if (getPaymentType(order) !== 'MONTHLY') return null;
  if (order.order_payment?.length) return Number(order.order_payment[0].amount);

  const total = Math.max(0, Number(order.total_price) + getServicesTotal(order) - Number(order.discount_amount || 0));
  if (!order.start_date || !order.end_date) return null;

  const start = new Date(order.start_date);
  const end = new Date(order.end_date);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return months > 0 ? Math.round(total / months) : null;
};

const sortPayments = (payments) =>
  [...payments].sort((a, b) => (a.year - b.year) || (a.month - b.month));

const sortActiveOrders = (orders) => {
  const weight = {
    [CONTRACT_EXPIRY_STATUS.EXPIRED]: 0,
    [CONTRACT_EXPIRY_STATUS.ENDING_SOON]: 1,
    [CONTRACT_EXPIRY_STATUS.OK]: 2,
    [CONTRACT_EXPIRY_STATUS.NO_END_DATE]: 3,
  };

  return [...orders].sort((a, b) => {
    const ea = getOrderContractExpiry(a);
    const eb = getOrderContractExpiry(b);
    const w = (weight[ea.status] ?? 9) - (weight[eb.status] ?? 9);
    if (w !== 0) return w;
    return (ea.daysRemaining ?? 99999) - (eb.daysRemaining ?? 99999);
  });
};

const ContractBadge = ({ order }) => {
  const expiry = getOrderContractExpiry(order);
  const base = 'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border';

  if (expiry.status === CONTRACT_EXPIRY_STATUS.NO_END_DATE) {
    return <span className={`${base} bg-gray-100 text-gray-700 border-gray-200`}><FileText className="w-3 h-3" />Дата не указана</span>;
  }
  if (expiry.status === CONTRACT_EXPIRY_STATUS.EXPIRED) {
    return <span className={`${base} bg-rose-50 text-rose-700 border-rose-200`}><FileText className="w-3 h-3" />Договор истёк</span>;
  }
  if (expiry.status === CONTRACT_EXPIRY_STATUS.ENDING_SOON) {
    return <span className={`${base} bg-amber-50 text-amber-800 border-amber-200`}><FileText className="w-3 h-3" />Скоро заканчивается</span>;
  }
  return <span className={`${base} bg-emerald-50 text-emerald-700 border-emerald-200`}><FileText className="w-3 h-3" />Договор действует</span>;
};

const PaymentMonthStatus = ({ status }) => {
  const cls = status === 'PAID'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
    : status === 'MANUAL'
      ? 'bg-amber-50 text-amber-800 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200';
  const label = status === 'PAID' ? 'Оплачено' : status === 'MANUAL' ? 'Ожидает оплаты' : 'Не оплачено';
  return <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium border ${cls}`}>{label}</span>;
};

const PaymentsBlock = ({ payments }) => {
  const [showAll, setShowAll] = useState(false);
  const sorted = sortPayments(payments);

  if (!sorted.length) {
    return <p className="text-sm text-gray-500">Нет данных об оплатах</p>;
  }

  const now = new Date();
  const idx = sorted.findIndex((p) => p.month === now.getMonth() + 1 && p.year === now.getFullYear());
  const start = idx === -1 ? 0 : Math.max(0, idx - 1);
  const visible = showAll ? sorted : sorted.slice(start, start + VISIBLE_PAYMENTS);

  return (
    <div className="space-y-2">
      {visible.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2 py-1 border-b border-gray-100 last:border-0">
          <span className="text-sm text-gray-700">{getMonthName(p.month)} {p.year}</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{formatPrice(p.amount)}</span>
            <PaymentMonthStatus status={p.status} />
          </div>
        </div>
      ))}
      {sorted.length > VISIBLE_PAYMENTS && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="inline-flex items-center gap-1 text-xs font-medium text-[#00A991] hover:text-[#008f7a]"
        >
          {showAll ? <><ChevronUp className="w-3.5 h-3.5" />Свернуть</> : <><ChevronDown className="w-3.5 h-3.5" />Показать все ({sorted.length})</>}
        </button>
      )}
    </div>
  );
};

const ActiveOrderCard = ({ order, warehouseName, onOpen }) => {
  const expiry = getOrderContractExpiry(order);
  const endDate = order.contract_end_date || order.end_date;
  const box = order.storage?.storage_type === 'CAMERA' ? '' : order.storage?.name;
  const monthlyAmount = getMonthlyAmount(order);

  return (
    <article className="rounded-xl border border-gray-200 bg-gray-50/40 p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-[#00A991]">#{order.id}</span>
            <Badge variant="outline" className="text-xs">{getOrderStatusText(order.status)}</Badge>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <ContractBadge order={order} />
            {order.extension_status === 'PENDING' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-800 border border-orange-200">
                Ожидает продления
              </span>
            )}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="shrink-0 border-[#00A991] text-[#00A991] hover:bg-[#00A991]/10"
          onClick={() => onOpen(order)}
        >
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Открыть заказ
        </Button>
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <dt className="text-xs text-gray-500">Склад / бокс</dt>
          <dd className="text-gray-900">{[warehouseName, box].filter(Boolean).join(' • ') || '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Тип хранения</dt>
          <dd className="text-gray-900">{getStorageTypeText(order.storage?.storage_type)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Ежемесячная оплата</dt>
          <dd className="text-gray-900">{monthlyAmount != null ? formatPrice(monthlyAmount) : '—'}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Тип оплаты</dt>
          <dd className="text-gray-900">{getPaymentTypeText(order)}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Дата окончания договора</dt>
          <dd className="text-gray-900">{endDate ? formatCalendarDateLong(endDate) : 'Дата не указана'}</dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">До окончания</dt>
          <dd className={`font-medium ${
            expiry.status === CONTRACT_EXPIRY_STATUS.EXPIRED ? 'text-rose-700'
              : expiry.status === CONTRACT_EXPIRY_STATUS.ENDING_SOON ? 'text-amber-700'
                : expiry.status === CONTRACT_EXPIRY_STATUS.NO_END_DATE ? 'text-gray-500'
                  : 'text-emerald-700'
          }`}
          >
            {formatDaysRemaining(expiry)}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-gray-500">Оплата заказа</dt>
          <dd>
            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${
              order.payment_status === 'PAID'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                : 'border-rose-200 bg-rose-50 text-rose-700'
            }`}
            >
              <CreditCard className="h-3 w-3" />
              {order.payment_status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
            </span>
          </dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-gray-200 pt-4">
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">Оплаты по месяцам</p>
        <PaymentsBlock payments={order.order_payment || []} />
      </div>
    </article>
  );
};

const UserActiveOrders = ({ userId }) => {
  const [orders, setOrders] = useState([]);
  const [warehousesById, setWarehousesById] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;

    setLoading(true);
    setError(null);

    Promise.all([
      paymentsApi.getPaymentsByUserId(userId),
      warehouseApi.getAllWarehouses().catch(() => []),
    ])
      .then(([data, warehouses]) => {
        if (cancelled) return;
        const map = {};
        (Array.isArray(warehouses) ? warehouses : []).forEach((w) => {
          if (w?.id != null) map[w.id] = w.name || '';
        });
        setWarehousesById(map);
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.response?.data?.message || 'Не удалось загрузить заказы');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [userId]);

  const activeOrders = useMemo(
    () => sortActiveOrders(orders.filter((o) => o.status === 'ACTIVE')),
    [orders],
  );

  const warehouseName = (order) =>
    order.storage?.warehouse?.name || warehousesById[order.storage?.warehouse_id] || '';

  const openOrder = async (order) => {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const full = await ordersApi.getOrderById(order.id);
      setSelectedOrder({
        ...full,
        order_payment: order.order_payment || full.order_payment,
        payment_type: order.payment_type || getPaymentType(order),
      });
    } catch {
      setSelectedOrder(order);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <section className="mt-6 border-t border-gray-200 pt-6 sm:mt-8">
      <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-gray-900 sm:text-lg">
        <ClipboardList className="h-5 w-5 text-[#00A991]" />
        Активные заказы
      </h3>

      {loading && (
        <div className="flex items-center justify-center py-8 text-sm text-gray-500">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Загрузка заказов...
        </div>
      )}

      {!loading && error && <p className="py-4 text-sm text-rose-600">{error}</p>}
      {!loading && !error && activeOrders.length === 0 && (
        <p className="py-4 text-sm text-gray-500">Активных заказов нет</p>
      )}

      {!loading && !error && activeOrders.length > 0 && (
        <div className="space-y-4">
          {activeOrders.map((order) => (
            <ActiveOrderCard
              key={order.id}
              order={order}
              warehouseName={warehouseName(order)}
              onOpen={openOrder}
            />
          ))}
        </div>
      )}

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-h-[90vh] w-[95vw] max-w-5xl overflow-y-auto rounded-2xl border-none p-4 sm:rounded-3xl sm:p-6">
          <DialogHeader className="border-b pb-4 sm:pb-6">
            <DialogTitle className="text-lg font-semibold text-[#273655] sm:text-2xl">
              Детальная информация о заказе
            </DialogTitle>
          </DialogHeader>
          {detailLoading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" />
              Загрузка...
            </div>
          ) : selectedOrder ? (
            <div className="mt-4 sm:mt-6">
              <OrderDetailView
                order={selectedOrder}
                onUpdate={() => setDetailOpen(false)}
                onDelete={() => setDetailOpen(false)}
                onApprove={() => setDetailOpen(false)}
              />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default UserActiveOrders;
