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

const getStorageTypeText = (type) => {
  if (type === 'INDIVIDUAL') {
    return 'Индивидуальное';
  }
  return type;
};

const OrderCard = ({ order, onDelete, isLoading = false }) => {
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

  // Функция для получения компонента дополнительной услуги
  const getServiceBadge = (isSelected, serviceName, color = 'blue') => {
    if (isSelected) {
      return (
        <div className={`flex items-center gap-2 p-2 rounded-lg bg-${color}-50 border border-${color}-200`}>
          <div className={`w-2 h-2 bg-${color}-500 rounded-full`}></div>
          <div className="flex items-center gap-1">
            <svg className={`w-3 h-3 text-${color}-600`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className={`text-xs font-medium text-${color}-700`}>{serviceName}</span>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 border border-gray-200">
          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-xs text-gray-500">{serviceName}</span>
          </div>
        </div>
      );
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-2 border-l-[#1e2c4f]">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Информация о клиенте */}
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 "> 
  <CardHeader className="pb-3"> 
    <CardTitle className="text-lg flex items-center gap-2 text-blue-700"> 
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> 
      </svg> 
      Клиент 
    </CardTitle> 
  </CardHeader> 
  <CardContent className="pt-0"> 
    <div className="space-y-3 text-sm"> 
      <div className="flex items-start gap-3"> 
        <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /> 
        </svg> 
        <span className="font-medium text-gray-900 leading-relaxed">{order.user?.name || 'Не указано'}</span> 
      </div> 
      <div className="flex items-start gap-3"> 
        <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /> 
        </svg> 
        <span className="text-gray-700 leading-relaxed break-all">{order.user?.email || 'Не указан'}</span> 
      </div> 
      <div className="flex items-start gap-3"> 
        <svg className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /> 
        </svg> 
        <span className="text-gray-700 leading-relaxed">{order.user?.phone || 'Не указан'}</span> 
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
                  <span className="text-gray-700">{getStorageTypeText(order.storage?.storage_type) || 'Не указан'}</span>
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

          {/* Дополнительные услуги */}
          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Доп. услуги
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Услуга перевозки */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Moving
                  </span>
                  {order.is_selected_moving ? (
                    <Badge className="text-xs bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Выбрано
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Не выбрано
                    </Badge>
                  )}
                </div>

                {/* Услуга упаковки */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Package
                  </span>
                  {order.is_selected_package ? (
                    <Badge className="text-xs bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Выбрано
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs text-gray-500 border-gray-300">
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Не выбрано
                    </Badge>
                  )}
                </div>

                {/* Общий статус дополнительных услуг */}
                <div className="pt-2 border-t border-orange-200">
                  {(order.is_selected_moving || order.is_selected_package) ? (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium">
                        {order.is_selected_moving && order.is_selected_package 
                          ? 'Все услуги активны' 
                          : 'Есть активные услуги'
                        }
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      <span className="text-gray-500">Доп. услуги не выбраны</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        
        {/* Предметы в заказе */}
        {order.items && order.items.length > 0 && (
          <Card className="bg-gradient-to-r from-teal-50 to-cyan-50 border-teal-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-teal-700">
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
                  <Card key={item.id} className="bg-white border-teal-200 hover:border-teal-300 transition-colors">
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

        {/* Заказанные услуги из массива services */}
        {order.services && order.services.length > 0 && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-amber-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                Заказанные услуги
                <Badge variant="secondary" className="ml-auto bg-amber-100 text-amber-800">
                  {order.services.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {order.services.map((service, index) => (
                  <Card key={service.id || index} className="bg-white border-amber-200 hover:border-amber-300 transition-colors">
                    <CardContent className="p-3">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-[#1e2c4f] rounded-full flex items-center justify-center">
                          <span className="text-sm">{getServiceIcon(service.type)}</span>
                        </div>
                                                 <div className="flex-1">
                           <div className="flex items-center gap-2">
                             <div className="font-medium text-gray-900 text-sm">
                               {service.description || getServiceTypeName(service.type)}
                             </div>
                             {service.OrderService && service.OrderService.count > 1 && (
                               <Badge className="text-xs px-2 py-0 bg-[#1e2c4f] text-white">
                                 ×{service.OrderService.count}
                               </Badge>
                             )}
                           </div>
                         </div>
                      </div>
                      
                      {/* Информация о цене */}
                      {service.price && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">
                            {service.OrderService && service.OrderService.count > 1 ? 'За единицу:' : 'Цена:'}
                          </span>
                          <span className="font-medium text-[#1e2c4f]">
                            {formatPrice(service.price)}
                          </span>
                        </div>
                      )}
                      
                      {/* Общая стоимость */}
                      {service.price && service.OrderService && service.OrderService.count > 1 && (
                        <div className="flex items-center justify-between text-xs mt-1 pt-1 border-t border-gray-200">
                          <span className="text-gray-700 font-medium">Итого:</span>
                          <span className="font-bold text-[#1e2c4f]">
                            {formatPrice(parseFloat(service.price) * service.OrderService.count)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {/* Сводка по услугам */}
              <div className="mt-4 p-3 bg-white rounded-lg border border-amber-200">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Услуг заказано: <span className="font-medium text-gray-900">{order.services.length}</span>
                  </span>
                  {order.services.some(s => s.price) && (
                    <span className="text-gray-600">
                      Общая стоимость: <span className="font-bold text-[#1e2c4f]">
                        {formatPrice(
                          order.services.reduce((total, service) => {
                            if (service.price && service.OrderService) {
                              return total + (parseFloat(service.price) * service.OrderService.count);
                            }
                            return total;
                          }, 0)
                        )}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {/* Moving Orders - отображение с адресами */}
        {order.moving_orders && order.moving_orders.length > 0 && (
          <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-green-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Даты перемещения
                <Badge variant="secondary" className="ml-auto bg-green-100 text-green-800">
                  {order.moving_orders.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {order.moving_orders.map((movingOrder, index) => (
                  <Card key={movingOrder.id || index} className="bg-white border-green-200 hover:border-green-300 transition-colors">
                    <CardContent className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-green-700">#{index + 1}</span>
                          <Badge variant="outline" className="text-xs" >
                            {{
                              PENDING_FROM: 'Ожидает забора',
                              PENDING_TO: 'Ожидает доставки',
                              IN_PROGRESS: 'В процессе',
                            }[movingOrder.status] || movingOrder.status}
                          </Badge>
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
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}


        {/* Кнопки действий */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
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