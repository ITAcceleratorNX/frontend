import React, { useState, useMemo } from 'react';
import { useUserPayments } from '../../../shared/lib/hooks/use-payments';
import { showPaymentLoadError } from '../../../shared/lib/utils/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import PaymentCard from './PaymentCard';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { List, Zap, FileText } from 'lucide-react';

const PAYMENT_FILTER_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'archive', label: 'В архиве' },
];

const UserPayments = ({ embeddedMobile = false }) => {
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
          order.status === 'ACTIVE' || order.status === 'PROCESSING'
        );
      case 'archive':
        return payments.filter(order =>
          order.status === 'CANCELED' || order.status === 'FINISHED'
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

  const paymentsContent = (
    <>
      <div className={embeddedMobile ? 'mb-3 min-[360px]:mb-4' : 'mb-6'}>
        <div className={embeddedMobile ? 'flex flex-wrap items-center justify-between gap-2 mb-2 min-[360px]:mb-3' : 'mb-4'}>
          <h2 className="text-base min-[360px]:text-2xl sm:text-3xl font-semibold text-[#363636] min-w-0 flex-1">Платежи</h2>
          {embeddedMobile && (
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[100px] min-[360px]:w-[120px] min-[400px]:w-[130px] h-8 min-[360px]:h-9 bg-white border border-[#00A991]/70 rounded-xl flex items-center gap-1.5 flex-shrink-0 text-gray-700 shadow-none [&>svg]:text-[#00A991]">
                <List className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-[#00A991] flex-shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_FILTER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        {!embeddedMobile && (
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
        )}
      </div>

      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Нет платежей для отображения
        </div>
      ) : (
        <div className={embeddedMobile ? 'flex flex-col gap-3 min-[360px]:gap-4 min-w-0' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
          {filteredPayments.map((order) => (
            <PaymentCard key={order.id} order={order} embeddedMobile={embeddedMobile} />
          ))}
        </div>
      )}
    </>
  );

  if (paymentsLoading) {
    return (
      <div className={embeddedMobile ? 'flex items-center justify-center py-16' : 'flex items-center justify-center min-h-screen'}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004743]"></div>
      </div>
    );
  }

  if (paymentsError) {
    return (
      <div className={embeddedMobile ? 'text-center py-12' : 'flex items-center justify-center min-h-screen'}>
        <div className="text-center">
          <p className="text-red-600">Ошибка при загрузке платежей</p>
        </div>
      </div>
    );
  }

  if (embeddedMobile) {
    return <div className="flex-1">{paymentsContent}</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
      <div className="flex gap-6 px-6 py-6">
        <div className="flex-1">{paymentsContent}</div>
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