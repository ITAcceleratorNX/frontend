import React from 'react';
import {useState, useMemo, useEffect} from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../../components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import {
  useAllOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
  useSearchOrders,
  useOrdersStats,
  useApproveCancelOrder,
  useUnlockStorage
} from '../../../shared/lib/hooks/use-orders';
import { showOrderLoadError } from '../../../shared/lib/utils/notifications';
import OrderDetailView from './OrderDetailView';
import OrderDeleteModal from "./OrderDeleteModal";
import { showErrorToast } from '../../../shared/lib/toast';
import { EditOrderModal } from '@/pages/personal-account/ui/EditOrderModal.jsx';
import {useNavigate} from "react-router-dom";
import {OrderConfirmModal} from "@/pages/personal-account/ui/index.js";
import { useAuth } from '../../../shared/context/AuthContext';
import WarehouseData from './WarehouseData';
import { Search, Filter, ChevronRight, Plus, RotateCcw, ClipboardList, Users, CheckCircle2, Clock, Zap, Undo2, X, CreditCard, FileText, Package, ArrowLeft, ArrowRight } from 'lucide-react';

// Функция для расчета месяцев аренды
const calculateRentalMonths = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return 0;
    }

    const yearsDiff = end.getFullYear() - start.getFullYear();
    const monthsDiff = end.getMonth() - start.getMonth();
    const daysDiff = end.getDate() - start.getDate();

    let totalMonths = yearsDiff * 12 + monthsDiff;

    if (daysDiff > 15) {
      totalMonths += 1;
    }

    return Math.max(1, totalMonths);
  } catch (error) {
    console.error('Ошибка при вычислении месяцев:', error);
    return 0;
  }
};

// Функция для получения текста типа хранения
const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') {
    return 'Индивидуальное';
  } else if (type === 'CLOUD') {
    return 'Облачное';
  }
  return type || 'Не указано';
};

// Конфигурация статусов с иконками и цветами
const statusConfig = {
  ALL: { label: 'Все', icon: ClipboardList, color: 'bg-[#273655]', textColor: 'text-white' },
  INACTIVE: { label: 'Неактивные', icon: Users, color: 'bg-gray-800', textColor: 'text-white' },
  APPROVED: { label: 'Подтверждённые', icon: CheckCircle2, color: 'bg-emerald-500', textColor: 'text-white' },
  PROCESSING: { label: 'В обработке', icon: Clock, color: 'bg-amber-500', textColor: 'text-white' },
  ACTIVE: { label: 'Активные', icon: Zap, color: 'bg-[#00A991]', textColor: 'text-white' },
  RETURN: { label: 'Возврат', icon: Undo2, color: 'bg-rose-500', textColor: 'text-white' },
};

const OrderManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalData, setModalData] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  const [isBookingPanelOpen, setIsBookingPanelOpen] = useState(false);

  // Функция для расчёта суммы услуг заказа
  const getOrderServicesTotal = (order) => {
    if (!order.services || order.services.length === 0) return 0;
    return order.services.reduce((total, service) => {
      if (service.OrderService && service.OrderService.total_price) {
        return total + parseFloat(service.OrderService.total_price);
      }
      return total;
    }, 0);
  };

  // Запросы только когда пользователь загружен и имеет права
  const canFetchOrders = !!user && (user.role === 'ADMIN' || user.role === 'MANAGER');

  // Хуки для данных
  const {
    data: ordersData,
    isLoading: isAllLoading,
    error: allError,
    refetch
  } = useAllOrders(currentPage, {
    enabled: canFetchOrders,
    onError: (error) => {
      showOrderLoadError();
      console.error('Ошибка загрузки заказов:', error);
    }
  });

  // Извлекаем данные и метаинформацию
  const allOrders = ordersData?.data || [];
  const meta = ordersData?.meta || { total: 0, page: 1, pageSize: 50, totalPages: 1 };

  const {
    data: searchedOrders = [],
    isLoading: isSearchLoading,
    refetch: refetchSearch
  } = useSearchOrders(searchQuery);

  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const approveCancelOrder = useApproveCancelOrder();
  const unlockStorage = useUnlockStorage();

  // Проверяем загрузку мутаций
  const isMutating = updateOrderStatus.isLoading || deleteOrder.isLoading || approveCancelOrder.isPending || unlockStorage.isPending;

  // Определяем какие данные показывать
  const ordersToShow = isSearchActive ? searchedOrders : allOrders;

  // Фильтрация по статусу и возвратам
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'RETURN') {
      return ordersToShow.filter(order =>
        order.cancel_status === 'PENDING' || order.cancel_status === 'APPROVED' || order.status === 'CANCELED',
      );
    }
    if (statusFilter === 'ALL') return ordersToShow;
    return ordersToShow.filter(order => order.status === statusFilter);
  }, [ordersToShow, statusFilter]);

  // Получаем статистику отдельно
  const { stats: ordersStats } = useOrdersStats({ enabled: canFetchOrders });

  // Статистика заказов
  const statistics = useMemo(() => ({
    total: ordersStats.total,
    inactive: ordersStats.inactive,
    approved: ordersStats.approved,
    processing: ordersStats.processing,
    active: ordersStats.active,
  }), [ordersStats]);

  // Обновляем selectedOrder при изменении данных заказов
  useEffect(() => {
    if (selectedOrder && isOrderDetailOpen) {
      const ordersToCheck = isSearchActive ? searchedOrders : allOrders;
      const updatedOrder = ordersToCheck.find(o => o.id === selectedOrder.id);
      if (updatedOrder && JSON.stringify(updatedOrder) !== JSON.stringify(selectedOrder)) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [allOrders, searchedOrders, isSearchActive, isOrderDetailOpen]);

  // Функции для пагинации
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setStatusFilter('ALL');
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchActive(true);
      resetToFirstPage();
      refetchSearch();
    } else {
      setIsSearchActive(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    resetToFirstPage();
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder.mutateAsync(orderId);
    } catch (error) {
      console.error(error);
      showErrorToast('Ошибка', {
        duration: 2000,
        position: 'top-right',
        description: error.message,
      });
    }
  };

  const openConfirmModal = (action, order) => {
    setModalData({ action, order });
  };

  const closeModal = () => {
    setModalData(null);
  };

  const handleConfirmAction = async () => {
    if (!modalData) return;

    const { action, order } = modalData;

    if (action === 'delete') {
      await handleDeleteOrder(order.id);
      closeModal();
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return parseFloat(price).toLocaleString('ru-RU') + ' ₸';
  };

  // Обработчик открытия детальной информации о заказе
  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  // Обработчик закрытия модального окна
  const handleCloseOrderDetail = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleApproveReturn = async (orderId) => {
    try {
      await approveCancelOrder.mutateAsync(orderId);
      await refetch();
      if (isSearchActive) {
        await refetchSearch();
      }
    } catch (error) {
      console.error(error);
      showErrorToast('Ошибка', {
        duration: 2000,
        position: 'top-right',
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const handleUnlockStorage = async (orderId) => {
    try {
      await unlockStorage.mutateAsync(orderId);
      await refetch();
      if (isSearchActive) {
        await refetchSearch();
      }
      if (isOrderDetailOpen) {
        setIsOrderDetailOpen(false);
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error(error);
      showErrorToast('Ошибка', {
        duration: 2000,
        position: 'top-right',
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const isLoading = isAllLoading || isSearchLoading;
  const error = allError;

  // Получение бейджа статуса оплаты
  const getPaymentBadge = (order) => {
    const isPaid = order.payment_status === 'PAID';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
      }`}>
        <CreditCard className="w-3 h-3" />
        {isPaid ? 'Оплачено' : 'Не оплачено'}
      </span>
    );
  };

  // Получение бейджа статуса договора
  const getContractBadge = (order) => {
    const isSigned = order.contract_status === 'SIGNED';
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
        isSigned ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-gray-100 text-gray-600 border border-gray-200'
      }`}>
        <FileText className="w-3 h-3" />
        {isSigned ? 'Подписан' : 'Не подписан'}
      </span>
    );
  };

  // Расчёт цены для отображения
  const getOrderPriceDisplay = (order) => {
    const servicesTotal = getOrderServicesTotal(order);
    const totalBeforeDiscount = Number(order.total_price) + servicesTotal;
    const discountAmount = Number(order.discount_amount || 0);
    const totalPrice = Math.max(0, totalBeforeDiscount - discountAmount);
    return { totalBeforeDiscount, discountAmount, totalPrice, promoPercent: order.promo_code?.discount_percent };
  };

  if (isLoading) {
    return (
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-sm">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-full border-[3px] border-[#00A991]/20 border-t-[#00A991] animate-spin"></div>
            <span className="text-[#273655] font-medium text-sm sm:text-base">Загрузка заказов...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const status = error?.response?.status;
    const displayMessage = error?.userMessage || error?.message || (
      status === 401 ? 'Сессия истекла. Войдите снова.' :
      status === 403 ? 'Недостаточно прав для просмотра заказов.' :
      'Произошла ошибка при загрузке заказов'
    );

    return (
      <div className="w-full px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="bg-white rounded-2xl sm:rounded-3xl p-8 sm:p-12 shadow-sm border border-rose-100">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center">
              <X className="w-8 h-8 text-rose-500" />
            </div>
            <div className="text-rose-700 font-medium text-center">
              {displayMessage}
            </div>
            <button
              onClick={() => refetch()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#273655] text-white font-medium text-sm hover:bg-[#1e2c4f] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-2 sm:px-4 lg:px-6 xl:px-8 py-3 sm:py-4 lg:py-6 space-y-4 sm:space-y-5 lg:space-y-6 max-w-[1400px] mx-auto">
      {/* Заголовок */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#273655] flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#00A991]/10 flex items-center justify-center flex-shrink-0">
              <ClipboardList className="w-4 h-4 sm:w-5 sm:h-5 text-[#00A991]" />
            </div>
            Управление заказами
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 ml-10 sm:ml-[52px]">Просмотр и управление всеми заказами</p>
        </div>
        {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
          <button
            onClick={() => setIsBookingPanelOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#00A991] to-[#004743] text-white font-medium text-sm hover:opacity-90 transition-opacity shadow-lg shadow-[#00A991]/20 whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">Добавить клиента</span>
            <span className="xs:hidden">Добавить</span>
          </button>
        )}
      </div>

      {/* Статистика */}
      <div className="flex gap-3 overflow-x-auto pb-1 hide-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0 sm:grid sm:grid-cols-5 sm:overflow-x-visible">
        {[
          { key: 'total', value: statistics.total, label: 'Всего', accent: 'bg-[#273655]', icon: ClipboardList },
          { key: 'inactive', value: statistics.inactive, label: 'Неактивные', accent: 'bg-gray-500', icon: Users },
          { key: 'approved', value: statistics.approved, label: 'Подтверждено', accent: 'bg-emerald-500', icon: CheckCircle2 },
          { key: 'processing', value: statistics.processing, label: 'В обработке', accent: 'bg-amber-500', icon: Clock },
          { key: 'active', value: statistics.active, label: 'Активных', accent: 'bg-[#00A991]', icon: Zap },
        ].map((stat) => (
          <div
            key={stat.key}
            className={`min-w-[130px] sm:min-w-0 bg-white rounded-3xl p-4 sm:p-5 flex flex-col gap-2 border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all flex-shrink-0 sm:flex-shrink`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${stat.accent} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <span className="text-xl sm:text-2xl font-bold text-[#202422] block font-soyuz-grotesk">{stat.value}</span>
                <span className="text-xs text-[#5C625F] whitespace-nowrap">{stat.label}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Поиск и фильтры */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Поиск */}
        <div className="p-3 sm:p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 sm:h-11 rounded-xl border-gray-200 focus:border-[#00A991] focus:ring-[#00A991]/20 text-sm"
                placeholder="Поиск по имени или телефону..."
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#273655] text-white font-medium text-sm hover:bg-[#1e2c4f] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Search className="w-4 h-4" />
                Найти
              </button>
              {isSearchActive && (
                <button
                  onClick={resetSearch}
                  className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span className="hidden sm:inline">Сбросить</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Фильтр по статусу */}
        <div className="p-3 sm:p-5">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Статус заказа</span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar -mx-3 px-3 sm:mx-0 sm:px-0 sm:flex-wrap">
            {Object.entries(statusConfig).map(([key, config]) => {
              const isActive = statusFilter === key;
              const IconComponent = config.icon;
              return (
                <button
                  key={key}
                  onClick={() => setStatusFilter(key)}
                  className={`inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 sm:flex-shrink ${
                    isActive
                      ? `${config.color} ${config.textColor} shadow-md`
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  {config.label}
                </button>
              );
            })}
          </div>

          {/* Информация о фильтрации */}
          {(searchQuery || statusFilter !== 'ALL') && (
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
              <span>Показано {filteredOrders.length} из {meta.total}</span>
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#00A991]/10 text-[#00A991] text-xs font-medium">
                  <Search className="w-3 h-3" />
                  {searchQuery}
                </span>
              )}
              {statusFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#273655]/10 text-[#273655] text-xs font-medium">
                  {statusConfig[statusFilter]?.label}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Список заказов */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-[#273655]">Список заказов</h2>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <div className="text-gray-500 text-sm sm:text-base font-medium text-center">Заказы не найдены</div>
            <div className="text-gray-400 text-xs sm:text-sm text-center max-w-xs">
              {searchQuery || statusFilter !== 'ALL'
                ? 'Попробуйте изменить критерии поиска или фильтры'
                : 'Пока нет заказов для отображения'
              }
            </div>
            {(searchQuery || statusFilter !== 'ALL') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('ALL');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Сбросить фильтры
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Мобильные карточки (видны только на маленьких экранах) */}
            <div className="block lg:hidden divide-y divide-gray-50">
              {filteredOrders.map((order) => {
                const priceInfo = getOrderPriceDisplay(order);
                return (
                  <div
                    key={order.id}
                    className="p-3 sm:p-4 hover:bg-gray-50/50 transition-colors cursor-pointer active:bg-gray-100"
                    onClick={() => handleOrderClick(order)}
                  >
                    {/* Верхняя строка: номер, клиент, стрелка */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#00A991] bg-[#00A991]/10 px-2 py-0.5 rounded-full">
                            #{order.id}
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                            {getStorageTypeText(order.storage?.storage_type)}
                          </Badge>
                        </div>
                        <div className="mt-1.5">
                          <p className="text-sm font-semibold text-[#273655] truncate">
                            {order.user?.name || order.user?.company_name || 'Без имени'}
                          </p>
                          <p className="text-xs text-gray-400 truncate">
                            {order.user?.phone || order.user?.email || ''}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-300 flex-shrink-0 mt-1" />
                    </div>

                    {/* Средняя строка: склад, объём, срок */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2.5">
                      <span className="truncate max-w-[120px]">{order.storage?.name || 'Не указано'}</span>
                      <span className="text-gray-300">|</span>
                      <span>{order.total_volume} м³</span>
                      <span className="text-gray-300">|</span>
                      <span>{calculateRentalMonths(order.start_date, order.end_date)} мес.</span>
                    </div>

                    {/* Нижняя строка: цена, статусы */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-shrink-0">
                        {priceInfo.discountAmount > 0 ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400 line-through">{formatPrice(priceInfo.totalBeforeDiscount)}</span>
                            <span className="text-sm font-bold text-emerald-600">{formatPrice(priceInfo.totalPrice)}</span>
                            <span className="text-[10px] text-emerald-500 font-medium">-{priceInfo.promoPercent}%</span>
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-[#273655]">{formatPrice(priceInfo.totalBeforeDiscount)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {getPaymentBadge(order)}
                        {getContractBadge(order)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Десктопная таблица (видна на больших экранах) */}
            <div className="hidden lg:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-gray-100 bg-gray-50/50">
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[80px]">Номер</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[160px]">Клиент</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[120px]">Склад/Бокс</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[110px]">Тип</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[80px]">Объем</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[80px]">Срок</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[130px]">Сумма</TableHead>
                    <TableHead className="text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[180px]">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((order) => {
                    const priceInfo = getOrderPriceDisplay(order);
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-[#00A991]/5 transition-colors border-b border-gray-50"
                        onClick={() => handleOrderClick(order)}
                      >
                        <TableCell>
                          <span className="text-sm font-bold text-[#00A991]">#{order.id}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#273655]">{order.user?.name || order.user?.company_name || ''}</span>
                            <span className="text-xs text-gray-400">{order.user?.phone || order.user?.email || ''}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {order.storage?.name || 'Не указано'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs rounded-full">
                            {getStorageTypeText(order.storage?.storage_type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {order.total_volume} м³
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {calculateRentalMonths(order.start_date, order.end_date)} мес.
                        </TableCell>
                        <TableCell>
                          {priceInfo.discountAmount > 0 ? (
                            <div className="flex flex-col">
                              <span className="text-xs text-gray-400 line-through">{formatPrice(priceInfo.totalBeforeDiscount)}</span>
                              <span className="text-sm font-semibold text-emerald-600">{formatPrice(priceInfo.totalPrice)}</span>
                              <span className="text-[10px] text-emerald-500">-{priceInfo.promoPercent}%</span>
                            </div>
                          ) : (
                            <span className="text-sm font-semibold text-[#273655]">{formatPrice(priceInfo.totalBeforeDiscount)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {getPaymentBadge(order)}
                            {getContractBadge(order)}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* Пагинация */}
      {!isSearchActive && meta.totalPages > 1 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, meta.totalPages) }, (_, i) => {
              let pageNum;
              if (meta.totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= meta.totalPages - 2) {
                pageNum = meta.totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-medium transition-all ${
                    currentPage === pageNum
                      ? 'bg-[#00A991] text-white shadow-md shadow-[#00A991]/20'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= meta.totalPages}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-2">
            Страница {currentPage} из {meta.totalPages} &middot; Всего {meta.total} заказов
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {modalData && modalData.action === 'delete' && (
        <OrderDeleteModal
          isOpen={!!modalData}
          onClose={closeModal}
          onConfirm={handleConfirmAction}
          action={modalData.action}
          order={modalData.order}
        />
      )}
      {modalData && modalData.action === 'update' && (
        <EditOrderModal
          isOpen={!!modalData}
          order={modalData.order}
          onSuccess={() => {
            closeModal();
            window.location.reload();
            navigate("/personal-account", { state: { activeSection: "request" } });
          }}
          onCancel={() => closeModal()}
        />
      )}
      {modalData && modalData.action === 'approve' && (
        <OrderConfirmModal
          isOpen={!!modalData}
          order={modalData.order}
          onClose={() => closeModal()}
        />
      )}

      {/* Модальное окно с детальной информацией о заказе */}
      <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
        <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-none">
          <DialogHeader className="pb-4 sm:pb-6 border-b">
            <DialogTitle className="text-lg sm:text-2xl font-semibold text-[#273655]">
              Детальная информация о заказе
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 sm:mt-6">
              <OrderDetailView
                order={selectedOrder}
                onUpdate={() => {
                  handleCloseOrderDetail();
                  openConfirmModal('update', selectedOrder);
                }}
                onDelete={() => {
                  handleCloseOrderDetail();
                  openConfirmModal('delete', selectedOrder);
                }}
                onApprove={() => {
                  handleCloseOrderDetail();
                  openConfirmModal('approve', selectedOrder);
                }}
                isLoading={isMutating}
                onApproveReturn={statusFilter === 'RETURN' ? handleApproveReturn : undefined}
                onUnlockStorage={statusFilter === 'RETURN' ? handleUnlockStorage : undefined}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Модальное окно добавления клиента */}
      <Dialog open={isBookingPanelOpen} onOpenChange={setIsBookingPanelOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] max-h-[90vh] overflow-y-auto p-0 rounded-2xl sm:rounded-3xl border-none">
          <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-2 border-b">
            <DialogTitle className="text-lg sm:text-2xl font-semibold text-[#273655]">
              Добавить клиента — Бронирование бокса
            </DialogTitle>
          </DialogHeader>
          <div className="px-3 sm:px-4 py-3 sm:py-4">
            <WarehouseData
              embedded={true}
              onBookingComplete={() => {
                setIsBookingPanelOpen(false);
                refetch();
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderManagement;
