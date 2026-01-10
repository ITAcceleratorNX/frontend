import React, { useState, useMemo } from 'react';
import { useUserOrders } from '../../../shared/lib/hooks/use-orders';
import { showOrderLoadError } from '../../../shared/lib/utils/notifications';
import { useAuth } from '../../../shared/context/AuthContext';
import UserOrderCard from './UserOrderCard';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Switch } from '../../../components/ui/switch';
import { useNotifications } from '../../../shared/lib/hooks/use-notifications';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import { List, Zap, CheckCircle, Star, FileText } from 'lucide-react';

const UserOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState('all');
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);

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

  // Получение уведомлений
  const { notifications = [] } = useNotifications();

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

  // Фильтрация уведомлений
  const filteredNotifications = useMemo(() => {
    if (!notifications) return [];
    
    if (showUnreadOnly) {
      return notifications.filter(n => !n.is_read);
    }
    
    return notifications;
  }, [notifications, showUnreadOnly]);

  // Статистика заказов
  const stats = useMemo(() => {
    const total = orders.length;
    const approved = orders.filter(o => o.status === 'APPROVED').length;
    const unpaid = orders.filter(o => o.payment_status === 'UNPAID').length;
    const paid = orders.filter(o => o.payment_status === 'PAID').length;
    
    return { total, approved, unpaid, paid };
  }, [orders]);

  // Форматирование даты для уведомлений
  const formatNotificationDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Сегодня';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Вчера';
      } else {
        return format(date, 'd MMMM yyyy г.', { locale: ru });
      }
    } catch (error) {
      return dateString;
    }
  };

  // Группировка уведомлений по дате
  const groupedNotifications = useMemo(() => {
    const groups = {};
    filteredNotifications.forEach(notification => {
      const date = formatNotificationDate(notification.created_at);
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    return groups;
  }, [filteredNotifications]);

  if (ordersLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004743]"></div>
      </div>
    );
  }

  if (ordersError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">Ошибка при загрузке заказов</p>
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
        
        {/* Center - Orders */}
        <div className="flex-1">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Мои заказы</h2>
            
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
          </div>

          {/* Order Cards */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              Нет заказов для отображения
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredOrders.map((order) => (
                <UserOrderCard
                  key={order.id}
                  order={order}
                  onPayOrder={(order) => {
                    // Handle payment
                    console.log('Pay order:', order);
                  }}
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

export default UserOrdersPage;

