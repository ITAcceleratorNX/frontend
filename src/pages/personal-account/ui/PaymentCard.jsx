import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useDownloadPaymentReceipt, useCreateManualPayment } from '../../../shared/lib/hooks/use-payments';
import { toast } from 'react-toastify';
import StorageBadge from "../../../../src/pages/personal-account/ui/StorageBadge.jsx";

const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') {
    return 'Индивидуальное';
  } else if (type === 'CLOUD') {
    return 'Облачное';
  }
  return type;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Не указана';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' г.';
  } catch (error) {
    return 'Некорректная дата';
  }
};

const formatPrice = (price) => {
  if (!price) return '0';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return numPrice.toLocaleString('ru-RU', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
};

const getMonthName = (month) => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  return months[month - 1] || month;
};

const PaymentCard = ({ order, embeddedMobile = false }) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isPaymentsExpanded, setIsPaymentsExpanded] = useState(false);

  // Определяем текущий месяц и год
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // месяцы в JS с 0, а в данных с 1
  const currentYear = now.getFullYear();

  // Разделяем платежи на текущий и остальные
  const payments = order.order_payment || [];
  const currentPayment = payments.find(
    (payment) => payment.month === currentMonth && payment.year === currentYear
  );
  const otherPayments = payments.filter(
    (payment) => !(payment.month === currentMonth && payment.year === currentYear)
  );

  // Определяем фон карточки: зеленый градиент для оплаченных, серый для неоплаченных
  const getCardBackground = () => {
    if (order?.payment_status !== 'PAID') {
      return 'bg-[#999999]';
    }
    return 'bg-gradient-to-b from-[#00A991] to-[#004743]'; // Зеленый градиент для оплаченных
  };

  const cardBackground = getCardBackground();

  const createManualPaymentMutation = useCreateManualPayment();
  const downloadReceiptMutation = useDownloadPaymentReceipt();

  // Функция для получения изображения и названия тарифа по tariff_type
  const getTariffInfo = (tariffType) => {
    if (!tariffType || tariffType === 'CUSTOM') return { image: null, name: 'Свои габариты' };

    const tariffMap = {
      'CLOUD_TARIFF_SUMKA': { image: sumkaImg, name: 'Хранения сумки / коробки вещей' },
      'CLOUD_TARIFF_SHINA': { image: shinaImg, name: 'Шины' },
      'CLOUD_TARIFF_MOTORCYCLE': { image: motorcycleImg, name: 'Хранение мотоцикла' },
      'CLOUD_TARIFF_BICYCLE': { image: bicycleImg, name: 'Хранение велосипед' },
      'CLOUD_TARIFF_SUNUK': { image: sunukImg, name: 'Сундук до 1 м³' },
      'CLOUD_TARIFF_FURNITURE': { image: furnitureImg, name: 'Шкаф до 2 м³' },
      'CLOUD_TARIFF_SKLAD': { image: skladImg, name: 'Кладовка до 3 м³' },
      'CLOUD_TARIFF_GARAZH': { image: garazhImg, name: 'Гараж до 9м³' }
    };

    return tariffMap[tariffType] || { image: null, name: 'Свои габариты' };
  };


  const handlePay = (payment) => {
    if (payment.payment_page_url) {
      window.open(payment.payment_page_url, '_blank');
      return;
    }
    createManualPaymentMutation.mutate(payment.id);
  };

  const handleDownloadReceipt = (paymentId) => {
    downloadReceiptMutation.mutate(paymentId);
  };

  // Компонент для рендеринга одного платежа
  const renderPayment = (payment) => (
    <div key={payment.id} className="flex items-center justify-between">
      <div className="flex-1">
        <p className="text-lg font-semibold mb-1">
          {getMonthName(payment.month)} {payment.year}
        </p>
        <p className="text-2xl font-bold">{formatPrice(payment.amount)} 〒</p>
      </div>
      <div className="flex flex-col items-end gap-2">
        {payment.status === 'PAID' ? (
          <>
            <button
              className="px-4 py-2 bg-white rounded-3xl text-xs font-medium text-gray-700"
            >
              Оплачено
            </button>
            <button
              onClick={() => handleDownloadReceipt(payment.id)}
              disabled={downloadReceiptMutation.isPending}
              className="text-white/90 text-xs font-medium hover:text-white transition-colors underline"
            >
              Скачать PDF - чек
            </button>
          </>
        ) : payment.status === 'MANUAL' ? (
          <>
            <button
              onClick={() => handlePay(payment)}
              disabled={createManualPaymentMutation.isLoading}
              className="px-4 py-2 bg-white rounded-3xl text-xs font-medium text-gray-700 hover:bg-white/90 transition-colors"
            >
              Оплатить
            </button>
          </>
        ) : payment.status === 'UNPAID' && order.status === 'PROCESSING' && payment.payment_page_url ? (
          <>
            <button
              onClick={() => {
                window.open(payment.payment_page_url, '_blank');
                toast.success('Перенаправляем на страницу оплаты...', {
                  position: "top-right",
                  autoClose: 3000,
                });
                window.location.reload();
              }}
              disabled={createManualPaymentMutation.isLoading}
              className="px-4 py-2 bg-white rounded-3xl text-xs font-medium text-gray-700 hover:bg-white/90 transition-colors"
            >
              Оплатить
            </button>
          </>
        ) : null}
      </div>
    </div>
  );

  return (
    <div className={`${cardBackground} rounded-3xl text-white relative overflow-hidden shadow-lg min-w-0 ${embeddedMobile ? 'p-3 min-[360px]:p-4' : 'p-6'}`}>
      {/* Заголовок заказа */}
      <div className={`flex items-start justify-between gap-2 ${embeddedMobile ? 'mb-3 min-[360px]:mb-4' : 'mb-6'}`}>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className={`font-bold mb-2 truncate ${embeddedMobile ? 'text-base min-[360px]:text-lg' : 'text-2xl'}`}>Заказ №{order.id}</h3>
          <p className="text-xs text-white/90 mb-1">Создан: {formatDate(order.created_at)}</p>
          <p className="text-sm text-white/90">Тип: {getStorageTypeText(order.storage_type)}</p>
          <p className="text-sm text-white/90">Объем: {order.volume} м³</p>
        </div>
        
        {/* Белый квадрат с идентификатором бокса */}
        <StorageBadge order={order} embeddedMobile={embeddedMobile} />
      </div>

      {/* Платежи по месяцам */}
      <div className={embeddedMobile ? 'mb-3 min-[360px]:mb-4' : 'mb-6'}>
        <h4 className="text-[#D3D3D3] text-xs font-medium mb-4">Платежи по месяцам</h4>
        <div className="space-y-4">
          {/* Текущий платеж - всегда видимый */}
          {currentPayment && renderPayment(currentPayment)}

          {/* Остальные платежи - в expand/collapse */}
          {otherPayments.length > 0 && (
            <>
              <div className="flex justify-end mt-2">
                <button
                    onClick={() => setIsPaymentsExpanded(!isPaymentsExpanded)}
                    className="text-[#D3D3D3] text-xs font-medium hover:text-[#D3D3D3]/80 transition-colors flex items-center gap-2"
                >
                  {isPaymentsExpanded ? (
                      <>
                        История платежи
                        <ChevronUp className="w-3 h-3" />
                      </>
                  ) : (
                      <>
                        История платежи
                        <ChevronDown className="w-3 h-3" />
                      </>
                  )}
                </button>
              </div>
              {isPaymentsExpanded && (
                <div className="space-y-4">
                  {otherPayments.map((payment) => renderPayment(payment))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentCard;

