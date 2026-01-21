import React, { useState, memo, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../widgets";
import extraspaceLogo from "../../assets/photo_5440760864748731559_y.jpg";
import oblachImg from "../../assets/oblach.png";
import ininvImg from "../../assets/Ininv.jpeg";
import Footer from "../../widgets/Footer";
import WarehouseMap from "../../components/WarehouseMap";
import WarehouseSVGMap from "../../components/WarehouseSVGMap";
import { warehouseApi } from "../../shared/api/warehouseApi";
import { paymentsApi } from "../../shared/api/paymentsApi";
import { promoApi } from "../../shared/api/promoApi";
import { Dropdown } from '../../shared/components/Dropdown.jsx';
import {
  Tabs,
  TabsContent,
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  Switch,
} from "../../components/ui";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Truck, Package, X, Info, Plus, Trash2, ChevronLeft, ChevronRight, Box, Moon, Camera, Wifi, Maximize, Thermometer, AlertTriangle, Tag, Check } from "lucide-react";
import { useAuth } from "../../shared/context/AuthContext";
import { toast } from "react-toastify";
import CallbackRequestModal from "@/shared/components/CallbackRequestModal.jsx";
import { LeadSourceModal, useLeadSource, shouldShowLeadSourceModal } from "@/shared/components/LeadSourceModal.jsx";
import DatePicker from "../../shared/ui/DatePicker";
import { RentalPeriodSelect } from "../../shared/ui/RentalPeriodSelect";
import sumkaImg from '../../assets/cloud-tariffs/sumka.png';
import motorcycleImg from '../../assets/cloud-tariffs/motorcycle.png';
import bicycleImg from '../../assets/cloud-tariffs/bicycle.png';
import furnitureImg from '../../assets/cloud-tariffs/furniture.png';
import shinaImg from '../../assets/cloud-tariffs/shina.png';
import sunukImg from '../../assets/cloud-tariffs/sunuk.png';
import garazhImg from '../../assets/cloud-tariffs/garazh.png';
import skladImg from '../../assets/cloud-tariffs/sklad.png';

const PACKING_SERVICE_ESTIMATE = 4000;

