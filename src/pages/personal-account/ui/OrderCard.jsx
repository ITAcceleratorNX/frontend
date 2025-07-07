import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
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

  // Функция для получения вариантов Badge
  const getStatusVariant = (status) => {
    switch(status) {
      case 'INACTIVE': return 'destructive';
      case 'APPROVED': return 'default';
      case 'PROCESSING': return 'secondary';
      case 'ACTIVE': return 'default';
      default: return 'secondary';
    }
  };

  const getPaymentVariant = (status) => {
    return status === 'PAID' ? 'default' : 'destructive';
  };

  const getContractVariant = (status) => {
    return status === 'SIGNED' ? 'default' : 'secondary';
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#1e2c4f]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-xl text-[#1e2c4f] flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Заказ #{order.id}
            </CardTitle>
            <Badge variant={getStatusVariant(order.status)} className="font-medium">
              {getOrderStatusText(order.status)}
            </Badge>
          </div>
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4m-7 0h8m-8 0V5a1 1 0 00-1 1v11a1 1 0 001 1h2m6-12V5a1 1 0 011 1v11a1 1 0 01-1 1h-2m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            {formatDate(order.created_at)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Основная информация */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Информация о пользователе */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Клиент
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span className="font-medium text-gray-900">{order.user?.name || 'Не указано'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-gray-700">{order.user?.email || 'Не указан'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="text-gray-700">{order.user?.phone || 'Не указан'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Информация о заказе */}
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Детали заказа
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Хранилище:</span>
                  <span className="font-medium text-gray-900">{order.storage?.name || 'Не указано'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Тип:</span>
                  <span className="text-gray-700">{order.storage?.storage_type || 'Не указан'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Объем:</span>
                  <Badge variant="outline" className="font-medium">{order.total_volume} м³</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Аренда:</span>
                  <span className="font-medium text-[#1e2c4f]">{formatPrice(order.total_price)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Депозит:</span>
                  <span className="font-medium">15 000 ₸</span>
                </div>
                <div className="pt-2 border-t border-green-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Итого:</span>
                  <span className="font-bold text-[#1e2c4f] text-base">
                    {formatPrice((parseFloat(order.total_price) || 0) + 15000)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Статусы и сроки */}
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Статусы
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Оплата
                  </span>
                  <Badge variant={getPaymentVariant(order.payment_status)} className="text-xs">
                    {order.payment_status === 'PAID' ? 'Оплачено' : 'Не оплачено'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Договор
                  </span>
                  <Badge variant={getContractVariant(order.contract_status)} className="text-xs">
                    {order.contract_status === 'SIGNED' ? 'Подписан' : 'Не подписан'}
                  </Badge>
                </div>
                <div className="pt-2 border-t border-purple-200 text-xs text-gray-600 space-y-1">
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
                    </svg>
                    Начало: {formatDate(order.start_date)}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                    Окончание: {formatDate(order.end_date)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Предметы в заказе */}
        {order.items && order.items.length > 0 && (
          <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Предметы в заказе
                <Badge variant="secondary" className="ml-auto">
                  {order.items.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {order.items.slice(0, 6).map((item) => (
                  <Card key={item.id} className="bg-white border-orange-200 hover:border-orange-300 transition-colors">
                    <CardContent className="p-3">
                      <div className="font-medium text-gray-900 text-sm mb-1">{item.name}</div>
                      <div className="text-xs text-gray-600 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {item.volume} м³
                        </Badge>
                        <span>{getCargoMarkText(item.cargo_mark)}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {order.items.length > 6 && (
                  <Card className="bg-gray-50 border-dashed border-gray-300">
                    <CardContent className="p-3 text-center">
                      <div className="text-sm text-gray-500 font-medium">
                        +{order.items.length - 6}
                      </div>
                      <div className="text-xs text-gray-400">ещё предметов</div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Кнопки действий */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {order.status === 'INACTIVE' && (
            <Button
              onClick={onApprove}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              Подтвердить заказ
            </Button>
          )}
          <Button
            onClick={onDelete}
            disabled={isLoading}
            variant="destructive"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
            Удалить заказ
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderCard; 