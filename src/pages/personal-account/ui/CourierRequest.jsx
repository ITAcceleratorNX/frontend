import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { 
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';
import { api, getDeliveredOrdersPaginated } from '../../../shared/api/axios';
import { 
  Truck, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Loader2,
  AlertCircle
} from 'lucide-react';
import { showErrorToast, toastCourierStatus } from '../../../shared/lib/toast';

// Константы разделов курьера
const COURIER_SECTIONS = {
  NEW: 'new',           // PENDING
  IN_PROGRESS: 'inProgress',  // COURIER_IN_TRANSIT, COURIER_AT_CLIENT, IN_PROGRESS
  COMPLETED: 'completed'     // DELIVERED, FINISHED
};

// Функция форматирования времени (сколько времени назад)
const formatTimeAgo = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'только что';
    if (diffMins < 60) {
      const mins = diffMins;
      if (mins === 1) return '1 минуту назад';
      if (mins < 5) return `${mins} минуты назад`;
      if (mins < 21) return `${mins} минут назад`;
      return `${mins} минуту назад`;
    }
    if (diffHours < 24) {
      const hours = diffHours;
      if (hours === 1) return '1 час назад';
      if (hours < 5) return `${hours} часа назад`;
      return `${hours} часов назад`;
    }
    if (diffDays === 1) return '1 день назад';
    return `${diffDays} дней назад`;
  } catch (error) {
    return '';
  }
};

