import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { api } from '../../../shared/api/axios';
import { 
  Truck, 
  Package, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Loader2,
  AlertCircle,
  ArrowRight,
  User,
  Building
} from 'lucide-react';
import { toast } from 'react-toastify';

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

const OrderCard = ({ order, onStatusChange, isLoading = false }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/personal-account/courier/order/${order.movingOrderId}`);
  };

  const handleAction = async (e) => {
    e.stopPropagation();
    
    try {
      if (order.status === 'PENDING_FROM' || order.status === 'PENDING_TO') {
        await api.put(`/moving/${order.movingOrderId}`, {
          id: order.movingOrderId,
          status: 'IN_PROGRESS',
        });
        toast.success('Заказ принят в работу');
      } else if (order.status === 'IN_PROGRESS') {
        await api.put(`/moving/${order.movingOrderId}`, {
          id: order.movingOrderId,
          status: 'DELIVERED',
        });
        toast.success('Заказ завершён');
      } else if (order.status === 'DELIVERED') {
        await api.delete(`/moving/${order.movingOrderId}`);
        toast.success('Заказ удалён');
      }
      onStatusChange();
    } catch (error) {
      console.error('Ошибка при изменении статуса заказа:', error);
      toast.error('Ошибка при изменении статуса заказа');
    }
  };

  const getActionButton = () => {
    if (order.status === 'PENDING_FROM' || order.status === 'PENDING_TO') {
      return (
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          className="bg-[#1e2c4f] hover:bg-[#1e2c4f]/90 text-white h-8 text-xs"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Принять'}
        </Button>
      );
    }
    if (order.status === 'IN_PROGRESS') {
      return (
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Завершить'}
        </Button>
      );
    }
    if (order.status === 'DELIVERED') {
      return (
        <Button 
          onClick={handleAction} 
          disabled={isLoading}
          variant="destructive" 
          className="h-8 text-xs"
        >
          {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Удалить'}
        </Button>
      );
    }
    return null;
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'PENDING_FROM':
      case 'PENDING_TO':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Ожидает</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800">В работе</Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800">Выполнен</Badge>;
      default:
        return <Badge variant="outline">Неизвестно</Badge>;
    }
  };

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
          <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#1e2c4f] transition-colors" />
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
        
        {/* Кнопка действия */}
        <div className="flex justify-end">
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
};

const CourierRequest = () => {
  const [orders, setOrders] = useState({
    PENDING: [],
    IN_PROGRESS: [],
    DELIVERED: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const results = await Promise.all([
        api.get('/moving/status/PENDING_FROM'),
        api.get('/moving/status/PENDING_TO'),
        api.get('/moving/status/IN_PROGRESS'),
        api.get('/moving/status/DELIVERED'),
      ]);

      // Фильтрация по availability
      const filterAvailable = (orders) =>
        orders.filter((order) => order.availability === 'AVAILABLE');

      const newOrders = {
        PENDING: filterAvailable([...results[0].data, ...results[1].data]),
        IN_PROGRESS: filterAvailable(results[2].data),
        DELIVERED: filterAvailable(results[3].data),
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

  useEffect(() => {
    fetchOrders();
  }, []);

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

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Мои заказы</h1>
        <p className="text-gray-600">Управление заказами на перевозку</p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {columns.map((col) => {
          const Icon = col.icon;
          const count = orders[col.status]?.length || 0;
          
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
        {columns.map((col) => {
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
                      onStatusChange={fetchOrders}
                      isLoading={isLoading}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CourierRequest;