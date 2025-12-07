import React, { useState } from 'react';
import { 
  getOrderStatusText, 
  getOrderStatusClass,
  getPaymentStatusText,
  getContractStatusText,
  getCargoMarkText 
} from '../../../shared/lib/types/orders';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '../../../components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/select';
import { Button } from '../../../components/ui/button';
import { useExtendOrder } from '../../../shared/lib/hooks/use-orders';
import { EditOrderModal } from '@/pages/personal-account/ui/EditOrderModal.jsx';
import { Pencil } from 'lucide-react';
import { showExtendOrderSuccess, showCancelExtensionSuccess, showExtendOrderError } from '../../../shared/lib/utils/notifications';
import OrderDeleteModal from './OrderDeleteModal';
import {useNavigate} from "react-router-dom";
import OrderCancelTimer from '../../../shared/components/OrderCancelTimer';

const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') {
    return 'Индивидуальное';
  } else if (type === 'CLOUD') {
    return 'Облачное'
  }
  return type;
};

const UserOrderCard = ({ order, onPayOrder }) => {
  const navigate = useNavigate();
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false);
  const [isCancelExtendDialogOpen, setIsCancelExtendDialogOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState("1");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Хук для работы с API продления заказа
  const extendOrderMutation = useExtendOrder();

  // Обработчик продления заказа
  const handleExtendOrder = async () => {
    try {
      await extendOrderMutation.mutateAsync({
        is_extended: true,
        order_id: order.id,
        months: parseInt(selectedMonths)
      });
      showExtendOrderSuccess();
      setIsExtendDialogOpen(false);
      // Обновляем страницу после успешного выполнения запроса
      window.location.reload();
    } catch (error) {
      showExtendOrderError();
      console.error('Ошибка при продлении заказа:', error);
    }
  };

  // Обработчик отмены продления заказа
  const handleCancelExtension = async () => {
    try {
      await extendOrderMutation.mutateAsync({
        is_extended: false,
        order_id: order.id
      });
      showCancelExtensionSuccess();
      setIsCancelExtendDialogOpen(false);
      // Обновляем страницу после успешного выполнения запроса
      window.location.reload();
    } catch (error) {
      showExtendOrderError();
      console.error('Ошибка при отмене продления заказа:', error);
    }
  };
// --- Moving statuses helpers (JS) ---
  const MOVING_STATUS_TEXT = {
    PENDING_FROM:  'Ожидает забора',
    PENDING_TO:    'Ожидает доставки',
    IN_PROGRESS:   'В процессе (к складу)',
    IN_PROGRESS_TO:'В процессе (к клиенту)',
    DELIVERED:     'Доставлено на склад',
    DELIVERED_TO:  'Доставлено клиенту',
    CANCELLED:     'Отменено',
  };

  function getMovingStatusText(s) {
    return MOVING_STATUS_TEXT[s] || s;
  }

  function getMovingStatusBadgeClass(s) {
    if (s === 'CANCELLED') return 'bg-red-100 text-red-700 border border-red-200';
    if (s === 'DELIVERED' || s === 'DELIVERED_TO') return 'bg-green-100 text-green-700 border border-green-200';
    if (s === 'IN_PROGRESS' || s === 'IN_PROGRESS_TO') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (s === 'PENDING_FROM' || s === 'PENDING_TO') return 'bg-amber-100 text-amber-800 border border-amber-200';
    return 'bg-gray-100 text-gray-700 border border-gray-200';
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указана';
    try {
      return new Date(dateString).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Некорректная дата';
    }
  };

  const formatPrice = (price) => {
    if (!price) return '0';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return numPrice.toLocaleString('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const totalPriceOfServices = order.services.reduce((total, service) => {
    if (service.OrderService) {
      return total + (parseFloat(service.OrderService.total_price));
    }
    return total;
  }, 0)

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
      // Старые типы для совместимости
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
      case 'GAZELLE_FROM':
        return 'Газель - забор вещей';
      case 'GAZELLE_TO':
        return 'Газель - возврат вещей';
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
      case 'RACK_RENTAL':
      default:
        return 'Услуга';
    }
  };

  const canPay = order.status === 'PROCESSING' && order.payment_status === 'UNPAID' && order.contract_status === 'SIGNED';

  // Проверяем наличие дополнительных услуг (включая новый массив services)
  const hasAdditionalServices = order.is_selected_moving || order.is_selected_package || (order.services && order.services.length > 0);

  // Определяем стили карточки в зависимости от наличия дополнительных услуг и pending статуса
  const isPendingExtension = order.extension_status === 'PENDING';
  const cardClasses = hasAdditionalServices
    ? `bg-white border-2 ${isPendingExtension ? 'border-red-500' : 'border-[#273655]'} rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative`
    : `bg-white border ${isPendingExtension ? 'border-2 border-red-500' : 'border-gray-200'} rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow`;

  return (
    <div className={cardClasses}>
      {/* Индикатор дополнительных услуг */}
      {hasAdditionalServices && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-[#273655] to-[#1e2c4f] text-white px-3 py-1 rounded-bl-lg">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-xs font-medium">Услуги+</span>
          </div>
        </div>
      )}

      {/* Индикатор pending статуса */}
      {isPendingExtension && (
        <div className="absolute top-0 left-0 bg-red-500 text-white px-3 py-1 rounded-br-lg">
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-medium">Ожидает</span>
          </div>
        </div>
      )}

      {/* Заголовок карточки */}
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Заказ №{order.id}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Создан: {formatDate(order.created_at)}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {/* Статус заказа */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getOrderStatusClass(order.status)}`}>
              {getOrderStatusText(order.status)}
            </span>
            
            {/* Статус оплаты */}
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
              order.payment_status === 'PAID' 
                ? 'bg-green-100 text-green-700 border-green-200' 
                : 'bg-red-100 text-red-700 border-red-200'
            }`}>
              {getPaymentStatusText(order.payment_status)}
            </span>
            
            {/* Статус продления */}
            {isPendingExtension && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-red-100 text-red-700 border-red-200">
                Ожидает продления
              </span>
            )}
          </div>
        </div>

        {/* Отображение дополнительных услуг */}
        {hasAdditionalServices && (
          <div className="mt-4 flex flex-wrap gap-2">
            {order.is_selected_moving && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span className="text-xs font-medium text-blue-700">Услуга перевозки</span>
              </div>
            )}
            {order.is_selected_package && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 border border-purple-200 rounded-full">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="text-xs font-medium text-purple-700">Услуга упаковки</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Основная информация */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Информация о хранилище */}
        {order?.storage && order?.storage?.storage_type !== 'CLOUD' && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Хранилище</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Бокс:</span> {order.storage.name}</p>
              <p><span className="font-medium">Тип:</span> {getStorageTypeText(order.storage.storage_type)}</p>
              <p><span className="font-medium">Объем:</span> {order.storage.total_volume} м³</p>
              {order.storage.description && (
                <p><span className="font-medium">Описание:</span> {order.storage.description}</p>
              )}
            </div>
          </div>
        )}
        {order?.storage && order?.storage?.storage_type === 'CLOUD' && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">Хранилище</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Тип:</span> {getStorageTypeText(order.storage.storage_type)}</p>
                {order.storage.description && (
                    <p><span className="font-medium">Описание:</span> {order.storage.description}</p>
                )}
              </div>
            </div>
        )}

        {/* Информация о заказе */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Общий объем</p>
            <p className="font-medium text-gray-900">{order.total_volume} м³</p>
          </div>
          <div>
            <p className="text-gray-500">Сумма к оплате</p>
            <p className="font-medium text-gray-900">{formatPrice(order.total_price)} ₸</p>
          </div>
          <div>
            <p className="text-gray-500">Дата начала</p>
            <p className="font-medium text-gray-900">{formatDate(order.start_date)}</p>
          </div>
          <div>
            <p className="text-gray-500">Депозит</p>
            <p className="font-medium text-gray-900">{'15 000'} ₸</p>
          </div>
          <div>
            <p className="text-gray-500">Дата окончания</p>
            <p className="font-medium text-gray-900">{formatDate(order.end_date)}</p>
          </div>
        </div>

        {/* Статус договора */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Договор:</span>
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
            order.contract_status === 'SIGNED' 
              ? 'bg-green-100 text-green-700' 
              : 'bg-orange-100 text-orange-700'
          }`}>
            {getContractStatusText(order.contract_status)}
          </span>
        </div>

        {/* Список предметов */}
        {order.items && order.items.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Предметы в хранилище</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={item.id || index} className="bg-gray-50 rounded p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        {item.volume} м³ • {getCargoMarkText(item.cargo_mark)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Moving Orders - отображение с адресами */}
        {order.moving_orders && order.moving_orders.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Даты перемещения
            </h4>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="space-y-3">
                {order.moving_orders.map((movingOrder, index) => (
                  <div key={movingOrder.id || index} className="bg-white rounded-lg p-3 border border-green-100">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-700">Перемещение #{index + 1}</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getMovingStatusBadgeClass(movingOrder.status)}`}>
  {getMovingStatusText(movingOrder.status)}
