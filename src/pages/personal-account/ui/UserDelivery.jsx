import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
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
import { List, Zap, Truck, Edit, Clock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ordersApi } from '../../../shared/api/ordersApi';
import { toast } from 'react-toastify';
import DeliveryCard from './DeliveryCard';

const UserDelivery = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [activeFilter, setActiveFilter] = useState('all');
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [editForm, setEditForm] = useState({
        moving_date: '',
        address: ''
    });
    const [timeSelectionModalOpen, setTimeSelectionModalOpen] = useState(false);
    const [selectedDeliveryForTime, setSelectedDeliveryForTime] = useState(null);

    // Интервалы времени доставки
    const deliveryTimeIntervals = [
        '06:00-09:00',
        '09:00-12:00',
        '12:00-15:00',
        '15:00-18:00',
        '18:00-21:00'
    ];

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



    // Фильтрация доставок
    const filteredDeliveries = useMemo(() => {
        if (!deliveries) return [];
        
        switch (activeFilter) {
            case 'inProgress':
                return deliveries.filter(d =>
                    ['PENDING', 'COURIER_ASSIGNED', 'COURIER_IN_TRANSIT', 'COURIER_AT_CLIENT', 'IN_PROGRESS'].includes(d.status)
                );
            case 'delivered':
                return deliveries.filter(d =>
                    ['DELIVERED'].includes(d.status)
                );
            default:
                return deliveries;
        }
    }, [deliveries, activeFilter]);

    // Статистика доставок
    const stats = useMemo(() => {
        if (!deliveries.length) return { total: 0, inProgress: 0, delivered: 0, addresses: 0 };

        return {
            total: deliveries.length,
            inProgress: deliveries.filter(d =>
                ['PENDING', 'COURIER_ASSIGNED', 'COURIER_IN_TRANSIT', 'COURIER_AT_CLIENT', 'IN_PROGRESS'].includes(d.status)
            ).length,
            delivered: deliveries.filter(d =>
                ['DELIVERED'].includes(d.status)
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

    // Обработчик открытия модального окна выбора времени
    const handleSelectTimeClick = (delivery) => {
        setSelectedDeliveryForTime(delivery);
        setTimeSelectionModalOpen(true);
    };

    // Обработчик выбора времени доставки
    const handleTimeIntervalSelect = (interval) => {
        if (!selectedDeliveryForTime) return;

        updateDeliveryMutation.mutate({
            movingOrderId: selectedDeliveryForTime.id,
            data: {
                delivery_time_interval: interval
            }
        });
        setTimeSelectionModalOpen(false);
        setSelectedDeliveryForTime(null);
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
            console.error(error);
            return 'Некорректная дата';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004743]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-red-600">Ошибка при загрузке доставок</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Добро пожаловать в Extra Space!
                        </h1>
                        <p className="text-lg text-gray-600">
                            Привет, {user?.name || 'Пользователь'}. Добро пожаловать.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/personal-account', { state: { activeSection: 'personal' } })}
                        className="px-6 py-2 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-[#D4FFFD] rounded-full shadow-md hover:shadow-lg transition-shadow font-sf-pro-text"
                    >
                        Личный кабинет
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex gap-6 px-6 py-6">
                
                {/* Center - Deliveries */}
                <div className="flex-1">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Доставка</h2>
                        
                        {/* Filter Tabs */}
                        <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                            <TabsList className="bg-white px-2 py-4 rounded-[32px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] h-auto">
                                <TabsTrigger
                                    value="all"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
                                >
                                    <List className="w-4 h-4" />
                                    <span>Все</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="inProgress"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
                                >
                                    <Zap className="w-4 h-4" />
                                    <span>В процессе</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="delivered"
                                    className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
                                >
                                    <Truck className="w-4 h-4" />
                                    <span>Доставлено</span>
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>
                    </div>

                    {/* Delivery Cards */}
                    {filteredDeliveries.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            Нет доставок для отображения
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {filteredDeliveries.map((delivery) => (
                                <DeliveryCard
                                    key={delivery.id}
                                    delivery={delivery}
                                    onSelectTimeClick={handleSelectTimeClick}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Side - Statistics */}
                <div className="w-64 flex-shrink-0 self-start mt-36">
                    <div className="bg-transparent border border-[#DFDFDF] rounded-2xl p-6">
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Всего доставок:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.total}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">В процессе:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.inProgress}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Доставлено:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.delivered}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Адресов:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.addresses}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

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

            {/* Модальное окно выбора времени доставки */}
            <Dialog open={timeSelectionModalOpen} onOpenChange={setTimeSelectionModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Выберите время доставки</DialogTitle>
                        <DialogDescription>
                            Пожалуйста, выберите удобный для вас интервал времени доставки
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2 py-4">
                        {deliveryTimeIntervals.map((interval) => (
                            <Button
                                key={interval}
                                onClick={() => handleTimeIntervalSelect(interval)}
                                className="w-full justify-start text-left h-auto py-3 px-4"
                                variant="outline"
                            >
                                <Clock className="w-5 h-5 mr-3" />
                                <span className="text-lg font-medium">{interval}</span>
                            </Button>
                        ))}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setTimeSelectionModalOpen(false);
                                setSelectedDeliveryForTime(null);
                            }}
                        >
                            Отмена
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default UserDelivery;