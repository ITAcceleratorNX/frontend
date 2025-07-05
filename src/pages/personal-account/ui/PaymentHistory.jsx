import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { paymentsApi } from '../../../shared/api/paymentsApi';

const PaymentHistory = ({ payments = [], isLoading, error, onRefetch }) => {
  const [expandedOrders, setExpandedOrders] = useState(new Set());

  const createManualPaymentMutation = useMutation({
    mutationFn: paymentsApi.createManualPayment,
    onSuccess: (data) => {
      console.log('Ручная оплата создана:', data);
      
      // Получаем URL для оплаты из ответа API
      if (data.payment_page_url) {
        // Открываем страницу оплаты в новом окне/вкладке
        window.open(data.payment_page_url, '_blank');
        
        toast.success('Перенаправляем на страницу ручной оплаты...', {
          position: "top-right",
          autoClose: 3000,
        });
        
        // Обновляем данные
        onRefetch();
      } else {
        toast.error('Ошибка: не получен URL для ручной оплаты');
      }
    },
    onError: (error) => {
      console.error('Ошибка создания ручной оплаты:', error);
      const errorMessage = error.response?.data?.message || 'Ошибка при создании ручной оплаты';
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
      });
    }
  });

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

  const formatPrice = (price) => {
    if (!price) return '0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const getPaymentStatusText = (status) => {
    const statusMap = {
      'PAID': 'Оплачено',
      'UNPAID': 'Не оплачено',
      'MANUAL': 'Ручная оплата'
    };
    return statusMap[status] || status;
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case 'PAID':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'UNPAID':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'MANUAL':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const toggleOrderExpansion = (orderId) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleManualPayment = (orderPaymentId) => {
    createManualPaymentMutation.mutate(orderPaymentId);
  };

  const getMonthName = (month) => {
    const months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    return months[month - 1] || month;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#273655]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Ошибка при загрузке истории платежей: {error.message}</p>
        <button 
          onClick={onRefetch}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Попробовать снова
        </button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Нет истории платежей</h3>
        <p className="mt-1 text-sm text-gray-500">У вас пока нет записей о платежах</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">История платежей</h2>
      
      <div className="space-y-4">
        {payments.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            {/* Заголовок заказа */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Заказ №{order.id}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Создан: {formatDate(order.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(order.total_price)} ₸
                    </p>
                    <p className="text-sm text-gray-500">
                      Статус: {order.status}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleOrderExpansion(order.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg 
                      className={`w-5 h-5 transition-transform ${
                        expandedOrders.has(order.id) ? 'rotate-180' : ''
                      }`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Детали платежей по месяцам */}
            {expandedOrders.has(order.id) && order.order_payment && (
              <div className="p-6 bg-gray-50">
                <h4 className="font-medium text-gray-900 mb-4">Платежи по месяцам</h4>
                <div className="space-y-3">
                  {order.order_payment.map((payment) => (
                    <div key={payment.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-medium text-gray-900">
                              {getMonthName(payment.month)} {payment.year}
                            </h5>
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getPaymentStatusClass(payment.status)}`}>
                              {getPaymentStatusText(payment.status)}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Сумма</p>
                              <p className="font-medium">{formatPrice(payment.amount)} ₸</p>
                            </div>
                            
                            {payment.penalty_amount && parseFloat(payment.penalty_amount) > 0 && (
                              <div>
                                <p className="text-gray-500">Штраф</p>
                                <p className="font-medium text-red-600">+{formatPrice(payment.penalty_amount)} ₸</p>
                              </div>
                            )}
                            
                            {payment.paid_at && (
                              <div>
                                <p className="text-gray-500">Дата оплаты</p>
                                <p className="font-medium">{formatDate(payment.paid_at)}</p>
                              </div>
                            )}
                            
                            {payment.payment_id && (
                              <div>
                                <p className="text-gray-500">ID транзакции</p>
                                <p className="font-medium text-xs">{payment.payment_id}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Кнопки действий */}
                        <div className="ml-6 flex gap-2">
                          {payment.status === 'UNPAID' && order.status === 'APPROVED' && (
                            <button
                              onClick={() => handleManualPayment(payment.id)}
                              disabled={createManualPaymentMutation.isLoading}
                              className="px-3 py-1 bg-[#273655] text-white text-sm font-medium rounded hover:bg-[#1e2a4a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {createManualPaymentMutation.isLoading ? 'Обработка...' : 'Оплатить'}
                            </button>
                          )}
                          
                          {payment.status === 'MANUAL' && (
                            <button
                              onClick={() => handleManualPayment(payment.id)}
                              disabled={createManualPaymentMutation.isLoading}
                              className="px-3 py-1 bg-yellow-600 text-white text-sm font-medium rounded hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {createManualPaymentMutation.isLoading ? 'Обработка...' : 'Ручная оплата'}
                            </button>
                          )}
                          
                          {payment.status === 'PAID' && (
                            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded">
                              Оплачено
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Краткая информация при свернутом состоянии */}
            {!expandedOrders.has(order.id) && order.order_payment && (
              <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex gap-4">
                    <span className="text-gray-600">
                      Всего платежей: {order.order_payment.length}
                    </span>
                    <span className="text-gray-600">
                      Оплачено: {order.order_payment.filter(p => p.status === 'PAID').length}
                    </span>
                    <span className="text-gray-600">
                      Не оплачено: {order.order_payment.filter(p => p.status === 'UNPAID').length}
                    </span>
                  </div>
                  <span className="text-gray-500">Нажмите для подробностей</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory; 