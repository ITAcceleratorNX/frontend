import React, { useMemo, useState } from 'react';
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

const getDaysInMonth = (year, month) => {
  return new Date(year, month, 0).getDate();
};

/**
 * Генерирует платежи помесячно (MONTHLY)
 */
const generateMonthlyPayments = (startDateStr, monthsCount, totalPrice, extraServicesAmount = 0, discountAmount = 0) => {
  if (!startDateStr || monthsCount <= 0 || !totalPrice) return [];

  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setMonth(end.getMonth() + monthsCount);
  
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (totalDays <= 0) return [];
  
  const dailyAmount = totalPrice / totalDays;
  
  const paymentAmounts = [];
  let current = new Date(start);
  let remaining = totalDays;
  
  while (remaining > 0) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = current.getDate();
    const daysThisMonth = daysInMonth - startDay + 1;
    const daysToCharge = Math.min(remaining, daysThisMonth);
    const amount = dailyAmount * daysToCharge;
    
    paymentAmounts.push({
      amount: amount,
      month: month,
      year: year,
      daysToCharge: daysToCharge,
    });
    
    remaining -= daysToCharge;
    current = new Date(year, month, 1);
  }
  
  let totalCalculatedAmount = 0;
  paymentAmounts.forEach((payment) => {
    payment.roundedAmount = Number(parseFloat(payment.amount).toFixed(2));
    totalCalculatedAmount += payment.roundedAmount;
  });
  
  const difference = totalPrice - totalCalculatedAmount;
  if (paymentAmounts.length > 0) {
    paymentAmounts[paymentAmounts.length - 1].roundedAmount = 
      Number(parseFloat(paymentAmounts[paymentAmounts.length - 1].roundedAmount + difference).toFixed(2));
  }
  
  const totalAmountBeforeDiscount = totalPrice + Number(extraServicesAmount);
  const discount = Number(discountAmount) || 0;
  
  let remainingDiscount = discount;
  const discountPerPayment = [];
  
  paymentAmounts.forEach((payment, index) => {
    const paymentTotal = index === 0
      ? payment.roundedAmount + Number(extraServicesAmount)
      : payment.roundedAmount;
    
    const paymentShare = totalAmountBeforeDiscount > 0 ? paymentTotal / totalAmountBeforeDiscount : 0;
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
  
  const result = paymentAmounts.map((payment, index) => {
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
    };
  });
  
  return result;
};

/**
 * Генерирует платежи помесячно с учётом промо-периода (разные суммы для промо и стандартных месяцев)
 */