const OrderCard = ({ order, onStatusChange, isLoading = false, isDelivered = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/personal-account/courier/order/${order.movingOrderId}`);
  };

  const handleAction = async (e) => {
    e.stopPropagation();
    
      try {
       if (order.status === 'PENDING') {
         await api.put(`/moving/${order.movingOrderId}`, {
           id: order.movingOrderId,
           status: 'COURIER_ASSIGNED',
         });
         toastCourierStatus('Заказ принят в работу');
       } else if (order.status === 'COURIER_ASSIGNED') {
         await api.put(`/moving/${order.movingOrderId}`, {
           id: order.movingOrderId,
           status: 'COURIER_IN_TRANSIT',
         });
         toastCourierStatus('Курьер в пути к клиенту');
       } else if (order.status === 'COURIER_IN_TRANSIT') {
         await api.put(`/moving/${order.movingOrderId}`, {
           id: order.movingOrderId,
           status: 'COURIER_AT_CLIENT',
         });
         toastCourierStatus('Статус обновлен: Курьер у клиента');
       } else if (order.status === 'COURIER_AT_CLIENT') {
         await api.put(`/moving/${order.movingOrderId}`, {
           id: order.movingOrderId,
           status: 'IN_PROGRESS',
         });
         toastCourierStatus('Статус обновлен: Курьер едет на склад');
       } else if (order.status === 'IN_PROGRESS') {
         await api.put(`/moving/${order.movingOrderId}`, {
           id: order.movingOrderId,
           status: 'DELIVERED',
         });
         toastCourierStatus('Заказ завершён');
       }
      // Убираем возможность удаления для завершённых заказов
      onStatusChange();
    } catch (error) {
      console.error('Ошибка при изменении статуса заказа:', error);
      showErrorToast('Ошибка при изменении статуса заказа');
    }
  };

  const getActionButton = () => {
    // Не показываем кнопку для завершённых заказов
    if (isDelivered) {
      return null;
    }

    if (order.status === 'PENDING') {
      return (
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-4 py-2 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Принять'}
        </Button>
      );
    }
    if (order.status === 'COURIER_ASSIGNED') {
      return (
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-4 py-2 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <Truck className="w-4 h-4" />
              {order.direction === 'TO_CLIENT' ? 'Еду к клиенту' : 'Еду к вам'}
            </>
          )}
        </Button>
      );
    }
    if (order.status === 'COURIER_IN_TRANSIT') {
      return (
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-4 py-2 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <Truck className="w-4 h-4" />
              Прибыл к клиенту
            </>
          )}
        </Button>
      );
    }
    if (order.status === 'COURIER_AT_CLIENT') {
      const buttonText = order.direction === 'TO_WAREHOUSE' ? 'Везу к складу' : 'Везу со склада';
      return (
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-4 py-2 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <Truck className="w-4 h-4" />
              {buttonText}
            </>
          )}
        </Button>
      );
    }
    if (order.status === 'IN_PROGRESS') {
      const buttonText = order.direction === 'TO_CLIENT' ? 'Везу к клиенту' : 'Везу к складу';
      return (
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-4 py-2 flex items-center gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
            <>
              <Truck className="w-4 h-4" />
              {buttonText}
            </>
          )}
        </Button>
      );
    }
    return null;
  };

  // Получить текст направления и статуса для отображения
  const getDirectionText = () => {
    if (order.status === 'COURIER_IN_TRANSIT') {
      return order.direction === 'TO_CLIENT' ? 'К клиенту' : 'К складу';
    }
    if (order.status === 'COURIER_AT_CLIENT') {
      return order.direction === 'TO_WAREHOUSE' ? 'К складу' : 'К клиенту';
    }
    if (order.status === 'IN_PROGRESS') {
      return order.direction === 'TO_CLIENT' ? 'К клиенту' : 'К складу';
    }
    if (order.status === 'PENDING') {
      return order.direction === 'TO_CLIENT' ? 'К клиенту' : 'К складу';
    }
    return '';
  };

  // Получить адрес для отображения
  const getDisplayAddress = () => {
    if (order.status === 'COURIER_IN_TRANSIT' || order.status === 'COURIER_AT_CLIENT') {
      return order.userAddress || 'Не указан';
    }
    if (order.status === 'IN_PROGRESS') {
      if (order.direction === 'TO_CLIENT') {
        return order.userAddress || 'Не указан';
      } else {
        return order.warehouseAddress || order.warehouseName || 'Не указан';
      }
    }
    if (order.status === 'PENDING') {
      if (order.direction === 'TO_CLIENT') {
        return order.warehouseAddress || order.warehouseName || 'Не указан';
      } else {
        return order.userAddress || 'Не указан';
      }
    }
    return order.userAddress || order.warehouseAddress || 'Не указан';
  };

  const directionText = getDirectionText();
  const displayAddress = getDisplayAddress();
  const timeAgo = formatTimeAgo(order.updated_at || order.created_at);
  const actionButton = getActionButton();

  return (
    <Card 
      className="group cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200 bg-white rounded-xl border border-gray-200 min-w-0"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 sm:p-5">
        {/* Заголовок с номером заказа */}
        <div className="flex items-start justify-between mb-4">
          <CardTitle className="text-lg font-bold text-gray-900">
            Заказ №{order.movingOrderId}
          </CardTitle>
        </div>

        {/* Направление и расстояние */}
        {directionText && (order.status === 'COURIER_IN_TRANSIT' || order.status === 'COURIER_AT_CLIENT' || order.status === 'IN_PROGRESS' || order.status === 'COURIER_ASSIGNED') && (
          <div className="flex items-center gap-2 mb-3">
            <Truck className="w-5 h-5 text-[#00A991] flex-shrink-0" />
            <span className="text-gray-700 font-medium">
              {directionText}
              {/* Если есть данные о расстоянии, можно добавить: → {order.distance} км, около {order.estimated_time} минут */}
            </span>
          </div>
        )}

        {/* Адрес */}
        <div className="flex items-start gap-2 mb-4">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">{displayAddress}</span>
        </div>

        {/* Кнопка статуса и время */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="min-h-[44px] flex items-center">{actionButton}</div>
          {timeAgo && (
            <div className="flex items-center gap-1 text-xs text-gray-500 shrink-0">
              <Clock className="w-3 h-3" />
              <span>{timeAgo}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const CourierRequest = () => {
  const [activeTab, setActiveTab] = useState(COURIER_SECTIONS.NEW);
  
  const [orders, setOrders] = useState({
    PENDING: [],
    IN_PROGRESS: [],
  });
  
  // Отдельное состояние для завершённых заказов с пагинацией
  const [deliveredOrders, setDeliveredOrders] = useState({
    results: [],
    total: 0,
    page: 1,
    limit: 10,
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isDeliveredLoading, setIsDeliveredLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const results = await Promise.all([
        api.get('/moving/status/PENDING'),
        api.get('/moving/status/COURIER_ASSIGNED'),
        api.get('/moving/status/COURIER_IN_TRANSIT'),
        api.get('/moving/status/COURIER_AT_CLIENT'),
        api.get('/moving/status/IN_PROGRESS'),
      ]);

      // Фильтрация по availability для новых заказов
      const filterAvailable = (orders) =>
        orders.filter((order) => order.availability === 'AVAILABLE');

      // Для "В работе" берём все заказы курьера независимо от availability
      const newOrders = {
        PENDING: filterAvailable([
          ...results[0].data,  // PENDING - новые заказы (ещё никто не принял)
        ]),
        IN_PROGRESS: [
          ...results[1].data,  // COURIER_ASSIGNED - принятые, но ещё не начатые
          ...results[2].data,  // COURIER_IN_TRANSIT - едет к клиенту
          ...results[3].data,  // COURIER_AT_CLIENT - забрал и везёт на склад
          ...results[4].data,  // IN_PROGRESS - везёт со склада к клиенту
        ],
      };

      setOrders(newOrders);
    } catch (err) {
      console.error('Ошибка при загрузке заказов:', err);
      const status = err?.response?.status;
      const msg = err?.userMessage || err?.message || (
        status === 401 ? 'Сессия истекла. Войдите снова.' :
        status === 403 ? 'Недостаточно прав. Войдите снова.' :
        'Не удалось загрузить заказы. Попробуйте позже.'
      );
      setError(msg);
      showErrorToast(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeliveredOrders = async (page = 1) => {
    try {
      setIsDeliveredLoading(true);
      const data = await getDeliveredOrdersPaginated(page, 10);
      setDeliveredOrders({
        results: data.results || [],
        total: data.total || 0,
        page: data.page || page,
        limit: data.limit || 10,
      });
    } catch (err) {
      console.error('Ошибка при загрузке завершённых заказов:', err);
      showErrorToast('Ошибка загрузки завершённых заказов');
    } finally {
      setIsDeliveredLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchDeliveredOrders(1);
  }, []);

  const handlePageChange = (page) => {
    fetchDeliveredOrders(page);
  };

  const renderPagination = () => {
    const totalPages = Math.ceil(deliveredOrders.total / deliveredOrders.limit);
    
    // Не показываем пагинацию если меньше 2 страниц
    if (totalPages <= 1) return null;

    const currentPage = deliveredOrders.page;
    
    return (
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
          
          {/* Показываем номера страниц */}
          {Array.from({ length: Math.min(totalPages, 5) }, (_, index) => {
            let pageNumber;
            if (totalPages <= 5) {
              pageNumber = index + 1;
            } else if (currentPage <= 3) {
              pageNumber = index + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNumber = totalPages - 4 + index;
            } else {
              pageNumber = currentPage - 2 + index;
            }
            
            return (
              <PaginationItem key={pageNumber}>
                <PaginationLink
                  isActive={pageNumber === currentPage}
                  onClick={() => handlePageChange(pageNumber)}
                  className="cursor-pointer"
                >
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            );
          })}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto w-full px-3 py-6 sm:p-6 min-w-0">
        <div className="text-center py-8 sm:py-12">
          <Loader2 className="w-8 h-8 text-[#00A991] animate-spin mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Загрузка заказов</h3>
          <p className="text-sm sm:text-base text-gray-600">Пожалуйста, подождите...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto w-full px-3 py-6 sm:p-6 min-w-0">
        <Card className="rounded-xl border-red-200 bg-white">
          <CardContent className="text-center py-8 sm:py-12 px-4">
            <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchOrders} className="bg-[#00A991] hover:bg-[#009882] rounded-full px-5 py-2.5">
              <Loader2 className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Фильтрация заказов по активному разделу
  const getFilteredOrders = () => {
    switch (activeTab) {
      case COURIER_SECTIONS.NEW:
        return orders.PENDING || [];
      case COURIER_SECTIONS.IN_PROGRESS:
        return orders.IN_PROGRESS || [];
      case COURIER_SECTIONS.COMPLETED:
        return deliveredOrders.results || [];
      default:
        return [];
    }
  };

  const filteredOrders = getFilteredOrders();
  const isLoadingCurrentTab = activeTab === COURIER_SECTIONS.COMPLETED ? isDeliveredLoading : isLoading;

  return (
    <div className="max-w-7xl mx-auto w-full px-3 py-4 sm:px-4 sm:py-5 md:p-6 space-y-4 sm:space-y-6 min-w-0">
      {/* Header */}
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Мои заказы</h1>
        <p className="text-sm sm:text-base text-gray-600">Управление заказами на перевозку</p>
      </div>

      {/* Табы — на мобильных горизонтальный скролл */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="bg-white px-2 py-3 sm:py-4 rounded-[32px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] h-auto inline-flex w-max min-w-full sm:min-w-0 sm:w-full mb-4">
            <TabsTrigger
              value={COURIER_SECTIONS.NEW}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base whitespace-nowrap data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors touch-manipulation"
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Новые</span>
              {orders.PENDING?.length > 0 && (
                <Badge variant="outline" className="ml-0.5 text-xs px-1.5 py-0">
                  {orders.PENDING.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value={COURIER_SECTIONS.IN_PROGRESS}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base whitespace-nowrap data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors touch-manipulation"
            >
              <Truck className="w-4 h-4 flex-shrink-0" />
              <span>В работе</span>
              {orders.IN_PROGRESS?.length > 0 && (
                <Badge variant="outline" className="ml-0.5 text-xs px-1.5 py-0">
                  {orders.IN_PROGRESS.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value={COURIER_SECTIONS.COMPLETED}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-sm sm:text-base whitespace-nowrap data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors touch-manipulation"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Завершённые</span>
              {deliveredOrders.total > 0 && (
                <Badge variant="outline" className="ml-0.5 text-xs px-1.5 py-0">
                  {deliveredOrders.total}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Контент табов */}
        <TabsContent value={COURIER_SECTIONS.NEW} className="mt-4 sm:mt-6">
          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <Loader2 className="w-8 h-8 text-[#00A991] animate-spin mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Загрузка заказов...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="rounded-xl border-dashed border-2 border-gray-200 bg-white">
              <CardContent className="text-center py-8 sm:py-12 px-4">
                <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-500 mb-1 sm:mb-2">Нет новых заказов</p>
                <p className="text-sm text-gray-400">Все заказы, которые ещё никто не принял, появятся здесь</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredOrders.map((order) => (
                <OrderCard 
                  key={order.movingOrderId} 
                  order={order} 
                  onStatusChange={() => {
                    fetchOrders();
                    fetchDeliveredOrders(deliveredOrders.page);
                  }}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value={COURIER_SECTIONS.IN_PROGRESS} className="mt-4 sm:mt-6">
          {isLoading ? (
            <div className="text-center py-8 sm:py-12">
              <Loader2 className="w-8 h-8 text-[#00A991] animate-spin mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Загрузка заказов...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="rounded-xl border-dashed border-2 border-gray-200 bg-white">
              <CardContent className="text-center py-8 sm:py-12 px-4">
                <Truck className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-500 mb-1 sm:mb-2">Нет заказов в работе</p>
                <p className="text-sm text-gray-400">Принятые, но не завершённые доставки появятся здесь</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredOrders.map((order) => (
                <OrderCard 
                  key={order.movingOrderId} 
                  order={order} 
                  onStatusChange={() => {
                    fetchOrders();
                    fetchDeliveredOrders(deliveredOrders.page);
                  }}
                  isLoading={isLoading}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value={COURIER_SECTIONS.COMPLETED} className="mt-4 sm:mt-6">
          {isDeliveredLoading ? (
            <div className="text-center py-8 sm:py-12">
              <Loader2 className="w-8 h-8 text-[#00A991] animate-spin mx-auto mb-4" />
              <p className="text-sm sm:text-base text-gray-600">Загрузка заказов...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <Card className="rounded-xl border-dashed border-2 border-gray-200 bg-white">
              <CardContent className="text-center py-8 sm:py-12 px-4">
                <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                <p className="text-base sm:text-lg font-medium text-gray-500 mb-1 sm:mb-2">Нет завершённых заказов</p>
                <p className="text-sm text-gray-400">Завершённые доставки появятся здесь</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard 
                    key={order.movingOrderId} 
                    order={order} 
                    onStatusChange={() => {
                      fetchOrders();
                      fetchDeliveredOrders(deliveredOrders.page);
                    }}
                    isLoading={isDeliveredLoading}
                    isDelivered={true}
                  />
                ))}
              </div>
              
              {/* Пагинация для завершённых */}
              {activeTab === COURIER_SECTIONS.COMPLETED && renderPagination()}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CourierRequest;