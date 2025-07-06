import React from 'react';
import { 
  getOrderStatusText, 
  getOrderStatusClass, 
  getPaymentStatusClass, 
  getContractStatusClass,
  getCargoMarkText
} from '../../../shared/lib/types/orders';

const OrderCard = ({ order, onApprove, onDelete, isLoading = false }) => {
  // Функции для форматирования
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



  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Заголовок карточки */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-semibold text-[#273655]">
            Заказ #{order.id}
          </h3>
          <span className={`px-2 py-1 rounded text-xs font-medium border ${getOrderStatusClass(order.status)}`}>
            {getOrderStatusText(order.status)}
          </span>
        </div>
        <div className="text-sm text-gray-500">
          Создан: {formatDate(order.created_at)}
        </div>
      </div>

      {/* Основная информация */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Информация о пользователе */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Информация о клиенте</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Имя:</span>
              <span className="ml-2 font-medium">{order.user?.name || 'Не указано'}</span>
            </div>
            <div>
              <span className="text-gray-600">Email:</span>
              <span className="ml-2">{order.user?.email || 'Не указан'}</span>
            </div>
            <div>
              <span className="text-gray-600">Телефон:</span>
              <span className="ml-2">{order.user?.phone || 'Не указан'}</span>
            </div>
          </div>
        </div>

        {/* Информация о заказе */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Детали заказа</h4>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-gray-600">Хранилище:</span>
              <span className="ml-2 font-medium">{order.storage?.name || 'Не указано'}</span>
            </div>
            <div>
              <span className="text-gray-600">Тип:</span>
              <span className="ml-2">{order.storage?.storage_type || 'Не указан'}</span>
            </div>
            <div>
              <span className="text-gray-600">Объем:</span>
              <span className="ml-2">{order.total_volume} м³</span>
            </div>
            <div>
              <span className="text-gray-600">Стоимость аренды:</span>
              <span className="ml-2 font-medium text-[#273655]">{formatPrice(order.total_price)}</span>
            </div>
            <div>
              <span className="text-gray-600">Депозит:</span>
              <span className="ml-2 font-medium">15 000 ₸</span>
            </div>
            <div className="pt-2 border-t border-gray-300">
              <span className="text-gray-900 font-semibold">Общая сумма:</span>
              <span className="ml-2 font-bold text-[#273655] text-base">
                {formatPrice((parseFloat(order.total_price) || 0) + 15000)}
              </span>
            </div>
          </div>
        </div>

        {/* Статусы и сроки */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Статусы и сроки</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Оплата:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusClass(order.payment_status)}`}>
                {order.payment_status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Договор:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getContractStatusClass(order.contract_status)}`}>
                {order.contract_status === 'SIGNED' ? 'Подписан' : 'Не подписан'}
              </span>
            </div>
            <div className="pt-2 text-xs text-gray-500">
              <div>Начало: {formatDate(order.start_date)}</div>
              <div>Окончание: {formatDate(order.end_date)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Предметы в заказе */}
      {order.items && order.items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-medium text-gray-900 mb-2">Предметы в заказе ({order.items.length})</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {order.items.slice(0, 6).map((item) => (
              <div key={item.id} className="text-sm bg-white rounded border px-3 py-2">
                <div className="font-medium text-gray-900">{item.name}</div>
                <div className="text-gray-600">
                  {item.volume} м³ • {getCargoMarkText(item.cargo_mark)}
                </div>
              </div>
            ))}
            {order.items.length > 6 && (
              <div className="text-sm text-gray-500 px-3 py-2">
                и ещё {order.items.length - 6} предметов...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Кнопки действий */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex gap-3">
        {order.status === 'INACTIVE' && (
          <button
            onClick={onApprove}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            )}
            Подтвердить заказ
          </button>
        )}
        <button
          onClick={onDelete}
          disabled={isLoading}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && (
            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
          )}
          Удалить заказ
        </button>
      </div>
    </div>
  );
};

export default OrderCard; 