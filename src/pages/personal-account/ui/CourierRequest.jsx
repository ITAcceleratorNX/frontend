import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../components/ui/accordion';
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
  User,
  Building,
  FileText,
  Box
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

  const getCargoMarkText = (mark) => {
    switch (mark) {
      case 'HEAVY':
        return 'Тяжёлое';
      case 'NO':
        return 'Обычное';
      default:
        return mark || 'Не указано';
    }
  };

  const getCargoMarkBadge = (mark) => {
    switch (mark) {
      case 'HEAVY':
        return 'destructive';
      case 'NO':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="border-l-4 border-l-[#1e2c4f] hover:shadow-lg transition-all duration-200">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value={`order-${order.movingOrderId}`} className="border-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-lg text-[#1e2c4f] flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Заказ #{order.movingOrderId}
                </CardTitle>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-2">
                {getActionButton()}
                <AccordionTrigger className="hover:no-underline p-2 hover:bg-gray-100 rounded-lg transition-colors [&[data-state=open]>svg]:rotate-180">
                  <div className="sr-only">Показать подробности</div>
                </AccordionTrigger>
              </div>
            </div>
          </CardHeader>

          <AccordionContent>
            <CardContent className="space-y-6 pt-0">
              {/* Информация об адресах */}
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-blue-700">
                    <MapPin className="w-4 h-4" />
                    Адреса
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Адрес клиента</p>
                        <p className="text-gray-700">{order?.userAddress || 'Не указан'}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Склад</p>
                        <p className="text-gray-700">{order?.warehouseAddress || 'Не указан'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-2">
                      <Box className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Хранилище</p>
                        <p className="text-gray-700">{order?.storageName || 'Не указано'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Услуги */}
              {order.serviceDescriptions?.length > 0 && (
                <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-purple-700">
                      <FileText className="w-4 h-4" />
                      Услуги
                      <Badge variant="outline" className="ml-auto">
                        {order.serviceDescriptions.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {order.serviceDescriptions.map((desc, i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-white rounded-lg border border-purple-100">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Предметы для перевозки */}
              {order.items?.length > 0 && (
                <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2 text-orange-700">
                      <Package className="w-4 h-4" />
                      Предметы для перевозки
                      <Badge variant="outline" className="ml-auto">
                        {order.items.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-orange-200">
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Название</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Объём</th>
                            <th className="text-left py-3 px-4 font-medium text-gray-900">Маркировка</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item) => (
                            <tr key={item.id} className="border-b border-orange-100 hover:bg-orange-50/50">
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Box className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">{item.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <Badge variant="outline" className="font-mono">
                                  {item.volume} м³
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <Badge 
                                  variant={getCargoMarkBadge(item.cargo_mark)}
                                  className="text-xs"
                                >
                                  {getCargoMarkText(item.cargo_mark)}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
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