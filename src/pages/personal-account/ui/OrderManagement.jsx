import React from 'react';
import {useState, useMemo} from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../../../components/ui/pagination';
import {
  useAllOrders,
  useUpdateOrderStatus,
  useDeleteOrder,
  useSearchOrders,
  useOrdersStats,
  useApproveCancelOrder
} from '../../../shared/lib/hooks/use-orders';
import { showOrderLoadError } from '../../../shared/lib/utils/notifications';
import OrderCard from './OrderCard';
import OrderDeleteModal from "./OrderDeleteModal";
import {toast} from "react-toastify";
import { EditOrderModal } from '@/pages/personal-account/ui/EditOrderModal.jsx';
import {useNavigate} from "react-router-dom";
import {OrderConfirmModal} from "@/pages/personal-account/ui/index.js";

const OrderManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalData, setModalData] = useState(null);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Хуки для данных
  const {
    data: ordersData,
    isLoading: isAllLoading,
    error: allError,
    refetch
  } = useAllOrders(currentPage, {
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

  // Проверяем загрузку мутаций
  const isMutating = updateOrderStatus.isLoading || deleteOrder.isLoading || approveCancelOrder.isPending;

  // Определяем какие данные показывать
  const ordersToShow = isSearchActive ? searchedOrders : allOrders;

  // Фильтрация по статусу и возвратам
  const filteredOrders = useMemo(() => {
    if (statusFilter === 'RETURN') {
      // Фильтр для возвратов: заказы с cancel_status === 'PENDING' или 'APPROVED'
      return ordersToShow.filter(order => 
        order.cancel_status === 'PENDING' || order.cancel_status === 'APPROVED'
      );
    }
    if (statusFilter === 'ALL') return ordersToShow;
    return ordersToShow.filter(order => order.status === statusFilter);
  }, [ordersToShow, statusFilter]);

  // Получаем статистику отдельно
  const { stats: ordersStats } = useOrdersStats();

  // Статистика заказов (используем отдельную статистику)
  const statistics = useMemo(() => ({
    total: ordersStats.total,
    inactive: ordersStats.inactive,
    approved: ordersStats.approved,
    processing: ordersStats.processing,
    active: ordersStats.active,
  }), [ordersStats]);

  // Функции для пагинации
  const handlePageChange = (page) => {
    setCurrentPage(page);
    setStatusFilter('ALL'); // Сбрасываем фильтр при смене страницы
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
      toast.error('Ошибка', {
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
    } else if (action === 'approve') {

    } else if (action === 'update') {

    }
  };

  const handleApproveReturn = async (orderId) => {
    try {
      await approveCancelOrder.mutateAsync(orderId);
    } catch (error) {
      console.error(error);
      toast.error('Ошибка', {
        duration: 2000,
        position: 'top-right',
        description: error.response?.data?.message || error.message,
      });
    }
  };

  const isLoading = isAllLoading || isSearchLoading;
  const error = allError;

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <Card className="p-12">
          <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
            <span className="ml-3 text-[#1e2c4f] font-medium">Загрузка заказов...</span>
        </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="text-red-700 mb-4 font-medium">
            {error?.message || 'Произошла ошибка при загрузке заказов'}
          </div>
            <Button
            onClick={() => refetch()}
              className="bg-[#1e2c4f] hover:bg-[#1e2c4f]/90"
          >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-8 space-y-6">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-[#1e2c4f] mb-2 flex items-center gap-3">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
          Управление заказами
        </h1>
        <p className="text-gray-600">Просмотр и управление всеми заказами пользователей</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

        <Card className="bg-gradient-to-r from-[#1e2c4f] to-blue-600 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-2xl font-bold">{statistics.total}</span>
            </div>
            <div className="text-sm opacity-90">Всего заказов</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-[#000] to-red-700 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span className="text-2xl font-bold">{statistics.inactive}</span>
            </div>
            <div className="text-sm opacity-90">Некативный</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-2xl font-bold">{statistics.approved}</span>
            </div>
            <div className="text-sm opacity-90">Подтверждено</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-2xl font-bold">{statistics.processing}</span>
            </div>
            <div className="text-sm opacity-90">В обработке</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg transition-shadow">
          <CardContent className="p-4 text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-2xl font-bold">{statistics.active}</span>
            </div>
            <div className="text-sm opacity-90">Активных</div>
          </CardContent>
        </Card>
      </div>

      {/* Фильтры и поиск */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
            </svg>
            Фильтры и поиск
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
          {/* Поиск */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Поиск по имени или телефону
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                      placeholder="Введите имя или телефон..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button
                    onClick={handleSearch}
                    disabled={!searchQuery.trim()}
                    className="bg-[#1e2c4f] hover:bg-[#1e2c4f]/90"
                >
                  Найти
                </Button>
                {isSearchActive && (
                    <Button
                        variant="outline"
                        onClick={resetSearch}
                    >
                      Сбросить</Button>
                )}
              </div>
            </div>



            {/* Фильтр по статусу через Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Фильтр по статусу заказа
              </label>
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="grid grid-cols-2 sm:grid-cols-6 w-full">
                  <TabsTrigger value="ALL" className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m0 10l2-2-2-2" />
                    </svg>
                    Все
                  </TabsTrigger>
                  <TabsTrigger value="INACTIVE" className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m0 10l2-2-2-2" />
                    </svg>
                    Некативные
                  </TabsTrigger>
                  <TabsTrigger value="APPROVED" className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Подтвержденные
                  </TabsTrigger>
                  <TabsTrigger value="PROCESSING" className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    В обработке
                  </TabsTrigger>
                  <TabsTrigger value="ACTIVE" className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Активные
                  </TabsTrigger>
                  <TabsTrigger value="RETURN" className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                    Возврат
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Информация о фильтрации */}
            {(searchQuery || statusFilter !== 'ALL') && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Показано {filteredOrders.length} из {meta.total} заказов
                {searchQuery && (
                  <Badge variant="outline" className="ml-2">
                    Поиск: "{searchQuery}"
                  </Badge>
                )}
                {statusFilter !== 'ALL' && (
                  <Badge variant="outline" className="ml-2">
                    Статус: {statusFilter}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Список заказов */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="border-dashed border-gray-300 bg-gray-50">
            <CardContent className="p-12 text-center">
              <div className="flex items-center justify-center mb-4">
                <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="text-gray-500 text-lg mb-2 font-medium">Заказы не найдены</div>
            <div className="text-gray-400">
              {searchQuery || statusFilter !== 'ALL' 
                ? 'Попробуйте изменить критерии поиска или фильтры'
                : 'Пока нет заказов для отображения'
              }
            </div>
              {(searchQuery || statusFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  className="mt-4"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Сбросить фильтры
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onUpdate={() => openConfirmModal('update', order)}
              onDelete={() => openConfirmModal('delete', order)}
              onApprove={() => openConfirmModal('approve', order)}
              onApproveReturn={statusFilter === 'RETURN' ? handleApproveReturn : undefined}
              isLoading={isMutating}
            />
          ))
        )}
      </div>

      {/* Пагинация */}
      {!isSearchActive && meta.totalPages > 1 && (
        <Card className="border-gray-200">
          <CardContent className="p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {/* Номера страниц */}
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
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => handlePageChange(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => handlePageChange(currentPage + 1)}
                    className={currentPage >= meta.totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            
            {/* Информация о страницах */}
            <div className="text-center text-sm text-gray-500 mt-2">
              Страница {currentPage} из {meta.totalPages} • Всего {meta.total} заказов
            </div>
          </CardContent>
        </Card>
      )}

      {/* Модальное окно подтверждения */}
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
    </div>
  );
};

export default OrderManagement; 