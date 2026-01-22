import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { 
  AlertTriangle, 
  User, 
  Package, 
  Truck, 
  MapPin,
  Phone,
  Mail,
  Trash2,
  FileX
} from 'lucide-react';
import { ordersApi } from '../../../shared/api/ordersApi';
import { toast } from 'react-toastify';
import { useCancelOrder } from '../../../shared/lib/hooks/use-orders';
import {warehouseApi as storageApi} from "../../.././../src/shared/api/warehouseApi.js";

const getServiceTypeName = (type) => {
  if (!type) return 'Услуга';
  const serviceNames = {
    "LOADER": "Грузчик",
    "PACKER": "Упаковщик",
    "FURNITURE_SPECIALIST": "Мебельщик",
    "GAZELLE": "Газель",
    "GAZELLE_FROM": "Газель - забор вещей",
    "GAZELLE_TO": "Газель - возврат вещей",
    "STRETCH_FILM": "Стрейч-плёнка",
    "BOX_SIZE": "Коробка",
    "MARKER": "Маркер",
    "UTILITY_KNIFE": "Канцелярский нож",
    "BUBBLE_WRAP_1": "Воздушно-пузырчатая плёнка 10м",
    "BUBBLE_WRAP_2": "Воздушно-пузырчатая плёнка 120м",
    "RACK_RENTAL": "Аренда стеллажей",
  };
  return serviceNames[type] || type;
};

const translateOrderStatus = (status) => {
  if (!status) return 'Неизвестно';
  const statusMap = {
    'ACTIVE': 'Активный',
    'INACTIVE': 'Неактивный',
    'APPROVED': 'Одобрен',
    'PROCESSING': 'В обработке',
    'CANCELED': 'Отменен',
    'FINISHED': 'Завершен',
    'PENDING': 'Ожидает подтверждения',
  };
  return statusMap[status] || status;
};

const translateContractStatus = (status) => {
  if (!status) return 'Неизвестно';
  const statusMap = {
    'SIGNED': 'Подписан',
    'UNSIGNED': 'Не подписан',
  };
  return statusMap[status] || status;
};

const translatePaymentStatus = (status) => {
  if (!status) return 'Неизвестно';
  const statusMap = {
    'PAID': 'Оплачен',
    'UNPAID': 'Не оплачен',
  };
  return statusMap[status] || status;
};

const translateMovingStatus = (status) => {
  if (!status) return 'Неизвестно';
  const statusMap = {
    'PENDING': 'Ожидает',
    'COURIER_ASSIGNED': 'Курьер назначен',
    'COURIER_IN_TRANSIT': 'Курьер в пути',
    'COURIER_AT_CLIENT': 'Курьер у клиента',
    'IN_PROGRESS': 'В процессе',
    'DELIVERED': 'Доставлен',
    'FINISHED': 'Завершено',
    'CANCELLED': 'Отменен',
  };
  return statusMap[status] || status;
};

const translateCargoMark = (mark) => {
  if (!mark) return 'Нет';
  const markMap = {
    'NO': 'Нет',
    'HEAVY': 'Тяжелый',
    'FRAGILE': 'Хрупкий',
  };
  return markMap[mark] || mark;
};

const translateCancelStatus = (status) => {
  if (!status) return 'Нет';
  const statusMap = {
    'NO': 'Нет',
    'PENDING': 'В ожидании',
    'APPROVED': 'Подтвержден',
  };
  return statusMap[status] || status;
};

const CANCEL_REASON_OPTIONS = [
  { value: 'no_longer_needed', label: 'Вещи больше не нужно хранить' },
  { value: 'too_expensive', label: 'Слишком дорого' },
  { value: 'moving_to_new_location', label: 'Переезжаю в другой район / город / страну' },
  { value: 'using_other_storage', label: 'Пользуюсь другим местом хранения' },
  { value: 'ordered_by_mistake', label: 'Оформил(а) заказ по ошибке' },
  { value: 'service_quality_issues', label: 'Есть замечания по качеству услуги' },
  { value: 'not_satisfied_with_terms', label: 'Не устроили условия или сервис' },
  { value: 'rarely_use', label: 'Редко пользуюсь, бокс пустует' },
  { value: 'other', label: 'Другая причина (укажите ниже)', requiresComment: true },
];