const generateSplitMonthlyPayments = (startDateStr, monthsCount, totalPrice, extraServicesAmount = 0, discountAmount = 0, pricingBreakdown = {}) => {
  if (!startDateStr || monthsCount <= 0 || !totalPrice) return [];

  const promoMonths = pricingBreakdown.promoMonths || 0;
  const promoMonthlyAmount = Number(pricingBreakdown.promoMonthlyAmount) || 0;
  const standardMonthlyAmount = Number(pricingBreakdown.standardMonthlyAmount) || 0;

  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setMonth(end.getMonth() + monthsCount);
  
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  if (totalDays <= 0) return [];

  const paymentAmounts = [];
  let current = new Date(start);
  let remaining = totalDays;
  let monthIndex = 0;

  while (remaining > 0) {
    const year = current.getFullYear();
    const month = current.getMonth() + 1;
    const daysInMonth = getDaysInMonth(year, month);
    const startDay = current.getDate();
    const daysThisMonth = daysInMonth - startDay + 1;
    const daysToCharge = Math.min(remaining, daysThisMonth);

    const isPromo = monthIndex < promoMonths;
    const monthlyRate = isPromo ? promoMonthlyAmount : standardMonthlyAmount;
    const dailyRate = monthlyRate / daysInMonth;
    const amount = dailyRate * daysToCharge;

    paymentAmounts.push({
      amount,
      month,
      year,
      daysToCharge,
      isPromo,
    });

    remaining -= daysToCharge;
    current = new Date(year, month, 1);
    monthIndex++;
  }

  // Округление
  let totalCalculatedAmount = 0;
  paymentAmounts.forEach((payment) => {
    payment.roundedAmount = Number(parseFloat(payment.amount).toFixed(2));
    totalCalculatedAmount += payment.roundedAmount;
  });

  const difference = totalPrice - totalCalculatedAmount;
  if (paymentAmounts.length > 0) {
    paymentAmounts[paymentAmounts.length - 1].roundedAmount =
      Number(parseFloat(paymentAmounts[paymentAmounts.length - 1].roundedAmount + difference).toFixed(2));
  }

  // Распределение скидки
  const totalAmountBeforeDiscount = totalPrice + Number(extraServicesAmount);
  const discount = Number(discountAmount) || 0;
  let remainingDiscount = discount;
  const discountPerPayment = [];

  paymentAmounts.forEach((payment, index) => {
    const paymentTotal = index === 0
      ? payment.roundedAmount + Number(extraServicesAmount)
      : payment.roundedAmount;

    const paymentShare = totalAmountBeforeDiscount > 0 ? paymentTotal / totalAmountBeforeDiscount : 0;
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

  return paymentAmounts.map((payment, index) => {
    let finalAmount = payment.roundedAmount;
    if (index === 0) finalAmount += Number(extraServicesAmount);
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
 * Генерирует один платёж на всю сумму (FULL)
 */
const generateFullPayment = (startDateStr, monthsCount, totalPrice, extraServicesAmount = 0, discountAmount = 0) => {
  if (!startDateStr || monthsCount <= 0 || !totalPrice) return [];

  const start = new Date(startDateStr);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(start);
  end.setMonth(end.getMonth() + monthsCount);
  
  const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
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
  storageInfo = {},
  isSubmitting = false,
  pricingBreakdown = null,
}) => {
  // Состояние для типа оплаты
  const [paymentType, setPaymentType] = useState('MONTHLY');

  // Генерируем платежи в зависимости от выбранного типа
  const payments = useMemo(() => {
    if (paymentType === 'FULL') {
      return generateFullPayment(startDate, monthsCount, totalPrice, servicesTotal, discountAmount);
    }
    // Если есть pricingBreakdown с promoMonths — используем split-генератор
    if (pricingBreakdown && pricingBreakdown.promoMonths && pricingBreakdown.promoMonthlyAmount != null) {
      return generateSplitMonthlyPayments(startDate, monthsCount, totalPrice, servicesTotal, discountAmount, pricingBreakdown);
    }
    return generateMonthlyPayments(startDate, monthsCount, totalPrice, servicesTotal, discountAmount);
  }, [startDate, monthsCount, totalPrice, servicesTotal, discountAmount, paymentType, pricingBreakdown]);

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
            {storageInfo.name || (storageType === 'INDIVIDUAL' ? 'Бокс' : 'Тариф')}
            {storageInfo.volume && ` • ${storageInfo.volume} ${volumeUnit}`}
            {` • ${monthsCount} мес.`}
          </p>
          {pricingBreakdown && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-2xl">
              <div className="text-sm font-semibold text-green-700 mb-1">
                {pricingBreakdown.ruleName}
              </div>
              {pricingBreakdown.promoMonths ? (
                <div className="text-xs text-green-600 space-y-0.5">
                  <div>Первые {pricingBreakdown.promoMonths} мес: <span className="font-bold">{formatPrice(pricingBreakdown.promoMonthlyAmount)} ₸/мес</span> <span className="text-green-500">({formatPrice(pricingBreakdown.promoPrice)} ₸/м²)</span></div>
                  <div>Далее: <span className="font-bold">{formatPrice(pricingBreakdown.standardMonthlyAmount)} ₸/мес</span> <span className="text-green-500">({formatPrice(pricingBreakdown.standardPrice)} ₸/м²)</span></div>
                </div>
              ) : (
                <div className="text-xs text-green-600">
                  Спец.цена: <span className="font-bold">{formatPrice(pricingBreakdown.standardMonthlyAmount)} ₸/мес</span>
                  {pricingBreakdown.discountPercent && ` (скидка ${pricingBreakdown.discountPercent}%)`}
                </div>
              )}
            </div>
          )}
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
                Сразу всё
              </button>
            </div>
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
                    Платежи рассчитываются по дням и делятся по месяцам: первый — до конца месяца, далее — за полные месяцы, последний — за оставшиеся дни.                  </p>
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
