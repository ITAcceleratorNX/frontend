import React, { useState } from 'react';
import { useCreatePayment } from '../../../shared/lib/hooks/use-payments';
import { showPaymentCreated, showPaymentCanceled } from '../../../shared/lib/utils/notifications';

const PaymentModal = ({ isOpen, order, onSuccess, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const createPaymentMutation = useCreatePayment();

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      const result = await createPaymentMutation.mutateAsync(order.id);
      
      // Получаем URL для оплаты из ответа API
      if (result.payment_page_url) {
        // Открываем страницу оплаты в новом окне/вкладке
        window.open(result.payment_page_url, '_blank');
        
        // Закрываем модальное окно и обновляем данные
        onSuccess();
      }
    } catch (error) {
      // Ошибка уже обработана в хуке
      console.error('Ошибка создания платежа:', error);
    } finally {
      setIsProcessing(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Некорректная дата';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onCancel} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Подтверждение оплаты
              </h3>
              <button
                onClick={onCancel}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-6 py-4">
            <div className="space-y-4">
              {/* Информация о заказе */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Детали заказа</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Номер заказа:</span>
                    <span className="font-medium">#{order.id}</span>
                  </div>
                  
                  {order.storage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Бокс:</span>
                      <span className="font-medium">{order.storage.name}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Объем:</span>
                    <span className="font-medium">{order.total_volume} м³</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Период:</span>
                    <span className="font-medium">
                      {formatDate(order.start_date)} - {formatDate(order.end_date)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Предметы в заказе */}
              {order.items && order.items.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Предметы для хранения</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {order.items.map((item, index) => (
                      <div key={item.id || index} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-medium">{item.volume} м³</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Итоговая сумма */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Сумма к оплате:</span>
                  <span className="text-2xl font-bold text-[#273655]">
                    {formatPrice(order.total_price)} ₸
                  </span>
                </div>
              </div>

              {/* Информационное сообщение */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Информация об оплате</p>
                    <p>После подтверждения вы будете перенаправлены на безопасную страницу оплаты. Оплата происходит через защищенное соединение.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row sm:justify-end gap-3">
            <button
              onClick={onCancel}
              disabled={isProcessing}
              className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleConfirmPayment}
              disabled={isProcessing}
              className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-[#273655] border border-transparent rounded-lg hover:bg-[#1e2a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Обработка...
                </>
              ) : (
                'Подтвердить оплату'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal; 