// src/pages/warehouse-order/index.jsx
import React, { useState, useEffect, memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Header } from "../../widgets";
import Footer from "../../widgets/Footer";
import { warehouseApi } from "../../shared/api/warehouseApi";
import { paymentsApi } from "../../shared/api/paymentsApi";
import { useAuth } from "../../shared/context/AuthContext";
import ChatButton from "../../shared/components/ChatButton";
import InteractiveWarehouseCanvas from "../../components/InteractiveWarehouseCanvas";
import MainWarehouseCanvas from "../../components/MainWarehouseCanvas";
import ProfileValidationGuard from "../../shared/components/ProfileValidationGuard";
// Импорт компонентов UI
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui";
import {
  Trash2,
  Plus,
  CalendarIcon,
  MapPin,
  Package,
  Truck,
} from "lucide-react";

const WarehouseOrderPage = memo(() => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  // Состояния для данных
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Состояния для формы заказа
  const [orderItems, setOrderItems] = useState([
    { name: "", volume: "", cargo_mark: "NO" },
  ]);
  const [months, setMonths] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Состояния для дополнительных услуг
  const [isSelectedMoving, setIsSelectedMoving] = useState(false);
  const [isSelectedPackage, setIsSelectedPackage] = useState(false);
  // Состояния для услуг и дат перевозки
  const [services, setServices] = useState([]);
  const [movingOrders, setMovingOrders] = useState([]);
  const [prices, setPrices] = useState([]);
  const [isPricesLoading, setIsPricesLoading] = useState(false);
  // Состояния для валидации
  const [movingOrderErrors, setMovingOrderErrors] = useState([]);
  // Проверяем роль пользователя - функции заказа доступны только для USER
  const isUserRole = user?.role === "USER";
  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  // Загрузка складов при монтировании
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getAllWarehouses();
        setWarehouses(Array.isArray(data) ? data : []);
        if (import.meta.env.DEV) {
          console.log("Склады загружены:", data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке складов:", error);
        setError("Не удалось загрузить список складов. Попробуйте позже.");
        setWarehouses([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWarehouses();
  }, []);

  // Загрузка цен услуг при выборе услуги упаковки
  useEffect(() => {
    if (isSelectedPackage) {
      const fetchPrices = async () => {
        try {
          setIsPricesLoading(true);
          const pricesData = await paymentsApi.getPrices();
          const filteredPrices = pricesData.filter((price) => price.id > 4);
          setPrices(filteredPrices);
          if (import.meta.env.DEV) {
            console.log("Цены услуг загружены:", filteredPrices);
          }
        } catch (error) {
          console.error("Ошибка при загрузке цен услуг:", error);
          toast.error("Не удалось загрузить цены услуг");
        } finally {
          setIsPricesLoading(false);
        }
      };
      fetchPrices();
    }
  }, [isSelectedPackage]);

  // Функция добавления товара
  const addOrderItem = () => {
    setOrderItems([...orderItems, { name: "", volume: "", cargo_mark: "NO" }]);
  };

  // Функция удаления товара
  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  // Функция обновления товара
  const updateOrderItem = (index, field, value) => {
    const updatedItems = orderItems.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setOrderItems(updatedItems);
  };

  // Функция добавления услуги
  const addService = () => {
    setServices([...services, { service_id: "", count: 1 }]);
  };

  // Функция удаления услуги
  const removeService = (index) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Функция обновления услуги
  const updateService = (index, field, value) => {
    const updatedServices = services.map((service, i) =>
      i === index
        ? { ...service, [field]: field === "count" ? Number(value) : value }
        : service
    );
    setServices(updatedServices);
  };

  // Функция валидации даты перевозки
  const validateMovingOrder = (order) => {
    const errors = {};
    if (!order.address || order.address.trim() === "") {
      errors.address = "Пожалуйста, укажите адрес";
    }
    return errors;
  };

  // Функция добавления даты перевозки
  const addMovingOrder = () => {
    const newOrder = {
      moving_date: new Date().toISOString(),
      status: "PENDING_FROM",
      address: "",
    };
    setMovingOrders([...movingOrders, newOrder]);
    setMovingOrderErrors([...movingOrderErrors, {}]);
  };

  // Функция удаления даты перевозки
  const removeMovingOrder = (index) => {
    setMovingOrders(movingOrders.filter((_, i) => i !== index));
    setMovingOrderErrors(movingOrderErrors.filter((_, i) => i !== index));
  };

  // Функция обновления даты перевозки
  const updateMovingOrder = (index, field, value) => {
    const updatedMovingOrders = movingOrders.map((order, i) =>
      i === index ? { ...order, [field]: value } : order
    );
    setMovingOrders(updatedMovingOrders);
    // Валидация при изменении поля адреса
    if (field === "address") {
      const updatedOrder = updatedMovingOrders[index];
      const errors = validateMovingOrder(updatedOrder);
      const updatedErrors = [...movingOrderErrors];
      updatedErrors[index] = errors;
      setMovingOrderErrors(updatedErrors);
    }
  };

  // Функция для получения русского названия типа услуги
  const getServiceTypeName = (type) => {
    switch (type) {
      case "LOADER":
        return "Грузчик";
      case "PACKER":
        return "Упаковщик";
      case "FURNITURE_SPECIALIST":
        return "Мебельщик";
      case "GAZELLE":
        return "Газель";
      case "STRETCH_FILM":
        return "Стрейч-пленка";
      case "BOX_SIZE":
        return "Коробка";
      case "MARKER":
        return "Маркер";
      case "UTILITY_KNIFE":
        return "Канцелярский нож";
      case "BUBBLE_WRAP_1":
        return "Воздушно-пузырчатая пленка 10м";
      case "BUBBLE_WRAP_2":
        return "Воздушно-пузырчатая пленка 120м";
      default:
        return "Услуга";
    }
  };

  // Функция создания заказа
  const handleCreateOrder = async () => {
    if (!selectedStorage) {
      setError("Пожалуйста, выберите бокс для аренды");
      return;
    }
    // Валидация товаров
    const validItems = orderItems.filter(
      (item) => item.name.trim() && item.volume && parseFloat(item.volume) > 0
    );
    if (validItems.length === 0) {
      setError("Добавьте хотя бы один товар с указанием названия и объема");
      return;
    }
    // Валидация перевозок, если выбрана услуга перевозки
    if (isSelectedMoving && movingOrders.length === 0) {
      setError("Добавьте хотя бы одну дату перевозки");
      return;
    }
    // Валидация адресов в датах перевозки
    if (isSelectedMoving) {
      const invalidOrders = [];
      const newErrors = [];
      movingOrders.forEach((order, index) => {
        const errors = validateMovingOrder(order);
        newErrors[index] = errors;
        if (Object.keys(errors).length > 0) {
          invalidOrders.push(index + 1);
        }
      });
      if (invalidOrders.length > 0) {
        setMovingOrderErrors(newErrors);
        setError(`Пожалуйста, заполните все обязательные поля в датах перевозки (${invalidOrders.join(", ")})`);
        return;
      }
    }
    // Валидация услуг, если выбрана услуга упаковки
    const validServices = services.filter(
      (service) => service.service_id && service.count > 0
    );
    if (isSelectedPackage && validServices.length === 0) {
      setError("Добавьте хотя бы одну услугу для упаковки");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);
      const orderData = {
        storage_id: selectedStorage.id,
        months: months,
        order_items: validItems.map((item) => ({
          name: item.name.trim(),
          volume: parseFloat(item.volume),
          cargo_mark: item.cargo_mark,
        })),
        is_selected_moving: isSelectedMoving,
        is_selected_package: isSelectedPackage,
      };
      // Добавляем данные о перевозке, если выбрана соответствующая услуга
      if (isSelectedMoving) {
        orderData.moving_orders = movingOrders.map((order) => ({
          moving_date: order.moving_date,
          status: order.status,
          address: order.address.trim(),
        }));
      }
      // Добавляем услуги, если выбрана упаковка и есть услуги
      if (isSelectedPackage && validServices.length > 0) {
        orderData.services = validServices.map((service) => ({
          service_id: Number(service.service_id),
          count: service.count,
        }));
      }
      if (import.meta.env.DEV) {
        console.log("Отправляем данные заказа:", orderData);
      }
      const result = await warehouseApi.createOrder(orderData);
      if (import.meta.env.DEV) {
        console.log("Заказ создан:", result);
      }
      toast.success(
        "Заказ успешно создан! Перенаправляем в личный кабинет...",
        {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        }
      );
      setTimeout(() => {
        navigate("/personal-account", { state: { activeSection: "payments" } });
      }, 1500);
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Не удалось создать заказ. Попробуйте позже.";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Расчет общего объема товаров
  const totalVolume = orderItems.reduce((sum, item) => {
    const volume = parseFloat(item.volume) || 0;
    return sum + volume;
  }, 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#273655]"></div>
        </div>
      </div>
    );
  }

  return (
    <ProfileValidationGuard>
      <div className="min-h-screen bg-white flex flex-col font-[Montserrat]">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
          {/* Заголовок */}
          <div className="text-center mb-8">
            <h1 className="text-[48px] font-bold text-[#273655] mb-4">
              {isUserRole ? "ЗАКАЗ БОКСА" : "ПРОСМОТР СКЛАДОВ И БОКСОВ"}
            </h1>
            <p className="text-[18px] text-[#6B6B6B]">
              {isUserRole
                ? "Выберите склад и бокс для аренды, добавьте ваши вещи"
                : "Просмотр состояния складов и боксов"}
            </p>
          </div>
          {/* Ошибка */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="text-red-600 text-center">{error}</div>
            </div>
          )}
          {/* Список складов */}
          <div className="mb-8">
            <h2 className="text-[24px] font-bold text-[#273655] mb-4">
              1. Выберите склад
            </h2>
            {warehouses.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
                <div className="text-gray-500">
                  Склады временно недоступны. Попробуйте позже.
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {warehouses.map((warehouse) => (
                  <div
                    key={warehouse.id}
                    className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                      selectedWarehouse?.id === warehouse.id
                        ? "border-[#273655] bg-blue-50"
                        : "border-gray-200 hover:border-[#273655]"
                    }`}
                    onClick={() => {
                      setSelectedWarehouse(warehouse);
                      setSelectedStorage(null);
                    }}
                  >
                    <h3 className="text-[20px] font-bold text-[#273655] mb-2">
                      {warehouse.name}
                    </h3>
                    <p className="text-[#6B6B6B] mb-2">{warehouse.address}</p>
                    <p className="text-[#6B6B6B] text-sm">
                      Время работы: {warehouse.work_start} - {warehouse.work_end}
                    </p>
                    <p className="text-[#6B6B6B] text-sm">
                      Статус:{" "}
                      <span className="text-green-600">{warehouse.status}</span>
                    </p>
                    {warehouse.storage && (
                      <p className="text-[#273655] font-medium mt-2">
                        Доступно боксов:{" "}
                        {
                          warehouse.storage.filter((s) => s.status === "VACANT")
                            .length
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Список боксов выбранного склада */}
          {selectedWarehouse && selectedWarehouse.storage && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                {isUserRole ? "2. Выберите бокс в складе" : "2. Боксы в складе"}{" "}
                "{selectedWarehouse.name}"
              </h2>
              {/* Адаптивная обертка для схемы склада */}
              <div className="rsm-map-content overflow-x-auto touch-pan-x touch-pan-y w-full max-w-full mx-auto">
                {/* Контейнер для центрирования с фиксированной шириной */}
                <div 
                  className="min-w-max mx-auto relative"
                  style={{
                    minWidth: selectedWarehouse.name === "EXTRA SPACE Мега" ? '615px' : 
                              selectedWarehouse.name === "EXTRA SPACE Главный склад" ? '1120px' : 'auto'
                  }}
                >
                  {selectedWarehouse.name === "EXTRA SPACE Мега" ? (
                    <InteractiveWarehouseCanvas
                      storageBoxes={selectedWarehouse.storage}
                      onBoxSelect={setSelectedStorage}
                      selectedStorage={selectedStorage}
                      userRole={user?.role}
                      isViewOnly={isAdminOrManager}
                    />
                  ) : selectedWarehouse.name === "EXTRA SPACE Главный склад" ? (
                    <MainWarehouseCanvas
                      storageBoxes={selectedWarehouse.storage}
                      onBoxSelect={setSelectedStorage}
                      selectedStorage={selectedStorage}
                      userRole={user?.role}
                      isViewOnly={isAdminOrManager}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )}
          {/* Форма добавления товаров */}
          {selectedStorage && isUserRole && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                3. Добавьте ваши вещи
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  <p className="text-[#6B6B6B] mb-2">
                    Выбранный бокс:{" "}
                    <span className="font-medium text-[#273655]">
                      {selectedStorage.name}
                    </span>
                  </p>
                  <p className="text-[#6B6B6B] mb-2">
                    Доступный объем:{" "}
                    <span className="font-medium text-[#273655]">
                      {selectedStorage.available_volume} м³
                    </span>
                  </p>
                  <p className="text-[#6B6B6B]">
                    Общий объем ваших вещей:{" "}
                    <span className="font-medium text-[#273655]">
                      {totalVolume.toFixed(2)} м³
                    </span>
                  </p>
                  {totalVolume >
                    parseFloat(selectedStorage.available_volume) && (
                    <p className="text-red-600 font-medium mt-2">
                      ⚠️ Объем превышает доступное место в боксе!
                    </p>
                  )}
                </div>
                <div className="space-y-4">
                  {orderItems.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#273655] mb-1">
                            Название вещи
                          </label>
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) =>
                              updateOrderItem(index, "name", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                            placeholder="Например: Диван"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="Длина (м)"
                              onChange={(e) => {
                                const length = parseFloat(e.target.value) || 0;
                                const width = item.width || 0;
                                const height = item.height || 0;
                                const volume = length * width * height;

                                updateOrderItem(index, "length", length);
                                updateOrderItem(index, "volume", volume.toFixed(2));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                          />

                          <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="Ширина (м)"
                              onChange={(e) => {
                                const width = parseFloat(e.target.value) || 0;
                                const length = item.length || 0;
                                const height = item.height || 0;
                                const volume = length * width * height;

                                updateOrderItem(index, "width", width);
                                updateOrderItem(index, "volume", volume.toFixed(2));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                          />

                          <input
                              type="number"
                              step="0.01"
                              min="0.01"
                              placeholder="Высота (м)"
                              onChange={(e) => {
                                const height = parseFloat(e.target.value) || 0;
                                const length = item.length || 0;
                                const width = item.width || 0;
                                const volume = length * width * height;

                                updateOrderItem(index, "height", height);
                                updateOrderItem(index, "volume", volume.toFixed(2));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none"
                          />
                        </div>

                        <p className="mt-2 text-sm text-gray-700">
                          Объем: <strong>{item.volume || 0}</strong> м³
                        </p>
                        <div>
                          <label className="block text-sm font-medium text-[#273655] mb-1">
                            Тип груза
                          </label>
                          <select
                            value={item.cargo_mark}
                            onChange={(e) =>
                              updateOrderItem(
                                index,
                                "cargo_mark",
                                e.target.value
                              )
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                          >
                            <option value="NO">Обычный</option>
                            <option value="HEAVY">Тяжелый</option>
                            <option value="FRAGILE">Хрупкий</option>
                          </select>
                        </div>
                        <div className="flex items-end">
                          {orderItems.length > 1 && (
                            <button
                              onClick={() => removeOrderItem(index)}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <Trash2 className="w-5 h-6" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    onClick={addOrderItem}
                    className="w-full px-4 py-2 border-2 border-dashed border-[#273655] text-[#273655] rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    + Добавить еще вещь
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Дополнительные услуги */}
          {selectedStorage && isUserRole && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                4. Дополнительные услуги
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                {/* Услуга перевозки */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#273655]" />
                      <h3 className="text-lg font-semibold text-[#273655]">
                        Услуга перевозки
                      </h3>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Мы поможем перевезти ваши вещи в наш склад
                    </p>
                  </div>
                  <div>
                    <Switch
                      checked={isSelectedMoving}
                      onCheckedChange={(checked) => {
                        setIsSelectedMoving(checked);
                        if (!checked) {
                          setIsSelectedPackage(false);
                          setServices([]);
                          setMovingOrders([]);
                          setMovingOrderErrors([]);
                        }
                      }}
                      className="bg-gray-200 data-[state=checked]:bg-[#273655]"
                    />
                  </div>
                </div>
                {/* Услуга упаковки - показывается только если включена перевозка */}
                {isSelectedMoving && (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#273655]" />
                        <h3 className="text-lg font-semibold text-[#273655]">
                          Услуга упаковки
                        </h3>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        Мы упакуем ваши вещи для безопасного хранения
                      </p>
                    </div>
                    <div>
                      <Switch
                        checked={isSelectedPackage}
                        onCheckedChange={(checked) => {
                          setIsSelectedPackage(checked);
                          if (!checked) {
                            setServices([]);
                          }
                        }}
                        className="bg-gray-200 data-[state=checked]:bg-[#273655]"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Блок добавления дат перевозки - показывается если включена перевозка */}
          {selectedStorage && isUserRole && isSelectedMoving && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                5. Добавить даты перевозки
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {movingOrders.length > 0 && (
                  <div className="mb-6 space-y-4">
                    {movingOrders.map((order, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-lg p-4"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-[#273655] mb-1">
                              Дата перевозки
                            </label>
                            <input
                              type="datetime-local"
                              value={order.moving_date.slice(0, 16)}
                              onChange={(e) =>
                                updateMovingOrder(
                                  index,
                                  "moving_date",
                                  e.target.value
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-[#273655] mb-1">
                              Тип перевозки
                            </label>
                            <Select
                              value={order.status}
                              onValueChange={(value) =>
                                updateMovingOrder(index, "status", value)
                              }
                            >
                              <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                <SelectValue placeholder="Выберите тип перевозки" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING_FROM">
                                  Забрать вещи (От клиента на склад)
                                </SelectItem>
                                <SelectItem value="PENDING_TO">
                                  Доставить вещи (Со склада к клиенту)
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-[1fr_auto] gap-2">
                            <div>
                              <label className="block text-sm font-medium text-[#273655] mb-1">
                                Адрес <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                value={order.address}
                                onChange={(e) =>
                                  updateMovingOrder(
                                    index,
                                    "address",
                                    e.target.value
                                  )
                                }
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                                  movingOrderErrors[index]?.address
                                    ? "border-red-500 focus:border-red-500 bg-red-50"
                                    : "border-gray-300 focus:border-[#273655]"
                                }`}
                                placeholder="Ваш адрес"
                              />
                              {movingOrderErrors[index]?.address && (
                                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {movingOrderErrors[index].address}
                                </p>
                              )}
                            </div>
                            <div className="flex items-end">
                              <button
                                onClick={() => removeMovingOrder(index)}
                                className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={addMovingOrder}
                  className="flex items-center gap-2 px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Добавить дату перевозки
                </button>
              </div>
            </div>
          )}
          {/* Блок добавления услуг - показывается если включена упаковка */}
          {selectedStorage && isUserRole && isSelectedPackage && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                {isSelectedMoving ? "6" : "5"}. Добавить услуги для упаковки
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                {isPricesLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#273655]"></div>
                  </div>
                ) : (
                  <>
                    {services.length > 0 && (
                      <div className="mb-6 space-y-4">
                        {services.map((service, index) => (
                          <div
                            key={index}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-[#273655] mb-1">
                                  Выберите услугу
                                </label>
                                <Select
                                  value={service.service_id.toString()}
                                  onValueChange={(value) =>
                                    updateService(index, "service_id", value)
                                  }
                                >
                                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <SelectValue placeholder="Выберите услугу" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {prices.map((price) => (
                                      <SelectItem
                                        key={price.id}
                                        value={price.id.toString()}
                                      >
                                        {getServiceTypeName(price.type) ||
                                          price.description}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-[#273655] mb-1">
                                  Количество
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  value={service.count}
                                  onChange={(e) =>
                                    updateService(
                                      index,
                                      "count",
                                      e.target.value
                                    )
                                  }
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273655]"
                                />
                              </div>
                              <div className="flex items-end">
                                <button
                                  onClick={() => removeService(index)}
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                >
                                  <Trash2 className="w-5 h-5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={addService}
                      className="flex items-center gap-2 px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Добавить услугу
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
          {/* Блок выбора срока аренды и кнопки создания заказа */}
          {selectedStorage && isUserRole && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                {(() => {
                  let stepNumber = 5;
                  if (isSelectedMoving) stepNumber++;
                  if (isSelectedPackage) stepNumber++;
                  return stepNumber;
                })()}. Укажите срок аренды
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
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
                  <button
                    onClick={handleCreateOrder}
                    disabled={
                      isSubmitting ||
                      !selectedStorage ||
                      orderItems.filter(
                        (item) => item.name.trim() && item.volume
                      ).length === 0 ||
                      totalVolume >
                        parseFloat(selectedStorage.available_volume) ||
                      (isSelectedMoving && movingOrders.length === 0) ||
                      (isSelectedMoving && movingOrders.some(order => !order.address || order.address.trim() === "")) ||
                      (isSelectedPackage && services.filter(s => s.service_id && s.count > 0).length === 0)
                    }
                    className="w-full h-[56px] bg-[#F86812] text-white text-[18px] font-bold rounded-lg hover:bg-[#d87d1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: "4px 4px 8px 0 #B0B0B0" }}
                  >
                    {isSubmitting ? "СОЗДАНИЕ ЗАКАЗА..." : "СОЗДАТЬ ЗАКАЗ"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
        <ChatButton />
        <Footer />
      </div>
    </ProfileValidationGuard>
  );
});

WarehouseOrderPage.displayName = "WarehouseOrderPage";
export default WarehouseOrderPage;