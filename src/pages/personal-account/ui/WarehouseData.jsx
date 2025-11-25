import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { paymentsApi } from '../../../shared/api/paymentsApi';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import WarehouseCanvasViewer from '../../../shared/components/WarehouseCanvasViewer';
import { SmartButton } from '../../../shared/components/SmartButton.js';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Switch,
} from '../../../components/ui';
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover';
import { Truck, Package, X, Info, Plus, Trash2, User } from 'lucide-react';
import { Dropdown } from '../../../shared/components/Dropdown';
import ClientSelector from '../../../shared/components/ClientSelector';
import PendingOrderModal from './PendingOrderModal';
import { ordersApi } from '../../../shared/api/ordersApi';

const MOVING_SERVICE_ESTIMATE = 7000;
const PACKING_SERVICE_ESTIMATE = 4000;

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
      return "Стрейч-плёнка";
    case "BOX_SIZE":
      return "Коробка";
    case "MARKER":
      return "Маркер";
    case "UTILITY_KNIFE":
      return "Канцелярский нож";
    case "BUBBLE_WRAP_1":
      return "Воздушно-пузырчатая плёнка 10м";
    case "BUBBLE_WRAP_2":
      return "Воздушно-пузырчатая плёнка 120м";
    default:
      return "Услуга";
  }
};

