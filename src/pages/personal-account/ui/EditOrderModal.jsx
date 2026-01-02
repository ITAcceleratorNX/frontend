"use client"

import React, { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { CalendarIcon, Plus, Trash2, Package, Truck } from "lucide-react"
import { format } from "date-fns"
import { ru } from "date-fns/locale"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { toast } from "react-toastify"
import { useUpdateOrder } from "@/shared/lib/hooks/useUpdateOrder"
import { paymentsApi } from "@/shared/api/paymentsApi"
import dayjs from "dayjs";
import {useAuth} from "@/shared/index.js";
import { getServiceTypeName } from "@/shared/lib/utils/serviceNames";

export const EditOrderModal = ({ isOpen, order, onSuccess, onCancel }) => {
    const [error, setError] = useState("")
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false)
    const updateOrderMutation = useUpdateOrder()
    const [formData, setFormData] = useState({
        start_date: new Date(order.start_date),
        end_date: new Date(order.end_date),
        order_items: order.items || [],
        services: order.services || [],
        is_selected_moving: order.is_selected_moving || false,
        is_selected_package: order.is_selected_package || false,
        moving_orders: order.moving_orders || []
    })
    const [prices, setPrices] = useState([])
    const [isPricesLoading, setIsPricesLoading] = useState(false)
    const [movingOrderErrors, setMovingOrderErrors] = useState([])
    const [gazelleService, setGazelleService] = useState(null) // { id, type, name }
    const [movingAddressTo, setMovingAddressTo] = useState('') // Адрес для возврата вещей (GAZELLE_TO)
    const [serviceOptions, setServiceOptions] = useState([]) // Все доступные услуги

    const startDate = dayjs(order.start_date);
    const endDate = dayjs(order.end_date);
    const calculateMonths = () => {
        const yearsDiff = endDate.diff(startDate, 'year');
        const monthsDiff = endDate.diff(startDate.add(yearsDiff, 'year'), 'month');
        return yearsDiff * 12 + monthsDiff;
    };
    const [totalPrice, setTotalPrice] = useState(null);
    const [months, setMonths] = useState(() => calculateMonths());

    const totalVolume = formData.order_items.reduce((sum, item) => {
        const volume = parseFloat(item.volume) || 0;
        return sum + volume;
    }, 0);
    const storage_available_volume = Number(order.storage.available_volume) + Number(order.total_volume);


    const addOrderItem = () => {
        setFormData((prev) => ({
            ...prev,
            order_items: [...prev.order_items, { name: "", length: "", width: "", height: "", volume: "", cargo_mark: "NO" }],
        }))
    }

    const removeOrderItem = (index) => {
        if (formData.order_items.length > 1) {
            setFormData((prev) => ({
                ...prev,
                order_items: prev.order_items.filter((_, i) => i !== index),
            }))
        }
    }

    const updateOrderItem = (index, field, value) => {
        const updatedItems = formData.order_items.map((item, i) => {
            if (i === index) {
                const updatedItem = { ...item, [field]: value }
                if (["length", "width", "height"].includes(field)) {
                    const length = Number.parseFloat(updatedItem.length) || 0
                    const width = Number.parseFloat(updatedItem.width) || 0
                    const height = Number.parseFloat(updatedItem.height) || 0
                    updatedItem.volume = (length * width * height).toFixed(2)
                }
                return updatedItem
            }
            return item
        })
        setFormData((prev) => ({ ...prev, order_items: updatedItems }))
    }

    // Инициализация при открытии модалки
    useEffect(() => {
        if (order && isOpen) {
            const initialServices = order.services.map((s) => ({
                service_id: String(s.id),
                type: s.type,
                count: s.OrderService?.count || 1,
            }))
            
            // Находим адрес для возврата вещей (PENDING_TO)
            const returnOrder = order.moving_orders?.find(mo => mo.status === 'PENDING_TO');
            const returnAddress = returnOrder?.address || '';
            setMovingAddressTo(returnAddress);
            
            setFormData({
                start_date: new Date(order.start_date),
                end_date: new Date(order.end_date),
                order_items: order.items.map((item) => ({
                    name: item.name,
                    length: item.length?.toString() || "",
                    width: item.width?.toString() || "",
                    height: item.height?.toString() || "",
                    volume: item.volume?.toString() || "",
                    cargo_mark: item.cargo_mark || "NO",
                })),
                services: initialServices,
                is_selected_moving: order.is_selected_moving || false,
                is_selected_package: order.is_selected_package || false,
                moving_orders: order.moving_orders?.length
                    ? order.moving_orders.map((mo) => ({
                        moving_date: new Date(mo.moving_date),
                        status: mo.status,
                        address: mo.address || "",
                    }))
                    : [],
            })
            setMovingOrderErrors(Array(order.moving_orders?.length || 0).fill({}))
        }
    }, [order, isOpen])

    // Загрузка цен и поиск услуги "Газель"
    useEffect(() => {
        const fetchPrices = async () => {
            if (!formData.is_selected_package || prices.length > 0) return
            try {
                setIsPricesLoading(true)
                const pricesData = await paymentsApi.getPrices()
                // Фильтруем исключенные типы
                const excludedTypes = [
                    "CLOUD_PRICE_LOW",
                    "CLOUD_PRICE_HIGH",
                    "DEPOSIT",
                    "M2_UP_6M",
                    "M2_6_12M",
                    "M2_OVER_12M",
                    "M3_UP_6M",
                    "M3_6_12M",
                    "M3_OVER_12M",
                    "M2_01_UP_6M",
                    "M2_01_6_12M",
                    "M2_01_OVER_12M",
                    "M3_01_UP_6M",
                    "M3_01_6_12M",
                    "M3_01_OVER_12M",
                    "UTILITY_KNIFE",
                    "FURNITURE_SPECIALIST",
                    "CLOUD_TARIFF_SUMKA",
                    "CLOUD_TARIFF_SHINA",
                    "CLOUD_TARIFF_MOTORCYCLE",
                    "CLOUD_TARIFF_BICYCLE",
                    "CLOUD_TARIFF_SUNUK",
                    "CLOUD_TARIFF_FURNITURE",
                    "CLOUD_TARIFF_SKLAD",
                    "CLOUD_TARIFF_GARAZH",
                    "INDIVIDUAL",
                ];
                const filteredPrices = pricesData.filter((price) => !excludedTypes.includes(price.type))
                setPrices(filteredPrices)
                setServiceOptions(filteredPrices)
                // Ищем GAZELLE_FROM (для забора вещей)
                const gazelleFrom = filteredPrices.find((p) => p.type === "GAZELLE_FROM")
                if (gazelleFrom) {
                    setGazelleService({ 
                        id: String(gazelleFrom.id), 
                        type: gazelleFrom.type, 
                        name: getServiceTypeName(gazelleFrom.type) || "Газель - забор вещей" 
                    })
                }
            } catch (err) {
                console.error("Ошибка при загрузке цен:", err)
                toast.error("Не удалось загрузить список услуг")
            } finally {
                setIsPricesLoading(false)
            }
        }

        if (formData.is_selected_package) {
            fetchPrices()
        }
    }, [formData.is_selected_package, prices.length])

    // Синхронизация услуг GAZELLE_FROM и GAZELLE_TO при изменении moving_orders
    const syncMovingServices = (movingOrders, currentServices) => {
        const hasPendingFrom = movingOrders.some(mo => mo.status === 'PENDING_FROM');
        const hasPendingTo = movingOrders.some(mo => mo.status === 'PENDING_TO');
        
        let updated = [...currentServices];
        
        // Синхронизируем GAZELLE_FROM (забор вещей)
        if (gazelleService && gazelleService.type === 'GAZELLE_FROM') {
            const existingIndex = updated.findIndex((s) => s.service_id === gazelleService.id);
            if (hasPendingFrom) {
                if (existingIndex >= 0) {
                    updated[existingIndex] = { ...updated[existingIndex], count: 1 };
                } else {
                    updated.push({ service_id: gazelleService.id, count: 1 });
                }
            } else {
                updated = updated.filter((s) => s.service_id !== gazelleService.id);
            }
        }
        
        // Синхронизируем GAZELLE_TO (возврат вещей)
        const gazelleToService = serviceOptions.find(opt => opt.type === 'GAZELLE_TO');
        if (gazelleToService) {
            const gazelleToId = String(gazelleToService.id);
            const existingToIndex = updated.findIndex((s) => s.service_id === gazelleToId);
            if (hasPendingTo) {
                if (existingToIndex >= 0) {
                    updated[existingToIndex] = { ...updated[existingToIndex], count: 1 };
                } else {
                    updated.push({ service_id: gazelleToId, count: 1 });
                }
            } else {
                updated = updated.filter((s) => s.service_id !== gazelleToId);
            }
        }
        
        return updated;
    }

    // Добавить перевозку
    const addMovingOrder = () => {
        setFormData((prev) => {
            const newMovingOrders = [
                ...prev.moving_orders,
                {
                    moving_date: new Date(),
                    status: "PENDING_FROM",
                    address: "",
                },
            ]
            const updatedServices = syncMovingServices(newMovingOrders, prev.services)
            return {
                ...prev,
                moving_orders: newMovingOrders,
                services: updatedServices,
                is_selected_package: true,
                is_selected_moving: true,
            }
        })
        setMovingOrderErrors([...movingOrderErrors, {}])
    }

    // Удалить перевозку
    const removeMovingOrder = (index) => {
        setFormData((prev) => {
            const movingOrderToRemove = prev.moving_orders[index];
            const newMovingOrders = prev.moving_orders.filter((_, i) => i !== index);
            const updatedServices = syncMovingServices(newMovingOrders, prev.services);
            
            // Если удаляем PENDING_TO, очищаем адрес возврата
            if (movingOrderToRemove?.status === 'PENDING_TO') {
                setMovingAddressTo('');
            }
            
            return {
                ...prev,
                moving_orders: newMovingOrders,
                services: updatedServices,
                is_selected_moving: newMovingOrders.length > 0,
            }
        })
        setMovingOrderErrors(movingOrderErrors.filter((_, i) => i !== index))
    }

    const updateMovingOrder = (index, field, value) => {
        setFormData((prev) => {
            const updated = prev.moving_orders.map((mo, i) => {
                if (i === index) {
                    const updatedMo = { ...mo, [field]: value };
                    // Если меняем статус на PENDING_TO, добавляем GAZELLE_TO в услуги
                    if (field === 'status' && value === 'PENDING_TO') {
                        // Адрес будет обновлен через movingAddressTo
                        updatedMo.address = movingAddressTo || updatedMo.address;
                    }
                    return updatedMo;
                }
                return mo;
            });
            // Синхронизируем услуги при изменении статуса
            const updatedServices = syncMovingServices(updated, prev.services);
            return { 
                ...prev, 
                moving_orders: updated,
                services: updatedServices,
                is_selected_moving: updated.length > 0 || prev.is_selected_moving,
            };
        });
    }

    // Услуги
    const addService = () => {
        setFormData((prev) => ({
            ...prev,
            services: [...prev.services, { service_id: "", count: 1 }],
        }))
    }

    const removeService = (index) => {
        setFormData((prev) => {
            const serviceToRemove = prev.services[index];
            const newServices = prev.services.filter((_, i) => i !== index);
            
            // Если удаляем GAZELLE_TO, удаляем соответствующий moving_order PENDING_TO
            if (serviceToRemove?.service_id) {
                const serviceOption = serviceOptions.find(opt => String(opt.id) === serviceToRemove.service_id);
                if (serviceOption?.type === 'GAZELLE_TO') {
                    const updatedMovingOrders = prev.moving_orders.filter(mo => mo.status !== 'PENDING_TO');
                    const updatedServices = syncMovingServices(updatedMovingOrders, newServices);
                    setMovingAddressTo('');
                    return {
                        ...prev,
                        services: updatedServices,
                        moving_orders: updatedMovingOrders,
                        is_selected_moving: updatedMovingOrders.length > 0,
                    };
                }
            }
            
            // Если удалили GAZELLE_FROM или GAZELLE_TO, синхронизируем
            const updatedServices = syncMovingServices(prev.moving_orders, newServices);
            return { ...prev, services: updatedServices };
        })
    }

    const updateService = (index, field, value) => {
        setFormData((prev) => {
            const currentService = prev.services[index];
            const serviceOption = serviceOptions.find(opt => String(opt.id) === currentService?.service_id);
            const isGazelleFrom = serviceOption?.type === 'GAZELLE_FROM';
            const isGazelleTo = serviceOption?.type === 'GAZELLE_TO';
            
            // Нельзя редактировать GAZELLE_FROM и GAZELLE_TO (они синхронизируются автоматически)
            if (isGazelleFrom || isGazelleTo) {
                return prev;
            }
            
            // Если добавляем GAZELLE_TO, создаем соответствующий moving_order
            if (field === 'service_id' && value) {
                const selectedOption = serviceOptions.find(opt => String(opt.id) === value);
                if (selectedOption?.type === 'GAZELLE_TO') {
                    // Создаем moving_order для возврата вещей
                    const startDate = new Date(formData.start_date);
                    const returnDate = new Date(startDate);
                    returnDate.setMonth(returnDate.getMonth() + months);
                    returnDate.setHours(10, 0, 0, 0);
                    
                    const newMovingOrder = {
                        moving_date: returnDate,
                        status: 'PENDING_TO',
                        address: movingAddressTo || '',
                    };
                    
                    const updatedMovingOrders = [...prev.moving_orders, newMovingOrder];
                    const updatedServices = prev.services.map((s, i) => 
                        i === index ? { ...s, [field]: value } : s
                    );
                    const syncedServices = syncMovingServices(updatedMovingOrders, updatedServices);
                    
                    return {
                        ...prev,
                        services: syncedServices,
                        moving_orders: updatedMovingOrders,
                        is_selected_moving: true,
                    };
                }
            }
            
            const updated = prev.services.map((s, i) => 
                i === index ? { ...s, [field]: field === "count" ? Number(value) : value } : s
            );
            return { ...prev, services: updated };
        });
    }

    // Валидация
    const validate = () => {
        const validItems = formData.order_items.filter((item) => item.name.trim() && Number.parseFloat(item.volume) > 0)
        if (validItems.length === 0) {
            setError("Добавьте хотя бы один товар с названием и объёмом")
            return false
        }
        
        // Проверяем наличие GAZELLE_TO в услугах
        const hasGazelleTo = formData.services.some(s => {
            const serviceOption = serviceOptions.find(opt => String(opt.id) === s.service_id);
            return serviceOption?.type === 'GAZELLE_TO';
        });
        
        // Если есть GAZELLE_TO, должен быть moving_order PENDING_TO с адресом
        if (hasGazelleTo) {
            const pendingToOrder = formData.moving_orders.find(mo => mo.status === 'PENDING_TO');
            if (!pendingToOrder) {
                setError("При выборе услуги 'Газель - возврат вещей' необходимо добавить доставку вещей клиенту")
                return false
            }
            if (!pendingToOrder.address?.trim() && !movingAddressTo.trim()) {
                setError("Укажите адрес доставки для услуги 'Газель - возврат вещей'")
                return false
            }
        }
        
        if (formData.is_selected_moving || formData.moving_orders.length > 0) {
            if (formData.moving_orders.length === 0) {
                setError("Добавьте хотя бы одну дату перевозки")
                return false
            }
            const invalidOrders = formData.moving_orders
                .map((mo, i) => {
                    // Для PENDING_TO используем movingAddressTo если адрес пустой
                    const address = mo.status === 'PENDING_TO' && !mo.address?.trim() 
                        ? movingAddressTo 
                        : mo.address;
                    return !address?.trim() ? `#${i + 1}` : null;
                })
                .filter(Boolean)
            if (invalidOrders.length > 0) {
                setError(`Укажите адрес для перевозки: ${invalidOrders.join(", ")}`)
                return false
            }
        }
        if (formData.is_selected_package) {
            const validServices = formData.services.filter((s) => s.service_id && s.count > 0)
            if (validServices.length === 0) {
                setError("Добавьте хотя бы одну услугу для упаковки")
                return false
            }
        }
        setError("")
        return true
    }

    // Отправка формы — финальная синхронизация услуг
    const handleSubmit = async () => {
        if (!validate()) return
        setIsSubmitting(true)
        try {
            // Финальная синхронизация услуг с moving_orders
            let finalServices = syncMovingServices(formData.moving_orders, formData.services);
            
            // Проверяем наличие GAZELLE_TO
            const hasGazelleTo = finalServices.some(s => {
                const serviceOption = serviceOptions.find(opt => String(opt.id) === s.service_id);
                return serviceOption?.type === 'GAZELLE_TO';
            });
            
            // Обновляем адреса в moving_orders для PENDING_TO
            const updatedMovingOrders = formData.moving_orders.map(mo => {
                if (mo.status === 'PENDING_TO' && movingAddressTo.trim()) {
                    return { ...mo, address: movingAddressTo.trim() };
                }
                return mo;
            });

            // is_selected_moving должен быть true если есть любые moving_orders или GAZELLE_TO
            const isMovingSelected = formData.is_selected_moving || updatedMovingOrders.length > 0 || hasGazelleTo;

            const payload = {
                id: order.id,
                months: months,
                order_items: formData.order_items.map((item) => ({
                    name: item.name,
                    volume: Number.parseFloat(item.volume) || 0,
                    cargo_mark: item.cargo_mark,
                })),
                is_selected_moving: isMovingSelected,
                is_selected_package: formData.is_selected_package && finalServices.length > 0,
            }

            if (payload.is_selected_package && finalServices.length > 0) {
                payload.services = finalServices.map((s) => {
                    const serviceObj = {
                        service_id: Number(s.service_id),
                        count: s.count,
                    };

                    // Для GAZELLE_FROM (старая логика для админов/менеджеров)
                    if (totalPrice != null && totalPrice !== "" && gazelleService && Number(gazelleService.id) === Number(s.service_id)) {
                        serviceObj.total_price = Number(totalPrice);
                    }

                    return serviceObj;
                });
            }

            // Добавляем moving_orders если они есть
            if (updatedMovingOrders.length > 0 || hasGazelleTo) {
                payload.moving_orders = updatedMovingOrders.map((mo) => ({
                    moving_date: mo.moving_date instanceof Date ? mo.moving_date.toISOString() : new Date(mo.moving_date).toISOString(),
                    status: mo.status,
                    address: mo.address?.trim() || '',
                }))
            }

            console.log("📤 Отправка обновления заказа:", payload);

            await updateOrderMutation.mutateAsync(payload)
            toast.success("Заказ успешно обновлён!", { autoClose: 3000 })
            onSuccess()
        } catch (err) {
            const message = err.response?.data?.message || "Не удалось обновить заказ"
            setError(message)
            toast.error(message, { autoClose: 5000 })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!isOpen || !order) return null

    return (
        <Dialog open={isOpen} onOpenChange={onCancel}>
            <DialogContent
                className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-0 sm:w-full bg-white rounded-3xl"
                style={{ boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            >
                <DialogHeader className="px-6 sm:px-8 pt-6 sm:pt-8 pb-6 border-b border-[#d7dbe6]">
                    <DialogTitle className="text-xl sm:text-2xl font-bold text-[#273655] flex items-center gap-3">
                        <Package className="w-5 h-5 sm:w-6 sm:h-6 text-[#00A991]" />
                        <span className="truncate">Редактирование заказа №{order.id}</span>
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-[#6B6B6B] mt-2">
                        Измените параметры хранения, предметы и дополнительные услуги
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 sm:px-8 py-6 space-y-6">
                    {/* Даты */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base font-medium text-[#273655]">Дата начала</Label>
                            <div className="flex items-center h-12 px-4 border border-[#d7dbe6] rounded-3xl bg-gray-50 text-sm sm:text-base text-[#273655]">
                                <CalendarIcon className="mr-2 h-4 w-4 text-[#6B6B6B]" />
                                {format(formData.start_date, "dd.MM.yyyy", { locale: ru })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base font-medium text-[#273655]">Дата окончания хранения</Label>
                            <div className="flex items-center h-12 px-4 border border-[#d7dbe6] rounded-3xl bg-gray-50 text-sm sm:text-base text-[#273655]">
                                <CalendarIcon className="mr-2 h-4 w-4 text-[#6B6B6B]" />
                                {format(formData.end_date, "dd.MM.yyyy", { locale: ru })}
                            </div>
                        </div>
                    </div>

                    {/* Предметы */}
                    {totalVolume > parseFloat(storage_available_volume) && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                            <p className="text-red-600 font-medium text-sm">
                                ⚠️ Объем превышает доступное место в боксе!
                            </p>
                        </div>
                    )}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <Label className="text-lg sm:text-xl font-bold text-[#273655]">Ваши вещи</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addOrderItem}
                                className="flex items-center gap-2 text-sm h-10 w-full sm:w-auto bg-white border border-[#d7dbe6] text-[#273655] hover:bg-gray-50 rounded-3xl"
                            >
                                <Plus className="w-4 h-4" /> Добавить
                            </Button>
                        </div>
                        {formData.order_items.map((item, index) => (
                            <div key={index} className="space-y-4 p-4 sm:p-6 border border-[#d7dbe6] rounded-2xl bg-white shadow-sm">
                                {/* Название - всегда на полную ширину */}
                                <div>
                                    <Label className="text-sm font-medium text-[#273655] mb-2 block">Название</Label>
                                    <Input
                                        value={item.name}
                                        onChange={(e) => updateOrderItem(index, "name", e.target.value)}
                                        placeholder="Например: шкаф"
                                        className="h-12 text-sm rounded-3xl border-[#d7dbe6] focus:border-[#00A991] focus:ring-2 focus:ring-[#00A991]/20"
                                    />
                                </div>

                                {/* Размеры в сетке */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-[#273655] mb-2 block">Длина (м)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.length}
                                            onChange={(e) => updateOrderItem(index, "length", e.target.value)}
                                            placeholder="1.2"
                                            className="h-12 text-sm rounded-3xl border-[#d7dbe6] focus:border-[#00A991] focus:ring-2 focus:ring-[#00A991]/20"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-[#273655] mb-2 block">Ширина (м)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.width}
                                            onChange={(e) => updateOrderItem(index, "width", e.target.value)}
                                            placeholder="0.8"
                                            className="h-12 text-sm rounded-3xl border-[#d7dbe6] focus:border-[#00A991] focus:ring-2 focus:ring-[#00A991]/20"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-[#273655] mb-2 block">Высота (м)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.height}
                                            onChange={(e) => updateOrderItem(index, "height", e.target.value)}
                                            placeholder="2.0"
                                            className="h-12 text-sm rounded-3xl border-[#d7dbe6] focus:border-[#00A991] focus:ring-2 focus:ring-[#00A991]/20"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs sm:text-sm font-medium text-[#273655] mb-2 block">Объём (м³)</Label>
                                        <Input type="text" value={item.volume} disabled className="h-12 bg-gray-100 text-sm rounded-3xl border-[#d7dbe6] text-[#6B6B6B]" />
                                    </div>
                                </div>

                                {/* Тип груза и кнопка удаления */}
                                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end">
                                    <div className="flex-1">
                                        <Label className="text-sm font-medium text-[#273655] mb-2 block">Тип груза</Label>
                                        <Select
                                            value={item.cargo_mark}
                                            onValueChange={(value) => updateOrderItem(index, "cargo_mark", value)}
                                        >
                                            <SelectTrigger className="h-12 rounded-3xl border-[#d7dbe6] focus:border-[#00A991] focus:ring-2 focus:ring-[#00A991]/20">
                                                <SelectValue placeholder="Выберите тип" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="NO">Обычный</SelectItem>
                                                <SelectItem value="HEAVY">Тяжелый</SelectItem>
                                                <SelectItem value="FRAGILE">Хрупкий</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    {formData.order_items.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => removeOrderItem(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-12 w-12 rounded-3xl sm:h-auto sm:w-auto"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Перевозка */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl">
                            <div className="flex items-center gap-3">
                                <Truck className="w-5 h-5 text-[#6B6B6B]" />
                                <Label
                                    htmlFor="moving"
                                    className="text-base sm:text-lg font-medium text-[#273655] cursor-pointer"
                                >
                                    Нужна перевозка?
                                </Label>
                            </div>
                            <input
                                type="checkbox"
                                id="moving"
                                checked={formData.is_selected_moving}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        is_selected_moving: e.target.checked,
                                        moving_orders: e.target.checked ? prev.moving_orders : [],
                                    }))
                                }
                                className="w-5 h-5 rounded border-gray-300 text-[#00A991] focus:ring-[#00A991] cursor-pointer"
                            />
                        </div>
                        {formData.is_selected_moving && (
                            <>
                                {formData.moving_orders.map((mo, index) => (
                                    <div key={index} className="border border-[#d7dbe6] rounded-2xl p-4 sm:p-6 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] shadow-lg">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                                            <div>
                                                <Label className="text-sm font-medium text-white/90 mb-2 block">Дата перевозки</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start h-12 text-sm bg-white/10 border-white text-white hover:bg-white/20 rounded-3xl">
                                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                                            {format(mo.moving_date, "dd.MM.yyyy", { locale: ru })}
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={mo.moving_date}
                                                            onSelect={(date) => updateMovingOrder(index, "moving_date", date)}
                                                            initialFocus
                                                            locale={ru}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                            <div>
                                                <Label className="text-sm font-medium text-white/90 mb-2 block">Тип перевозки</Label>
                                                <Select value={mo.status} onValueChange={(value) => updateMovingOrder(index, "status", value)}>
                                                    <SelectTrigger className="h-12 rounded-3xl bg-white/10 border-white text-white">
                                                        <SelectValue placeholder="Выберите тип" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING_FROM">Забрать вещи (от клиента)</SelectItem>
                                                        <SelectItem value="PENDING_TO">Доставить вещи (клиенту)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="sm:col-span-2 lg:col-span-1">
                                                <Label className="text-sm font-medium text-white/90 mb-2 block">Адрес</Label>
                                                <Input
                                                    value={mo.address}
                                                    onChange={(e) => updateMovingOrder(index, "address", e.target.value)}
                                                    placeholder="Улица, дом, квартира"
                                                    className="h-12 text-sm rounded-3xl bg-white/10 border-white text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeMovingOrder(index)}
                                            className="text-white hover:text-white hover:bg-white/20 text-sm rounded-3xl"
                                        >
                                            <Trash2 className="w-4 h-4 mr-2" /> Удалить перевозку
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addMovingOrder}
                                    className="flex items-center gap-2 text-sm w-full sm:w-auto bg-white border border-[#d7dbe6] text-[#273655] hover:bg-gray-50 rounded-3xl"
                                >
                                    <Plus className="w-4 h-4" /> Добавить дату перевозки
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Упаковка */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl">
                            <div className="flex items-center gap-3">
                                <Package className="w-5 h-5 text-[#6B6B6B]" />
                                <Label
                                    htmlFor="package"
                                    className="text-base sm:text-lg font-medium text-[#273655] cursor-pointer"
                                >
                                    Нужна упаковка?
                                </Label>
                            </div>
                            <input
                                type="checkbox"
                                id="package"
                                checked={formData.is_selected_package}
                                onChange={(e) =>
                                    setFormData((prev) => ({
                                        ...prev,
                                        is_selected_package: e.target.checked,
                                        services: e.target.checked ? prev.services : [],
                                    }))
                                }
                                className="w-5 h-5 rounded border-gray-300 text-[#00A991] focus:ring-[#00A991] cursor-pointer"
                            />
                        </div>
                        {formData.is_selected_package && (
                            <>
                                {isPricesLoading ? (
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-sm text-[#6B6B6B]">Загрузка услуг...</p>
                                    </div>
                                ) : prices.length === 0 ? (
                                    <div className="p-4 bg-gray-50 rounded-2xl">
                                        <p className="text-sm text-[#6B6B6B]">Нет доступных услуг для упаковки.</p>
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-r from-[#26B3AB] to-[#104D4A] rounded-2xl p-4 sm:p-6 shadow-lg space-y-4">
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">Детали услуг упаковки</h3>
                                        <div className="space-y-3">
                                            {formData.services.map((service, index) => {
                                                const serviceData = prices.find((p) => String(p.id) === service.service_id)
                                                const isGazelleFrom = serviceData?.type === "GAZELLE_FROM"
                                                const isGazelleTo = serviceData?.type === "GAZELLE_TO"
                                                const isGazelle = isGazelleFrom || isGazelleTo || serviceData?.type === "GAZELLE"
                                                return (
                                                    <div key={index} className="space-y-3">
                                                        <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white bg-white/10 px-4 py-3">
                                                            <div className="flex-1 min-w-[200px]">
                                                                <Label className="text-xs text-white/90 mb-1 block">Услуга</Label>
                                                                <Select
                                                                    value={service.service_id}
                                                                    onValueChange={(val) => !isGazelle && updateService(index, "service_id", val)}
                                                                    disabled={isGazelle}
                                                                >
                                                                    <SelectTrigger className="h-10 text-sm rounded-3xl bg-white/10 border-white text-white" disabled={isGazelle}>
                                                                        <SelectValue placeholder={getServiceTypeName(service.type)} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {prices
                                                                            .filter(price => {
                                                                                // Скрываем старый GAZELLE
                                                                                if (price.type === "GAZELLE") return false;
                                                                                return true;
                                                                            })
                                                                            .map((price) => (
                                                                                <SelectItem
                                                                                    key={price.id}
                                                                                    value={String(price.id)}
                                                                                >
                                                                                    {getServiceTypeName(price.type) || price.description || "Услуга"} (₸{price.price})
                                                                                </SelectItem>
                                                                            ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="w-24">
                                                                <Label className="text-xs text-white/90 mb-1 block">Кол-во</Label>
                                                                <Input
                                                                    type="number"
                                                                    min="1"
                                                                    value={service.count}
                                                                    onChange={(e) =>
                                                                        !isGazelle && updateService(index, "count", Number.parseInt(e.target.value) || 1)
                                                                    }
                                                                    disabled={isGazelle}
                                                                    className="h-10 text-sm rounded-3xl bg-white/10 border-white text-white placeholder:text-white/70"
                                                                />
                                                            </div>
                                                            {/* Итоговая цена для GAZELLE_FROM (только для ADMIN или MANAGER) */}
                                                            {(isGazelleFrom && (user.role === "ADMIN" || user.role === "MANAGER")) && (
                                                                <div className="w-32">
                                                                    <Label className="text-xs text-white/90 mb-1 block">Итог (₸)</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={totalPrice}
                                                                        onChange={(e) => setTotalPrice(e.target.value ? Number(e.target.value) : "")}
                                                                        className="h-10 text-sm rounded-3xl bg-white/10 border-white text-white"
                                                                    />
                                                                </div>
                                                            )}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => !isGazelle && removeService(index)}
                                                                className={`${isGazelle ? "invisible" : "text-white hover:bg-white/20"} h-10 w-10 rounded-3xl`}
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                        
                                                        {/* Поле адреса для GAZELLE_TO */}
                                                        {isGazelleTo && (
                                                            <div className="pl-4">
                                                                <Label className="block text-xs sm:text-sm text-white/90 mb-2">
                                                                    Адрес доставки вещей
                                                                </Label>
                                                                <Input
                                                                    type="text"
                                                                    value={movingAddressTo}
                                                                    onChange={(e) => {
                                                                        setMovingAddressTo(e.target.value);
                                                                        // Обновляем адрес в moving_order
                                                                        const updatedMovingOrders = formData.moving_orders.map(mo =>
                                                                            mo.status === 'PENDING_TO' 
                                                                                ? { ...mo, address: e.target.value }
                                                                                : mo
                                                                        );
                                                                        setFormData(prev => ({ ...prev, moving_orders: updatedMovingOrders }));
                                                                    }}
                                                                    placeholder="Например: г. Алматы, Абая 25"
                                                                    className="h-12 text-sm rounded-3xl bg-white/10 border-white text-white placeholder:text-white/70 focus:ring-2 focus:ring-white/50"
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addService}
                                                className="flex items-center gap-2 text-sm w-full sm:w-auto bg-white/10 border-dashed border-white text-white hover:bg-white/20 rounded-3xl"
                                            >
                                                <Plus className="w-4 h-4" /> Добавить услугу
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>


                    <div>
                        <label className="block text-sm font-medium text-[#273655] mb-2">
                            Срок аренды (месяцы)
                        </label>
                        <Select
                            value={months.toString()}
                            onValueChange={(value) => setMonths(Number(value))}
                        >
                            <SelectTrigger className="w-full h-12 text-base rounded-3xl border-[#d7dbe6] bg-gray-50 focus:border-[#00A991] focus:ring-2 focus:ring-[#00A991]/20">
                                <SelectValue placeholder="Выберите срок аренды" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1 месяц</SelectItem>
                                <SelectItem value="2">2 месяца</SelectItem>
                                <SelectItem value="3">3 месяца</SelectItem>
                                <SelectItem value="6">6 месяцев</SelectItem>
                                <SelectItem value="12">12 месяцев</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {error && (
                    <div className="px-6 sm:px-8 text-sm text-red-600 bg-red-50 border-t border-red-200 py-4 rounded-b-3xl">
                        {error}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 px-6 sm:px-8 py-6 border-t border-[#d7dbe6]">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 h-12 text-base order-2 sm:order-1 bg-white border border-[#d7dbe6] text-[#273655] hover:bg-gray-50 rounded-3xl"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            totalVolume > parseFloat(storage_available_volume)
                        }
                        className="flex-1 h-12 text-base bg-gradient-to-r from-[#26B3AB] to-[#104D4A] hover:opacity-90 text-white order-1 sm:order-2 rounded-3xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white mr-2"></div>
                                Обработка...
                            </>
                        ) : (
                            "Сохранить изменения"
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
