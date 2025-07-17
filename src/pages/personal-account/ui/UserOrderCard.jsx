import React from 'react';
import { 
  getOrderStatusText, 
  getOrderStatusClass,
  getPaymentStatusText,
  getContractStatusText,
  getCargoMarkText 
} from '../../../shared/lib/types/orders';

const UserOrderCard = ({ order, onPayOrder }) => {
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
      // Старые типы для совместимости
      
      default:
        return 'Услуга';
    }
  };

  const canPay = order.status === 'APPROVED' && order.payment_status === 'UNPAID';

  // Проверяем наличие дополнительных услуг (включая новый массив services)
  const hasAdditionalServices = order.is_selected_moving || order.is_selected_package || (order.services && order.services.length > 0);

  // Определяем стили карточки в зависимости от наличия дополнительных услуг
  const cardClasses = hasAdditionalServices
    ? "bg-white border-2 border-[#273655] rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 relative"
    : "bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow";

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

      {/* Заголовок карточки */}
      <div className="p-6 border-b border-gray-100">
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
      <div className="p-6 space-y-4">
        {/* Информация о хранилище */}
        {order.storage && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Хранилище</h4>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Бокс:</span> {order.storage.name}</p>
              <p><span className="font-medium">Тип:</span> {order.storage.storage_type}</p>
              <p><span className="font-medium">Объем:</span> {order.storage.total_volume} м³</p>
              {order.storage.description && (
                <p><span className="font-medium">Описание:</span> {order.storage.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Информация о заказе */}
        <div className="grid grid-cols-2 gap-4 text-sm">
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

        {/* Отображение Пункт 3.3 если есть */}
        {order.punct33 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Пункт 3.3
            </h4>
            <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3">
              <p className="text-sm text-indigo-700">{order.punct33}</p>
            </div>
          </div>
        )}

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
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          movingOrder.status === 'PENDING_FROM' 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {movingOrder.status}
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
                          {formatPrice(parseFloat(service.price) * service.OrderService.count)} ₸
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
                        {formatPrice(
                          order.services.reduce((total, service) => {
                            if (service.price && service.OrderService) {
                              return total + (parseFloat(service.price) * service.OrderService.count);
                            }
                            return total;
                          }, 0)
                        )} ₸
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
      <div className={`px-6 py-4 border-t border-gray-100 ${hasAdditionalServices ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold text-gray-900">
            {formatPrice(order.total_price)} ₸
          </div>
          
          <div className="flex gap-3">
            {canPay ? (
              <button
                onClick={() => onPayOrder(order)}
                className="px-4 py-2 bg-[#273655] text-white text-sm font-medium rounded-lg hover:bg-[#1e2a4a] transition-colors"
              >
                Оплатить
              </button>
            ) : order.payment_status === 'PAID' ? (
              <span className="px-4 py-2 bg-green-100 text-green-700 text-sm font-medium rounded-lg">
                Оплачено
              </span>
            ) : order.status === 'INACTIVE' ? (
              <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                Ожидает подтверждения
              </span>
            ) : (
              <span className="px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-lg">
                Недоступно для оплаты
              </span>
            )}
          </div>
        </div>
        
        {order.status === 'INACTIVE' && (
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <svg className="inline w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Заказ ожидает подтверждения менеджером. После подтверждения станет доступна оплата.
            </p>
          </div>
        )}

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
      </div>
    </div>
  );
};

export default UserOrderCard; 