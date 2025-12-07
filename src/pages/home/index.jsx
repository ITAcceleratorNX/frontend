import React, { useState, memo, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../widgets";
import vectorImg from "../../assets/vector.png";
import backgroundTextImg from "../../assets/background-text.png";
import boxesImg from "../../assets/boxes.png";
import extraspaceLogo from "../../assets/photo_5440760864748731559_y.jpg";
import Footer from "../../widgets/Footer";
import WarehouseMap from "../../components/WarehouseMap";
import InteractiveWarehouseCanvas from "../../components/InteractiveWarehouseCanvas";
import MainWarehouseCanvas from "../../components/MainWarehouseCanvas";
import ZhkKomfortCanvas from "../../components/ZhkKomfortCanvas.jsx";
import ChatButton from "../../shared/components/ChatButton";
import { warehouseApi } from "../../shared/api/warehouseApi";
import { paymentsApi } from "../../shared/api/paymentsApi";
import { Dropdown } from '../../shared/components/Dropdown.jsx';
import { SmartButton } from "../../shared/components/SmartButton.jsx";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Switch,
} from "../../components/ui";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Truck, Package, X, Info, Plus, Trash2 } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import { toast } from "react-toastify";
import CallbackRequestModal from "@/shared/components/CallbackRequestModal.jsx";
import { LeadSourceModal, useLeadSource, shouldShowLeadSourceModal } from "@/shared/components/LeadSourceModal.jsx";
import DatePicker from "../../shared/ui/DatePicker";

const PACKING_SERVICE_ESTIMATE = 4000;

