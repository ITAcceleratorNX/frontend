import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * Компонент таймера обратного отсчета до автоматической отмены заказа
 * Показывает оставшееся время до автоотмены неоплаченного заказа (1 час с момента подписания контракта)
 */
const OrderCancelTimer = ({ order }) => {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Проверяем, подходит ли заказ под критерии автоотмены
    const shouldShowTimer = 
      order.status === 'PROCESSING' &&
      order.contract_status === 'SIGNED' &&
      order.payment_status === 'UNPAID';

    if (!shouldShowTimer) {
      setTimeRemaining(null);
      return;
    }

    // Находим дату подписания контракта
    // Сначала проверяем, есть ли контракты в данных заказа
    let contractSignedAt = null;

    if (order.contracts && order.contracts.length > 0) {
      // Находим последний подписанный контракт (status 2 или 3)
      const signedContract = order.contracts.find(
        contract => contract.status === 2 || contract.status === 3
      );
      if (signedContract && signedContract.created_at) {
        contractSignedAt = new Date(signedContract.created_at);
      }
    }

    // Если нет данных о контракте, используем дату создания заказа как fallback
    // (хотя это не совсем точно, но лучше чем ничего)
    if (!contractSignedAt && order.created_at) {
      contractSignedAt = new Date(order.created_at);
    }

    if (!contractSignedAt) {
      setTimeRemaining(null);
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

    // Обновляем таймер сразу и затем каждую секунду
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [order]);

  // Не показываем таймер, если заказ не подходит под критерии
  if (!timeRemaining && !isExpired) {
    return null;
  }

  // Если время истекло
  if (isExpired || (timeRemaining && timeRemaining.minutes === 0 && timeRemaining.seconds === 0)) {
    return (
      <div className="mt-3 p-3 bg-red-50 border-2 border-red-500 rounded-lg">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              Время на оплату истекло
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Заказ будет автоматически отменен в ближайшее время. Пожалуйста, обратитесь в поддержку.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Показываем таймер
  return (
    <div className="mt-3 p-3 bg-orange-50 border-2 border-orange-400 rounded-lg animate-pulse">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 animate-pulse" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-orange-700 mb-1">
            ⏰ Время на оплату ограничено!
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-orange-600">
              Заказ будет автоматически отменен через:
            </span>
            <div className="flex items-center gap-1 px-2 py-1 bg-orange-100 rounded border border-orange-300">
              <span className="text-lg font-bold text-orange-700 tabular-nums">
                {String(timeRemaining.minutes).padStart(2, '0')}:
                {String(timeRemaining.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
          <p className="text-xs text-orange-600 mt-1">
            Пожалуйста, оплатите заказ, чтобы сохранить бронирование.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderCancelTimer;
