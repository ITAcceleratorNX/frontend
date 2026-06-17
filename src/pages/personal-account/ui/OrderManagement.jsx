import React from 'react';
import {useState, useMemo, useEffect} from 'react';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import {
  useAllOrders,
  useAllOrdersFlat,
  useUpdateOrderStatus,
  useDeleteOrder,
  useSearchOrders,
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
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { Search, Filter, ChevronRight, Plus, RotateCcw, ClipboardList, Users, CheckCircle2, Clock, Zap, Undo2, X, CreditCard, FileText, Package, ArrowLeft, ArrowRight } from 'lucide-react';
import { CONTRACT_EXPIRY_STATUS, getOrderContractExpiry } from '../../../shared/lib/orderContractExpiry';
import { FormSelect } from '@/shared/ui/FormSelect.jsx';

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
  } else if (type === 'CAMERA') {
    return 'Камера хранения';
  }
  return type || 'Не указано';
};

const SORT_OPTIONS = [
  { value: 'createdAtDesc', label: 'Дата создания (сначала новые)' },
  { value: 'createdAtAsc', label: 'Дата создания (сначала старые)' },
  { value: 'endDateAsc', label: 'Дата окончания договора (сначала ближайшие)' },
  { value: 'endDateDesc', label: 'Дата окончания договора (сначала дальние)' },
  { value: 'amountDesc', label: 'Сумма (по убыванию)' },
  { value: 'amountAsc', label: 'Сумма (по возрастанию)' },
  { value: 'warehouseAsc', label: 'Склад (А-Я)' },
  { value: 'warehouseDesc', label: 'Склад (Я-А)' },
  { value: 'storageTypeAsc', label: 'Тип хранения (А-Я)' },
  { value: 'storageTypeDesc', label: 'Тип хранения (Я-А)' },
  { value: 'statusAsc', label: 'Статус заказа (А-Я)' },
  { value: 'statusDesc', label: 'Статус заказа (Я-А)' },
];

// Конфигурация статусов с иконками и цветами
const statusConfig = {
  ALL: { label: 'Все', icon: ClipboardList, color: 'bg-[#273655]', textColor: 'text-white' },
  INACTIVE: { label: 'Неактивные', icon: Users, color: 'bg-gray-800', textColor: 'text-white' },
  APPROVED: { label: 'Подтверждённые', icon: CheckCircle2, color: 'bg-emerald-500', textColor: 'text-white' },
  PROCESSING: { label: 'В обработке', icon: Clock, color: 'bg-amber-500', textColor: 'text-white' },
  ACTIVE: { label: 'Активные', icon: Zap, color: 'bg-[#00A991]', textColor: 'text-white' },
  RETURN: { label: 'Возврат', icon: Undo2, color: 'bg-rose-500', textColor: 'text-white' },
};

const ORDERS_PAGE_SIZE = 50;

const OrderManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [warehouseFilter, setWarehouseFilter] = useState('ALL');
  const [storageTypeFilter, setStorageTypeFilter] = useState('ALL');
  const [boxOrLocationFilter, setBoxOrLocationFilter] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('createdAtDesc');
  const [modalData, setModalData] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);

  // Функция для расчёта суммы услуг заказа
  const getOrderServicesTotal = (order) => {
    const services = Array.isArray(order.services) ? order.services : [];
    if (services.length === 0) return 0;
    return services.reduce((total, service) => {
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
  } = useAllOrders(currentPage, 'active', {
    enabled: canFetchOrders,
    onError: (error) => {
      showOrderLoadError();
      console.error('Ошибка загрузки заказов:', error);
    }
  });

  // Извлекаем данные и метаинформацию
  const allOrders = ordersData?.data || [];
  const meta = ordersData?.meta || { total: 0, page: 1, pageSize: ORDERS_PAGE_SIZE, totalPages: 1 };

  const hasClientFilters = useMemo(
    () =>
      statusFilter !== 'ALL' ||
      warehouseFilter !== 'ALL' ||
      storageTypeFilter !== 'ALL' ||
      tierFilter !== 'ALL' ||
      boxOrLocationFilter.trim() !== '',
    [statusFilter, warehouseFilter, storageTypeFilter, tierFilter, boxOrLocationFilter],
  );

  const useClientPagination = isSearchActive || hasClientFilters;

  const {
    data: allOrdersFlat = [],
    isLoading: isFlatLoading,
  } = useAllOrdersFlat('active', {
    enabled: canFetchOrders && hasClientFilters && !isSearchActive,
    onError: (error) => {
      showOrderLoadError();
      console.error('Ошибка загрузки заказов для фильтрации:', error);
    },
  });

  const {
    data: searchedOrders = [],
    isLoading: isSearchLoading,
    refetch: refetchSearch
  } = useSearchOrders(searchQuery, 'active');

  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  const approveCancelOrder = useApproveCancelOrder();
  const unlockStorage = useUnlockStorage();

  // Карта складов id → name. API /orders не всегда возвращает storage.warehouse.name,
  // поэтому подгружаем список складов один раз и резолвим имена локально.
  const [warehousesById, setWarehousesById] = useState({});

  useEffect(() => {
    if (!canFetchOrders) return undefined;
    let cancelled = false;
    warehouseApi.getAllWarehouses()
      .then((data) => {
        if (cancelled) return;
        const list = Array.isArray(data) ? data : [];
        const map = {};
        list.forEach((wh) => {
          if (wh?.id != null) map[wh.id] = wh.name || '';
        });
        setWarehousesById(map);
      })
      .catch(() => {
        // молча — наименование просто не покажем, номер бокса всё ещё будет виден
      });
    return () => { cancelled = true; };
  }, [canFetchOrders]);

  const getOrderWarehouseName = (order) => {
    return (
      order?.storage?.warehouse?.name ||
      warehousesById[order?.storage?.warehouse_id] ||
      ''
    );
  };

  const getOrderTier = (order) => {
    const value = order?.storage?.tier;
    if (value === null || value === undefined || value === '') return '';
    return String(value);
  };

  const getOrderBoxOrLocation = (order) => {
    const storageType = order?.storage?.storage_type;
    // "Камера хранения" считается типом хранения, а не боксом.
    if (storageType === 'CAMERA') return '';
    const storageName = order?.storage?.name ? String(order.storage.name).trim() : '';
    if (storageName) return storageName;
    const firstItemLocation = Array.isArray(order?.items)
      ? order.items.find((item) => item?.physical_location)?.physical_location
      : '';
    return firstItemLocation ? String(firstItemLocation).trim() : '';
  };

  // Проверяем загрузку мутаций
  const isMutating = updateOrderStatus.isLoading || deleteOrder.isLoading || approveCancelOrder.isPending || unlockStorage.isPending;

  // Определяем какие данные показывать
  const ordersToShow = isSearchActive
    ? searchedOrders
    : hasClientFilters
      ? allOrdersFlat
      : allOrders;

  const filteredByStatusOrders = useMemo(() => {
    if (statusFilter === 'RETURN') {
      return ordersToShow.filter(order =>
        order.cancel_status === 'PENDING' || order.cancel_status === 'APPROVED' || order.status === 'CANCELED',
      );
    }
    if (statusFilter === 'ALL') return ordersToShow;
    return ordersToShow.filter((order) => order.status === statusFilter);
  }, [ordersToShow, statusFilter]);

  const warehouseFilterOptions = useMemo(() => {
    const map = new Map();
    ordersToShow.forEach((order) => {
      const id = order?.storage?.warehouse_id;
      if (id == null) return;
      const key = String(id);
      const name = getOrderWarehouseName(order) || `Склад #${id}`;
      map.set(key, name);
    });
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, [ordersToShow, warehousesById]);

  const storageTypeOptions = useMemo(() => {
    const values = new Set();
    ordersToShow.forEach((order) => {
      if (order?.storage?.storage_type) {
        values.add(order.storage.storage_type);
      }
    });
    return Array.from(values)
      .map((value) => ({ value, label: getStorageTypeText(value) }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, [ordersToShow]);

  const tierOptions = useMemo(() => {
    const values = new Set();
    ordersToShow.forEach((order) => {
      const tierValue = getOrderTier(order);
      if (tierValue) values.add(tierValue);
    });
    return Array.from(values).sort((a, b) => Number(a) - Number(b));
  }, [ordersToShow]);

  const filteredOrders = useMemo(() => {
    const normalizedBoxSearch = boxOrLocationFilter.trim().toLowerCase();
    return filteredByStatusOrders.filter((order) => {
      const orderWarehouseId = order?.storage?.warehouse_id != null ? String(order.storage.warehouse_id) : '';
      const storageType = order?.storage?.storage_type || '';
      const orderTier = getOrderTier(order);
      const boxOrLocation = getOrderBoxOrLocation(order).toLowerCase();

      const matchesWarehouse = warehouseFilter === 'ALL' || orderWarehouseId === warehouseFilter;
      const matchesStorageType = storageTypeFilter === 'ALL' || storageType === storageTypeFilter;
      const matchesTier = tierFilter === 'ALL' || orderTier === tierFilter;
      const matchesBoxOrLocation = !normalizedBoxSearch || boxOrLocation.includes(normalizedBoxSearch);

      return matchesWarehouse && matchesStorageType && matchesTier && matchesBoxOrLocation;
    });
  }, [filteredByStatusOrders, warehouseFilter, storageTypeFilter, tierFilter, boxOrLocationFilter]);

  const sortedOrders = useMemo(() => {
    const list = [...filteredOrders];
    const textCompare = (a, b) => String(a || '').localeCompare(String(b || ''), 'ru');
    const dateValue = (value) => {
      const t = value ? new Date(value).getTime() : 0;
      return Number.isFinite(t) ? t : 0;
    };
    const amountValue = (order) => {
      const servicesTotal = getOrderServicesTotal(order);
      const base = Number(order?.total_price || 0);
      const discount = Number(order?.discount_amount || 0);
      return Math.max(0, base + servicesTotal - discount);
    };

    list.sort((a, b) => {
      switch (sortBy) {
        case 'createdAtAsc':
          return dateValue(a.created_at) - dateValue(b.created_at);
        case 'createdAtDesc':
          return dateValue(b.created_at) - dateValue(a.created_at);
        case 'endDateAsc':
          return dateValue(a.end_date) - dateValue(b.end_date);
        case 'endDateDesc':
          return dateValue(b.end_date) - dateValue(a.end_date);
        case 'amountAsc':
          return amountValue(a) - amountValue(b);
        case 'amountDesc':
          return amountValue(b) - amountValue(a);
        case 'warehouseAsc':
          return textCompare(getOrderWarehouseName(a), getOrderWarehouseName(b));
        case 'warehouseDesc':
          return textCompare(getOrderWarehouseName(b), getOrderWarehouseName(a));
        case 'storageTypeAsc':
          return textCompare(getStorageTypeText(a?.storage?.storage_type), getStorageTypeText(b?.storage?.storage_type));
        case 'storageTypeDesc':
          return textCompare(getStorageTypeText(b?.storage?.storage_type), getStorageTypeText(a?.storage?.storage_type));
        case 'statusAsc':
          return textCompare(a.status, b.status);
        case 'statusDesc':
          return textCompare(b.status, a.status);
        default:
          return 0;
      }
    });

    return list;
  }, [filteredOrders, sortBy]);

  const paginationMeta = useMemo(() => {
    if (!useClientPagination) return meta;
    const total = sortedOrders.length;
    return {
      total,
      page: clientPage,
      pageSize: ORDERS_PAGE_SIZE,
      totalPages: Math.max(1, Math.ceil(total / ORDERS_PAGE_SIZE)),
    };
  }, [useClientPagination, meta, sortedOrders.length, clientPage]);

  const paginatedOrders = useMemo(() => {
    if (!useClientPagination) return sortedOrders;
    const start = (clientPage - 1) * ORDERS_PAGE_SIZE;
    return sortedOrders.slice(start, start + ORDERS_PAGE_SIZE);
  }, [sortedOrders, useClientPagination, clientPage]);

  const activePage = useClientPagination ? clientPage : currentPage;

  // Статистика заказов (по отфильтрованному набору)
  const statistics = useMemo(() => {
    return sortedOrders.reduce((acc, order) => {
      acc.total += 1;
      if (order.status === 'INACTIVE') acc.inactive += 1;
      if (order.status === 'APPROVED') acc.approved += 1;
      if (order.status === 'PROCESSING') acc.processing += 1;
      if (order.status === 'ACTIVE') acc.active += 1;
      return acc;
    }, { total: 0, inactive: 0, approved: 0, processing: 0, active: 0 });
  }, [sortedOrders]);

  useEffect(() => {
    if (selectedOrder && isOrderDetailOpen) {
      const ordersToCheck = isSearchActive ? searchedOrders : allOrders;
      const updatedOrder = ordersToCheck.find(o => o.id === selectedOrder.id);
      if (updatedOrder && JSON.stringify(updatedOrder) !== JSON.stringify(selectedOrder)) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [allOrders, searchedOrders, isSearchActive, isOrderDetailOpen, selectedOrder]);

  useEffect(() => {
    setClientPage(1);
    if (!hasClientFilters) {
      setCurrentPage(1);
    }
  }, [statusFilter, warehouseFilter, storageTypeFilter, tierFilter, boxOrLocationFilter, hasClientFilters]);

  const handlePageChange = (page) => {
    if (useClientPagination) {
      setClientPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearchActive(true);
      setClientPage(1);
      resetToFirstPage();
      refetchSearch();
    } else {
      setIsSearchActive(false);
    }
  };

  const resetSearch = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    setClientPage(1);
    resetToFirstPage();
  };

  const handleResetAllFilters = () => {
    setSearchQuery('');
    setIsSearchActive(false);
    setStatusFilter('ALL');
    setWarehouseFilter('ALL');
    setStorageTypeFilter('ALL');
    setBoxOrLocationFilter('');
    setTierFilter('ALL');
    setSortBy('createdAtDesc');
    setClientPage(1);
    setCurrentPage(1);
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

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Не указана';
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return 'Не указана';
    return date.toLocaleDateString('ru-RU');
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

  const isLoading = isAllLoading || isSearchLoading || (hasClientFilters && isFlatLoading);
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
    if (order.order_source === 'OFFLINE_IMPORT') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200">
          <FileText className="w-3 h-3" />
          Без ЭДО
        </span>
      );
    }
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

  const getContractExpiryBadge = (order) => {
    const expiry = getOrderContractExpiry(order);
    if (expiry.status === CONTRACT_EXPIRY_STATUS.NO_END_DATE) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
          <FileText className="w-3 h-3" />
          Дата окончания не указана
        </span>
      );
    }
    if (expiry.status === CONTRACT_EXPIRY_STATUS.EXPIRED) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
          <FileText className="w-3 h-3" />
          Договор истёк
        </span>
      );
    }
    if (expiry.status === CONTRACT_EXPIRY_STATUS.ENDING_SOON) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <FileText className="w-3 h-3" />
          Договор заканчивается
        </span>
      );
    }
    return null;
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 mt-4">
            <FormSelect
              value={warehouseFilter}
              onChange={setWarehouseFilter}
              options={[
                { value: 'ALL', label: 'Все склады' },
                ...warehouseFilterOptions,
              ]}
              placeholder="Все склады"
            />

            <FormSelect
              value={storageTypeFilter}
              onChange={setStorageTypeFilter}
              options={[
                { value: 'ALL', label: 'Все типы хранения' },
                ...storageTypeOptions,
              ]}
              placeholder="Все типы хранения"
            />

            <FormSelect
              value={tierFilter}
              onChange={setTierFilter}
              options={[
                { value: 'ALL', label: 'Все ярусы' },
                ...tierOptions.map((tier) => ({ value: tier, label: `${tier} ярус` })),
              ]}
              placeholder="Все ярусы"
            />

            <Input
              value={boxOrLocationFilter}
              onChange={(e) => setBoxOrLocationFilter(e.target.value)}
              className="h-10 rounded-xl border-gray-200 focus:border-[#00A991] focus:ring-[#00A991]/20 text-sm"
              placeholder="Номер бокса / место хранения"
            />

            <div className="lg:col-span-2">
              <FormSelect value={sortBy} onChange={setSortBy} options={SORT_OPTIONS} />
            </div>
          </div>

          {/* Информация о фильтрации */}
          {(searchQuery || statusFilter !== 'ALL' || warehouseFilter !== 'ALL' || storageTypeFilter !== 'ALL' || tierFilter !== 'ALL' || boxOrLocationFilter.trim()) && (
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
              <span>
                Показано {paginatedOrders.length} из {useClientPagination ? paginationMeta.total : meta.total}
              </span>
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
              {warehouseFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#273655]/10 text-[#273655] text-xs font-medium">
                  {warehouseFilterOptions.find((item) => item.value === warehouseFilter)?.label || 'Склад'}
                </span>
              )}
              {storageTypeFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#273655]/10 text-[#273655] text-xs font-medium">
                  {getStorageTypeText(storageTypeFilter)}
                </span>
              )}
              {tierFilter !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#273655]/10 text-[#273655] text-xs font-medium">
                  {tierFilter} ярус
                </span>
              )}
              {boxOrLocationFilter.trim() && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#273655]/10 text-[#273655] text-xs font-medium">
                  {boxOrLocationFilter.trim()}
                </span>
              )}
              <button
                onClick={handleResetAllFilters}
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                Сбросить всё
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Список заказов */}
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
          <h2 className="text-base sm:text-lg font-semibold text-[#273655]">Список заказов</h2>
        </div>

        {sortedOrders.length === 0 ? (
          <div className="p-8 sm:p-12 flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <div className="text-gray-500 text-sm sm:text-base font-medium text-center">Заказы не найдены</div>
            <div className="text-gray-400 text-xs sm:text-sm text-center max-w-xs">
              {searchQuery || statusFilter !== 'ALL' || warehouseFilter !== 'ALL' || storageTypeFilter !== 'ALL' || tierFilter !== 'ALL' || boxOrLocationFilter.trim()
                ? 'Попробуйте изменить критерии поиска или фильтры'
                : 'Пока нет заказов для отображения'
              }
            </div>
            {(searchQuery || statusFilter !== 'ALL' || warehouseFilter !== 'ALL' || storageTypeFilter !== 'ALL' || tierFilter !== 'ALL' || boxOrLocationFilter.trim()) && (
              <button
                onClick={handleResetAllFilters}
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
              {paginatedOrders.map((order) => {
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[#00A991] bg-[#00A991]/10 px-2 py-0.5 rounded-full">
                            #{order.id}
                          </span>
                          {order.order_source === 'OFFLINE_IMPORT' && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-amber-300 text-amber-900 bg-amber-50">
                              Офлайн
                            </Badge>
                          )}
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
                      <span className="truncate max-w-[180px]">
                        {(() => {
                          const wh = getOrderWarehouseName(order);
                          const box = order.storage?.name;
                          if (wh && box) return `${wh} • ${box}`;
                          return wh || box || 'Не указано';
                        })()}
                      </span>
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
                        {getContractExpiryBadge(order)}
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Окончание: {formatDate(order.contract_end_date || order.end_date)}{typeof getOrderContractExpiry(order).daysRemaining === 'number' ? ` · ${getOrderContractExpiry(order).daysRemaining} дн.` : ''}
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
                  {paginatedOrders.map((order) => {
                    const priceInfo = getOrderPriceDisplay(order);
                    return (
                      <TableRow
                        key={order.id}
                        className="cursor-pointer hover:bg-[#00A991]/5 transition-colors border-b border-gray-50"
                        onClick={() => handleOrderClick(order)}
                      >
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-[#00A991]">#{order.id}</span>
                            {order.order_source === 'OFFLINE_IMPORT' && (
                              <Badge variant="outline" className="text-[10px] w-fit border-amber-300 text-amber-900 bg-amber-50">
                                Офлайн-импорт
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-[#273655]">{order.user?.name || order.user?.company_name || ''}</span>
                            <span className="text-xs text-gray-400">{order.user?.phone || order.user?.email || ''}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">
                          {(() => {
                            const wh = getOrderWarehouseName(order);
                            const box = order.storage?.name;
                            if (!wh && !box) return 'Не указано';
                            return (
                              <div className="flex flex-col leading-tight">
                                {wh && (
                                  <span className="text-sm font-medium text-[#273655]">{wh}</span>
                                )}
                                {box && (
                                  <span className="text-xs text-gray-500">Бокс {box}</span>
                                )}
                              </div>
                            );
                          })()}
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
                            {getContractExpiryBadge(order)}
                            <span className="text-xs text-gray-500">
                              Окончание: {formatDate(order.contract_end_date || order.end_date)}{typeof getOrderContractExpiry(order).daysRemaining === 'number' ? ` · ${getOrderContractExpiry(order).daysRemaining} дн.` : ''}
                            </span>
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
      {paginationMeta.totalPages > 1 && (
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 p-3 sm:p-4">
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() => handlePageChange(activePage - 1)}
              disabled={activePage <= 1}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            
            {Array.from({ length: Math.min(5, paginationMeta.totalPages) }, (_, i) => {
              let pageNum;
              if (paginationMeta.totalPages <= 5) {
                pageNum = i + 1;
              } else if (activePage <= 3) {
                pageNum = i + 1;
              } else if (activePage >= paginationMeta.totalPages - 2) {
                pageNum = paginationMeta.totalPages - 4 + i;
              } else {
                pageNum = activePage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-sm font-medium transition-all ${
                    activePage === pageNum
                      ? 'bg-[#00A991] text-white shadow-md shadow-[#00A991]/20'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              onClick={() => handlePageChange(activePage + 1)}
              disabled={activePage >= paginationMeta.totalPages}
              className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="text-center text-xs text-gray-400 mt-2">
            Страница {activePage} из {paginationMeta.totalPages} &middot; Всего {paginationMeta.total} заказов
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
    </div>
  );
};

export default OrderManagement;
