// CourierRequestOrder.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
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
import { showSuccessToast, showErrorToast, toastCourierStatus } from '../../../shared/lib/toast';
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
      showSuccessToast('Проблемная ситуация отмечена');
    } catch (err) {
      console.error('Ошибка при обновлении проблемного статуса:', err);
      showErrorToast('Ошибка при обновлении статуса');
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
        showErrorToast('Ошибка загрузки заказа');
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
        toastCourierStatus('Завершённые заказы нельзя изменить');
        return;
      }

      let newStatus;
       if (order.status === 'PENDING') {
        newStatus = 'COURIER_ASSIGNED';
        toastCourierStatus('Заказ принят в работу');
      } else if (order.status === 'COURIER_ASSIGNED') {
        newStatus = 'COURIER_IN_TRANSIT';
        toastCourierStatus('Курьер в пути к клиенту');
      } else if (order.status === 'COURIER_IN_TRANSIT') {
        newStatus = 'COURIER_AT_CLIENT';
        toastCourierStatus('Статус обновлен: Курьер у клиента');
      } else if (order.status === 'COURIER_AT_CLIENT') {
        newStatus = 'IN_PROGRESS';
        toastCourierStatus('Статус обновлен: Курьер едет на склад');
      } else if (order.status === 'IN_PROGRESS') {
        newStatus = 'DELIVERED';
        toastCourierStatus('Заказ завершён');
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
      showErrorToast('Ошибка при изменении статуса заказа');
    } finally {
      setIsUpdating(false);
    }
  };

  const getActionButton = () => {
    if (!order) return null;

    const buttonProps = {
      onClick: handleActionClick,
      disabled: isUpdating,
      className: "flex items-center gap-2 rounded-full px-5 py-2.5 bg-[#00A991] hover:bg-[#009882] text-white"
    };

    if (order.status === 'PENDING') {
      return (
        <Button {...buttonProps}>
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
          Принять заказ
        </Button>
      );
    }
    if (order.status === 'COURIER_ASSIGNED') {
      return (
        <Button {...buttonProps}>
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Truck className="w-4 h-4" />}
          {order.direction === 'TO_CLIENT' ? 'Еду к клиенту' : 'Еду к вам'}
        </Button>
      );
    }
    if (order.status === 'COURIER_IN_TRANSIT') {
      return (
        <Button {...buttonProps}>
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <User className="w-4 h-4" />}
          Прибыл к клиенту
        </Button>
      );
    }
    if (order.status === 'COURIER_AT_CLIENT') {
      return (
        <Button {...buttonProps}>
          {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Box className="w-4 h-4" />}
          {order.direction === 'TO_CLIENT' ? 'Оставил вещи' : 'Забрал вещи'}
        </Button>
      );
    }
    if (order.status === 'IN_PROGRESS') {
      return (
        <Button {...buttonProps}>
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

    const badgeBase = "flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-medium";
    switch (order.status) {
      case 'PENDING':
        return <Badge className={`${badgeBase} bg-[#00A991]/15 text-[#004743]`}>
          <Clock className="w-3.5 h-3.5 text-[#00A991]" />
          {order.direction === 'TO_CLIENT' ? 'Ожидает на складе' : 'Ожидает доставки'}
        </Badge>;
      case 'COURIER_ASSIGNED':
        return <Badge className={`${badgeBase} bg-[#00A991]/15 text-[#004743]`}>
          <User className="w-3.5 h-3.5 text-[#00A991]" />
          Курьер назначен
        </Badge>;
      case 'COURIER_IN_TRANSIT':
        return <Badge className={`${badgeBase} bg-[#00A991]/15 text-[#004743]`}>
          <Truck className="w-3.5 h-3.5 text-[#00A991]" />
          Курьер в пути {order.direction === 'TO_CLIENT' ? 'к клиенту' : 'к вам'}
        </Badge>;
      case 'COURIER_AT_CLIENT':
        return <Badge className={`${badgeBase} bg-[#00A991]/15 text-[#004743]`}>
          <User className="w-3.5 h-3.5 text-[#00A991]" />
          Курьер у клиента
        </Badge>;
      case 'IN_PROGRESS':
        return <Badge className={`${badgeBase} bg-[#00A991]/15 text-[#004743]`}>
          <Truck className="w-3.5 h-3.5 text-[#00A991]" />
          {order.direction === 'TO_CLIENT' ? 'В пути к клиенту' : 'В пути к складу'}
        </Badge>;
      case 'DELIVERED':
        return <Badge className={`${badgeBase} bg-[#00A991]/20 text-[#004743]`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#00A991]" />
          {order.direction === 'TO_CLIENT' ? 'Доставлено клиенту' : 'Доставлено на склад'}
        </Badge>;
      case 'FINISHED':
        return <Badge className={`${badgeBase} bg-gray-100 text-gray-700`}>
          <CheckCircle2 className="w-3.5 h-3.5" />
          Завершено
        </Badge>;
      default:
        return <Badge variant="outline" className={badgeBase}>Неизвестный статус</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav="courierrequests" setActiveNav={handleNavClick} />
          <main className="flex-1 min-w-0 md:mr-[110px] bg-gray-50">
            <div className="max-w-5xl mx-auto w-full py-8 px-4 sm:py-12 sm:px-10">
              <div className="text-center py-8 sm:py-12">
                <Loader2 className="w-8 h-8 text-[#00A991] animate-spin mx-auto mb-4" />
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav="courierrequests" setActiveNav={handleNavClick} />
          <main className="flex-1 min-w-0 md:mr-[110px] bg-gray-50">
            <div className="max-w-5xl mx-auto w-full py-8 px-4 sm:py-12 sm:px-10">
              <Card className="border-red-200 rounded-xl shadow-sm bg-white">
                <CardContent className="text-center py-8 sm:py-12 px-4">
                  <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
                  <p className="text-gray-600 mb-6">{error || 'Заказ не найден'}</p>
                  <Button
                    onClick={() => navigate('/personal-account', { state: { activeSection: 'courierrequests' } })}
                    className="bg-[#00A991] hover:bg-[#009882] text-white rounded-full px-5 py-2.5"
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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <div className="flex flex-1">
        <Sidebar activeNav="courierrequests" setActiveNav={handleNavClick} />
        <main className="flex-1 min-w-0 md:mr-[110px] bg-gray-50">
          <div className="max-w-5xl mx-auto w-full py-4 px-3 sm:py-6 sm:px-6 md:py-8 md:px-10 space-y-4 sm:space-y-6">
            {/* Навигация назад */}
            <Button
              onClick={() => navigate('/personal-account', { state: { activeSection: 'courierrequests' } })}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full border-gray-300 text-gray-700 hover:bg-white hover:border-[#00A991] hover:text-[#00A991]"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад к заказам
            </Button>

            {/* Заголовок заказа */}
            <Card className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-[#00A991]/15 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Truck className="w-7 h-7 text-[#00A991]" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-bold text-gray-900">
                        Заказ №{order.movingOrderId}
                      </CardTitle>
                      <p className="text-gray-500 text-sm mt-0.5">Детали заказа на перевозку</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge()}
                    {order.status !== 'DELIVERED' && order.status !== 'FINISHED' && (
                      <Button
                        variant="outline"
                        onClick={() => setIsIssueModalOpen(true)}
                        className="flex items-center gap-2 rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
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
              <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-9 h-9 rounded-lg bg-[#00A991]/15 flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-[#00A991]" />
                    </div>
                    Адреса
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80">
                      <User className="w-4 h-4 text-[#00A991] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Имя клиента</p>
                        <p className="text-gray-900 font-medium">{order.userName || 'Не указано'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80">
                      <Phone className="w-4 h-4 text-[#00A991] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Телефон</p>
                        <p className="text-gray-900 font-medium">{order.userPhone || 'Не указан'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80">
                      <MapPin className="w-4 h-4 text-[#00A991] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Адрес клиента</p>
                        <p className="text-gray-900 font-medium">{order.userAddress || 'Не указан'}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80">
                      <Building className="w-4 h-4 text-[#00A991] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Склад</p>
                        <p className="text-gray-900 font-medium">
                          {order.warehouseName
                            ? `${order.warehouseName}${order.warehouseAddress ? `, ${order.warehouseAddress}` : ''}`
                            : (order.warehouseAddress || 'Не указан')}
                        </p>
                      </div>
                    </div>
                    {order.delivery_time_interval && (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80">
                        <Clock className="w-4 h-4 text-[#00A991] mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Время доставки</p>
                          <p className="text-gray-900 font-medium">{order.delivery_time_interval}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-gray-50/80">
                      <Box className="w-4 h-4 text-[#00A991] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Хранилище</p>
                        <p className="text-gray-900 font-medium">{order.storageName || 'Не указано'}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Услуги */}
              {order.serviceDescriptions && Object.keys(order.serviceDescriptions).length > 0 && (
                <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <div className="w-9 h-9 rounded-lg bg-[#00A991]/15 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-[#00A991]" />
                      </div>
                      Услуги
                      <Badge variant="outline" className="ml-auto rounded-full border-[#00A991]/40 text-[#004743]">
                        {Object.keys(order.serviceDescriptions).length}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {Object.entries(order.serviceDescriptions).map(([desc, count], i) => (
                        <div key={i} className="flex items-center gap-2 p-3 bg-[#00A991]/5 rounded-lg border border-[#00A991]/10">
                          <CheckCircle2 className="w-4 h-4 text-[#00A991] flex-shrink-0" />
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
              <Card className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <div className="w-9 h-9 rounded-lg bg-[#00A991]/15 flex items-center justify-center">
                      <Package className="w-4 h-4 text-[#00A991]" />
                    </div>
                    Предметы для перевозки
                    <Badge variant="outline" className="ml-auto rounded-full border-[#00A991]/40 text-[#004743]">
                      {order.items.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 bg-gray-50/80">
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">ID</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Название</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Объём</th>
                          <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Маркировка</th>
                          <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wide">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.items.map((item) => (
                          <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-[#00A991]/5 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Box className="w-4 h-4 text-[#00A991]/60" />
                                <span className="font-medium text-gray-900">{item.public_id}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="font-medium text-gray-900">{item.name}</span>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="font-mono rounded-full border-gray-300 text-gray-700">
                                {item.volume} м³
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={item.cargo_mark === 'HEAVY' ? 'destructive' : 'secondary'}
                                className="text-xs rounded-full"
                              >
                                {item.cargo_mark}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex items-center gap-2 justify-end">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-[#00A991] hover:bg-[#00A991]/10 rounded-full"
                                  onClick={() => handleDownloadItem(item.id)}
                                  disabled={downloadItemFile.isPending}
                                >
                                  <Download className="w-4 h-4 mr-1" />
                                  Скачать
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditLocation(item)}
                                  className="text-[#00A991] hover:bg-[#00A991]/10 rounded-full"
                                >
                                  <Edit className="w-4 h-4 mr-1" />
                                  Местоположение
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
              <DialogContent className="max-w-md rounded-2xl border-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Отметить проблемную ситуацию</DialogTitle>
                  <DialogDescription className="text-gray-500">
                    Выберите проблему, с которой вы столкнулись при выполнении заказа
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2 py-4">
                  {issueStatuses.map((issue) => (
                    <Button
                      key={issue.value}
                      onClick={() => handleIssueStatusChange(issue.value)}
                      className="w-full justify-start text-left h-auto py-3 px-4 rounded-xl border-gray-200 hover:bg-amber-50 hover:border-amber-200"
                      variant="outline"
                      disabled={isUpdating || order?.issue_status === issue.value}
                    >
                      <AlertTriangle className="w-5 h-5 mr-3 text-amber-600" />
                      <span className="text-base font-medium text-gray-900">{issue.label}</span>
                      {order?.issue_status === issue.value && (
                        <CheckCircle2 className="w-5 h-5 ml-auto text-[#00A991]" />
                      )}
                    </Button>
                  ))}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsIssueModalOpen(false)}
                    disabled={isUpdating}
                    className="rounded-full"
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