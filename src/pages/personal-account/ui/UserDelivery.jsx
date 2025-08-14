import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '../../../components/ui/dialog';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Truck, Package, Clock, MapPin, Edit, Check, AlertTriangle } from 'lucide-react';
import { ordersApi } from '../../../shared/api/ordersApi';
import { toast } from 'react-toastify';

const UserDelivery = () => {
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [editForm, setEditForm] = useState({
        moving_date: '',
        address: ''
    });

    const queryClient = useQueryClient();

    // Получение доставок
    const { data: deliveries = [], isLoading, error, refetch } = useQuery({
        queryKey: ['userDeliveries'],
        queryFn: ordersApi.getUserDeliveries,
        staleTime: 5 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
    });

    // Мутация для обновления доставки
    const updateDeliveryMutation = useMutation({
        mutationFn: ({ movingOrderId, data }) => ordersApi.updateDelivery(movingOrderId, data),
        onSuccess: () => {
            toast.success('Доставка успешно обновлена!');
            queryClient.invalidateQueries({ queryKey: ['userDeliveries'] });
            setEditModalOpen(false);
            setSelectedDelivery(null);
        },
        onError: (error) => {
            console.error('Ошибка при обновлении доставки:', error);
            toast.error('Не удалось обновить доставку');
        }
    });

    // Мутация для подтверждения доставки
    const confirmDeliveryMutation = useMutation({
        mutationFn: (movingOrderId) => ordersApi.confirmDelivery(movingOrderId),
        onSuccess: () => {
            toast.success('Доставка подтверждена!');
            queryClient.invalidateQueries({ queryKey: ['userDeliveries'] });
        },
        onError: (error) => {
            console.error('Ошибка при подтверждении доставки:', error);
            toast.error('Не удалось подтвердить доставку');
        }
    });

    // Функция для получения русского статуса
    const getStatusText = (status) => {
        const statusMap = {
            'PENDING_FROM': '⏳ Ожидает доставки на склад',
            'PENDING_TO': '⏳ Ожидает отправки со склада',
            'IN_PROGRESS': '🚚 В пути к складу',
            'IN_PROGRESS_TO': '🚚 В пути к клиенту',
            'DELIVERED': '✅ Доставлено на склад',
            'DELIVERED_TO': '✅ Доставлено клиенту'
        };
        return statusMap[status] || status;
    };

    // Функция для получения цвета статуса
    const getStatusColor = (status) => {
        const colorMap = {
            PENDING_FROM:   'bg-yellow-100 text-yellow-700 border-yellow-200',
            PENDING_TO:     'bg-blue-100 text-blue-700 border-blue-200',
            IN_PROGRESS:    'bg-orange-100 text-orange-700 border-orange-200',
            IN_PROGRESS_TO: 'bg-orange-100 text-orange-700 border-orange-200', // добавили
            DELIVERED:      'bg-green-100 text-green-700 border-green-200',
            DELIVERED_TO:   'bg-green-100 text-green-700 border-green-200',     // добавили
        };
        return colorMap[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    };


    // Статистика доставок
    const stats = useMemo(() => {
        if (!deliveries.length) return { total: 0, inProgress: 0, delivered: 0, addresses: 0 };

        return {
            total: deliveries.length,
            // ДО: ['PENDING_FROM', 'PENDING_TO', 'IN_PROGRESS']
            inProgress: deliveries.filter(d =>
                ['PENDING_FROM', 'PENDING_TO', 'IN_PROGRESS', 'IN_PROGRESS_TO'].includes(d.status)
            ).length,
            // ДО: только 'DELIVERED'
            delivered: deliveries.filter(d =>
                ['DELIVERED', 'DELIVERED_TO'].includes(d.status)
            ).length,
            addresses: new Set(deliveries.map(d => d.address).filter(Boolean)).size
        };
    }, [deliveries]);


    // Обработчик открытия модального окна редактирования
    const handleEditClick = (delivery) => {
        setSelectedDelivery(delivery);
        setEditForm({
            moving_date: delivery.moving_date ? new Date(delivery.moving_date).toISOString().slice(0, 16) : '',
            address: delivery.address || ''
        });
        setEditModalOpen(true);
    };

    // Обработчик сохранения изменений
    const handleSaveChanges = () => {
        if (!selectedDelivery) return;

        const updateData = {
            availability: 'AVAILABLE'
        };

        // Добавляем только измененные поля
        if (editForm.moving_date) {
            updateData.moving_date = new Date(editForm.moving_date).toISOString();
        }
        if (editForm.address.trim()) {
            updateData.address = editForm.address.trim();
        }

        updateDeliveryMutation.mutate({
            movingOrderId: selectedDelivery.id,
            data: updateData
        });
    };


    // Форматирование даты
    const formatDate = (dateString) => {
        if (!dateString) return 'Не указана';
        try {
            return new Date(dateString).toLocaleDateString('ru-RU', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Некорректная дата';
        }
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
                <Card className="shadow-lg rounded-2xl">
                    <CardContent className="p-12">
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
                            <span className="ml-4 text-[#1e2c4f] font-medium text-lg">Загрузка доставок...</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full max-w-7xl mx-auto p-4 md:p-8">
                <Card className="border-red-200 bg-red-50 shadow-lg rounded-2xl">
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <p className="text-red-600 text-lg mb-4">Ошибка при загрузке доставок: {error.message}</p>
                        <Button 
                            onClick={() => refetch()}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-md"
                        >
                            Попробовать снова
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-8">
            {/* Заголовок страницы */}
            <Card className="border-[#1e2c4f]/20 shadow-xl rounded-2xl bg-gradient-to-r from-[#1e2c4f] to-blue-600">
                <CardHeader className="text-center py-12">
                    <CardTitle className="text-4xl md:text-5xl font-bold text-white mb-4 flex items-center justify-center gap-4">
                        <Truck className="w-12 h-12" />
                        Доставка
                    </CardTitle>
                    <p className="text-blue-100 text-xl leading-relaxed max-w-2xl mx-auto">
                        Управление доставкой ваших товаров
                    </p>
                </CardHeader>
            </Card>

            {/* Статистика доставок */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-all">
                                <Package className="w-8 h-8 text-[#1e2c4f]" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Всего доставок</p>
                                <p className="text-3xl font-bold text-[#1e2c4f]">{stats.total}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-2xl group-hover:from-yellow-200 group-hover:to-orange-200 transition-all">
                                <Clock className="w-8 h-8 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">В процессе</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-2xl group-hover:from-green-200 group-hover:to-emerald-200 transition-all">
                                <Truck className="w-8 h-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Доставлено</p>
                                <p className="text-3xl font-bold text-green-600">{stats.delivered}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-gray-200 hover:shadow-xl transition-all duration-300 shadow-md rounded-2xl group hover:scale-105">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl group-hover:from-purple-200 group-hover:to-pink-200 transition-all">
                                <MapPin className="w-8 h-8 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Адресов</p>
                                <p className="text-3xl font-bold text-purple-600">{stats.addresses}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Список доставок */}
            <Card className="shadow-xl rounded-2xl border-gray-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-[#1e2c4f] flex items-center gap-3">
                        <Package className="w-6 h-6" />
                        Мои доставки
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                    {deliveries.length === 0 ? (
                        <div className="text-center py-16">
                            <div className="mx-auto w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                <Truck className="w-16 h-16 text-gray-400" />
                            </div>
                            <h3 className="text-2xl font-semibold text-gray-900 mb-2">Нет доставок</h3>
                            <p className="text-gray-500 text-lg max-w-md mx-auto">
                                У вас пока нет запланированных доставок
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {deliveries.map((delivery) => (
                                <Card key={delivery.id} className="border border-gray-200 rounded-xl hover:shadow-lg transition-shadow">
                                    <CardContent className="p-6">
                                        <div className="space-y-4">
                                            {/* Заголовок карточки */}
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">
                                                        Заказ №{delivery.order_id}
                                                    </h3>
                                                    <Badge className={`mt-2 ${getStatusColor(delivery.status)}`}>
                                                        {getStatusText(delivery.status)}
                                                    </Badge>
                                                </div>
                                                
                                                {/* Кнопки действий */}
                                                {delivery.availability === 'AWAITABLE' && (
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEditClick(delivery)}
                                                            className="p-2 hover:bg-blue-50 hover:border-blue-300"
                                                        >
                                                            <Edit className="w-4 h-4 text-blue-600" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Информация о доставке */}
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Clock className="w-4 h-4" />
                                                    <span className="font-medium">Дата доставки:</span>
                                                    <span>{formatDate(delivery.moving_date)}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <MapPin className="w-4 h-4" />
                                                    <span className="font-medium">Адрес:</span>
                                                    <span>{delivery.address || 'Не указан'}</span>
                                                </div>
                                            </div>

                                            {/* Предметы заказа */}
                                            {delivery.order?.items && delivery.order.items.length > 0 && (
                                                <div className="border-t pt-4">
                                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Предметы:</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {delivery.order.items.map((item, index) => (
                                                            <Badge key={item.id || index} variant="secondary" className="text-xs">
                                                                {item.name}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Модальное окно редактирования */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="w-5 h-5" />
                            Редактировать доставку
                        </DialogTitle>
                        <DialogDescription>
                            Измените дату доставки и/или адрес. Поля можно оставить без изменений.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="moving_date">Дата и время доставки</Label>
                            <Input
                                id="moving_date"
                                type="datetime-local"
                                value={editForm.moving_date}
                                onChange={(e) => setEditForm(prev => ({ ...prev, moving_date: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Адрес доставки</Label>
                            <Input
                                id="address"
                                type="text"
                                placeholder="Введите адрес доставки"
                                value={editForm.address}
                                onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditModalOpen(false)}
                            disabled={updateDeliveryMutation.isPending}
                        >
                            Отмена
                        </Button>
                        <Button
                            onClick={handleSaveChanges}
                            disabled={updateDeliveryMutation.isPending}
                            className="bg-[#1e2c4f] hover:bg-[#162540]"
                        >
                            {updateDeliveryMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserDelivery;