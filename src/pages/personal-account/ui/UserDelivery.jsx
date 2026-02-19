import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
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
import { List, Clock, Truck, CheckCircle, Edit, HelpCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { ordersApi } from '../../../shared/api/ordersApi';
import { showSuccessToast, showErrorToast } from '../../../shared/lib/toast';
import { formatCalendarDateTime } from '../../../shared/lib/utils/date';
import DeliveryCard from './DeliveryCard';
import instImage from '../../../assets/inst.webp';

// Константы разделов доставки
export const DELIVERY_SECTIONS = {
  ALL: 'all',
  AWAITING_COURIER: 'awaitingCourier',
  COURIER_ON_THE_WAY: 'courierOnTheWay',
  COMPLETED: 'completed',
};

// Маппинг статусов на разделы
const getSectionByStatus = (status) => {
  if (['PENDING', 'COURIER_ASSIGNED'].includes(status)) {
    return DELIVERY_SECTIONS.AWAITING_COURIER;
  }
  if (['COURIER_IN_TRANSIT', 'COURIER_AT_CLIENT', 'IN_PROGRESS'].includes(status)) {
    return DELIVERY_SECTIONS.COURIER_ON_THE_WAY;
  }
  if (['DELIVERED', 'FINISHED'].includes(status)) {
    return DELIVERY_SECTIONS.COMPLETED;
  }
  return DELIVERY_SECTIONS.ALL; // CANCELLED и другие остаются в "Все"
};

const DELIVERY_FILTER_OPTIONS = [
  { value: DELIVERY_SECTIONS.ALL, label: 'Все', icon: List },
  { value: DELIVERY_SECTIONS.AWAITING_COURIER, label: 'Ожидает курьера', icon: Clock },
  { value: DELIVERY_SECTIONS.COURIER_ON_THE_WAY, label: 'Курьер в пути', icon: Truck },
  { value: DELIVERY_SECTIONS.COMPLETED, label: 'Завершено', icon: CheckCircle },
];

const UserDelivery = ({ embeddedMobile = false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const [activeFilter, setActiveFilter] = useState(() => {
        // Проверяем URL параметр
        const sectionParam = searchParams.get('section');
        if (sectionParam && Object.values(DELIVERY_SECTIONS).includes(sectionParam)) {
            return sectionParam;
        }
        // Проверяем state из навигации
        if (location.state?.deliverySection && Object.values(DELIVERY_SECTIONS).includes(location.state.deliverySection)) {
            return location.state.deliverySection;
        }
        return DELIVERY_SECTIONS.ALL;
    });
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedDelivery, setSelectedDelivery] = useState(null);
    const [editForm, setEditForm] = useState({
        moving_date: '',
        address: ''
    });
    const [timeSelectionModalOpen, setTimeSelectionModalOpen] = useState(false);
    const [selectedDeliveryForTime, setSelectedDeliveryForTime] = useState(null);
    const [isInstructionOpen, setIsInstructionOpen] = useState(false);

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

    // Автоматическое открытие раздела по статусу доставки из state
    useEffect(() => {
        if (location.state?.deliveryId && deliveries.length > 0) {
            const targetDelivery = deliveries.find(d => d.id === location.state.deliveryId);
            if (targetDelivery) {
                const section = getSectionByStatus(targetDelivery.status);
                setActiveFilter(section);
                // Очищаем state после использования
                navigate(location.pathname, { replace: true, state: null });
            }
        }
    }, [deliveries, location.state, navigate, location.pathname]);

    // Мутация для обновления доставки
    const updateDeliveryMutation = useMutation({
        mutationFn: ({ movingOrderId, data }) => ordersApi.updateDelivery(movingOrderId, data),
        onSuccess: () => {
            showSuccessToast('Доставка успешно обновлена!');
            queryClient.invalidateQueries({ queryKey: ['userDeliveries'] });
            setEditModalOpen(false);
            setSelectedDelivery(null);
        },
        onError: (error) => {
            console.error('Ошибка при обновлении доставки:', error);
            showErrorToast('Не удалось обновить доставку');
        }
    });



    // Фильтрация доставок
    const filteredDeliveries = useMemo(() => {
        if (!deliveries) return [];
        
        switch (activeFilter) {
            case DELIVERY_SECTIONS.AWAITING_COURIER:
                return deliveries.filter(d =>
                    ['PENDING', 'COURIER_ASSIGNED'].includes(d.status)
                );
            case DELIVERY_SECTIONS.COURIER_ON_THE_WAY:
                return deliveries.filter(d =>
                    ['COURIER_IN_TRANSIT', 'COURIER_AT_CLIENT', 'IN_PROGRESS'].includes(d.status)
                );
            case DELIVERY_SECTIONS.COMPLETED:
                return deliveries.filter(d =>
                    ['DELIVERED', 'FINISHED'].includes(d.status)
                );
            default:
                return deliveries; // Все, включая CANCELLED
        }
    }, [deliveries, activeFilter]);

    // Статистика доставок
    const stats = useMemo(() => {
        if (!deliveries.length) {
            return {
                total: 0,
                awaitingCourier: 0,
                courierOnTheWay: 0,
                completed: 0,
                addresses: 0
            };
        }

        return {
            total: deliveries.length,
            awaitingCourier: deliveries.filter(d =>
                ['PENDING', 'COURIER_ASSIGNED'].includes(d.status)
            ).length,
            courierOnTheWay: deliveries.filter(d =>
                ['COURIER_IN_TRANSIT', 'COURIER_AT_CLIENT', 'IN_PROGRESS'].includes(d.status)
            ).length,
            completed: deliveries.filter(d =>
                ['DELIVERED', 'FINISHED'].includes(d.status)
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
        return formatCalendarDateTime(dateString) || 'Некорректная дата';
    };

    if (isLoading) {
        return (
            <div className={embeddedMobile ? 'flex items-center justify-center py-16' : 'flex items-center justify-center min-h-screen'}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#004743]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={embeddedMobile ? 'text-center py-12' : 'flex items-center justify-center min-h-screen'}>
                <div className="text-center">
                    <p className="text-red-600">Ошибка при загрузке доставок</p>
                </div>
            </div>
        );
    }

    const summaryLine = `Всего доставок: ${stats.total}; Ожидает курьера: ${stats.awaitingCourier}; Курьер в пути: ${stats.courierOnTheWay}; Завершено: ${stats.completed}; Адресов: ${stats.addresses}`;

    const deliveriesContent = (
        <>
            <div className={embeddedMobile ? 'mb-3 min-[360px]:mb-4' : 'mb-6'}>
                <div className={embeddedMobile ? 'space-y-2 mb-2 min-[360px]:mb-3' : 'mb-4'}>
                    <div className={embeddedMobile ? 'flex flex-wrap items-center justify-between gap-2' : ''}>
                        <h2 className="text-base min-[360px]:text-2xl sm:text-3xl font-semibold text-[#363636] min-w-0 flex-1">Доставка</h2>
                        {embeddedMobile && (
                            <Select value={activeFilter} onValueChange={setActiveFilter}>
                                <SelectTrigger className="w-[100px] min-[360px]:w-[120px] min-[400px]:w-[130px] h-8 min-[360px]:h-9 bg-white border border-[#00A991]/70 rounded-xl flex items-center gap-1.5 flex-shrink-0 text-gray-700 shadow-none [&>svg]:text-[#00A991]">
                                    {(() => {
                                        const currentOption = DELIVERY_FILTER_OPTIONS.find(opt => opt.value === activeFilter);
                                        const Icon = currentOption?.icon || List;
                                        return <Icon className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 text-[#00A991] flex-shrink-0" />;
                                    })()}
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {DELIVERY_FILTER_OPTIONS.map((opt) => {
                                        const Icon = opt.icon;
                                        return (
                                            <SelectItem key={opt.value} value={opt.value}>
                                                <div className="flex items-center gap-2">
                                                    <Icon className="w-4 h-4" />
                                                    <span>{opt.label}</span>
                                                </div>
                                            </SelectItem>
                                        );
                                    })}
                                </SelectContent>
                            </Select>
                        )}
                    </div>
                    {embeddedMobile && (
                        <p className="text-xs min-[360px]:text-sm text-gray-600 break-words leading-snug">{summaryLine}</p>
                    )}
                </div>
                {!embeddedMobile && (
                    <Tabs value={activeFilter} onValueChange={setActiveFilter}>
                        <TabsList className="bg-white px-2 py-4 rounded-[32px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] h-auto">
                            {DELIVERY_FILTER_OPTIONS.map((opt) => {
                                const Icon = opt.icon;
                                return (
                                    <TabsTrigger
                                        key={opt.value}
                                        value={opt.value}
                                        className="flex items-center gap-2 px-4 py-2 rounded-full data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors"
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{opt.label}</span>
                                    </TabsTrigger>
                                );
                            })}
                        </TabsList>
                    </Tabs>
                )}
            </div>

            {filteredDeliveries.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    Нет доставок для отображения
                </div>
            ) : (
                <div className={embeddedMobile ? 'flex flex-col gap-3 min-[360px]:gap-4 min-w-0' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}>
                    {filteredDeliveries.map((delivery) => (
                        <DeliveryCard
                            key={delivery.id}
                            delivery={delivery}
                            onSelectTimeClick={handleSelectTimeClick}
                            embeddedMobile={embeddedMobile}
                        />
                    ))}
                </div>
            )}
        </>
    );

    const deliveryModals = (
        <>
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
                        <Button variant="outline" onClick={() => setEditModalOpen(false)} disabled={updateDeliveryMutation.isPending}>
                            Отмена
                        </Button>
                        <Button onClick={handleSaveChanges} disabled={updateDeliveryMutation.isPending} className="bg-[#1e2c4f] hover:bg-[#162540]">
                            {updateDeliveryMutation.isPending ? 'Сохранение...' : 'Сохранить'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                        <Button variant="outline" onClick={() => { setTimeSelectionModalOpen(false); setSelectedDeliveryForTime(null); }}>
                            Отмена
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );

    if (embeddedMobile) {
        return (
            <>
                <div className="flex-1">{deliveriesContent}</div>
                {deliveryModals}
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
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
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsInstructionOpen(true)}
                            className="p-2 text-[#00A991] hover:text-[#009882] hover:bg-[#00A991]/10 rounded-full transition-colors"
                            title="Инструкция"
                        >
                            <HelpCircle className="w-6 h-6" />
                        </button>
                        <button
                            onClick={() => navigate('/personal-account', { state: { activeSection: 'personal' } })}
                            className="px-6 py-2 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-[#D4FFFD] rounded-full shadow-md hover:shadow-lg transition-shadow font-sf-pro-text"
                        >
                            Личный кабинет
                        </button>
                    </div>
                </div>
            </div>
            <div className="flex gap-6 px-6 py-6">
                <div className="flex-1">{deliveriesContent}</div>
                <div className="w-64 flex-shrink-0 self-start mt-36">
                    <div className="bg-transparent border border-[#DFDFDF] rounded-2xl p-6">
                        <div className="space-y-4">
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Всего доставок:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.total}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Ожидает курьера:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.awaitingCourier}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Курьер в пути:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.courierOnTheWay}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Завершено:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.completed}</div>
                            </div>
                            <div className="text-center">
                                <div className="text-sm text-gray-600 mb-1">Адресов:</div>
                                <div className="text-4xl font-bold text-[#004743]">{stats.addresses}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Dialog open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Инструкция</DialogTitle>
                    </DialogHeader>
                    <div className="flex justify-center">
                        <img src={instImage} alt="Инструкция" className="max-w-full h-auto" />
                    </div>
                </DialogContent>
            </Dialog>
            {deliveryModals}
        </div>
    );
};

export default UserDelivery;