// Функция для правильного склонения слова "месяц"
const getMonthLabel = (months) => {
  const num = parseInt(months, 10);
  if (num === 1) return "1 месяц";
  if (num >= 2 && num <= 4) return `${num} месяца`;
  return `${num} месяцев`;
};

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
      return "Газель - забор вещей";
    case "GAZELLE_TO":
      return "Газель - возврат вещей";
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
    case "RACK_RENTAL":
      return "Аренда стеллажей";
    default:
      return "Услуга";
  }
};
// Мемоизируем компонент HomePage для предотвращения лишних ререндеров
const HomePage = memo(() => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const isUserRole = user?.role === "USER";

  // Новые состояния для выбора склада
  const [apiWarehouses, setApiWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState(null);
  const [activeStorageTab, setActiveStorageTab] = useState("INDIVIDUAL");
  const [individualMonths, setIndividualMonths] = useState("1");
  const [individualBookingStartDate, setIndividualBookingStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });
  const [cloudBookingStartDate, setCloudBookingStartDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });
  const [includeMoving, setIncludeMoving] = useState(false);
  const [includePacking, setIncludePacking] = useState(false);
  const [cloudMonths, setCloudMonths] = useState("1");
  const [cloudDimensions, setCloudDimensions] = useState({ width: 1, height: 1, length: 1 });
  const [movingAddressFrom, setMovingAddressFrom] = useState("");
  const [movingPickupDate, setMovingPickupDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });
  // Состояние для moving_orders (для возврата вещей при добавлении GAZELLE_TO)
  const [movingOrders, setMovingOrders] = useState([]);
  // Состояние для адреса возврата (GAZELLE_TO)
  const [movingAddressTo, setMovingAddressTo] = useState("");
  const [cloudPickupAddress, setCloudPickupAddress] = useState("");
  const [cloudPickupDate, setCloudPickupDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });
  const [previewStorage, setPreviewStorage] = useState(null);
  const [pricePreview, setPricePreview] = useState(null);
  const [isPriceCalculating, setIsPriceCalculating] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [cloudPricePreview, setCloudPricePreview] = useState(null);
  const [isCloudPriceCalculating, setIsCloudPriceCalculating] = useState(false);
  const [cloudPriceError, setCloudPriceError] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [komfortSelectedMap, setKomfortSelectedMap] = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [services, setServices] = useState([]);
  const [gazelleService, setGazelleService] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackModalContext, setCallbackModalContext] = useState('callback');
  const [isLeadSourceModalOpen, setIsLeadSourceModalOpen] = useState(false);
  const { leadSource, saveLeadSource } = useLeadSource();
  // Состояние для цен услуг (для расчета процента скидки)
  const [servicePrices, setServicePrices] = useState({});
  // Состояние для цены доставки (только забор вещей)
  const [gazelleFromPrice, setGazelleFromPrice] = useState(null);

  // Данные для складов на карте
  const warehouses = useMemo(
      () => [
        {
          id: 1,
          name: "Есентай, жилой комплекс",
          address: "Касымова улица, 32",
          phone: "+7 727 123 4567",
          // workingHours: "Пн-Пт: 09:00-18:00, Сб-Вс: 10:00-16:00",
          workingHours: "Круглосуточно",
          type: "INDIVIDUAL",
          storage: [],
          coordinates: [76.930495, 43.225893],
          available: true,
          image: extraspaceLogo,
        },
        {
          id: 2,
          name: "Mega Tower Almaty, жилой комплекс",
          address: "Абиша Кекилбайулы, 270 блок 4",
          phone: "+7 727 987 6543",
          // workingHours: "Ежедневно: 08:00-22:00",
          workingHours: "Круглосуточно",
          type: "INDIVIDUAL",
          storage: [],
          coordinates: [76.890647, 43.201397],
          available: true,
          image: extraspaceLogo,
        },
        {
          id: 3,
          name: "Жилой комплекс «Комфорт Сити»",
          address: "Проспект Серкебаева, 146/3",
          phone: "+7 727 987 6543",
          workingHours: "Круглосуточно",
          type: "INDIVIDUAL",
          storage: [],
          coordinates: [76.900575, 43.201302],
          available: true,
          image: extraspaceLogo,
        },
      ],
      []
  );

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

  const openCallbackModal = useCallback((context = 'callback') => {
    setCallbackModalContext(context);
    setIsCallbackModalOpen(true);
  }, []);

  const handleCallbackModalOpenChange = useCallback((nextOpen) => {
    setIsCallbackModalOpen(nextOpen);
    if (!nextOpen) {
      setCallbackModalContext('callback');
    }
  }, []);

  const addServiceRow = useCallback(() => {
    setServices((prev) => [...prev, { service_id: "", count: 1 }]);
    setSubmitError(null);
  }, []);

  const monthsNumber = useMemo(() => {
    const parsed = parseInt(individualMonths, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [individualMonths]);

  const updateServiceRow = useCallback((index, field, value) => {
    setServices((prev) => {
      const updated = prev.map((service, i) =>
        i === index
          ? {
              ...service,
              [field]: field === "count" ? Math.max(1, Number(value) || 1) : value,
            }
          : service
      );
      
      // Если изменился service_id, проверяем добавление/удаление GAZELLE_TO
      if (field === "service_id") {
        const oldService = prev[index];
        const newService = updated[index];
        
        // Проверяем, была ли добавлена услуга GAZELLE_TO
        if (value && serviceOptions.length > 0) {
          const selectedOption = serviceOptions.find(opt => String(opt.id) === String(value));
          if (selectedOption && selectedOption.type === "GAZELLE_TO") {
            console.log("✅ GAZELLE_TO выбрана в updateServiceRow");
            
            // Добавляем moving_order для возврата вещей
            // Дата возврата = дата начала бронирования + количество месяцев
            const startDate = individualBookingStartDate ? new Date(individualBookingStartDate) : new Date();
            const returnDate = new Date(startDate);
            returnDate.setMonth(returnDate.getMonth() + monthsNumber);
            returnDate.setHours(10, 0, 0, 0);
            
            setMovingOrders(prev => {
              // Проверяем, нет ли уже такого moving_order
              const exists = prev.some(order => order.status === "PENDING_TO");
              if (exists) {
                console.log("⚠️ moving_order PENDING_TO уже существует");
                return prev;
              }
              
              const newOrder = {
                moving_date: returnDate.toISOString(),
                status: "PENDING_TO",
                address: movingAddressTo || movingAddressFrom || "",
              };
              
              console.log("✅ Создан новый moving_order:", newOrder);
              return [...prev, newOrder];
            });
          }
        }
        
        // Проверяем, была ли удалена услуга GAZELLE_TO
        if (oldService?.service_id) {
          const oldOption = serviceOptions.find(opt => String(opt.id) === String(oldService.service_id));
          if (oldOption && oldOption.type === "GAZELLE_TO") {
            // Удаляем moving_order для возврата вещей
            setMovingOrders(prev => prev.filter(order => order.status !== "PENDING_TO"));
          }
        }
      }
      
      return updated;
    });
    setSubmitError(null);
  }, [serviceOptions, individualBookingStartDate, monthsNumber, movingAddressFrom, movingAddressTo]);

  const removeServiceRow = useCallback((index) => {
    setServices((prev) => {
      const serviceToRemove = prev[index];
      
      // Если удаляется GAZELLE_TO, удаляем соответствующий moving_order
      if (serviceToRemove?.service_id && serviceOptions.length > 0) {
        const option = serviceOptions.find(opt => String(opt.id) === String(serviceToRemove.service_id));
        if (option && option.type === "GAZELLE_TO") {
          setMovingOrders(prev => prev.filter(order => order.status !== "PENDING_TO"));
        }
      }
      
      return prev.filter((_, i) => i !== index);
    });
    setSubmitError(null);
  }, [serviceOptions]);

  const InfoHint = ({ description, ariaLabel = "Подробнее", align = "end", side = "bottom" }) => (
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

  const cloudMonthsNumber = useMemo(() => {
    const parsed = parseInt(cloudMonths, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [cloudMonths]);

  const serviceSummary = useMemo(() => {
    const breakdown = [];
    let total = 0;

    if (includeMoving && gazelleService && gazelleFromPrice !== null) {
      // Для индивидуального хранения: только GAZELLE_FROM (забор вещей)
      total += gazelleFromPrice;
      breakdown.push({
        label: "Забор вещей (с клиента на склад)",
        amount: gazelleFromPrice,
      });
    }

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
  }, [includeMoving, includePacking, gazelleService, services, serviceOptions, gazelleFromPrice]);

  const callbackModalDescription = useMemo(() => {
    if (callbackModalContext === 'booking') {
      return 'Оставьте контакты, и менеджер поможет подобрать бокс и оформить бронирование.';
    }
    if (callbackModalContext === 'max_orders_limit') {
      return 'Вы уже забронировали максимальное количество боксов (2). Для аренды дополнительных боксов оставьте заявку, и наш менеджер свяжется с вами.';
    }
    return undefined;
  }, [callbackModalContext]);

  const packagingServicesForOrder = useMemo(
    () =>
      services
        .filter((service) => service?.service_id && service?.count && service.count > 0)
        .map((service) => ({
          service_id: service.service_id,
          count: Math.max(1, Number(service.count) || 1),
        })),
    [services]
  );

  const isIndividualFormReady = useMemo(() => {
    if (!previewStorage || !monthsNumber || monthsNumber <= 0) return false;
    if (includeMoving && !movingAddressFrom.trim()) return false;
    if (includePacking && packagingServicesForOrder.length === 0) return false;
    return true;
  }, [
    includeMoving,
    includePacking,
    monthsNumber,
    movingAddressFrom,
    packagingServicesForOrder.length,
    previewStorage,
  ]);

  const cloudWarehouse = useMemo(
      () => (apiWarehouses.length > 0 ? apiWarehouses : warehouses).find((item) => item.type === "CLOUD") || null,
      [apiWarehouses, warehouses]
  );

  const cloudVolume = useMemo(() => {
    const { width, height, length } = cloudDimensions;
    const volume = Number(width) * Number(height) * Number(length);
    return Number.isFinite(volume) && volume > 0 ? volume : 0;
  }, [cloudDimensions]);

  const cloudStorage = cloudWarehouse?.storage?.[0] || null;

  const isCloudFormReady = useMemo(() => {
    if (!cloudStorage?.id) return false;
    if (!cloudMonthsNumber || cloudMonthsNumber <= 0) return false;
    if (!cloudVolume || cloudVolume <= 0) return false;
    if (!cloudPickupAddress.trim()) return false;
    return true;
  }, [cloudStorage, cloudMonthsNumber, cloudPickupAddress, cloudVolume]);

  const movingServicePrice = useMemo(() => {
    // Для индивидуального хранения: только GAZELLE_FROM (забор вещей)
    if (gazelleFromPrice !== null) {
      return gazelleFromPrice;
    }
    // Fallback на дефолтные значения, если цены еще не загружены
    return 14000;
  }, [gazelleFromPrice]);

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

  // Показываем модальное окно источника лида при первом посещении
  useEffect(() => {
    if (!isAuthenticated && shouldShowLeadSourceModal()) {
      // Небольшая задержка для лучшего UX
      const timer = setTimeout(() => {
        setIsLeadSourceModalOpen(true);
      }, 2000); // Показываем через 2 секунды после загрузки страницы
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const storageType = activeStorageTab === "CLOUD" ? "CLOUD" : "INDIVIDUAL";
    localStorage.setItem("prep_storage_type", storageType);
  }, [activeStorageTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const duration =
      activeStorageTab === "CLOUD" ? cloudMonthsNumber : monthsNumber;
    if (duration && duration > 0) {
      localStorage.setItem("prep_duration", String(duration));
    }
  }, [activeStorageTab, cloudMonthsNumber, monthsNumber]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeStorageTab === "INDIVIDUAL") {
      const area =
        parseFloat(
          previewStorage?.available_volume ??
            previewStorage?.total_volume ??
            previewStorage?.area ??
            previewStorage?.square ??
            previewStorage?.volume ??
            ""
        ) || null;
      if (area && area > 0) {
        localStorage.setItem("prep_area", String(area));
      } else {
        localStorage.removeItem("prep_area");
      }
    } else {
      if (cloudVolume && cloudVolume > 0) {
        localStorage.setItem("prep_area", cloudVolume.toFixed(2));
      } else {
        localStorage.removeItem("prep_area");
      }
    }
  }, [activeStorageTab, previewStorage, cloudVolume]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    let price = null;

    if (activeStorageTab === "INDIVIDUAL") {
      if (pricePreview && previewStorage) {
        price = Math.round(costSummary.combinedTotal || 0);
      }
    } else if (activeStorageTab === "CLOUD") {
      if (cloudPricePreview) {
        price = Math.round(cloudPricePreview.total || 0);
      }
    }

    if (price && price > 0) {
      localStorage.setItem("calculated_price", String(price));
    } else {
      localStorage.removeItem("calculated_price");
    }
  }, [
    activeStorageTab,
    costSummary.combinedTotal,
    pricePreview,
    previewStorage,
    cloudPricePreview,
  ]);

  const buildMovingOrders = useCallback((address, months, pickupDateString = null) => {
    // Используем переданную дату забора или текущую дату
    const pickupDate = pickupDateString 
      ? new Date(pickupDateString)
      : new Date();
    
    // Устанавливаем время на начало дня для даты забора
    pickupDate.setHours(10, 0, 0, 0); // 10:00 утра для забора

    // Возвращаем только забор вещей (PENDING_FROM)
    return [
      {
        moving_date: pickupDate.toISOString(),
        status: "PENDING_FROM",
        address,
      },
    ];
  }, []);

  const handleCreateIndividualOrder = useCallback(async () => {
    if (isSubmittingOrder) return;

    if (!isAuthenticated) {
      toast.info("Авторизуйтесь, чтобы оформить заказ.");
      navigate("/login", { state: { from: "/" } });
      return;
    }

    if (!isUserRole) {
      toast.error("Создание заказа доступно только клиентам с ролью USER.");
      return;
    }

    if (!selectedWarehouse || !previewStorage) {
      setSubmitError("Выберите склад и бокс, чтобы продолжить.");
      return;
    }

    if (!monthsNumber || monthsNumber <= 0) {
      setSubmitError("Укажите срок аренды.");
      return;
    }

    if (includeMoving && !movingAddressFrom.trim()) {
      setSubmitError("Укажите адрес для перевозки.");
      return;
    }

    if (includePacking && packagingServicesForOrder.length === 0) {
      setSubmitError("Добавьте хотя бы одну дополнительную услугу или отключите опцию.");
      return;
    }

    const storageId = Number(previewStorage.id ?? previewStorage.storage_id);
    if (!Number.isFinite(storageId) || storageId <= 0) {
      setSubmitError("Не удалось определить выбранный бокс. Попробуйте выбрать его заново.");
      return;
    }

    try {
      setIsSubmittingOrder(true);
      setSubmitError(null);

      let availableOptions = serviceOptions;
      if ((includePacking || includeMoving) && serviceOptions.length === 0) {
        const loadedOptions = await ensureServiceOptions();
        if (Array.isArray(loadedOptions) && loadedOptions.length > 0) {
          availableOptions = loadedOptions;
        }
      }

      const trimmedAddress = movingAddressFrom.trim();

      const orderItems = [
        {
          name: "Вещь",
          volume: 1,
          cargo_mark: "NO",
        },
      ];

      const packagingEntries = includePacking ? packagingServicesForOrder : [];

      const finalServices = packagingEntries
        .map((service) => ({
          service_id: Number(service.service_id),
          count: service.count,
        }))
        .filter(
          (service) =>
            Number.isFinite(service.service_id) && service.service_id > 0 && Number.isFinite(service.count) && service.count > 0
        );

      if (includeMoving) {
        // Ищем GAZELLE_FROM (забор вещей)
        const gazelleFromOption =
          gazelleService ||
          availableOptions?.find((option) => option.type === "GAZELLE_FROM");
        const gazelleFromId =
          gazelleFromOption?.id ?? gazelleFromOption?.service_id ?? gazelleFromOption ?? null;

        if (!gazelleFromId || !Number.isFinite(Number(gazelleFromId))) {
          setSubmitError("Услуга перевозки временно недоступна. Попробуйте позже.");
          setIsSubmittingOrder(false);
          return;
        }

        // Добавляем только GAZELLE_FROM с count: 1
        finalServices.push({
          service_id: Number(gazelleFromId),
          count: 1,
        });
      }

      // Формируем дату начала бронирования
      const startDate = individualBookingStartDate ? new Date(individualBookingStartDate).toISOString() : new Date().toISOString();

      // is_selected_package должен быть true, если есть услуги упаковки ИЛИ услуга "Газель" при перевозке
      const hasPackagingServices = packagingEntries.length > 0;
      // Проверяем наличие услуги "Газель" в finalServices (она добавляется выше, если includeMoving включен)
      const hasGazelleService = includeMoving && finalServices.some(s => {
        const service = availableOptions.find(opt => opt.id === s.service_id);
        return service && service.type === "GAZELLE_FROM";
      });
      const isPackageSelected = hasPackagingServices || hasGazelleService;

      const orderData = {
        storage_id: storageId,
        months: monthsNumber,
        start_date: startDate,
        order_items: orderItems,
        is_selected_moving: includeMoving,
        is_selected_package: isPackageSelected,
      };

      // Проверяем наличие GAZELLE_TO в услугах (независимо от includeMoving)
      const hasGazelleTo = finalServices.some(s => {
        const service = availableOptions.find(opt => opt.id === s.service_id);
        const isGazelleTo = service && service.type === "GAZELLE_TO";
        console.log("🔍 Проверка услуги:", { 
          serviceId: s.service_id, 
          serviceType: service?.type,
          isGazelleTo 
        });
        return isGazelleTo;
      });

      console.log("🔍 Проверка GAZELLE_TO:", {
        hasGazelleTo,
        finalServices,
        availableOptions: availableOptions.length,
        movingOrders,
        movingAddressTo,
      });

      // Создаем moving_orders
      const allMovingOrders = [];
      
      if (includeMoving) {
        // Добавляем забор вещей (PENDING_FROM)
        const pickupOrder = buildMovingOrders(trimmedAddress, monthsNumber, movingPickupDate)[0];
        allMovingOrders.push(pickupOrder);
      }
      
      // Добавляем возврат вещей, если есть GAZELLE_TO в услугах
      if (hasGazelleTo) {
        console.log("✅ GAZELLE_TO найдена, добавляем moving_order");
        
        // Используем moving_order из состояния или создаем новый
        const returnOrder = movingOrders.find(order => order.status === "PENDING_TO");
        if (returnOrder) {
          console.log("✅ Используем существующий moving_order из состояния");
          allMovingOrders.push({
            moving_date: returnOrder.moving_date,
            status: "PENDING_TO",
            address: returnOrder.address || movingAddressTo.trim() || (includeMoving ? trimmedAddress : ""),
          });
        } else {
          console.log("✅ Создаем новый moving_order для PENDING_TO");
          // Создаем дату возврата: дата начала бронирования + количество месяцев
          const startDate = new Date(individualBookingStartDate || new Date());
          const returnDate = new Date(startDate);
          returnDate.setMonth(returnDate.getMonth() + monthsNumber);
          returnDate.setHours(10, 0, 0, 0);
          
          allMovingOrders.push({
            moving_date: returnDate.toISOString(),
            status: "PENDING_TO",
            address: movingAddressTo.trim() || (includeMoving ? trimmedAddress : ""),
          });
        }
      }
      
      console.log("📦 Финальные moving_orders:", allMovingOrders);
      
      // Добавляем moving_orders только если они есть
      if (allMovingOrders.length > 0) {
        orderData.moving_orders = allMovingOrders;
        // Если есть moving_orders, устанавливаем is_selected_moving в true
        orderData.is_selected_moving = true;
      }

      console.log("📤 Отправляемые данные заказа:", orderData);

      if (finalServices.length > 0) {
        orderData.services = finalServices;
      }

      console.log("📤 Отправляемые данные заказа (home):", orderData);

      await warehouseApi.createOrder(orderData);

      toast.success(
        <div>
          <div>
            <strong>Заявка отправлена!</strong>
          </div>
          <div style={{ marginTop: 5 }}>
            СМС от <strong>TrustMe</strong> для подписания договора придёт после подтверждения заявки менеджером.
            <br />
            Оплата будет доступна сразу после подписания договора.
          </div>
        </div>,
        {
          autoClose: 4000,
        }
      );

      setTimeout(() => {
        navigate("/personal-account", { state: { activeSection: "payments" } });
      }, 1500);
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      const errorData = error.response?.data;
      const message = errorData?.message || errorData?.error || error.message || "Не удалось создать заказ. Попробуйте позже.";

      // Проверяем, достигнут ли лимит активных заказов
      const isMaxOrdersError = error.response?.status === 403 && (
          message.includes('максимальное количество боксов') ||
          message.includes('MAX_ORDERS_LIMIT_REACHED') ||
          errorData?.error?.includes('максимальное количество боксов') ||
          errorData?.message?.includes('максимальное количество боксов')
      );

      if (isMaxOrdersError) {
        // Показываем модал обратного звонка вместо обычной ошибки
        setCallbackModalContext('max_orders_limit');
        openCallbackModal('max_orders_limit');
        setSubmitError(null);
        setIsSubmittingOrder(false);
        return;
      }

      setSubmitError(message);
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [
    buildMovingOrders,
    ensureServiceOptions,
    gazelleService,
    includeMoving,
    includePacking,
    isAuthenticated,
    isSubmittingOrder,
    isUserRole,
    monthsNumber,
    navigate,
    packagingServicesForOrder,
    previewStorage,
    selectedWarehouse,
    serviceOptions,
    movingAddressFrom,
    openCallbackModal,
    movingOrders,
    individualBookingStartDate,
  ]);

  const handleCreateCloudOrder = useCallback(async () => {
    if (isSubmittingOrder) return;

    if (!isAuthenticated) {
      toast.info("Авторизуйтесь, чтобы оформить заказ.");
      navigate("/login", { state: { from: "/" } });
      return;
    }

    if (!isUserRole) {
      toast.error("Создание заказа доступно только клиентам с ролью USER.");
      return;
    }

    if (!cloudStorage?.id) {
      setSubmitError("Склад облачного хранения временно недоступен.");
      return;
    }

    if (!cloudMonthsNumber || cloudMonthsNumber <= 0) {
      setSubmitError("Укажите срок аренды для облачного хранения.");
      return;
    }

    if (!cloudVolume || cloudVolume <= 0) {
      setSubmitError("Укажите габариты вещей для расчёта объёма.");
      return;
    }

    if (!cloudPickupAddress.trim()) {
      setSubmitError("Укажите адрес забора вещей.");
      return;
    }

    try {
      setIsSubmittingOrder(true);
      setSubmitError(null);

      const trimmedAddress = cloudPickupAddress.trim();

      const orderItems = [
        {
          name: "Облачное хранение",
          volume: Number(cloudVolume.toFixed(2)),
          cargo_mark: "NO",
        },
      ];

      // Формируем дату начала бронирования для облачного хранения
      const cloudStartDate = cloudBookingStartDate ? new Date(cloudBookingStartDate).toISOString() : new Date().toISOString();

      // Для облачного хранения всегда включена перевозка, нужно добавить услугу "Газель"
      let availableOptions = serviceOptions;
      if (serviceOptions.length === 0) {
        const loadedOptions = await ensureServiceOptions();
        if (Array.isArray(loadedOptions) && loadedOptions.length > 0) {
          availableOptions = loadedOptions;
        }
      }

      // Ищем GAZELLE_FROM для облачного хранения
      const gazelleFromOption =
        gazelleService ||
        availableOptions?.find((option) => option.type === "GAZELLE_FROM");
      const gazelleFromId =
        gazelleFromOption?.id ?? gazelleFromOption?.service_id ?? gazelleFromOption ?? null;

      // Для облачного хранения перевозка всегда включена, и если есть услуга "Газель", то is_selected_package = true
      const hasGazelleForCloud = gazelleFromId && Number.isFinite(Number(gazelleFromId));

      const orderData = {
        storage_id: Number(cloudStorage.id),
        months: cloudMonthsNumber,
        start_date: cloudStartDate,
        order_items: orderItems,
        is_selected_moving: true,
        is_selected_package: hasGazelleForCloud, // true если есть услуга "Газель"
        moving_orders: buildMovingOrders(trimmedAddress, cloudMonthsNumber, cloudPickupDate),
      };

      // Добавляем услугу "Газель - забор" для перевозки (только GAZELLE_FROM)
      if (hasGazelleForCloud) {
        orderData.services = [
          {
            service_id: Number(gazelleFromId),
            count: 1, // только забор вещей
          },
        ];
      }

      await warehouseApi.createOrder(orderData);

      toast.success(
        <div>
          <div>
            <strong>Заявка отправлена!</strong>
          </div>
          <div style={{ marginTop: 5 }}>
            СМС от <strong>TrustMe</strong> для подписания договора придёт после подтверждения заявки менеджером.
            <br />
            Оплата будет доступна сразу после подписания договора.
          </div>
        </div>,
        {
          autoClose: 4000,
        }
      );

      setTimeout(() => {
        navigate("/personal-account", { state: { activeSection: "payments" } });
      }, 1500);
    } catch (error) {
      console.error("Ошибка при создании облачного заказа:", error);
      const errorData = error.response?.data;
      const message = errorData?.message || errorData?.error || error.message || "Не удалось создать заказ. Попробуйте позже.";

      // Проверяем, достигнут ли лимит активных заказов
      const isMaxOrdersError = error.response?.status === 403 && (
          message.includes('максимальное количество боксов') ||
          message.includes('MAX_ORDERS_LIMIT_REACHED') ||
          errorData?.error?.includes('максимальное количество боксов') ||
          errorData?.message?.includes('максимальное количество боксов')
      );

      if (isMaxOrdersError) {
        // Показываем модал обратного звонка вместо обычной ошибки
        setCallbackModalContext('max_orders_limit');
        openCallbackModal('max_orders_limit');
        setSubmitError(null);
        setIsSubmittingOrder(false);
        return;
      }

      setSubmitError(message);
      toast.error(message, {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [
    buildMovingOrders,
    cloudMonthsNumber,
    cloudPickupAddress,
    cloudStorage,
    cloudVolume,
    isAuthenticated,
    isSubmittingOrder,
    isUserRole,
    navigate,
  ]);

  const handleIndividualBookingClick = useCallback(() => {
    if (!isAuthenticated) {
      openCallbackModal('booking');
      return;
    }
    handleCreateIndividualOrder();
  }, [handleCreateIndividualOrder, isAuthenticated, openCallbackModal]);

  const handleCloudBookingClick = useCallback(() => {
    if (!isAuthenticated) {
      openCallbackModal('booking');
      return;
    }
    handleCreateCloudOrder();
  }, [handleCreateCloudOrder, isAuthenticated, openCallbackModal]);

  const handleHeroBookingClick = useCallback(() => {
    if (!isAuthenticated) {
      openCallbackModal('booking');
      return;
    }
    navigate("/warehouse-order");
  }, [isAuthenticated, navigate, openCallbackModal]);

  const handleCallbackRequestClick = useCallback(() => {
    openCallbackModal('callback');
  }, [openCallbackModal]);

  const handleCloudDimensionChange = (dimension, rawValue) => {
    const value = Math.max(0.1, Number(rawValue) || 0);
    setCloudDimensions((prev) => ({ ...prev, [dimension]: value }));
    setSubmitError(null);
  };

  useEffect(() => {
    if (activeStorageTab !== "CLOUD") {
      setCloudPickupAddress("");
    }
  }, [activeStorageTab]);

  useEffect(() => {
    let isCancelled = false;

    const calculateCloudPrice = async () => {
      if (activeStorageTab !== "CLOUD") {
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
        setCloudPriceError("Укажите габариты вещей, чтобы рассчитать объём хранение.");
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
  }, [activeStorageTab, cloudMonthsNumber, cloudVolume]);

  // Загрузка складов с API
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        setWarehousesLoading(true);
        setWarehousesError(null);
        const data = await warehouseApi.getAllWarehouses();
        setApiWarehouses(Array.isArray(data) ? data : []);

        // Устанавливаем первый склад INDIVIDUAL как выбранный по умолчанию
        if (data && data.length > 0) {
          const firstIndividual = data.find((item) => item.type === "INDIVIDUAL");
          setSelectedWarehouse(firstIndividual || data[0]);
        }

        if (import.meta.env.DEV) {
          console.log("Склады с API загружены:", data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке складов:", error);
        setWarehousesError("Не удалось загрузить список складов");
        // Используем статичные склады как fallback
        setSelectedWarehouse(warehouses[0]);
      } finally {
        setWarehousesLoading(false);
      }
    };

    fetchWarehouses();
  }, [warehouses]);

  const dropdownItems = useMemo(() => {
    const list = apiWarehouses.length > 0 ? apiWarehouses : warehouses;
    return list.filter((item) => item.type !== "CLOUD");
  }, [apiWarehouses, warehouses]);

  useEffect(() => {
    if (!selectedWarehouse || selectedWarehouse.type === "CLOUD") {
      setSelectedWarehouse(dropdownItems[0] || null);
    }
  }, [dropdownItems, selectedWarehouse]);

  useEffect(() => {
    setPreviewStorage(null);
  }, [selectedWarehouse]);

  useEffect(() => {
    if (selectedWarehouse?.name !== "Жилой комплекс «Комфорт Сити»") {
      setKomfortSelectedMap(1);
    }
  }, [selectedWarehouse]);

  // Загрузка цен услуг для расчета процента скидки (только для индивидуальных складов)
  useEffect(() => {
    const loadServicePrices = async () => {
      if (!selectedWarehouse || selectedWarehouse.type !== 'INDIVIDUAL') {
        setServicePrices({});
        setGazelleFromPrice(null);
        return;
      }

      try {
        const prices = await warehouseApi.getWarehouseServicePrices(selectedWarehouse.id);
        const pricesMap = {};
        prices.forEach(price => {
          pricesMap[price.service_type] = parseFloat(price.price);
          // Сохраняем цену GAZELLE_FROM отдельно для расчета доставки
          if (price.service_type === 'GAZELLE_FROM') {
            setGazelleFromPrice(parseFloat(price.price));
          }
        });
        setServicePrices(pricesMap);
      } catch (error) {
        console.error('Ошибка при загрузке цен услуг для расчета скидки:', error);
        setServicePrices({});
        setGazelleFromPrice(null);
      }
    };

    loadServicePrices();
  }, [selectedWarehouse]);

  // Удаляем загрузку GAZELLE_TO, так как теперь используется только GAZELLE_FROM по умолчанию
  // GAZELLE_TO можно выбрать вручную в дополнительных услугах

  useEffect(() => {
    if (selectedWarehouse?.name === "Жилой комплекс «Комфорт Сити»") {
      setPreviewStorage(null);
    }
  }, [komfortSelectedMap, selectedWarehouse]);

  useEffect(() => {
    if (!isMapModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMapModalOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(max-width: 768px)");
    const updateMatch = (event) => setIsMobileView(event.matches);
    updateMatch(mediaQuery);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", updateMatch);
      return () => mediaQuery.removeEventListener("change", updateMatch);
    }

    mediaQuery.addListener(updateMatch);
    return () => mediaQuery.removeListener(updateMatch);
  }, []);

  useEffect(() => {
    if (!includeMoving) {
      setGazelleService(null);
      return;
    }

    if (serviceOptions.length === 0) {
      ensureServiceOptions();
      return;
    }

    // Ищем GAZELLE_FROM вместо GAZELLE
    const gazelleFrom = serviceOptions.find((option) => option.type === "GAZELLE_FROM");
    if (gazelleFrom) {
      setGazelleService({
        id: String(gazelleFrom.id),
        name: getServiceTypeName(gazelleFrom.type) || gazelleFrom.description || "Газель - забор вещей",
        price: gazelleFrom.price,
      });
    } else {
      setGazelleService(null);
    }
  }, [includeMoving, serviceOptions, ensureServiceOptions]);

  useEffect(() => {
    setSubmitError(null);
  }, [activeStorageTab]);

  useEffect(() => {
    let isCancelled = false;

    const calculatePrice = async () => {
      if (activeStorageTab !== "INDIVIDUAL") {
        setPricePreview(null);
        setPriceError(null);
        return;
      }

      if (!selectedWarehouse || selectedWarehouse?.type === "CLOUD") {
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
          warehouse_id: selectedWarehouse.id,
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
  }, [activeStorageTab, monthsNumber, previewStorage, selectedWarehouse]);

  const renderWarehouseScheme = ({ isFullscreen = false } = {}) => {
    if (!selectedWarehouse) {
      return (
        <div className="min-h-[220px] flex items-center justify-center text-center text-[#6B6B6B]">
          Выберите склад, чтобы увидеть схему расположения боксов.
        </div>
      );
    }

    if (selectedWarehouse?.type === "CLOUD") {
      return (
        <div className="min-h-[220px] flex items-center justify-center text-center text-[#6B6B6B]">
          Для облачного хранения схема склада не требуется — мы забираем и возвращаем ваши вещи сами.
        </div>
      );
    }

    const storageBoxes = selectedWarehouse?.storage ?? [];

    if (!storageBoxes.length) {
      return (
        <div className="min-h-[220px] flex items-center justify-center text-center text-[#6B6B6B]">
          Схема для выбранного склада появится после синхронизации с системой бронирования.
        </div>
      );
    }

    const canvasProps = {
      storageBoxes,
      onBoxSelect: setPreviewStorage,
      selectedStorage: previewStorage,
      userRole: "USER",
      isViewOnly: true,
    };

    const isKomfortWarehouse = selectedWarehouse.name === "Жилой комплекс «Комфорт Сити»";
    if (isKomfortWarehouse) {
      canvasProps.selectedMap = komfortSelectedMap;
    }

    let canvas = null;

    if (selectedWarehouse.name === "Mega Tower Almaty, жилой комплекс") {
      canvas = <InteractiveWarehouseCanvas {...canvasProps} />;
    } else if (selectedWarehouse.name === "Есентай, жилой комплекс") {
      canvas = <MainWarehouseCanvas {...canvasProps} />;
    } else if (isKomfortWarehouse) {
      canvas = <ZhkKomfortCanvas {...canvasProps} />;
    }

    if (!canvas) {
      return (
        <div className="min-h-[220px] flex items-center justify-center text-center text-[#6B6B6B]">
          Для выбранного склада пока нет схемы. Пожалуйста, свяжитесь с менеджером для подробной информации.
        </div>
      );
    }

    const komfortControls = isKomfortWarehouse ? (
      <div
        className={`flex ${isFullscreen ? "flex-col sm:flex-row sm:items-center sm:justify-between gap-3" : "items-center justify-center gap-3"} flex-wrap`}
      >
        <span className="text-sm font-semibold text-[#273655]">Карта Жилой комплекс «Комфорт Сити»</span>
        <div className="inline-flex rounded-xl border border-[#d7dbe6] bg-white p-1 shadow-sm">
          {[1, 2].map((mapNumber) => {
            const isActive = komfortSelectedMap === mapNumber;
            return (
              <button
                key={mapNumber}
                type="button"
                onClick={() => setKomfortSelectedMap(mapNumber)}
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                  isActive
                    ? "bg-[#273655] text-white shadow"
                    : "text-[#273655] hover:bg-[#273655]/10"
                }`}
                aria-pressed={isActive}
              >
                Карта {mapNumber}
              </button>
            );
          })}
        </div>
      </div>
    ) : null;

    const wrapperClasses = isFullscreen
      ? "flex-1 min-h-[50vh] rounded-2xl border border-[#d7dbe6] bg-white overflow-auto"
      : "rounded-2xl border border-dashed border-[#273655]/20 bg-white/70 max-h-[320px] overflow-auto";

    const showInlineCanvas = isFullscreen || !isMobileView;

    return (
      <div className={`flex flex-col gap-4 ${isFullscreen ? "h-full" : ""}`}>
        {showInlineCanvas && komfortControls}
        {showInlineCanvas ? (
          <div
            className={wrapperClasses}
            style={
              isFullscreen
                ? {
                    maxHeight: isMobileView ? "70vh" : "75vh",
                  }
                : undefined
            }
          >
            <div className="min-w-max mx-auto py-3 px-2">
              {canvas}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#273655]/20 bg-white px-4 py-3 text-sm text-[#6B6B6B]">
            Нажмите «Смотреть карту», чтобы открыть схему склада на весь экран.
          </div>
        )}
        {!isFullscreen && (
          <button
            type="button"
            onClick={() => setIsMapModalOpen(true)}
            className="self-center w-full sm:w-auto px-4 py-2 rounded-xl border border-[#273655] text-[#273655] text-sm font-semibold hover:bg-[#273655] hover:text-white transition-colors"
          >
            Смотреть карту
          </button>
        )}
      </div>
    );
  };


  return (
    <div className="font-['Montserrat'] min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 relative overflow-hidden">
        <div className="container mx-auto tracking-[0.1em] px-4 py-8">
          <div className="text-center relative flex flex-col items-center">
            <h1 className="text-[22px] sm:text-[28px] md:text-[45px] font-bold text-[#273655] mb-2 flex flex-col items-center leading-[1.0] font-['Montserrat']">
              <div className="flex justify-center items-center gap-2">
                <img
                  src={vectorImg}
                  alt="Декор"
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                />
                <span>ЖИВИТЕ СВОБОДНО</span>
                <img
                  src={vectorImg}
                  alt="Декор"
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                />
              </div>
            </h1>

            <div className="mt-3">
              <button
                onClick={handleHeroBookingClick}
                className="bg-[#F86812] hover:bg-[#e55a0a] text-white px-6 sm:px-8 md:px-10 py-2 sm:py-2.5 rounded-[15px] text-base sm:text-lg font-bold transition-all duration-300 hover:shadow-lg hover:scale-105 font-['Montserrat']"
              >
                ЗАБРОНИРОВАТЬ БОКС
              </button>
            </div>

            <div className="relative mt-5 w-full h-[280px] sm:h-[350px] md:h-[470px]">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-[200%] sm:w-[126%] max-w-none z-0 h-full flex items-center justify-center">
                <img
                  src={backgroundTextImg}
                  alt="Background"
                  className="w-full h-auto object-contain opacity-[0.6] sm:opacity-[0.8] md:opacity-[0.9] brightness-[0] contrast-[100%] scale-90"
                />
              </div>
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <img
                  src={boxesImg}
                  alt="Коробки"
                  className="w-[120%] sm:w-full max-w-4xl object-contain transform scale-100 sm:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Второй фрейм: преимущества */}
      <section className="w-full flex flex-col items-center justify-center mt-8 sm:mt-16 mb-8 sm:mb-16 px-4 sm:px-6">
        <div className="w-full max-w-[1144px] flex flex-col items-center">
          <Tabs value={activeStorageTab} onValueChange={setActiveStorageTab} className="w-full">
            <div className="w-full bg-[#F5F6FA] rounded-2xl p-1">
              <TabsList className="grid grid-cols-1 sm:grid-cols-2 w-full bg-transparent h-auto">
                <TabsTrigger
                  value="INDIVIDUAL"
                  className="rounded-2xl py-3 px-4 text-sm sm:text-base font-semibold text-[#273655] data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#1f2d4c] transition-all"
                >
                  Индивидуальное хранение
                </TabsTrigger>
                <TabsTrigger
                  value="CLOUD"
                  className="rounded-2xl py-3 px-4 text-sm sm:text-base font-semibold text-[#273655]/70 data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-[#1f2d4c] transition-all"
                >
                  Облачное хранение
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="INDIVIDUAL" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] gap-6">
                <div className="space-y-6">
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
                        items={dropdownItems}
                        value={selectedWarehouse ? (selectedWarehouse.id ?? selectedWarehouse.value) : undefined}
                        onChange={(_, item) => setSelectedWarehouse(item)}
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
                      {renderWarehouseScheme()}
                    </div>
                  </div>
                </div>

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
                      Дата начала бронирования
                    </span>
                    <DatePicker
                      value={individualBookingStartDate}
                      onChange={(value) => {
                        setIndividualBookingStartDate(value);
                        setSubmitError(null);
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                      allowFutureDates={true}
                      placeholder="ДД.ММ.ГГГГ"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-2.5">
                    <span className="text-sm font-semibold text-[#273655]">
                      Срок аренды (месяцы)
                    </span>
                    <Select
                      value={individualMonths}
                      onValueChange={(value) => {
                        setIndividualMonths(value);
                        setSubmitError(null);
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-[#273655]/20 text-[#273655]">
                        <SelectValue placeholder="Выберите срок" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {getMonthLabel(month)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="rounded-2xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 text-[#273655] font-semibold">
                          <Truck className="w-5 h-5 shrink-0" />
                          <span>Перевозка вещей</span>
                          <InfoHint
                            description={
                              <span>
                                Заберём ваши вещи по указанному адресу и доставим на склад. Стоимость услуги: {gazelleFromPrice !== null ? (
                                  <>забор вещей (с клиента на склад) — {gazelleFromPrice.toLocaleString()} ₸</>
                                ) : (
                                  <>стоимость — {movingServicePrice.toLocaleString()} ₸</>
                                )}, добавится при оформлении заявки. Возврат вещей можно заказать отдельно как дополнительную услугу.
                              </span>
                            }
                            ariaLabel="Подробнее о перевозке вещей"
                            align="start"
                          />
                        </div>
                        <Switch
                          checked={includeMoving}
                          onCheckedChange={async (checked) => {
                            setIncludeMoving(checked);
                            setSubmitError(null);
                            if (checked) {
                              await ensureServiceOptions();
                            } else {
                              setMovingAddressFrom("");
                            }
                          }}
                          className="bg-gray-200 data-[state=checked]:bg-[#273655]"
                        />
                      </div>

                      {includeMoving && (
                        <div className="mt-3 space-y-3">
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-[#6B6B6B] uppercase tracking-[0.08em]">Дата забора вещей</label>
                            <DatePicker
                              value={movingPickupDate}
                              onChange={(value) => {
                                setMovingPickupDate(value);
                                setSubmitError(null);
                              }}
                              minDate={new Date().toISOString().split('T')[0]}
                              allowFutureDates={true}
                              placeholder="ДД.ММ.ГГГГ"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-xs text-[#6B6B6B] uppercase tracking-[0.08em]">Адрес забора</label>
                            <input
                              type="text"
                              value={movingAddressFrom}
                              onChange={(e) => {
                                setMovingAddressFrom(e.target.value);
                                setSubmitError(null);
                              }}
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
                        <span>Дополнительные услуги</span>
                        <InfoHint
                          description={
                            <span>
                              Выберите дополнительные услуги — всё, что нужно, чтобы подготовить вещи к хранению.
                            </span>
                          }
                          ariaLabel="Подробнее о дополнительных услугах"
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
                          }
                          setSubmitError(null);
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
                                    // Скрываем GAZELLE_FROM (добавляется автоматически при перевозке)
                                    if (option.type === "GAZELLE_FROM") return false;
                                    // Скрываем старый тип GAZELLE (для обратной совместимости)
                                    if (option.type === "GAZELLE") return false;
                                    // Исключаем услуги, которые уже выбраны в других строках
                                    const isAlreadySelected = services.some((s, i) => 
                                      i !== index && String(s.service_id) === String(option.id)
                                    );
                                    return !isAlreadySelected;
                                  });

                                  // Проверяем, выбрана ли услуга GAZELLE_TO для текущей строки
                                  const isGazelleToService = selectedOption && selectedOption.type === "GAZELLE_TO";
                                  
                                  return (
                                    <div key={index} className="space-y-2">
                                      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#d7dbe6] bg-white px-3 py-2">
                                        <Select
                                          value={service.service_id}
                                          onValueChange={(value) => updateServiceRow(index, "service_id", value)}
                                        >
                                          <SelectTrigger className="h-10 min-w-[180px] rounded-lg border-[#d7dbe6] text-sm">
                                            <SelectValue placeholder="Услуга" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableOptions.length > 0 ? (
                                              availableOptions.map((option) => {
                                                // Используем description если есть, иначе getServiceTypeName, иначе не показываем
                                                const serviceName = option.description || getServiceTypeName(option.type);
                                                if (!serviceName) return null;
                                                return (
                                                  <SelectItem key={option.id} value={String(option.id)}>
                                                    {serviceName}
                                                  </SelectItem>
                                                );
                                              }).filter(Boolean)
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
                                      
                                      {/* Показываем поле адреса, если выбрана услуга GAZELLE_TO */}
                                      {isGazelleToService && (
                                        <div className="pl-3 pr-11">
                                          <label className="block text-xs text-[#6B6B6B] uppercase tracking-[0.08em] mb-1">
                                            Адрес доставки вещей
                                          </label>
                                          <input
                                            type="text"
                                            value={movingAddressTo}
                                            onChange={(e) => {
                                              setMovingAddressTo(e.target.value);
                                              // Обновляем адрес в moving_order
                                              setMovingOrders(prev => prev.map(order => 
                                                order.status === "PENDING_TO" 
                                                  ? { ...order, address: e.target.value }
                                                  : order
                                              ));
                                            }}
                                            placeholder="Например: г. Алматы, Абая 25"
                                            className="w-full h-[42px] rounded-xl border border-[#d5d8e1] px-3 text-sm text-[#273655] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                                          />
                                        </div>
                                      )}
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
                  <div className="rounded-2xl border border-dashed border-[#273655]/30 bg-white px-4 py-3 text-sm text-[#273655] space-y-3">
                    <div className="flex items-center justify-between text-[#273655]">
                      <span className="text-sm font-semibold uppercase tracking-[0.12em]">Итог</span>
                      {previewStorage && (
                        <span className="text-xl font-black text-[#273655] tracking-tight">
                          {previewStorage.name}
                        </span>
                      )}
                    </div>
                    {/* Информация о боксе */}
                    {previewStorage && (
                      <div className="space-y-1 pb-2 border-b border-dashed border-[#273655]/20">
                        {(() => {
                          const area = parseFloat(
                            previewStorage?.available_volume ??
                            previewStorage?.total_volume ??
                            previewStorage?.area ??
                            previewStorage?.square ??
                            previewStorage?.volume ??
                            0
                          );
                          const totalArea = parseFloat(previewStorage?.total_volume ?? 0);

                          return (
                            <>
                              {area > 0 && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#6B6B6B]">Доступная площадь:</span>
                                  <span className="font-medium text-[#273655]">
                                    {area.toFixed(2)} м²
                                  </span>
                                </div>
                              )}
                              {totalArea > 0 && totalArea !== area && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#6B6B6B]">Общая площадь:</span>
                                  <span className="font-medium text-[#273655]">
                                    {totalArea.toFixed(2)} м²
                                  </span>
                                </div>
                              )}
                              {previewStorage?.height && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-[#6B6B6B]">Высота:</span>
                                  <span className="font-medium text-[#273655]">
                                    {previewStorage.height} м
                                  </span>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                    {/* Информация о бронировании для занятых боксов */}
                    {previewStorage && (previewStorage.status === 'OCCUPIED' || previewStorage.status === 'PENDING') && previewStorage.occupancy && previewStorage.occupancy.length > 0 && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#273655] mb-2">
                          ИТОГ
                        </div>
                        {(() => {
                          // Находим активное бронирование
                          const activeBooking = previewStorage.occupancy.find(
                            (booking) => booking.status === 'ACTIVE'
                          ) || previewStorage.occupancy[0]; // Если нет ACTIVE, берем первое
                          
                          if (activeBooking && activeBooking.start_date && activeBooking.end_date) {
                            return (
                              <p className="text-sm text-[#6B6B6B]">
                                Бокс стоит о бронировании с{" "}
                                <span className="font-medium text-[#273655]">
                                  {new Date(activeBooking.start_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                                , по{" "}
                                <span className="font-medium text-[#273655]">
                                  {new Date(activeBooking.end_date).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                </span>
                              </p>
                            );
                          }
                          return (
                            <p className="text-sm text-[#6B6B6B]">
                              Бокс занят
                            </p>
                          );
                        })()}
                      </div>
                    )}
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
                        {/* Показываем варианты скидок для 6 и 12 месяцев */}
                        {selectedWarehouse?.type === 'INDIVIDUAL' && servicePrices['M2_UP_6M'] && (
                          <div className="space-y-2">
                            {/* Скидка за 6 месяцев */}
                            {monthsNumber < 6 && servicePrices['M2_6_12M'] && (() => {
                              const rawArea = parseFloat(
                                previewStorage.available_volume ??
                                previewStorage.total_volume ??
                                previewStorage.area ??
                                previewStorage.square ??
                                previewStorage.volume ??
                                0
                              );
                              
                              if (!rawArea || rawArea <= 0) return null;
                              
                              const basePricePerM2 = parseFloat(servicePrices['M2_UP_6M']) || 0;
                              const discountPricePerM2 = parseFloat(servicePrices['M2_6_12M']) || 0;
                              
                              if (!basePricePerM2 || !discountPricePerM2) return null;
                              
                              const basePrice = basePricePerM2 * rawArea * 6;
                              const discountPrice = discountPricePerM2 * rawArea * 6;
                              
                              if (basePrice <= 0) return null;
                              
                              const discountPercent = Math.round(((basePrice - discountPrice) / basePrice) * 100);
                              if (discountPercent <= 0) return null;
                              
                              return (
                                <div className="flex items-center justify-between px-2 py-1.5 border-2 border-red-500 rounded-lg bg-red-50">
                                  <span className="text-xs">
                                    <span className="text-[#6B6B6B]">За 6 мес </span>
                                    <span className="text-red-600 font-semibold">скидка {discountPercent}%!</span>
                                  </span>
                                  <span className="text-sm font-semibold text-[#273655]">
                                    {Math.round(discountPrice).toLocaleString()} ₸
                                  </span>
                                </div>
                              );
                            })()}
                            
                            {/* Скидка за 12 месяцев */}
                            {monthsNumber < 12 && servicePrices['M2_OVER_12M'] && (() => {
                              const rawArea = parseFloat(
                                previewStorage.available_volume ??
                                previewStorage.total_volume ??
                                previewStorage.area ??
                                previewStorage.square ??
                                previewStorage.volume ??
                                0
                              );
                              
                              if (!rawArea || rawArea <= 0) return null;
                              
                              const basePricePerM2 = parseFloat(servicePrices['M2_UP_6M']) || 0;
                              const discountPricePerM2 = parseFloat(servicePrices['M2_OVER_12M']) || 0;
                              
                              if (!basePricePerM2 || !discountPricePerM2) return null;
                              
                              const basePrice = basePricePerM2 * rawArea * 12;
                              const discountPrice = discountPricePerM2 * rawArea * 12;
                              
                              if (basePrice <= 0) return null;
                              
                              const discountPercent = Math.round(((basePrice - discountPrice) / basePrice) * 100);
                              if (discountPercent <= 0) return null;
                              
                              return (
                                <div className="flex items-center justify-between px-2 py-1.5 border-2 border-red-500 rounded-lg bg-red-50">
                                  <span className="text-xs">
                                    <span className="text-[#6B6B6B]">За 12 мес </span>
                                    <span className="text-red-600 font-semibold">скидка {discountPercent}%!</span>
                                  </span>
                                  <span className="text-sm font-semibold text-[#273655]">
                                    {Math.round(discountPrice).toLocaleString()} ₸
                                  </span>
                                </div>
                              );
                            })()}
                          </div>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-[#6B6B6B]">За {monthsNumber} мес</span>
                          <div className="flex items-center gap-2">
                            {/* Показываем процент скидки для выбранного периода */}
                            {selectedWarehouse?.type === 'INDIVIDUAL' && (monthsNumber === 6 || monthsNumber === 12) && servicePrices['M2_UP_6M'] && (() => {
                              const rawArea = parseFloat(
                                previewStorage.available_volume ??
                                previewStorage.total_volume ??
                                previewStorage.area ??
                                previewStorage.square ??
                                previewStorage.volume ??
                                0
                              );
                              
                              if (!rawArea || rawArea <= 0) return null;
                              
                              const basePricePerM2 = parseFloat(servicePrices['M2_UP_6M']) || 0;
                              let discountPricePerM2 = 0;
                              
                              if (monthsNumber === 6) {
                                discountPricePerM2 = parseFloat(servicePrices['M2_6_12M']) || 0;
                              } else if (monthsNumber === 12) {
                                discountPricePerM2 = parseFloat(servicePrices['M2_OVER_12M']) || 0;
                              }
                              
                              if (!basePricePerM2 || !discountPricePerM2) return null;
                              
                              const basePrice = basePricePerM2 * rawArea * monthsNumber;
                              const discountPrice = discountPricePerM2 * rawArea * monthsNumber;
                              
                              if (basePrice <= 0) return null;
                              
                              const discountPercent = Math.round(((basePrice - discountPrice) / basePrice) * 100);
                              if (discountPercent <= 0) return null;
                              
                              return (
                                <span className="text-xs text-red-600 font-semibold">
                                  скидка {discountPercent}%!
                                </span>
                              );
                            })()}
                            <span className="text-lg font-bold text-[#273655]">
                              {costSummary.baseTotal?.toLocaleString() ?? "—"} ₸
                            </span>
                          </div>
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
                    {(previewStorage && (pricePreview || serviceSummary.total > 0)) && (
                      <div className="flex items-center justify-between border-t border-dashed border-[#273655]/20 pt-3 text-base font-bold text-[#273655]">
                        <span>Всего</span>
                        <span>
                          {(costSummary.combinedTotal || 0).toLocaleString()} ₸
                        </span>
                      </div>
                    )}
                    {priceError && (
                      <p className="text-xs text-[#C73636]">
                        {priceError}
                      </p>
                    )}
                    {submitError && (
                      <p className="text-xs text-[#C73636]">
                        {submitError}
                      </p>
                    )}
                  </div>

                  <SmartButton
                    variant="success"
                    size="lg"
                    className="w-full h-[56px] text-base font-semibold"
                    onClick={handleIndividualBookingClick}
                    isLoading={isSubmittingOrder}
                    disabled={!isIndividualFormReady || isSubmittingOrder}
                  >
                    Забронировать бокс
                  </SmartButton>
                  <SmartButton
                    variant="outline"
                    size="lg"
                    className="w-full h-[56px] text-base font-semibold border-[#273655] text-[#273655] hover:bg-[#273655] hover:text-white"
                    onClick={handleCallbackRequestClick}
                  >
                    ЗАКАЗАТЬ ОБРАТНЫЙ ЗВОНОК
                  </SmartButton>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="CLOUD" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6">
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
                        onChange={(e) => handleCloudDimensionChange("width", e.target.value)}
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
                        onChange={(e) => handleCloudDimensionChange("height", e.target.value)}
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
                        onChange={(e) => handleCloudDimensionChange("length", e.target.value)}
                        className="flex-1 h-[56px] rounded-2xl border border-[#273655]/20 bg-white px-4 text-base text-[#273655] font-medium focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                      />
                      <span className="text-sm text-[#6B6B6B]">м</span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#273655]/5 border border-[#273655]/15 p-3 space-y-3">
                    <p className="text-sm text-[#6B6B6B]">
                      Рассчитанный объём: <span className="font-semibold text-[#273655]">{cloudVolume.toFixed(2)} м³</span>
                    </p>

                    <div className="rounded-2xl border border-dashed border-[#273655]/30 bg-white px-4 py-3 text-sm text-[#273655] space-y-3">
                      <div className="flex items-center justify-between text-[#273655]">
                        <span className="text-sm font-semibold uppercase tracking-[0.12em]">Итог</span>
                        <span className="text-4xl font-black text-[#273655] tracking-tight">
                          {cloudVolume.toFixed(2)} м³
                        </span>
                      </div>
                      {/* Информация о габаритах */}
                      {cloudVolume > 0 && (
                        <div className="space-y-1 pb-2 border-b border-dashed border-[#273655]/20">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#6B6B6B]">Габариты:</span>
                            <span className="font-medium text-[#273655]">
                              {cloudDimensions.width} × {cloudDimensions.height} × {cloudDimensions.length} м
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-[#6B6B6B]">Объём:</span>
                            <span className="font-medium text-[#273655]">
                              {cloudVolume.toFixed(2)} м³
                            </span>
                          </div>
                        </div>
                      )}
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
                      {submitError && (
                        <p className="text-xs text-[#C73636]">
                          {submitError}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

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
                    <DatePicker
                      label="Дата начала бронирования"
                      value={cloudBookingStartDate}
                      onChange={(value) => {
                        setCloudBookingStartDate(value);
                        setSubmitError(null);
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                      allowFutureDates={true}
                      placeholder="ДД.ММ.ГГГГ"
                    />
                    <p className="text-xs text-[#6B6B6B]">
                      Выберите дату, с которой начнется срок аренды
                    </p>
                  </div>

                  <div className="space-y-2 sm:space-y-2.5">
                    <span className="text-sm font-semibold text-[#273655]">
                      Срок аренды (месяцы)
                    </span>
                    <Select
                      value={cloudMonths}
                      onValueChange={(value) => {
                        setCloudMonths(value);
                        setSubmitError(null);
                      }}
                    >
                      <SelectTrigger className="h-12 rounded-2xl border-[#273655]/20 text-[#273655]">
                        <SelectValue placeholder="Выберите срок" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {getMonthLabel(month)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                    <div className="rounded-2xl bg-[#273655]/5 border border-[#273655]/20 p-3 text-sm text-[#273655] space-y-2">
                      <div className="rounded-xl border border-[#273655]/20 bg-white/80 px-3 py-2 text-xs sm:text-sm text-[#273655] flex items-start gap-2">
                        <Truck className="h-4 w-4 mt-[2px]" />
                        <div>
                          <strong>Дополнительные услуги</strong>
                          <p className="mt-1">
                            Мы сами забираем и упаковываем ваши вещи. Все услуги включены в тариф — вам нужно только указать адрес забора.
                          </p>
                        </div>
                      </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[#6B6B6B] uppercase tracking-[0.08em]">Дата забора вещей</span>
                      <DatePicker
                        value={cloudPickupDate}
                        onChange={(value) => {
                          setCloudPickupDate(value);
                          setSubmitError(null);
                        }}
                        minDate={new Date().toISOString().split('T')[0]}
                        allowFutureDates={true}
                        placeholder="ДД.ММ.ГГГГ"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-[#6B6B6B] uppercase tracking-[0.08em]">Адрес забора вещей</span>
                      <input
                        type="text"
                        value={cloudPickupAddress}
                        onChange={(e) => {
                          setCloudPickupAddress(e.target.value);
                          setSubmitError(null);
                        }}
                        placeholder="Например: г. Алматы, Абая 25"
                        className="h-[46px] rounded-xl border border-[#d5d8e1] px-3 text-sm text-[#273655] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                      />
                    </div>
                    <p>Перевозка и упаковка включены в стоимость.</p>
                  </div>

                  <SmartButton
                    variant="success"
                    size="lg"
                    className="w-full h-[56px] text-base font-semibold"
                    onClick={handleCloudBookingClick}
                    isLoading={isSubmittingOrder}
                    disabled={!isCloudFormReady || isSubmittingOrder}
                  >
                    Забронировать бокс
                  </SmartButton>
                  <SmartButton
                    variant="outline"
                    size="lg"
                    className="w-full h-[56px] text-base font-semibold border-[#273655] text-[#273655] hover:bg-[#273655] hover:text-white"
                    onClick={handleCallbackRequestClick}
                  >
                    ЗАКАЗАТЬ ОБРАТНЫЙ ЗВОНОК
                  </SmartButton>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {isMapModalOpen && (
        <div className="fixed inset-0 z-[1200]">
          {isMobileView ? (
            <div className="absolute inset-0 flex flex-col justify-end">
              <button
                type="button"
                aria-label="Закрыть карту"
                onClick={() => setIsMapModalOpen(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <div className="relative z-10 mt-auto w-full max-h-[92vh] rounded-t-3xl border border-[#d7dbe6]/60 bg-white shadow-2xl overflow-hidden">
                <div className="flex justify-center py-3">
                  <span className="block h-1.5 w-12 rounded-full bg-[#d7dbe6]" />
                </div>
                <div className="px-5 pb-6 flex flex-col gap-4 overflow-hidden">
                  <div className="flex items-start justify-between gap-3">
                    <div className="pr-6">
                      <p className="text-[11px] uppercase tracking-[0.24em] text-[#6B6B6B]">
                        Схема склада
                      </p>
                      <h3 className="text-lg font-semibold text-[#273655] leading-snug">
                        {selectedWarehouse?.name || "Карта склада"}
                      </h3>
                      {selectedWarehouse?.address && (
                        <p className="mt-1 text-sm text-[#6B6B6B]">
                          {selectedWarehouse.address}
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
                    <div className="h-full overflow-auto">
                      {renderWarehouseScheme({ isFullscreen: true })}
                    </div>
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
                <div className="p-6 pb-4 sm:p-8 sm:pb-6 flex flex-col gap-4 h-full">
                  <div className="space-y-1 pr-12">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#6B6B6B]">
                      Схема склада
                    </p>
                    <h3 className="text-xl font-bold text-[#273655]">
                      {selectedWarehouse?.name || "Карта склада"}
                    </h3>
                    {selectedWarehouse?.address && (
                      <p className="text-sm text-[#6B6B6B]">{selectedWarehouse.address}</p>
                    )}
                  </div>
                  <div className="flex-1 min-h-[40vh] overflow-auto">
                    {renderWarehouseScheme({ isFullscreen: true })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Шестой фрейм: филиалы Extra Space */}
      <section className="w-full flex flex-col items-center justify-center mt-28 mb-24 font-['Montserrat']">
        <div className="w-full max-w-6xl mx-auto mb-10 px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#273655]">
            ФИЛИАЛЫ
          </h2>
        </div>

        <div className="w-full max-w-6xl mx-auto px-4 md:px-8">
          {/* Карта на всю ширину */}
          <div className="w-full rounded-2xl overflow-hidden bg-[#f3f3f3] shadow-md">
            <div style={{ width: "100%", height: 500 }}>
              <WarehouseMap warehouses={warehouses} mapId="home-branches-map" />
            </div>
          </div>
        </div>
      </section>

      {/* Плавающая кнопка чата */}
      <ChatButton />

      <CallbackRequestModal
        open={isCallbackModalOpen}
        onOpenChange={handleCallbackModalOpenChange}
        showRegisterPrompt={!isAuthenticated}
        title={callbackModalContext === 'max_orders_limit' ? 'Связаться с поддержкой' : undefined}
        description={callbackModalDescription}
      />

      <LeadSourceModal
        open={isLeadSourceModalOpen}
        onOpenChange={setIsLeadSourceModalOpen}
        onSelect={saveLeadSource}
      />

      <Footer />
    </div>
  );
});

HomePage.displayName = "HomePage";

export default HomePage;
