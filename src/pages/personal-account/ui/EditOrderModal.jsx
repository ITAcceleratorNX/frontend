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

    const getServiceTypeName = (type) => {
        const names = {
            LOADER: "Грузчик",
            PACKER: "Упаковщик",
            FURNITURE_SPECIALIST: "Мебельщик",
            GAZELLE: "Газель",
            GAZELLE_FROM: "Газель - забор вещей",
            GAZELLE_TO: "Газель - возврат вещей",
            STRETCH_FILM: "Стрейч-пленка",
            BOX_SIZE: "Коробка",
            MARKER: "Маркер",
            UTILITY_KNIFE: "Канцелярский нож",
            BUBBLE_WRAP_1: "Воздушно-пузырчатая пленка 10м",
            BUBBLE_WRAP_2: "Воздушно-пузырчатая пленка 120м",
            RACK_RENTAL: "Аренда стеллажей",
        }
        return names[type] || "Услуга"
    }

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
                const filteredPrices = pricesData.filter((price) => price.id > 4)
                setPrices(filteredPrices)
                const gazelle = filteredPrices.find((p) => p.type === "GAZELLE")
                if (gazelle) {
                    setGazelleService({ id: String(gazelle.id), type: gazelle.type, name: getServiceTypeName(gazelle.type) })
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

    // Синхронизация "Газель" при изменении moving_orders
    const syncGazelleService = (movingCount, currentServices) => {
        if (!gazelleService || movingCount === 0) return currentServices.filter((s) => s.service_id !== gazelleService.id)
        const existingIndex = currentServices.findIndex((s) => s.service_id === gazelleService.id)
        const updated = [...currentServices]
        if (existingIndex >= 0) {
            updated[existingIndex] = { ...updated[existingIndex], count: movingCount }
        } else {
            updated.push({ service_id: gazelleService.id, count: movingCount })
        }
        return updated
    }

    // Добавить перевозку
    const addMovingOrder = () => {
        if (!gazelleService) return
        setFormData((prev) => {
            const newMovingOrders = [
                ...prev.moving_orders,
                {
                    moving_date: new Date(),
                    status: "PENDING_FROM",
                    address: "",
                },
            ]
            const updatedServices = syncGazelleService(newMovingOrders.length, prev.services)
            return {
                ...prev,
                moving_orders: newMovingOrders,
                services: updatedServices,
                is_selected_package: true,
            }
        })
        setMovingOrderErrors([...movingOrderErrors, {}])
    }

    // Удалить перевозку
    const removeMovingOrder = (index) => {
        if (!gazelleService) return
        setFormData((prev) => {
            const newMovingOrders = prev.moving_orders.filter((_, i) => i !== index)
            const updatedServices = syncGazelleService(newMovingOrders.length, prev.services)
            return {
                ...prev,
                moving_orders: newMovingOrders,
                services: updatedServices,
            }
        })
        setMovingOrderErrors(movingOrderErrors.filter((_, i) => i !== index))
    }

    const updateMovingOrder = (index, field, value) => {
        const updated = formData.moving_orders.map((mo, i) => (i === index ? { ...mo, [field]: value } : mo))
        setFormData((prev) => ({ ...prev, moving_orders: updated }))
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
            const newServices = prev.services.filter((_, i) => i !== index)
            // Если удалили "Газель", восстановим при необходимости
            const movingCount = prev.moving_orders.length
            if (gazelleService && movingCount > 0) {
                return {
                    ...prev,
                    services: syncGazelleService(movingCount, newServices),
                }
            }
            return { ...prev, services: newServices }
        })
    }

    const updateService = (index, field, value) => {
        setFormData((prev) => {
            const updated = prev.services.map((s, i) => {
                if (i === index && s.service_id === gazelleService?.id) {
                    return s // ❌ Нельзя менять "Газель"
                }
                return i === index ? { ...s, [field]: field === "count" ? Number(value) : value } : s
            })
            return { ...prev, services: updated }
        })
    }

    // Валидация
    const validate = () => {
        const validItems = formData.order_items.filter((item) => item.name.trim() && Number.parseFloat(item.volume) > 0)
        if (validItems.length === 0) {
            setError("Добавьте хотя бы один товар с названием и объёмом")
            return false
        }
        if (formData.is_selected_moving && formData.moving_orders.length === 0) {
            setError("Добавьте хотя бы одну дату перевозки")
            return false
        }
        if (formData.is_selected_moving) {
            const invalidOrders = formData.moving_orders
                .map((mo, i) => (!mo.address?.trim() ? `#${i + 1}` : null))
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

    // Отправка формы — финальная синхронизация "Газель"
    const handleSubmit = async () => {
        if (!validate()) return
        setIsSubmitting(true)
        try {
            let finalServices = [...formData.services]
            const movingCount = formData.moving_orders.length
            if (formData.is_selected_moving && movingCount > 0 && gazelleService) {
                finalServices = syncGazelleService(movingCount, finalServices)
            } else if (gazelleService) {
                finalServices = finalServices.filter((s) => s.id !== gazelleService.id)
            }

            const payload = {
                id: order.id,
                months: months,
                order_items: formData.order_items.map((item) => ({
                    name: item.name,
                    volume: Number.parseFloat(item.volume) || 0,
                    cargo_mark: item.cargo_mark,
                })),
                is_selected_moving: formData.is_selected_moving,
                is_selected_package: formData.is_selected_package && finalServices.length > 0,
            }

            if (payload.is_selected_package && finalServices.length > 0) {
                payload.services = finalServices.map((s) => {
                    const serviceObj = {
                        service_id: Number(s.service_id),
                        count: s.count,
                    };

                    if (totalPrice != null && totalPrice !== "" && Number(gazelleService.id) === Number(s.service_id)) {
                        serviceObj.total_price = Number(totalPrice);
                    }

                    return serviceObj;
                });
            }

            if (formData.is_selected_moving && formData.moving_orders.length > 0) {
                payload.moving_orders = formData.moving_orders.map((mo) => ({
                    moving_date: mo.moving_date.toISOString(),
                    status: mo.status,
                    address: mo.address,
                }))
            }

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
                className="w-[95vw] max-w-4xl max-h-[95vh] overflow-y-auto p-0 sm:w-full"
                style={{ boxShadow: "4px 4px 8px 0 #B0B0B0" }}
            >
                <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-200">
                    <DialogTitle className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                        <Package className="w-4 h-4 sm:w-5 sm:h-5 text-[#F86812]" />
                        <span className="truncate">Редактирование заказа №{order.id}</span>
                    </DialogTitle>
                    <DialogDescription className="text-xs sm:text-sm text-gray-500">
                        Измените параметры хранения, предметы и дополнительные услуги
                    </DialogDescription>
                </DialogHeader>

                <div className="px-4 sm:px-6 py-4 space-y-6">
                    {/* Даты */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Дата начала</Label>
                            <div className="flex items-center h-10 px-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base text-gray-700">
                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                {format(formData.start_date, "dd.MM.yyyy", { locale: ru })}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm sm:text-base">Дата окончания хранения</Label>
                            <div className="flex items-center h-10 px-3 border border-gray-300 rounded-lg bg-gray-50 text-sm sm:text-base text-gray-700">
                                <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                                {format(formData.end_date, "dd.MM.yyyy", { locale: ru })}
                            </div>
                        </div>
                    </div>

                    {/* Предметы */}
                    {totalVolume > parseFloat(storage_available_volume) && (
                        <p className="text-red-600 font-medium mt-2">
                            ⚠️ Объем превышает доступное место в боксе!
                        </p>
                    )}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <Label className="text-base sm:text-lg font-medium text-gray-800">Ваши вещи</Label>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addOrderItem}
                                className="flex items-center gap-1 text-xs sm:text-sm h-8 sm:h-9 w-full sm:w-auto bg-transparent"
                            >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Добавить
                            </Button>
                        </div>
                        {formData.order_items.map((item, index) => (
                            <div key={index} className="space-y-3 p-3 sm:p-4 border border-gray-200 rounded-lg bg-white">
                                {/* Название - всегда на полную ширину */}
                                <div>
                                    <Label className="text-sm">Название</Label>
                                    <Input
                                        value={item.name}
                                        onChange={(e) => updateOrderItem(index, "name", e.target.value)}
                                        placeholder="Например: шкаф"
                                        className="h-10 text-sm"
                                    />
                                </div>

                                {/* Размеры в сетке */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                                    <div>
                                        <Label className="text-xs sm:text-sm">Длина (м)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.length}
                                            onChange={(e) => updateOrderItem(index, "length", e.target.value)}
                                            placeholder="1.2"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs sm:text-sm">Ширина (м)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.width}
                                            onChange={(e) => updateOrderItem(index, "width", e.target.value)}
                                            placeholder="0.8"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs sm:text-sm">Высота (м)</Label>
                                        <Input
                                            type="number"
                                            step="0.01"
                                            value={item.height}
                                            onChange={(e) => updateOrderItem(index, "height", e.target.value)}
                                            placeholder="2.0"
                                            className="h-10 text-sm"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-xs sm:text-sm">Объём (м³)</Label>
                                        <Input type="text" value={item.volume} disabled className="h-10 bg-gray-100 text-sm" />
                                    </div>
                                </div>

                                {/* Тип груза и кнопка удаления */}
                                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-end">
                                    <div className="flex-1">
                                        <Label className="text-sm">Тип груза</Label>
                                        <Select
                                            value={item.cargo_mark}
                                            onValueChange={(value) => updateOrderItem(index, "cargo_mark", value)}
                                        >
                                            <SelectTrigger className="h-10">
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
                                            className="text-red-500 hover:text-red-700 h-10 w-10 sm:h-auto sm:w-auto"
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
                        <div className="flex items-center gap-2">
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
                                className="rounded border-gray-300 text-[#F86812] focus:ring-[#F86812]"
                            />
                            <Label
                                htmlFor="moving"
                                className="text-base sm:text-lg font-medium text-gray-800 flex items-center gap-1"
                            >
                                <Truck className="w-4 h-4 sm:w-5 sm:h-5" /> Нужна перевозка?
                            </Label>
                        </div>
                        {formData.is_selected_moving && (
                            <>
                                {formData.moving_orders.map((mo, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-3 sm:p-4 bg-gray-50">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
                                            <div>
                                                <Label className="text-sm">Дата перевозки</Label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start h-10 text-sm bg-transparent">
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
                                                <Label className="text-sm">Тип перевозки</Label>
                                                <Select value={mo.status} onValueChange={(value) => updateMovingOrder(index, "status", value)}>
                                                    <SelectTrigger className="h-10">
                                                        <SelectValue placeholder="Выберите тип" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="PENDING_FROM">Забрать вещи (от клиента)</SelectItem>
                                                        <SelectItem value="PENDING_TO">Доставить вещи (клиенту)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="sm:col-span-2 lg:col-span-1">
                                                <Label className="text-sm">Адрес</Label>
                                                <Input
                                                    value={mo.address}
                                                    onChange={(e) => updateMovingOrder(index, "address", e.target.value)}
                                                    placeholder="Улица, дом, квартира"
                                                    className="h-10 text-sm"
                                                />
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeMovingOrder(index)}
                                            className="text-red-500 text-xs sm:text-sm"
                                        >
                                            <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" /> Удалить перевозку
                                        </Button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addMovingOrder}
                                    className="flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto bg-transparent"
                                >
                                    <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Добавить дату перевозки
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Упаковка */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
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
                                className="rounded border-gray-300 text-[#F86812] focus:ring-[#F86812]"
                            />
                            <Label
                                htmlFor="package"
                                className="text-base sm:text-lg font-medium text-gray-800 flex items-center gap-1"
                            >
                                <Package className="w-4 h-4 sm:w-5 sm:h-5" /> Нужна упаковка?
                            </Label>
                        </div>
                        {formData.is_selected_package && (
                            <>
                                {isPricesLoading ? (
                                    <p className="text-xs sm:text-sm text-gray-500">Загрузка услуг...</p>
                                ) : prices.length === 0 ? (
                                    <p className="text-xs sm:text-sm text-gray-500">Нет доступных услуг для упаковки.</p>
                                ) : (
                                    <>
                                        {formData.services.map((service, index) => {
                                            const serviceData = prices.find((p) => String(p.id) === service.service_id)
                                            const isGazelle = serviceData?.type === "GAZELLE"
                                            return (
                                                <div key={index} className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:items-end">
                                                    <div className="flex-1">
                                                        <Label className="text-sm">Услуга</Label>
                                                        <Select
                                                            value={service.service_id}
                                                            onValueChange={(val) => !isGazelle && updateService(index, "service_id", val)}
                                                            disabled={isGazelle}
                                                        >
                                                            <SelectTrigger className="h-10 text-sm" disabled={isGazelle}>
                                                                <SelectValue placeholder={getServiceTypeName(service.type)} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {prices.map((price) => (
                                                                    <SelectItem
                                                                        key={price.id}
                                                                        value={String(price.id)}
                                                                        disabled={price.type === "GAZELLE"}
                                                                    >
                                                                        {getServiceTypeName(price.type)} (₸{price.price})
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                    <div className="w-full sm:w-24">
                                                        <Label className="text-sm">Кол-во</Label>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            value={service.count}
                                                            onChange={(e) =>
                                                                !isGazelle && updateService(index, "count", Number.parseInt(e.target.value) || 1)
                                                            }
                                                            disabled={isGazelle}
                                                            className="h-10 text-sm"
                                                        />
                                                    </div>
                                                    {/* Итоговая цена для Газели (только для ADMIN или MANAGER) */}
                                                    {(isGazelle && (user.role === "ADMIN" || user.role === "MANAGER")) && (
                                                        <div className="w-full sm:w-32">
                                                            <Label className="text-sm">Итог (₸)</Label>
                                                            <Input
                                                                type="number"
                                                                value={totalPrice}
                                                                onChange={(e) => setTotalPrice(e.target.value ? Number(e.target.value) : "")}
                                                                className="h-10 text-sm bg-gray-100"
                                                            />
                                                        </div>
                                                    )}
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => !isGazelle && removeService(index)}
                                                        className={`${isGazelle ? "invisible" : "text-red-500"} h-10 w-10 sm:h-auto sm:w-auto`}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )
                                        })}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addService}
                                            className="flex items-center gap-1 text-xs sm:text-sm w-full sm:w-auto bg-transparent"
                                        >
                                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" /> Добавить услугу
                                        </Button>
                                    </>
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
                            <SelectTrigger className="w-full h-[56px] text-lg">
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
                    <div className="px-4 sm:px-6 text-xs sm:text-sm text-red-500 bg-red-50 border-t border-red-200 py-3">
                        {error}
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 px-4 sm:px-6 py-4 border-t border-gray-200">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={isSubmitting}
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-lg order-2 sm:order-1 bg-transparent"
                    >
                        Отмена
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={
                            isSubmitting ||
                            totalVolume > parseFloat(storage_available_volume)
                        }
                        className="flex-1 h-10 sm:h-12 text-sm sm:text-lg bg-[#F86812] hover:bg-[#d87d1c] text-white order-1 sm:order-2"
                        style={{ boxShadow: "4px 4px 8px 0 #B0B0B0" }}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-t-2 border-white mr-2"></div>
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
