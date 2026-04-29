import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent } from '../../components/ui/dialog';
import { Info, CreditCard, Calendar, Zap } from 'lucide-react';
import instructionImage from '../../assets/int.jpg';

const getMonthName = (month) => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[month - 1] || month;
};

const formatPrice = (price) => {
  if (!price && price !== 0) return '0';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const diffInDays = (later, earlier) => {
  return Math.round((later - earlier) / MS_IN_DAY);
};

/**
 * Прибавляет к дате `cycleIndex` календарных месяцев.
 * Использует ту же логику, что DateTime.plus({months: n}) у Luxon на бэкенде:
 * если день месяца недоступен в целевом месяце (например, 31 → 30/29/28),
 * результат «сжимается» к последнему дню месяца.
 */
const addMonths = (date, months) => {
  const result = new Date(date);
  const day = result.getDate();
  result.setDate(1);
  result.setMonth(result.getMonth() + months);
  const daysInTargetMonth = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
  result.setDate(Math.min(day, daysInTargetMonth));
  return result;
};

/**
 * Строит список месячных циклов от start_date.
 * Каждый цикл: [start + i месяцев, min(start + (i+1) месяцев, end)).
 * Возвращает массив объектов с метаданными, идентичный бэкендовому _buildBillingCycles.
 */
const buildBillingCycles = (start, end) => {
  const cycles = [];
  let cycleIndex = 0;
  let cycleStart = start;

  while (cycleStart < end) {
    const expectedCycleEnd = addMonths(start, cycleIndex + 1);
    const cycleEnd = expectedCycleEnd <= end ? expectedCycleEnd : end;
    const daysInCycle = diffInDays(cycleEnd, cycleStart);
    const fullCycleDays = diffInDays(expectedCycleEnd, cycleStart);

    cycles.push({
      cycleIndex,
      cycleStart,
      cycleEnd,
      daysInCycle,
      fullCycleDays,
      month: cycleStart.getMonth() + 1,
      year: cycleStart.getFullYear(),
    });

    cycleIndex++;
    cycleStart = cycleEnd;
  }

  return cycles;
};

const normalizePaymentAmounts = (paymentAmounts, totalPrice) => {
  let totalCalculatedAmount = 0;
  paymentAmounts.forEach((payment) => {
    payment.roundedAmount = Number(parseFloat(payment.amount).toFixed(2));
    totalCalculatedAmount += payment.roundedAmount;
  });

  const difference = totalPrice - totalCalculatedAmount;
  if (paymentAmounts.length > 0) {
    const lastIndex = paymentAmounts.length - 1;
    paymentAmounts[lastIndex].roundedAmount = Number(
      parseFloat(paymentAmounts[lastIndex].roundedAmount + difference).toFixed(2)
    );
  }
};

/**
 * Распределяет скидку пропорционально сумме каждого платежа
 * (с учётом дополнительных услуг на первом платеже).
 */
const distributeDiscount = (paymentAmounts, extraServicesAmount, discount) => {
  const discountPerPayment = [];
  const totalBeforeDiscount = paymentAmounts.reduce(
    (sum, p) => sum + p.roundedAmount,
    0
  ) + Number(extraServicesAmount);

  if (totalBeforeDiscount <= 0 || discount <= 0) {
    paymentAmounts.forEach(() => discountPerPayment.push(0));
    return discountPerPayment;
  }

  let remainingDiscount = discount;

  paymentAmounts.forEach((payment, index) => {
    const paymentTotal = index === 0
      ? payment.roundedAmount + Number(extraServicesAmount)
      : payment.roundedAmount;

    const paymentShare = paymentTotal / totalBeforeDiscount;
    let paymentDiscount = Number(parseFloat(discount * paymentShare).toFixed(2));

    paymentDiscount = Math.min(paymentDiscount, remainingDiscount);
    paymentDiscount = Math.min(paymentDiscount, paymentTotal);

    discountPerPayment.push(paymentDiscount);
    remainingDiscount -= paymentDiscount;
  });

  if (remainingDiscount > 0 && discountPerPayment.length > 0) {
    const lastIndex = discountPerPayment.length - 1;
    const lastPaymentTotal = paymentAmounts[lastIndex].roundedAmount;
    const maxAdditionalDiscount = lastPaymentTotal - discountPerPayment[lastIndex];
    discountPerPayment[lastIndex] += Math.min(remainingDiscount, maxAdditionalDiscount);
  }

  return discountPerPayment;
};

const buildPreviewRows = (paymentAmounts, extraServicesAmount, discountPerPayment) => {
  return paymentAmounts.map((payment, index) => {
    let finalAmount = payment.roundedAmount;

    if (index === 0) {
      finalAmount += Number(extraServicesAmount);
    }

    finalAmount -= discountPerPayment[index] || 0;
    finalAmount = Math.max(0, Number(parseFloat(finalAmount).toFixed(2)));

    return {
      id: index + 1,
      month: payment.month,
      year: payment.year,
      amount: finalAmount,
      daysToCharge: payment.daysToCharge,
      hasServices: index === 0 && extraServicesAmount > 0,
      isPromo: payment.isPromo,
    };
  });
};

/**
 * Генерирует платежи по месячным циклам от start_date (MONTHLY).
 * Первый платёж сразу покрывает полный месяц вперёд от даты старта,
 * каждый следующий — следующий месячный цикл; последний может быть прорейтным,
 * если контракт заканчивается раньше полного месяца.
 */
const generateMonthlyPayments = (startDateStr, monthsCount, totalPrice, extraServicesAmount = 0, discountAmount = 0) => {
  if (!startDateStr || monthsCount <= 0 || !totalPrice) return [];

  const start = startOfDay(new Date(startDateStr));
  const end = addMonths(start, monthsCount);
  const totalDays = diffInDays(end, start);
  if (totalDays <= 0) return [];

  const dailyAmount = totalPrice / totalDays;
  const cycles = buildBillingCycles(start, end);

  const paymentAmounts = cycles.map((cycle) => ({
    amount: dailyAmount * cycle.daysInCycle,
    month: cycle.month,
    year: cycle.year,
    daysToCharge: cycle.daysInCycle,
  }));

  normalizePaymentAmounts(paymentAmounts, totalPrice);

  const discount = Number(discountAmount) || 0;
  const discountPerPayment = distributeDiscount(paymentAmounts, extraServicesAmount, discount);

  return buildPreviewRows(paymentAmounts, extraServicesAmount, discountPerPayment);
};

/**
 * Генерирует помесячные платежи с учётом промо-периода.
 * Первые promoMonths циклов идут по промо-цене, остальные — по стандартной.
 * Полный цикл стоит ровно monthlyRate; неполный последний цикл прорейтится
 * пропорционально длительности.
 */
const generateSplitMonthlyPayments = (startDateStr, monthsCount, totalPrice, extraServicesAmount = 0, discountAmount = 0, pricingBreakdown = {}) => {
  if (!startDateStr || monthsCount <= 0 || !totalPrice) return [];

  const promoMonths = pricingBreakdown.promoMonths || 0;
  const promoMonthlyAmount = Number(pricingBreakdown.promoMonthlyAmount) || 0;
  const standardMonthlyAmount = Number(pricingBreakdown.standardMonthlyAmount) || 0;

  const start = startOfDay(new Date(startDateStr));
  const end = addMonths(start, monthsCount);
  const totalDays = diffInDays(end, start);
  if (totalDays <= 0) return [];

  const cycles = buildBillingCycles(start, end);

  const paymentAmounts = cycles.map((cycle) => {
    const isPromo = cycle.cycleIndex < promoMonths;
    const monthlyRate = isPromo ? promoMonthlyAmount : standardMonthlyAmount;
    const ratio = cycle.fullCycleDays > 0 ? cycle.daysInCycle / cycle.fullCycleDays : 1;

    return {
      amount: monthlyRate * ratio,
      month: cycle.month,
      year: cycle.year,
      daysToCharge: cycle.daysInCycle,
      isPromo,
    };
  });

  normalizePaymentAmounts(paymentAmounts, totalPrice);

  const discount = Number(discountAmount) || 0;
  const discountPerPayment = distributeDiscount(paymentAmounts, extraServicesAmount, discount);

  return buildPreviewRows(paymentAmounts, extraServicesAmount, discountPerPayment);
};

/**
 * Генерирует один платёж на всю сумму (FULL)
 */
const generateFullPayment = (startDateStr, monthsCount, totalPrice, extraServicesAmount = 0, discountAmount = 0) => {
  if (!startDateStr || monthsCount <= 0 || !totalPrice) return [];

  const start = startOfDay(new Date(startDateStr));
  const end = addMonths(start, monthsCount);
  const totalDays = diffInDays(end, start);

  const totalAmount = Number(totalPrice) + Number(extraServicesAmount) - Number(discountAmount || 0);
  const finalAmount = Math.max(0, Number(parseFloat(totalAmount).toFixed(2)));

  return [{
    id: 1,
    month: start.getMonth() + 1,
    year: start.getFullYear(),
    amount: finalAmount,
    daysToCharge: totalDays,
    hasServices: extraServicesAmount > 0,
    isFull: true,
  }];
};

const PaymentPreviewModal = ({
  isOpen,
  onClose,
  onConfirm,
  storageType = 'INDIVIDUAL',
  monthsCount = 1,
  startDate,
  totalPrice = 0,
  servicesTotal = 0,
  discountAmount = 0,
  priceOptions = null,
  storageInfo = {},
  isSubmitting = false,
  pricingBreakdown = null,
}) => {
  // Состояние для типа оплаты
  const [paymentType, setPaymentType] = useState('MONTHLY');

  useEffect(() => {
    if (isOpen) {
      setPaymentType('MONTHLY');
    }
  }, [isOpen]);

  const selectedPriceOption = useMemo(() => {
    if (priceOptions?.[paymentType]) {
      return priceOptions[paymentType];
    }

    return {
      totalPrice,
      discountAmount,
      pricingBreakdown,
    };
  }, [paymentType, priceOptions, totalPrice, discountAmount, pricingBreakdown]);

  const effectiveTotalPrice = selectedPriceOption?.totalPrice || 0;
  const effectiveDiscountAmount = selectedPriceOption?.discountAmount || 0;
  const effectivePricingBreakdown = selectedPriceOption?.pricingBreakdown || null;
  const effectiveFinalTotal = Math.max(
    0,
    Number(effectiveTotalPrice) + Number(servicesTotal || 0) - Number(effectiveDiscountAmount || 0)
  );

  const paymentTypePriceSummary = useMemo(() => {
    if (paymentType !== 'FULL' || !effectivePricingBreakdown || effectivePricingBreakdown.paymentType !== 'FULL') {
      return null;
    }

    const monthlyOption = priceOptions?.MONTHLY || null;
    const fullOption = priceOptions?.FULL || null;
    const totalWithoutFullDiscount = monthlyOption
      ? Number(monthlyOption.totalPrice || 0) + Number(servicesTotal || 0) - Number(monthlyOption.discountAmount || 0)
      : null;
    const totalWithFullDiscount = fullOption
      ? Number(fullOption.totalPrice || 0) + Number(servicesTotal || 0) - Number(fullOption.discountAmount || 0)
      : effectiveFinalTotal;

    if (totalWithoutFullDiscount == null || totalWithoutFullDiscount <= totalWithFullDiscount) {
      return null;
    }

    if (effectivePricingBreakdown.discountPercent) {
      return {
        title: `Скидка за полную оплату ${effectivePricingBreakdown.discountPercent}%`,
        totalWithoutFullDiscount,
        totalWithFullDiscount,
      };
    }

    return {
      title: 'Специальная цена за полную оплату',
      totalWithoutFullDiscount,
      totalWithFullDiscount,
    };
  }, [paymentType, effectivePricingBreakdown, priceOptions, servicesTotal, effectiveFinalTotal]);

  // Генерируем платежи в зависимости от выбранного типа
  const payments = useMemo(() => {
    if (paymentType === 'FULL') {
      return generateFullPayment(startDate, monthsCount, effectiveTotalPrice, servicesTotal, effectiveDiscountAmount);
    }
    // Если есть pricingBreakdown с promoMonths — используем split-генератор
    if (effectivePricingBreakdown && effectivePricingBreakdown.promoMonths && effectivePricingBreakdown.promoMonthlyAmount != null) {
      return generateSplitMonthlyPayments(
        startDate,
        monthsCount,
        effectiveTotalPrice,
        servicesTotal,
        effectiveDiscountAmount,
        effectivePricingBreakdown
      );
    }
    return generateMonthlyPayments(startDate, monthsCount, effectiveTotalPrice, servicesTotal, effectiveDiscountAmount);
  }, [startDate, monthsCount, effectiveTotalPrice, servicesTotal, effectiveDiscountAmount, paymentType, effectivePricingBreakdown]);

  const calculatedTotal = useMemo(() => {
    return payments.reduce((sum, payment) => sum + payment.amount, 0);
  }, [payments]);

  const volumeUnit = storageType === 'INDIVIDUAL' ? 'м²' : 'м³';

  // Обработчик подтверждения - передаём тип оплаты
  const handleConfirm = () => {
    onConfirm(paymentType);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[92vw] max-w-[420px] max-h-[85vh] rounded-3xl border-none p-0 bg-white shadow-xl flex flex-col overflow-hidden">
        {/* Заголовок - фиксированный */}
        <div className="px-6 pt-6 pb-4 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#273655]">График платежей</h2>
          <p className="text-sm text-gray-500 mt-1">
            {monthsCount} мес.
          </p>
        </div>

        {/* Контент - скроллится */}
        <div className="flex-1 overflow-y-auto px-6 min-h-0">
          {/* Информационное сообщение */}
          <div className="flex items-start gap-3 p-4 mb-5 bg-[#00A991]/10 rounded-2xl">
            <Info className="w-5 h-5 text-[#00A991] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#273655]">
              Все платежи будут доступны для оплаты в личном кабинете после подписания договора
            </p>
          </div>

          {/* Инструкция оплаты */}
          <div className="mb-5">
            <img 
              src={instructionImage} 
              alt="Инструкция по оплате" 
              className="w-full h-auto rounded-2xl"
            />
          </div>

          {/* Переключатель типа оплаты */}
          <div className="mb-5">
            <p className="text-sm font-medium text-[#273655] mb-3">Способ оплаты</p>
            <div className="flex rounded-2xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setPaymentType('MONTHLY')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                  paymentType === 'MONTHLY'
                    ? 'bg-white text-[#273655] shadow-sm'
                    : 'text-gray-500 hover:text-[#273655]'
                }`}
              >
                Ежемесячно
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('FULL')}
                className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                  paymentType === 'FULL'
                    ? 'bg-white text-[#273655] shadow-sm'
                    : 'text-gray-500 hover:text-[#273655]'
                }`}
              >
                Полная оплата
              </button>
            </div>
            {paymentTypePriceSummary && (
              <div className="mt-3 rounded-2xl border border-green-200 bg-green-50 px-3 py-3">
                <p className="text-xs font-semibold text-green-800">
                  {paymentTypePriceSummary.title}
                </p>
                <div className="mt-2 flex items-center justify-between gap-3 text-xs">
                  <span className="text-green-700">Без скидки</span>
                  <span className="font-medium text-gray-400 line-through">
                    {formatPrice(paymentTypePriceSummary.totalWithoutFullDiscount)} ₸
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3 text-xs">
                  <span className="text-green-700">Сейчас</span>
                  <span className="font-semibold text-green-800">
                    {formatPrice(paymentTypePriceSummary.totalWithFullDiscount)} ₸
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Список платежей */}
          <div className="space-y-2 mb-5">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className={`flex items-center justify-between py-3 px-4 rounded-2xl ${
                  payment.isPromo ? 'bg-green-50 border border-green-100' : 'bg-gray-50'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-[#273655]">
                      {payment.isFull 
                        ? `Полная оплата (${monthsCount} мес.)`
                        : `${getMonthName(payment.month)} ${payment.year}`
                      }
                    </p>
                    {payment.isPromo && (
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">
                        Акция
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">
                    {payment.daysToCharge} дн.{payment.hasServices ? ' + услуги' : ''}
                  </p>
                </div>
                <p className={`text-sm font-bold ${payment.isPromo ? 'text-green-700' : 'text-[#273655]'}`}>
                  {formatPrice(payment.amount)} ₸
                </p>
              </div>
            ))}
          </div>

          {/* Информация о ежемесячных платежах */}
          {paymentType === 'MONTHLY' && payments.length > 1 && (
            <div className="mb-5 p-4 bg-blue-50 rounded-2xl border border-blue-100">
              <p className="text-sm font-semibold text-[#273655] mb-3">Как работают ежемесячные платежи</p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    Первый платёж сразу покрывает месяц вперёд от даты начала, каждый следующий — следующий месячный период. Последний платёж может быть прорейтным, если заказ заканчивается раньше полного месяца.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CreditCard className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    Первый платёж включает услуги (упаковка, перевозка), остальные — только аренда
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-gray-600">
                    <span className="font-medium text-[#273655]">Совет:</span> После первой оплаты вы можете подключить автооплату в разделе "Платежи", чтобы не пропустить следующие платежи
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Итого и кнопки - фиксированные внизу */}
        <div className="flex-shrink-0 border-t border-gray-100 bg-white px-6 py-4">
          {/* Итого */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-gray-500">Итого</span>
            <span className="text-xl font-bold text-[#00A991]">{formatPrice(calculatedTotal)} ₸</span>
          </div>
          
          {/* Кнопки */}
          <div className="space-y-2">
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="w-full py-4 rounded-3xl bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Создание заказа...
                </>
              ) : (
                'Подтвердить'
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="w-full py-3 rounded-3xl text-[#273655] font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Отмена
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentPreviewModal;
