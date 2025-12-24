import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { paymentsApi } from '../../../shared/api/paymentsApi';
import { toast } from 'react-toastify';

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

const PaymentCard = ({ order, onPayOrder }) => {
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);

  // Определяем фон карточки: зеленый градиент для оплаченных, серый для неоплаченных
  const getCardBackground = () => {
    const hasUnpaid = order.order_payment?.some(p => p.status === 'UNPAID');
    if (hasUnpaid) {
      return 'bg-[#999999]'; // Серый для неоплаченных
    }
    return 'bg-gradient-to-b from-[#00A991] to-[#004743]'; // Зеленый градиент для оплаченных
  };

  const cardBackground = getCardBackground();

  const createManualPaymentMutation = useMutation({
    mutationFn: paymentsApi.createManualPayment,
    onSuccess: (data) => {
      if (data.payment_page_url) {
        window.open(data.payment_page_url, '_blank');
        toast.success('Перенаправляем на страницу оплаты...', {
          position: "top-right",
          autoClose: 3000,
        });
        window.location.reload();
      } else {
        toast.error('Ошибка: не получен URL для ручной оплаты');
      }
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Ошибка при создании ручной оплаты';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  });

  const downloadReceiptMutation = useMutation({
    mutationFn: paymentsApi.getPaymentReceipt,
    onSuccess: (blob) => {
      const fileUrl = window.URL.createObjectURL(blob);
      window.open(fileUrl, '_blank');
      setTimeout(() => {
        window.URL.revokeObjectURL(fileUrl);
      }, 1000);
      toast.success('PDF-чек открыт в новой вкладке', {
        position: "top-right",
        autoClose: 3000,
      });
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.message || 'Ошибка при получении PDF-чека';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  });

  const handlePay = (paymentId) => {
    createManualPaymentMutation.mutate(paymentId);
  };

  const handleDownloadReceipt = (paymentId) => {
    downloadReceiptMutation.mutate(paymentId);
  };

  return (
    <div className={`${cardBackground} rounded-3xl p-6 text-white relative overflow-hidden shadow-lg`}>
      {/* Заголовок заказа */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">Заказ №{order.id}</h3>
          <p className="text-xs text-white/90 mb-1">Создан: {formatDate(order.created_at)}</p>
          <p className="text-sm text-white/90">Тип: {getStorageTypeText(order.storage_type)}</p>
          <p className="text-sm text-white/90">Объем: {order.volume} м³</p>
        </div>
        
        {/* Белый квадрат с идентификатором бокса */}
        {order.storage?.name && (
          <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-4">
            <span className="text-4xl font-bold text-gray-700">{order.storage.name}</span>
          </div>
        )}
      </div>

      {/* Платежи по месяцам */}
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4">Платежи по месяцам</h4>
        <div className="space-y-4">
          {order.order_payment?.map((payment) => (
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
                      disabled={downloadReceiptMutation.isLoading}
                      className="text-white/90 text-xs font-medium hover:text-white transition-colors underline"
                    >
                      Скачать PDF - чек
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => handlePay(payment.id)}
                      disabled={createManualPaymentMutation.isLoading}
                      className="px-4 py-2 bg-white rounded-3xl text-xs font-medium text-gray-700 hover:bg-white/90 transition-colors"
                    >
                      Оплатить
                    </button>
                    <button
                      onClick={() => handleDownloadReceipt(payment.id)}
                      disabled={downloadReceiptMutation.isLoading}
                      className="text-white/90 text-xs font-medium hover:text-white transition-colors underline"
                    >
                      Скачать PDF - чек
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* История платежей */}
      <div className="flex justify-center">
        <button
          onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
          className="text-white/90 text-sm font-medium hover:text-white transition-colors flex items-center gap-2"
        >
          История платежи
          {isHistoryExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PaymentCard;