</span>
                      </div>
                      
                      <div className="text-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 0h8m-8 0V5a1 1 0 00-1 1v11a1 1 0 001 1h2m6-12V5a1 1 0 011 1v11a1 1 0 01-1 1h-2m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                          <span className="font-medium">Дата:</span>
                          <span className="text-gray-700">{formatDate(movingOrder.moving_date)}</span>
                        </div>
                        
                        {/* Отображение адреса если есть */}
                        {movingOrder.address && (
                          <div className="flex items-start gap-2">
                            <svg className="w-4 h-4 text-green-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="flex-1">
                              <span className="font-medium">Адрес:</span>
                              <div className="text-gray-700 bg-green-50 rounded px-2 py-1 mt-1 border border-green-200">
                                {movingOrder.address}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Дополнительные услуги из массива services */}
        {order.services && order.services.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#273655]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Заказанные услуги
            </h4>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
              <div className="grid gap-3">
                {order.services.map((service, index) => (
                  <div key={service.id || index} className="flex items-center justify-between bg-white rounded-lg p-3 border border-amber-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#273655] rounded-full flex items-center justify-center">
                        <span className="text-lg">{getServiceIcon(service.type)}</span>
                      </div>
                                             <div>
                         <div className="flex items-center gap-2">
                           <h5 className="font-semibold text-gray-900">
                             {service.description || getServiceTypeName(service.type)}
                           </h5>
                           {service.OrderService && service.OrderService.count > 1 && (
                             <span className="px-2 py-1 bg-[#273655] text-white text-xs font-bold rounded-full">
                               ×{service.OrderService.count}
                             </span>
                           )}
                         </div>
                         {service.price && (
                           <p className="text-sm font-medium text-[#273655]">
                             {formatPrice(service.price)} ₸ {service.OrderService && service.OrderService.count > 1 ? `за единицу` : ''}
                           </p>
                         )}
                       </div>
                    </div>
                    
                    {/* Общая стоимость услуги */}
                    {service.price && service.OrderService && (
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Итого:</p>
                        <p className="font-bold text-[#273655]">
                          {formatPrice(parseFloat(service.OrderService.total_price))} ₸
                          {service.type === 'GAZELLE' ? <p className="text-xs text-gray-500">Примерная стоимость</p> : ''}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Сводка по услугам */}
              <div className="mt-4 pt-3 border-t border-amber-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Услуг выбрано: <span className="font-medium">{order.services.length}</span>
                  </span>
                  {order.services.some(s => s.price) && (
                    <span className="text-sm text-gray-600">
                      Общая стоимость услуг: <span className="font-bold text-[#273655]">
                        {formatPrice(totalPriceOfServices)} ₸
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Футер карточки с кнопками */}
      <div className={`p-4 sm:px-6 sm:py-4 border-t border-gray-100 ${hasAdditionalServices ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gray-50'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(Number(order.total_price) + 15000 + Number(totalPriceOfServices))} ₸
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {order.status === 'INACTIVE' ? (
              // Кнопки для неактивных заказов
              <>
                <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  Редактировать
                </button>
                <button
                  onClick={() => setIsDeleteModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Удалить
                </button>
              </>
            ) : canPay ? (
              <button
                onClick={() => onPayOrder(order)}
                className="w-full sm:w-auto px-4 py-2 bg-[#273655] text-white text-sm font-medium rounded-lg hover:bg-[#1e2a4a] transition-colors"
              >
                Оплатить
              </button>
            ) : order.payment_status === 'PAID' ? (
              <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                Оплачено
              </span>
            ) : (
              <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                Недоступно для оплаты
              </span>
            )}
          </div>
        </div>
        {order.status === 'APPROVED' && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Оплата будет доступна после подписания договора.
              </p>
            </div>
        )}
        {order.status === 'INACTIVE' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Заказ ожидает подтверждения. После подтверждения договор будет отправлен вам по SMS, и редактирование станет недоступным.
            </p>
          </div>
        )}

        {/* Таймер обратного отсчета до автоотмены */}
        <OrderCancelTimer order={order} />

        {/* Дополнительная информация о выбранных услугах */}
        {hasAdditionalServices && (
          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-4 h-4 text-[#273655]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
              </svg>
              <span className="text-sm font-medium text-[#273655]">Дополнительные услуги включены</span>
            </div>
            <div className="text-xs text-gray-600 space-y-1">
              {order.is_selected_moving && (
                <p>• Профессиональная перевозка вещей</p>
              )}
              {order.is_selected_package && (
                <p>• Профессиональная упаковка для безопасного хранения</p>
              )}
              {order.services && order.services.length > 0 && (
                <>
                                   {order.services.map((service, index) => (
                   <p key={service.id || index}>
                     • {getServiceIcon(service.type)} {service.description || getServiceTypeName(service.type)}
                     {service.OrderService && service.OrderService.count > 1 && ` ×${service.OrderService.count}`}
                   </p>
                 ))}
                </>
              )}
            </div>
          </div>
        )}

        {/* Кнопки продления заказа - показываются только если extension_status === CANCELED */}
        {order.extension_status === "PENDING" && (
          <div className="mt-4 flex gap-3 justify-end">
            {/* Диалог для продления заказа */}
            <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-[#273655] text-[#273655] hover:bg-[#273655] hover:text-white transition-colors"
                >
                  Продление заказа
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Продление заказа</DialogTitle>
                  <DialogDescription>
                    Выберите количество месяцев для продления вашего заказа
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <div className="mb-4">
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Количество месяцев
                    </label>
                    <Select value={selectedMonths} onValueChange={setSelectedMonths}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Выберите количество месяцев" />
                      </SelectTrigger>
                      <SelectContent>
                        {[...Array(6)].map((_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString()}>
                            {i + 1} {i + 1 === 1 ? 'месяц' : (i + 1 < 5 ? 'месяца' : 'месяцев')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsExtendDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    className="bg-[#273655] hover:bg-[#1e2a4a]" 
                    onClick={handleExtendOrder}
                    disabled={extendOrderMutation.isPending}
                  >
                    {extendOrderMutation.isPending ? 'Обработка...' : 'Подтвердить'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Диалог для отмены продления */}
            <Dialog open={isCancelExtendDialogOpen} onOpenChange={setIsCancelExtendDialogOpen}>
              <DialogTrigger asChild>
                <Button 
                  variant="outline" 
                  className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors"
                >
                  Продление отменяется
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Отмена продления заказа</DialogTitle>
                  <DialogDescription>
                    Вы уверены, что хотите отменить продление заказа?
                  </DialogDescription>
                </DialogHeader>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCancelExtendDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleCancelExtension}
                    disabled={extendOrderMutation.isPending}
                  >
                    {extendOrderMutation.isPending ? 'Обработка...' : 'Да, отменить'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Модальные окна для удаления и подтверждения заказа */}
      <OrderDeleteModal
        isOpen={isDeleteModalOpen}
        order={order}
        onClose={() => setIsDeleteModalOpen(false)}
      />

      <EditOrderModal
          isOpen={isEditModalOpen}
          order={order}
          onSuccess={() => {
            setIsEditModalOpen(false);
            window.location.reload();
            navigate("/personal-account", { state: { activeSection: "payments" } });
          }}
          onCancel={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default UserOrderCard; 