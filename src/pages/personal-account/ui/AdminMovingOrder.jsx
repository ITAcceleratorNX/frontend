import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { api } from '../../../shared/api/axios';
import { 
  ArrowLeft, 
  Package, 
  MapPin, 
  Building, 
  User, 
  Truck, 
  CheckCircle2, 
  Clock,
  Loader2,
  AlertCircle,
  FileText,
  Box,
  Phone,
  Download
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useDownloadItemFile } from '../../../shared/lib/hooks/use-orders';

const AdminMovingOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const downloadItemFile = useDownloadItemFile();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await api.get(`/moving/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error('Ошибка при загрузке заказа:', err);
        setError('Не удалось загрузить данные заказа');
        toast.error('Ошибка загрузки заказа');
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleDownloadItem = (itemId) => {
    downloadItemFile.mutate(itemId);
  };

  // Админ только просматривает - никаких кнопок действий
  const getActionButton = () => {
    return null;
  };

  const getStatusBadge = () => {
    if (!order) return null;

    switch (order.status) {
      case 'PENDING_FROM':
      case 'PENDING_TO':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Ожидает принятия
        </Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Truck className="w-3 h-3" />
          В работе
        </Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Выполнен
        </Badge>;
      default:
        return <Badge variant="outline">Неизвестный статус</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav="adminmoving" setActiveNav={() => {}} />
          <main className="flex-1 mr-[110px]">
            <div className="max-w-5xl mx-auto py-12 px-10">
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-[#1e2c4f] animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Загрузка заказа</h3>
                <p className="text-gray-600">Пожалуйста, подождите...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav="adminmoving" setActiveNav={() => {}} />
          <main className="flex-1 mr-[110px]">
            <div className="max-w-5xl mx-auto py-12 px-10">
              <Card className="border-red-200">
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
                  <p className="text-gray-600 mb-6">{error || 'Заказ не найден'}</p>
                  <Button 
                    onClick={() => navigate('/personal-account', { state: { activeSection: 'adminmoving' } })}
                    className="bg-[#1e2c4f] hover:bg-[#1e2c4f]/90"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Вернуться к заказам
                  </Button>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeNav="adminmoving" setActiveNav={() => {}} />
        <main className="flex-1 mr-[110px]">
          <div className="max-w-5xl mx-auto py-12 px-10 space-y-6">
            {/* Навигация назад */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/personal-account', { state: { activeSection: 'adminmoving' } })}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Назад к заказам
              </Button>
            </div>

            {/* Заголовок заказа */}
            <Card className="border-l-4 border-l-[#1e2c4f]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-[#1e2c4f] rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-[#1e2c4f]">
                        Заказ #{order.movingOrderId}
                      </CardTitle>
                      <p className="text-gray-600">Детали заказа на перевозку (просмотр)</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge()}
                    {getActionButton()}
                  </div>
                </div>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Информация об адресах */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1e2c4f]">
                    <MapPin className="w-5 h-5" />
                    Адреса
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {/* Информация о клиенте */}
                    <div className="flex items-start gap-2">
                      <User className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Имя клиента</p>
                        <p className="text-gray-700">{order.userName || 'Не указано'}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Телефон</p>
                        <p className="text-gray-700">{order.userPhone || 'Не указан'}</p>
                      </div>
                    </div>
                    
                    <Separator />

                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Адрес клиента</p>
                        <p className="text-gray-700">{order.userAddress || 'Не указан'}</p>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Склад</p>
                        <p className="text-gray-700">{order.warehouseAddress || 'Не указан'}</p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-2">
                      <Box className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Хранилище</p>
                        <p className="text-gray-700">{order.storageName || 'Не указано'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Услуги */}
              {order.serviceDescriptions?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1e2c4f]">
                      <FileText className="w-5 h-5" />
                      Услуги
                      <Badge variant="outline" className="ml-auto">
                        {order.serviceDescriptions.length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {order.serviceDescriptions.map((desc, i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{desc}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Предметы для перевозки */}
            {order.items?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#1e2c4f]">
                    <Package className="w-5 h-5" />
                    Предметы для перевозки
                    <Badge variant="outline" className="ml-auto">
                      {order.items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Название</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Объём</th>
                          <th className="text-left py-3 px-4 font-medium text-gray-900">Маркировка</th>
                          <th className="text-right py-3 px-4 font-medium text-gray-900">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
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
                                variant={item.cargo_mark === 'HEAVY' ? 'destructive' : 'secondary'}
                                className="text-xs"
                              >
                                {item.cargo_mark}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-[#1e2c4f] hover:bg-[#1e2c4f]/10"
                                onClick={() => handleDownloadItem(item.id)}
                                disabled={downloadItemFile.isPending}
                              >
                                <Download className="w-4 h-4 mr-1" />
                                <span>Скачать</span>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminMovingOrder;