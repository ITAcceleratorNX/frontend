import React, { useState } from 'react';
import { useUserOrders } from '../../../shared/lib/hooks/use-orders';
import { useUserPayments } from '../../../shared/lib/hooks/use-payments';
import { showPaymentLoadError, showOrderLoadError } from '../../../shared/lib/utils/notifications';
import UserOrderCard from './UserOrderCard';
import PaymentModal from './PaymentModal';
import PaymentHistory from './PaymentHistory';

const UserPayments = () => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' или 'history'

  // Получение заказов пользователя с помощью созданного хука
  const { 
    data: orders = [], 
    isLoading: ordersLoading, 
    error: ordersError,
    refetch: refetchOrders 
  } = useUserOrders({
    onError: (error) => {
      showOrderLoadError();
      console.error('Ошибка загрузки заказов:', error);
    }
  });

  // Получение истории платежей с помощью созданного хука
  const { 
    data: payments = [], 
    isLoading: paymentsLoading, 
    error: paymentsError,
    refetch: refetchPayments 
  } = useUserPayments({
    onError: (error) => {
      showPaymentLoadError();
      console.error('Ошибка загрузки платежей:', error);
    }
  });

  const handlePayOrder = (order) => {
    setSelectedOrder(order);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
    // Обновляем данные после успешной оплаты
    refetchOrders();
    refetchPayments();
  };

  const handlePaymentCancel = () => {
    setIsPaymentModalOpen(false);
    setSelectedOrder(null);
  };

  // Фильтруем заказы для показа статистики
  const approvedOrders = orders.filter(order => order.status === 'APPROVED');
  const unpaidOrders = orders.filter(order => order.payment_status === 'UNPAID');
  const paidOrders = orders.filter(order => order.payment_status === 'PAID');

  if (ordersLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]"></div>
        </div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600">Ошибка при загрузке данных: {ordersError.message}</p>
          <button 
            onClick={() => refetchOrders()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-8">
      {/* Заголовок */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#273655] mb-2">Платежи</h1>
        <p className="text-gray-600">Управление вашими заказами и платежами</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Всего заказов</p>
              <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Подтверждено</p>
              <p className="text-2xl font-bold text-gray-900">{approvedOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Неоплачено</p>
              <p className="text-2xl font-bold text-gray-900">{unpaidOrders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Оплачено</p>
              <p className="text-2xl font-bold text-gray-900">{paidOrders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'orders'
                ? 'border-[#273655] text-[#273655]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Мои заказы
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-[#273655] text-[#273655]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            История платежей
          </button>
        </nav>
      </div>

      {/* Контент табов */}
      {activeTab === 'orders' && (
        <div>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Активные заказы</h2>
            {orders.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Нет заказов</h3>
                <p className="mt-1 text-sm text-gray-500">У вас пока нет активных заказов</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {orders.map((order) => (
                  <UserOrderCard
                    key={order.id}
                    order={order}
                    onPayOrder={handlePayOrder}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <PaymentHistory 
          payments={payments}
          isLoading={paymentsLoading}
          error={paymentsError}
          onRefetch={refetchPayments}
        />
      )}

      {/* Модальное окно оплаты */}
      {isPaymentModalOpen && selectedOrder && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          order={selectedOrder}
          onSuccess={handlePaymentSuccess}
          onCancel={handlePaymentCancel}
        />
      )}
    </div>
  );
};

export default UserPayments; 