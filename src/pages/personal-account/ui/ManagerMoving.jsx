import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import {
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../../components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '../../../components/ui/pagination';
import { api, getDeliveredOrdersPaginated } from '../../../shared/api/axios';
import { usersApi } from '../../../shared/api/usersApi';
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  Loader2,
  AlertCircle,
  User,
  Building,
  Phone
} from 'lucide-react';
import { showSuccessToast, showErrorToast } from '../../../shared/lib/toast';
// --- Moving statuses helpers ---
const MOVING_STATUS_TEXT = {
  PENDING:   'Ожидает доставки',
  COURIER_ASSIGNED: 'Курьер назначен',
  COURIER_IN_TRANSIT: 'Курьер в пути',
  COURIER_AT_CLIENT: 'Курьер у клиента',
  IN_PROGRESS:    'В пути',
  DELIVERED:      'Доставлено',
  FINISHED:       'Завершено',
  CANCELLED:      'Отменён',
};

const getMovingStatusText = (s, direction) => {
  const baseText = MOVING_STATUS_TEXT[s] || s;
  if (s === 'PENDING') {
    return direction === 'TO_CLIENT' ? 'Ожидает доставки' : 'Ожидает доставки';
  }
  if (s === 'IN_PROGRESS') {
    return direction === 'TO_CLIENT' ? 'В пути к клиенту' : 'В пути к складу';
  }
  if (s === 'DELIVERED') {
    return direction === 'TO_CLIENT' ? 'Доставлено клиенту' : 'Доставлено на склад';
  }
  return baseText;
};

const MANAGER_SECTIONS = {
  NEW: 'new',
  IN_PROGRESS: 'inProgress',
  COMPLETED: 'completed',
};

