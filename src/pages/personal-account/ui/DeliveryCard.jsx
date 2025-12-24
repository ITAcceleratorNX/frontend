import React from 'react';
import { Truck, MapPin, Clock } from 'lucide-react';

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

const getStatusText = (status) => {
  const statusMap = {
    'PENDING_FROM': 'Ожидает доставки на склад',
    'PENDING_TO': 'Ожидает отправки со склада',
    'IN_PROGRESS': 'В пути к складу',
    'IN_PROGRESS_TO': 'В пути к клиенту',
    'DELIVERED': 'Доставлено на склад',
    'DELIVERED_TO': 'Доставлено клиенту'
  };
  return statusMap[status] || status;
};

const DeliveryCard = ({ delivery }) => {
  const order = delivery.order;
  
  // Определяем фон карточки: зеленый градиент для доставленных, серый для в процессе
  const getCardBackground = () => {
    if (delivery.status === 'DELIVERED' || delivery.status === 'DELIVERED_TO') {
      return 'bg-gradient-to-b from-[#00A991] to-[#004743]'; // Зеленый градиент для доставленных
    }
    return 'bg-[#999999]'; // Серый для в процессе
  };

  const cardBackground = getCardBackground();

  return (
    <div className={`${cardBackground} rounded-3xl p-6 text-white relative overflow-hidden shadow-lg`}>
      {/* Заголовок заказа */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-2xl font-bold mb-2">Заказ №{delivery.order_id}</h3>
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
          <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ml-4">
            <span className="text-4xl font-bold text-gray-700">{order.storage.name}</span>
          </div>
        )}
      </div>

      {/* Информация о доставке */}
      <div className="space-y-4">
        {/* Статус доставки */}
        <div className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          <span className="text-lg font-semibold">{getStatusText(delivery.status)}</span>
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
      </div>
    </div>
  );
};

export default DeliveryCard;