// Вычисление количества месяцев между датами
const calculateMonths = (startDate, endDate) => {
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
    
    // Общее количество месяцев
    let totalMonths = yearsDiff * 12 + monthsDiff;
    
    // Если разница в днях больше 15, считаем как дополнительный месяц
    if (daysDiff > 15) {
      totalMonths += 1;
    }
    
    return Math.max(1, totalMonths); // Минимум 1 месяц
  } catch (error) {
    console.error('Ошибка при вычислении месяцев:', error);
    return 0;
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    return '-';
  }
};

const formatPrice = (price) => {
  if (!price && price !== 0) return '0 ₸';
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(numPrice)) return '0 ₸';
  return `${numPrice.toLocaleString('ru-RU')} ₸`;
};

const getMonthWord = (months) => {
  if (months === 1) return 'месяц';
  if (months >= 2 && months <= 4) return 'месяца';
  return 'месяцев';
};

const PendingOrderModal = ({ isOpen, order, storageId, onClose, onUnbook, isUnbooking = false }) => {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [isCancelSurveyOpen, setIsCancelSurveyOpen] = React.useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = React.useState('');
  const [cancelReasonComment, setCancelReasonComment] = React.useState('');
  const [cancelFormError, setCancelFormError] = React.useState('');
  const cancelOrderMutation = useCancelOrder();

  // Сброс состояния подтверждения при закрытии основного модального окна
  React.useEffect(() => {
    if (!isOpen) {
      setIsConfirmDialogOpen(false);
      setIsCancelSurveyOpen(false);
      setSelectedCancelReason('');
      setCancelReasonComment('');
      setCancelFormError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleForceUnbook = async () => {
    try {
      if (storageId) {
        await storageApi.resetStorageInfo(storageId);
        toast.success('Бокс успешно разбронирован');
      }
      if (onUnbook) {
        await onUnbook(order?.id);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при принудительном разбронировании:', error);
      toast.error(
        error?.response?.data?.message ||
        'Не удалось разбронировать бокс. Попробуйте позже.'
      );
    }
  };

  const handleUnbookClick = () => {
    setIsConfirmDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    setIsConfirmDialogOpen(false);
  };

  const handleConfirmUnbook = async () => {
    setIsConfirmDialogOpen(false);
    try {
      await ordersApi.deleteOrder(order?.id);
      toast.success('Бокс успешно разбронирован');
      if (onUnbook) {
        await onUnbook(order?.id);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при разбронировании:', error);
      const errorMessage = error.response?.data?.message ||
                          error.response?.data?.error ||
                          'Не удалось разбронировать бокс. Попробуйте позже.';
      toast.error(errorMessage);
    }
  };

  const handleCancelOrderClick = () => {
    setIsCancelSurveyOpen(true);
  };

  const handleCloseCancelSurvey = () => {
    setIsCancelSurveyOpen(false);
    setSelectedCancelReason('');
    setCancelReasonComment('');
    setCancelFormError('');
  };

  const handleSubmitCancelOrder = async () => {
    if (!selectedCancelReason) {
      setCancelFormError('Пожалуйста, выберите причину расторжения.');
      return;
    }

    if (selectedCancelReason === 'other' && !cancelReasonComment.trim()) {
      setCancelFormError('Пожалуйста, опишите причину в комментарии.');
      return;
    }

    setCancelFormError('');

    try {
      await cancelOrderMutation.mutateAsync({
        orderId: order?.id,
        cancelReason: selectedCancelReason,
        cancelComment: cancelReasonComment.trim(),
      });
      handleCloseCancelSurvey();
      if (onUnbook) {
        await onUnbook(order?.id);
      }
      onClose();
    } catch (error) {
      console.error('Ошибка при расторжении контракта:', error);
      setCancelFormError(error.response?.data?.message || 'Не удалось расторгнуть контракт. Попробуйте позже.');
    }
  };

  // Определяем, можно ли разбронировать бокс
  const canUnbook = order?.status !== 'ACTIVE';
  // Определяем, можно ли расторгнуть контракт
  const canCancelContract = order?.status === 'ACTIVE' && order?.cancel_status === 'NO';

  // Расчет общей стоимости услуг
  const getServicesTotal = () => {
    if (!order?.services || !Array.isArray(order?.services) || order?.services.length === 0) return 0;
    return order?.services.reduce((total, service) => {
      const count = service?.OrderService?.count || 1;
      const price = typeof service?.price === 'string'
        ? parseFloat(service.price)
        : (service?.price || 0);
      if (isNaN(price)) return total;
      return total + (price * count);
    }, 0);
  };

  const servicesTotal = getServicesTotal();
  const basePrice = typeof order?.total_price === 'string'
    ? parseFloat(order?.total_price)
    : (order?.total_price || 0);
  const totalPrice = (isNaN(basePrice) ? 0 : basePrice) + servicesTotal;

  // Вычисляем количество месяцев
  const months = calculateMonths(order?.start_date, order?.end_date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {order ? (
          <>
            {/* EXISTING CONTENT OF THE MODAL – keep everything as is */}
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-[#273655]">
                      Информация о заказе
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-1">
                      Заказ со статусом {translateOrderStatus(order?.status)}
                    </DialogDescription>
                  </div>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              {/* Основная информация о заказе */}
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold text-[#273655] flex items-center gap-2">
                    <Package className="w-4 h-4" />
                    Детали заказа
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">ID заказа:</span>
                      <Badge variant="outline" className="ml-2 text-sm">#{order?.id}</Badge>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Статус:</span>
                      <Badge className="ml-2 bg-yellow-100 text-yellow-800 border-yellow-200">
                        {translateOrderStatus(order?.status)}
                      </Badge>
                    </div>
                    {order?.storage && (
                      <div>
                        <span className="text-sm text-gray-600">Бокс:</span>
                        <span className="ml-2 text-sm font-medium">{order?.storage.name || 'Не указано'}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm text-gray-600">Срок аренды:</span>
                      <span className="ml-2 text-sm font-medium">
                        {months > 0 ? `${months} ${getMonthWord(months)}` : 'Не указано'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Объем:</span>
                      <span className="ml-2 text-sm font-medium">
                        {order?.total_volume
                          ? `${(typeof order?.total_volume === 'string' 
                              ? parseFloat(order?.total_volume) 
                              : order?.total_volume).toFixed(2)} м³`
                          : '0 м³'}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Дата создания:</span>
                      <span className="ml-2 text-sm font-medium">{formatDate(order?.created_at)}</span>
                    </div>
                    {order?.start_date && order?.end_date && (
                      <>
                        <div>
                          <span className="text-sm text-gray-600">Дата начала:</span>
                          <span className="ml-2 text-sm font-medium">{formatDate(order?.start_date)}</span>
                        </div>
                        <div>
                          <span className="text-sm text-gray-600">Дата окончания:</span>
                          <span className="ml-2 text-sm font-medium">{formatDate(order?.end_date)}</span>
                        </div>
                      </>
                    )}
                    {order?.contract_status && (
                      <div>
                        <span className="text-sm text-gray-600">Статус договора:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {translateContractStatus(order?.contract_status)}
                        </Badge>
                      </div>
                    )}
                    {order?.payment_status && (
                      <div>
                        <span className="text-sm text-gray-600">Статус оплаты:</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {translatePaymentStatus(order?.payment_status)}
                        </Badge>
                      </div>
                    )}
                    {order?.cancel_status && (
                      <div>
                        <span className="text-sm text-gray-600">Статус расторжения:</span>
                        <Badge
                          variant="outline"
                          className={`ml-2 text-xs ${
                            order?.cancel_status === 'PENDING' 
                              ? 'bg-yellow-100 text-yellow-800 border-yellow-200' 
                              : order?.cancel_status === 'APPROVED'
                              ? 'bg-green-100 text-green-800 border-green-200'
                              : ''
                          }`}
                        >
                          {translateCancelStatus(order?.cancel_status)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              {/* Информация о клиенте */}
              {order?.user && (
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-[#273655] flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Информация о клиенте
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">{order?.user.name || 'Не указано'}</span>
                    </div>
                    {order?.user.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{order?.user.email}</span>
                      </div>
                    )}
                    {order?.user.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{order?.user.phone}</span>
                      </div>
                    )}
                    {order?.user.public_id && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-500">ID:</span>
                        <Badge variant="outline" className="text-xs">{order?.user.public_id}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              {/* Предметы заказа */}
              {order?.items && Array.isArray(order?.items) && order?.items.length > 0 && (
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-[#273655]">
                      Предметы заказа ({order?.items.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order?.items.map((item, index) => {
                        const volume = typeof item?.volume === 'string'
                          ? parseFloat(item.volume)
                          : (item?.volume || 0);
                        const volumeValue = isNaN(volume) ? 0 : volume;
                        return (
                          <div key={item?.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <span className="text-sm font-medium">{item?.name || `Предмет ${index + 1}`}</span>
                              {volumeValue > 0 && (
                                <span className="text-xs text-gray-500 ml-2">({volumeValue.toFixed(2)} м³)</span>
                              )}
                            </div>
                            {item?.cargo_mark && (
                              <Badge variant="outline" className="text-xs">
                                {translateCargoMark(item.cargo_mark)}
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Услуги */}
              {order?.services && Array.isArray(order?.services) && order?.services?.length > 0 && (
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-[#273655] flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Услуги ({order?.services.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order?.services.map((service, index) => {
                        const count = service?.OrderService?.count || 1;
                        const price = typeof service?.price === 'string'
                          ? parseFloat(service.price)
                          : (service?.price || 0);
                        const priceValue = isNaN(price) ? 0 : price;
                        const total = priceValue * count;
                        return (
                          <div key={service?.id || index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <span className="text-sm font-medium">
                                {getServiceTypeName(service?.type) || service?.description || `Услуга ${index + 1}`}
                              </span>
                              <span className="text-xs text-gray-500 ml-2">x{count}</span>
                            </div>
                            <div className="text-sm font-medium">
                              {formatPrice(total)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Перевозки */}
              {order?.moving_orders && Array.isArray(order?.moving_orders) && order?.moving_orders.length > 0 && (
                <Card className="border-gray-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold text-[#273655] flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Перевозки ({order?.moving_orders.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order?.moving_orders.map((moving, index) => (
                        <div key={moving?.id || index} className="p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {translateMovingStatus(moving?.status)}
                            </Badge>
                            <span className="text-xs text-gray-500">{formatDate(moving?.moving_date)}</span>
                          </div>
                          {moving?.address && (
                            <div className="flex items-start gap-2 mt-1">
                              <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                              <span className="text-xs text-gray-600">{moving.address}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
              {/* Стоимость */}
              <Card className="border-[#273655]/20 bg-[#273655]/5">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Стоимость аренды:</span>
                      <span className="text-sm font-medium">{formatPrice(order?.total_price)}</span>
                    </div>
                    {servicesTotal > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Услуги:</span>
                        <span className="text-sm font-medium">{formatPrice(servicesTotal)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <span className="text-base font-semibold text-[#273655]">Итого:</span>
                      <span className="text-lg font-bold text-[#273655]">{formatPrice(totalPrice)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <DialogFooter className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isUnbooking || cancelOrderMutation.isPending}
                className="flex-1"
              >
                Закрыть
              </Button>
              {canCancelContract && (
                <Button
                  variant="destructive"
                  onClick={handleCancelOrderClick}
                  disabled={isUnbooking || cancelOrderMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <div className="flex items-center gap-2">
                    <FileX className="w-4 h-4" />
                    Расторгнуть контракт
                  </div>
                </Button>
              )}
              {canUnbook && (
                <Button
                  variant="destructive"
                  onClick={handleUnbookClick}
                  disabled={isUnbooking || cancelOrderMutation.isPending}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  <div className="flex items-center gap-2">
                    <Trash2 className="w-4 h-4" />
                    Разбронировать бокс
                  </div>
                </Button>
              )}
            </DialogFooter>
          </>
        ) : (
          <div className="space-y-6">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold text-[#273655]">
                    Бокс недоступен
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 mt-1">
                    Заказ для данного бокса не найден или был удалён. Возможно, он уже используется или находится в другом состоянии.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800">
                Вы можете принудительно разбронировать этот бокс. Используйте это действие,
                только если уверены, что бокс фактически свободен.
              </p>
            </div>
            <DialogFooter className="flex gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Закрыть
              </Button>
              <Button
                variant="destructive"
                onClick={handleForceUnbook}
                className="flex-1 bg-red-600 hover:bg-red-700"
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Принудительно разбронировать
                </div>
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>

      {/* Модальное окно подтверждения разбронирования */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={handleCancelConfirm}>
        <DialogContent className="max-w-md w-full rounded-2xl z-[1400]">
          <DialogHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900 text-center">
              Разбронирование бокса
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600">
              Вы уверены, что хотите разбронировать этот бокс?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900 mb-1">
                    Внимание!
                  </p>
                  <p className="text-sm text-red-700">
                    Заказ будет удален безвозвратно. Бокс станет доступным для бронирования другим клиентам.
                  </p>
                </div>
              </div>
            </div>
            {order && order?.storage && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Заказ:</span>
                  <Badge variant="outline" className="text-sm">#{order?.id}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Бокс:</span>
                  <span className="text-sm font-medium">{order?.storage.name || 'Не указано'}</span>
                </div>
                {order?.user && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Клиент:</span>
                    <span className="text-sm font-medium">{order?.user.name || 'Не указано'}</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <DialogFooter className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleCancelConfirm}
              disabled={isUnbooking}
              className="flex-1"
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmUnbook}
              disabled={isUnbooking}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isUnbooking ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Разбронирование...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Trash2 className="w-4 h-4" />
                  Разбронировать
                </div>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Модальное окно опроса о причине расторжения */}
      <Dialog open={isCancelSurveyOpen} onOpenChange={(open) => !open && handleCloseCancelSurvey()}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-[#273655]">Почему решили расторгнуть контракт?</DialogTitle>
            <DialogDescription>
              Ваш ответ поможет улучшить сервис и условия хранения. Пожалуйста, выберите подходящую причину.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
            {CANCEL_REASON_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 cursor-pointer transition ${
                  selectedCancelReason === option.value
                    ? 'border-[#1e2c4f] bg-[#f5f7ff]'
                    : 'border-gray-200 hover:border-[#c7d2fe]'
                }`}
              >
                <input
                  type="radio"
                  name="cancel-reason"
                  className="mt-1 h-4 w-4"
                  checked={selectedCancelReason === option.value}
                  onChange={() => setSelectedCancelReason(option.value)}
                />
                <span className="text-sm text-gray-800">{option.label}</span>
              </label>
            ))}
          </div>
          {selectedCancelReason === 'other' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Расскажите подробнее</p>
              <textarea
                className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm focus:border-[#1e2c4f] focus:outline-none"
                rows={4}
                placeholder="Например: хочу поделиться предложениями по улучшению..."
                value={cancelReasonComment}
                onChange={(e) => setCancelReasonComment(e.target.value)}
              />
            </div>
          )}
          {cancelFormError && <p className="text-sm text-red-600">{cancelFormError}</p>}
          <DialogFooter className="gap-2 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={handleCloseCancelSurvey} 
              disabled={cancelOrderMutation.isPending}
              className="w-full sm:w-auto"
            >
              Отмена
            </Button>
            <Button
              onClick={handleSubmitCancelOrder}
              disabled={cancelOrderMutation.isPending}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
              {cancelOrderMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                  Отправка…
                </div>
              ) : (
                'Подтвердить расторжение'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default PendingOrderModal;
