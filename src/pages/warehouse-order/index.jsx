// src/pages/warehouse-order/index.jsx
import React, {useState, useEffect, memo, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import { showSuccessToast, showErrorToast } from "../../shared/lib/toast";
import { Header } from "../../widgets";
import Footer from "../../widgets/Footer";
import { warehouseApi } from "../../shared/api/warehouseApi";
import { paymentsApi } from "../../shared/api/paymentsApi";
import { ordersApi } from "../../shared/api/ordersApi";
import { promoApi } from "../../shared/api/promoApi";
import { useAuth } from "../../shared/context/AuthContext";
import InteractiveWarehouseCanvas from "../../components/InteractiveWarehouseCanvas";
import MainWarehouseCanvas from "../../components/MainWarehouseCanvas";
import ZhkKomfortCanvas from "../../components/ZhkKomfortCanvas.jsx";
import MiniVolumeSelector from "../../components/MiniVolumeSelector";
import ProfileValidationGuard from "../../shared/components/ProfileValidationGuard";
import CallbackRequestModal from "../../shared/components/CallbackRequestModal.jsx";
// Импорт компонентов UI
import {
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../../components/ui";
import {
  Trash2,
  Plus,
  Package,
  Truck,
  ZoomIn,
  ZoomOut,
  Tag,
  Check,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import DatePicker from "../../shared/ui/DatePicker";

const WarehouseOrderPage = memo(() => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  // Состояния для данных
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  // Состояния для формы заказа
  const [orderItems, setOrderItems] = useState([
    { name: "", length: "", width: "", height: "", volume: "", cargo_mark: "NO" },
  ]);
  const [months, setMonths] = useState(1);
  const [bookingStartDate, setBookingStartDate] = useState(() => {
    // Устанавливаем минимальную дату - сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCloudVolume, setSelectedCloudVolume] = useState(3);
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

  const [gazelleService, setGazelleService] = useState(null);
  const [isCloud, setIsCloud] = useState(false);
  // Состояние для выбора карты склада Жилой комплекс «Комфорт Сити»
  const [komfortSelectedMap, setKomfortSelectedMap] = useState(1);
  // Состояние для выбора карты склада Mega Towers
  const [megaSelectedMap, setMegaSelectedMap] = useState(1);
  // Состояние для активного таба
  const [activeTab, setActiveTab] = useState("INDIVIDUAL");
  // Состояние для зума карты
  const [zoomLevel, setZoomLevel] = useState(1);

  // Функция для смены карты Komfort с сбросом выбранного бокса
  const handleKomfortMapChange = (mapNumber) => {
    setKomfortSelectedMap(mapNumber);
    setSelectedStorage(null); // Сбрасываем выбранный бокс при смене карты
  };

  // Функция для смены карты Mega Towers с сбросом выбранного бокса
  const handleMegaMapChange = (mapNumber) => {
    setMegaSelectedMap(mapNumber);
    setSelectedStorage(null); // Сбрасываем выбранный бокс при смене карты
  };

  useEffect(() => {
    if (selectedWarehouse) {
      const isCloudType = selectedWarehouse.type === 'CLOUD';
      setIsCloud(isCloudType);

      console.log('Смена склада:', {
        warehouseType: selectedWarehouse.type,
        isCloudType,
        currentMovingOrdersLength: movingOrders.length,
        currentMovingOrders: movingOrders
      });

      // Если CLOUD — автоматически включаем перевозку и упаковку
      if (isCloudType) {
        setIsSelectedMoving(true);
        setIsSelectedPackage(true);
        // Не сбрасываем movingOrders, если уже есть
        if (movingOrders.length === 0) {
          // Для облачного хранения создаем только забор вещей (PENDING с direction TO_WAREHOUSE)
          setMovingOrders([
            { moving_date: new Date().toISOString(), status: 'PENDING', direction: 'TO_WAREHOUSE', address: '' }
          ]);
          setMovingOrderErrors([{}]);
        }
      } else {
        // Для индивидуальных складов сбрасываем movingOrders
        console.log('Сброс movingOrders для индивидуального склада');
        setMovingOrders([]);
        setMovingOrderErrors([]);
      }
    }
  }, [selectedWarehouse]);

  useEffect(() => {
    if (isSelectedMoving && prices.length > 0 && !gazelleService) {
      // Ищем GAZELLE_FROM вместо GAZELLE
      const gazelleFrom = prices.find((price) => price.type === "GAZELLE_FROM");
      if (gazelleFrom) {
        setGazelleService({
          id: String(gazelleFrom.id),
          type: gazelleFrom.type,
          name: getServiceTypeName(gazelleFrom.type),
        });
      }
    } else if (!isSelectedMoving) {
      setGazelleService(null);
    }
  }, [isSelectedMoving, prices, gazelleService]);

  // Синхронизация услуг перевозки на основе moving_orders
  const syncMovingServices = useCallback((currentServices, currentMovingOrders) => {
    if (!prices || prices.length === 0) return currentServices;
    
    let updated = [...currentServices];
    
    // Получаем типы перевозок из moving_orders
    const hasPickup = currentMovingOrders.some(order => order.status === "PENDING" && order.direction === "TO_WAREHOUSE");
    const hasReturn = currentMovingOrders.some(order => order.status === "PENDING" && order.direction === "TO_CLIENT");
    
    // Находим услуги GAZELLE_FROM и GAZELLE_TO
    const gazelleFromOption = prices.find(p => p.type === "GAZELLE_FROM");
    const gazelleToOption = prices.find(p => p.type === "GAZELLE_TO");
    
    // Синхронизируем GAZELLE_FROM
    if (hasPickup && gazelleFromOption) {
      const existingIndex = updated.findIndex(s => String(s.service_id) === String(gazelleFromOption.id));
      if (existingIndex >= 0) {
        // Обновляем количество
        updated[existingIndex] = { ...updated[existingIndex], count: 1 };
      } else {
        // Добавляем услугу
        updated.push({ service_id: gazelleFromOption.id.toString(), count: 1 });
      }
    } else if (!hasPickup && gazelleFromOption) {
      // Удаляем услугу, если нет забора
      updated = updated.filter(s => String(s.service_id) !== String(gazelleFromOption.id));
    }
    
    // Синхронизируем GAZELLE_TO
    if (hasReturn && gazelleToOption) {
      const existingIndex = updated.findIndex(s => String(s.service_id) === String(gazelleToOption.id));
      if (existingIndex >= 0) {
        // Обновляем количество
        updated[existingIndex] = { ...updated[existingIndex], count: 1 };
      } else {
        // Добавляем услугу
        updated.push({ service_id: gazelleToOption.id.toString(), count: 1 });
      }
    } else if (!hasReturn && gazelleToOption) {
      // Удаляем услугу, если нет возврата
      updated = updated.filter(s => String(s.service_id) !== String(gazelleToOption.id));
    }
    
    return updated;
  }, [prices]);

  // Автоматическая синхронизация услуг при изменении moving_orders
  useEffect(() => {
    if (prices.length > 0 && movingOrders.length > 0) {
      setServices(prev => syncMovingServices(prev, movingOrders));
    }
  }, [movingOrders, prices, syncMovingServices]);

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
    if ((isSelectedPackage || isSelectedMoving) && prices.length === 0) {
      const fetchPrices = async () => {
        try {
          setIsPricesLoading(true);
          const pricesData = await paymentsApi.getPrices();
          const filteredPrices = pricesData.filter((price) => {
            // Исключаем первые 4 услуги (id > 4)
            if (price.id <= 4) return false;
            
            // Исключаем базовые тарифы и тарифы для расчета стоимости хранения
            const excludedTypes = ['DEPOSIT', 'M2', 'CLOUD_M3'];
            
            return !excludedTypes.includes(price.type);
          });
          setPrices(filteredPrices);
          if (import.meta.env.DEV) {
            console.log("Цены услуг загружены:", filteredPrices);
          }
        } catch (error) {
          console.error("Ошибка при загрузке цен услуг:", error);
          showErrorToast("Не удалось загрузить цены услуг");
        } finally {
          setIsPricesLoading(false);
        }
      };
      fetchPrices();
    }
  }, [isSelectedPackage, isSelectedMoving, prices.length]);


  // Функция удаления товара
  const removeOrderItem = (index) => {
    if (orderItems.length > 1) {
      setOrderItems(orderItems.filter((_, i) => i !== index));
    }
  };

  // Функция обновления товара
  const updateOrderItem = (index, field, value) => {
    const updatedItems = orderItems.map((item, i) => {
      if (i === index) {
        const updatedItem = { ...item, [field]: value };

        // Пересчитываем объем, если изменились длина, ширина или высота
        if (['length', 'width', 'height'].includes(field)) {
          const length = parseFloat(updatedItem.length) || 0;
          const width = parseFloat(updatedItem.width) || 0;
          const height = parseFloat(updatedItem.height) || 0;

          // Проверяем, что все размеры больше 0
          if (length > 0 && width > 0 && height > 0) {
            updatedItem.volume = (length * width * height).toFixed(2);
          } else {
            updatedItem.volume = "0";
          }
        }

        return updatedItem;
      }
      return item;
    });

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

  // Функция добавления даты перевозки (только забор вещей)
  const addMovingOrder = () => {
    const newOrder = {
      moving_date: new Date().toISOString(),
      status: "PENDING",
      direction: "TO_WAREHOUSE",
      address: "",
    };
    setMovingOrders([...movingOrders, newOrder]);
    setMovingOrderErrors([...movingOrderErrors, {}]);
    setIsSelectedPackage(true); // Упаковка становится активной, если добавлена перевозка
    // Синхронизация услуг произойдет автоматически через useEffect
  };

  // Функция удаления даты перевозки
  const removeMovingOrder = (index) => {
    const newMovingOrders = movingOrders.filter((_, i) => i !== index);
    setMovingOrders(newMovingOrders);
    setMovingOrderErrors(movingOrderErrors.filter((_, i) => i !== index));
    // Синхронизация услуг произойдет автоматически через useEffect
  };

  // Функция обновления даты перевозки
  const updateMovingOrder = (index, field, value) => {
    const updatedMovingOrders = movingOrders.map((order, i) =>
      i === index ? { ...order, [field]: value } : order
    );
    setMovingOrders(updatedMovingOrders);
    // Синхронизация услуг произойдет автоматически через useEffect при изменении типа перевозки
    
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
      case "GAZELLE_FROM":
        return "Газель - Доставка";
      case "GAZELLE_TO":
        return "Газель - возврат вещей";
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
      case "RACK_RENTAL":
        return "Аренда стеллажей";
      default:
        return "Услуга";
    }
  };

  // Состояние для цены аренды склада
  const [storagePrice, setStoragePrice] = useState(0);
  const [storagePricingBreakdown, setStoragePricingBreakdown] = useState(null);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  // Состояние для информации о бронировании занятого бокса
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isLoadingBookingInfo, setIsLoadingBookingInfo] = useState(false);
  // Состояние для цен услуг (для расчета процента скидки)
  const [servicePrices, setServicePrices] = useState({});
  // Состояние для промокода
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // Функция расчета цены аренды склада через новый API
  const calculateStoragePrice = async () => {
    console.log('calculateStoragePrice вызвана:', {
      selectedStorage,
      selectedWarehouse,
      months,
      totalVolume
    });
    
    if (!selectedStorage) {
      console.log('selectedStorage не выбран, выходим');
      return;
    }
    
    if (!months) {
      console.log('months не установлен, выходим');
      return;
    }
    
    try {
      setIsCalculatingPrice(true);
      
      // Определяем тип хранения на основе типа склада
      let storageType = 'INDIVIDUAL';
      if (selectedWarehouse?.type === 'CLOUD') {
        storageType = 'CLOUD';
      }
      
      // Рассчитываем площадь/объем
      let area, volume;
      if (selectedWarehouse?.type === 'CLOUD') {
        // Для облачного хранения используем объем товаров
        volume = parseFloat(totalVolume) || 1;
        console.log('CLOUD: volume =', volume);
      } else {
        // Для индивидуального хранения используем площадь товаров
        // Если товары не указаны, используем размер бокса
        area = totalVolume > 0 ? totalVolume : (parseFloat(selectedStorage.total_volume) || 1);
        console.log('INDIVIDUAL: area =', area, 'totalVolume =', totalVolume, 'selectedStorage.total_volume =', selectedStorage.total_volume);
      }
      
      // Используем новый API для расчета стоимости хранения
      const requestData = {
        services: [], // Только хранение, без дополнительных услуг
        storageType: storageType,
        months: months
      };
      
      console.log('Данные для расчета стоимости хранения:', {
        selectedStorage,
        selectedWarehouse,
        storageType,
        area,
        volume,
        months,
        requestData
      });
      
      // Добавляем соответствующие измерения
      if (storageType === 'INDIVIDUAL') {
        requestData.warehouse_id = selectedWarehouse.id;
        requestData.area = area;
        // Идентификатор бокса (для цены на уровне бокса)
        if (selectedStorage?.id) {
          requestData.storage_id = selectedStorage.id;
        }
        // Добавляем tier из выбранного бокса, если есть
        if (selectedStorage?.tier !== undefined && selectedStorage?.tier !== null) {
          requestData.tier = selectedStorage.tier;
        }
      } else if (storageType === 'CLOUD') {
        requestData.volume = volume;
      }
      
      const result = await warehouseApi.calculateBulkPrice(requestData);
      console.log('Результат расчета стоимости хранения:', result);
      console.log('Устанавливаем storagePrice =', result.storage.price);
      setStoragePrice(result.storage.price);
      setStoragePricingBreakdown(result.storage.pricingBreakdown || null);
    } catch (error) {
      console.error('Ошибка при расчете цены склада:', error);
      // Fallback на старую логику
      setStoragePrice((selectedStorage.price || 0) * months);
      setStoragePricingBreakdown(null);
    } finally {
      setIsCalculatingPrice(false);
    }
  };

  // Пересчитываем цену при изменении параметров
  useEffect(() => {
    if (selectedStorage && months) {
      calculateStoragePrice();
    }
  }, [selectedStorage, months]);

  // Загрузка цен услуг для расчета процента скидки (только для индивидуальных складов)
  useEffect(() => {
    const loadServicePrices = async () => {
      if (!selectedWarehouse || selectedWarehouse.type !== 'INDIVIDUAL') {
        setServicePrices({});
        return;
      }

      try {
        const prices = await warehouseApi.getWarehouseServicePrices(selectedWarehouse.id);
        const pricesMap = {};
        prices.forEach(price => {
          pricesMap[price.service_type] = parseFloat(price.price);
        });
        setServicePrices(pricesMap);
      } catch (error) {
        console.error('Ошибка при загрузке цен услуг для расчета скидки:', error);
        setServicePrices({});
      }
    };

    loadServicePrices();
  }, [selectedWarehouse]);

  // Получение информации о бронировании из поля occupancy
  useEffect(() => {
    if (!selectedStorage) {
      setBookingInfo(null);
      setIsLoadingBookingInfo(false);
      return;
    }

    // Проверяем, является ли бокс занятым
    const isOccupied = selectedStorage.status === 'OCCUPIED' || selectedStorage.status === 'PENDING';
    
    if (isOccupied && selectedStorage.occupancy && Array.isArray(selectedStorage.occupancy) && selectedStorage.occupancy.length > 0) {
      // Находим активное бронирование
      const activeBooking = selectedStorage.occupancy.find(
        (booking) => booking.status === 'ACTIVE'
      ) || selectedStorage.occupancy[0]; // Если нет ACTIVE, берем первое
      
      if (activeBooking && activeBooking.start_date && activeBooking.end_date) {
        setBookingInfo({
          start_date: activeBooking.start_date,
          end_date: activeBooking.end_date
        });
      } else {
        setBookingInfo(null);
      }
      setIsLoadingBookingInfo(false);
    } else {
      setBookingInfo(null);
      setIsLoadingBookingInfo(false);
    }
  }, [selectedStorage]);

  // Функция расчета общей стоимости (без учета промокода)
  const calculateTotalPriceWithoutDiscount = () => {
    if (!selectedStorage) return 0;
    
    let totalPrice = storagePrice;
    
    // Стоимость услуг упаковки (бесплатно для облачных складов)
    if (isSelectedPackage && services.length > 0 && selectedWarehouse?.type !== 'CLOUD') {
      services.forEach(service => {
        const servicePrice = prices.find(p => p.id === parseInt(service.service_id));
        if (servicePrice && service.count > 0) {
          totalPrice += servicePrice.price * service.count;
        }
      });
    }
    
    // Стоимость услуг перевозки уже учтена в services через syncGazelleService
    // Дополнительный расчет не нужен, так как это приведет к дублированию
    
    return totalPrice;
  };

  // Функция расчета общей стоимости (с учетом промокода)
  const calculateTotalPrice = () => {
    const totalWithoutDiscount = calculateTotalPriceWithoutDiscount();
    return Math.max(0, totalWithoutDiscount - promoDiscount);
  };

  // Функция применения промокода
  const handleApplyPromoCode = async () => {
    if (!promoCodeInput.trim()) {
      setPromoError("Введите промокод");
      return;
    }

    const totalAmount = calculateTotalPriceWithoutDiscount();
    if (totalAmount <= 0) {
      setPromoError("Сначала выберите бокс и срок аренды");
      return;
    }

    try {
      setIsValidatingPromo(true);
      setPromoError("");
      setPromoSuccess(false);

      const result = await promoApi.validate(promoCodeInput.trim(), totalAmount);

      if (result.valid) {
        setPromoCode(promoCodeInput.trim());
        setPromoDiscount(result.discount_amount);
        setPromoDiscountPercent(result.discount_percent);
        setPromoSuccess(true);
        setPromoError("");
        showSuccessToast(`Промокод применен! Скидка ${result.discount_percent}%`);
      } else {
        setPromoError(result.error || "Недействительный промокод");
        setPromoCode("");
        setPromoDiscount(0);
        setPromoDiscountPercent(0);
        setPromoSuccess(false);
      }
    } catch (error) {
      console.error("Ошибка при проверке промокода:", error);
      setPromoError("Ошибка при проверке промокода");
      setPromoCode("");
      setPromoDiscount(0);
      setPromoDiscountPercent(0);
      setPromoSuccess(false);
    } finally {
      setIsValidatingPromo(false);
    }
  };

  // Функция удаления промокода
  const handleRemovePromoCode = () => {
    setPromoCode("");
    setPromoCodeInput("");
    setPromoDiscount(0);
    setPromoDiscountPercent(0);
    setPromoError("");
    setPromoSuccess(false);
  };

  // Пересчитываем скидку при изменении общей суммы
  useEffect(() => {
    if (promoCode && promoDiscountPercent > 0) {
      const totalAmount = calculateTotalPriceWithoutDiscount();
      const newDiscount = Math.round((totalAmount * promoDiscountPercent / 100) * 100) / 100;
      setPromoDiscount(newDiscount);
    }
  }, [storagePrice, services, isSelectedPackage, promoCode, promoDiscountPercent]);

  // Функция создания заказа
  const handleCreateOrder = async () => {
    if (!selectedStorage) {
      setError("Пожалуйста, выберите бокс для аренды");
      return;
    }
    // Валидация товаров
    const validItems = orderItems.filter((item) => {
      if (selectedWarehouse?.type === 'CLOUD') {
        return item.name.trim(); // Для облачного хранения нужен только название
      } else {
        return item.name.trim();
      }
    });
    if (validItems.length === 0) {
      const errorMessage = "Добавьте хотя бы один товар с указанием названия";
      setError(errorMessage);
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
    // Для обычных пользователей услуги обязательны, если включена упаковка
    // Для ADMIN/MANAGER услуги не обязательны
    if (isSelectedPackage && (validServices.length === 0 && !isCloud && isUserRole)) {
      setError("Добавьте хотя бы одну услугу для упаковки");
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);

      // Финальная синхронизация "Газель - забор" (GAZELLE_FROM)
      // Синхронизируем услуги перевозки на основе moving_orders
      let finalServices = syncMovingServices(services, movingOrders);

      // Фильтрация валидных услуг
      const validServices = finalServices.filter(
          (service) => service.service_id && service.count > 0
      );

      // Проверка: если выбрана упаковка, но нет услуг (только для обычных пользователей)
      if (isSelectedPackage && validServices.length === 0 && isUserRole && !isCloud) {
        setError("Добавьте хотя бы одну услугу для упаковки");
        return;
      }

      // Формируем дату начала бронирования
      const startDate = bookingStartDate ? new Date(bookingStartDate).toISOString() : new Date().toISOString();

      const orderData = {
        storage_id: selectedStorage.id,
        months: months,
        start_date: startDate,
        order_items: validItems.map((item) => ({
          name: item.name.trim(),
          volume: selectedWarehouse?.type === 'CLOUD' ? (parseFloat(item.volume) || 0) : 0,
          cargo_mark: item.cargo_mark,
        })),
        is_selected_moving: isSelectedMoving,
        is_selected_package: isSelectedPackage && validServices.length > 0,
      };

      // Добавляем промокод, если он применен
      if (promoCode) {
        orderData.promo_code = promoCode;
      }

      if (isSelectedMoving && movingOrders.length > 0) {
        orderData.moving_orders = movingOrders.map((order) => ({
          moving_date: order.moving_date,
          status: order.status,
          address: order.address.trim(),
        }));
      }

      if (isSelectedPackage && validServices.length > 0) {
        orderData.services = validServices.map((service) => ({
          service_id: Number(service.service_id),
          count: service.count,
        }));
      }

      const result = await warehouseApi.createOrder(orderData);

      console.log(result);

      showSuccessToast(
        'СМС от TrustMe для подписания договора придёт после подтверждения заказа менеджером. Оплата будет доступна сразу после подписания договора.',
        { autoClose: 4000 }
      );
      setTimeout(() => {
        navigate("/personal-account", { state: { activeSection: "payments" } });
      }, 1500);
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.error || error.message || "Не удалось создать заказ. Попробуйте позже.";
      
      // Проверяем, не верифицирован ли телефон
      const isPhoneNotVerified = error.response?.status === 400 && (
          errorMessage.includes('Phone number must be verified') ||
          errorMessage.includes('phone number') ||
          errorData?.code === 'PHONE_NOT_VERIFIED'
      );
      
      if (isPhoneNotVerified) {
        showErrorToast(
          'Телефон не верифицирован. Пожалуйста, верифицируйте номер телефона в профиле перед созданием заказа.',
          { autoClose: 5000 }
        );
        setTimeout(() => {
          navigate("/personal-account", { state: { activeSection: "personal" } });
        }, 2000);
        setIsSubmitting(false);
        return;
      }
      
      // Проверяем, достигнут ли лимит активных заказов
      const isMaxOrdersError = error.response?.status === 403 && (
          errorMessage.includes('максимальное количество боксов') || 
          errorMessage.includes('MAX_ORDERS_LIMIT_REACHED') ||
          errorData?.error?.includes('максимальное количество боксов') ||
          errorData?.message?.includes('максимальное количество боксов')
      );
      
      if (isMaxOrdersError) {
        // Показываем модал обратного звонка вместо обычной ошибки
        setIsCallbackModalOpen(true);
        setError(null);
        return;
      }
      
      setError(errorMessage);
      showErrorToast(errorMessage, { autoClose: 5000 });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Расчет общего объема товаров
  const totalVolume = selectedWarehouse?.type === 'CLOUD' 
    ? selectedCloudVolume 
    : orderItems.reduce((sum, item) => {
        const volume = parseFloat(item.volume) || 0;
        return sum + volume;
      }, 0);

  // Пересчитываем цену при изменении товаров
  useEffect(() => {
    if (selectedStorage && months) {
      calculateStoragePrice();
    }
  }, [totalVolume, selectedCloudVolume]);

  // Обновляем volume для всех товаров при изменении selectedCloudVolume
  useEffect(() => {
    if (selectedWarehouse?.type === 'CLOUD' && selectedCloudVolume) {
      setOrderItems(prevItems => 
        prevItems.map(item => ({
          ...item,
          volume: selectedCloudVolume
        }))
      );
    }
  }, [selectedCloudVolume, selectedWarehouse?.type]);

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

  // Определяем тип хранения на основе активного таба
  const storageType = activeTab === "CLOUD" ? "CLOUD" : "INDIVIDUAL";
  
  // Фильтруем склады по типу
  const filteredWarehouses = warehouses.filter(w => w.type === storageType);
  
  // Автоматически выбираем первый склад при смене таба
  useEffect(() => {
    if (filteredWarehouses.length > 0 && (!selectedWarehouse || selectedWarehouse.type !== storageType)) {
      const firstWarehouse = filteredWarehouses[0];
      setSelectedWarehouse(firstWarehouse);
      if (firstWarehouse.type === "CLOUD" && firstWarehouse.storage?.[0]) {
        setSelectedStorage(firstWarehouse.storage[0]);
      } else {
        setSelectedStorage(null);
      }
    }
  }, [activeTab, filteredWarehouses]);

  return (
    <ProfileValidationGuard>
      <div className="min-h-screen bg-gray-50 flex flex-col font-[Montserrat]">
        <Header />
        <div className="flex-1 container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12 max-w-7xl">
          {/* Заголовок */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#273655] mb-6">
            Храните личные вещи прямо у дома
          </h1>
          
          {/* Табы навигации */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-2 w-full max-w-md bg-gray-100 rounded-2xl p-1 h-auto">
              <TabsTrigger
                value="INDIVIDUAL"
                className="rounded-xl py-3 px-6 text-base font-semibold data-[state=active]:bg-[#00A991] data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all"
              >
                Индивидуальное хранение
              </TabsTrigger>
              <TabsTrigger
                value="CLOUD"
                className="rounded-xl py-3 px-6 text-base font-semibold data-[state=active]:bg-[#00A991] data-[state=active]:text-white data-[state=inactive]:text-gray-600 transition-all"
              >
                Облачное хранение
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="INDIVIDUAL" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                {/* Левая панель - Карта склада */}
                <div className="bg-[#00A991] rounded-3xl p-6 shadow-lg">
                  {/* Селектор локации */}
                  <div className="mb-4">
                    <Select
                      value={selectedWarehouse?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const warehouse = warehouses.find(w => w.id.toString() === value);
                        if (warehouse) {
                          setSelectedWarehouse(warehouse);
                          setSelectedStorage(null);
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-white text-[#273655] border-0 rounded-xl h-12 text-base font-medium">
                        <SelectValue placeholder="Выберите склад" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredWarehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* Кнопки зума */}
                  <div className="flex gap-2 mb-4 justify-center">
                    <button
                      onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 2))}
                      className="w-10 h-10 rounded-full bg-white text-[#00A991] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
                      aria-label="Увеличить"
                    >
                      <ZoomIn size={20} />
                    </button>
                    <button
                      onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.5))}
                      className="w-10 h-10 rounded-full bg-white text-[#00A991] flex items-center justify-center hover:bg-gray-100 transition-colors shadow-md"
                      aria-label="Уменьшить"
                    >
                      <ZoomOut size={20} />
                    </button>
                  </div>
                  
                  {/* Карта склада */}
                  <div className="bg-white rounded-2xl p-4 overflow-auto" style={{ maxHeight: '600px' }}>
                    <div className="rsm-map-content" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left', width: `${100 / zoomLevel}%` }}>
                      {selectedWarehouse && selectedWarehouse.storage && (
                        <>
                          {selectedWarehouse.name === "Mega Tower Almaty, жилой комплекс" ? (
                            <>
                              <div className="mb-4 flex justify-center">
                                <div className="bg-white border border-gray-200 rounded-lg p-2 flex gap-2">
                                  <button
                                    onClick={() => handleMegaMapChange(1)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      megaSelectedMap === 1
                                        ? 'bg-[#273655] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Карта 1
                                  </button>
                                  <button
                                    onClick={() => handleMegaMapChange(2)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      megaSelectedMap === 2
                                        ? 'bg-[#273655] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Карта 2
                                  </button>
                                </div>
                              </div>
                              <InteractiveWarehouseCanvas
                                storageBoxes={selectedWarehouse.storage}
                                onBoxSelect={setSelectedStorage}
                                selectedStorage={selectedStorage}
                                userRole={user?.role}
                                isViewOnly={isAdminOrManager}
                                selectedMap={megaSelectedMap}
                              />
                            </>
                          ) : selectedWarehouse.name === "Есентай, жилой комплекс" ? (
                            <MainWarehouseCanvas
                              storageBoxes={selectedWarehouse.storage}
                              onBoxSelect={setSelectedStorage}
                              selectedStorage={selectedStorage}
                              userRole={user?.role}
                              isViewOnly={isAdminOrManager}
                            />
                          ) : selectedWarehouse.name === "Жилой комплекс «Комфорт Сити»" ? (
                            <>
                              <div className="mb-4 flex justify-center">
                                <div className="bg-white border border-gray-200 rounded-lg p-2 flex gap-2">
                                  <button
                                    onClick={() => handleKomfortMapChange(1)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      komfortSelectedMap === 1
                                        ? 'bg-[#273655] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Ярус 1
                                  </button>
                                  <button
                                    onClick={() => handleKomfortMapChange(2)}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                      komfortSelectedMap === 2
                                        ? 'bg-[#273655] text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                  >
                                    Ярус 2
                                  </button>
                                </div>
                              </div>
                              <ZhkKomfortCanvas
                                storageBoxes={selectedWarehouse.storage}
                                onBoxSelect={setSelectedStorage}
                                selectedStorage={selectedStorage}
                                userRole={user?.role}
                                isViewOnly={isAdminOrManager}
                                selectedMap={komfortSelectedMap}
                              />
                            </>
                          ) : null}
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Правая панель - Форма конфигурации */}
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-[#273655] mb-6">
                    Настройте хранение
                  </h2>
                  
                  {/* Дата начала бронирования */}
                  <div className="mb-6">
                    <DatePicker
                      label="Дата начала бронирования"
                      value={bookingStartDate}
                      onChange={(value) => setBookingStartDate(value)}
                      minDate={new Date().toISOString().split('T')[0]}
                      allowFutureDates={true}
                      placeholder="ДД.ММ.ГГГГ"
                    />
                  </div>
                  
                  {/* Срок аренды */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#273655] mb-2">
                      Срок аренды (месяцы):
                    </label>
                    <Select
                      value={months.toString()}
                      onValueChange={(value) => setMonths(Number(value))}
                    >
                      <SelectTrigger className="w-full h-12 text-base border-gray-300 rounded-xl">
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
                  
                  {/* Перевозка вещей */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#273655]" />
                      <span className="text-base font-medium text-[#273655]">Перевозка вещей</span>
                    </div>
                    <Switch
                      checked={isSelectedMoving}
                      onCheckedChange={(checked) => {
                        setIsSelectedMoving(checked);
                        if (!checked) {
                          if (isUserRole) {
                            setIsSelectedPackage(false);
                            setServices([]);
                          }
                          setMovingOrders([]);
                          setMovingOrderErrors([]);
                        }
                      }}
                      className="bg-gray-200 data-[state=checked]:bg-[#00A991]"
                    />
                  </div>
                  
                  {/* Услуги упаковки */}
                  {(isSelectedMoving || isAdminOrManager) && (
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#273655]" />
                        <span className="text-base font-medium text-[#273655]">Услуги упаковки</span>
                      </div>
                      <Switch
                        checked={isSelectedPackage}
                        onCheckedChange={(checked) => {
                          setIsSelectedPackage(checked);
                          if (!checked) {
                            setServices([]);
                          }
                        }}
                        className="bg-gray-200 data-[state=checked]:bg-[#00A991]"
                      />
                    </div>
                  )}
                  
                  {/* Итог */}
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-[#273655] mb-2">Итог</h3>
                    {selectedStorage ? (
                      <div className="space-y-2">
                        {isCalculatingPrice ? (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#273655]"></div>
                            Расчет...
                          </div>
                        ) : (
                          <>
                            {storagePricingBreakdown ? (
                              <div className="space-y-1">
                                <div className="text-sm text-green-600 font-semibold">
                                  Акция: {storagePricingBreakdown.ruleName}
                                </div>
                                {storagePricingBreakdown.promoMonths ? (
                                  <>
                                    <div className="text-sm text-gray-600">
                                      Первые {storagePricingBreakdown.promoMonths} мес:{' '}
                                      <span className="font-semibold text-green-600">{Math.round(storagePricingBreakdown.promoMonthlyAmount).toLocaleString()} ₸/мес</span>
                                      <span className="text-xs text-gray-400 ml-1">({Number(storagePricingBreakdown.promoPrice).toLocaleString()} ₸/м²)</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Далее: <span className="font-semibold">{Math.round(storagePricingBreakdown.standardMonthlyAmount).toLocaleString()} ₸/мес</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-600">
                                    Стоимость хранения за месяц: <span className="font-semibold text-green-600">{Math.round(storagePricingBreakdown.standardMonthlyAmount).toLocaleString()} ₸/мес</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">
                                Стоимость хранения за месяц: <span className="font-semibold text-[#273655]">{storagePrice > 0 ? Math.round(storagePrice / months).toLocaleString() : '0'} ₸</span>
                              </div>
                            )}
                            <div className="text-lg font-bold text-[#273655]">
                              Общая стоимость: {calculateTotalPrice().toLocaleString()} ₸
                            </div>
                            <div className="text-xs text-gray-500">
                              за {months} {months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Выберите бокс на схеме, чтобы увидеть предварительную цену.
                      </p>
                    )}
                  </div>
                  
                  {/* Кнопки действий */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleCreateOrder}
                      disabled={isSubmitting || !selectedStorage}
                      className="w-full bg-gradient-to-r from-[#00A991] to-[#00A991] text-white font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
                    </button>
                    <button
                      onClick={() => setIsCallbackModalOpen(true)}
                      className="w-full bg-gray-100 text-[#273655] font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Заказать обратный звонок
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="CLOUD" className="mt-8">
              {/* Контент для облачного хранения - аналогичная структура */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
                {/* Левая панель */}
                <div className="bg-[#00A991] rounded-3xl p-6 shadow-lg">
                  <div className="mb-4">
                    <Select
                      value={selectedWarehouse?.id?.toString() || ""}
                      onValueChange={(value) => {
                        const warehouse = warehouses.find(w => w.id.toString() === value);
                        if (warehouse) {
                          setSelectedWarehouse(warehouse);
                          if (warehouse.storage?.[0]) {
                            setSelectedStorage(warehouse.storage[0]);
                          }
                        }
                      }}
                    >
                      <SelectTrigger className="w-full bg-white text-[#273655] border-0 rounded-xl h-12 text-base font-medium">
                        <SelectValue placeholder="Выберите склад" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredWarehouses.map((warehouse) => (
                          <SelectItem key={warehouse.id} value={warehouse.id.toString()}>
                            {warehouse.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-white rounded-2xl p-6 text-center text-gray-600">
                    <p>Облачное хранение не требует выбора конкретного бокса</p>
                  </div>
                </div>
                
                {/* Правая панель - аналогичная форма */}
                <div className="bg-white rounded-3xl p-6 shadow-lg">
                  <h2 className="text-2xl font-bold text-[#273655] mb-6">
                    Настройте хранение
                  </h2>
                  
                  {/* Дата начала бронирования */}
                  <div className="mb-6">
                    <DatePicker
                      label="Дата начала бронирования"
                      value={bookingStartDate}
                      onChange={(value) => setBookingStartDate(value)}
                      minDate={new Date().toISOString().split('T')[0]}
                      allowFutureDates={true}
                      placeholder="ДД.ММ.ГГГГ"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#273655] mb-2">
                      Срок аренды (месяцы):
                    </label>
                    <Select
                      value={months.toString()}
                      onValueChange={(value) => setMonths(Number(value))}
                    >
                      <SelectTrigger className="w-full h-12 text-base border-gray-300 rounded-xl">
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
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#273655]" />
                      <span className="text-base font-medium text-[#273655]">Перевозка вещей</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Бесплатно</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-[#273655]" />
                      <span className="text-base font-medium text-[#273655]">Услуги упаковки</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Бесплатно</Badge>
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-[#273655] mb-2">Итог</h3>
                    {selectedStorage ? (
                      <div className="space-y-2">
                        {isCalculatingPrice ? (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#273655]"></div>
                            Расчет...
                          </div>
                        ) : (
                          <>
                            {storagePricingBreakdown ? (
                              <div className="space-y-1">
                                <div className="text-sm text-green-600 font-semibold">
                                  Акция: {storagePricingBreakdown.ruleName}
                                </div>
                                {storagePricingBreakdown.promoMonths ? (
                                  <>
                                    <div className="text-sm text-gray-600">
                                      Первые {storagePricingBreakdown.promoMonths} мес:{' '}
                                      <span className="font-semibold text-green-600">{Math.round(storagePricingBreakdown.promoMonthlyAmount).toLocaleString()} ₸/мес</span>
                                      <span className="text-xs text-gray-400 ml-1">({Number(storagePricingBreakdown.promoPrice).toLocaleString()} ₸/м²)</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      Далее: <span className="font-semibold">{Math.round(storagePricingBreakdown.standardMonthlyAmount).toLocaleString()} ₸/мес</span>
                                    </div>
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-600">
                                    Стоимость хранения за месяц: <span className="font-semibold text-green-600">{Math.round(storagePricingBreakdown.standardMonthlyAmount).toLocaleString()} ₸/мес</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-sm text-gray-600">
                                Стоимость хранения за месяц: <span className="font-semibold text-[#273655]">{storagePrice > 0 ? Math.round(storagePrice / months).toLocaleString() : '0'} ₸</span>
                              </div>
                            )}
                            <div className="text-lg font-bold text-[#273655]">
                              Общая стоимость: {calculateTotalPrice().toLocaleString()} ₸
                            </div>
                            <div className="text-xs text-gray-500">
                              за {months} {months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        Выберите объем для расчета стоимости.
                      </p>
                    )}
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleCreateOrder}
                      disabled={isSubmitting || !selectedStorage}
                      className="w-full bg-gradient-to-r from-[#00A991] to-[#00A991] text-white font-semibold py-4 px-6 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
                    </button>
                    <button
                      onClick={() => setIsCallbackModalOpen(true)}
                      className="w-full bg-gray-100 text-[#273655] font-semibold py-4 px-6 rounded-xl hover:bg-gray-200 transition-colors"
                    >
                      Заказать обратный звонок
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Дополнительные формы (товары, услуги) - показываем в отдельной секции при необходимости */}
          {selectedStorage && (isUserRole || isAdminOrManager) && (
            <div className="mt-8 space-y-8">
          {/* Форма добавления товаров */}
          {(selectedStorage || selectedWarehouse?.type === 'CLOUD') && (isUserRole || isAdminOrManager) && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                {selectedWarehouse?.type === 'CLOUD' ? "2" : "3"}. Добавьте ваши вещи
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="bg-gray-50 rounded-lg p-6 mb-4">
                  {selectedWarehouse?.type === 'CLOUD' ? (
                      <>
                        <p className="text-[#6B6B6B] mb-2">
                          Тип хранения: <span className="font-medium text-[#273655]">Облачное</span>
                        </p>
                        <p className="text-[#6B6B6B]">
                          Выбранный объем:{" "}
                          <span className="font-medium text-[#273655]">
                          {selectedCloudVolume} м³
                        </span>
                        </p>
                      </>
                  ) : (
                      <>
                        <p className="text-[#6B6B6B] mb-2">
                          Выбранный бокс:{" "}
                          <span className="font-medium text-[#273655]">
                          {selectedStorage.name}
                        </span>
                        </p>
                        {/* Информация о бронировании для занятых боксов */}
                        {selectedStorage && (selectedStorage.status === 'OCCUPIED' || selectedStorage.status === 'PENDING') && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#273655]">
                                ИТОГ
                              </div>
                              <div className="text-4xl font-black text-[#273655] tracking-tight">
                                {selectedStorage.name}
                              </div>
                            </div>
                            {isLoadingBookingInfo ? (
                              <div className="text-sm text-[#6B6B6B] flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#273655]"></div>
                                Загрузка информации о бронировании...
                              </div>
                            ) : bookingInfo ? (
                              <p className="text-sm text-[#6B6B6B]">
                                Бокс стоит о бронировании с{" "}
                                <span className="font-medium text-[#273655]">
                                  {new Date(bookingInfo.start_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                                , по{" "}
                                <span className="font-medium text-[#273655]">
                                  {new Date(bookingInfo.end_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                              </p>
                            ) : (
                              <p className="text-sm text-[#6B6B6B]">
                                Бокс занят
                              </p>
                            )}
                          </div>
                        )}
                        <p className="text-[#6B6B6B] mb-2">
                          {selectedWarehouse?.type === 'CLOUD' 
                            ? 'Доступный объем:' 
                            : 'Доступная площадь:'}{" "}
                          <span className="font-medium text-[#273655]">
                          {selectedStorage.available_volume} {selectedWarehouse?.type === 'CLOUD' ? 'м³' : 'м²'}
                        </span>
                        </p>
                        {selectedWarehouse?.type === 'CLOUD' && (
                          <p className="text-[#6B6B6B]">
                            Общий объем ваших вещей:{" "}
                            <span className="font-medium text-[#273655]">
                            {totalVolume.toFixed(2)} м³
                          </span>
                          </p>
                        )}
                        {selectedWarehouse?.type === 'CLOUD' && totalVolume > parseFloat(selectedStorage.available_volume) && (
                            <p className="text-red-600 font-medium mt-2">
                              ⚠️ Объем превышает доступное место в боксе!
                            </p>
                        )}
                      </>
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
                  {selectedWarehouse?.type === 'CLOUD' ? (
                    <MiniVolumeSelector
                      selectedVolume={selectedCloudVolume}
                      onVolumeChange={setSelectedCloudVolume}
                    />
                  ) : null}
                </div>
              </div>
            </div>
          )}
          {/* Ошибка */}
          {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="text-red-600 text-center">{error}</div>
              </div>
          )}
          {/* Дополнительные услуги */}
          {(selectedStorage || selectedWarehouse?.type === 'CLOUD') && (isUserRole || isAdminOrManager) && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                {selectedWarehouse?.type === 'CLOUD' ? "3" : "4"}. Дополнительные услуги
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
                {/* Услуга перевозки */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-[#273655]" />
                      <h3 className="text-lg font-semibold text-[#273655]">Перевозка вещей</h3>
                    </div>
                    <p className="text-gray-500 text-sm mt-1">
                      Мы заберём вещи от вас и привезём обратно
                    </p>
                  </div>
                  {!isCloud ? (
                      <Switch
                          checked={isSelectedMoving}
                          onCheckedChange={(checked) => {
                            setIsSelectedMoving(checked);
                            if (!checked) {
                              // Для обычных пользователей упаковка отключается вместе с перевозкой
                              if (isUserRole) {
                                setIsSelectedPackage(false);
                                setServices([]);
                              }
                              setMovingOrders([]);
                              setMovingOrderErrors([]);
                            }
                          }}
                          className="bg-gray-200 data-[state=checked]:bg-[#273655]"
                      />
                  ) : (
                      <Badge className="bg-green-100 text-green-800">7000 ₸</Badge>
                  )}
                </div>
                {/* Услуга упаковки - показывается если включена перевозка или для ADMIN/MANAGER */}
                {(isSelectedMoving || isAdminOrManager) && (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Package className="w-5 h-5 text-[#273655]" />
                          <h3 className="text-lg font-semibold text-[#273655]">Услуга упаковки</h3>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                          Мы упакуем ваши вещи для безопасного хранения
                        </p>
                      </div>
                      {!isCloud ? (
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
                      ) : (
                          <Badge className="bg-green-100 text-green-800">4000 ₸</Badge>
                      )}
                    </div>
                )}
              </div>
            </div>
          )}
          {/* Блок добавления дат перевозки - показывается если включена перевозка */}
          {(selectedStorage || selectedWarehouse?.type === 'CLOUD') && (isUserRole || isAdminOrManager) && isSelectedMoving && (
              <div className="mb-8">
                <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                  {(() => {
                    let stepNumber = selectedWarehouse?.type === 'CLOUD' ? 4 : 5;
                    return stepNumber;
                  })()}. Укажите даты и адрес доставки
                </h2>
                <div className="space-y-4">
                  {movingOrders.map((order, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-sm font-medium text-[#273655] mb-1">
                              {order.status === 'PENDING' && order.direction === 'TO_WAREHOUSE'
                                  ? 'Дата забора вещей'
                                  : 'Дата доставки вещей'}
                            </label>
                            <DatePicker
                              value={order.moving_date ? new Date(order.moving_date).toISOString().split('T')[0] : ''}
                              onChange={(value) => {
                                if (value) {
                                  const existingDate = order.moving_date ? new Date(order.moving_date) : new Date();
                                  const newDate = new Date(value);
                                  newDate.setHours(existingDate.getHours() || 10, existingDate.getMinutes() || 0, 0, 0);
                                  updateMovingOrder(index, 'moving_date', newDate.toISOString());
                                }
                              }}
                              minDate={order.status === 'PENDING' && order.direction === 'TO_WAREHOUSE' ? new Date().toISOString().split('T')[0] : undefined}
                              allowFutureDates={true}
                              placeholder="ДД.ММ.ГГГГ"
                            />
                          </div>
                          {!isCloud && (
                              <div>
                                <label className="block text-sm font-medium text-[#273655] mb-1">
                                  Тип перевозки
                                </label>
                                <Select
                                    value={`${order.status}:${order.direction || 'TO_WAREHOUSE'}`}
                                    onValueChange={(value) => {
                                      const [status, direction] = value.split(':');
                                      updateMovingOrder(index, "status", status);
                                      updateMovingOrder(index, "direction", direction);
                                    }}
                                >
                                  <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <SelectValue placeholder="Выберите тип перевозки" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="PENDING:TO_WAREHOUSE">
                                      Забрать вещи (От клиента на склад)
                                    </SelectItem>
                                    <SelectItem value="PENDING:TO_CLIENT">
                                      Доставить вещи (Со склада к клиенту)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                          )}
                          <div>
                            <label className="block text-sm font-medium text-[#273655] mb-1">
                              Адрес <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={order.address}
                                onChange={(e) =>
                                    updateMovingOrder(index, 'address', e.target.value)
                                }
                                placeholder="Улица, дом, квартира"
                                className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-colors ${
                                    movingOrderErrors[index]?.address
                                        ? 'border-red-500'
                                        : 'border-gray-300'
                                }`}
                            />
                            {movingOrderErrors[index]?.address && (
                                <p className="text-red-500 text-xs mt-1">
                                  {movingOrderErrors[index]?.address}
                                </p>
                            )}
                          </div>
                        </div>
                        {!isCloud && (
                            <button
                                type="button"
                                onClick={() => removeMovingOrder(index)}
                                className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Удалить
                            </button>
                        )}
                      </div>
                  ))}

                  {!isCloud && (
                      <button
                          type="button"
                          onClick={addMovingOrder}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        Добавить дату перевозки
                      </button>
                  )}
                </div>
              </div>
          )}
          {/* Блок добавления услуг - показывается если включена упаковка или для ADMIN/MANAGER при включенной перевозке */}
          {(selectedStorage && selectedWarehouse?.type !== 'CLOUD') && (isUserRole || isAdminOrManager) && (isSelectedPackage || (isAdminOrManager && isSelectedMoving)) && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                {(() => {
                  let stepNumber = selectedWarehouse?.type === 'CLOUD' ? 5 : 6;
                  if (!isSelectedMoving) stepNumber--;
                  return stepNumber;
                })()}. Добавить услуги {isSelectedPackage ? 'для упаковки' : ''}
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
                        {services.map((service, index) => {
                          const isGazelleService = gazelleService && service.service_id && service.service_id.toString() === gazelleService.id?.toString();
                          return (
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
                                    value={service.service_id ? service.service_id.toString() : ""}
                                    onValueChange={(value) =>
                                      updateService(index, "service_id", value)
                                    }
                                    disabled={isGazelleService}
                                  >
                                    <SelectTrigger className="w-full px-3 py-2 border border-gray-300 rounded-lg" disabled={isGazelleService}>
                                      <SelectValue placeholder="Выберите услугу" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {prices
                                        .filter((price) => {
                                          // Скрываем GAZELLE_FROM, GAZELLE_TO и GAZELLE (добавляются автоматически при перевозке)
                                          if (price.type === "GAZELLE_FROM") return false;
                                          if (price.type === "GAZELLE_TO") return false;
                                          if (price.type === "GAZELLE") return false;
                                          return true;
                                        })
                                        .map((price) => {
                                          // Используем description если есть, иначе getServiceTypeName
                                          const serviceName = price.description || getServiceTypeName(price.type);
                                          // Не показываем услуги без названия
                                          if (!serviceName) return null;
                                          return (
                                            <SelectItem
                                              key={price.id}
                                              value={price.id.toString()}
                                            >
                                              {serviceName}
                                            </SelectItem>
                                          );
                                        })
                                        .filter(Boolean)}
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
                                      !isGazelleService && updateService(index, "count", Number.parseInt(e.target.value) || 1)
                                    }
                                    disabled={isGazelleService}
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
                          );
                        })}
                      </div>
                    )}
                    <button
                      onClick={addService}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors"
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
          {(selectedStorage || selectedWarehouse?.type === 'CLOUD') && (isUserRole || isAdminOrManager) && (
            <div className="mb-8">
              <h2 className="text-[24px] font-bold text-[#273655] mb-4">
                {(() => {
                  let stepNumber = selectedWarehouse?.type === 'CLOUD' ? 5 : 7;
                  if (!isSelectedMoving) stepNumber--;
                  if (!isSelectedPackage) stepNumber--;
                  return stepNumber;
                })()}. Укажите срок аренды
              </h2>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <DatePicker
                      label="Дата начала бронирования"
                      value={bookingStartDate}
                      onChange={(value) => setBookingStartDate(value)}
                      minDate={new Date().toISOString().split('T')[0]}
                      allowFutureDates={true}
                      placeholder="ДД.ММ.ГГГГ"
                    />
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Выберите дату, с которой начнется срок аренды
                    </p>
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
                  
                  {/* Промокод */}
                  {selectedStorage && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-[#273655] mb-2">
                        Промокод
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={promoCodeInput}
                            onChange={(e) => {
                              setPromoCodeInput(e.target.value.toUpperCase());
                              setPromoError("");
                            }}
                            placeholder="Введите промокод"
                            disabled={promoSuccess || isValidatingPromo}
                            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:border-[#273655] ${
                              promoSuccess 
                                ? "border-green-500 bg-green-50" 
                                : promoError 
                                  ? "border-red-500 bg-red-50" 
                                  : "border-gray-300"
                            } disabled:bg-gray-100`}
                          />
                          {promoSuccess && (
                            <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-500" />
                          )}
                        </div>
                        {promoSuccess ? (
                          <button
                            type="button"
                            onClick={handleRemovePromoCode}
                            className="px-4 py-3 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
                          >
                            <X className="w-5 h-5" />
                            <span className="hidden sm:inline">Удалить</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleApplyPromoCode}
                            disabled={isValidatingPromo || !promoCodeInput.trim()}
                            className="px-4 py-3 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          >
                            {isValidatingPromo ? (
                              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <Check className="w-5 h-5" />
                                <span className="hidden sm:inline">Применить</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      {promoError && (
                        <p className="text-sm text-red-600 mt-1">{promoError}</p>
                      )}
                      {promoSuccess && (
                        <p className="text-sm text-green-600 mt-1">
                          Промокод <strong>{promoCode}</strong> применен! Скидка {promoDiscountPercent}% (-{promoDiscount.toLocaleString()} ₸)
                        </p>
                      )}
                    </div>
                  )}

                  {/* Отображение стоимости */}
                  {selectedStorage && (
                    <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                      <div className="text-center">
                        {isCalculatingPrice ? (
                          <div className="text-[20px] font-bold text-[#273655] flex items-center justify-center gap-2">
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#273655]"></div>
                            Расчет...
                          </div>
                        ) : (
                          <>
                            {/* Месячная стоимость хранения */}
                            <div className="mb-3">
                              {storagePricingBreakdown ? (
                                <>
                                  <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 mb-2">
                                    Акция: {storagePricingBreakdown.ruleName}
                                  </div>
                                  {storagePricingBreakdown.promoMonths ? (
                                    <div className="space-y-1">
                                      <div className="text-[14px] text-[#6B6B6B]">
                                        Первые {storagePricingBreakdown.promoMonths} мес:{' '}
                                        <span className="font-bold text-green-600">
                                          {Math.round(storagePricingBreakdown.promoMonthlyAmount).toLocaleString()} ₸/мес
                                        </span>
                                        <span className="text-xs text-gray-400 ml-1">({Number(storagePricingBreakdown.promoPrice).toLocaleString()} ₸/м²)</span>
                                      </div>
                                      <div className="text-[14px] text-[#6B6B6B]">
                                        Далее: <span className="font-bold text-[#273655]">{Math.round(storagePricingBreakdown.standardMonthlyAmount).toLocaleString()} ₸/мес</span>
                                      </div>
                                    </div>
                                  ) : (
                                    <>
                                      <div className="text-[14px] text-[#6B6B6B] mb-1">Стоимость хранения за месяц:</div>
                                      <div className="text-[18px] font-bold text-green-600">
                                        {Math.round(storagePricingBreakdown.standardMonthlyAmount).toLocaleString()} ₸
                                      </div>
                                    </>
                                  )}
                                </>
                              ) : (
                                <>
                                  <div className="text-[14px] text-[#6B6B6B] mb-1">Стоимость хранения за месяц:</div>
                                  <div className="text-[18px] font-bold text-[#273655]">
                                    {storagePrice > 0 ? Math.round(storagePrice / months).toLocaleString() : '0'} ₸
                                  </div>
                                </>
                              )}
                            </div>

                            {/* Общая стоимость услуг */}
                            {(isSelectedPackage || isSelectedMoving) && (
                              <div className="mb-3">
                                <div className="text-[14px] text-[#6B6B6B] mb-1">Стоимость услуг:</div>
                                <div className="text-[18px] font-bold text-[#273655]">
                                  {selectedWarehouse?.type === 'CLOUD' 
                                    ? 'Бесплатно' 
                                    : `${(calculateTotalPrice() - storagePrice).toLocaleString()} ₸`
                                  }
                                </div>
                              </div>
                            )}

                            {/* Скидка по промокоду */}
                            {promoSuccess && promoDiscount > 0 && (
                              <div className="mb-3 bg-green-100 border border-green-300 rounded-lg p-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Tag className="w-4 h-4 text-green-600" />
                                    <span className="text-sm text-green-700">
                                      Промокод <strong>{promoCode}</strong>
                                    </span>
                                  </div>
                                  <span className="text-sm font-semibold text-green-700">
                                    -{promoDiscount.toLocaleString()} ₸
                                  </span>
                                </div>
                              </div>
                            )}

                            {/* Общая стоимость */}
                            <div className="border-t border-green-300 pt-3">
                              <div className="flex items-center justify-between mb-1">
                                <div className="text-[14px] text-[#6B6B6B]">Общая стоимость:</div>
                              </div>
                              <div className="text-[20px] font-bold text-[#273655]">
                                {promoSuccess && promoDiscount > 0 && (
                                  <span className="text-[16px] text-gray-400 line-through mr-2">
                                    {calculateTotalPriceWithoutDiscount().toLocaleString()} ₸
                                  </span>
                                )}
                                {calculateTotalPrice().toLocaleString()} ₸
                              </div>
                              <div className="text-[12px] text-[#6B6B6B] mt-1">
                                за {months} {months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}
                                {selectedWarehouse?.type !== 'CLOUD' && isSelectedPackage && ' + услуги упаковки'}
                                {selectedWarehouse?.type !== 'CLOUD' && isSelectedMoving && ' + услуги перевозки'}
                                {selectedWarehouse?.type === 'CLOUD' && (isSelectedPackage || isSelectedMoving) && ' + услуги бесплатно'}
                                {promoSuccess && promoDiscount > 0 && ` (скидка ${promoDiscountPercent}%)`}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <button
                    onClick={handleCreateOrder}
                    disabled={(() => {
                      const validItems = orderItems.filter((item) => {
                        if (selectedWarehouse?.type === 'CLOUD') {
                          return item.name.trim(); // Для облачного хранения нужен только название
                        } else {
                          return item.name.trim();
                        }
                      });
                      const hasValidItems = validItems.length > 0;
                      const volumeExceeded = selectedWarehouse?.type === 'CLOUD' && totalVolume > parseFloat(selectedStorage.available_volume);
                      const movingSelectedButNoOrders = isSelectedMoving && movingOrders.length === 0;
                      const movingSelectedButNoAddresses = isSelectedMoving && movingOrders.some(order => !order.address || order.address.trim() === "");
                      // Для ADMIN/MANAGER услуги не обязательны, даже если упаковка включена
                      const packageSelectedButNoServices = isSelectedPackage && isUserRole && (services.filter(s => s.service_id && s.count > 0).length === 0 && !isCloud);
                      
                      const isDisabled = isSubmitting ||
                        !selectedStorage ||
                        !hasValidItems ||
                        volumeExceeded ||
                        movingSelectedButNoOrders ||
                        movingSelectedButNoAddresses ||
                        packageSelectedButNoServices;
                      
                      console.log('Кнопка "Создать заявку" - проверка условий:', {
                        isSubmitting,
                        selectedStorage: !!selectedStorage,
                        hasValidItems,
                        validItemsCount: validItems.length,
                        volumeExceeded,
                        totalVolume,
                        availableVolume: selectedStorage?.available_volume,
                        movingSelectedButNoOrders,
                        movingSelectedButNoAddresses,
                        packageSelectedButNoServices,
                        isSelectedMoving,
                        isSelectedPackage,
                        movingOrdersLength: movingOrders.length,
                        servicesCount: services.filter(s => s.service_id && s.count > 0).length,
                        isCloud,
                        isDisabled
                      });
                      
                      return isDisabled;
                    })()}
                    className="w-full h-[56px] bg-[#F86812] text-white text-[18px] font-bold rounded-lg hover:bg-[#d87d1c] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ boxShadow: "4px 4px 8px 0 #B0B0B0" }}
                  >
                    {isSubmitting ? "СОЗДАНИЕ ЗАКАЗА..." : "СОЗДАТЬ ЗАКАЗ"}
                  </button>
                </div>
              </div>
          )}
          {(selectedStorage || selectedWarehouse?.type === 'CLOUD') && !isAuthenticated && (
              <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold text-[#273655] mb-2">
                  Хотите арендовать этот бокс?
                </h3>
                <p className="text-[#6B6B6B] mb-4">
                  Войдите или зарегистрируйтесь, чтобы продолжить оформление заказа
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button
                      onClick={() => navigate('/login', { state: { from: '/warehouse-order' } })}
                      className="w-full sm:w-auto px-6 py-3 bg-[#273655] text-white rounded-lg hover:bg-[#1e2a4a] transition-colors"
                  >
                    Войти
                  </button>
                  <button
                      onClick={() => navigate('/register', { state: { from: '/warehouse-order' } })}
                      className="w-full sm:w-auto px-6 py-3 bg-[#F86812] text-white rounded-lg hover:bg-[#d87d1c] transition-colors"
                  >
                    Зарегистрироваться
                  </button>
                </div>
              </div>
          )}
            </div>
          )}
        </div>
        <Footer />
      </div>
      
      <CallbackRequestModal
        open={isCallbackModalOpen}
        onOpenChange={setIsCallbackModalOpen}
        title="Связаться с поддержкой"
        description="Вы уже забронировали максимальное количество боксов (2). Для аренды дополнительных боксов оставьте заявку, и наш менеджер свяжется с вами."
      />
    </ProfileValidationGuard>
  );
});

WarehouseOrderPage.displayName = "WarehouseOrderPage";
export default WarehouseOrderPage;