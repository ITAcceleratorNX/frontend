import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Clock } from 'lucide-react';

/**
 * Компонент таймера обратного отсчета до автоматической отмены заказа
 * Показывает оставшееся время до автоотмены неоплаченного заказа (1 час с момента подписания контракта)
 */
const OrderCancelTimer = ({ order }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  // Мемоизируем проверку критериев для оптимизации
  const shouldShowTimer = useMemo(() => {
    return (
      order.status === 'PROCESSING' &&
      order.contract_status === 'SIGNED' &&
      order.payment_status === 'UNPAID'
    );
  }, [order.status, order.contract_status, order.payment_status]);

  // Мемоизируем дату подписания контракта
  const contractSignedAt = useMemo(() => {
    if (!shouldShowTimer) return null;

    let signedAt = null;

    if (order.contracts && order.contracts.length > 0) {
      const signedContract = order.contracts.find(
        contract => contract.status === 2 || contract.status === 3
      );
      if (signedContract?.created_at) {
        signedAt = new Date(signedContract.created_at);
      }
    }

    // Fallback на дату создания заказа, если контракт не найден
    if (!signedAt && order.created_at) {
      signedAt = new Date(order.created_at);
    }

    return signedAt;
  }, [shouldShowTimer, order.contracts, order.created_at]);

  useEffect(() => {
    if (!shouldShowTimer || !contractSignedAt) {
      setTimeRemaining(null);
      setIsExpired(false);
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const oneHourLater = new Date(contractSignedAt.getTime() + 60 * 60 * 1000); // +1 час
      const diff = oneHourLater - now;

      if (diff <= 0) {
        setTimeRemaining({ minutes: 0, seconds: 0 });
        setIsExpired(true);
        return;
      }

      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeRemaining({ minutes, seconds });
      setIsExpired(false);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [shouldShowTimer, contractSignedAt]);

  // Не показываем таймер, если заказ не подходит под критерии
  if (!shouldShowTimer || (!timeRemaining && !isExpired)) {
    return null;
  }

  // Если время истекло - компактный бейдж в стиле карточки
  if (isExpired || (timeRemaining && timeRemaining.minutes === 0 && timeRemaining.seconds === 0)) {
    return (
      <div className="mt-3 flex items-center gap-2">
        <AlertCircle className="w-3.5 h-3.5 text-white/90 flex-shrink-0" />
        <span className="text-white/90 text-xs">
          Время на оплату истекло
        </span>
      </div>
    );
  }

  // Компактный таймер в стиле бейджей из UserOrderCard
  const isUrgent = timeRemaining.minutes < 10;
  
  return (
    <div className="mt-3 flex items-center gap-2">
      <Clock className={`w-3.5 h-3.5 flex-shrink-0 ${isUrgent ? 'text-orange-300' : 'text-white/90'}`} />
      <span className="text-white/90 text-xs">
        Оплата через:
      </span>
      <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full ${isUrgent ? 'bg-orange-50 border border-orange-200' : 'bg-white'}`}>
        <span className={`text-xs font-bold tabular-nums ${isUrgent ? 'text-orange-700' : 'text-gray-700'}`}>
          {String(timeRemaining.minutes).padStart(2, '0')}:
          {String(timeRemaining.seconds).padStart(2, '0')}
        </span>
      </div>
    </div>
  );
};

export default OrderCancelTimer;
