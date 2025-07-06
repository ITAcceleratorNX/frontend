import React from 'react';
import { getOrderStatusText, getCargoMarkText } from '../../../shared/lib/types/orders';

const OrderConfirmModal = ({ isOpen, onClose, onConfirm, action, order }) => {
  if (!isOpen || !order) return null;

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

  const getActionConfig = () => {
    if (action === 'approve') {
      return {
        title: 'Подтвердить заказ',
        message: 'Вы уверены, что хотите подтвердить этот заказ?',
        description: 'После подтверждения пользователь сможет произвести оплату заказа.',
        confirmText: 'Подтвердить',
        confirmClass: 'bg-green-600 hover:bg-green-700',
        icon: '✓'
      };
    } else if (action === 'delete') {
      return {
        title: 'Удалить заказ',
        message: 'Вы уверены, что хотите удалить этот заказ?',
        description: 'Это действие нельзя отменить. Заказ будет удален навсегда.',
        confirmText: 'Удалить',
        confirmClass: 'bg-red-600 hover:bg-red-700',
        icon: '🗑️'
      };
    }
    return {};
  };

  const config = getActionConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Заголовок */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {config.icon} {config.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Содержимое */}
        <div className="px-6 py-4">
          {/* Сообщение */}
          <div className="mb-4">
            <p className="text-lg text-gray-900 mb-2">{config.message}</p>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>

          {/* Информация о заказе */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-medium text-gray-900 mb-3">Детали заказа</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Основная информация */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ID заказа:</span>
                  <span className="text-sm font-medium">#{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Клиент:</span>
                  <span className="text-sm font-medium">{order.user?.name || 'Не указан'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Email:</span>
                  <span className="text-sm">{order.user?.email || 'Не указан'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Телефон:</span>
                  <span className="text-sm">{order.user?.phone || 'Не указан'}</span>
                </div>
              </div>

              {/* Детали заказа */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Хранилище:</span>
                  <span className="text-sm font-medium">{order.storage?.name || 'Не указано'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Объем:</span>
                  <span className="text-sm">{order.total_volume} м³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Создан:</span>
                  <span className="text-sm">{formatDate(order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Стоимость аренды:</span>
                  <span className="text-sm font-medium text-[#273655]">{formatPrice(order.total_price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Депозит:</span>
                  <span className="text-sm font-medium">15 000 ₸</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-300">
                  <span className="text-sm text-gray-900 font-semibold">Общая сумма:</span>
                  <span className="text-sm font-bold text-[#273655]">
                    {formatPrice((parseFloat(order.total_price) || 0) + 15000)}
                  </span>
                </div>
              </div>
            </div>

            {/* Статусы */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex gap-4">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.status === 'INACTIVE' ? 'bg-red-100 text-red-700' :
                  order.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                  order.status === 'PROCESSING' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                                     Статус: {getOrderStatusText(order.status)}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.payment_status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  Оплата: {order.payment_status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  order.contract_status === 'SIGNED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  Договор: {order.contract_status === 'SIGNED' ? 'Подписан' : 'Не подписан'}
                </span>
              </div>
            </div>

            {/* Предметы */}
            {order.items && order.items.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Предметы в заказе ({order.items.length})
                </h4>
                <div className="space-y-1">
                  {order.items.slice(0, 3).map((item) => (
                                         <div key={item.id} className="text-xs text-gray-600">
                       {item.name} • {item.volume} м³ • {getCargoMarkText(item.cargo_mark)}
                     </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="text-xs text-gray-500">
                      и ещё {order.items.length - 3} предметов...
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Кнопки */}
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${config.confirmClass}`}
          >
            {config.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmModal; 