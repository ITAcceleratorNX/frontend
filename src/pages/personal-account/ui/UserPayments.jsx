import React, { useState, useMemo } from 'react';
import { useUserPayments } from '../../../shared/lib/hooks/use-payments';
import { showPaymentLoadError } from '../../../shared/lib/utils/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import PaymentCard from './PaymentCard';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { List, Zap, FileText } from 'lucide-react';

const UserPayments = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');

  // Получение платежей пользователя
  const {
    data: payments = [],
    isLoading: paymentsLoading,
    error: paymentsError,
  } = useUserPayments({
    onError: (error) => {
      showPaymentLoadError();
      console.error('Ошибка загрузки платежей:', error);
    }
  });

  // Фильтрация платежей
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    switch (activeFilter) {
      case 'active':
        return payments.filter(order =>
          order.status === 'ACTIVE'
        );
      case 'archive':
        return payments.filter(order =>
          order.status !== 'ACTIVE'
        );
      default:
        return payments;
    }
  }, [payments, activeFilter]);

  // Статистика платежей
  const stats = useMemo(() => {
    const total = payments.length;
    const approved = payments.filter(o => o.status === 'APPROVED').length;
    const unpaid = payments.filter(o => 
      o.order_payment?.some(p => p.status === 'UNPAID')
    ).length;
    const paid = payments.filter(o => 
      o.order_payment && o.order_payment.every(p => p.status === 'PAID')
    ).length;
    
    return { total, approved, unpaid, paid };
  }, [payments]);

  if (paymentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004743]"></div>
      </div>
    );
  }

  if (paymentsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Ошибка при загрузке платежей</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать в Extra Space!
            </h1>
            <p className="text-lg text-gray-600">
              Привет, {user?.name || 'Пользователь'}. Добро пожаловать.
            </p>
          </div>
          <button
            onClick={() => navigate('/personal-account', { state: { activeSection: 'personal' } })}
            className="px-6 py-2 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-[#D4FFFD] rounded-full shadow-md hover:shadow-lg transition-shadow font-sf-pro-text"
          >
            Личный кабинет
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex gap-6 px-6 py-6">
        
        {/* Center - Payments */}
        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Платежи</h2>
            
            {/* Filter Tabs */}
            <Tabs value={activeFilter} onValueChange={setActiveFilter}>
              <TabsList className="bg-white px-2 py-4 rounded-[32px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] h-auto">
                <TabsTrigger
                  value="all"
                  className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
                >
                  <List className="w-4 h-4" />
                  <span>Все</span>
                </TabsTrigger>
                <TabsTrigger
                  value="active"
                  className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
                >
                  <Zap className="w-4 h-4" />
                  <span>Активные</span>
                </TabsTrigger>
                <TabsTrigger
                  value="archive"
                  className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>В архиве</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Payment Cards */}
          {filteredPayments.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Нет платежей для отображения
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPayments.map((order) => (
                <PaymentCard
                  key={order.id}
                  order={order}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Side - Statistics */}
        <div className="w-64 flex-shrink-0 self-start mt-36">
          <div className="bg-transparent border border-[#DFDFDF] rounded-2xl p-6">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Всего заказов:</div>
                <div className="text-4xl font-bold text-[#004743]">{stats.total}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Подтверждено:</div>
                <div className="text-4xl font-bold text-[#004743]">{stats.approved}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Неоплачено:</div>
                <div className="text-4xl font-bold text-[#004743]">{stats.unpaid}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">Оплачено:</div>
                <div className="text-4xl font-bold text-[#004743]">{stats.paid}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPayments; 