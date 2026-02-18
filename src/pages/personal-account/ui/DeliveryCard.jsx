import React from 'react';
import { Truck, MapPin, Clock, User, Phone } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import StorageBadge from "../../../../src/pages/personal-account/ui/StorageBadge.jsx";

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

const getStatusText = (status, direction, deliveryTimeInterval = null, movingDate = null) => {
  // Форматируем дату для проверки "сегодня"
  const isToday = (dateString) => {
    if (!dateString) return false;
    try {
      const date = new Date(dateString);
      const today = new Date();
      return date.toDateString() === today.toDateString();
    } catch {
      return false;
    }
  };

  const formatTimeText = () => {
    if (!deliveryTimeInterval) return '';
    const dateText = movingDate && isToday(movingDate) ? 'сегодня' : '';
    return dateText ? `, приедет ${dateText} в ${deliveryTimeInterval}` : `, приедет в ${deliveryTimeInterval}`;
  };

  switch (status) {
    case 'PENDING':
      return 'Ожидает назначения курьера';
    case 'COURIER_ASSIGNED':
      return deliveryTimeInterval 
        ? `Курьер назначен${formatTimeText()}`
        : 'Курьер назначен';
    case 'COURIER_IN_TRANSIT':
      return 'Курьер едет к вам';
    case 'COURIER_AT_CLIENT':
      return 'Курьер у вас';
    case 'IN_PROGRESS':
      return direction === 'TO_WAREHOUSE' 
        ? 'Курьер везёт вещи на склад'
        : 'Курьер везёт вещи к вам';
    case 'DELIVERED':
      return direction === 'TO_WAREHOUSE'
        ? 'Доставлено на склад'
        : 'Доставлено вам';
    case 'FINISHED':
      return 'Завершено';
    case 'CANCELLED':
      return 'Отменено';
    default:
      return status;
  }
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
  
  // Определяем фон карточки: зеленый градиент для завершенных, серый для в процессе
  const getCardBackground = () => {
    if (['DELIVERED', 'FINISHED'].includes(delivery.status)) {
      return 'bg-gradient-to-b from-[#00A991] to-[#004743]'; // Зеленый градиент для завершенных
    }
    return 'bg-[#999999]'; // Серый для в процессе
  };

  const cardBackground = getCardBackground();

  // Функция для получения изображения и названия тарифа по tariff_type
  const getTariffInfo = (tariffType) => {
    if (!tariffType || tariffType === 'CUSTOM') return { image: null, name: 'Свои габариты' };

    const tariffMap = {
      'CLOUD_TARIFF_SUMKA': { image: sumkaImg, name: 'Хранения сумки / коробки вещей' },
      'CLOUD_TARIFF_SHINA': { image: shinaImg, name: 'Шины' },
      'CLOUD_TARIFF_MOTORCYCLE': { image: motorcycleImg, name: 'Хранение мотоцикла' },
      'CLOUD_TARIFF_BICYCLE': { image: bicycleImg, name: 'Хранение велосипед' },
      'CLOUD_TARIFF_SUNUK': { image: sunukImg, name: 'Сундук до 1 м³' },
      'CLOUD_TARIFF_FURNITURE': { image: furnitureImg, name: 'Шкаф до 2 м³' },
      'CLOUD_TARIFF_SKLAD': { image: skladImg, name: 'Кладовка до 3 м³' },
      'CLOUD_TARIFF_GARAZH': { image: garazhImg, name: 'Гараж до 9м³' }
    };

    return tariffMap[tariffType] || { image: null, name: 'Свои габариты' };
  };

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
        <StorageBadge order={order} embeddedMobile={embeddedMobile} />
      </div>

      {/* Информация о доставке */}
      <div className={embeddedMobile ? 'space-y-2 min-[360px]:space-y-3' : 'space-y-4'}>
        {/* Статус доставки */}
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          <span className="text-lg font-semibold">
            {getStatusText(
              delivery.status,
              delivery.direction,
              delivery.delivery_time_interval,
              delivery.moving_date
            )}
          </span>
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