const OrderCard = ({ order, isLoading = false, isDelivered = false, onCourierAssign }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/admin/moving/order/${order.movingOrderId}`);
  };

  const handleAssignCourierClick = (e) => {
    e.stopPropagation();
    if (onCourierAssign) onCourierAssign(order);
  };

  const getActionButton = () => {
    if (order.status === 'PENDING' && !order.courier) {
      return (
        <Button
          onClick={handleAssignCourierClick}
          disabled={isLoading}
          className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-4 py-2"
        >
          Назначить курьера
        </Button>
      );
    }
    return null;
  };

  return (
    <Card
      className="group cursor-pointer hover:shadow-md active:scale-[0.99] transition-all duration-200 bg-white rounded-xl border border-gray-200 min-w-0"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between mb-4">
          <CardTitle className="text-lg font-bold text-gray-900">
            Заказ №{order.movingOrderId}
          </CardTitle>
        </div>

        {order.status && (
          <div className="mb-3">
            <Badge variant="outline" className="text-xs px-2 py-1 bg-[#00A991]/10 text-[#00A991] border-[#00A991]/20">
              {getMovingStatusText(order.status, order.direction)}
            </Badge>
          </div>
        )}

        {order.userName && (
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{order.userName}</span>
          </div>
        )}

        {order.userPhone && (
          <div className="flex items-center gap-2 mb-2">
            <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{order.userPhone}</span>
          </div>
        )}

        <div className="flex items-start gap-2 mb-2">
          <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">{order?.userAddress || 'Адрес не указан'}</span>
        </div>

        <div className="flex items-start gap-2 mb-2">
          <Building className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
          <span className="text-sm text-gray-700">
            {order?.warehouseName
              ? `${order.warehouseName}${order?.warehouseAddress ? `, ${order.warehouseAddress}` : ''}`
              : (order?.warehouseAddress || 'Не указан')}
          </span>
        </div>

        {order?.courier && (
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {order.courier.name}
              {order.courier.phone && ` • ${order.courier.phone}`}
            </span>
          </div>
        )}

        {order?.storageName && (
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{order.storageName}</span>
          </div>
        )}

        {order?.delivery_time_interval && (
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">{order.delivery_time_interval}</span>
          </div>
        )}

        {order?.direction && (
          <div className="flex items-center gap-2 mb-4">
            <Truck className="w-4 h-4 text-[#00A991] flex-shrink-0" />
            <span className="text-sm text-gray-700">
              {order.direction === 'TO_CLIENT' ? 'К клиенту' : 'К складу'}
            </span>
          </div>
        )}

        <div className="flex justify-end pt-2">
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
};

const ManagerMoving = () => {
  const [activeTab, setActiveTab] = useState(MANAGER_SECTIONS.NEW);
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
  const [courierModalOpen, setCourierModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [couriers, setCouriers] = useState([]);
  const [isLoadingCouriers, setIsLoadingCouriers] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);


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

      // Фильтрация по availability
      const filterAvailable = (orders) =>
          orders.filter((order) => order.availability === 'AVAILABLE');

      const newOrders = {
        PENDING: filterAvailable([
          ...results[0].data,  // PENDING
          ...results[1].data,  // COURIER_ASSIGNED
        ]),
        IN_PROGRESS: filterAvailable([
          ...results[2].data,  // COURIER_IN_TRANSIT
          ...results[3].data,  // COURIER_AT_CLIENT
          ...results[4].data,  // IN_PROGRESS
        ]),
      };

      setOrders(newOrders);
    } catch (err) {
      console.error('Ошибка при загрузке заказов:', err);
      setError('Не удалось загрузить заказы. Попробуйте позже.');
      showErrorToast('Ошибка загрузки заказов');
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

  // Загрузка списка курьеров
  const fetchCouriers = async () => {
    try {
      setIsLoadingCouriers(true);
      const data = await usersApi.getCouriers();
      setCouriers(data || []);
    } catch (err) {
      console.error('Ошибка при загрузке курьеров:', err);
      showErrorToast('Ошибка загрузки списка курьеров');
    } finally {
      setIsLoadingCouriers(false);
    }
  };

  // Обработчик открытия модального окна назначения курьера
  const handleAssignCourier = (order) => {
    setSelectedOrder(order);
    if (couriers.length === 0) {
      fetchCouriers();
    }
    setCourierModalOpen(true);
  };

  // Обработчик назначения курьера
  const handleCourierSelect = async (courierId) => {
    if (!selectedOrder) return;

    try {
      setIsAssigning(true);
      await api.put(`/moving/${selectedOrder.movingOrderId}`, {
        courier_id: courierId,
        status: 'COURIER_ASSIGNED'
      });
      
      showSuccessToast('Курьер успешно назначен');
      setCourierModalOpen(false);
      setSelectedOrder(null);
      fetchOrders(); // Обновляем список заказов
    } catch (error) {
      console.error('Ошибка при назначении курьера:', error);
      showErrorToast('Не удалось назначить курьера');
    } finally {
      setIsAssigning(false);
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

  const getFilteredOrders = () => {
    switch (activeTab) {
      case MANAGER_SECTIONS.NEW:
        return orders.PENDING || [];
      case MANAGER_SECTIONS.IN_PROGRESS:
        return orders.IN_PROGRESS || [];
      case MANAGER_SECTIONS.COMPLETED:
        return deliveredOrders.results || [];
      default:
        return [];
    }
  };

  const filteredOrders = getFilteredOrders();

  return (
    <div className="max-w-7xl mx-auto w-full px-3 py-4 sm:px-4 sm:py-5 md:p-6 space-y-4 sm:space-y-6 min-w-0">
      <div className="space-y-1 sm:space-y-2">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">Заказы на перевозку</h1>
        <p className="text-sm sm:text-base text-gray-600">Управление заказами на перевозку</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <TabsList className="bg-white px-2 py-3 sm:py-4 rounded-[32px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] h-auto inline-flex w-max min-w-full sm:min-w-0 sm:w-full mb-4">
            <TabsTrigger
              value={MANAGER_SECTIONS.NEW}
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
              value={MANAGER_SECTIONS.IN_PROGRESS}
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
              value={MANAGER_SECTIONS.COMPLETED}
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

        <TabsContent value={MANAGER_SECTIONS.NEW} className="mt-4 sm:mt-6">
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
                <p className="text-sm text-gray-400">Заказы, ожидающие назначения курьера, появятся здесь</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.movingOrderId}
                  order={order}
                  isLoading={isLoading}
                  onCourierAssign={handleAssignCourier}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value={MANAGER_SECTIONS.IN_PROGRESS} className="mt-4 sm:mt-6">
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
                <p className="text-sm text-gray-400">Заказы в процессе доставки появятся здесь</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.movingOrderId}
                  order={order}
                  isLoading={isLoading}
                  onCourierAssign={handleAssignCourier}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value={MANAGER_SECTIONS.COMPLETED} className="mt-4 sm:mt-6">
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
                    isLoading={isDeliveredLoading}
                    isDelivered={true}
                  />
                ))}
              </div>
              {activeTab === MANAGER_SECTIONS.COMPLETED && renderPagination()}
            </>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={courierModalOpen} onOpenChange={setCourierModalOpen}>
        <DialogContent className="max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle>Назначить курьера</DialogTitle>
            <DialogDescription>
              Выберите курьера для заказа №{selectedOrder?.movingOrderId}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-4 max-h-96 overflow-y-auto">
            {isLoadingCouriers ? (
              <div className="text-center py-8">
                <Loader2 className="w-6 h-6 text-[#00A991] animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Загрузка курьеров...</p>
              </div>
            ) : couriers.length === 0 ? (
              <p className="text-center py-8 text-gray-500">Нет доступных курьеров</p>
            ) : (
              couriers.map((courier) => (
                <Button
                  key={courier.id}
                  onClick={() => handleCourierSelect(courier.id)}
                  className="w-full justify-start text-left h-auto py-3 px-4"
                  variant="outline"
                  disabled={isAssigning}
                >
                  <User className="w-5 h-5 mr-3 text-[#00A991]" />
                  <div className="flex-1">
                    <p className="font-medium">{courier.name || 'Без имени'}</p>
                    {courier.phone && (
                      <p className="text-sm text-gray-500">{courier.phone}</p>
                    )}
                  </div>
                </Button>
              ))
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCourierModalOpen(false)}
              disabled={isAssigning}
            >
              Отмена
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerMoving;