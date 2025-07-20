import React, { useState } from 'react';
import { useUserOrders } from '../../../shared/lib/hooks/use-orders';
import { useUserPayments } from '../../../shared/lib/hooks/use-payments';
import { showPaymentLoadError, showOrderLoadError } from '../../../shared/lib/utils/notifications';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { CreditCard, Package, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
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
        <Card className="shadow-lg rounded-2xl">
          <CardContent className="p-12">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
              <span className="ml-4 text-[#1e2c4f] font-medium text-lg">Загрузка данных...</span>
        </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <Card className="border-red-200 bg-red-50 shadow-lg rounded-2xl">
          <CardContent className="p-8 text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 text-lg mb-4">Ошибка при загрузке данных: {ordersError.message}</p>
          <button 
            onClick={() => refetchOrders()}
              className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md"
          >
            Попробовать снова
          </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {/* Заголовок в стиле CardHeader */}
      <Card className="border-[#1e2c4f]/20 shadow-xl rounded-2xl bg-gradient-to-r from-[#1e2c4f] to-blue-600">
        <CardHeader className="text-center py-12">
          <CardTitle className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
            <CreditCard className="w-12 h-12" />
            История платежей
          </CardTitle>
          <p className="text-blue-100 text-xl leading-relaxed max-w-2xl mx-auto">
            Управление вашими заказами и платежами в одном месте
          </p>
        </CardHeader>
      </Card>

      {/* Статистика с улучшенным дизайном */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                <Package className="w-8 h-8 text-[#1e2c4f]" />
      </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Всего заказов</p>
                <p className="text-3xl font-bold text-[#1e2c4f]">{orders.length}</p>
            </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Подтверждено</p>
                <p className="text-3xl font-bold text-green-600">{approvedOrders.length}</p>
        </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl group-hover:from-orange-200 group-hover:to-red-200 transition-all">
                <Clock className="w-8 h-8 text-orange-600" />
            </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide text-center">Неоплачено</p>
                <p className="text-3xl font-bold text-orange-600">{unpaidOrders.length}</p>
        </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl group-hover:from-emerald-200 group-hover:to-teal-200 transition-all">
                <TrendingUp className="w-8 h-8 text-emerald-600" />
            </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide text-center">Оплачено</p>
                <p className="text-3xl font-bold text-emerald-600">{paidOrders.length}</p>
        </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Табы с современным дизайном */}
      <Card className="shadow-xl rounded-2xl border-gray-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CardHeader className="border-b border-gray-100">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-100 p-2 rounded-2xl h-14">
              <TabsTrigger 
                value="orders" 
                className="data-[state=active]:bg-white data-[state=active]:text-[#1e2c4f] data-[state=active]:shadow-lg rounded-xl font-semibold transition-all text-lg h-10"
              >
                <Package className="w-5 h-5 mr-2" />
            Мои заказы
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-white data-[state=active]:text-[#1e2c4f] data-[state=active]:shadow-lg rounded-xl font-semibold transition-all text-lg h-10"
              >
                <CreditCard className="w-5 h-5 mr-2" />
            История платежей
              </TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="orders" className="p-6 space-y-6">
        <div>
              <div className="flex items-center gap-3 mb-6">
                <Package className="w-6 h-6 text-[#1e2c4f]" />
                <h2 className="text-2xl font-bold text-[#1e2c4f]">Активные заказы</h2>
              </div>

              {orders.length === 0 ? (
                <Card className="border-dashed border-gray-300 bg-gray-50 rounded-2xl">
                  <CardContent className="text-center py-16">
                    <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2">Нет заказов</h3>
                    <p className="text-gray-500 text-lg">У вас пока нет активных заказов</p>
                  </CardContent>
                </Card>
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
          </TabsContent>

          <TabsContent value="history" className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-6 h-6 text-[#1e2c4f]" />
              <h2 className="text-2xl font-bold text-[#1e2c4f]">Детализация платежей</h2>
        </div>

        <PaymentHistory 
          payments={payments}
          isLoading={paymentsLoading}
          error={paymentsError}
          onRefetch={refetchPayments}
        />
          </TabsContent>
        </Tabs>
      </Card>

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