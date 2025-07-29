import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { useAllOrders, useUpdateOrderStatus, useDeleteOrder } from '../../../shared/lib/hooks/use-orders';
import { showOrderLoadError } from '../../../shared/lib/utils/notifications';
import OrderCard from './OrderCard';
import OrderConfirmModal from './OrderConfirmModal';

const OrderManagement = () => {
  // React Query хуки с обработкой ошибок
  const { data: orders = [], isLoading, error, refetch } = useAllOrders({
    onError: (error) => {
      showOrderLoadError();
      console.error('Ошибка загрузки заказов:', error);
    }
  });
  const updateOrderStatus = useUpdateOrderStatus();
  const deleteOrder = useDeleteOrder();
  
  // Проверяем загрузку мутаций
  const isMutating = updateOrderStatus.isLoading || deleteOrder.isLoading;
  
  // Локальное состояние
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [modalData, setModalData] = useState(null);

  // Фильтрация и поиск с useMemo для оптимизации
  const filteredOrders = useMemo(() => {
    let filtered = [...orders];

    // Фильтр по статусу
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Поиск
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        // Поиск по основным полям заказа
        const basicMatch = 
          order.id.toString().includes(query) ||
          order.user?.name?.toLowerCase().includes(query) ||
          order.user?.email?.toLowerCase().includes(query) ||
          order.user?.phone?.includes(query);

        // Поиск по ID предметов заказа
        const itemsMatch = order.items?.some(item => 
          item.id.toString().includes(query)
        );

        return basicMatch || itemsMatch;
      });
    }

    return filtered;
  }, [orders, statusFilter, searchQuery]);

  // Статистика заказов
  const statistics = useMemo(() => ({
    total: orders.length,
    approved: orders.filter(o => o.status === 'APPROVED').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    active: orders.filter(o => o.status === 'ACTIVE').length,
  }), [orders]);



  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteOrder.mutateAsync(orderId);
    } catch (error) {
      // Ошибка обрабатывается в хуке
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
    
    // Для действий удаления используем старую логику
    if (action === 'delete') {
      await handleDeleteOrder(order.id);
      closeModal();
    }
    // Для подтверждения заказов теперь используется внутренняя логика модала
    // closeModal() будет вызван из модала после успешного подтверждения
  };

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              Поиск по ID заказа, ID предмета, имени
            </label>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              placeholder="Введите ID заказа, ID предмета, имя, email или телефон..."
            />
              </div>
            </div>

            {/* Фильтр по статусу через Tabs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Фильтр по статусу заказа
              </label>
              <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="ALL" className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2-2 2m0 10l2-2-2-2" />
                    </svg>
                    Все
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
                </TabsList>
              </Tabs>
            </div>

            {/* Информация о фильтрации */}
            {(searchQuery || statusFilter !== 'ALL') && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Показано {filteredOrders.length} из {orders.length} заказов
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
              onApprove={() => openConfirmModal('approve', order)}
              onDelete={() => openConfirmModal('delete', order)}
              isLoading={isMutating}
            />
          ))
        )}
      </div>

      {/* Модальное окно подтверждения */}
      {modalData && (
        <OrderConfirmModal
          isOpen={!!modalData}
          onClose={closeModal}
          onConfirm={handleConfirmAction}
          action={modalData.action}
          order={modalData.order}
        />
      )}
    </div>
  );
};

export default OrderManagement; 