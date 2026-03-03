import React, { useState, useEffect } from 'react';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import { 
  getOrderStatusText,
  getCargoMarkText
} from '../../../shared/lib/types/orders';
import { getServiceTypeName, formatServiceDescription } from '../../../shared/lib/utils/serviceNames';
import EditLocationModal from './EditLocationModal';
import ReturnApprovalPanel from './ReturnApprovalPanel';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { AlertTriangle, Unlock, Tag, User, Package, CreditCard, FileText, Truck } from 'lucide-react';
import { formatCalendarDate } from '../../../shared/lib/utils/date';

const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') {
    return 'Индивидуальное';
  } else if (type === 'CLOUD') {
    return 'Облачное';
  }
  return type || 'Не указано';
};

const OrderDetailView = ({ order, onUpdate, onDelete, onApprove, isLoading = false, onApproveReturn, onUnlockStorage}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);
  const [fetchedWarehouseName, setFetchedWarehouseName] = useState(null);

  // API возвращает storage.warehouse_id, но не storage.warehouse — подгружаем склад по ID
  useEffect(() => {
    if (!order?.storage) {
      setFetchedWarehouseName(null);
      return;
    }
    const warehouseFromApi = order.storage.warehouse?.name;
    const warehouseId = order.storage.warehouse_id ?? order.storage.warehouse?.id;
    if (warehouseFromApi) {
      setFetchedWarehouseName(null);
      return;
    }
    if (!warehouseId) {
      setFetchedWarehouseName(null);
      return;
    }
    let cancelled = false;
    warehouseApi.getWarehouseById(warehouseId)
      .then((wh) => { if (!cancelled && wh?.name) setFetchedWarehouseName(wh.name); })
      .catch(() => { if (!cancelled) setFetchedWarehouseName(null); });
    return () => { cancelled = true; };
  }, [order?.storage?.id, order?.storage?.warehouse_id, order?.storage?.warehouse?.name, order?.storage?.warehouse?.id]);

  // Расчёт суммы услуг. Бэкенд должен возвращать в GET /orders сервисы с полем price
  // или OrderService.total_price (order_service.total_price при snake_case).
  const getServiceAmount = (service) => {
    const orderSvc = service.OrderService || service.order_service;
    const totalFromApi = orderSvc?.total_price ?? orderSvc?.amount;
    if (totalFromApi != null && parseFloat(totalFromApi) > 0) return parseFloat(totalFromApi);
    const price = parseFloat(service.price) ?? parseFloat(service.unit_price) ?? 0;
    const count = orderSvc?.count ?? 1;
    const amount = price * count;
    return amount;
  };

  const getServicesTotal = () => {
    if (!order.services || order.services.length === 0) return 0;
    return order.services.reduce((total, service) => total + getServiceAmount(service), 0);
  };

  const servicesTotal = getServicesTotal();
  const totalBeforeDiscount = Number(order.total_price) + servicesTotal;
  const discountAmount = Number(order.discount_amount || 0);
  const totalPrice = Math.max(0, totalBeforeDiscount - discountAmount);

  // Расчёт стоимости в месяц при ежемесячной оплате
  const isMonthlyPayment = order.payment_type === 'MONTHLY';
  let monthlyAmount = null;
  if (isMonthlyPayment) {
    if (order.order_payment && order.order_payment.length > 0) {
      monthlyAmount = Number(order.order_payment[0].amount);
    } else if (order.start_date && order.end_date) {
      try {
        const startDate = new Date(order.start_date);
        const endDate = new Date(order.end_date);
        const monthsDiff = (endDate.getFullYear() - startDate.getFullYear()) * 12 +
          (endDate.getMonth() - startDate.getMonth());
        if (monthsDiff > 0) {
          monthlyAmount = Math.round(totalPrice / monthsDiff);
        }
      } catch (e) {
        console.error('Ошибка при расчете месячной стоимости:', e);
      }
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    return formatCalendarDate(dateString);
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    return parseFloat(price).toLocaleString('ru-RU') + ' ₸';
  };

  const MOVING_STATUS_TEXT = {
    PENDING: 'Ожидает доставки',
    COURIER_ASSIGNED: 'Курьер назначен',
    COURIER_IN_TRANSIT: 'Курьер в пути',
    COURIER_AT_CLIENT: 'Курьер у клиента',
    IN_PROGRESS: 'В пути',
    DELIVERED: 'Доставлено',
    FINISHED: 'Завершено',
    CANCELLED: 'Отменено',
  };

  function getMovingStatusText(s, direction) {
    const baseText = MOVING_STATUS_TEXT[s] || s;
    if (s === 'PENDING') {
      return direction === 'TO_CLIENT' ? 'Ожидает доставки' : 'Ожидает доставки';
    }
    if (s === 'IN_PROGRESS') {
      return direction === 'TO_CLIENT' ? 'В пути к клиенту' : 'В пути к складу';
    }
    if (s === 'DELIVERED') {
      return direction === 'TO_CLIENT' ? 'Доставлено клиенту' : 'Доставлено на склад';
    }
    return baseText;
  }

  function getMovingStatusClass(s) {
    if (s === 'CANCELLED') return 'bg-red-50 text-red-700 border-red-200';
    if (s === 'DELIVERED' || s === 'FINISHED') return 'bg-green-50 text-green-700 border-green-200';
    if (s === 'IN_PROGRESS' || s === 'COURIER_IN_TRANSIT' || s === 'COURIER_AT_CLIENT') return 'bg-blue-50 text-blue-700 border-blue-200';
    if (s === 'PENDING' || s === 'COURIER_ASSIGNED') return 'bg-amber-50 text-amber-800 border-amber-200';
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

  const InfoRow = ({ label, value, className = "" }) => (
    <div className={`flex justify-between items-center py-2.5 ${className}`}>
      <span className="text-sm text-[#6B6B6B]">{label}</span>
      <div className="text-sm font-medium text-[#273655]">{value}</div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between pb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#31876D]/10 flex items-center justify-center">
            <Package className="w-6 h-6 text-[#31876D]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#273655] mb-0.5">Заказ #{order.id}</h2>
            <p className="text-sm text-[#6B6B6B]">Создан: {formatDate(order.created_at)}</p>
          </div>
          <Badge variant={getStatusVariant(order.status)} className="font-medium h-fit">
            {getOrderStatusText(order.status)}
          </Badge>
        </div>
      </div>

      {/* Основная информация - сетка */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Информация о клиенте */}
        <Card className="border-gray-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#202422] flex items-center gap-2">
              <User className="w-4 h-4 text-[#31876D]" />
              Информация о клиенте
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <InfoRow label="Имя" value={order.user?.name || 'Не указано'} />
            <div className="border-t border-gray-100" />
            <InfoRow label="Email" value={order.user?.email || 'Не указан'} />
            <div className="border-t border-gray-100" />
            <InfoRow label="Телефон" value={order.user?.phone || 'Не указан'} />
          </CardContent>
        </Card>

        {/* Детали заказа */}
        <Card className="border-gray-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#202422] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#31876D]" />
              Детали заказа
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <InfoRow
              label="Склад/Бокс"
              value={(() => {
                const warehouseName = order.storage?.warehouse?.name ?? fetchedWarehouseName;
                const boxName = order.storage?.name;
                if (warehouseName && boxName) return `${warehouseName}, бокс ${boxName}`;
                return warehouseName || boxName || 'Не указано';
              })()}
            />
            <div className="border-t border-gray-100" />
            <InfoRow 
              label="Тип хранения" 
              value={
                <Badge variant="outline" className="font-normal border-gray-200">
                  {getStorageTypeText(order.storage?.storage_type)}
                </Badge>
              } 
            />
            <div className="border-t border-gray-100" />
            <InfoRow label="Объем" value={`${order.total_volume} м³`} />
            <div className="border-t border-gray-100" />
            <InfoRow 
              label="Период аренды" 
              value={`${formatDate(order.start_date)} - ${formatDate(order.end_date)}`} 
            />
          </CardContent>
        </Card>
      </div>

      {/* Финансовая информация */}
      <Card className="border-[#31876D]/20 bg-[#31876D]/5 rounded-2xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-[#202422] flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#31876D]" />
            Финансовая информация
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          <InfoRow label="Стоимость аренды" value={formatPrice(order.total_price)} />
          {isMonthlyPayment && monthlyAmount != null && (
            <>
              <div className="border-t border-[#31876D]/20" />
              <InfoRow label="Стоимость в месяц" value={formatPrice(monthlyAmount)} />
            </>
          )}
          {servicesTotal > 0 && (
            <>
              <div className="border-t border-[#31876D]/20" />
              <InfoRow label="Стоимость услуг" value={formatPrice(servicesTotal)} />
            </>
          )}
          {order.promo_code && (
            <>
              <div className="border-t border-[#31876D]/20" />
              <div className="flex justify-between items-center py-2.5">
                <span className="text-sm text-[#6B6B6B] flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Промокод
                </span>
                <Badge className="bg-[#31876D]/10 text-[#31876D] border-[#31876D]/20">
                  {order.promo_code.code} (-{order.promo_code.discount_percent}%)
                </Badge>
              </div>
            </>
          )}
          {discountAmount > 0 && (
            <>
              <div className="border-t border-[#31876D]/20" />
              <div className="flex justify-between items-center py-2.5 text-[#31876D]">
                <span className="text-sm">Скидка</span>
                <span className="font-medium">-{formatPrice(discountAmount)}</span>
              </div>
            </>
          )}
          <div className="border-t-2 border-[#31876D]/20 mt-4 pt-4" />
          <div className="flex justify-between items-center py-2">
            <span className="text-base font-semibold text-[#273655]">Итого</span>
            <div className="text-right">
              {discountAmount > 0 && (
                <span className="text-[#6B6B6B] line-through text-sm mr-2">
                  {formatPrice(totalBeforeDiscount)}
                </span>
              )}
              <span className="text-xl font-bold text-[#31876D]">
                {formatPrice(totalPrice)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Статусы */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-gray-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#202422] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#31876D]" />
              Статусы
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-[#6B6B6B]">Оплата</span>
              <Badge 
                variant={order.payment_status === 'PAID' ? 'outline' : 'destructive'}
                className={`font-medium ${order.payment_status === 'PAID' ? 'bg-[#31876D]/10 text-[#31876D] border-[#31876D]/20' : ''}`}
              >
                {order.payment_status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
              </Badge>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-[#6B6B6B]">Договор</span>
              <Badge 
                variant={order.contract_status === 'SIGNED' ? 'outline' : 'secondary'}
                className={`font-medium ${order.contract_status === 'SIGNED' ? 'bg-[#31876D]/10 text-[#31876D] border-[#31876D]/20' : ''}`}
              >
                {order.contract_status === 'SIGNED' ? 'Подписан' : 'Не подписан'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Дополнительные услуги */}
        <Card className="border-gray-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#202422] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#31876D]" />
              Дополнительные услуги
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 pt-0">
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-[#6B6B6B]">Перевозка</span>
              <div className="flex items-center gap-2">
                {order.services?.some(s => ['GAZELLE', 'GAZELLE_FROM', 'GAZELLE_TO'].includes(s.type)) && (
                  <span className="text-sm font-medium text-[#273655]">
                    {formatPrice(order.services
                      .filter(s => ['GAZELLE', 'GAZELLE_FROM', 'GAZELLE_TO'].includes(s.type))
                      .reduce((sum, s) => sum + getServiceAmount(s), 0)
                    )}
                  </span>
                )}
                <Badge 
                  variant="outline"
                  className={`font-medium ${order.is_selected_moving ? 'bg-[#31876D]/10 text-[#31876D] border-[#31876D]/20' : 'border-gray-200'}`}
                >
                  {order.is_selected_moving ? 'Выбрано' : 'Не выбрано'}
                </Badge>
              </div>
            </div>
            <div className="border-t border-gray-100" />
            <div className="flex justify-between items-center py-2.5">
              <span className="text-sm text-[#6B6B6B]">Упаковка</span>
              <div className="flex items-center gap-2">
                {order.services?.filter(s => !['GAZELLE', 'GAZELLE_FROM', 'GAZELLE_TO'].includes(s.type)).length > 0 && (
                  <span className="text-sm font-medium text-[#273655]">
                    {formatPrice(order.services
                      .filter(s => !['GAZELLE', 'GAZELLE_FROM', 'GAZELLE_TO'].includes(s.type))
                      .reduce((sum, s) => sum + getServiceAmount(s), 0)
                    )}
                  </span>
                )}
                <Badge 
                  variant="outline"
                  className={`font-medium ${order.is_selected_package ? 'bg-[#31876D]/10 text-[#31876D] border-[#31876D]/20' : 'border-gray-200'}`}
                >
                  {order.is_selected_package ? 'Выбрано' : 'Не выбрано'}
                </Badge>
              </div>
            </div>
            {order.services && order.services.length > 0 && (
              <>
                <div className="border-t border-gray-100" />
                <div className="pt-2 space-y-2">
                  {order.services.map((service, index) => (
                    <div key={service.id || index} className="flex justify-between items-center py-1 text-xs">
                      <span className="text-[#6B6B6B]">
                        {getServiceTypeName(service.type) || formatServiceDescription(service.description) || service.type}
                        {service.OrderService?.count > 1 && ` ×${service.OrderService.count}`}
                      </span>
                      <span className="font-medium text-[#273655]">
                        {formatPrice(getServiceAmount(service))}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Предметы в заказе */}
      {order.items && order.items.length > 0 && order.storage?.storage_type !== 'INDIVIDUAL' && (
        <Card className="border-gray-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#202422]">
              Предметы в заказе ({order.items.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {order.items.map((item) => (
                <div key={item.id} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#31876D]/20 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-[#6B6B6B] bg-[#31876D]/5 px-2 py-1 rounded-lg">ID: {item.public_id}</span>
                        <span className="text-sm font-medium text-[#273655]">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-[#6B6B6B]">
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
                                className="h-6 px-2 text-xs hover:bg-[#31876D]/10 text-[#31876D]"
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
          </CardContent>
        </Card>
      )}

      {/* Заказанные услуги */}
      {order.services && order.services.length > 0 && (
        <Card className="border-gray-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#202422] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#31876D]" />
              Заказанные услуги ({order.services.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {order.services.map((service, index) => (
                <div key={service.id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#31876D]/20 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[#273655]">
                      {formatServiceDescription(service.description) || service.type}
                    </span>
                    {service.OrderService && service.OrderService.count > 1 && (
                      <Badge variant="secondary" className="text-xs">
                        ×{service.OrderService.count}
                      </Badge>
                    )}
                  </div>
                  {service.price && (
                    <div className="mt-2 flex items-center justify-between text-xs text-[#6B6B6B]">
                      <span>Цена:</span>
                      <span className="font-medium text-[#273655]">{formatPrice(service.price)}</span>
                    </div>
                  )}
                  {service.OrderService?.total_price && service.OrderService.count > 1 && (
                    <div className="mt-1 flex items-center justify-between text-xs pt-2 border-t border-gray-200">
                      <span className="text-[#6B6B6B] font-medium">Итого:</span>
                      <span className="font-semibold text-[#31876D]">
                        {formatPrice(parseFloat(service.OrderService.total_price))}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Даты перемещения */}
      {order.moving_orders && order.moving_orders.length > 0 && (
        <Card className="border-gray-200 rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#202422] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#31876D]" />
              Даты перемещения ({order.moving_orders.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {order.moving_orders.map((movingOrder, index) => (
                <div key={movingOrder.id || index} className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:border-[#31876D]/20 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-[#273655]">Перемещение #{index + 1}</span>
                    <Badge className={`text-xs border ${getMovingStatusClass(movingOrder.status)}`}>
                      {getMovingStatusText(movingOrder.status, movingOrder.direction)}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-xs text-[#6B6B6B]">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Дата:</span>
                      <span>{formatDate(movingOrder.moving_date)}</span>
                    </div>
                    {movingOrder.address && (
                      <div className="mt-2 pt-3 border-t border-gray-200">
                        <span className="font-medium text-[#273655]">Адрес:</span>
                        <div className="mt-1 text-[#6B6B6B]">{movingOrder.address}</div>
                      </div>
                    )}
                    {movingOrder.delivery_time_interval && (
                      <div className="mt-2 pt-3 border-t border-gray-200">
                        <span className="font-medium text-[#273655]">Время доставки:</span>
                        <div className="mt-1 text-[#6B6B6B]">{movingOrder.delivery_time_interval}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Кнопки действий */}
      {order.status !== 'ACTIVE' && (
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
          {['CANCELED', 'FINISHED'].includes(order.status) && onDelete && (
              <Button
                  onClick={onDelete}
                  disabled={isLoading}
                  variant="destructive"
                  className="flex-1 sm:flex-none rounded-xl"
              >
                Удалить заказ
              </Button>
          )}
          {order.status === 'INACTIVE' && (
            <>
              <Button
                onClick={onUpdate}
                disabled={isLoading}
                variant="secondary"
                className="flex-1 sm:flex-none rounded-xl border-gray-200 text-[#273655] hover:bg-gray-100"
              >
                Редактировать
              </Button>
              <Button
                onClick={onApprove}
                disabled={isLoading}
                className="flex-1 sm:flex-none bg-[#31876D] hover:bg-[#31876D]/90 rounded-xl"
              >
                Подтвердить
              </Button>
            </>
          )}
        </div>
      )}
      {/* Кнопка подтверждения возврата для заказов с cancel_status === 'PENDING' */}
      <ReturnApprovalPanel
        order={order}
        onApproveReturn={onApproveReturn}
        isLoading={isLoading}
      />

      {/* Кнопка разблокировки бокса для отмененных заказов с cancel_status === 'APPROVED' */}
      {onUnlockStorage !== undefined && order.status === 'CANCELED' && order.cancel_status === 'SIGNED' && (
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-900 mb-1">Бокс заблокирован</h4>
                <p className="text-sm text-red-700">
                  Заказ отменен, но бокс все еще заблокирован. Разблокируйте бокс, чтобы сделать его доступным для новых заказов.
                </p>
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={() => setIsUnlockModalOpen(true)}
              disabled={isLoading}
              className="bg-[#31876D] hover:bg-[#31876D]/90 text-white rounded-xl flex items-center justify-center gap-2 min-w-[180px]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Разблокировать бокс
            </Button>
          </div>
        </div>
      )}

      {/* Модальное окно подтверждения разблокировки бокса */}
      <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
        <DialogContent className="sm:max-w-[420px] p-0 rounded-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#26B3AB] to-[#104D4A] p-5">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Unlock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-white">
                    Разблокировка бокса
                  </DialogTitle>
                  <DialogDescription className="text-white/80 text-sm mt-0.5">
                    Подтверждение действия
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <div className="p-5">
            {/* Предупреждение */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900 mb-1">
                    Важное предупреждение
                  </h4>
                  <p className="text-sm text-amber-700">
                    Перед разблокировкой бокса убедитесь, что клиент забрал все свои вещи и бокс полностью пуст.
                  </p>
                </div>
              </div>
            </div>

            {/* Информация о заказе */}
            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <p className="text-sm text-[#273655]">
                <span className="font-medium">Заказ:</span> №{order.id}
              </p>
              {order.storage && (
                <p className="text-sm text-[#273655] mt-1">
                  <span className="font-medium">Бокс:</span> {order.storage.name || `#${order.storage.id}`}
                </p>
              )}
            </div>

            {/* Кнопки */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUnlockModalOpen(false)}
                className="flex-1 h-11 rounded-xl border-gray-200 text-[#273655] hover:bg-gray-50"
              >
                Отмена
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onUnlockStorage(order.id);
                  setIsUnlockModalOpen(false);
                }}
                disabled={isLoading}
                className="flex-1 h-11 rounded-xl bg-gradient-to-r from-[#26B3AB] to-[#104D4A] hover:opacity-90 text-white"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Обработка...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Unlock className="w-4 h-4" />
                    Подтвердить
                  </span>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

