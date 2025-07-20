import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { getOrderStatusText, getCargoMarkText } from '../../../shared/lib/types/orders';
import { useGetPrices } from '../../../shared/lib/hooks/use-payments';
import { useUpdateOrderWithServices } from '../../../shared/lib/hooks/use-orders';

const OrderConfirmModal = ({ isOpen, onClose, onConfirm, action, order }) => {
  if (!order) return null;

  // Состояния для управления услугами
  const [isSelectedMoving, setIsSelectedMoving] = useState(false);
  const [isSelectedPackage, setIsSelectedPackage] = useState(false);
  const [selectedServices, setSelectedServices] = useState([]);
  const [movingOrders, setMovingOrders] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Новые состояния для Пункт 3.3
  const [isPunct33Selected, setIsPunct33Selected] = useState(false);
  const [punct33Text, setPunct33Text] = useState('');

  // Загрузка доступных услуг
  const { data: pricesData = [], isLoading: isPricesLoading } = useGetPrices();
  const updateOrderMutation = useUpdateOrderWithServices();

  // Фильтруем услуги начиная с id >= 5
  const availableServices = pricesData.filter(service => service.id >= 5);

  // Инициализация состояния при открытии модала
  useEffect(() => {
    if (isOpen && order) {
      setIsSelectedMoving(order.is_selected_moving || false);
      setIsSelectedPackage(order.is_selected_package || false);
      setSelectedServices([]);
      setMovingOrders([]);
      // Инициализация новых полей
      setIsPunct33Selected(!!order.punct33);
      setPunct33Text(order.punct33 || '');
    }
  }, [isOpen, order]);

  // Функции для управления услугами
  const addService = () => {
    setSelectedServices([...selectedServices, { service_id: '', count: 1 }]);
  };

  const removeService = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const updateService = (index, field, value) => {
    const updated = selectedServices.map((service, i) => 
      i === index ? { ...service, [field]: value } : service
    );
    setSelectedServices(updated);
  };

  // Функции для управления moving orders
  const addMovingOrder = () => {
    setMovingOrders([...movingOrders, { 
      moving_date: '', 
      status: 'PENDING_FROM',
      address: '' // Добавляем поле address
    }]);
  };

  const removeMovingOrder = (index) => {
    setMovingOrders(movingOrders.filter((_, i) => i !== index));
  };

  const updateMovingOrder = (index, field, value) => {
    const updated = movingOrders.map((order, i) => 
      i === index ? { ...order, [field]: value } : order
    );
    setMovingOrders(updated);
  };

  // Обработчики для Пункт 3.3
  const handlePunct33Change = (checked) => {
    setIsPunct33Selected(checked);
    if (!checked) {
      setPunct33Text(''); // Обнуляем текст когда чекбокс отключен
    }
  };

  // Обработчик финального подтверждения
  const handleConfirmOrder = async () => {
    // Для расширенного подтверждения заказов INACTIVE -> APPROVED
    if (action === 'approve' && order.status === 'INACTIVE') {
      setIsSubmitting(true);
      try {
        const orderData = {
          status: 'APPROVED',
          is_selected_moving: isSelectedMoving,
          is_selected_package: isSelectedPackage,
          punct33: isPunct33Selected ? (punct33Text || null) : null // Новое поле
        };

        // Добавляем moving_orders если есть
        if (movingOrders.length > 0) {
          orderData.moving_orders = movingOrders.filter(mo => mo.moving_date).map(mo => ({
            moving_date: new Date(mo.moving_date).toISOString(),
            status: mo.status,
            address: mo.address || null // Добавляем address
          }));
        }

        // Добавляем services если есть
        if (selectedServices.length > 0) {
          orderData.services = selectedServices.filter(s => s.service_id && s.count > 0);
        }

        await updateOrderMutation.mutateAsync({ orderId: order.id, orderData });
        onClose(); // Закрываем модал после успешного выполнения
      } catch (error) {
        console.error('Ошибка при подтверждении заказа:', error);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // Для всех остальных действий (удаление, другие подтверждения) используем старую логику
      onConfirm();
    }
  };

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

  // Функция для получения иконки услуги по типу
  const getServiceIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return '💰'; // Залог
      case 'LOADER':
        return '💪'; // Грузчик
      case 'PACKER':
        return '📦'; // Упаковщик
      case 'FURNITURE_SPECIALIST':
        return '🪑'; // Мебельщик
      case 'GAZELLE':
        return '🚚'; // Газель
      case 'STRETCH_FILM':
        return '📜'; // Стрейч-пленка
      case 'BOX_SIZE':
        return '📦'; // Коробка
      case 'MARKER':
        return '🖊️'; // Маркер
      case 'UTILITY_KNIFE':
        return '🔪'; // Канцелярский нож
      case 'BUBBLE_WRAP_1':
      case 'BUBBLE_WRAP_2':
        return '🛡️'; // Воздушно-пузырчатая пленка
      default:
        return '⚙️'; // Общая услуга
    }
  };

  // Функция для получения русского названия типа услуги
  const getServiceTypeName = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Залог';
      case 'LOADER':
        return 'Грузчик';
      case 'PACKER':
        return 'Упаковщик';
      case 'FURNITURE_SPECIALIST':
        return 'Мебельщик';
      case 'GAZELLE':
        return 'Газель';
      case 'STRETCH_FILM':
        return 'Стрейч-пленка';
      case 'BOX_SIZE':
        return 'Коробка';
      case 'MARKER':
        return 'Маркер';
      case 'UTILITY_KNIFE':
        return 'Канцелярский нож';
      case 'BUBBLE_WRAP_1':
        return 'Воздушно-пузырчатая пленка 10м';
      case 'BUBBLE_WRAP_2':
        return 'Воздушно-пузырчатая пленка 120м';
      default:
        return 'Услуга';
    }
  };

  const getActionConfig = () => {
    if (action === 'approve') {
      return {
        title: 'Подтвердить заказ',
        message: 'Вы уверены, что хотите подтвердить этот заказ?',
        description: 'После подтверждения пользователь сможет произвести оплату заказа.',
        confirmText: 'Подтвердить',
        confirmVariant: 'default',
        confirmClass: 'bg-green-600 hover:bg-green-700',
        icon: (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        bgColor: 'from-green-50 to-emerald-50',
        borderColor: 'border-green-200'
      };
    } else if (action === 'delete') {
      return {
        title: 'Удалить заказ',
        message: 'Вы уверены, что хотите удалить этот заказ?',
        description: 'Это действие нельзя отменить. Заказ будет удален навсегда.',
        confirmText: 'Удалить',
        confirmVariant: 'destructive',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        icon: (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        bgColor: 'from-red-50 to-rose-50',
        borderColor: 'border-red-200'
      };
    }
    return {};
  };

  const config = getActionConfig();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-base">
            {config.message}
            <br />
            <span className="text-sm text-muted-foreground mt-1 block">
              {config.description}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Общая информация о заказе */}
          <Card className={`bg-gradient-to-r ${config.bgColor} ${config.borderColor}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Заказ #{order.id}
                <Badge variant="outline" className="ml-auto">
                  {getOrderStatusText(order.status)}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Информация о клиенте */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Информация о клиенте
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Имя:
                  </span>
                  <span className="font-medium">{order.user?.name || 'Не указано'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Email:
                  </span>
                  <span className="text-sm">{order.user?.email || 'Не указан'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Телефон:
                  </span>
                  <span className="text-sm">{order.user?.phone || 'Не указан'}</span>
                </div>
              </CardContent>
            </Card>

            {/* Детали заказа */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Детали заказа
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Хранилище:</span>
                  <span className="font-medium">{order.storage?.name || 'Не указано'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Объем:</span>
                  <Badge variant="outline">{order.total_volume} м³</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Создан:</span>
                  <span className="text-sm">{formatDate(order.created_at)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Финансовая информация */}
          <Card className="bg-gradient-to-r from-[#1e2c4f]/5 to-blue-50 border-[#1e2c4f]/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-[#1e2c4f]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Финансовая информация
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Стоимость аренды</div>
                  <div className="text-lg font-semibold text-[#1e2c4f]">{formatPrice(order.total_price)}</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg border">
                  <div className="text-sm text-muted-foreground mb-1">Депозит</div>
                  <div className="text-lg font-semibold">15 000 ₸</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-[#1e2c4f] to-blue-600 text-white rounded-lg">
                  <div className="text-sm mb-1 opacity-90">Общая сумма</div>
                  <div className="text-xl font-bold">
                    {formatPrice((parseFloat(order.total_price) || 0) + 15000)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статусы */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Статусы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Badge 
                  variant={order.status === 'APPROVED' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Статус: {getOrderStatusText(order.status)}
                </Badge>
                <Badge 
                  variant={order.payment_status === 'PAID' ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  Оплата: {order.payment_status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
                </Badge>
                <Badge 
                  variant={order.contract_status === 'SIGNED' ? 'default' : 'secondary'}
                  className="flex items-center gap-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Договор: {order.contract_status === 'SIGNED' ? 'Подписан' : 'Не подписан'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Управление дополнительными услугами */}
          {action === 'approve' && order.status === 'INACTIVE' && (
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Управление дополнительными услугами
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Switch для Moving и Package */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Moving Switch */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium text-gray-900">Услуга перевозки (Moving)</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelectedMoving}
                          onChange={(e) => setIsSelectedMoving(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      Профессиональная перевозка вещей на склад и обратно
                    </p>
                  </div>

                  {/* Package Switch */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-medium text-gray-900">Услуга упаковки (Package)</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isSelectedPackage}
                          onChange={(e) => setIsSelectedPackage(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    <p className="text-xs text-gray-600">
                      Профессиональная упаковка вещей в специальные материалы
                    </p>
                  </div>
                </div>

                {/* Новый чекбокс Пункт 3.3 */}
                <Card className="bg-indigo-50 border-indigo-200">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="font-medium text-indigo-700">Пункт 3.3</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPunct33Selected}
                          onChange={(e) => handlePunct33Change(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                      </label>
                    </div>
                  </CardHeader>
                  
                  {/* Условное текстовое поле */}
                  {isPunct33Selected && (
                    <CardContent className="pt-0">
                      <div className="mt-2">
                        <input
                          type="text"
                          value={punct33Text}
                          onChange={(e) => setPunct33Text(e.target.value)}
                          placeholder="👉 Введите текст..."
                          className="w-full px-3 py-2 border border-indigo-300 rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-gray-900 placeholder-gray-500"
                        />
                      </div>
                    </CardContent>
                  )}
                </Card>

                {/* Блок управления услугами (показывается только если Moving включён) */}
                {isSelectedMoving && (
                  <Card className="bg-blue-50 border-blue-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-blue-700">
                          Дополнительные услуги
                        </CardTitle>
                        <Button 
                          onClick={addService}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={isPricesLoading}
                        >
                          Добавить услугу
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {selectedServices.length > 0 ? (
                        <div className="space-y-3">
                          {selectedServices.map((service, index) => (
                            <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                              <select
                                value={service.service_id}
                                onChange={(e) => updateService(index, 'service_id', parseInt(e.target.value))}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                              >
                                <option value="">Выберите услугу</option>
                                {availableServices.map((availableService) => (
                                  <option key={availableService.id} value={availableService.id}>
                                    {availableService.description || availableService.type} - {formatPrice(availableService.price)}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="number"
                                min="1"
                                value={service.count}
                                onChange={(e) => updateService(index, 'count', parseInt(e.target.value))}
                                className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                                placeholder="Кол-во"
                              />
                              <Button
                                onClick={() => removeService(index)}
                                size="sm"
                                variant="destructive"
                              >
                                Удалить
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Дополнительные услуги не выбраны</p>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Блок управления Moving Orders (показывается только если Moving включён) */}
                {isSelectedMoving && (
                  <Card className="bg-green-50 border-green-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base text-green-700">
                          Даты перемещения
                        </CardTitle>
                        <Button 
                          onClick={addMovingOrder}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Добавить дату
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {movingOrders.length > 0 ? (
                        <div className="space-y-3">
                          {movingOrders.map((movingOrder, index) => (
                            <div key={index} className="p-3 bg-white rounded-lg border space-y-3">
                              {/* Поля даты и статуса */}
                              <div className="flex items-center gap-3">
                              <input
                                type="datetime-local"
                                value={movingOrder.moving_date}
                                onChange={(e) => updateMovingOrder(index, 'moving_date', e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                              />
                              <select
                                value={movingOrder.status}
                                onChange={(e) => updateMovingOrder(index, 'status', e.target.value)}
                                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                              >
                                <option value="PENDING_FROM">Ожидает забора</option>
                                <option value="PENDING_TO">Ожидает доставки</option>
                              </select>
                              <Button
                                onClick={() => removeMovingOrder(index)}
                                size="sm"
                                variant="destructive"
                              >
                                Удалить
                              </Button>
                              </div>
                              
                              {/* Новое поле address */}
                              <div className="flex items-center gap-2">
                                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <input
                                  type="text"
                                  value={movingOrder.address || ''}
                                  onChange={(e) => updateMovingOrder(index, 'address', e.target.value)}
                                  placeholder="Введите адрес..."
                                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">Даты перемещения не заданы</p>
                      )}
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          )}

          {/* Статичное отображение для не-подтверждающих действий */}
          {!(action === 'approve' && order.status === 'INACTIVE') && (
            <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-orange-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                  </svg>
                  Дополнительные услуги
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Услуга перевозки - статично */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="font-medium text-gray-900">Услуга перевозки (Moving)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.is_selected_moving ? (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
                          Выбрано клиентом
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                          Не выбрано
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Услуга упаковки - статично */}
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span className="font-medium text-gray-900">Услуга упаковки (Package)</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {order.is_selected_package ? (
                        <Badge className="text-xs bg-green-100 text-green-700 border-green-300">
                          Выбрано клиентом
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                          Не выбрано
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Заказанные услуги из массива services */}
          {order.services && order.services.length > 0 && (
            <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base text-amber-700">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  Заказанные услуги
                  <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-800">
                    {order.services.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.services.map((service, index) => (
                    <div key={service.id || index} className="p-4 bg-white rounded-lg border border-amber-200 hover:border-amber-300 transition-colors">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#1e2c4f] rounded-full flex items-center justify-center">
                          <span className="text-lg">{getServiceIcon(service.type)}</span>
                        </div>
                                               <div className="flex-1">
                         <div className="flex items-center gap-2 mb-1">
                           <h5 className="font-semibold text-gray-900">
                             {service.description || getServiceTypeName(service.type)}
                           </h5>
                           {service.OrderService && service.OrderService.count > 1 && (
                             <Badge className="text-xs px-2 py-1 bg-[#1e2c4f] text-white">
                               ×{service.OrderService.count}
                             </Badge>
                           )}
                         </div>
                       </div>
                      </div>
                      
                      {/* Информация о ценах */}
                      {service.price && (
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">
                              {service.OrderService && service.OrderService.count > 1 ? 'Цена за единицу:' : 'Цена:'}
                            </span>
                            <span className="font-medium text-[#1e2c4f]">
                              {formatPrice(service.price)}
                            </span>
                          </div>
                          
                          {/* Общая стоимость для количества > 1 */}
                          {service.OrderService && service.OrderService.count > 1 && (
                            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                              <span className="font-medium text-gray-700">Общая стоимость:</span>
                              <span className="font-bold text-[#1e2c4f]">
                                {formatPrice(parseFloat(service.price) * service.OrderService.count)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Общая сводка по услугам */}
                <div className="mt-6 p-4 bg-white rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <span className="font-medium text-gray-900">
                        Итого услуг: {order.services.length}
                      </span>
                    </div>
                    {order.services.some(s => s.price) && (
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Общая стоимость услуг:</div>
                        <div className="text-lg font-bold text-[#1e2c4f]">
                          {formatPrice(
                            order.services.reduce((total, service) => {
                              if (service.price && service.OrderService) {
                                return total + (parseFloat(service.price) * service.OrderService.count);
                              }
                              return total;
                            }, 0)
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Предметы в заказе */}
          {order.items && order.items.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  Предметы в заказе
                  <Badge variant="secondary" className="ml-auto">
                    {order.items.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items.slice(0, 6).map((item) => (
                    <div key={item.id} className="p-3 bg-gray-50 rounded-lg border">
                      <div className="font-medium text-sm text-gray-900 mb-1">{item.name}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1">
                          {item.volume} м³
                        </Badge>
                        <span>{getCargoMarkText(item.cargo_mark)}</span>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 6 && (
                    <div className="p-3 bg-gray-100 rounded-lg border-dashed border-gray-300 text-center">
                      <div className="text-sm text-gray-600">
                        и ещё {order.items.length - 6} предметов...
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2"
            disabled={isSubmitting}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Отмена
          </Button>
          <Button
            onClick={handleConfirmOrder}
            className={`${config.confirmClass} text-white flex items-center gap-2`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              config.icon
            )}
            {isSubmitting 
              ? (action === 'approve' && order.status === 'INACTIVE' ? 'Подтверждение...' : 'Обработка...')
              : config.confirmText
            }
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default OrderConfirmModal; 