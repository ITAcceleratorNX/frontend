// CourierRequestOrder.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Separator } from '../../../components/ui/separator';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../../components/ui/dialog';
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
  Play,
  FileText,
  Box,
  Phone,
  Download,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useDownloadItemFile } from '../../../shared/lib/hooks/use-orders';
import EditLocationModal from './EditLocationModal';

const CourierRequestOrder = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const downloadItemFile = useDownloadItemFile();

  // Проблемные статусы для курьера
  const issueStatuses = [
    { value: 'CLIENT_NOT_RESPONDING', label: 'Клиент не отвечает' },
    { value: 'WRONG_ADDRESS', label: 'Неверный адрес' },
    { value: 'CLIENT_RESCHEDULED', label: 'Клиент перенёс время' },
  ];

  const handleIssueStatusChange = async (issueStatus) => {
    if (!order) return;

    try {
      setIsUpdating(true);
      await api.put(`/moving/${orderId}`, {
        id: orderId,
        issue_status: issueStatus,
      });
      
      setOrder(prev => ({ ...prev, issue_status: issueStatus }));
      setIsIssueModalOpen(false);
      toast.success('Проблемная ситуация отмечена');
    } catch (err) {
      console.error('Ошибка при обновлении проблемного статуса:', err);
      toast.error('Ошибка при обновлении статуса');
    } finally {
      setIsUpdating(false);
    }
  };

  // Функция для обработки навигации в сайдбаре
  const handleNavClick = (navKey) => {
    navigate('/personal-account', { state: { activeSection: navKey } });
  };

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

  // Обработчик открытия модалки редактирования локации
  const handleEditLocation = (item) => {
    setSelectedItem(item);
    setIsLocationModalOpen(true);
  };

  // Обработчик обновления локации
  const handleLocationUpdated = (updatedItem) => {
    setOrder(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === updatedItem.id 
          ? { ...item, location: updatedItem.physical_location }
          : item
      )
    }));
  };

  const handleActionClick = async () => {
    if (!order) return;

    try {
      setIsUpdating(true);

      if (order.status === 'DELIVERED' || order.status === 'FINISHED') {
        toast.info('Завершённые заказы нельзя изменить');
        return;
      }

      let newStatus;
       if (order.status === 'PENDING') {
        newStatus = 'COURIER_ASSIGNED';
        toast.success('Заказ принят в работу');
      } else if (order.status === 'COURIER_ASSIGNED') {
        newStatus = 'COURIER_IN_TRANSIT';
        toast.success('Курьер в пути');
      } else if (order.status === 'COURIER_IN_TRANSIT') {
        newStatus = 'COURIER_AT_CLIENT';
        toast.success('Статус обновлен: Курьер у клиента');
      } else if (order.status === 'COURIER_AT_CLIENT') {
        newStatus = 'IN_PROGRESS';
        toast.success('Статус обновлен: В пути');
      } else if (order.status === 'IN_PROGRESS') {
        newStatus = 'DELIVERED';
        toast.success('Заказ завершён');
      } else {
        return;
      }

      await api.put(`/moving/${orderId}`, {
        id: orderId,
        status: newStatus,
      });

      setOrder(prev => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error('Ошибка при обновлении заказа:', err);
      toast.error('Ошибка при изменении статуса заказа');
    } finally {
      setIsUpdating(false);
    }
  };

  const getActionButton = () => {
    if (!order) return null;

    const buttonProps = {
      onClick: handleActionClick,
      disabled: isUpdating,
      className: "flex items-center gap-2"
    };

     if (order.status === 'PENDING') {
      return (
        <Button {...buttonProps} className="bg-[#1e2c4f] hover:bg-[#1e2c4f]/90 text-white">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Принять заказ
        </Button>
      );
    }
    if (order.status === 'COURIER_ASSIGNED') {
      return (
        <Button {...buttonProps} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
          {order.direction === 'TO_CLIENT' ? 'Еду к клиенту' : 'Еду к вам'}
        </Button>
      );
    }
    if (order.status === 'COURIER_IN_TRANSIT') {
      return (
        <Button {...buttonProps} className="bg-purple-600 hover:bg-purple-700 text-white">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
          Прибыл к клиенту
        </Button>
      );
    }
    if (order.status === 'COURIER_AT_CLIENT') {
      return (
        <Button {...buttonProps} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Box className="w-4 h-4" />}
          {order.direction === 'TO_CLIENT' ? 'Оставил вещи' : 'Забрал вещи'}
        </Button>
      );
    }
    if (order.status === 'IN_PROGRESS') {
      return (
        <Button {...buttonProps} className="bg-green-600 hover:bg-green-700 text-white">
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
          Завершить
        </Button>
      );
    }
    if (order.status === 'DELIVERED' || order.status === 'FINISHED') {
      return null;
    }
    return null;
  };

  const getStatusBadge = () => {
    if (!order) return null;

    switch (order.status) {
      case 'PENDING':
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {order.direction === 'TO_CLIENT' ? 'Ожидает на складе' : 'Ожидает назначения курьера'}
        </Badge>;
      case 'COURIER_ASSIGNED':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <User className="w-3 h-3" />
          Курьер назначен
        </Badge>;
      case 'COURIER_IN_TRANSIT':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Truck className="w-3 h-3" />
          Курьер в пути {order.direction === 'TO_CLIENT' ? 'к клиенту' : 'к вам'}
        </Badge>;
      case 'COURIER_AT_CLIENT':
        return <Badge className="bg-purple-100 text-purple-800 flex items-center gap-1">
          <User className="w-3 h-3" />
          Курьер у клиента
        </Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
          <Truck className="w-3 h-3" />
          {order.direction === 'TO_CLIENT' ? 'В пути к клиенту' : 'В пути к складу'}
        </Badge>;
      case 'DELIVERED':
        return <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          {order.direction === 'TO_CLIENT' ? 'Доставлено клиенту' : 'Доставлено на склад'}
        </Badge>;
      case 'FINISHED':
        return <Badge className="bg-gray-100 text-gray-800 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Завершено
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
          <Sidebar activeNav="courierrequests" setActiveNav={handleNavClick} />
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
          <Sidebar activeNav="courierrequests" setActiveNav={handleNavClick} />
          <main className="flex-1 mr-[110px]">
            <div className="max-w-5xl mx-auto py-12 px-10">
              <Card className="border-red-200">
                <CardContent className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
                  <p className="text-gray-600 mb-6">{error || 'Заказ не найден'}</p>
                  <Button 
                    onClick={() => navigate('/personal-account', { state: { activeSection: 'courierrequests' } })}
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
        <Sidebar activeNav="courierrequests" setActiveNav={handleNavClick} />
        <main className="flex-1 mr-[110px]">
          <div className="max-w-5xl mx-auto py-12 px-10 space-y-6">
            {/* Навигация назад */}
            <div className="flex items-center gap-4">
              <Button
                onClick={() => navigate('/personal-account', { state: { activeSection: 'courierrequests' } })}
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
                      <p className="text-gray-600">Детали заказа на перевозку</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge()}
                    {order.status !== 'DELIVERED' && order.status !== 'FINISHED' && (
                      <Button
                        variant="outline"
                        onClick={() => setIsIssueModalOpen(true)}
                        className="flex items-center gap-2 text-orange-600 border-orange-200 hover:bg-orange-50"
                      >
                        <AlertTriangle className="w-4 h-4" />
                        Проблема
                      </Button>
                    )}
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
                        <p className="text-gray-700">
                          {order.warehouseName 
                            ? `${order.warehouseName}${order.warehouseAddress ? `, ${order.warehouseAddress}` : ''}` 
                            : (order.warehouseAddress || 'Не указан')}
                        </p>
                      </div>
                    </div>

                    {order.delivery_time_interval && (
                      <>
                        <Separator />
                        <div className="flex items-start gap-2">
                          <Clock className="w-4 h-4 text-gray-500 mt-1 flex-shrink-0" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">Время доставки</p>
                            <p className="text-gray-700">{order.delivery_time_interval}</p>
                          </div>
                        </div>
                      </>
                    )}

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
                {order.serviceDescriptions && Object.keys(order.serviceDescriptions).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-[#1e2c4f]">
                      <FileText className="w-5 h-5" />
                      Услуги
                      <Badge variant="outline" className="ml-auto">
                        {Object.keys(order.serviceDescriptions).length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(order.serviceDescriptions).map(([desc, count], i) => (
                        <div key={i} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{desc} — {count} шт.</span>
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
                          <th className="text-left py-3 px-4 font-medium text-gray-900">ID</th>
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
                                <span className="font-medium text-gray-900">{item.public_id}</span>
                              </div>
                            </td>
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
                              <div className="flex items-center gap-2 justify-end">
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
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLocation(item)}
                                  className="text-[#1e2c4f] hover:bg-[#1e2c4f]/10"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  <span>Местоположение</span>
                                </Button>
                              </div>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                      </table>
                    </div>
                </CardContent>
              </Card>
                )}

            {/* Модальное окно редактирования локации */}
            <EditLocationModal
              isOpen={isLocationModalOpen}
              onClose={() => setIsLocationModalOpen(false)}
              item={selectedItem}
              onLocationUpdated={handleLocationUpdated}
            />

            {/* Модальное окно выбора проблемного статуса */}
            <Dialog open={isIssueModalOpen} onOpenChange={setIsIssueModalOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Отметить проблемную ситуацию</DialogTitle>
                  <DialogDescription>
                    Выберите проблему, с которой вы столкнулись при выполнении заказа
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-4">
                  {issueStatuses.map((issue) => (
                    <Button
                      key={issue.value}
                      onClick={() => handleIssueStatusChange(issue.value)}
                      className="w-full justify-start text-left h-auto py-3 px-4"
                      variant="outline"
                      disabled={isUpdating || order?.issue_status === issue.value}
                    >
                      <AlertTriangle className="w-5 h-5 mr-3 text-orange-600" />
                      <span className="text-lg font-medium">{issue.label}</span>
                      {order?.issue_status === issue.value && (
                        <CheckCircle2 className="w-5 h-5 ml-auto text-green-600" />
                      )}
                    </Button>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsIssueModalOpen(false)}
                    disabled={isUpdating}
                  >
                    Отмена
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </main>
        </div>
      </div>
  );
};

export default CourierRequestOrder;