import React, { useState, useMemo } from 'react';
import { useAllOrders, useUpdateOrderStatus, useDeleteOrder } from '../../../shared/lib/hooks/use-orders';
import { showOrderStatusUpdate, showOrderDeleteSuccess, showOrderLoadError } from '../../../shared/lib/utils/notifications';
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
      filtered = filtered.filter(order =>
        order.id.toString().includes(query) ||
        order.user?.name?.toLowerCase().includes(query) ||
        order.user?.email?.toLowerCase().includes(query) ||
        order.user?.phone?.includes(query)
      );
    }

    return filtered;
  }, [orders, statusFilter, searchQuery]);

  // Обработчики действий с использованием React Query мутаций
  const handleApproveOrder = async (orderId) => {
    try {
      await updateOrderStatus.mutateAsync({ orderId, status: 'APPROVED' });
    } catch (error) {
      // Ошибка обрабатывается в хуке
    }
  };

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
    
    if (action === 'approve') {
      await handleApproveOrder(order.id);
    } else if (action === 'delete') {
      await handleDeleteOrder(order.id);
    }
    
    closeModal();
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 mb-4">
            {error?.message || 'Произошла ошибка при загрузке заказов'}
          </div>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-[#1e2c4f] text-white rounded-lg hover:bg-[#273655] transition-colors"
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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#273655] mb-2">Управление заказами</h1>
        <p className="text-gray-600">Просмотр и управление всеми заказами пользователей</p>
      </div>

      {/* Фильтры и поиск */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Поиск */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Поиск по ID, имени, email или телефону
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1e2c4f]"
              placeholder="Введите поисковый запрос..."
            />
          </div>

          {/* Фильтр по статусу */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Фильтр по статусу
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#1e2c4f]"
            >
              <option value="ALL">Все статусы</option>
              <option value="INACTIVE">Неактивные</option>
              <option value="APPROVED">Подтвержденные</option>
              <option value="PROCESSING">В обработке</option>
              <option value="ACTIVE">Активные</option>
            </select>
          </div>
        </div>

        {/* Статистика */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#1e2c4f]">{orders.length}</div>
              <div className="text-sm text-gray-600">Всего заказов</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status === 'INACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">Требует внимания</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => o.status === 'APPROVED').length}
              </div>
              <div className="text-sm text-gray-600">Подтверждено</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {orders.filter(o => o.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-gray-600">Активных</div>
            </div>
          </div>
        </div>
      </div>

      {/* Список заказов */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center">
            <div className="text-gray-500 text-lg mb-2">Заказы не найдены</div>
            <div className="text-gray-400">
              {searchQuery || statusFilter !== 'ALL' 
                ? 'Попробуйте изменить критерии поиска или фильтры'
                : 'Пока нет заказов для отображения'
              }
            </div>
          </div>
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