import React, { useState } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { 
  getOrderStatusText,
  getCargoMarkText
} from '../../../shared/lib/types/orders';
import EditLocationModal from './EditLocationModal';

const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') {
    return 'Индивидуальное';
  } else if (type === 'CLOUD') {
    return 'Облачное';
  }
  return type || 'Не указано';
};

const OrderDetailView = ({ order, onUpdate, onDelete, onApprove, isLoading = false }) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return parseFloat(price).toLocaleString('ru-RU') + ' ₸';
  };

  const MOVING_STATUS_TEXT = {
    PENDING_FROM: 'Ожидает забора',
    PENDING_TO: 'Ожидает доставки',
    IN_PROGRESS: 'В процессе (к складу)',
    IN_PROGRESS_TO: 'В процессе (к клиенту)',
    DELIVERED: 'Доставлено на склад',
    DELIVERED_TO: 'Доставлено клиенту',
    CANCELLED: 'Отменено',
  };

  function getMovingStatusText(s) {
    return MOVING_STATUS_TEXT[s] || s;
  }

  function getMovingStatusClass(s) {
    if (s === 'CANCELLED') return 'bg-red-50 text-red-700 border-red-200';
    if (s === 'DELIVERED' || s === 'DELIVERED_TO') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'IN_PROGRESS' || s === 'IN_PROGRESS_TO') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'PENDING_FROM' || s === 'PENDING_TO') return 'bg-amber-50 text-amber-800 border-amber-200';
    return 'bg-gray-50 text-gray-700 border-gray-200';
  }

  const getStatusVariant = (status) => {
    switch(status) {
      case 'INACTIVE': return 'destructive';
      case 'APPROVED': return 'default';
      case 'PROCESSING': return 'secondary';
      case 'ACTIVE': return 'default';
      default: return 'secondary';
    }
  };

  const handleEditLocation = (item) => {
    setSelectedItem(item);
    setIsLocationModalOpen(true);
  };

  const handleLocationUpdated = (updatedItem) => {
    if (onUpdate) {
      onUpdate({ ...order, items: order.items.map(item => 
        item.id === updatedItem.id 
          ? { ...item, physical_location: updatedItem.physical_location }
          : item
      )});
    }
  };

  // Информационная строка
  const InfoRow = ({ label, value, className = "" }) => (
    <div className={`flex justify-between items-center py-2 ${className}`}>
      <span className="text-sm text-gray-600">{label}</span>
      <div className="text-sm font-medium text-gray-900">{value}</div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Заказ #{order.id}</h2>
            <p className="text-sm text-gray-500">Создан: {formatDate(order.created_at)}</p>
          </div>
          <Badge variant={getStatusVariant(order.status)} className="font-medium h-fit">
            {getOrderStatusText(order.status)}
          </Badge>
        </div>
      </div>

      {/* Основная информация - сетка */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Информация о клиенте */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-xs">Информация о клиенте</h3>
          <div className="bg-gray-50 rounded-lg p-5 space-y-3 border border-gray-200">
            <InfoRow label="Имя" value={order.user?.name || 'Не указано'} />
            <Separator className="bg-gray-300" />
            <InfoRow label="Email" value={order.user?.email || 'Не указан'} />
            <Separator className="bg-gray-300" />
            <InfoRow label="Телефон" value={order.user?.phone || 'Не указан'} />
          </div>
        </div>

        {/* Детали заказа */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-xs">Детали заказа</h3>
          <div className="bg-gray-50 rounded-lg p-5 space-y-3 border border-gray-200">
            <InfoRow label="Склад/Бокс" value={order.storage?.name || 'Не указано'} />
            <Separator className="bg-gray-300" />
            <InfoRow 
              label="Тип хранения" 
              value={
                <Badge variant="outline" className="font-normal">
                  {getStorageTypeText(order.storage?.storage_type)}
                </Badge>
              } 
            />
            <Separator className="bg-gray-300" />
            <InfoRow label="Объем" value={`${order.total_volume} м³`} />
            <Separator className="bg-gray-300" />
            <InfoRow 
              label="Период аренды" 
              value={`${formatDate(order.start_date)} - ${formatDate(order.end_date)}`} 
            />
          </div>
        </div>
      </div>

      {/* Финансовая информация */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-xs">Финансовая информация</h3>
        <div className="bg-gray-50 rounded-lg p-5 space-y-3 border border-gray-200">
          <InfoRow label="Стоимость аренды" value={formatPrice(order.total_price)} />
          <Separator className="bg-gray-300" />
          <InfoRow label="Депозит" value="15 000 ₸" />
          <Separator className="bg-gray-300" />
          <div className="flex justify-between items-center py-3 pt-4 border-t-2 border-gray-300 mt-2">
            <span className="text-base font-semibold text-gray-900">Итого</span>
            <span className="text-xl font-bold text-[#1e2c4f]">
              {formatPrice((parseFloat(order.total_price) || 0) + 15000)}
            </span>
          </div>
        </div>
      </div>

      {/* Статусы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-xs">Статусы</h3>
          <div className="bg-gray-50 rounded-lg p-5 space-y-3 border border-gray-200">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Оплата</span>
              <Badge 
                variant={order.payment_status === 'PAID' ? 'default' : 'destructive'}
                className="font-medium"
              >
                {order.payment_status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
              </Badge>
            </div>
            <Separator className="bg-gray-300" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Договор</span>
              <Badge 
                variant={order.contract_status === 'SIGNED' ? 'default' : 'secondary'}
                className="font-medium"
              >
                {order.contract_status === 'SIGNED' ? 'Подписан' : 'Не подписан'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Дополнительные услуги */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-xs">Дополнительные услуги</h3>
          <div className="bg-gray-50 rounded-lg p-5 space-y-3 border border-gray-200">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Перевозка</span>
              <Badge 
                variant={order.is_selected_moving ? 'default' : 'outline'}
                className="font-medium"
              >
                {order.is_selected_moving ? 'Выбрано' : 'Не выбрано'}
              </Badge>
            </div>
            <Separator className="bg-gray-300" />
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Упаковка</span>
              <Badge 
                variant={order.is_selected_package ? 'default' : 'outline'}
                className="font-medium"
              >
                {order.is_selected_package ? 'Выбрано' : 'Не выбрано'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Предметы в заказе */}
      {order.items && order.items.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-xs">
            Предметы в заказе ({order.items.length})
          </h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.id} className="bg-white rounded-md p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">ID: {item.public_id}</span>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span>Объем: <span className="font-medium">{item.volume} м³</span></span>
                        <span className="text-gray-300">•</span>
                        <span>Метка: <span className="font-medium">{getCargoMarkText(item.cargo_mark)}</span></span>
                        {order?.storage?.storage_type === "CLOUD" && (
                          <>
                            <span className="text-gray-300">•</span>
                            <div className="flex items-center gap-2">
                              <span>Расположение: <span className="font-medium">{item.physical_location || 'Не определено'}</span></span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditLocation(item)}
                                className="h-6 px-2 text-xs hover:bg-gray-100"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Заказанные услуги */}
      {order.services && order.services.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-xs">
            Заказанные услуги ({order.services.length})
          </h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {order.services.map((service, index) => (
                <div key={service.id || index} className="bg-white rounded-md p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {service.description || service.type}
                    </span>
                    {service.OrderService && service.OrderService.count > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        ×{service.OrderService.count}
                      </Badge>
                    )}
                  </div>
                  {service.price && (
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                      <span>Цена:</span>
                      <span className="font-medium text-gray-900">{formatPrice(service.price)}</span>
                    </div>
                  )}
                  {service.OrderService?.total_price && service.OrderService.count > 1 && (
                    <div className="mt-1 flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                      <span className="text-gray-600 font-medium">Итого:</span>
                      <span className="font-semibold text-[#1e2c4f]">
                        {formatPrice(parseFloat(service.OrderService.total_price))}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Даты перемещения */}
      {order.moving_orders && order.moving_orders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-gray-900 uppercase tracking-wide text-xs">
            Даты перемещения ({order.moving_orders.length})
          </h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <div className="space-y-3">
              {order.moving_orders.map((movingOrder, index) => (
                <div key={movingOrder.id || index} className="bg-white rounded-md p-4 border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">Перемещение #{index + 1}</span>
                    <Badge className={`text-xs border ${getMovingStatusClass(movingOrder.status)}`}>
                      {getMovingStatusText(movingOrder.status)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Дата:</span>
                      <span>{formatDate(movingOrder.moving_date)}</span>
                    </div>
                    {movingOrder.address && (
                      <div className="mt-2 pt-3 border-t border-gray-200">
                        <span className="font-medium text-gray-700">Адрес:</span>
                        <div className="mt-1 text-gray-700">{movingOrder.address}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      {order.status !== 'ACTIVE' && (
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          <Button
            onClick={onDelete}
            disabled={isLoading}
            variant="destructive"
            className="flex-1 sm:flex-none"
          >
            Удалить заказ
          </Button>
          {order.status === 'INACTIVE' && (
            <>
              <Button
                onClick={onUpdate}
                disabled={isLoading}
                variant="secondary"
                className="flex-1 sm:flex-none"
              >
                Редактировать
              </Button>
              <Button
                onClick={onApprove}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-[#1e2c4f] hover:bg-[#1e2c4f]/90"
              >
                Подтвердить
              </Button>
            </>
          )}
        </div>
      )}

      {/* Модальное окно редактирования локации */}
      <EditLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        item={selectedItem}
        onLocationUpdated={handleLocationUpdated}
      />
    </div>
  );
};

export default OrderDetailView;