const getServiceTypeName = (type) => {
  switch (type) {
    case "LOADER":
      return "Услуги мувера";
    case "PACKER":
      return "Услуги упаковщика";
    case "FURNITURE_SPECIALIST":
      return "Мебельщик";
    case "GAZELLE":
      return "Газель";
    case "GAZELLE_FROM":
      return "Газель - забор вещей";
    case "GAZELLE_TO":
      return "Газель - возврат вещей";
    case "STRETCH_FILM":
      return "Стрейч плёнка";
    case "BOX_SIZE":
      return "Коробки";
    case "MARKER":
      return "Маркер";
    case "UTILITY_KNIFE":
      return "Канцелярский нож";
    case "BUBBLE_WRAP_1":
      return "Пузырчатая плёнка (10м)";
    case "BUBBLE_WRAP_2":
      return "Воздушно-пузырчатая плёнка (100м)";
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
  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  // Новые состояния для выбора склада
  const [apiWarehouses, setApiWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState(null);
  const [activeStorageTab, setActiveStorageTab] = useState("INDIVIDUAL");
  const tabsSectionRef = useRef(null);
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
  const [cloudVolumeDirect, setCloudVolumeDirect] = useState(1); // Прямой ввод объема для тарифов
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
  // Состояние для информации о бронировании занятого бокса
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isLoadingBookingInfo, setIsLoadingBookingInfo] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [komfortSelectedMap, setKomfortSelectedMap] = useState(1);
  const [megaSelectedMap, setMegaSelectedMap] = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);
  const mapRef = useRef(null);
  const [serviceOptions, setServiceOptions] = useState([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);
  const [servicesError, setServicesError] = useState(null);
  const [services, setServices] = useState([]);
  const [depositPrice, setDepositPrice] = useState(0); // Цена депозита
  const [gazelleService, setGazelleService] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackModalContext, setCallbackModalContext] = useState('callback');
  const [isLeadSourceModalOpen, setIsLeadSourceModalOpen] = useState(false);
  const { leadSource, saveLeadSource } = useLeadSource();
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  // Состояние для цен услуг (для расчета процента скидки)
  const [servicePrices, setServicePrices] = useState({});
  // Состояние для карусели тарифов
  const [currentTariffIndex, setCurrentTariffIndex] = useState(0);
  const [tariffsPerView, setTariffsPerView] = useState(4);
  const [selectedTariff, setSelectedTariff] = useState(null);
  // Состояние для цены доставки (только забор вещей)
  const [gazelleFromPrice, setGazelleFromPrice] = useState(null);
  // Состояние для цен тарифов облачного хранения из API
  const [tariffPrices, setTariffPrices] = useState({});
  // Состояние для цен кастомного тарифа (CLOUD_PRICE_LOW и CLOUD_PRICE_HIGH)
  const [cloudCustomPrices, setCloudCustomPrices] = useState({ low: null, high: null });
  // Состояние для промокода (индивидуальное хранение)
  const [promoCode, setPromoCode] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState("");
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  // Состояние для промокода (облачное хранение)
  const [cloudPromoCode, setCloudPromoCode] = useState("");
  const [cloudPromoCodeInput, setCloudPromoCodeInput] = useState("");
  const [cloudPromoDiscount, setCloudPromoDiscount] = useState(0);
  const [cloudPromoDiscountPercent, setCloudPromoDiscountPercent] = useState(0);
  const [cloudPromoError, setCloudPromoError] = useState("");
  const [cloudPromoSuccess, setCloudPromoSuccess] = useState(false);
  const [isValidatingCloudPromo, setIsValidatingCloudPromo] = useState(false);

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
      
      // Находим и сохраняем цену депозита
      const depositService = pricesData.find((price) => price.type === "DEPOSIT");
      if (depositService) {
        setDepositPrice(Number(depositService.price) || 0);
      }
      
      const filteredPrices = pricesData.filter((price) => {
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
    // Если выбран тариф (не "Свои габариты"), используем объем из тарифа
    if (selectedTariff && !selectedTariff.isCustom) {
      const tariffVolume = selectedTariff.baseVolume ?? selectedTariff.maxVolume ?? cloudVolumeDirect;
      return Number.isFinite(tariffVolume) && tariffVolume > 0 ? tariffVolume : 0;
    }
    // Если выбрано "Свои габариты", рассчитываем из габаритов
    const { width, height, length } = cloudDimensions;
    const volume = Number(width) * Number(height) * Number(length);
    return Number.isFinite(volume) && volume > 0 ? volume : 0;
  }, [cloudDimensions, cloudVolumeDirect, selectedTariff]);

  const cloudStorage = cloudWarehouse?.storage?.[0] || null;

  const isCloudFormReady = useMemo(() => {
    if (!cloudStorage?.id) return false;
    if (!cloudMonthsNumber || cloudMonthsNumber <= 0) return false;
    if (!cloudVolume || cloudVolume <= 0) return false;
    if (!cloudPickupAddress.trim()) return false;
    // Требуется либо выбран тариф, либо выбрано "Свои габариты"
    if (!selectedTariff) return false;
    return true;
  }, [cloudStorage, cloudMonthsNumber, cloudPickupAddress, cloudVolume, selectedTariff]);

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
    // combinedTotal включает аренду + услуги + депозит
    const combinedTotal = (baseTotal || 0) + serviceTotal + depositPrice;

    return {
      baseMonthly,
      baseTotal,
      serviceTotal,
      depositPrice,
      combinedTotal,
    };
  }, [pricePreview, serviceSummary.total, depositPrice]);

  // Расчет итоговой суммы с учетом промокода (индивидуальное хранение)
  const finalIndividualTotal = useMemo(() => {
    const total = costSummary.combinedTotal || 0;
    return Math.max(0, total - promoDiscount);
  }, [costSummary.combinedTotal, promoDiscount]);

  // Расчет итоговой суммы с учетом промокода (облачное хранение)
  const finalCloudTotal = useMemo(() => {
    const total = (cloudPricePreview?.total || 0) + depositPrice;
    return Math.max(0, total - cloudPromoDiscount);
  }, [cloudPricePreview, cloudPromoDiscount, depositPrice]);

  // Функция применения промокода для индивидуального хранения
  const handleApplyPromoCode = useCallback(async () => {
    if (!promoCodeInput.trim()) {
      setPromoError("Введите промокод");
      return;
    }

    const totalAmount = costSummary.combinedTotal || 0;
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
        toast.success(`Промокод применен! Скидка ${result.discount_percent}%`);
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
  }, [promoCodeInput, costSummary.combinedTotal]);

  // Функция удаления промокода для индивидуального хранения
  const handleRemovePromoCode = useCallback(() => {
    setPromoCode("");
    setPromoCodeInput("");
    setPromoDiscount(0);
    setPromoDiscountPercent(0);
    setPromoError("");
    setPromoSuccess(false);
  }, []);

  // Функция применения промокода для облачного хранения
  const handleApplyCloudPromoCode = useCallback(async () => {
    if (!cloudPromoCodeInput.trim()) {
      setCloudPromoError("Введите промокод");
      return;
    }

    // Включаем депозит в общую сумму для валидации промокода
    const totalAmount = (cloudPricePreview?.total || 0) + depositPrice;
    if (totalAmount <= 0) {
      setCloudPromoError("Сначала выберите тариф и срок аренды");
      return;
    }

    try {
      setIsValidatingCloudPromo(true);
      setCloudPromoError("");
      setCloudPromoSuccess(false);

      const result = await promoApi.validate(cloudPromoCodeInput.trim(), totalAmount);

      if (result.valid) {
        setCloudPromoCode(cloudPromoCodeInput.trim());
        setCloudPromoDiscount(result.discount_amount);
        setCloudPromoDiscountPercent(result.discount_percent);
        setCloudPromoSuccess(true);
        setCloudPromoError("");
        toast.success(`Промокод применен! Скидка ${result.discount_percent}%`);
      } else {
        setCloudPromoError(result.error || "Недействительный промокод");
        setCloudPromoCode("");
        setCloudPromoDiscount(0);
        setCloudPromoDiscountPercent(0);
        setCloudPromoSuccess(false);
      }
    } catch (error) {
      console.error("Ошибка при проверке промокода:", error);
      setCloudPromoError("Ошибка при проверке промокода");
      setCloudPromoCode("");
      setCloudPromoDiscount(0);
      setCloudPromoDiscountPercent(0);
      setCloudPromoSuccess(false);
    } finally {
      setIsValidatingCloudPromo(false);
    }
  }, [cloudPromoCodeInput, cloudPricePreview, depositPrice]);

  // Функция удаления промокода для облачного хранения
  const handleRemoveCloudPromoCode = useCallback(() => {
    setCloudPromoCode("");
    setCloudPromoCodeInput("");
    setCloudPromoDiscount(0);
    setCloudPromoDiscountPercent(0);
    setCloudPromoError("");
    setCloudPromoSuccess(false);
  }, []);

  // Пересчитываем скидку при изменении общей суммы (индивидуальное хранение)
  useEffect(() => {
    if (promoCode && promoDiscountPercent > 0) {
      const totalAmount = costSummary.combinedTotal || 0;
      const newDiscount = Math.round((totalAmount * promoDiscountPercent / 100) * 100) / 100;
      setPromoDiscount(newDiscount);
    }
  }, [costSummary.combinedTotal, promoCode, promoDiscountPercent]);

  // Пересчитываем скидку при изменении общей суммы (облачное хранение)
  useEffect(() => {
    if (cloudPromoCode && cloudPromoDiscountPercent > 0) {
      const totalAmount = cloudPricePreview?.total || 0;
      const newDiscount = Math.round((totalAmount * cloudPromoDiscountPercent / 100) * 100) / 100;
      setCloudPromoDiscount(newDiscount);
    }
  }, [cloudPricePreview, cloudPromoCode, cloudPromoDiscountPercent]);

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

  // Карточка "Свои габариты" - статичная
  // Цена для кастомного тарифа загружается из API (CLOUD_PRICE_LOW/CLOUD_PRICE_HIGH)
  const customTariff = useMemo(() => ({
    id: 'custom',
    name: 'Свои габариты',
    image: null,
    isCustom: true
  }), []);

  // Остальные тарифы - подвижные в карусели
  // pricePerM3 получается из API, метаданные (basePrice, baseVolume, maxVolume) захардкожены
  const regularTariffs = useMemo(() => {
    const tariffs = [
      {
        id: 'sumka',
        name: 'Хранения сумки / коробки вещей',
        image: sumkaImg,
        pricePerM3: tariffPrices['CLOUD_TARIFF_SUMKA'] || 6000,
        maxVolume: 0.25,
        baseVolume: 0.25,
        basePrice: null,
      },
      {
        id: 'shina',
        name: 'Шины',
        image: shinaImg,
        pricePerM3: tariffPrices['CLOUD_TARIFF_SHINA'] || 5000,
        maxVolume: 0.5,
        baseVolume: 0.5,
        basePrice: null,
      },
      {
        id: 'motorcycle',
        name: 'Хранение мотоцикла',
        image: motorcycleImg,
        pricePerM3: tariffPrices['CLOUD_TARIFF_MOTORCYCLE'] || 25000,
        maxVolume: 1.8,
        baseVolume: 1.8,
        basePrice: null,
      },
      {
        id: 'bicycle',
        name: 'Хранение велосипед',
        image: bicycleImg,
        pricePerM3: tariffPrices['CLOUD_TARIFF_BICYCLE'] || 6000,
        maxVolume: 0.9,
        baseVolume: 0.9,
        basePrice: null,
      },
      {
        id: 'sunuk',
        name: 'Сундук до 1 м³',
        image: sunukImg,
        basePrice: 15000,
        pricePerM3: tariffPrices['CLOUD_TARIFF_SUNUK'] || 15000,
        maxVolume: 1,
        baseVolume: 1
      },
      {
        id: 'furniture',
        name: 'Шкаф до 2 м³',
        image: furnitureImg,
        basePrice: 27000,
        pricePerM3: tariffPrices['CLOUD_TARIFF_FURNITURE'] || 13500,
        baseVolume: 2,
        maxVolume: 2,
      },
      {
        id: 'sklad',
        name: 'Кладовка до 3 м³',
        image: skladImg,
        basePrice: 38000,
        pricePerM3: tariffPrices['CLOUD_TARIFF_SKLAD'] || 12667,
        maxVolume: 3,
        baseVolume: 3,
      },
      {
        id: 'garazh',
        name: 'Гараж до 9м³',
        image: garazhImg,
        basePrice: 90000,
        pricePerM3: tariffPrices['CLOUD_TARIFF_GARAZH'] || 10000,
        maxVolume: 9,
        baseVolume: 9
      }
    ];
    return tariffs;
  }, [tariffPrices]);

  // Обработка изменения размера экрана для карусели тарифов (только для обычных тарифов)
  useEffect(() => {
    const handleResize = () => {
      const newTariffsPerView = window.innerWidth < 768 ? 1 : 3; // 3 вместо 4, так как custom статичный
      setTariffsPerView(newTariffsPerView);
      const newMaxIndex = Math.max(0, regularTariffs.length - newTariffsPerView);
      setCurrentTariffIndex((prev) => Math.min(prev, newMaxIndex));
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [regularTariffs.length]);

  const maxTariffIndex = Math.max(0, regularTariffs.length - tariffsPerView);

  const handleTariffPrev = () => {
    setCurrentTariffIndex((prev) => Math.max(0, prev - 1));
  };

  const handleTariffNext = () => {
    setCurrentTariffIndex((prev) => Math.min(maxTariffIndex, prev + 1));
  };

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

      // Добавляем промокод, если он применен
      if (promoCode) {
        orderData.promo_code = promoCode;
      }

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

      // Проверяем, не верифицирован ли телефон
      const isPhoneNotVerified = error.response?.status === 400 && (
          message.includes('Phone number must be verified') ||
          message.includes('phone number') ||
          errorData?.code === 'PHONE_NOT_VERIFIED'
      );
      
      if (isPhoneNotVerified) {
        toast.error(
          <div>
            <div><strong>Телефон не верифицирован</strong></div>
            <div style={{ marginTop: 5 }}>
              Пожалуйста, верифицируйте номер телефона в профиле перед созданием заказа.
            </div>
          </div>,
          {
            autoClose: 5000,
          }
        );
        setTimeout(() => {
          navigate("/personal-account", { state: { activeSection: "personal" } });
        }, 2000);
        setIsSubmittingOrder(false);
        return;
      }

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
    promoCode,
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

    if (!selectedTariff) {
      setSubmitError("Выберите тариф или режим 'Свои габариты' для бронирования.");
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

      // Определяем название для заказа
      const orderItemName = selectedTariff.isCustom 
        ? "Свои габариты" 
        : selectedTariff.name;

      // Маппинг id тарифа на тип тарифа для бэкенда
      const tariffTypeMap = {
        'sumka': 'CLOUD_TARIFF_SUMKA',
        'shina': 'CLOUD_TARIFF_SHINA',
        'motorcycle': 'CLOUD_TARIFF_MOTORCYCLE',
        'bicycle': 'CLOUD_TARIFF_BICYCLE',
        'sunuk': 'CLOUD_TARIFF_SUNUK',
        'furniture': 'CLOUD_TARIFF_FURNITURE',
        'sklad': 'CLOUD_TARIFF_SKLAD',
        'garazh': 'CLOUD_TARIFF_GARAZH'
      };

      // Определяем тип тарифа для отправки на бэкенд
      const tariff_type = selectedTariff.isCustom 
        ? null 
        : tariffTypeMap[selectedTariff.id] || null;

      const orderItems = [
        {
          name: orderItemName,
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
        moving_orders: buildMovingOrders(trimmedAddress, cloudMonthsNumber, cloudBookingStartDate),
        tariff_type: tariff_type, // Добавляем тип тарифа
      };

      // Добавляем промокод, если он применен
      if (cloudPromoCode) {
        orderData.promo_code = cloudPromoCode;
      }

      console.error("availableOptions: ", availableOptions);

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
    cloudBookingStartDate,
    cloudMonthsNumber,
    cloudPickupAddress,
    cloudStorage,
    cloudVolume,
    isAuthenticated,
    isSubmittingOrder,
    isUserRole,
    navigate,
    selectedTariff,
    serviceOptions,
    gazelleService,
    ensureServiceOptions,
    warehouseApi,
    toast,
    cloudPromoCode,
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
    setActiveStorageTab("INDIVIDUAL");
    setTimeout(() => {
      if (tabsSectionRef.current) {
        tabsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }, []);

  const handleCallbackRequestClick = useCallback(() => {
    openCallbackModal('callback');
  }, [openCallbackModal]);

  useEffect(() => {
    if (activeStorageTab !== "CLOUD") {
      setCloudPickupAddress("");
      return;
    }
    // Устанавливаем "Свои габариты" по умолчанию при переключении на облачное хранение
    if (!selectedTariff) {
      setSelectedTariff(customTariff);
      setCloudDimensions({ width: 1, height: 1, length: 1 });
    }
  }, [activeStorageTab, selectedTariff, customTariff]);

  useEffect(() => {
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
      setCloudPriceError("Укажите габариты вещей для расчёта объёма.");
      return;
    }

    // Если выбран тариф (не "Свои габариты"), требуется selectedTariff
    if (selectedTariff && !selectedTariff.isCustom) {
      // Расчет по тарифу - статичная цена (не умножается на объем)
      setIsCloudPriceCalculating(true);
      setCloudPriceError(null);

      // Для тарифов с basePrice используем basePrice, для остальных - pricePerM3 из API
      // Оба значения уже содержат финальную статичную цену тарифа
      const monthlyPrice = selectedTariff.basePrice || selectedTariff.pricePerM3 || 0;
      const totalPrice = Math.round(monthlyPrice * cloudMonthsNumber);

      setCloudPricePreview({
        total: totalPrice,
        monthly: monthlyPrice,
        isFallback: false,
      });

      setIsCloudPriceCalculating(false);
    } else if (selectedTariff?.isCustom) {
      // Расчет для "Свои габариты" - используем CLOUD_PRICE_LOW или CLOUD_PRICE_HIGH в зависимости от объема
      setIsCloudPriceCalculating(true);
      setCloudPriceError(null);

      // Если объем <= 18 м³, используем CLOUD_PRICE_LOW, иначе CLOUD_PRICE_HIGH
      const pricePerM3 = cloudVolume <= 18 
        ? (cloudCustomPrices.low || 9500) // Fallback на дефолтное значение
        : (cloudCustomPrices.high || 9000); // Fallback на дефолтное значение
      
      const monthlyPrice = Math.round(pricePerM3 * cloudVolume);
      const totalPrice = Math.round(monthlyPrice * cloudMonthsNumber);

      setCloudPricePreview({
        total: totalPrice,
        monthly: monthlyPrice,
        isFallback: false,
      });

      setIsCloudPriceCalculating(false);
    } else {
      // Если тариф не выбран, не показываем цену
      setCloudPricePreview(null);
      setCloudPriceError(null);
    }
  }, [activeStorageTab, cloudMonthsNumber, selectedTariff, cloudVolume, cloudCustomPrices]);

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

  // Загрузка цен тарифов облачного хранения из API
  // Метаданные (basePrice, baseVolume, maxVolume) остаются захардкоженными на фронтенде
  useEffect(() => {
    const loadTariffPrices = async () => {
      try {
        const pricesData = await paymentsApi.getPrices();
        const tariffTypes = [
          'CLOUD_TARIFF_SUMKA',
          'CLOUD_TARIFF_SHINA',
          'CLOUD_TARIFF_MOTORCYCLE',
          'CLOUD_TARIFF_BICYCLE',
          'CLOUD_TARIFF_SUNUK',
          'CLOUD_TARIFF_FURNITURE',
          'CLOUD_TARIFF_SKLAD',
          'CLOUD_TARIFF_GARAZH'
        ];
        
        const pricesMap = {};
        let cloudPriceLow = null;
        let cloudPriceHigh = null;
        
        pricesData.forEach(price => {
          if (tariffTypes.includes(price.type)) {
            pricesMap[price.type] = parseFloat(price.price);
          }
          // Загружаем цены для кастомного тарифа
          if (price.type === 'CLOUD_PRICE_LOW') {
            cloudPriceLow = parseFloat(price.price);
          }
          if (price.type === 'CLOUD_PRICE_HIGH') {
            cloudPriceHigh = parseFloat(price.price);
          }
        });
        
        setTariffPrices(pricesMap);
        setCloudCustomPrices({ low: cloudPriceLow, high: cloudPriceHigh });
        
        if (import.meta.env.DEV) {
          console.log('Цены тарифов облачного хранения загружены:', pricesMap);
          console.log('Цены кастомного тарифа загружены:', { low: cloudPriceLow, high: cloudPriceHigh });
        }
      } catch (error) {
        console.error('Ошибка при загрузке цен тарифов облачного хранения:', error);
        // Используем дефолтные значения при ошибке
        setTariffPrices({});
        setCloudCustomPrices({ low: null, high: null });
      }
    };

    loadTariffPrices();
  }, []);

  // Удаляем загрузку GAZELLE_TO, так как теперь используется только GAZELLE_FROM по умолчанию
  // GAZELLE_TO можно выбрать вручную в дополнительных услугах

  useEffect(() => {
    if (selectedWarehouse?.name === "Жилой комплекс «Комфорт Сити»") {
      setPreviewStorage(null);
    }
  }, [komfortSelectedMap, megaSelectedMap, selectedWarehouse]);

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

  // Получение информации о бронировании из поля occupancy
  useEffect(() => {
    if (!previewStorage) {
      setBookingInfo(null);
      setIsLoadingBookingInfo(false);
      return;
    }

    // Проверяем, является ли бокс занятым
    const isOccupied = previewStorage.status === 'OCCUPIED' || previewStorage.status === 'PENDING';
    
    if (isOccupied && previewStorage.occupancy && Array.isArray(previewStorage.occupancy) && previewStorage.occupancy.length > 0) {
      // Находим активное бронирование
      const activeBooking = previewStorage.occupancy.find(
        (booking) => booking.status === 'ACTIVE'
      ) || previewStorage.occupancy[0]; // Если нет ACTIVE, берем первое
      
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
  }, [previewStorage]);

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

    const showInlineCanvas = isFullscreen || !isMobileView;

    return (
      <div className={`flex flex-col gap-4 ${isFullscreen ? "h-full w-full" : ""}`} style={isFullscreen ? { width: '100%', height: '100%', minHeight: 0, minWidth: 0 } : {}}>
        {showInlineCanvas ? (
          <div className="w-full h-full" style={{ width: '100%', height: '100%', minHeight: 0, minWidth: 0, overflow: 'hidden' }}>
            <WarehouseSVGMap
              ref={isFullscreen ? mapRef : null}
              warehouse={selectedWarehouse}
              storageBoxes={storageBoxes}
              onBoxSelect={setPreviewStorage}
              selectedStorage={previewStorage}
              selectedMap={
                selectedWarehouse?.name?.toLowerCase().includes('mega') 
                  ? megaSelectedMap 
                  : komfortSelectedMap
              }
              onMapChange={(mapNumber) => {
                if (selectedWarehouse?.name?.toLowerCase().includes('mega')) {
                  setMegaSelectedMap(mapNumber);
                } else {
                  setKomfortSelectedMap(mapNumber);
                }
              }}
            />
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

      <div className="flex-1 relative overflow-hidden bg-gradient-to-r from-[#E0F2FE] to-white -mt-16 pt-16">
        {/* Декоративные элементы на фоне - начинаются от самого верха страницы */}
        <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
          {/* Большой круг слева */}
          <div className="absolute top-20 -left-20 w-96 h-96 bg-[#00A991] opacity-10 rounded-full blur-3xl"></div>
          {/* Средний круг справа */}
          <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#00A991] opacity-10 rounded-full blur-3xl"></div>
          {/* Маленький круг в центре */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#00A991] opacity-10 rounded-full blur-2xl"></div>
          {/* Дополнительные декоративные круги */}
          <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-[#00A991] opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute top-1/3 left-1/2 w-56 h-56 bg-[#00A991] opacity-10 rounded-full blur-2xl"></div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Левая часть - текст */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-[#31876D] via-[#363636] to-[#999999] bg-clip-text text-transparent">
                Храните там,
                </span>
                <br />
                
                <span className="bg-gradient-to-r from-[#31876D] via-[#363636] to-[#999999] bg-clip-text text-transparent">
                где удобно
                </span>
              </h1>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
              Склады от 1 до 100 м² с безопасным хранением и доступом 24/7
              </p>
            </div>

            {/* Правая часть - карусель с блоками */}
            <div className="relative">
              {/* Карусель */}
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentCardIndex * 100}%)` }}
                >
                  {/* Блок 1: Облачное хранение */}
                  <div className="min-w-full px-2">
                    <div className="bg-[#00A991] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                      <div className="bg-[#00A991] px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 flex justify-center">
                        <img
                          src={oblachImg}
                          alt="Облачное хранение"
                          className="w-11/12 h-64 sm:h-72 md:h-80 object-cover rounded-2xl"
                        />
                      </div>
                      <div className="p-6 sm:p-8 text-white flex-1 flex flex-col">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                        Облачное хранение
                        </h3>
                        <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
                        Хранение вещей без вашего приезда на склад <br />
Мы забираем ваши вещи, аккуратно упаковываем их в фирменные коробки, размещаем на складе и возвращаем по запросу. 
Все операции: размещение, возврат и управление вещами, выполняются онлайн.

                        </p>
                        <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-sm sm:text-base md:text-lg">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>экономия времени — все процессы организованы без вашего участия;</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>не нужно покупать коробки и упаковочные материалы;</span>
                            
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>аккуратная логистика и бережная работа с вещами;</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>сервис подходит как для личных вещей, так и для бизнеса;
                            </span>
                          </li>
                        </ul>
                        <button
                          onClick={() => {
                            setActiveStorageTab("CLOUD");
                            setTimeout(() => {
                              if (tabsSectionRef.current) {
                                tabsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
                              }
                            }, 100);
                          }}
                          className="w-full bg-white text-[#00A991] font-semibold py-3 md:py-4 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-base md:text-lg mt-auto"
                        >
                          Подробнее
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Блок 2: Индивидуальное хранение */}
                  <div className="min-w-full px-2">
                    <div className="bg-[#00A991] rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
                      <div className="bg-[#00A991] px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 flex justify-center">
                        <img
                          src={ininvImg}
                          alt="Индивидуальное хранение"
                          className="w-11/12 h-64 sm:h-72 md:h-80 object-cover rounded-2xl"
                        />
                      </div>
                      <div className="p-6 sm:p-8 text-white flex-1 flex flex-col">
                        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
                        Индивидуальное хранение
                        </h3>
                        <p className="text-sm sm:text-base md:text-lg mb-4 md:mb-6 leading-relaxed">
                        Надёжное и удобное хранение в личном складе <br />
Персональный закрытый склад для самостоятельного хранения ваших вещей. Вы полностью контролируете доступ, размещение и использование пространства. При необходимости вы можете как самостоятельно привозить и забирать вещи, так и доверить эти процессы нашей команде.

                        </p>
                        <ul className="space-y-2 md:space-y-3 mb-6 md:mb-8 text-sm sm:text-base md:text-lg">
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>круглосуточный доступ к боксу без согласований;</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>индивидуальный доступ — только для вас;</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>возможность установки и использования стеллажей;</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>постоянная физическая охрана объекта;</span>
                          </li>
                          <li className="flex items-start">
                            <span className="mr-2">•</span>
                            <span>условия, обеспечивающие безопасное хранение имущества;</span>
                          </li>
                        </ul>
                        <button
                          onClick={handleHeroBookingClick}
                          className="w-full bg-white text-[#00A991] font-semibold py-3 md:py-4 px-6 rounded-lg hover:bg-gray-50 transition-colors duration-300 text-base md:text-lg mt-auto"
                        >
                          Подробнее
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Стрелки навигации */}
              <div className="flex justify-center items-center gap-4 mt-6">
                <button
                  onClick={() => setCurrentCardIndex((prev) => (prev === 0 ? 1 : 0))}
                  className="w-12 h-12 rounded-full border-2 border-[#00A991] text-[#00A991] flex items-center justify-center hover:bg-[#00A991] hover:text-white transition-all duration-300"
                  aria-label="Предыдущий блок"
                >
                  <ChevronLeft size={24} />
                </button>
                <button
                  onClick={() => setCurrentCardIndex((prev) => (prev === 1 ? 0 : 1))}
                  className="w-12 h-12 rounded-full border-2 border-[#00A991] text-[#00A991] flex items-center justify-center hover:bg-[#00A991] hover:text-white transition-all duration-300"
                  aria-label="Следующий блок"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Анимированная бегущая строка с преимуществами */}
      <section className="w-full bg-gradient-to-r from-[#E0F2FE] to-white pb-6 overflow-hidden relative">
        <div className="flex animate-scroll">
          {/* Первый набор элементов */}
          <div className="flex items-center gap-24 sm:gap-32 whitespace-nowrap flex-shrink-0">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ к видеонаблюдению</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Бронирование онлайн</span>
            </div>
          </div>
          {/* Дублируем для бесконечной прокрутки */}
          <div className="flex items-center gap-24 sm:gap-32 whitespace-nowrap flex-shrink-0 ml-24 sm:ml-32">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ к видеонаблюдению</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Бронирование онлайн</span>
            </div>
          </div>
          {/* Третий набор для более плавного перехода */}
          <div className="flex items-center gap-24 sm:gap-32 whitespace-nowrap flex-shrink-0 ml-24 sm:ml-32">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ к видеонаблюдению</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Бронирование онлайн</span>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-33.333% - 0px));
            }
          }
          .animate-scroll {
            animation: scroll 50s linear infinite;
            will-change: transform;
          }
          @media (max-width: 640px) {
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
          }
        `}</style>
      </section>

      {/* Отступ с фоном хэдера */}
      <div className="w-full bg-gradient-to-r from-[#E0F2FE]/95 to-white/95 h-4 sm:h-8"></div>

      {/* Второй фрейм: преимущества */}
      <section ref={tabsSectionRef} className="w-full bg-gradient-to-r from-[#E0F2FE] to-white py-6 sm:py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Заголовок */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#273655] mb-6">
          Удобное хранение 
          </h1>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#273655] mb-6">вещей в городе</h1>
          
          {/* Отдельные кнопки табов */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveStorageTab("INDIVIDUAL")}
              className={`px-6 py-3 rounded-xl text-base font-semibold transition-all ${
                activeStorageTab === "INDIVIDUAL"
                  ? "bg-[#00A991] text-white"
                  : "bg-gray-100/50 text-gray-600"
              }`}
            >
              Индивидуальное хранение
            </button>
            <button
              onClick={() => setActiveStorageTab("CLOUD")}
              className={`px-6 py-3 rounded-xl text-base font-semibold transition-all ${
                activeStorageTab === "CLOUD"
                  ? "bg-[#00A991] text-white"
                  : "bg-gray-100/50 text-gray-600"
              }`}
            >
              Облачное хранение
            </button>
          </div>
          
          <Tabs value={activeStorageTab} onValueChange={setActiveStorageTab} className="w-full">

            <TabsContent value="INDIVIDUAL" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-[50%_1fr] gap-6">
                {/* Левая панель - Карта склада */}
                <div className="rounded-2xl h-[70vh] min-h-[400px] flex flex-col" style={{ 
                  background: 'linear-gradient(to bottom, #00A991 0%, #31876D 100%)',
                  padding: '20px',
                  borderRadius: '20px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 8px rgba(0, 0, 0, 0.06)',
                  position: 'relative',
                  minHeight: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}>
                  {/* Селектор локации и кнопки зума - внутри градиентного контейнера */}
                  <div className="mb-4 flex items-center gap-3 flex-wrap justify-center" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
                    <div className="w-fit [&_button]:bg-transparent [&_button]:text-white [&_button]:border-2 [&_button]:border-white [&_button]:rounded-full [&_button]:hover:bg-white/10 [&_svg]:text-white">
                      <Dropdown
                        items={dropdownItems}
                        value={selectedWarehouse ? (selectedWarehouse.id ?? selectedWarehouse.value) : undefined}
                        onChange={(_, item) => setSelectedWarehouse(item)}
                        placeholder="Выберите склад"
                        searchable={false}
                        getKey={(w) => w.id}
                        getLabel={(w) => w.name}
                        getDescription={(w) => w.address}
                        className="bg-transparent text-white border-2 border-white rounded-full hover:bg-white/10 w-auto min-w-[200px]"
                        popoverProps={{ className: "p-0" }}
                      />
                    </div>
                    
                    {/* Кнопки управления зумом - по центру */}
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.zoomIn();
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-[#A8E6CF] text-gray-600 flex items-center justify-center hover:bg-[#90D4B8] transition-colors shadow-md font-bold text-xl"
                        aria-label="Увеличить"
                      >
                        +
                      </button>
                      <button
                        onClick={() => {
                          if (mapRef.current) {
                            mapRef.current.zoomOut();
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-[#A8E6CF] text-gray-600 flex items-center justify-center hover:bg-[#90D4B8] transition-colors shadow-md font-bold text-xl"
                        aria-label="Уменьшить"
                      >
                        −
                      </button>
                    </div>
                  </div>
                  
                  {/* Компонент карты */}
                  <div className="flex-1 w-full h-full" style={{ minHeight: 0, minWidth: 0, position: 'relative', zIndex: 0 }}>
                    <div style={{ width: '100%', height: '100%', overflow: 'hidden', position: 'relative' }}>
                      {renderWarehouseScheme({ isFullscreen: true })}
                    </div>
                  </div>
                </div>

                {/* Правая панель - Форма конфигурации */}
                <div className="bg-white rounded-3xl p-6 shadow-lg min-h-[400px] flex flex-col">
                  <h2 className="text-2xl font-bold text-[#273655] mb-6">
                    Настройте хранение
                  </h2>
                  
                  {/* Предупреждение для Яруса 2 Mega Tower Almaty */}
                  {selectedWarehouse?.name?.toLowerCase().includes('mega') && megaSelectedMap === 2 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#273655] leading-relaxed">
                            <span className="font-semibold">Внимание:</span> В Ярусе 2 вес не должен превышать 200 кг на квадратный метр
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Предупреждение для Яруса 2 ЖК Комфорт Сити */}
                  {selectedWarehouse?.name === "Жилой комплекс «Комфорт Сити»" && komfortSelectedMap === 2 && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <AlertTriangle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#273655] leading-relaxed">
                            <span className="font-semibold">Внимание:</span> В Ярусе 2 вес не должен превышать 200 кг на квадратный метр
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Срок аренды */}
                  <div className="mb-6">
                    <RentalPeriodSelect
                      value={individualMonths}
                      onChange={(value) => {
                        setIndividualMonths(value);
                        setSubmitError(null);
                      }}
                      label="Срок аренды (месяцы):"
                      variant="individual-home"
                    />
                  </div>
                  
                  {/* Перевозка вещей */}
                  <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-3xl">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-[#8A8A8A]">Перевозка вещей</span>
                      <Truck className="w-5 h-5 text-[#8A8A8A]" />
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
                      className="bg-gray-300 data-[state=checked]:bg-[#00A991]"
                    />
                  </div>

                  {/* Детали перевозки */}
                  {includeMoving && previewStorage && (
                    <div className="mb-6 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] rounded-3xl p-6 shadow-lg space-y-4">
                      <h3 className="text-xl font-bold text-white">Детали перевозки</h3>
                      <div className="space-y-3">
                        <div className="flex flex-col gap-1">
                          
                          <DatePicker
                            value={movingPickupDate}
                            onChange={(value) => {
                              setMovingPickupDate(value);
                              setSubmitError(null);
                            }}
                            minDate={new Date().toISOString().split('T')[0]}
                            allowFutureDates={true}
                            placeholder="Дата забора вещей"
                            className="[&>div]:bg-gradient-to-r [&>div]:from-[#26B3AB] [&>div]:to-[#104D4A] [&>div]:!border-white [&>div]:rounded-3xl [&_input]:text-white [&_input]:placeholder:text-white/70 [&_label]:text-white/90 [&_button]:text-white [&_button]:hover:text-white [&_button]:hover:bg-transparent [&_button]:hover:!-translate-y-1/2 [&_button]:hover:!top-1/2 [&_button]:transition-none [&_button]:cursor-pointer [&>div]:focus-within:ring-0 [&>div]:focus-within:border-white"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-s text-white/90">Адрес забора вещей</label>
                          <input
                            type="text"
                            value={movingAddressFrom}
                            onChange={(e) => {
                              setMovingAddressFrom(e.target.value);
                              setSubmitError(null);
                            }}
                            placeholder="Например: г. Алматы, Абая 25"
                            className="h-[42px] rounded-3xl border border-white bg-gradient-to-r from-[#26B3AB] to-[#104D4A] px-3 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Услуги упаковки */}
                  <div className="flex items-center justify-between mb-6 p-3 bg-gray-50 rounded-3xl">
                      <div className="flex items-center gap-2">
                      <span className="text-base font-medium text-[#8A8A8A]">Услуги упаковки</span>
                      <Package className="w-5 h-5 text-[#8A8A8A]" />
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
                      className="bg-gray-300 data-[state=checked]:bg-[#00A991]"
                    />
                  </div>

                  {/* Детали услуг упаковки */}
                  {includePacking && previewStorage && (
                    <div className="mb-6 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] rounded-3xl p-6 shadow-lg space-y-4">
                      <h3 className="text-xl font-bold text-white">Детали услуг упаковки</h3>
                      <div className="space-y-3">
                        {isServicesLoading ? (
                          <div className="flex items-center justify-center py-2">
                            <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                          </div>
                        ) : (
                          <>
                            {servicesError && (
                              <p className="text-xs text-red-200">
                                {servicesError}
                              </p>
                            )}

                            {services.length > 0 && (
                              <div className="space-y-2">
                                {services.map((service, index) => {
                                  const selectedOption = serviceOptions.find((option) => String(option.id) === service.service_id);
                                  const unitPrice = selectedOption?.price ?? PACKING_SERVICE_ESTIMATE;
                                  
                                  const availableOptions = serviceOptions.filter((option) => {
                                    if (option?.type === 'GAZELLE') return;
                                    if (option?.type === 'GAZELLE_FROM') return;
                                    if (option?.type === 'GAZELLE_TO') return;
                                    if (option?.type === 'INDIVIDUAL') return;
                                    const isAlreadySelected = services.some((s, i) =>
                                      i !== index && String(s.service_id) === String(option.id)
                                    );
                                    return !isAlreadySelected;
                                  });

                                  const isGazelleToService = selectedOption && selectedOption.type === "GAZELLE_TO";
                                  
                                  return (
                                    <div key={index} className="space-y-2">
                                      <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-white bg-white/10 px-3 py-2">
                                        <Select
                                          value={service.service_id}
                                          onValueChange={(value) => updateServiceRow(index, "service_id", value)}
                                        >
                                          <SelectTrigger className="h-10 min-w-[180px] rounded-3xl border-0 bg-white/10 text-sm text-white">
                                            <SelectValue placeholder="Услуга" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {availableOptions.length > 0 ? (
                                              availableOptions.map((option) => {
                                                const serviceName = getServiceTypeName(option.type);
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
                                          <span className="text-xs text-white/90">
                                            Кол-во
                                          </span>
                                          <input
                                            type="number"
                                            min="1"
                                            value={service.count}
                                            onChange={(e) => updateServiceRow(index, "count", e.target.value)}
                                            className="w-8 h-6 rounded-sm border border-white bg-transparent px-1 text-xs text-white text-center focus:outline-none focus:ring-2 focus:ring-white/50 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
                                          />
                                        </div>

                                        {service.service_id && (
                                          <span className="ml-auto text-xs text-white/90">
                                            {unitPrice.toLocaleString()} ₸/шт.
                                          </span>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() => removeServiceRow(index)}
                                          className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/50 text-white hover:bg-white/20 transition-colors"
                                          aria-label="Удалить услугу"
                                        >
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                      </div>
                                      
                                      {isGazelleToService && (
                                        <div className="pl-3 pr-11">
                                          <label className="block text-xs text-white/90 mb-1">
                                            Адрес доставки вещей
                                          </label>
                                          <input
                                            type="text"
                                            value={movingAddressTo}
                                            onChange={(e) => {
                                              setMovingAddressTo(e.target.value);
                                              setMovingOrders(prev => prev.map(order => 
                                                order.status === "PENDING_TO" 
                                                  ? { ...order, address: e.target.value }
                                                  : order
                                              ));
                                            }}
                                            placeholder="Например: г. Алматы, Абая 25"
                                            className="w-full h-[42px] rounded-3xl border border-white bg-gradient-to-r from-[#26B3AB] to-[#104D4A] px-3 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {services.length === 0 && !servicesError && (
                              <p className="text-xs text-white/90">
                                Добавьте услуги, чтобы мы подготовили упаковку под ваши вещи.
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                ensureServiceOptions();
                                addServiceRow();
                              }}
                              className="inline-flex items-center gap-1.5 rounded-3xl border border-dashed border-white px-3 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                              Добавить услугу
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Итог */}
                  <div className="mt-8">
                    <div className="border-2 border-dashed border-gray-300 rounded-3xl bg-white p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-[#585858] mb-2">Итог</h3>
                    {previewStorage ? (
                      <div className="space-y-2">
                        {/* Информация о бронировании для занятых боксов */}
                        {previewStorage && (previewStorage.status === 'OCCUPIED' || previewStorage.status === 'PENDING') && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-[#273655]">
                                ИТОГ
                              </div>
                              <div className="text-4xl font-black text-[#273655] tracking-tight">
                                {previewStorage.name}
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
                        {isPriceCalculating ? (
                          <div className="text-sm text-gray-600 flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-[#273655]"></div>
                            Расчет...
                          </div>
                        ) : (
                          <>
                            <div className="text-sm text-gray-600">
                              Стоимость хранения за месяц: <span className="font-semibold text-[#273655]">{costSummary.baseMonthly?.toLocaleString() ?? "—"} ₸</span>
                            </div>
                            
                            {/* Промокод */}
                            <div className="mt-4 mb-3">
                              <label className="block text-sm font-medium text-[#273655] mb-2">
                                Промокод
                              </label>
                              <div className="flex gap-2">
                                <div className="relative flex-1">
                                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                  <input
                                    type="text"
                                    value={promoCodeInput}
                                    onChange={(e) => {
                                      setPromoCodeInput(e.target.value.toUpperCase());
                                      setPromoError("");
                                    }}
                                    placeholder="Введите промокод"
                                    disabled={promoSuccess || isValidatingPromo}
                                    className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#273655] ${
                                      promoSuccess 
                                        ? "border-green-500 bg-green-50" 
                                        : promoError 
                                          ? "border-red-500 bg-red-50" 
                                          : "border-gray-300"
                                    } disabled:bg-gray-100`}
                                  />
                                  {promoSuccess && (
                                    <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                                  )}
                                </div>
                                {promoSuccess ? (
                                  <button
                                    type="button"
                                    onClick={handleRemovePromoCode}
                                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={handleApplyPromoCode}
                                    disabled={isValidatingPromo || !promoCodeInput.trim()}
                                    className="px-3 py-2 bg-[#31876D] text-white rounded-lg hover:bg-[#276b57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                  >
                                    {isValidatingPromo ? (
                                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                    ) : (
                                      <Check className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                              {promoError && (
                                <p className="text-xs text-red-600 mt-1">{promoError}</p>
                              )}
                              {promoSuccess && (
                                <p className="text-xs text-green-600 mt-1">
                                  Промокод <strong>{promoCode}</strong> применен! Скидка {promoDiscountPercent}%
                                </p>
                              )}
                            </div>

                            {/* Скидка по промокоду */}
                            {promoSuccess && promoDiscount > 0 && (
                              <div className="flex items-center justify-between text-sm text-green-600 mb-2">
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3" />
                                  Скидка ({promoDiscountPercent}%):
                                </span>
                                <span>-{promoDiscount.toLocaleString()} ₸</span>
                              </div>
                            )}

                            <div className="text-lg font-bold text-[#273655]">
                              Общая стоимость: {promoSuccess && promoDiscount > 0 && (
                                <span className="text-sm text-gray-400 line-through mr-1">
                                  {costSummary.combinedTotal?.toLocaleString() ?? "—"} ₸
                                </span>
                              )}
                              {finalIndividualTotal?.toLocaleString() ?? "—"} ₸
                            </div>
                            <div className="text-xs text-gray-500">
                              за {monthsNumber} {monthsNumber === 1 ? 'месяц' : monthsNumber < 5 ? 'месяца' : 'месяцев'}
                              {promoSuccess && ` (скидка ${promoDiscountPercent}%)`}
                            </div>
                          </>
                        )}
                      </div>
                    ) : (
                        <p className="text-sm text-gray-500">
                        Выберите бокс на схеме, чтобы увидеть предварительную цену.
                      </p>
                    )}
                    </div>
                  </div>
                  
                  {/* Кнопки действий */}
                  <div className="mt-6 space-y-3">
                    <button
                      onClick={handleIndividualBookingClick}
                      disabled={!isIndividualFormReady || isSubmittingOrder}
                      className="w-full bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white font-semibold py-4 px-6 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingOrder ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
                    </button>
                    <button
                      onClick={handleCallbackRequestClick}
                      className="w-full bg-white border border-gray-300 text-[#273655] font-semibold py-4 px-6 rounded-3xl hover:bg-gray-50 transition-colors"
                    >
                      Заказать обратный звонок
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="CLOUD" className="mt-8">
              {/* Секция Тарифы */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl md:text-3xl font-bold text-[#273655]">
                    Тарифы:
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleTariffPrev}
                      disabled={currentTariffIndex === 0}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                        currentTariffIndex === 0
                          ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-transparent'
                          : 'border-[#31876D] text-[#31876D] hover:bg-[#31876D]/10 cursor-pointer bg-transparent'
                      }`}
                      aria-label="Предыдущий"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <button
                      onClick={handleTariffNext}
                      disabled={currentTariffIndex >= maxTariffIndex}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                        currentTariffIndex >= maxTariffIndex
                          ? 'border-gray-300 text-gray-400 cursor-not-allowed bg-transparent'
                          : 'border-[#31876D] text-[#31876D] hover:bg-[#31876D]/10 cursor-pointer bg-transparent'
                      }`}
                      aria-label="Следующий"
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Тарифы: статичная карточка "Свои габариты" + карусель остальных */}
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Статичная карточка "Свои габариты" */}
                  <div className="flex-shrink-0 px-2 w-full" style={{ width: tariffsPerView === 1 ? '100%' : 'calc(25% - 0.75rem)' }}>
                    <div
                      onClick={() => {
                        setSelectedTariff(customTariff);
                        // Если выбрано "Свои габариты", сбрасываем габариты на значения по умолчанию
                        setCloudDimensions({ width: 1, height: 1, length: 1 });
                      }}
                      className={`rounded-3xl p-4 md:p-6 flex flex-col items-center cursor-pointer transition-colors h-full ${
                        selectedTariff?.id === customTariff.id 
                          ? 'bg-[#31876D] ring-4 ring-[#31876D]/30' 
                          : 'bg-[#04A68E] hover:bg-[#038a77]'
                      }`}
                    >
                      <div className="w-full h-32 md:h-40 mb-4 flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center">
                          <Box className="w-12 h-12 text-white" />
                        </div>
                      </div>
                      <p className="text-white text-center text-sm md:text-base font-medium leading-tight">
                        {customTariff.name}
                      </p>
                    </div>
                  </div>

                  {/* Карусель остальных тарифов */}
                  <div className="relative overflow-hidden w-full md:flex-1 md:w-auto">
                    <div
                      className="flex transition-transform duration-300 ease-in-out"
                      style={{
                        transform: tariffsPerView === 1 
                          ? `translateX(-${currentTariffIndex * 100}%)`
                          : `translateX(calc(-${currentTariffIndex * (100 / tariffsPerView)}% - ${currentTariffIndex * 16 / tariffsPerView}px))`,
                        gap: tariffsPerView === 1 ? '0' : '1rem'
                      }}
                    >
                      {regularTariffs.map((tariff) => (
                        <div
                          key={tariff.id}
                          className="flex-shrink-0 px-2"
                          style={{
                            width: tariffsPerView === 1 
                              ? '100%' 
                              : `calc(${100 / tariffsPerView}% - ${tariffsPerView > 1 ? (tariffsPerView - 1) * 16 / tariffsPerView : 0}px)`,
                            boxSizing: 'border-box'
                          }}
                        >
                          <div
                            onClick={() => {
                              setSelectedTariff(tariff);
                              // Если выбран тариф, устанавливаем объем из тарифа (baseVolume или maxVolume)
                              const tariffVolume = tariff.baseVolume ?? tariff.maxVolume ?? 1;
                              setCloudVolumeDirect(tariffVolume);
                            }}
                            className={`rounded-3xl p-4 md:p-6 flex flex-col items-center cursor-pointer transition-colors h-full ${
                              selectedTariff?.id === tariff.id 
                                ? 'bg-[#31876D] ring-4 ring-[#31876D]/30' 
                                : 'bg-[#04A68E] hover:bg-[#038a77]'
                            }`}
                          >
                            <div className="w-full h-32 md:h-40 mb-4 flex items-center justify-center">
                              <img
                                src={tariff.image}
                                alt={tariff.name}
                                className="max-w-full max-h-full object-contain"
                              />
                            </div>
                            <p className="text-white text-center text-sm md:text-base font-medium leading-tight">
                              {tariff.name}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 items-stretch">
                {/* Левая колонка - Габариты и расчет */}
                <div className="flex flex-col h-full justify-between order-1 lg:order-1">
                  <h2 className="text-2xl font-bold text-[#273655] mb-6">
                    {selectedTariff?.isCustom 
                      ? 'Укажите габариты вещей' 
                      : selectedTariff 
                        ? 'Информация о тарифе' 
                        : 'Выберите тариф или укажите габариты'}
                  </h2>
                  
                  {/* Поля для ввода */}
                  <div className="space-y-4 mb-4">
                    {selectedTariff?.isCustom ? (
                      /* Режим "Свои габариты" - показываем поля для габаритов */
                      <>
                        {/* Ширина и Высота в одной строке */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { key: 'width', label: 'Ширина', value: cloudDimensions.width },
                            { key: 'height', label: 'Высота', value: cloudDimensions.height }
                          ].map((dim) => (
                            <Select
                              key={dim.key}
                              value={String(dim.value)}
                              onValueChange={(value) => {
                                setCloudDimensions(prev => ({
                                  ...prev,
                                  [dim.key]: parseFloat(value)
                                }));
                                setSubmitError(null);
                              }}
                            >
                              <SelectTrigger className="w-full h-auto min-h-[60px] text-base border-0 rounded-2xl bg-white flex flex-col items-start justify-center p-3 relative [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-3 [&>svg]:h-4 [&>svg]:w-4">
                                <span className="text-sm text-[#273655] mb-1">{dim.label}:</span>
                                <SelectValue className="text-base">
                                  {String(dim.value)} м
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                                  <SelectItem key={val} value={String(val)}>
                                    {val} м
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ))}
                        </div>

                        {/* Длина отдельно ниже */}
                        <Select
                          value={String(cloudDimensions.length)}
                          onValueChange={(value) => {
                            setCloudDimensions(prev => ({
                              ...prev,
                              length: parseFloat(value)
                            }));
                            setSubmitError(null);
                          }}
                        >
                          <SelectTrigger className="w-full h-auto min-h-[60px] text-base border-0 rounded-2xl bg-white flex flex-col items-start justify-center p-3 relative [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-3 [&>svg]:h-4 [&>svg]:w-4">
                            <span className="text-sm text-[#273655] mb-1">Длина:</span>
                            <SelectValue className="text-base">
                              {String(cloudDimensions.length)} м
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                              <SelectItem key={val} value={String(val)}>
                                {val} м
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </>
                    ) : selectedTariff ? (
                      /* Режим тарифа - показываем информацию о фиксированном объеме */
                      <div className="bg-[#E0F2FE] rounded-2xl p-6 border-2 border-[#00A991]/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-[#273655]">Тариф:</span>
                          <span className="text-base font-semibold text-[#31876D]">{selectedTariff.name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-[#273655]">Фиксированный объем:</span>
                          <span className="text-lg font-bold text-[#31876D]">
                            {selectedTariff.baseVolume ?? selectedTariff.maxVolume ?? cloudVolumeDirect} м³
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6B6B] mt-3 italic">
                          Объем для данного тарифа фиксирован и не может быть изменен
                        </p>
                      </div>
                    ) : (
                      /* Тариф не выбран - показываем подсказку */
                      <p className="text-sm text-[#6B6B6B]">
                        Выберите тариф или режим "Свои габариты" для начала расчета
                      </p>
                    )}
                  </div>

                  {/* Блок ИТОГ */}
                  <div className="bg-white rounded-3xl px-8 pt-6 pb-8 mb-6 border-2 border-dashed border-gray-300 min-h-[250px] order-2 lg:order-2">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-2xl font-bold text-[#31876D]">ИТОГ</h3>
                      <span className="text-2xl font-bold text-[#31876D]">{cloudVolume.toFixed(2)} м³</span>
                    </div>
                    <div className="text-base text-[#273655]">
                      {selectedTariff?.isCustom ? (
                        <div className="flex justify-between mb-3">
                          <span>Габариты:</span>
                          <span className="font-medium">{cloudDimensions.width} × {cloudDimensions.height} × {cloudDimensions.length} м</span>
                        </div>
                      ) : selectedTariff ? (
                        <div className="flex justify-between mb-3">
                          <span>Тариф:</span>
                          <span className="font-medium">{selectedTariff.name}</span>
                        </div>
                      ) : null}
                      <div className="flex justify-between mt-6 mb-3">
                        <span className="text-[#00A991]">За месяц</span>
                        <span className="font-medium text-[#00A991]">{cloudPricePreview?.monthly?.toLocaleString() ?? "—"} ₸</span>
                      </div>

                      {/* Промокод для облачного хранения */}
                      <div className="mt-4 mb-4 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-[#273655] mb-2">
                          Промокод
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                              type="text"
                              value={cloudPromoCodeInput}
                              onChange={(e) => {
                                setCloudPromoCodeInput(e.target.value.toUpperCase());
                                setCloudPromoError("");
                              }}
                              placeholder="Введите промокод"
                              disabled={cloudPromoSuccess || isValidatingCloudPromo}
                              className={`w-full pl-9 pr-3 py-2 text-sm border rounded-lg focus:outline-none focus:border-[#273655] ${
                                cloudPromoSuccess 
                                  ? "border-green-500 bg-green-50" 
                                  : cloudPromoError 
                                    ? "border-red-500 bg-red-50" 
                                    : "border-gray-300"
                              } disabled:bg-gray-100`}
                            />
                            {cloudPromoSuccess && (
                              <Check className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-500" />
                            )}
                          </div>
                          {cloudPromoSuccess ? (
                            <button
                              type="button"
                              onClick={handleRemoveCloudPromoCode}
                              className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleApplyCloudPromoCode}
                              disabled={isValidatingCloudPromo || !cloudPromoCodeInput.trim()}
                              className="px-3 py-2 bg-[#31876D] text-white rounded-lg hover:bg-[#276b57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                            >
                              {isValidatingCloudPromo ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                              ) : (
                                <Check className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                        {cloudPromoError && (
                          <p className="text-xs text-red-600 mt-1">{cloudPromoError}</p>
                        )}
                        {cloudPromoSuccess && (
                          <p className="text-xs text-green-600 mt-1">
                            Промокод <strong>{cloudPromoCode}</strong> применен! Скидка {cloudPromoDiscountPercent}%
                          </p>
                        )}
                      </div>

                      {/* Скидка по промокоду */}
                      {cloudPromoSuccess && cloudPromoDiscount > 0 && (
                        <div className="flex items-center justify-between text-sm text-green-600 mb-3">
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            Скидка ({cloudPromoDiscountPercent}%):
                          </span>
                          <span>-{cloudPromoDiscount.toLocaleString()} ₸</span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-xl font-bold text-[#31876D]">За {cloudMonthsNumber} {cloudMonthsNumber === 1 ? 'месяц' : cloudMonthsNumber < 5 ? 'месяца' : 'месяцев'}</span>
                        <span className="text-xl font-bold text-[#31876D]">
                          {cloudPromoSuccess && cloudPromoDiscount > 0 && (
                            <span className="text-sm text-gray-400 line-through mr-2">
                              {cloudPricePreview?.total?.toLocaleString() ?? "—"} ₸
                            </span>
                          )}
                          {finalCloudTotal?.toLocaleString() ?? "—"} ₸
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Дата начала бронирования - для мобильной версии */}
                  <div className="mb-6 order-3 lg:hidden">
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
                  </div>

                  {/* Срок аренды - для мобильной версии */}
                  <div className="mb-6 order-4 lg:hidden">
                    <RentalPeriodSelect
                      value={cloudMonths}
                      onChange={(value) => {
                        setCloudMonths(value);
                        setSubmitError(null);
                      }}
                      label="Срок аренды:"
                      variant="cloud-home"
                      showLabelInside={true}
                    />
                  </div>

                  {/* Адрес откуда забрать вещи - для мобильной версии */}
                  <div className="mb-6 order-5 lg:hidden">
                    <label className="block text-sm font-medium text-[#273655] mb-2">
                      Адрес откуда забрать вещи
                    </label>
                    <input
                      type="text"
                      value={cloudPickupAddress}
                      onChange={(e) => {
                        setCloudPickupAddress(e.target.value);
                        setSubmitError(null);
                      }}
                      placeholder="Например: г.Алматы, Абая 25"
                      className="w-full h-12 px-4 text-base border-0 rounded-3xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:bg-white"
                    />
                  </div>

                  {/* Кнопка бронирования - для мобильной версии */}
                  <button
                    onClick={handleCloudBookingClick}
                    disabled={!isCloudFormReady || isSubmittingOrder}
                    className="w-full bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white font-semibold py-4 px-6 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed order-6 lg:hidden mb-3"
                  >
                    {isSubmittingOrder ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
                  </button>

                  {/* Кнопка обратного звонка - для мобильной версии */}
                  <button
                    onClick={handleCallbackRequestClick}
                    className="w-full bg-gray-100 text-[#273655] font-semibold py-4 px-6 rounded-3xl hover:bg-gray-200 transition-colors order-7 lg:hidden"
                  >
                    Заказать обратный звонок
                  </button>

                  {/* Кнопка бронирования - для десктопа */}
                  <button
                    onClick={handleCloudBookingClick}
                    disabled={!isCloudFormReady || isSubmittingOrder}
                    className="hidden lg:block w-full bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-white font-semibold py-4 px-6 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-6"
                  >
                    {isSubmittingOrder ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
                  </button>
                </div>

                {/* Правая колонка - Бронирование и услуги (только для десктопа) */}
                <div className="hidden lg:flex flex-col">
                  {/* Дата начала бронирования */}
                  <div className="mb-6">
                    <DatePicker
                      value={cloudBookingStartDate}
                      onChange={(value) => {
                        setCloudBookingStartDate(value);
                        setSubmitError(null);
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                      allowFutureDates={true}
                      placeholder="Дата начало бронирвания"
                      className="[&_input]:bg-transparent"
                    />
                  </div>
                  
                  {/* Срок аренды */}
                  <div className="mb-6">
                    <RentalPeriodSelect
                      value={cloudMonths}
                      onChange={(value) => {
                        setCloudMonths(value);
                        setSubmitError(null);
                      }}
                      label="Срок аренды:"
                      variant="cloud-home"
                      showLabelInside={true}
                    />
                  </div>
                  
                  {/* Адрес откуда забрать вещи */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-[#273655] mb-2">
                      Адрес откуда забрать вещи
                    </label>
                    <input
                      type="text"
                      value={cloudPickupAddress}
                      onChange={(e) => {
                        setCloudPickupAddress(e.target.value);
                        setSubmitError(null);
                      }}
                      placeholder="Например: г.Алматы, Абая 25"
                      className="w-full h-12 px-4 text-base border-0 rounded-3xl bg-white focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:bg-white"
                    />
                  </div>
                  
                  {/* Кнопка обратного звонка */}
                  <button
                    onClick={handleCallbackRequestClick}
                    className="w-full bg-gray-100 text-[#273655] font-semibold py-4 px-6 rounded-3xl hover:bg-gray-200 transition-colors"
                  >
                    Заказать обратный звонок
                  </button>
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

      {/* Отступ с фоном хэдера */}
      <div className="w-full bg-gradient-to-r from-[#E0F2FE]/95 to-white/95 h-4 sm:h-8"></div>

      {/* Шестой фрейм: филиалы Extra Space */}
      <section className="w-full bg-gradient-to-r from-[#E0F2FE] to-white font-['Montserrat'] py-6 sm:py-8">
        <div className="w-full px-4 sm:px-6 lg:px-8 mb-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#273655] mb-2">
            Филиалы
          </h1>
          <p className="text-base sm:text-lg text-gray-600">
            Выберите удобный филиал рядом с домом
          </p>
        </div>

        {/* Карта на всю ширину страницы */}
        <div className="w-full">
          <div style={{ width: "100%", height: "600px" }}>
            <WarehouseMap warehouses={warehouses} mapId="home-branches-map" />
          </div>
        </div>
      </section>

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

      {/* Анимированная бегущая строка с преимуществами перед футером */}
      <section className="w-full bg-gradient-to-r from-[#E0F2FE] to-white pb-6 overflow-hidden relative">
        <div className="flex animate-scroll">
          {/* Первый набор элементов */}
          <div className="flex items-center gap-24 sm:gap-32 whitespace-nowrap flex-shrink-0">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ к видеонаблюдению</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Бронирование онлайн</span>
            </div>
          </div>
          {/* Дублируем для бесконечной прокрутки */}
          <div className="flex items-center gap-24 sm:gap-32 whitespace-nowrap flex-shrink-0 ml-24 sm:ml-32">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ к видеонаблюдению</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Бронирование онлайн</span>
            </div>
          </div>
          {/* Третий набор для более плавного перехода */}
          <div className="flex items-center gap-24 sm:gap-32 whitespace-nowrap flex-shrink-0 ml-24 sm:ml-32">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Доступ к видеонаблюдению</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={24} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-base sm:text-lg font-medium">Бронирование онлайн</span>
            </div>
          </div>
        </div>
        <style>{`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(calc(-33.333% - 0px));
            }
          }
          .animate-scroll {
            animation: scroll 50s linear infinite;
            will-change: transform;
          }
          @media (max-width: 640px) {
            .animate-scroll {
              animation: scroll 30s linear infinite;
            }
          }
        `}</style>
      </section>

      <div className="w-full bg-gradient-to-r from-[#E0F2FE]/95 to-white/95 h-8 sm:h-16"></div>

      <Footer />
    </div>
  );
});

HomePage.displayName = "HomePage";

export default HomePage;