const WarehouseData = () => {
  const navigate = useNavigate();
  const { warehouseId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeNav, setActiveNav] = useState('warehouses');
  const [isCloud, setIsCloud] = useState(false);
  const [servicePrices, setServicePrices] = useState({});
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [individualMonths, setIndividualMonths] = useState('1');
  const [cloudMonths, setCloudMonths] = useState('1');
  const [cloudDimensions, setCloudDimensions] = useState({ width: 1, height: 1, length: 1 });
  const [includeMoving, setIncludeMoving] = useState(false);
  const [includePacking, setIncludePacking] = useState(false);
  const [movingAddressFrom, setMovingAddressFrom] = useState('');
  const [cloudPickupAddress, setCloudPickupAddress] = useState('');
  const [previewStorage, setPreviewStorage] = useState(null);
  const [pricePreview, setPricePreview] = useState(null);
  const [isPriceCalculating, setIsPriceCalculating] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [cloudPricePreview, setCloudPricePreview] = useState(null);
  const [isCloudPriceCalculating, setIsCloudPriceCalculating] = useState(false);
  const [cloudPriceError, setCloudPriceError] = useState(null);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [services, setServices] = useState([]);
  const [gazelleService, setGazelleService] = useState(null);
  const [selectedClientUser, setSelectedClientUser] = useState(null);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [isPendingOrderModalOpen, setIsPendingOrderModalOpen] = useState(false);
  const [isLoadingPendingOrder, setIsLoadingPendingOrder] = useState(false);
  const [isUnbooking, setIsUnbooking] = useState(false);
  
  // Проверка, является ли пользователь менеджером или админом
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isDirty }
  } = useForm();
  
  const [initialFormData, setInitialFormData] = useState(null);

  // Компонент InfoHint для подсказок
  const InfoHint = ({ description, ariaLabel = 'Подробнее', align = 'end', side = 'bottom' }) => (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={ariaLabel}
          title={ariaLabel}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-transparent text-[#6B6B6B] transition-colors hover:border-[#d7dbe6] hover:text-[#273655] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#273655]/30"
        >
          <Info className="h-4 w-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side={side}
        sideOffset={8}
        className="max-w-xs rounded-2xl border border-[#d7dbe6] bg-white p-4 text-sm leading-relaxed text-[#273655] shadow-xl"
      >
        {description}
      </PopoverContent>
    </Popover>
  );

  // Проверка мобильного вида
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Блокировка скролла при открытом модальном окне
  useEffect(() => {
    if (isMapModalOpen) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isMapModalOpen]);

  // Расчет объема для CLOUD
  const cloudVolume = useMemo(() => {
    return cloudDimensions.width * cloudDimensions.height * cloudDimensions.length;
  }, [cloudDimensions]);

  // Расчет месяцев для INDIVIDUAL
  const monthsNumber = useMemo(() => {
    const parsed = parseInt(individualMonths, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [individualMonths]);

  // Расчет месяцев для CLOUD
  const cloudMonthsNumber = useMemo(() => {
    const parsed = parseInt(cloudMonths, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [cloudMonths]);

  // Загрузка всех складов для выбора
  useEffect(() => {
    const fetchAllWarehouses = async () => {
      try {
        setWarehousesLoading(true);
        const data = await warehouseApi.getAllWarehouses();
        setAllWarehouses(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Ошибка при загрузке списка складов:', error);
      } finally {
        setWarehousesLoading(false);
      }
    };

    fetchAllWarehouses();
  }, []);

  // Обработка смены склада
  const handleWarehouseChange = (newWarehouseId) => {
    if (newWarehouseId && newWarehouseId !== warehouseId) {
      navigate(`/personal-account/${user?.role === 'ADMIN' ? 'admin' : 'manager'}/warehouses/${newWarehouseId}`);
      setPreviewStorage(null);
      setPricePreview(null);
      setPriceError(null);
    }
  };

  // Расчет цены для INDIVIDUAL складов
  useEffect(() => {
    let isCancelled = false;

    const calculatePrice = async () => {
      if (isCloud || !warehouse) {
        setPricePreview(null);
        setPriceError(null);
        return;
      }

      if (!previewStorage) {
        setPricePreview(null);
        setPriceError(null);
        return;
      }

      if (!monthsNumber || monthsNumber <= 0) {
        setPricePreview(null);
        setPriceError(null);
        return;
      }

      const rawArea = parseFloat(
        previewStorage.available_volume ??
        previewStorage.total_volume ??
        previewStorage.area ??
        previewStorage.square ??
        previewStorage.volume ??
        ""
      );

      if (!rawArea || Number.isNaN(rawArea) || rawArea <= 0) {
        setPricePreview(null);
        setPriceError("Для выбранного бокса отсутствуют данные по площади/объёму.");
        return;
      }

      setIsPriceCalculating(true);
      setPriceError(null);

      try {
        const payload = {
          storageType: "INDIVIDUAL",
          months: monthsNumber,
          area: rawArea,
          services: [],
          warehouse_id: warehouse.id,
        };

        const response = await warehouseApi.calculateBulkPrice(payload);

        if (isCancelled) return;

        const storagePrice = response?.storage?.price;

        if (typeof storagePrice === "number" && !Number.isNaN(storagePrice) && storagePrice > 0) {
          setPricePreview({
            total: storagePrice,
            monthly: storagePrice / monthsNumber,
            isFallback: false,
          });
        } else {
          const fallback = (parseFloat(previewStorage.price) || 0) * monthsNumber;
          if (fallback > 0) {
            setPricePreview({
              total: fallback,
              monthly: fallback / monthsNumber,
              isFallback: true,
            });
          } else {
            setPricePreview(null);
            setPriceError("Не удалось получить предварительный расчёт стоимости.");
          }
        }
      } catch (error) {
        console.error("Ошибка при расчёте предварительной стоимости:", error);
        if (isCancelled) return;

        const fallback = monthsNumber && previewStorage?.price
          ? (parseFloat(previewStorage.price) || 0) * monthsNumber
          : null;

        if (fallback) {
          setPricePreview({
            total: fallback,
            monthly: fallback / monthsNumber,
            isFallback: true,
          });
          setPriceError("Показана ориентировочная стоимость по тарифу бокса.");
        } else {
          setPricePreview(null);
          setPriceError("Не удалось рассчитать стоимость. Попробуйте позже.");
        }
      } finally {
        if (!isCancelled) {
          setIsPriceCalculating(false);
        }
      }
    };

    calculatePrice();

    return () => {
      isCancelled = true;
    };
  }, [isCloud, warehouse, monthsNumber, previewStorage]);

  // Расчет цены для CLOUD складов
  useEffect(() => {
    let isCancelled = false;

    const calculateCloudPrice = async () => {
      if (!isCloud || !warehouse) {
        setCloudPricePreview(null);
        setCloudPriceError(null);
        return;
      }

      if (!cloudMonthsNumber || cloudMonthsNumber <= 0) {
        setCloudPricePreview(null);
        setCloudPriceError(null);
        return;
      }

      if (!cloudVolume || cloudVolume <= 0) {
        setCloudPricePreview(null);
        setCloudPriceError("Укажите габариты вещей, чтобы рассчитать объём хранения.");
        return;
      }

      setIsCloudPriceCalculating(true);
      setCloudPriceError(null);

      try {
        const payload = {
          storageType: "CLOUD",
          months: cloudMonthsNumber,
          volume: cloudVolume,
          services: [],
        };

        const response = await warehouseApi.calculateBulkPrice(payload);
        if (isCancelled) return;

        const storagePrice = response?.storage?.price;

        if (typeof storagePrice === "number" && !Number.isNaN(storagePrice) && storagePrice > 0) {
          setCloudPricePreview({
            total: storagePrice,
            monthly: storagePrice / cloudMonthsNumber,
            isFallback: false,
          });
        } else {
          setCloudPricePreview(null);
          setCloudPriceError("Не удалось получить предварительный расчёт стоимости.");
        }
      } catch (error) {
        console.error("Ошибка при расчёте стоимости облачного хранения:", error);
        if (isCancelled) return;
        setCloudPricePreview(null);
        setCloudPriceError("Не удалось рассчитать стоимость. Попробуйте позже или уточните у менеджера.");
      } finally {
        if (!isCancelled) {
          setIsCloudPriceCalculating(false);
        }
      }
    };

    calculateCloudPrice();

    return () => {
      isCancelled = true;
    };
  }, [isCloud, warehouse, cloudMonthsNumber, cloudVolume]);

  // Загрузка опций услуг
  const ensureServiceOptions = useCallback(async () => {
    if (serviceOptions.length > 0) {
      return serviceOptions;
    }

    if (isServicesLoading) {
      return serviceOptions;
    }

    try {
      setIsServicesLoading(true);
      setServicesError(null);
      const pricesData = await paymentsApi.getPrices();
      const filteredPrices = pricesData.filter((price) => {
        if (price.id <= 4) return false;
        const excludedTypes = [
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
        ];
        return !excludedTypes.includes(price.type);
      });
      setServiceOptions(filteredPrices);
      return filteredPrices;
    } catch (error) {
      console.error("Ошибка при загрузке услуг:", error);
      setServicesError("Не удалось загрузить список услуг. Попробуйте позже.");
      return [];
    } finally {
      setIsServicesLoading(false);
    }
  }, [serviceOptions, isServicesLoading]);

  // Управление услугами
  const addServiceRow = useCallback(() => {
    setServices((prev) => [...prev, { service_id: "", count: 1 }]);
  }, []);

  const updateServiceRow = useCallback((index, field, value) => {
    setServices((prev) =>
      prev.map((service, i) =>
        i === index
          ? {
              ...service,
              [field]: field === "count" ? Math.max(1, Number(value) || 1) : value,
            }
          : service
      )
    );
  }, []);

  const removeServiceRow = useCallback((index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  }, []);

  // Синхронизация услуги "Газель" по количеству перевозок (2 для туда и обратно)
  const syncGazelleService = useCallback((currentServices) => {
    if (!gazelleService || !includeMoving) {
      return currentServices.filter((s) => s.service_id?.toString() !== gazelleService?.id?.toString());
    }

    const gazelleId = gazelleService.id?.toString();
    const existingIndex = currentServices.findIndex((s) => s.service_id?.toString() === gazelleId);
    const updated = [...currentServices];

    if (existingIndex >= 0) {
      // Обновляем количество (2 для туда и обратно)
      updated[existingIndex] = { ...updated[existingIndex], count: 2 };
    } else {
      // Добавляем "Газель" с количеством 2
      updated.push({ service_id: gazelleService.id, count: 2 });
    }

    return updated;
  }, [gazelleService, includeMoving]);

  // Автоматическое добавление услуги GAZELLE при включении перевозки
  useEffect(() => {
    if (!includeMoving) {
      setGazelleService(null);
      return;
    }

    if (serviceOptions.length === 0) {
      ensureServiceOptions();
      return;
    }

    const gazelle = serviceOptions.find((option) => option.type === "GAZELLE");
    if (gazelle) {
      setGazelleService({
        id: String(gazelle.id),
        type: gazelle.type,
        name: getServiceTypeName(gazelle.type) || gazelle.description || "Газель",
        price: gazelle.price,
      });
    } else {
      setGazelleService(null);
    }
  }, [includeMoving, serviceOptions, ensureServiceOptions]);

  // Расчет стоимости услуг (перевозка, упаковка)
  const serviceSummary = useMemo(() => {
    const breakdown = [];
    let total = 0;

    // Перевозка вещей (туда и обратно)
    if (includeMoving && gazelleService) {
      const count = 2; // Забор и доставка
      const amount = (gazelleService.price ?? MOVING_SERVICE_ESTIMATE) * count;
      total += amount;
      breakdown.push({
        label: gazelleService.name || "Перевозка вещей",
        amount,
      });
    }

    // Услуги упаковки
    if (includePacking) {
      services.forEach((service) => {
        if (!service?.service_id || !service?.count || service.count <= 0) {
          return;
        }
        const option = serviceOptions.find((item) => String(item.id) === String(service.service_id));
        const unitPrice = option?.price ?? PACKING_SERVICE_ESTIMATE;
        const amount = unitPrice * service.count;
        total += amount;
        breakdown.push({
          label: option?.description || getServiceTypeName(option?.type) || "Услуга",
          amount,
        });
      });
    }

    return {
      total,
      breakdown,
    };
  }, [includeMoving, includePacking, gazelleService, services, serviceOptions]);

  // Итоговая стоимость для INDIVIDUAL
  const costSummary = useMemo(() => {
    const baseMonthly = pricePreview ? Math.round(pricePreview.monthly) : null;
    const baseTotal = pricePreview ? Math.round(pricePreview.total) : null;
    const serviceTotal = serviceSummary.total;
    const combinedTotal = (baseTotal || 0) + serviceTotal;

    return {
      baseMonthly,
      baseTotal,
      serviceTotal,
      combinedTotal,
    };
  }, [pricePreview, serviceSummary.total]);

  // Сброс выбранного бокса при смене склада
  useEffect(() => {
    setPreviewStorage(null);
    setPricePreview(null);
    setPriceError(null);
  }, [warehouseId]);

  // Определяем режим редактирования из URL параметров
  useEffect(() => {
    const editMode = searchParams.get('edit') === 'true';
    setIsEditing(editMode);
  }, [searchParams]);

  // Загрузка данных склада
  useEffect(() => {
    const fetchWarehouse = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await warehouseApi.getWarehouseById(warehouseId);
        setWarehouse(data);
        setIsCloud(data.type === "CLOUD");
        
        // Загружаем цены услуг для склада
        try {
          let pricesMap = {};
          
          // Определяем типы цен в зависимости от типа склада
          const priceTypes = data.type === 'CLOUD' 
            ? ['M3_UP_6M', 'M3_6_12M', 'M3_OVER_12M', 'M3_01_UP_6M', 'M3_01_6_12M', 'M3_01_OVER_12M']
            : ['M2_UP_6M', 'M2_6_12M', 'M2_OVER_12M', 'M2_01_UP_6M', 'M2_01_6_12M', 'M2_01_OVER_12M'];
          
          if (data.type === 'CLOUD') {
            // Для CLOUD складов получаем цены из /prices
            const allPrices = await warehouseApi.getAllServicePrices();
            // Фильтруем только нужные типы цен для CLOUD
            const cloudPrices = allPrices.filter(price => priceTypes.includes(price.type));
            // Преобразуем массив цен в объект для удобства
            cloudPrices.forEach(price => {
              pricesMap[price.type] = parseFloat(price.price);
            });
          } else {
            // Для INDIVIDUAL складов получаем цены из warehouse-service-prices
            const prices = await warehouseApi.getWarehouseServicePrices(warehouseId);
            // Преобразуем массив цен в объект для удобства
            prices.forEach(price => {
              pricesMap[price.service_type] = parseFloat(price.price);
            });
          }
          
          setServicePrices(pricesMap);
          
          // Заполняем форму данными склада и ценами
          const formData = {
            name: data.name || '',
            address: data.address || '',
            work_start: data.work_start || '',
            work_end: data.work_end || '',
            status: data.status || 'AVAILABLE',
            total_volume: data.storage?.[0]?.total_volume || '',
            ...priceTypes.reduce((acc, type) => {
              acc[type] = pricesMap[type] || '';
              return acc;
            }, {})
          };
          
          reset(formData);
          // Сохраняем исходные данные для сравнения
          setInitialFormData(formData);
        } catch (priceError) {
          console.warn('Не удалось загрузить цены склада:', priceError);
          // Если цены не загрузились, используем пустые значения
          const priceTypes = data.type === 'CLOUD' 
            ? ['M3_UP_6M', 'M3_6_12M', 'M3_OVER_12M', 'M3_01_UP_6M', 'M3_01_6_12M', 'M3_01_OVER_12M']
            : ['M2_UP_6M', 'M2_6_12M', 'M2_OVER_12M', 'M2_01_UP_6M', 'M2_01_6_12M', 'M2_01_OVER_12M'];
          
          const emptyFormData = {
            name: data.name || '',
            address: data.address || '',
            work_start: data.work_start || '',
            work_end: data.work_end || '',
            status: data.status || 'AVAILABLE',
            total_volume: data.storage?.[0]?.total_volume || '',
            ...priceTypes.reduce((acc, type) => {
              acc[type] = '';
              return acc;
            }, {})
          };
          reset(emptyFormData);
          // Сохраняем исходные данные для сравнения
          setInitialFormData(emptyFormData);
        }

        if (import.meta.env.DEV) {
          console.log('Данные склада загружены:', data);
        }
      } catch (error) {
        console.error('Ошибка при загрузке склада:', error);
        setError('Не удалось загрузить данные склада. Попробуйте позже.');
        toast.error('Ошибка загрузки данных склада');
      } finally {
        setIsLoading(false);
      }
    };

    if (warehouseId) {
      fetchWarehouse();
    }
  }, [warehouseId, reset]);

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);
      
      // Обрезаем секунды от времени (09:00:00 -> 09:00)
      const formatTime = (timeString) => {
        if (!timeString) return timeString;
        return timeString.substring(0, 5); // Берем только HH:MM
      };

      // Определяем типы цен в зависимости от типа склада
      const priceTypes = warehouse?.type === 'CLOUD' 
        ? ['M3_UP_6M', 'M3_6_12M', 'M3_OVER_12M', 'M3_01_UP_6M', 'M3_01_6_12M', 'M3_01_OVER_12M']
        : ['M2_UP_6M', 'M2_6_12M', 'M2_OVER_12M', 'M2_01_UP_6M', 'M2_01_6_12M', 'M2_01_OVER_12M'];

      // Сравниваем текущие значения с исходными и собираем только измененные поля
      const updateData = {};
      
      if (!initialFormData) {
        // Если исходные данные не загружены, отправляем все данные
        updateData.name = data.name;
        // Для CLOUD складов адрес может быть пустым
        updateData.address = isCloud && (!data.address || data.address.trim() === '') 
          ? null 
          : data.address;
        updateData.work_start = formatTime(data.work_start);
        updateData.work_end = formatTime(data.work_end);
        updateData.status = data.status;
        if (isCloud && data.total_volume !== undefined) {
          updateData.total_volume = data.total_volume;
        }
      } else {
        // Сравниваем и добавляем только измененные поля
        if (data.name !== initialFormData.name) {
          updateData.name = data.name;
        }
        
        // Для CLOUD складов адрес может быть пустым, для INDIVIDUAL - обязателен
        // Нормализуем значения для сравнения (пустая строка = null для CLOUD)
        const currentAddress = isCloud && (!data.address || data.address.trim() === '') 
          ? null 
          : data.address;
        const initialAddress = isCloud && (!initialFormData.address || initialFormData.address.trim() === '') 
          ? null 
          : initialFormData.address;
        
        if (currentAddress !== initialAddress) {
          updateData.address = currentAddress;
        }
        
        if (formatTime(data.work_start) !== formatTime(initialFormData.work_start)) {
          updateData.work_start = formatTime(data.work_start);
        }
        
        if (formatTime(data.work_end) !== formatTime(initialFormData.work_end)) {
          updateData.work_end = formatTime(data.work_end);
        }
        
        if (data.status !== initialFormData.status) {
          updateData.status = data.status;
        }
        
        if (isCloud && data.total_volume !== initialFormData.total_volume) {
          updateData.total_volume = data.total_volume;
        }
      }

      // Формируем массив измененных цен для отправки
      const changedPrices = [];
      if (initialFormData) {
        priceTypes.forEach(type => {
          const currentValue = data[type];
          const initialValue = initialFormData[type];
          
          // Проверяем, изменилась ли цена
          if (currentValue !== undefined && currentValue !== '' && currentValue !== null) {
            const currentPrice = parseFloat(currentValue);
            const initialPrice = initialValue ? parseFloat(initialValue) : null;
            
            if (currentPrice !== initialPrice) {
              changedPrices.push({
                service_type: type,
                price: currentPrice
              });
            }
          }
        });
      } else {
        // Если исходные данные не загружены, отправляем все цены
        priceTypes.forEach(type => {
          if (data[type] !== undefined && data[type] !== '' && data[type] !== null) {
            changedPrices.push({
              service_type: type,
              price: parseFloat(data[type])
            });
          }
        });
      }

      // Добавляем цены только если есть изменения
      if (changedPrices.length > 0) {
        updateData.service_prices = changedPrices;
      }

      // Проверяем, есть ли что отправлять
      if (Object.keys(updateData).length === 0) {
        toast.info('Нет изменений для сохранения');
        setIsSaving(false);
        return;
      }

      if (import.meta.env.DEV) {
        console.log('Отправляемые данные для обновления склада (только измененные):', updateData);
      }

      await warehouseApi.updateWarehouse(warehouseId, updateData);

      // Обновляем локальные данные только для измененных полей
      setWarehouse(prev => {
        const updated = { ...prev };
        if (updateData.name !== undefined) updated.name = updateData.name;
        if (updateData.address !== undefined) updated.address = updateData.address;
        if (updateData.work_start !== undefined) updated.work_start = updateData.work_start;
        if (updateData.work_end !== undefined) updated.work_end = updateData.work_end;
        if (updateData.status !== undefined) updated.status = updateData.status;
        if (updateData.total_volume !== undefined && updated.storage?.[0]) {
          updated.storage[0].total_volume = updateData.total_volume;
        }
        return updated;
      });
      
      // Обновляем локальные цены только для измененных
      if (updateData.service_prices) {
        const updatedPrices = { ...servicePrices };
        updateData.service_prices.forEach(sp => {
          updatedPrices[sp.service_type] = sp.price;
        });
        setServicePrices(updatedPrices);
      }
      
      // Обновляем исходные данные формы после успешного сохранения
      const currentValues = getValues();
      const updatedInitialData = { ...initialFormData };
      
      // Обновляем все поля, которые были изменены
      Object.keys(updateData).forEach(key => {
        if (key !== 'service_prices') {
          updatedInitialData[key] = currentValues[key];
        }
      });
      
      // Обновляем цены
      if (updateData.service_prices) {
        updateData.service_prices.forEach(sp => {
          updatedInitialData[sp.service_type] = sp.price.toString();
        });
      }
      
      setInitialFormData(updatedInitialData);
      
      toast.success('Данные склада успешно обновлены');
      
      if (import.meta.env.DEV) {
        console.log('Склад успешно обновлен:', updateData);
      }

      // Автоматическое перенаправление на список складов после успешного сохранения
      setTimeout(() => {
        navigate('/personal-account', { state: { activeSection: 'warehouses' } });
      }, 1000);
    } catch (error) {
      console.error('Ошибка при обновлении склада:', error);
      
      // Показываем детали ошибки валидации если они есть
      if (error.response?.data?.details) {
        console.error('Детали ошибки валидации:', error.response.data.details);
        toast.error(`Ошибка валидации: ${error.response.data.details.map(d => d.message || d).join(', ')}`);
      } else {
        toast.error('Не удалось обновить данные склада');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackToList = () => {
    navigate('/personal-account', { state: { activeSection: 'warehouses' } });
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Убираем параметр edit из URL
    navigate(`/personal-account/${user?.role === 'ADMIN' ? 'admin' : 'manager'}/warehouses/${warehouseId}`, { replace: true });
    
    // Определяем типы цен в зависимости от типа склада
    const priceTypes = warehouse?.type === 'CLOUD' 
      ? ['M3_UP_6M', 'M3_6_12M', 'M3_OVER_12M', 'M3_01_UP_6M', 'M3_01_6_12M', 'M3_01_OVER_12M']
      : ['M2_UP_6M', 'M2_6_12M', 'M2_OVER_12M', 'M2_01_UP_6M', 'M2_01_6_12M', 'M2_01_OVER_12M'];
    
    const cancelFormData = {
      name: warehouse.name || '',
      address: warehouse?.address || '',
      work_start: warehouse.work_start || '',
      work_end: warehouse.work_end || '',
      status: warehouse.status || 'AVAILABLE',
      total_volume: warehouse.storage?.[0]?.total_volume || '',
      ...priceTypes.reduce((acc, type) => {
        acc[type] = servicePrices[type] || '';
        return acc;
      }, {})
    };
    reset(cancelFormData);
    // Восстанавливаем исходные данные при отмене (если они были)
    if (initialFormData) {
      setInitialFormData(cancelFormData);
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
    const basePath = user?.role === 'ADMIN' ? 'admin' : 'manager';
    navigate(`/personal-account/${basePath}/warehouses/${warehouseId}?edit=true`, { replace: true });
  };

  const getStatusDisplay = (status) => {
    return status === 'AVAILABLE' ? 'Активный' : 'Неактивный';
  };

  const getStatusBadge = (status) => {
    if (status === 'AVAILABLE') {
      return 'bg-green-100 text-green-800 border border-green-200';
    }
    return 'bg-gray-100 text-gray-800 border border-gray-200';
  };

  // Функция для форматирования времени (убираем секунды)
  const formatTime = (timeString) => {
    if (!timeString) return timeString;
    return timeString.substring(0, 5); // Берем только HH:MM
  };

  const getStatCard = (title, value, icon, color = 'text-gray-600') => (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-lg bg-gray-50 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
              {/* Заголовок загрузки */}
              <div className="flex items-center space-x-4">
                <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
              </div>

              {/* Карточки загрузки */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !warehouse) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <div className="flex flex-1">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          <main className="flex-1 p-6">
            <div className="max-w-6xl mx-auto">
              <div className="bg-white rounded-xl border border-red-200 shadow-sm">
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
                  <p className="text-gray-600 mb-6">{error || 'Склад не найден'}</p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={handleBackToList}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Назад к списку
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center px-4 py-2 bg-[#273655] hover:bg-[#1e2c4f] text-white text-sm font-medium rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Повторить
                    </button>
                  </div>
                </div>
              </div>
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
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="flex-1 p-6">
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Breadcrumb и заголовок */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button 
                  onClick={handleBackToList}
                  className="inline-flex items-center text-gray-600 hover:text-[#273655] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Склады</span>
                </button>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-900">{warehouse.name}</h1>
              </div>

              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center px-4 py-2 bg-[#273655] hover:bg-[#1e2c4f] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Редактировать
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Основная информация */}
              <div className="lg:col-span-2 space-y-6">
                {!isEditing ? (
                  // Режим просмотра
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900">Информация о складе</h2>
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(warehouse.status)}`}>
                          <div className={`w-2 h-2 rounded-full mr-2 ${warehouse.status === 'AVAILABLE' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          {getStatusDisplay(warehouse.status)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Название</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">{warehouse.name}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-500">Время работы</label>
                            <div className="flex items-center mt-1">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <p className="text-gray-900">{formatTime(warehouse.work_start)} - {formatTime(warehouse.work_end)}</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Адрес</label>
                          <div className="flex items-start mt-1">
                            <svg className="w-4 h-4 mr-2 mt-1 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <p className="text-gray-900">{warehouse?.address}</p>
                          </div>
                        </div>
                      </div>

                      {warehouse.latitude && warehouse.longitude && (
                        <div className="pt-4 border-t border-gray-100">
                          <label className="text-sm font-medium text-gray-500">Координаты</label>
                          <p className="text-gray-900 mt-1">{warehouse.latitude}, {warehouse.longitude}</p>
                        </div>
                      )}

                      {/* Секция цен в режиме просмотра */}
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                          Цены за {isCloud ? '1 м³' : '1 м²'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">До 6 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_UP_6M' : 'M2_UP_6M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_UP_6M' : 'M2_UP_6M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">От 6 до 12 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_6_12M' : 'M2_6_12M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_6_12M' : 'M2_6_12M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">Свыше 12 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Секция цен за 0.1 м²/м³ в режиме просмотра */}
                      <div className="pt-4 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">
                          Цены за {isCloud ? '0.1 м³' : '0.1 м²'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">До 6 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">От 6 до 12 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <label className="text-xs font-medium text-gray-500">Свыше 12 месяцев</label>
                            <p className="text-lg font-semibold text-gray-900 mt-1">
                              {servicePrices[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M'] 
                                ? `${Number(servicePrices[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Режим редактирования
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-lg font-semibold text-gray-900">Редактирование склада</h2>
                      <p className="text-sm text-gray-600 mt-1">Внесите изменения в информацию о складе</p>
                    </div>
                    
                    <form onSubmit={handleSubmit(onSubmit)} className="p-6">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Название склада *
                            </label>
                            <input
                              type="text"
                              {...register('name', { required: 'Название обязательно' })}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Введите название склада"
                            />
                            {errors.name && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.name.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Статус
                            </label>
                            <select
                              {...register('status')}
                              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors"
                            >
                              <option value="AVAILABLE">Активный</option>
                              <option value="UNAVAILABLE">Неактивный</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Адрес {!isCloud && '*'}
                          </label>
                          <textarea
                            {...register('address', { 
                              required: !isCloud ? 'Адрес обязателен' : false
                            })}
                            rows={3}
                            className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors resize-none ${
                              errors.address ? 'border-red-300 bg-red-50' : 'border-gray-300'
                            }`}
                            placeholder={isCloud ? "Адрес склада (необязательно)" : "Введите полный адрес склада"}
                          />
                          {errors.address && (
                            <p className="mt-1 text-sm text-red-600 flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {errors.address.message}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Время открытия *
                            </label>
                            <input
                              type="time"
                              {...register('work_start', { required: 'Время начала обязательно' })}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                errors.work_start ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {errors.work_start && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.work_start.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Время закрытия *
                            </label>
                            <input
                              type="time"
                              {...register('work_end', { required: 'Время окончания обязательно' })}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                errors.work_end ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                            />
                            {errors.work_end && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.work_end.message}
                              </p>
                            )}
                          </div>
                        </div>

                        {isCloud && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Вместимость (м²) *
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              {...register('total_volume', { required: 'Вместимость обязательна', valueAsNumber: true })}
                              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                errors.total_volume ? 'border-red-300 bg-red-50' : 'border-gray-300'
                              }`}
                              placeholder="Введите вместимость склада в м²"
                            />
                            {errors.total_volume && (
                              <p className="mt-1 text-sm text-red-600 flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {errors.total_volume.message}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Секция цен */}
                        <div className="pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Цены за {isCloud ? '1 м³' : '1 м²'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Установите цены с учетом скидок за длительный период хранения
                          </p>
                          
                          <div className="space-y-4">
                            {/* Цена до 6 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена до 6 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_UP_6M' : 'M2_UP_6M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_UP_6M' : 'M2_UP_6M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_UP_6M' : 'M2_UP_6M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_UP_6M' : 'M2_UP_6M'].message}
                                </p>
                              )}
                            </div>

                            {/* Цена от 6 до 12 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена от 6 до 12 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_6_12M' : 'M2_6_12M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_6_12M' : 'M2_6_12M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_6_12M' : 'M2_6_12M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_6_12M' : 'M2_6_12M'].message}
                                </p>
                              )}
                            </div>

                            {/* Цена свыше 12 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена свыше 12 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_OVER_12M' : 'M2_OVER_12M'].message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Секция цен за 0.1 м²/м³ */}
                        <div className="pt-6 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Цены за {isCloud ? '0.1 м³' : '0.1 м²'}
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Установите цены за 0.1 {isCloud ? 'м³' : 'м²'} с учетом скидок за длительный период хранения
                          </p>
                          
                          <div className="space-y-4">
                            {/* Цена до 6 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена до 6 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_01_UP_6M' : 'M2_01_UP_6M'].message}
                                </p>
                              )}
                            </div>

                            {/* Цена от 6 до 12 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена от 6 до 12 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_01_6_12M' : 'M2_01_6_12M'].message}
                                </p>
                              )}
                            </div>

                            {/* Цена свыше 12 месяцев */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена свыше 12 месяцев (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register(isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену"
                              />
                              {errors[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors[isCloud ? 'M3_01_OVER_12M' : 'M2_01_OVER_12M'].message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            Отмена
                          </button>
                          <button
                            type="submit"
                            disabled={isSaving || !isDirty}
                            className="px-6 py-2.5 bg-[#273655] text-white text-sm font-medium rounded-lg hover:bg-[#1e2c4f] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isSaving ? (
                              <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Сохранение...
                              </div>
                            ) : (
                              'Сохранить изменения'
                            )}
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                
              </div>

              {/* Статистика боксов */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Статистика боксов</h3>
                
                {warehouse.storage ? (
                  <>
                    {getStatCard(
                      `Всего ${isCloud ? 'мест м2' : 'боксов'}`,
                        isCloud ? warehouse.storage[0]?.total_volume : warehouse.storage.length,
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>,
                      'text-gray-900'
                    )}
                    
                    {getStatCard(
                      'Свободные',
                      isCloud ? warehouse.storage[0]?.available_volume : warehouse.storage.filter(s => s.status === 'VACANT').length,
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>,
                      'text-green-600'
                    )}
                    
                    {getStatCard(
                      'Занятые',
                        isCloud ? warehouse.storage[0]?.total_volume - warehouse.storage[0]?.available_volume : warehouse.storage.filter(s => s.status === 'OCCUPIED').length,
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>,
                      'text-red-600'
                    )}
                    
                    {!isCloud && getStatCard(
                      'Ожидающие',
                      warehouse.storage.filter(s => s.status === 'PENDING').length,
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>,
                      'text-yellow-600'
                    )}
                  </>
                ) : (
                  <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <p className="text-sm text-gray-500">Нет данных о боксах</p>
                  </div>
                )}
              </div>
            </div>

            {/* Блоки с картой и настройками - только в режиме просмотра */}
            {!isEditing && warehouse && (
              <div className="mt-8">
                {isCloud ? (
                  // Для CLOUD складов
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6">
                    {/* Блок с габаритами */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#273655]">
                            Укажите габариты вещей
                          </h3>
                        </div>
                        <InfoHint
                          description={
                            <span>
                              Введите ширину, высоту и длину в метрах — мы автоматически посчитаем общий объём для облачного хранения.
                            </span>
                          }
                          ariaLabel="Подсказка по вводу габаритов"
                        />
                      </div>

                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-4">
                          <label className="w-24 text-sm text-[#6B6B6B]">Ширина</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={cloudDimensions.width}
                            onChange={(e) => setCloudDimensions(prev => ({ ...prev, width: parseFloat(e.target.value) || 0.1 }))}
                            className="flex-1 h-[56px] rounded-2xl border border-[#273655]/20 bg-white px-4 text-base text-[#273655] font-medium focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                          />
                          <span className="text-sm text-[#6B6B6B]">м</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="w-24 text-sm text-[#6B6B6B]">Высота</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={cloudDimensions.height}
                            onChange={(e) => setCloudDimensions(prev => ({ ...prev, height: parseFloat(e.target.value) || 0.1 }))}
                            className="flex-1 h-[56px] rounded-2xl border border-[#273655]/20 bg-white px-4 text-base text-[#273655] font-medium focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                          />
                          <span className="text-sm text-[#6B6B6B]">м</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <label className="w-24 text-sm text-[#6B6B6B]">Длина</label>
                          <input
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={cloudDimensions.length}
                            onChange={(e) => setCloudDimensions(prev => ({ ...prev, length: parseFloat(e.target.value) || 0.1 }))}
                            className="flex-1 h-[56px] rounded-2xl border border-[#273655]/20 bg-white px-4 text-base text-[#273655] font-medium focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                          />
                          <span className="text-sm text-[#6B6B6B]">м</span>
                        </div>
                      </div>

                      <div className="rounded-2xl bg-[#273655]/5 border border-[#273655]/15 p-3 space-y-3">
                        <p className="text-sm text-[#6B6B6B]">
                          Рассчитанный объём: <span className="font-semibold text-[#273655]">{cloudVolume.toFixed(2)} м³</span>
                        </p>

                        {/* Блок с расчетом стоимости для CLOUD */}
                        <div className="rounded-2xl border border-dashed border-[#273655]/30 bg-white px-4 py-3 text-sm text-[#273655] space-y-3 mt-3">
                          <div className="flex items-center justify-between text-[#273655]">
                            <span className="text-sm font-semibold uppercase tracking-[0.12em]">Итог</span>
                            <span className="text-xs text-[#6B6B6B]">
                              {cloudVolume.toFixed(2)} м³
                            </span>
                          </div>
                          {isCloudPriceCalculating ? (
                            <div className="flex items-center justify-center gap-2 text-base font-semibold">
                              <span className="w-4 h-4 border-2 border-t-transparent border-[#273655] rounded-full animate-spin" />
                              Расчёт...
                            </div>
                          ) : cloudPricePreview ? (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-[#6B6B6B]">За месяц</span>
                                <span className="text-base font-semibold">
                                  {Math.round(cloudPricePreview.monthly).toLocaleString()} ₸
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-[#6B6B6B]">За {cloudMonthsNumber} мес</span>
                                <span className="text-lg font-bold text-[#273655]">
                                  {Math.round(cloudPricePreview.total).toLocaleString()} ₸
                                </span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-[#6B6B6B]">
                              Укажите габариты и срок, чтобы увидеть ориентировочную цену.
                            </p>
                          )}
                          {cloudPricePreview?.isFallback && (
                            <p className="text-xs text-[#C67A00]">
                              Ориентировочная стоимость — подтверждаем при бронировании.
                            </p>
                          )}
                          {cloudPriceError && (
                            <p className="text-xs text-[#C73636]">
                              {cloudPriceError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Блок с настройками */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#273655]">
                            Облачное хранение ExtraSpace
                          </h3>
                        </div>
                        <InfoHint
                          description={
                            <span>
                              Перевозка и упаковка входят в тариф облачного хранения — никаких доплат, мы всё организуем.
                            </span>
                          }
                          ariaLabel="Подсказка по облачному хранению"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-2.5">
                        <span className="text-sm font-semibold text-[#273655]">
                          Срок аренды (месяцы)
                        </span>
                        <Select
                          value={cloudMonths}
                          onValueChange={setCloudMonths}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-[#273655]/20 text-[#273655]">
                            <SelectValue placeholder="Выберите срок" />
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

                      <div className="rounded-2xl bg-[#273655]/5 border border-[#273655]/20 p-3 text-sm text-[#273655] space-y-2">
                        <div className="rounded-xl border border-[#273655]/20 bg-white/80 px-3 py-2 text-xs sm:text-sm text-[#273655] flex items-start gap-2">
                          <Truck className="h-4 w-4 mt-[2px]" />
                          <div>
                            <strong>Дополнительные услуги</strong>
                            <p className="mt-1">
                              Мы сами забираем, упаковываем и возвращаем ваши вещи. Все услуги включены в тариф — вам нужно только указать адрес забора.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <span className="text-xs text-[#6B6B6B]">Адрес забора вещей</span>
                          <input
                            type="text"
                            value={cloudPickupAddress}
                            onChange={(e) => setCloudPickupAddress(e.target.value)}
                            placeholder="Например: г. Алматы, Абая 25"
                            className="h-[46px] rounded-xl border border-[#d5d8e1] px-3 text-sm text-[#273655] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                          />
                        </div>
                        <p>Перевозка и упаковка включены в стоимость.</p>
                      </div>

                      {/* Блок выбора пользователя для менеджеров/админов */}
                      {isAdminOrManager && (
                        <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#273655] font-semibold">
                              <User className="w-5 h-5 shrink-0" />
                              <span>Клиент</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsClientSelectorOpen(true)}
                              className="px-4 py-2 text-sm font-medium text-[#273655] border border-[#273655] rounded-lg hover:bg-[#273655] hover:text-white transition-colors"
                            >
                              {selectedClientUser ? 'Изменить' : 'Выбрать клиента'}
                            </button>
                          </div>
                          {selectedClientUser && (
                            <div className="bg-[#273655]/5 rounded-lg p-3">
                              <div className="text-sm font-medium text-[#273655]">
                                {selectedClientUser.name || 'Без имени'}
                              </div>
                              <div className="text-xs text-gray-600">{selectedClientUser.email}</div>
                              {selectedClientUser.phone && (
                                <div className="text-xs text-gray-500">Телефон: {selectedClientUser.phone}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <SmartButton
                        variant="success"
                        size="lg"
                        className="w-full h-[56px] text-base font-semibold"
                        onClick={async () => {
                          if (isAdminOrManager && !selectedClientUser) {
                            toast.error('Выберите клиента для создания заказа');
                            return;
                          }

                          if (!warehouse?.storage?.[0]) {
                            toast.error('Склад не имеет доступных мест для хранения');
                            return;
                          }

                          if (!cloudVolume || cloudVolume <= 0) {
                            toast.error('Укажите габариты вещей для расчета объема');
                            return;
                          }

                          if (!cloudPickupAddress.trim()) {
                            toast.error('Укажите адрес забора вещей');
                            return;
                          }

                          setIsCreatingOrder(true);
                          setOrderError(null);

                          try {
                            // Синхронизируем услуги с газелью
                            let finalServices = [...services];
                            if (includeMoving && gazelleService) {
                              finalServices = syncGazelleService(finalServices);
                            }

                            const validServices = finalServices.filter(
                              (service) => service.service_id && service.count > 0
                            );

                            const orderData = {
                              storage_id: warehouse.storage[0].id,
                              months: cloudMonthsNumber,
                              order_items: [{
                                name: 'Облачное хранение',
                                volume: cloudVolume,
                                cargo_mark: 'NO'
                              }],
                              is_selected_moving: includeMoving,
                              is_selected_package: includePacking && validServices.length > 0,
                            };

                            // Добавляем user_id для менеджеров/админов
                            if (isAdminOrManager && selectedClientUser) {
                              orderData.user_id = selectedClientUser.id;
                            }

                            // Добавляем перевозки
                            if (includeMoving) {
                              orderData.moving_orders = [
                                {
                                  moving_date: new Date().toISOString(),
                                  status: 'PENDING_FROM',
                                  address: cloudPickupAddress.trim(),
                                },
                                {
                                  moving_date: new Date().toISOString(),
                                  status: 'PENDING_TO',
                                  address: cloudPickupAddress.trim(),
                                }
                              ];
                            }

                            // Добавляем услуги
                            if (includePacking && validServices.length > 0) {
                              orderData.services = validServices.map((service) => ({
                                service_id: Number(service.service_id),
                                count: service.count,
                              }));
                            }

                            await warehouseApi.createOrder(orderData);

                            toast.success(
                              <div>
                                <div><strong>Заказ успешно создан!</strong></div>
                                <div style={{ marginTop: 5 }}>
                                  СМС от <strong>TrustMe</strong> для подписания договора придёт после подтверждения заказа менеджером.
                                </div>
                              </div>,
                              { autoClose: 4000 }
                            );

                            // Перенаправляем на страницу заказов (для админа/менеджера - на запросы, для обычных пользователей - на платежи)
                            setTimeout(() => {
                              navigate('/personal-account', { state: { activeSection: isAdminOrManager ? 'request' : 'payments' } });
                            }, 1500);
                          } catch (error) {
                            console.error('Ошибка при создании заказа:', error);
                            const errorMessage = error.response?.data?.message || 
                                                error.response?.data?.details?.[0]?.message ||
                                                'Не удалось создать заказ. Попробуйте позже.';
                            setOrderError(errorMessage);
                            toast.error(errorMessage);
                          } finally {
                            setIsCreatingOrder(false);
                          }
                        }}
                        disabled={
                          (isAdminOrManager && !selectedClientUser) ||
                          isCreatingOrder ||
                          !cloudVolume ||
                          cloudVolume <= 0 ||
                          !cloudPickupAddress.trim()
                        }
                      >
                        {isCreatingOrder ? 'Создание заказа...' : 'Забронировать бокс'}
                      </SmartButton>
                      
                      {orderError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{orderError}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Для INDIVIDUAL складов
                  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6">
                    <div className="space-y-6">
                      {/* Блок выбора склада */}
                      {allWarehouses.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                          <div className="mb-4 flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-xl font-bold text-[#273655]">
                                Выберите склад
                              </h3>
                            </div>
                            <InfoHint
                              description={
                                <span>
                                  Укажите удобную локацию, чтобы посмотреть схему склада, доступные боксы и свободные места в режиме реального времени.
                                </span>
                              }
                              ariaLabel="Подробнее о выборе склада"
                            />
                          </div>
                          <div className="relative w-full">
                            <Dropdown
                              items={allWarehouses.filter(w => w.type !== 'CLOUD')}
                              value={warehouse?.id}
                              onChange={(_, item) => handleWarehouseChange(item.id)}
                              placeholder="Выбрать склад"
                              searchable={false}
                              getKey={(w) => w.id}
                              getLabel={(w) => w.name}
                              getDescription={(w) => w.address}
                              className="bg-[#273655] text-white border-0"
                              popoverProps={{ className: "p-0" }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Блок с картой-схемой склада */}
                      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-xl font-bold text-[#273655]">
                              Карта-схема склада
                            </h3>
                          </div>
                          <InfoHint
                            description={
                              <span>
                                Быстро найдите свободный бокс: схема показывает актуальную доступность. Нажмите на бокс, чтобы увидеть его параметры и рассчитать стоимость.
                              </span>
                            }
                            ariaLabel="Подсказка по схеме склада"
                          />
                        </div>
                        <div className="rounded-2xl bg-[#f5f6fa] p-4">
                          <WarehouseCanvasViewer
                            warehouse={warehouse}
                            userRole={user?.role || 'USER'}
                            isViewOnly={true}
                            showControls={true}
                            isCompact={true}
                            onViewMore={() => setIsMapModalOpen(true)}
                            onBoxSelect={async (storage) => {
                              if (storage?.status === 'PENDING' && storage?.status === 'OCCUPIED' && isAdminOrManager) {
                                setIsLoadingPendingOrder(true);
                                try {
                                  const order = await ordersApi.getPendingOrderByStorageId(storage.id);
                                  if (order) {
                                    setPendingOrder(order);
                                    setIsPendingOrderModalOpen(true);
                                  } else {
                                    // Если заказа нет, просто выбираем бокс
                                    setPreviewStorage(storage);
                                  }
                                } catch (error) {
                                  console.error('Ошибка при загрузке заказа:', error);
                                  // В случае ошибки все равно выбираем бокс
                                  setPreviewStorage(storage);
                                } finally {
                                  setIsLoadingPendingOrder(false);
                                }
                              } else {
                                // Для обычных боксов просто выбираем
                                setPreviewStorage(storage);
                              }
                            }}
                            selectedStorage={previewStorage}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Блок с настройками */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm flex flex-col gap-4 sm:gap-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-xl font-bold text-[#273655]">
                            Настройте хранение
                          </h3>
                        </div>
                        <InfoHint
                          description={
                            <span>
                              Настройте срок аренды, выберите перевозку и упаковку — все параметры сохранятся, когда перейдёте к оформлению заявки.
                            </span>
                          }
                          ariaLabel="Подсказка по настройкам хранения"
                        />
                      </div>

                      <div className="space-y-2 sm:space-y-2.5">
                        <span className="text-sm font-semibold text-[#273655]">
                          Срок аренды (месяцы)
                        </span>
                        <Select
                          value={individualMonths}
                          onValueChange={setIndividualMonths}
                        >
                          <SelectTrigger className="h-12 rounded-2xl border-[#273655]/20 text-[#273655]">
                            <SelectValue placeholder="Выберите срок" />
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

                      <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-[#273655] font-semibold">
                            <Truck className="w-5 h-5 shrink-0" />
                            <span>Перевозка вещей</span>
                          </div>
                          <Switch
                            checked={includeMoving}
                            onCheckedChange={async (checked) => {
                              setIncludeMoving(checked);
                              if (checked) {
                                const loadedOptions = await ensureServiceOptions();
                                // Устанавливаем gazelleService сразу после загрузки опций
                                if (loadedOptions && loadedOptions.length > 0) {
                                  const gazelle = loadedOptions.find((option) => option.type === "GAZELLE");
                                  if (gazelle) {
                                    setGazelleService({
                                      id: String(gazelle.id),
                                      type: gazelle.type,
                                      name: getServiceTypeName(gazelle.type) || gazelle.description || "Газель",
                                      price: gazelle.price,
                                    });
                                  }
                                }
                              } else {
                                setGazelleService(null);
                              }
                            }}
                            className="bg-gray-200 data-[state=checked]:bg-[#273655]"
                          />
                        </div>

                        {includeMoving && (
                          <div className="mt-3 space-y-3">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-[#6B6B6B] uppercase tracking-[0.08em]">Адрес забора</label>
                              <input
                                type="text"
                                value={movingAddressFrom}
                                onChange={(e) => setMovingAddressFrom(e.target.value)}
                                placeholder="Например: г. Алматы, Абая 25"
                                className="h-[42px] rounded-xl border border-[#d5d8e1] px-3 text-sm text-[#273655] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2 text-[#273655] font-semibold">
                            <Package className="w-5 h-5 shrink-0" />
                            <span>Услуги упаковки</span>
                            <InfoHint
                              description={
                                <span>
                                  Выберите дополнительные услуги упаковки — всё, что нужно, чтобы подготовить вещи к хранению.
                                </span>
                              }
                              ariaLabel="Подробнее об услугах упаковки"
                              align="start"
                            />
                          </div>
                          <Switch
                            checked={includePacking}
                            onCheckedChange={async (checked) => {
                              setIncludePacking(checked);
                              if (checked) {
                                await ensureServiceOptions();
                                setServices((prev) => (prev.length > 0 ? prev : [{ service_id: "", count: 1 }]));
                              } else {
                                setServices([]);
                              }
                            }}
                            className="bg-gray-200 data-[state=checked]:bg-[#273655]"
                          />
                        </div>

                        {includePacking && (
                          <div className="space-y-3">
                            {isServicesLoading ? (
                              <div className="flex items-center justify-center py-2">
                                <span className="w-5 h-5 border-2 border-t-transparent border-[#273655] rounded-full animate-spin" />
                              </div>
                            ) : (
                              <>
                                {servicesError && (
                                  <p className="text-xs text-[#C73636]">
                                    {servicesError}
                                  </p>
                                )}

                                {services.length > 0 && (
                                  <div className="space-y-2">
                                    {services.map((service, index) => {
                                      const selectedOption = serviceOptions.find((option) => String(option.id) === service.service_id);
                                      const unitPrice = selectedOption?.price ?? PACKING_SERVICE_ESTIMATE;
                                      
                                      // Фильтруем уже выбранные услуги (кроме текущей)
                                      const availableOptions = serviceOptions.filter((option) => {
                                        if (option.type === "GAZELLE") return false;
                                        // Исключаем услуги, которые уже выбраны в других строках
                                        const isAlreadySelected = services.some((s, i) => 
                                          i !== index && String(s.service_id) === String(option.id)
                                        );
                                        return !isAlreadySelected;
                                      });

                                      return (
                                        <div
                                          key={index}
                                          className="flex flex-wrap items-center gap-2 rounded-xl border border-[#d7dbe6] bg-white px-3 py-2"
                                        >
                                          <Select
                                            value={service.service_id}
                                            onValueChange={(value) => updateServiceRow(index, "service_id", value)}
                                          >
                                            <SelectTrigger className="h-10 min-w-[180px] rounded-lg border-[#d7dbe6] text-sm">
                                              <SelectValue placeholder="Услуга" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {availableOptions.length > 0 ? (
                                                availableOptions.map((option) => (
                                                  <SelectItem key={option.id} value={String(option.id)}>
                                                    {getServiceTypeName(option.type) || option.description || `Услуга ${option.id}`}
                                                  </SelectItem>
                                                ))
                                              ) : (
                                                <div className="px-2 py-1.5 text-sm text-[#6B6B6B]">
                                                  Нет доступных услуг
                                                </div>
                                              )}
                                            </SelectContent>
                                          </Select>

                                          <div className="flex items-center gap-2">
                                            <span className="text-xs uppercase tracking-[0.08em] text-[#6B6B6B]">
                                              Кол-во
                                            </span>
                                            <input
                                              type="number"
                                              min="1"
                                              value={service.count}
                                              onChange={(e) => updateServiceRow(index, "count", e.target.value)}
                                              className="w-16 h-10 rounded-lg border border-[#d7dbe6] px-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                                            />
                                          </div>

                                          {service.service_id && (
                                            <span className="ml-auto text-xs text-[#6B6B6B]">
                                              {unitPrice.toLocaleString()} ₸/шт.
                                            </span>
                                          )}

                                          <button
                                            type="button"
                                            onClick={() => removeServiceRow(index)}
                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-100 text-red-500 hover:bg-red-50 transition-colors"
                                            aria-label="Удалить услугу"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}

                                {services.length === 0 && !servicesError && (
                                  <p className="text-xs text-[#6B6B6B]">
                                    Добавьте услуги, чтобы мы подготовили упаковку под ваши вещи.
                                  </p>
                                )}

                                <button
                                  type="button"
                                  onClick={() => {
                                    ensureServiceOptions();
                                    addServiceRow();
                                  }}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-[#273655]/40 px-3 py-2 text-xs sm:text-sm font-semibold text-[#273655] hover:bg-[#273655]/5 transition-colors"
                                >
                                  <Plus className="h-4 w-4" />
                                  Добавить услугу
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Блок с расчетом стоимости */}
                      <div className="rounded-2xl border border-dashed border-[#273655]/30 bg-white px-4 py-3 text-sm text-[#273655] space-y-3">
                        <div className="flex items-center justify-between text-[#273655]">
                          <span className="text-sm font-semibold uppercase tracking-[0.12em]">Итог</span>
                          {previewStorage && (
                            <span className="text-xs text-[#6B6B6B]">
                              {previewStorage.name || `Бокс ${previewStorage.id}`}
                            </span>
                          )}
                        </div>
                        {isPriceCalculating ? (
                          <div className="flex items-center justify-center gap-2 text-base font-semibold">
                            <span className="w-4 h-4 border-2 border-t-transparent border-[#273655] rounded-full animate-spin" />
                            Расчёт...
                          </div>
                        ) : previewStorage && pricePreview ? (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#6B6B6B]">За месяц</span>
                              <span className="text-base font-semibold">
                                {costSummary.baseMonthly?.toLocaleString() ?? "—"} ₸
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#6B6B6B]">За {monthsNumber} мес</span>
                              <span className="text-lg font-bold text-[#273655]">
                                {costSummary.baseTotal?.toLocaleString() ?? "—"} ₸
                              </span>
                            </div>
                            {pricePreview.isFallback && (
                              <p className="text-xs text-[#C67A00]">
                                Ориентировочная стоимость по тарифу бокса.
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-[#6B6B6B]">
                            Выберите бокс на схеме, чтобы увидеть предварительную цену.
                          </p>
                        )}
                        {serviceSummary.breakdown.length > 0 && (
                          <div className="border-t border-dashed border-[#273655]/20 pt-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[#6B6B6B]">Услуги</span>
                              <span className="font-semibold">
                                +{serviceSummary.total.toLocaleString()} ₸
                              </span>
                            </div>
                            <div className="space-y-1 text-xs text-[#6B6B6B]">
                              {serviceSummary.breakdown.map((item, index) => (
                                <div key={`${item.label}-${index}`} className="flex items-center justify-between">
                                  <span className="truncate pr-2">{item.label}</span>
                                  <span className="font-medium text-[#273655]">
                                    +{item.amount.toLocaleString()} ₸
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {((previewStorage && pricePreview) || serviceSummary.total > 0) && (
                          <div className="flex items-center justify-between border-t border-dashed border-[#273655]/20 pt-3 text-base font-bold text-[#273655]">
                            <span>Всего</span>
                            <span>
                              {(costSummary.combinedTotal || serviceSummary.total || 0).toLocaleString()} ₸
                            </span>
                          </div>
                        )}
                        {priceError && (
                          <p className="text-xs text-[#C73636]">
                            {priceError}
                          </p>
                        )}
                      </div>

                      {/* Блок выбора пользователя для менеджеров/админов */}
                      {isAdminOrManager && (
                        <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[#273655] font-semibold">
                              <User className="w-5 h-5 shrink-0" />
                              <span>Клиент</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsClientSelectorOpen(true)}
                              className="px-4 py-2 text-sm font-medium text-[#273655] border border-[#273655] rounded-lg hover:bg-[#273655] hover:text-white transition-colors"
                            >
                              {selectedClientUser ? 'Изменить' : 'Выбрать клиента'}
                            </button>
                          </div>
                          {selectedClientUser && (
                            <div className="bg-[#273655]/5 rounded-lg p-3">
                              <div className="text-sm font-medium text-[#273655]">
                                {selectedClientUser.name || 'Без имени'}
                              </div>
                              <div className="text-xs text-gray-600">{selectedClientUser.email}</div>
                              {selectedClientUser.phone && (
                                <div className="text-xs text-gray-500">Телефон: {selectedClientUser.phone}</div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      <SmartButton
                        variant="success"
                        size="lg"
                        className="w-full h-[56px] text-base font-semibold"
                        onClick={async () => {
                          if (isAdminOrManager && !selectedClientUser) {
                            toast.error('Выберите клиента для создания заказа');
                            return;
                          }

                          if (!previewStorage) {
                            toast.error('Выберите бокс на схеме склада');
                            return;
                          }

                          if (!monthsNumber || monthsNumber <= 0) {
                            toast.error('Выберите срок аренды');
                            return;
                          }

                          if (includeMoving && !movingAddressFrom.trim()) {
                            toast.error('Укажите адрес забора вещей');
                            return;
                          }

                          setIsCreatingOrder(true);
                          setOrderError(null);

                          try {
                            // Синхронизируем услуги с газелью
                            let finalServices = [...services];
                            if (includeMoving && gazelleService) {
                              finalServices = syncGazelleService(finalServices);
                            }

                            const validServices = finalServices.filter(
                              (service) => service.service_id && service.count > 0
                            );

                            // Проверка услуг для обычных пользователей
                            if (includePacking && validServices.length === 0 && !isAdminOrManager) {
                              toast.error('Добавьте хотя бы одну услугу для упаковки');
                              setIsCreatingOrder(false);
                              return;
                            }

                            const orderData = {
                              storage_id: previewStorage.id,
                              months: monthsNumber,
                              order_items: [{
                                name: previewStorage.name || `Бокс ${previewStorage.id}`,
                                volume: 0,
                                cargo_mark: 'NO'
                              }],
                              is_selected_moving: includeMoving,
                              is_selected_package: includePacking && validServices.length > 0,
                            };

                            // Добавляем user_id для менеджеров/админов
                            if (isAdminOrManager && selectedClientUser) {
                              orderData.user_id = selectedClientUser.id;
                            }

                            // Добавляем перевозки
                            if (includeMoving && movingAddressFrom.trim()) {
                              orderData.moving_orders = [
                                {
                                  moving_date: new Date().toISOString(),
                                  status: 'PENDING_FROM',
                                  address: movingAddressFrom.trim(),
                                },
                                {
                                  moving_date: new Date().toISOString(),
                                  status: 'PENDING_TO',
                                  address: movingAddressFrom.trim(),
                                }
                              ];
                            }

                            // Добавляем услуги
                            if (includePacking && validServices.length > 0) {
                              orderData.services = validServices.map((service) => ({
                                service_id: Number(service.service_id),
                                count: service.count,
                              }));
                            }

                            const result = await warehouseApi.createOrder(orderData);

                            toast.success(
                              <div>
                                <div><strong>Заказ успешно создан!</strong></div>
                                <div style={{ marginTop: 5 }}>
                                  СМС от <strong>TrustMe</strong> для подписания договора придёт после подтверждения заказа менеджером.
                                </div>
                              </div>,
                              { autoClose: 4000 }
                            );

                            // Перенаправляем на страницу заказов (для админа/менеджера - на запросы, для обычных пользователей - на платежи)
                            setTimeout(() => {
                              navigate('/personal-account', { state: { activeSection: isAdminOrManager ? 'request' : 'payments' } });
                            }, 1500);
                          } catch (error) {
                            console.error('Ошибка при создании заказа:', error);
                            const errorMessage = error.response?.data?.message || 
                                                error.response?.data?.details?.[0]?.message ||
                                                'Не удалось создать заказ. Попробуйте позже.';
                            setOrderError(errorMessage);
                            toast.error(errorMessage);
                          } finally {
                            setIsCreatingOrder(false);
                          }
                        }}
                        disabled={
                          (isAdminOrManager && !selectedClientUser) ||
                          isCreatingOrder ||
                          !previewStorage ||
                          !monthsNumber ||
                          monthsNumber <= 0 ||
                          (includeMoving && !movingAddressFrom.trim())
                        }
                      >
                        {isCreatingOrder ? 'Создание заказа...' : 'Забронировать бокс'}
                      </SmartButton>
                      
                      {orderError && (
                        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{orderError}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Модальное окно с полноэкранной картой - только для INDIVIDUAL складов */}
      {isMapModalOpen && !isCloud && warehouse && (
        <div className="fixed inset-0 z-[1200]">
          {isMobileView ? (
            <div className="absolute inset-0 flex flex-col justify-end">
              <button
                type="button"
                aria-label="Закрыть карту"
                onClick={() => setIsMapModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <div className="relative z-10 mt-auto w-full max-h-[92vh] rounded-t-3xl border border-[#d7dbe6]/60 bg-white shadow-2xl overflow-hidden flex flex-col">
                <div className="flex justify-center py-3 flex-shrink-0">
                  <span className="block h-1.5 w-12 rounded-full bg-[#d7dbe6]" />
                </div>
                <div className="px-5 pb-6 flex flex-col gap-4 flex-1 min-h-0 overflow-hidden">
                  <div className="flex items-start justify-between gap-3 flex-shrink-0">
                    <div className="pr-6">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#6B6B6B]">
                        Схема склада
                      </p>
                      <h3 className="text-lg font-semibold text-[#273655] leading-snug">
                        {warehouse?.name || "Карта склада"}
                      </h3>
                      {warehouse?.address && (
                        <p className="mt-1 text-sm text-[#6B6B6B]">
                          {warehouse.address}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsMapModalOpen(false)}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#d7dbe6] text-[#273655] hover:bg-[#273655] hover:text-white transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#273655]/30"
                      aria-label="Закрыть карту"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden rounded-2xl border border-[#d7dbe6]/70 bg-white">
                    <WarehouseCanvasViewer
                      warehouse={warehouse}
                      userRole={user?.role || 'USER'}
                      isViewOnly={true}
                      showControls={true}
                      isFullscreen={true}
                      onBoxSelect={async (storage) => {
                        // Если бокс имеет статус PENDING и пользователь админ/менеджер, загружаем информацию о заказе
                        if (storage?.status === 'PENDING' && isAdminOrManager) {
                          setIsLoadingPendingOrder(true);
                          try {
                            const order = await ordersApi.getPendingOrderByStorageId(storage.id);
                            if (order) {
                              setPendingOrder(order);
                              setIsPendingOrderModalOpen(true);
                              setIsMapModalOpen(false); // Закрываем модальное окно карты
                            } else {
                              // Если заказа нет, просто выбираем бокс
                              setPreviewStorage(storage);
                            }
                          } catch (error) {
                            console.error('Ошибка при загрузке заказа:', error);
                            // В случае ошибки все равно выбираем бокс
                            setPreviewStorage(storage);
                          } finally {
                            setIsLoadingPendingOrder(false);
                          }
                        } else {
                          // Для обычных боксов просто выбираем
                          setPreviewStorage(storage);
                        }
                      }}
                      selectedStorage={previewStorage}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
              <div className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-[#d7dbe6] flex flex-col max-h-[90vh]">
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(false)}
                  className="absolute top-4 right-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#d7dbe6] text-[#273655] hover:bg-[#273655] hover:text-white transition-colors"
                  aria-label="Закрыть карту"
                >
                  <X className="h-5 w-5" />
                </button>
                <div className="p-6 pb-4 sm:p-8 sm:pb-6 flex flex-col gap-4 h-full overflow-hidden">
                  <div className="space-y-1 pr-12 flex-shrink-0">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                      Схема склада
                    </p>
                    <h3 className="text-xl font-bold text-[#273655]">
                      {warehouse?.name || "Карта склада"}
                    </h3>
                    {warehouse?.address && (
                      <p className="text-sm text-[#6B6B6B]">{warehouse.address}</p>
                    )}
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden">
                    <WarehouseCanvasViewer
                      warehouse={warehouse}
                      userRole={user?.role || 'USER'}
                      isViewOnly={true}
                      showControls={true}
                      isFullscreen={true}
                      onBoxSelect={async (storage) => {
                        // Если бокс имеет статус PENDING и пользователь админ/менеджер, загружаем информацию о заказе
                        if (storage?.status === 'PENDING' && isAdminOrManager) {
                          setIsLoadingPendingOrder(true);
                          try {
                            const order = await ordersApi.getPendingOrderByStorageId(storage.id);
                            if (order) {
                              setPendingOrder(order);
                              setIsPendingOrderModalOpen(true);
                              setIsMapModalOpen(false); // Закрываем модальное окно карты
                            } else {
                              // Если заказа нет, просто выбираем бокс
                              setPreviewStorage(storage);
                            }
                          } catch (error) {
                            console.error('Ошибка при загрузке заказа:', error);
                            // В случае ошибки все равно выбираем бокс
                            setPreviewStorage(storage);
                          } finally {
                            setIsLoadingPendingOrder(false);
                          }
                        } else {
                          // Для обычных боксов просто выбираем
                          setPreviewStorage(storage);
                        }
                      }}
                      selectedStorage={previewStorage}
                      className="w-full h-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Модальное окно выбора пользователя для менеджеров/админов */}
      {isAdminOrManager && (
        <ClientSelector
          isOpen={isClientSelectorOpen}
          onClose={() => setIsClientSelectorOpen(false)}
          selectedUser={selectedClientUser}
          onUserSelect={(user) => {
            setSelectedClientUser(user);
            if (user) {
              setIsClientSelectorOpen(false);
            }
          }}
        />
      )}

      {/* Модальное окно информации о заказе PENDING */}
      {isAdminOrManager && (
        <PendingOrderModal
          isOpen={isPendingOrderModalOpen}
          order={pendingOrder}
          onClose={() => {
            setIsPendingOrderModalOpen(false);
            setPendingOrder(null);
          }}
          onUnbook={async (orderId) => {
            setIsUnbooking(true);
            try {
              // Обновляем данные склада после разбронирования
              const updatedWarehouse = await warehouseApi.getWarehouseById(warehouseId);
              setWarehouse(updatedWarehouse);
              
              // Сбрасываем выбранный бокс
              setPreviewStorage(null);
              setPricePreview(null);
              setPriceError(null);
              
              // Обновляем список складов
              const data = await warehouseApi.getAllWarehouses();
              setAllWarehouses(Array.isArray(data) ? data : []);
            } catch (error) {
              console.error('Ошибка при обновлении данных:', error);
            } finally {
              setIsUnbooking(false);
            }
          }}
          isUnbooking={isUnbooking}
        />
      )}

      {/* Индикатор загрузки заказа */}
      {isLoadingPendingOrder && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-t-transparent border-[#273655] rounded-full animate-spin" />
              <span className="text-sm font-medium text-[#273655]">Загрузка информации о заказе...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseData; 