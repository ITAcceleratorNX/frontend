import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
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
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Loader2,
  AlertCircle,
  User,
  Building
} from 'lucide-react';
import { toast } from 'react-toastify';
// --- Moving statuses helpers ---
const MOVING_STATUS_TEXT = {
  PENDING_FROM:   'Ожидает забора',
  PENDING_TO:     'Ожидает доставки',
  IN_PROGRESS:    'В работе (к складу)',
  IN_PROGRESS_TO: 'В работе (к клиенту)',
  DELIVERED:      'Доставлено на склад',
  DELIVERED_TO:   'Доставлено клиенту',
  CANCELLED:      'Отменён',
};

const getMovingStatusText = (s) => MOVING_STATUS_TEXT[s] || s;

const getMovingStatusBadgeClass = (s) => {
  if (s === 'CANCELLED') return 'bg-red-100 text-red-800 border border-red-200';
  if (s === 'DELIVERED' || s === 'DELIVERED_TO') return 'bg-green-100 text-green-800 border border-green-200';
  if (s === 'IN_PROGRESS' || s === 'IN_PROGRESS_TO') return 'bg-blue-100 text-blue-800 border border-blue-200';
  if (s === 'PENDING_FROM' || s === 'PENDING_TO') return 'bg-amber-100 text-amber-800 border border-amber-200';
  return 'bg-gray-100 text-gray-700 border border-gray-200';
};
const columns = [
  { 
    title: 'Ожидает грузчика', 
    status: 'PENDING',
    icon: Clock,
    color: 'from-orange-50 to-amber-50',
    borderColor: 'border-orange-200'
  },
  { 
    title: 'В процессе доставки', 
    status: 'IN_PROGRESS',
    icon: Truck,
    color: 'from-blue-50 to-indigo-50', 
    borderColor: 'border-blue-200'
  },
  { 
    title: 'Завершённые заказы', 
    status: 'DELIVERED',
    icon: CheckCircle2,
    color: 'from-green-50 to-emerald-50',
    borderColor: 'border-green-200'
  },
];

const OrderCard = ({ order, isLoading = false, isDelivered = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/admin/moving/order/${order.movingOrderId}`);
  };

  // Админ только просматривает - никаких кнопок действий
  const getActionButton = () => {
    return null;
  };

  const getStatusBadge = () => (
      <Badge className={`text-xs ${getMovingStatusBadgeClass(order.status)}`}>
        {getMovingStatusText(order.status)}
      </Badge>
  );


  return (
    <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-[#1e2c4f]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CardTitle className="text-lg text-[#1e2c4f] flex items-center gap-2">
              <Package className="w-4 h-4" />
              Заказ #{order.movingOrderId}
            </CardTitle>
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4" onClick={handleCardClick}>
        {/* Адреса */}
        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm">
            <User className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-600">Клиент:</span>
              <p className="font-medium text-gray-900">{order?.userAddress || 'Не указан'}</p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 text-sm">
            <Building className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-600">Склад:</span>
              <p className="font-medium text-gray-900">{order?.warehouseAddress || 'Не указан'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
            <div>
              <span className="text-gray-600">Хранилище:</span>
              <p className="font-medium text-gray-900">{order?.storageName || 'Не указано'}</p>
            </div>
          </div>
        </div>

        <Separator />
        
        {/* Кнопка действия - для админа всегда null */}
        <div className="flex justify-end">
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminMoving = () => {
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
        api.get('/moving/status/PENDING_FROM'),
        api.get('/moving/status/PENDING_TO'),
        api.get('/moving/status/IN_PROGRESS'),
        api.get('/moving/status/IN_PROGRESS_TO'),
      ]);

      // Фильтрация по availability
      const filterAvailable = (orders) =>
        orders.filter((order) => order.availability === 'AVAILABLE');

      const newOrders = {
        PENDING: filterAvailable([...results[0].data, ...results[1].data]),
        IN_PROGRESS: filterAvailable([...results[2].data, ...results[3].data]),
      };

      setOrders(newOrders);
    } catch (err) {
      console.error('Ошибка при загрузке заказов:', err);
      setError('Не удалось загрузить заказы. Попробуйте позже.');
      toast.error('Ошибка загрузки заказов');
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
      toast.error('Ошибка загрузки завершённых заказов');
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
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-[#1e2c4f] animate-spin mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Загрузка заказов</h3>
          <p className="text-gray-600">Пожалуйста, подождите...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Card className="border-red-200">
          <CardContent className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={fetchOrders} className="bg-[#1e2c4f] hover:bg-[#1e2c4f]/90">
              <Loader2 className="w-4 h-4 mr-2" />
              Попробовать снова
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Обновляем статистику
  const allOrders = {
    PENDING: orders.PENDING || [],
    IN_PROGRESS: orders.IN_PROGRESS || [],
    DELIVERED: deliveredOrders.results || [],
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Все заказы на перевозку</h1>
        <p className="text-gray-600">Просмотр заказов на перевозку (только чтение)</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {columns.map((col) => {
          const Icon = col.icon;
          const count = col.status === 'DELIVERED' 
            ? deliveredOrders.total 
            : allOrders[col.status]?.length || 0;
          
          return (
            <Card key={col.status} className={`bg-gradient-to-br ${col.color} ${col.borderColor} border`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{col.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <Icon className="w-8 h-8 text-[#1e2c4f]" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Колонки заказов */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Колонки для ожидающих и в процессе */}
        {columns.slice(0, 2).map((col) => {
          const Icon = col.icon;
          const columnOrders = orders[col.status] || [];
          
          return (
            <div key={col.status} className="space-y-4">
              <Card className={`bg-gradient-to-br ${col.color} ${col.borderColor} border`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-[#1e2c4f]">
                    <Icon className="w-5 h-5" />
                    {col.title}
                    <Badge variant="outline" className="ml-auto">
                      {columnOrders.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
              </Card>

              <div className="space-y-4">
                {columnOrders.length === 0 ? (
                  <Card className="border-dashed border-2 border-gray-200">
                    <CardContent className="text-center py-8">
                      <Icon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Нет заказов</p>
                    </CardContent>
                  </Card>
                ) : (
                  columnOrders.map((order) => (
                    <OrderCard 
                      key={order.movingOrderId} 
                      order={order} 
                      isLoading={isLoading}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {/* Колонка для завершённых заказов с пагинацией */}
        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 border">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#1e2c4f]">
                <CheckCircle2 className="w-5 h-5" />
                Завершённые заказы
                <Badge variant="outline" className="ml-auto">
                  {deliveredOrders.total}
                </Badge>
              </CardTitle>
            </CardHeader>
          </Card>

          <div className="space-y-4">
            {isDeliveredLoading ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="text-center py-8">
                  <Loader2 className="w-8 h-8 text-[#1e2c4f] animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Загрузка...</p>
                </CardContent>
              </Card>
            ) : deliveredOrders.results.length === 0 ? (
              <Card className="border-dashed border-2 border-gray-200">
                <CardContent className="text-center py-8">
                  <CheckCircle2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Нет завершённых заказов</p>
                </CardContent>
              </Card>
            ) : (
              <>
                {deliveredOrders.results.map((order) => (
                  <OrderCard 
                    key={order.movingOrderId} 
                    order={order} 
                    isLoading={isDeliveredLoading}
                    isDelivered={true}
                  />
                ))}
                
                {/* Пагинация */}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminMoving;