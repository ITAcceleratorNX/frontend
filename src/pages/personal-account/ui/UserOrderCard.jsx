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

  const canPay = order.status === 'APPROVED' && order.payment_status === 'UNPAID';

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
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
      </div>

      {/* Футер карточки с кнопками */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
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
      </div>
    </div>
  );
};

export default UserOrderCard; 