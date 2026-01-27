import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserOrders } from '../../../shared/lib/hooks/use-orders';
import { showOrderLoadError } from '../../../shared/lib/utils/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import UserOrderCard from './UserOrderCard';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useNavigate } from 'react-router-dom';
import { List, Zap, CheckCircle, Star, FileText, HelpCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import instImage from '../../../assets/inst.png';
import { ordersApi } from '../../../shared/api/ordersApi';
import { toast } from 'react-toastify';

const ORDER_FILTER_OPTIONS = [
  { value: 'all', label: 'Все' },
  { value: 'in_active', label: 'В обработке у менеджера' },
  { value: 'approved', label: 'Подтверждено' },
  { value: 'active', label: 'Активные' },
  { value: 'archive', label: 'В архиве' },
];

const UserOrdersPage = ({ embeddedMobile = false, onPayOrder }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  // Получение заказов пользователя
  const {
    data: orders = [],
    isLoading: ordersLoading,
    error: ordersError,
  } = useUserOrders({
    onError: (error) => {
      showOrderLoadError();
      console.error('Ошибка загрузки заказов:', error);
    }
  });

  // Получение доставок для проверки необходимости выбора времени
  const { data: deliveries = [] } = useQuery({
    queryKey: ['userDeliveries'],
    queryFn: ordersApi.getUserDeliveries,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Показываем подсказку после успешной оплаты, если нужно выбрать время доставки
  const hasShownDeliveryToastRef = useRef(false);

  const hasDeliveriesNeedingTime = useMemo(() => {
    if (!deliveries || !deliveries.length) return false;

    const allowedStatuses = ['PENDING', 'COURIER_ASSIGNED'];

    return deliveries.some((delivery) => {
      const order = delivery.order;

      return (
        order?.payment_status === 'PAID' &&
        order?.contract_status === 'SIGNED' &&
        allowedStatuses.includes(delivery.status) &&
        !delivery.delivery_time_interval
      );
    });
  }, [deliveries]);

  useEffect(() => {
    if (hasDeliveriesNeedingTime && !hasShownDeliveryToastRef.current) {
      hasShownDeliveryToastRef.current = true;
      toast.info('Выберите время доставки');
    }
  }, [hasDeliveriesNeedingTime]);

  // Фильтрация заказов
  const filteredOrders = useMemo(() => {
    if (!orders) return [];
    
    switch (activeFilter) {
      case 'in_active':
        return orders.filter(order => order.status === 'INACTIVE');
      case 'approved':
        return orders.filter(order => order.status === 'APPROVED' || order.status === 'PROCESSING');
      case 'active':
        return orders.filter(order => order.status === 'ACTIVE');
      case 'archive':
        return orders.filter(order => order.status === 'CANCELED' || order.status === 'FINISHED');
      default:
        return orders;
    }
  }, [orders, activeFilter]);

  // Статистика заказов
  const stats = useMemo(() => {
    const total = orders.length;
    const approved = orders.filter(o => o.status === 'APPROVED').length;
    const unpaid = orders.filter(o => o.payment_status === 'UNPAID').length;
    const paid = orders.filter(o => o.payment_status === 'PAID').length;
    
    return { total, approved, unpaid, paid };
  }, [orders]);

  const handlePayOrder = (order) => {
    if (onPayOrder) {
      onPayOrder(order);
    } else {
      navigate('/personal-account', { state: { activeSection: 'payments' } });
    }
  };

  if (ordersLoading) {
    return (
      <div className={embeddedMobile ? 'flex items-center justify-center py-16' : 'flex items-center justify-center min-h-screen'}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004743]"></div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className={embeddedMobile ? 'text-center py-12' : 'flex items-center justify-center min-h-screen'}>
        <div className="text-center">
          <p className="text-red-600">Ошибка при загрузке заказов</p>
        </div>
      </div>
    );
  }

  const ordersContent = (
    <>
      <div className={embeddedMobile ? 'mb-3 min-[360px]:mb-4' : 'mb-6'}>
        <div className={embeddedMobile ? 'flex flex-wrap items-center justify-between gap-2 mb-2 min-[360px]:mb-3' : 'mb-4'}>
          <h2 className="text-base min-[360px]:text-2xl sm:text-3xl font-semibold text-[#363636] min-w-0 flex-1">Мои заказы</h2>
          {embeddedMobile && (
            <Select value={activeFilter} onValueChange={setActiveFilter}>
              <SelectTrigger className="w-[100px] min-[360px]:w-[120px] min-[400px]:w-[130px] h-8 min-[360px]:h-9 bg-white border border-[#00A991]/70 rounded-xl flex items-center gap-1.5 flex-shrink-0 text-gray-700 shadow-none [&>svg]:text-[#00A991]">
                <List className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-[#00A991] flex-shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ORDER_FILTER_OPTIONS.map((opt) => (
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
                value="in_active"
                className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
              >
                <Star className="w-4 h-4" />
                <span>В обработке у менеджера</span>
              </TabsTrigger>
              <TabsTrigger
                value="approved"
                className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Подтверждено</span>
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

      {filteredOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          Нет заказов для отображения
        </div>
      ) : (
        <div className={embeddedMobile ? 'flex flex-col gap-3 min-[360px]:gap-4 min-w-0' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
          {filteredOrders.map((order) => (
            <UserOrderCard
              key={order.id}
              order={order}
              onPayOrder={handlePayOrder}
              embeddedMobile={embeddedMobile}
            />
          ))}
        </div>
      )}
    </>
  );

  if (embeddedMobile) {
    return <div className="flex-1">{ordersContent}</div>;
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
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsInstructionOpen(true)}
              className="p-2 text-[#00A991] hover:text-[#009882] hover:bg-[#00A991]/10 rounded-full transition-colors"
              title="Инструкция"
            >
              <HelpCircle className="w-6 h-6" />
            </button>
            <button
              onClick={() => navigate('/personal-account', { state: { activeSection: 'personal' } })}
              className="px-6 py-2 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-[#D4FFFD] rounded-full shadow-md hover:shadow-lg transition-shadow font-sf-pro-text"
            >
              Личный кабинет
            </button>
          </div>
        </div>
      </div>
      <Dialog open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Инструкция</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img src={instImage} alt="Инструкция" className="max-w-full h-auto" />
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex gap-6 px-6 py-6">
        <div className="flex-1">{ordersContent}</div>
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

export default UserOrdersPage;

