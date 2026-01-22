import React from 'react';
import { Truck, MapPin, Clock, User, Phone } from 'lucide-react';
import { Button } from '../../../components/ui/button';

const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') {
    return 'Индивидуальное';
  } else if (type === 'CLOUD') {
    return 'Облачное';
  }
  return type;
};

const formatDate = (dateString) => {
  if (!dateString) return 'Не указана';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' г.';
  } catch (error) {
    return 'Некорректная дата';
  }
};

const getStatusText = (status, direction) => {
  const statusMap = {
    'PENDING': direction === 'TO_CLIENT' ? 'Ожидает отправки со склада' : 'Ожидает доставки на склад',
    'IN_PROGRESS': direction === 'TO_CLIENT' ? 'В пути к клиенту' : 'В пути к складу',
    'DELIVERED': direction === 'TO_CLIENT' ? 'Доставлено клиенту' : 'Доставлено на склад',
    'COURIER_ASSIGNED': 'Курьер назначен',
    'COURIER_IN_TRANSIT': 'Курьер в пути к вам',
    'COURIER_AT_CLIENT': 'Курьер у вас',
    'FINISHED': 'Завершено'
  };
  return statusMap[status] || status;
};

const DeliveryCard = ({ delivery, onSelectTimeClick, embeddedMobile = false }) => {
  const order = delivery.order;
  
  // Статусы, при которых еще можно выбрать время (до начала активной доставки)
  const allowedStatuses = ['PENDING', 'COURIER_ASSIGNED'];
  
  // Проверяем, можно ли выбрать время доставки
  const canSelectTime = 
    order?.payment_status === 'PAID' && 
    order?.contract_status === 'SIGNED' &&
    allowedStatuses.includes(delivery.status) &&
    !delivery.delivery_time_interval;
  
  // Определяем фон карточки: зеленый градиент для доставленных, серый для в процессе
  const getCardBackground = () => {
    if (delivery.status === 'DELIVERED') {
      return 'bg-gradient-to-b from-[#00A991] to-[#004743]'; // Зеленый градиент для доставленных
    }
    return 'bg-[#999999]'; // Серый для в процессе
  };

  const cardBackground = getCardBackground();

  return (
    <div className={`${cardBackground} rounded-3xl text-white relative overflow-hidden shadow-lg min-w-0 ${embeddedMobile ? 'p-3 min-[360px]:p-4' : 'p-6'}`}>
      {/* Заголовок заказа */}
      <div className={`flex items-start justify-between gap-2 ${embeddedMobile ? 'mb-3 min-[360px]:mb-4' : 'mb-6'}`}>
        <div className="flex-1 min-w-0 overflow-hidden">
          <h3 className={`font-bold mb-2 truncate ${embeddedMobile ? 'text-base min-[360px]:text-lg' : 'text-2xl'}`}>Заказ №{delivery.order_id}</h3>
          {order?.created_at && (
            <p className="text-xs text-white/90 mb-1">Создан: {formatDate(order.created_at)}</p>
          )}
          {order?.storage_type && (
            <p className="text-sm text-white/90">Тип: {getStorageTypeText(order.storage_type)}</p>
          )}
          {order?.volume && (
            <p className="text-sm text-white/90">Объем: {order.volume} м³</p>
          )}
        </div>
        
        {/* Белый квадрат с идентификатором бокса */}
        {order?.storage?.name && (
          <div className={`bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-1 min-[360px]:ml-2 sm:ml-4 p-1 overflow-hidden ${embeddedMobile ? 'w-16 h-16 min-[360px]:w-20 min-[360px]:h-20' : 'w-28 h-28'}`}>
            <span className={`font-bold text-gray-700 text-center truncate w-full px-0.5 ${embeddedMobile ? 'text-sm min-[360px]:text-base' : 'text-base sm:text-lg'}`}>
              {order.storage.name}
            </span>
          </div>
        )}
      </div>

      {/* Информация о доставке */}
      <div className={embeddedMobile ? 'space-y-2 min-[360px]:space-y-3' : 'space-y-4'}>
        {/* Статус доставки */}
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          <span className="text-lg font-semibold">{getStatusText(delivery.status, delivery.direction)}</span>
        </div>

        {/* Дата доставки */}
        {delivery.moving_date && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm text-white/90">Дата доставки: {formatDate(delivery.moving_date)}</span>
          </div>
        )}

        {/* Адрес */}
        {delivery.address && (
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 mt-0.5" />
            <span className="text-sm text-white/90">Адрес: {delivery.address}</span>
          </div>
        )}

        {/* Интервал времени доставки */}
        {delivery.delivery_time_interval && (
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span className="text-sm text-white/90">Время доставки: {delivery.delivery_time_interval}</span>
          </div>
        )}

        {/* Информация о курьере */}
        {delivery.courier && (
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span className="text-sm text-white/90">Курьер: {delivery.courier.name}</span>
            {delivery.courier.phone && (
              <a 
                href={`tel:${delivery.courier.phone}`}
                className="flex items-center gap-1 text-sm text-white/90 hover:text-white underline"
              >
                <Phone className="w-4 h-4" />
                {delivery.courier.phone}
              </a>
            )}
          </div>
        )}

        {/* Название склада */}
        {order?.storage?.warehouse?.name && (
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 mt-0.5" />
            <span className="text-sm text-white/90">
              Склад: {order.storage.warehouse.name}
              {order.storage.warehouse.address && `, ${order.storage.warehouse.address}`}
            </span>
          </div>
        )}

        {/* Направление доставки */}
        {delivery.direction && (
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            <span className="text-sm text-white/90">
              Направление: {delivery.direction === 'TO_CLIENT' ? 'К клиенту' : 'К складу'}
            </span>
          </div>
        )}

        {/* Кнопка выбора времени доставки */}
        {canSelectTime && onSelectTimeClick && (
          <div className="pt-2">
            <Button
              onClick={() => onSelectTimeClick(delivery)}
              className="bg-white text-gray-900 hover:bg-gray-100 text-sm"
              size="sm"
            >
              Выбрать время доставки
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryCard;

