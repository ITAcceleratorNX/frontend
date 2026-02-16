import React, { useState, memo, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Header } from "../../widgets";
import extraspaceLogo from "../../assets/photo_5440760864748731559_y.jpg";
import oblachImg from "../../assets/oblach.png";
import indiImg from "../../assets/indi.png";
import section1Img from "../../assets/1section.png";
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
  SelectGroup,
  SelectLabel,
  Switch,
} from "../../components/ui";
import { Popover, PopoverTrigger, PopoverContent } from "../../components/ui/popover";
import { Truck, Package, X, Info, Plus, Minus, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Box, Moon, Camera, Wifi, Maximize, Thermometer, AlertTriangle, Tag, Check, UserCircle, PenLine, Layers, Shield, Users, ScrollText, FileText, CreditCard } from "lucide-react";
// Импортируем иконки дополнительных услуг
import streychPlenkaIcon from "../../assets/стрейч_пленка.png";
import bubbleWrap100Icon from "../../assets/Воздушно-пузырчатая_плёнка_(100 м).png";
import bubbleWrap10Icon from "../../assets/Пузырчатая_плёнка_(10 м).png";
import korobkiIcon from "../../assets/коробки.png";
import markerIcon from "../../assets/маркер.png";
import rackRentalIcon from "../../assets/Аренда_стелажей.png";
import uslugiMuveraIcon from "../../assets/услуги_мувера.png";
import uslugiUpakovkiIcon from "../../assets/услуги_упаковки.png";
import { useAuth } from "../../shared/context/AuthContext";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  toastOrderRequestSent,
} from "../../shared/lib/toast";
import { validateUserProfile } from "../../shared/lib/validation/profileValidation";
import CallbackRequestModal from "@/shared/components/CallbackRequestModal.jsx";
import CallbackRequestSection from "@/shared/components/CallbackRequestSection.jsx";
import { LeadSourceModal, useLeadSource, shouldShowLeadSourceModal } from "@/shared/components/LeadSourceModal.jsx";
import PaymentPreviewModal from "@/shared/components/PaymentPreviewModal.jsx";
import { getOrCreateVisitorId } from "@/shared/lib/utm";
import { trackVisit } from "@/shared/api/visitsApi";
// Импортируем иконки для предзагрузки
import TelegramIcon from '@/assets/lead-source-icons/telegram.webp';
import SiteIcon from '@/assets/lead-source-icons/site.webp';
import WhatsappIcon from '@/assets/lead-source-icons/whatsapp.webp';
import TwoGisIcon from '@/assets/lead-source-icons/2gis.webp';
import InstagramIcon from '@/assets/lead-source-icons/instagram.webp';
import TiktokIcon from '@/assets/lead-source-icons/tiktok.webp';
import AdsIcon from '@/assets/lead-source-icons/ads.webp';
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

const getServiceTypeDescription = (type) => {
  switch (type) {
    case "LOADER":
      return "Безопасный перенос и погрузка тяжёлых и габаритных предметов без риска травм.";
    case "PACKER":
      return "Профессионально упаковываем ваши вещи, экономя время и снижая риск повреждений.";
    case "STRETCH_FILM":
      return "Фиксирует и защищает мебель и коробки от пыли, влаги и царапин.";
    case "BOX_SIZE":
      return "Надёжно защищают вещи от повреждений, пыли и влаги при переезде и хранении.";
    case "MARKER":
      return "Позволяет подписать коробки и быстро находить нужные вещи без лишней суеты.";
    case "BUBBLE_WRAP_1":
      return "Эффективно защищает хрупкие предметы от ударов, сколов и тряски.";
    case "BUBBLE_WRAP_2":
      return "Идеально подходит для упаковки большого объёма вещей при переезде.";
    case "RACK_RENTAL":
      return "Обеспечивает удобное, аккуратное и организованное хранение вещей на складе.";
    default:
      return null;
  }
};

const getServiceTypeIcon = (type) => {
  switch (type) {
    case "LOADER":
      return uslugiMuveraIcon;
    case "PACKER":
      return uslugiUpakovkiIcon;
    case "STRETCH_FILM":
      return streychPlenkaIcon;
    case "BOX_SIZE":
      return korobkiIcon;
    case "MARKER":
      return markerIcon;
    case "BUBBLE_WRAP_1":
      return bubbleWrap10Icon;
    case "BUBBLE_WRAP_2":
      return bubbleWrap100Icon;
    case "RACK_RENTAL":
      return rackRentalIcon;
    default:
      return uslugiUpakovkiIcon;
  }
};
// Мемоизируем компонент HomePage для предотвращения лишних ререндеров
const HomePage = memo(() => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
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
  const [movingStreetFrom, setMovingStreetFrom] = useState("");
  const [movingHouseFrom, setMovingHouseFrom] = useState("");
  const [movingFloorFrom, setMovingFloorFrom] = useState("");
  const [movingApartmentFrom, setMovingApartmentFrom] = useState("");
  const [movingPickupDate, setMovingPickupDate] = useState(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  });
  const [cloudStreetFrom, setCloudStreetFrom] = useState("");
  const [cloudHouseFrom, setCloudHouseFrom] = useState("");
  const [cloudFloorFrom, setCloudFloorFrom] = useState("");
  const [cloudApartmentFrom, setCloudApartmentFrom] = useState("");
  
  // Функция для формирования полного адреса из отдельных полей
  const getMovingAddressFrom = useMemo(() => {
    const parts = [];
    if (movingStreetFrom.trim()) parts.push(movingStreetFrom.trim());
    if (movingHouseFrom.trim()) parts.push(`д. ${movingHouseFrom.trim()}`);
    if (movingFloorFrom.trim()) parts.push(`эт. ${movingFloorFrom.trim()}`);
    if (movingApartmentFrom.trim()) parts.push(`кв. ${movingApartmentFrom.trim()}`);
    return parts.length > 0 ? parts.join(', ') : '';
  }, [movingStreetFrom, movingHouseFrom, movingFloorFrom, movingApartmentFrom]);
  
  // Функция для формирования полного адреса облачного хранения из отдельных полей
  const getCloudPickupAddress = useMemo(() => {
    const parts = [];
    if (cloudStreetFrom.trim()) parts.push(cloudStreetFrom.trim());
    if (cloudHouseFrom.trim()) parts.push(`д. ${cloudHouseFrom.trim()}`);
    if (cloudFloorFrom.trim()) parts.push(`эт. ${cloudFloorFrom.trim()}`);
    if (cloudApartmentFrom.trim()) parts.push(`кв. ${cloudApartmentFrom.trim()}`);
    return parts.length > 0 ? parts.join(', ') : '';
  }, [cloudStreetFrom, cloudHouseFrom, cloudFloorFrom, cloudApartmentFrom]);
  
  // Состояние для moving_orders (для возврата вещей при добавлении GAZELLE_TO)
  const [movingOrders, setMovingOrders] = useState([]);
  // Состояние для адреса возврата (GAZELLE_TO)
  const [movingAddressTo, setMovingAddressTo] = useState("");
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
  const [gazelleService, setGazelleService] = useState(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackModalContext, setCallbackModalContext] = useState('callback');
  const [isLeadSourceModalOpen, setIsLeadSourceModalOpen] = useState(false);
  const { leadSource, saveLeadSource } = useLeadSource();
  // Состояние для модалки предпросмотра платежей
  const [isPaymentPreviewOpen, setIsPaymentPreviewOpen] = useState(false);
  const [paymentPreviewType, setPaymentPreviewType] = useState(null); // 'INDIVIDUAL' или 'CLOUD'
  const [selectedPaymentType, setSelectedPaymentType] = useState('MONTHLY'); // 'MONTHLY' или 'FULL'
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
  const [showPromoInput, setShowPromoInput] = useState(false);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  // Состояние для промокода (облачное хранение)
  const [cloudPromoCode, setCloudPromoCode] = useState("");
  const [cloudPromoCodeInput, setCloudPromoCodeInput] = useState("");
  const [cloudPromoDiscount, setCloudPromoDiscount] = useState(0);
  const [cloudPromoDiscountPercent, setCloudPromoDiscountPercent] = useState(0);
  const [cloudPromoError, setCloudPromoError] = useState("");
  const [cloudPromoSuccess, setCloudPromoSuccess] = useState(false);
  const [isValidatingCloudPromo, setIsValidatingCloudPromo] = useState(false);
  const [showCloudPromoInput, setShowCloudPromoInput] = useState(false);

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
              const exists = prev.some(order => order.status === "PENDING" && order.direction === "TO_CLIENT");
              if (exists) {
                console.log("⚠️ moving_order для возврата уже существует");
                return prev;
              }
              
              const newOrder = {
                moving_date: returnDate.toISOString(),
                status: "PENDING",
                direction: "TO_CLIENT",
                address: movingAddressTo || getMovingAddressFrom || "",
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
            setMovingOrders(prev => prev.filter(order => !(order.status === "PENDING" && order.direction === "TO_CLIENT")));
          }
        }
      }
      
      return updated;
    });
    setSubmitError(null);
  }, [serviceOptions, individualBookingStartDate, monthsNumber, movingStreetFrom, movingHouseFrom, movingApartmentFrom, movingAddressTo, getMovingAddressFrom]);

  const removeServiceRow = useCallback((index) => {
    setServices((prev) => {
      const serviceToRemove = prev[index];
      
      // Если удаляется GAZELLE_TO, удаляем соответствующий moving_order
      if (serviceToRemove?.service_id && serviceOptions.length > 0) {
        const option = serviceOptions.find(opt => String(opt.id) === String(serviceToRemove.service_id));
        if (option && option.type === "GAZELLE_TO") {
          setMovingOrders(prev => prev.filter(order => !(order.status === "PENDING" && order.direction === "TO_CLIENT")));
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
        const count = Number(service.count) || 1;
        const amount = unitPrice * count;
        total += amount;
        const serviceName = option?.description || getServiceTypeName(option?.type) || "Услуга";
        breakdown.push({
          label: count > 1 ? `${serviceName} (${count} шт.)` : serviceName,
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
    if (includeMoving && !movingStreetFrom.trim()) return false;
    if (includePacking && packagingServicesForOrder.length === 0) return false;
    return true;
  }, [
    includeMoving,
    includePacking,
    monthsNumber,
    getMovingAddressFrom,
    movingStreetFrom,
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
    if (!cloudStreetFrom.trim()) return false;
    // Требуется либо выбран тариф, либо выбрано "Свои габариты"
    if (!selectedTariff) return false;
    return true;
  }, [cloudStorage, cloudMonthsNumber, cloudStreetFrom, cloudVolume, selectedTariff]);

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
    // combinedTotal включает аренду + услуги
    const combinedTotal = (baseTotal || 0) + serviceTotal;

    return {
      baseMonthly,
      baseTotal,
      serviceTotal,
      combinedTotal,
    };
  }, [pricePreview, serviceSummary.total]);

  // Расчет итоговой суммы с учетом промокода (индивидуальное хранение)
  const finalIndividualTotal = useMemo(() => {
    const total = costSummary.combinedTotal || 0;
    return Math.max(0, total - promoDiscount);
  }, [costSummary.combinedTotal, promoDiscount]);

  // Расчет итоговой суммы с учетом промокода (облачное хранение)
  const finalCloudTotal = useMemo(() => {
    const total = (cloudPricePreview?.total || 0);
    return Math.max(0, total - cloudPromoDiscount);
  }, [cloudPricePreview, cloudPromoDiscount]);

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
  }, [promoCodeInput, costSummary.combinedTotal]);

  // Функция удаления промокода для индивидуального хранения
  const handleRemovePromoCode = useCallback(() => {
    setPromoCode("");
    setPromoCodeInput("");
    setPromoDiscount(0);
    setPromoDiscountPercent(0);
    setPromoError("");
    setPromoSuccess(false);
    setShowPromoInput(false);
  }, []);

  // Функция применения промокода для облачного хранения
  const handleApplyCloudPromoCode = useCallback(async () => {
    if (!cloudPromoCodeInput.trim()) {
      setCloudPromoError("Введите промокод");
      return;
    }

    const totalAmount = (cloudPricePreview?.total || 0);
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
      showSuccessToast(`Промокод применен! Скидка ${result.discount_percent}%`);
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
  }, [cloudPromoCodeInput, cloudPricePreview]);

  // Функция удаления промокода для облачного хранения
  const handleRemoveCloudPromoCode = useCallback(() => {
    setCloudPromoCode("");
    setCloudPromoCodeInput("");
    setCloudPromoDiscount(0);
    setCloudPromoDiscountPercent(0);
    setCloudPromoError("");
    setCloudPromoSuccess(false);
    setShowCloudPromoInput(false);
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

  // Предзагрузка изображений для опросника и показ модального окна источника лида
  useEffect(() => {
    // Предзагружаем изображения опросника сразу при загрузке страницы
    if (typeof window !== 'undefined' && shouldShowLeadSourceModal()) {
      // Предзагружаем все иконки опросника
      const icons = [SiteIcon, WhatsappIcon, TwoGisIcon, InstagramIcon, TiktokIcon, AdsIcon, TelegramIcon];
      icons.forEach((icon) => {
        const img = new Image();
        img.src = icon;
        img.loading = 'eager';
        // Добавляем preload link в head для еще более ранней загрузки
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = icon;
        if (!document.querySelector(`link[href="${icon}"]`)) {
          document.head.appendChild(link);
        }
      });
    }
    
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

    // Возвращаем забор вещей (PENDING с direction TO_WAREHOUSE)
    return [
      {
        moving_date: pickupDate.toISOString(),
        status: "PENDING",
        direction: "TO_WAREHOUSE",
        address,
      },
    ];
  }, []);

  // Функция для перевода ошибок бэкенда на понятный язык
  const translateBackendError = useCallback((error, errorData) => {
    const message = errorData?.message || errorData?.error || error.message || "";
    const status = error.response?.status;
    const code = errorData?.code;

    // Ошибки валидации профиля
    if (status === 400 && (
      message.includes('profile') || 
      message.includes('Profile') ||
      message.includes('user data') ||
      message.includes('User data') ||
      message.includes('не заполнен') ||
      message.includes('не заполнены') ||
      message.includes('отсутствуют') ||
      message.includes('required') ||
      message.includes('missing') ||
      code === 'PROFILE_INCOMPLETE' ||
      code === 'USER_DATA_INCOMPLETE'
    )) {
      return {
        userMessage: 'Пожалуйста, заполните все данные в личном кабинете перед оформлением заказа.',
        shouldRedirect: true,
        redirectPath: '/personal-account',
        redirectState: { activeSection: 'personal', message: 'Заполните данные профиля и подтвердите номер телефона.' }
      };
    }

    // Ошибки валидации данных
    if (status === 400 && (
      message.includes('validation') ||
      message.includes('Validation') ||
      message.includes('invalid') ||
      message.includes('Invalid') ||
      message.includes('некорректно') ||
      message.includes('неверный')
    )) {
      return {
        userMessage: 'Проверьте правильность введенных данных и попробуйте снова.',
        shouldRedirect: false
      };
    }

    // Ошибки телефона
    if (status === 400 && (
      message.includes('Phone number must be verified') ||
      message.includes('phone number') ||
      message.includes('телефон') ||
      code === 'PHONE_NOT_VERIFIED'
    )) {
      return {
        userMessage: 'Телефон не верифицирован. Пожалуйста, верифицируйте номер телефона в профиле перед созданием заказа.',
        shouldRedirect: true,
        redirectPath: '/personal-account',
        redirectState: { activeSection: 'personal' }
      };
    }

    // Ошибки лимита заказов
    if (status === 403 && (
      message.includes('максимальное количество боксов') ||
      message.includes('MAX_ORDERS_LIMIT_REACHED') ||
      code === 'MAX_ORDERS_LIMIT_REACHED'
    )) {
      return {
        userMessage: 'Достигнут лимит активных заказов. Пожалуйста, свяжитесь с нами для увеличения лимита.',
        shouldRedirect: false
      };
    }

    // Ошибки авторизации
    if (status === 401) {
      return {
        userMessage: 'Сессия истекла. Пожалуйста, войдите снова.',
        shouldRedirect: true,
        redirectPath: '/login'
      };
    }

    // Ошибки доступа
    if (status === 403) {
      return {
        userMessage: 'У вас нет доступа для выполнения этого действия.',
        shouldRedirect: false
      };
    }

    // Ошибки сервера
    if (status >= 500) {
      return {
        userMessage: 'Произошла ошибка на сервере. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.',
        shouldRedirect: false
      };
    }

    // Общая ошибка
    return {
      userMessage: message || 'Не удалось создать заказ. Пожалуйста, проверьте данные и попробуйте снова.',
      shouldRedirect: false
    };
  }, []);

  const handleCreateIndividualOrder = useCallback(async (paymentType = 'MONTHLY') => {
    if (isSubmittingOrder) return;

    if (!isAuthenticated) {
      showInfoToast("Авторизуйтесь, чтобы оформить заказ.");
      navigate("/login", { state: { from: "/" } });
      return;
    }

    if (!isUserRole) {
      showErrorToast("Создание заказа доступно только клиентам с ролью USER.");
      return;
    }

    // Проверка профиля перед отправкой заказа
    if (user) {
      const profileValidation = validateUserProfile(user);
      if (!profileValidation.isValid) {
        // Формируем сообщение в зависимости от типа ошибки
        let errorTitle = 'Необходимо заполнить профиль';
        let errorMessage = profileValidation.message;
        
        // Если проблема только в верификации телефона
        if (profileValidation.phoneNotVerified && 
            profileValidation.missingFields.length === 0 && 
            profileValidation.invalidFields.length === 0) {
          errorTitle = 'Необходимо верифицировать телефон';
          errorMessage = 'Пожалуйста, верифицируйте номер телефона в профиле перед созданием заказа.';
        }
        
        showErrorToast(errorMessage);
        setTimeout(() => {
          navigate("/personal-account", { 
            state: { 
              activeSection: "personal",
            }
          });
        }, 2000);
        return;
      }
    }

    if (!selectedWarehouse || !previewStorage) {
      setSubmitError("Выберите склад и бокс, чтобы продолжить.");
      return;
    }

    if (!monthsNumber || monthsNumber <= 0) {
      setSubmitError("Укажите срок аренды.");
      return;
    }

    if (includeMoving && !movingStreetFrom.trim()) {
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

      const trimmedAddress = getMovingAddressFrom;

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
        payment_type: paymentType, // Тип оплаты: MONTHLY или FULL
      };

      // Добавляем промокод, если он применен
      if (promoSuccess && promoCode) {
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
        // Добавляем забор вещей (PENDING с direction TO_WAREHOUSE)
        const pickupOrder = buildMovingOrders(trimmedAddress, monthsNumber, movingPickupDate)[0];
        allMovingOrders.push(pickupOrder);
      }
      
      // Добавляем возврат вещей, если есть GAZELLE_TO в услугах
      if (hasGazelleTo) {
        console.log("✅ GAZELLE_TO найдена, добавляем moving_order");
        
        // Используем moving_order из состояния или создаем новый
        const returnOrder = movingOrders.find(order => order.status === "PENDING" && order.direction === "TO_CLIENT");
        if (returnOrder) {
          console.log("✅ Используем существующий moving_order из состояния");
          allMovingOrders.push({
            moving_date: returnOrder.moving_date,
            status: "PENDING",
            direction: "TO_CLIENT",
            address: returnOrder.address || movingAddressTo.trim() || (includeMoving ? trimmedAddress : ""),
          });
        } else {
          console.log("✅ Создаем новый moving_order для возврата");
          // Создаем дату возврата: дата начала бронирования + количество месяцев
          const startDate = new Date(individualBookingStartDate || new Date());
          const returnDate = new Date(startDate);
          returnDate.setMonth(returnDate.getMonth() + monthsNumber);
          returnDate.setHours(10, 0, 0, 0);
          
          allMovingOrders.push({
            moving_date: returnDate.toISOString(),
            status: "PENDING",
            direction: "TO_CLIENT",
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

      // Закрываем модалку предпросмотра платежей
      setIsPaymentPreviewOpen(false);
      setPaymentPreviewType(null);

      // Обновляем кэш заказов и переходим на thank-you страницу
      toastOrderRequestSent();

      // Обновляем кэш заказов и ждём завершения, затем навигация
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['orders', 'user'] });
        navigate("/personal-account", { state: { activeSection: "orders" } });
      }, 1500);
    } catch (error) {
      console.error("Ошибка при создании заказа:", error);
      const errorData = error.response?.data;
      
      // Переводим ошибку на понятный язык
      const translatedError = translateBackendError(error, errorData);

      // Показываем понятное сообщение об ошибке
      showErrorToast(translatedError.userMessage);

      // Если нужно перенаправить пользователя
      if (translatedError.shouldRedirect) {
        setIsPaymentPreviewOpen(false);
        setPaymentPreviewType(null);
        setTimeout(() => {
          navigate(translatedError.redirectPath, { 
            state: translatedError.redirectState || {} 
          });
        }, 2000);
        setIsSubmittingOrder(false);
        return;
      }

      // Обработка лимита заказов (показываем модал обратного звонка)
      if (error.response?.status === 403 && (
        translatedError.userMessage.includes('лимит') ||
        errorData?.code === 'MAX_ORDERS_LIMIT_REACHED'
      )) {
        setIsPaymentPreviewOpen(false);
        setPaymentPreviewType(null);
        setCallbackModalContext('max_orders_limit');
        openCallbackModal('max_orders_limit');
        setSubmitError(null);
        setIsSubmittingOrder(false);
        return;
      }

      setSubmitError(translatedError.userMessage);
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
    getMovingAddressFrom,
    movingStreetFrom,
    openCallbackModal,
    movingOrders,
    individualBookingStartDate,
    promoCode,
    user,
    validateUserProfile,
    translateBackendError,
  ]);

  const handleCreateCloudOrder = useCallback(async (paymentType = 'MONTHLY') => {
    if (isSubmittingOrder) return;

    if (!isAuthenticated) {
      showInfoToast("Авторизуйтесь, чтобы оформить заказ.");
      navigate("/login", { state: { from: "/" } });
      return;
    }

    if (!isUserRole) {
      showErrorToast("Создание заказа доступно только клиентам с ролью USER.");
      return;
    }

    // Проверка профиля перед отправкой заказа
    if (user) {
      const profileValidation = validateUserProfile(user);
      if (!profileValidation.isValid) {
        // Формируем сообщение в зависимости от типа ошибки
        let errorTitle = 'Необходимо заполнить профиль';
        let errorMessage = profileValidation.message;
        
        // Если проблема только в верификации телефона
        if (profileValidation.phoneNotVerified && 
            profileValidation.missingFields.length === 0 && 
            profileValidation.invalidFields.length === 0) {
          errorTitle = 'Необходимо верифицировать телефон';
          errorMessage = 'Пожалуйста, верифицируйте номер телефона в профиле перед созданием заказа.';
        }
        
        showErrorToast(errorMessage);
        setTimeout(() => {
          navigate("/personal-account", { 
            state: { 
              activeSection: "personal",
            }
          });
        }, 2000);
        return;
      }
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

    if (!cloudStreetFrom.trim()) {
      setSubmitError("Укажите адрес забора вещей.");
      return;
    }

    try {
      setIsSubmittingOrder(true);
      setSubmitError(null);

      const trimmedAddress = getCloudPickupAddress;

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
        payment_type: paymentType, // Тип оплаты: MONTHLY или FULL
      };

      // Добавляем промокод, если он применен
      if (cloudPromoSuccess && cloudPromoCode) {
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

      // Закрываем модалку предпросмотра платежей
      setIsPaymentPreviewOpen(false);
      setPaymentPreviewType(null);

      toastOrderRequestSent();

      // Обновляем кэш заказов и ждём завершения, затем навигация
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['orders', 'user'] });
        navigate("/personal-account", { state: { activeSection: "orders" } });
      }, 1500);
    } catch (error) {
      console.error("Ошибка при создании облачного заказа:", error);
      const errorData = error.response?.data;
      
      // Переводим ошибку на понятный язык
      const translatedError = translateBackendError(error, errorData);

      // Показываем понятное сообщение об ошибке
      showErrorToast(translatedError.userMessage);

      // Если нужно перенаправить пользователя
      if (translatedError.shouldRedirect) {
        setIsPaymentPreviewOpen(false);
        setPaymentPreviewType(null);
        setTimeout(() => {
          navigate(translatedError.redirectPath, { 
            state: translatedError.redirectState || {} 
          });
        }, 2000);
        setIsSubmittingOrder(false);
        return;
      }

      // Обработка лимита заказов (показываем модал обратного звонка)
      if (error.response?.status === 403 && (
        translatedError.userMessage.includes('лимит') ||
        errorData?.code === 'MAX_ORDERS_LIMIT_REACHED'
      )) {
        setIsPaymentPreviewOpen(false);
        setPaymentPreviewType(null);
        setCallbackModalContext('max_orders_limit');
        openCallbackModal('max_orders_limit');
        setSubmitError(null);
        setIsSubmittingOrder(false);
        return;
      }

      setSubmitError(translatedError.userMessage);
    } finally {
      setIsSubmittingOrder(false);
    }
  }, [
    buildMovingOrders,
    cloudBookingStartDate,
    cloudMonthsNumber,
    getCloudPickupAddress,
    cloudStreetFrom,
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
    cloudPromoCode,
    user,
    validateUserProfile,
    translateBackendError,
  ]);

  const handleIndividualBookingClick = useCallback(() => {
    // Всегда показываем модалку предпросмотра платежей
    setPaymentPreviewType('INDIVIDUAL');
    setIsPaymentPreviewOpen(true);
  }, []);

  const handleCloudBookingClick = useCallback(() => {
    // Всегда показываем модалку предпросмотра платежей
    setPaymentPreviewType('CLOUD');
    setIsPaymentPreviewOpen(true);
  }, []);

  // Обработчик подтверждения бронирования из модалки предпросмотра платежей
  const handlePaymentPreviewConfirm = useCallback((paymentType) => {
    // Сохраняем выбранный тип оплаты
    setSelectedPaymentType(paymentType || 'MONTHLY');
    
    // Если пользователь не авторизован - показываем модалку обратного звонка
    if (!isAuthenticated) {
      setIsPaymentPreviewOpen(false);
      setPaymentPreviewType(null);
      openCallbackModal('booking');
      return;
    }
    
    // Если авторизован - создаём заказ
    if (paymentPreviewType === 'INDIVIDUAL') {
      handleCreateIndividualOrder(paymentType);
    } else if (paymentPreviewType === 'CLOUD') {
      handleCreateCloudOrder(paymentType);
    }
  }, [paymentPreviewType, handleCreateIndividualOrder, handleCreateCloudOrder, isAuthenticated, openCallbackModal]);

  // Закрытие модалки предпросмотра платежей
  const handlePaymentPreviewClose = useCallback(() => {
    if (!isSubmittingOrder) {
      setIsPaymentPreviewOpen(false);
      setPaymentPreviewType(null);
    }
  }, [isSubmittingOrder]);

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
      setCloudStreetFrom("");
      setCloudHouseFrom("");
      setCloudFloorFrom("");
      setCloudApartmentFrom("");
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

      <div className="flex-1 relative overflow-hidden bg-gradient-to-r bg-[#FFF] -mt-16 pt-16">
        {/* Декоративные элементы на фоне - начинаются от самого верха страницы */}
        {/*<div className="absolute inset-0 pointer-events-none overflow-visible z-0">*/}
        {/*  /!* Большой круг слева *!/*/}
        {/*  <div className="absolute top-20 -left-20 w-96 h-96 bg-[#00A991] opacity-10 rounded-full blur-3xl"></div>*/}
        {/*  /!* Средний круг справа *!/*/}
        {/*  <div className="absolute top-1/2 -right-32 w-80 h-80 bg-[#00A991] opacity-10 rounded-full blur-3xl"></div>*/}
        {/*  /!* Маленький круг в центре *!/*/}
        {/*  <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-[#00A991] opacity-10 rounded-full blur-2xl"></div>*/}
        {/*  /!* Дополнительные декоративные круги *!/*/}
        {/*  <div className="absolute bottom-20 left-1/4 w-48 h-48 bg-[#00A991] opacity-10 rounded-full blur-2xl"></div>*/}
        {/*  <div className="absolute top-1/3 left-1/2 w-56 h-56 bg-[#00A991] opacity-10 rounded-full blur-2xl"></div>*/}
        {/*</div>*/}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
          {/* Первая секция: Храните там, где удобно */}
          <section className="flex flex-col items-center text-center">
            <h1 className="font-sf-pro-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#202422] leading-tight mb-6 sm:mb-8">
              ХРАНИТЕ ТАМ, ГДЕ УДОБНО
            </h1>
            <div className="text-sm sm:text-base text-[#5C625F] leading-relaxed mb-12 max-w-2xl mt-2">
              <p className="mb-1">Склады от 1 до 100 м² с безопасным хранением и доступом 24/7.</p>
              <p className="mb-1">Боксы от 2 до 50 м² по спец.цене при аренде от 3 месяцев.</p>
              <p className="flex flex-wrap items-center justify-center gap-2">
                <span>Хранение за м² от</span>
                <span className="inline-flex px-2.5 py-0.5 bg-[#4F9A75] text-white font-normal text-sm sm:text-base rounded-2xl">
                  5 990 ₸
                </span>
              </p>
            </div>
            <button
              onClick={handleHeroBookingClick}
              className="flex items-center gap-2 bg-[#31876D] hover:bg-[#2a7260] text-white font-medium px-6 py-3 rounded-full text-sm sm:text-base transition-colors duration-300 mb-8 sm:mb-8"
            >
              <span>Забронировать</span>
              <ChevronRight size={16} strokeWidth={2.5} />
            </button>
            <img
              src={section1Img}
              alt="Extra Space — индивидуальное хранение"
              className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl h-auto object-contain"
            />
          </section>
        </div>
      </div>

      {/* Секция: Быстрое бронирование */}
      <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-sf-pro-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-normal text-center mb-12 sm:mb-16">
            БЫСТРОЕ БРОНИРОВАНИЕ
          </h2>
          <div className="flex flex-col items-center">
            {/* Первый ряд — 3 карточки */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full max-w-5xl mb-10">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F7F8FA] flex items-center justify-center mb-4">
                  <Box size={24} className="text-[#31876D]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#202422] text-base sm:text-lg mb-2">Забронируйте бокс</h3>
                <p className="text-[#5C625F] text-xs sm:text-sm font-normal leading-relaxed">
                  Выберите подходящий размер бокса и забронируйте его онлайн за пару минут без визита в офис.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F7F8FA] flex items-center justify-center mb-4">
                  <FileText size={24} className="text-[#31876D]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#202422] text-base sm:text-lg mb-2">Подпишите договор по СМС</h3>
                <p className="text-[#5C625F] text-xs sm:text-sm font-normal leading-relaxed">
                  Подтвердите договор прямо с телефона — код придёт по СМС, никаких бумаг и встреч.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F7F8FA] flex items-center justify-center mb-4">
                  <CreditCard size={24} className="text-[#31876D]" strokeWidth={1.5} />
                </div>
                <h3 className="font-bold text-[#202422] text-base sm:text-lg mb-2">Оплатите онлайн или по СМС</h3>
                <p className="text-[#5C625F] text-xs sm:text-sm font-normal leading-relaxed">
                  Оплатите хранение удобным способом: картой онлайн или подтверждением через СМС.
                </p>
              </div>
            </div>
            {/* Второй ряд — 1 карточка по центру */}
            <div className="flex flex-col items-center text-center max-w-md">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F7F8FA] flex items-center justify-center mb-4">
                <Truck size={24} className="text-[#31876D]" strokeWidth={1.5} />
              </div>
              <h3 className="font-bold text-[#202422] text-base sm:text-lg mb-2">Назначьте доставку</h3>
              <p className="text-[#5C625F] text-xs sm:text-sm font-normal leading-relaxed">
                Укажите удобное время, и мы организуем забор и доставку ваших вещей до бокса.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Секция: Форматы хранения */}
      <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-sf-pro-text text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-normal text-center mb-3 sm:mb-4">
            ФОРМАТЫ ХРАНЕНИЯ
          </h2>
          <p className="text-[#5C625F] text-sm sm:text-base text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            Выберите подходящий формат хранения — отдельный бокс или индивидуальную полку. Платите только за нужный объём и пользуйтесь безопасным доступом 24/7.
          </p>

          {/* Индивидуальное хранение */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center mb-16 lg:mb-20">
            <div className="order-2 lg:order-1 w-full max-w-lg aspect-[4/3] overflow-hidden rounded-2xl mx-auto lg:mx-0 lg:ml-24">
              <img
                src={indiImg}
                alt="Индивидуальное хранение"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl sm:text-3xl font-bold text-[#202422] mb-4">Индивидуальное хранение</h3>
              <p className="text-[#5C625F] text-sm sm:text-base mb-4">
                Ваш личный закрытый бокс. Только вы имеете доступ — как мини-склад под ключ.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-[#5C625F] text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#202422] flex-shrink-0"></span>
                  Полная приватность
                </li>
                <li className="flex items-center gap-2 text-[#5C625F] text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#202422] flex-shrink-0"></span>
                  Круглосуточный доступ
                </li>
              </ul>
              <button
                onClick={() => openCallbackModal('callback')}
                className="inline-flex items-center gap-2 text-[#31876D] font-medium hover:opacity-80 transition-opacity"
              >
                <span>Подробнее</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          {/* Облачное хранение */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">
            <div className="w-full max-w-lg aspect-[4/3] overflow-hidden rounded-2xl mx-auto lg:mx-0 lg:ml-24">
              <img
                src={oblachImg}
                alt="Облачное хранение"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#202422] mb-4">Облачное хранение</h3>
              <p className="text-[#5C625F] text-sm sm:text-base mb-4">
                Сдайте вещи без аренды бокса — мы разместим их на индивидуальной полке в охраняемом складе. Удобно, если вещей немного.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-[#5C625F] text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#202422] flex-shrink-0"></span>
                  Платите только за объём
                </li>
                <li className="flex items-center gap-2 text-[#5C625F] text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#202422] flex-shrink-0"></span>
                  Быстрая приёмка вещей
                </li>
                <li className="flex items-center gap-2 text-[#5C625F] text-sm sm:text-base">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#202422] flex-shrink-0"></span>
                  Упрощённый доступ
                </li>
              </ul>
              <button
                onClick={() => openCallbackModal('callback')}
                className="inline-flex items-center gap-2 text-[#31876D] font-medium hover:opacity-80 transition-opacity"
              >
                <span>Подробнее</span>
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Отступ с фоном хэдера */}
      <div className="w-full bg-[#FFF] h-4 sm:h-8"></div>

      {/* Секция: Хранение в городе */}
      <section ref={tabsSectionRef} className="w-full bg-[#FFF] py-6 sm:py-8">
        <div className="container mx-auto px-2 sm:px-2 lg:px-3 xl:px-3 max-w-7xl">
          {/* Заголовок */}
          <h2 className="font-sf-pro-text text-2xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-normal mb-4 sm:mb-6">
            ХРАНЕНИЕ В ГОРОДЕ
          </h2>
          
          {/* Описания на одном уровне */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start mb-8">
            <p className="text-[#5C625F] text-base sm:text-lg">
              Современное хранение в черте города — просто, безопасно и гибко.
            </p>
            <p className="text-[#5C625F] text-sm sm:text-base">
              Настройте срок аренды, добавьте услуги перевозки или упаковки и управляйте хранением онлайн.
            </p>
          </div>
          
          {/* Отдельные кнопки табов */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveStorageTab("INDIVIDUAL")}
              className={`px-6 py-3 rounded-xl text-base font-semibold transition-all ${
                activeStorageTab === "INDIVIDUAL"
                  ? "bg-[#31876D] text-white"
                  : "bg-[#DFDFDF] text-gray-600"
              }`}
            >
              Индивидуальное хранение
            </button>
            <button
              onClick={() => setActiveStorageTab("CLOUD")}
              className={`px-6 py-3 rounded-xl text-base font-semibold transition-all ${
                activeStorageTab === "CLOUD"
                  ? "bg-[#31876D] text-white"
                  : "bg-[#DFDFDF] text-gray-600"
              }`}
            >
              Облачное хранение
            </button>
          </div>
          
          <Tabs value={activeStorageTab} onValueChange={setActiveStorageTab} className="w-full">

            <TabsContent value="INDIVIDUAL" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Левая панель - Карта склада */}
                <div className="rounded-2xl h-[78vh] min-h-[450px] flex flex-col" style={{ 
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
                <div className="bg-[#F7FAF9] rounded-3xl p-6 shadow-lg min-h-[450px] flex flex-col">
                  <h2 className="font-sf-pro-text text-2xl sm:text-3xl font-semibold text-[#202422] mb-6">
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
                      triggerClassName="bg-transparent"
                    />
                  </div>
                  
                  {/* Перевозка вещей */}
                  <div className="flex items-center justify-between mb-6 gap-3">
                    <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-3xl px-4 py-3 bg-transparent h-12">
                      <span className="text-base font-medium text-[#373737]">Перевозка вещей</span>
                      <Truck className="w-5 h-5 text-[#373737]" />
                    </div>
                    <Switch
                      checked={includeMoving}
                      onCheckedChange={async (checked) => {
                        setIncludeMoving(checked);
                        setSubmitError(null);
                        if (checked) {
                          await ensureServiceOptions();
                        } else {
                          setMovingStreetFrom("");
                          setMovingHouseFrom("");
                          setMovingFloorFrom("");
                          setMovingApartmentFrom("");
                        }
                      }}
                      className="bg-gray-300 data-[state=checked]:bg-[#00A991]"
                    />
                  </div>

                  {/* Детали перевозки */}
                  {includeMoving && previewStorage && (
                    <div className="mb-6 bg-white rounded-3xl p-4 sm:p-6 shadow-sm space-y-4 w-full max-w-full">
                      <h3 className="text-xl font-bold text-[#373737]">Детали перевозки</h3>
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
                            className="[&>div]:bg-white [&>div]:border [&>div]:border-gray-200 [&>div]:rounded-3xl [&_input]:text-[#373737] [&_input]:placeholder:text-gray-400 [&_label]:text-[#373737] [&_button]:text-[#373737] [&_button]:hover:text-[#373737] [&_button]:hover:bg-transparent [&_button]:hover:!-translate-y-1/2 [&_button]:hover:!top-1/2 [&_button]:transition-none [&_button]:cursor-pointer [&>div]:focus-within:ring-2 [&>div]:focus-within:ring-gray-200 [&>div]:focus-within:border-gray-300"
                          />
                        </div>
                        <div className="flex flex-col gap-2 w-full">
                          <label className="text-sm font-medium text-[#373737]">Адрес забора вещей</label>
                          <input
                            type="text"
                            value={movingStreetFrom}
                            onChange={(e) => {
                              setMovingStreetFrom(e.target.value);
                              setSubmitError(null);
                            }}
                            placeholder="Например: г. Алматы, Абая 25"
                            className="w-full h-[42px] rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-0"
                          />
                          <div className="flex gap-2 w-full">
                            <input
                              type="text"
                              value={movingHouseFrom}
                              onChange={(e) => {
                                setMovingHouseFrom(e.target.value);
                                setSubmitError(null);
                              }}
                              placeholder="Дом"
                              className="h-[42px] flex-1 rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-0"
                            />
                            <input
                              type="text"
                              value={movingFloorFrom}
                              onChange={(e) => {
                                setMovingFloorFrom(e.target.value);
                                setSubmitError(null);
                              }}
                              placeholder="Этаж"
                              className="h-[42px] flex-1 rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-0"
                            />
                            <input
                              type="text"
                              value={movingApartmentFrom}
                              onChange={(e) => {
                                setMovingApartmentFrom(e.target.value);
                                setSubmitError(null);
                              }}
                              placeholder="Квартира"
                              className="h-[42px] flex-1 rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 min-w-0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Услуги упаковки */}
                  <div className="flex items-center justify-between mb-2 gap-3">
                      <div className="flex items-center gap-2 flex-1 border border-gray-200 rounded-3xl px-4 py-3 bg-transparent h-12">
                      <span className="text-base font-medium text-[#373737]">Услуги упаковки</span>
                      <Package className="w-5 h-5 text-[#373737]" />
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
                    <div className="mb-3 bg-white rounded-3xl p-6 shadow-sm space-y-4">
                      <h3 className="text-xl font-bold text-[#373737]">Детали услуг упаковки</h3>
                      <div className="space-y-3">
                        {isServicesLoading ? (
                          <div className="flex items-center justify-center py-2">
                            <span className="w-5 h-5 border-2 border-t-transparent border-[#373737] rounded-full animate-spin" />
                          </div>
                        ) : (
                          <>
                            {servicesError && (
                              <p className="text-xs text-red-600">
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
                                      <div className="rounded-3xl border border-gray-200 bg-white px-4 py-3">
                                        {/* Верхняя строка с иконкой, названием и ценой */}
                                        <div className="flex items-center gap-3 mb-2">
                                          {/* Иконка */}
                                          <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-gray-100">
                                            {selectedOption ? (() => {
                                              const serviceIconSrc = getServiceTypeIcon(selectedOption.type);
                                              return (
                                                <img src={serviceIconSrc} alt="" className="h-7 w-7 object-contain opacity-70" />
                                              );
                                            })() : (
                                              <Package className="h-7 w-7 text-gray-400" />
                                            )}
                                          </div>
                                          
                                          {/* Название услуги */}
                                          <div className="flex-1 flex items-center gap-2">
                                            <Select
                                              value={service.service_id}
                                              onValueChange={(value) => updateServiceRow(index, "service_id", value)}
                                            >
                                              <SelectTrigger className="h-auto p-0 border-0 bg-transparent text-[#373737] font-medium hover:bg-transparent focus:ring-0 focus:ring-offset-0 [&>span]:text-[#373737] [&>svg]:text-[#373737] [&>svg]:ml-1 w-auto min-w-0">
                                                <SelectValue placeholder="Услуга" />
                                              </SelectTrigger>
                                            <SelectContent>
                                              {availableOptions.length > 0 ? (
                                                <>
                                                  {/* Услуги персонала */}
                                                  {(() => {
                                                    const staffServiceTypes = ['PACKER', 'LOADER', 'RACK_RENTAL'];
                                                    const staffServices = availableOptions.filter(option => staffServiceTypes.includes(option.type));
                                                    if (staffServices.length === 0) return null;
                                                    return (
                                                      <SelectGroup>
                                                        <SelectLabel className="text-xs font-semibold text-[#00A991] uppercase tracking-wide">
                                                          Услуги персонала
                                                        </SelectLabel>
                                                        {staffServices.map((option) => {
                                                          const serviceName = getServiceTypeName(option.type);
                                                          if (!serviceName) return null;
                                                          return (
                                                            <SelectItem key={option.id} value={String(option.id)}>
                                                              {serviceName}
                                                            </SelectItem>
                                                          );
                                                        })}
                                                      </SelectGroup>
                                                    );
                                                  })()}
                                                  {/* Упаковочные материалы */}
                                                  {(() => {
                                                    const materialTypes = ['BOX_SIZE', 'MARKER', 'BUBBLE_WRAP_1', 'BUBBLE_WRAP_2', 'STRETCH_FILM'];
                                                    const materialServices = availableOptions.filter(option => materialTypes.includes(option.type));
                                                    if (materialServices.length === 0) return null;
                                                    return (
                                                      <SelectGroup>
                                                        <SelectLabel className="text-xs font-semibold text-[#00A991] uppercase tracking-wide mt-2">
                                                          Упаковочные материалы
                                                        </SelectLabel>
                                                        {materialServices.map((option) => {
                                                          const serviceName = getServiceTypeName(option.type);
                                                          if (!serviceName) return null;
                                                          return (
                                                            <SelectItem key={option.id} value={String(option.id)}>
                                                              {serviceName}
                                                            </SelectItem>
                                                          );
                                                        })}
                                                      </SelectGroup>
                                                    );
                                                  })()}
                                                </>
                                              ) : (
                                                <div className="px-2 py-1.5 text-sm text-[#6B6B6B]">
                                                  Нет доступных услуг
                                                </div>
                                              )}
                                            </SelectContent>
                                            </Select>
                                            
                                            {service.service_id && (
                                              <span className="ml-auto text-sm text-[#373737]">
                                                {unitPrice.toLocaleString()} ₸/шт.
                                              </span>
                                            )}
                                            
                                            <button
                                              type="button"
                                              onClick={() => removeServiceRow(index)}
                                              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-[#373737] hover:bg-gray-100 transition-colors shrink-0"
                                              aria-label="Удалить услугу"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </button>
                                          </div>
                                        </div>

                                        {/* Нижняя строка с количеством */}
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm text-[#373737]">
                                            Кол-во
                                          </span>
                                          <Select
                                            value={String(service.count)}
                                            onValueChange={(value) => {
                                              const newCount = parseInt(value) || 1;
                                              updateServiceRow(index, "count", newCount);
                                            }}
                                          >
                                            <SelectTrigger className="w-16 h-8 rounded-lg border border-gray-200 bg-white text-sm text-[#373737] [&>span]:text-[#373737] [&>svg]:text-gray-500">
                                              <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                              {[1, 2, 3, 4, 5].map((num) => (
                                                <SelectItem key={num} value={String(num)}>
                                                  {num}
                                                </SelectItem>
                                              ))}
                                            </SelectContent>
                                          </Select>
                                        </div>

                                        {/* Описание выбранной услуги */}
                                        {selectedOption && getServiceTypeDescription(selectedOption.type) && (
                                          <p className="mt-2 text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">
                                            {getServiceTypeDescription(selectedOption.type)}
                                          </p>
                                        )}
                                      </div>
                                      
                                      {isGazelleToService && (
                                        <div className="pl-3 pr-11">
                                          <label className="block text-sm text-[#373737] mb-1">
                                            Адрес доставки вещей
                                          </label>
                                          <input
                                            type="text"
                                            value={movingAddressTo}
                                            onChange={(e) => {
                                              setMovingAddressTo(e.target.value);
                                              setMovingOrders(prev => prev.map(order => 
                                                (order.status === "PENDING" && order.direction === "TO_CLIENT")
                                                  ? { ...order, address: e.target.value }
                                                  : order
                                              ));
                                            }}
                                            placeholder="Например: г. Алматы, Абая 25"
                                            className="w-full h-[42px] rounded-3xl bg-gray-100 border-0 px-3 text-sm text-[#373737] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200"
                                          />
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {services.length === 0 && !servicesError && (
                              <p className="text-xs text-[#373737]">
                                Добавьте услуги, чтобы мы подготовили упаковку под ваши вещи.
                              </p>
                            )}

                            <button
                              type="button"
                              onClick={() => {
                                ensureServiceOptions();
                                addServiceRow();
                              }}
                              className="inline-flex items-center gap-1.5 rounded-3xl border-2 border-dashed border-gray-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-[#373737] hover:bg-gray-50 transition-colors"
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
                  <div className="mt-2">
                    <div className="border-2 border-dashed border-gray-300 rounded-3xl bg-transparent p-4 sm:p-6">
                      <h3 className="text-lg font-bold text-[#373737] mb-2">Итог</h3>
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
                            {/* Общая стоимость */}
                            <div className="text-lg font-bold text-[#273655] mb-2">
                              Общая стоимость: {promoSuccess && promoDiscount > 0 && (
                                <span className="text-sm text-gray-400 line-through mr-1">
                                  {costSummary.combinedTotal?.toLocaleString() ?? "—"} ₸
                                </span>
                              )}
                              {finalIndividualTotal?.toLocaleString() ?? "—"} ₸
                              {previewStorage && (
                                <span className="text-sm font-normal text-gray-600 ml-2">
                                  ({previewStorage.available_volume || previewStorage.volume || "—"} м²)
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 mb-4">
                               
                              {promoSuccess && ` (скидка ${promoDiscountPercent}%)`}
                            </div>

                            <div className="flex items-center justify-between mb-2">
                              <div className="text-sm text-gray-600">
                                Стоимость хранения в месяц: <span className="font-semibold text-[#273655]">{costSummary.baseMonthly?.toLocaleString() ?? "—"} ₸</span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setShowOrderDetails(!showOrderDetails)}
                                className="text-sm text-[#31876D] hover:text-[#276b57] flex items-center gap-1 underline"
                              >
                                {showOrderDetails ? (
                                  <>
                                    Скрыть подробности
                                    <ChevronUp className="w-4 h-4" />
                                  </>
                                ) : (
                                  <>
                                    Показать полностью
                                    <ChevronDown className="w-4 h-4" />
                                  </>
                                )}
                              </button>
                            </div>

                            {/* Детали заказа */}
                            {showOrderDetails && (
                              <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                                {/* Доставка */}
                                {includeMoving && serviceSummary.breakdown.some(item => item.label.includes('Забор') || item.label.includes('Доставка')) && (
                                  <div>
                                    <div className="flex justify-between text-sm text-[#273655]">
                                      <span className="font-bold">Доставка</span>
                                      <span className="font-medium">
                                        {serviceSummary.breakdown
                                          .filter(item => item.label.includes('Забор') || item.label.includes('Доставка'))
                                          .reduce((sum, item) => sum + item.amount, 0)
                                          .toLocaleString()} ₸
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Дополнительные услуги */}
                                {includePacking && serviceSummary.breakdown.some(item => !item.label.includes('Забор') && !item.label.includes('Доставка')) && (
                                  <div>
                                    <h4 className="text-sm font-bold text-[#273655] mb-2">Дополнительные услуги</h4>
                                    <ul className="space-y-1 text-sm text-[#273655]">
                                      {services
                                        .filter(service => service?.service_id && service?.count && service.count > 0)
                                        .map((service, idx) => {
                                          const option = serviceOptions.find(item => String(item.id) === String(service.service_id));
                                          if (!option) return null;
                                          const unitPrice = option?.price ?? 0;
                                          const count = Number(service.count) || 1;
                                          const amount = unitPrice * count;
                                          const serviceName = option?.description || getServiceTypeName(option?.type) || "Услуга";
                                          
                                          return (
                                            <li key={idx} className="flex justify-between">
                                              <span>{serviceName} - {count} шт х {unitPrice.toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ₸</span>
                                              <span className="font-medium"> {amount.toLocaleString('ru-RU')} ₸</span>
                                            </li>
                                          );
                                        })}
                                    </ul>
                                    <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between text-sm font-semibold text-[#273655]">
                                      <span>Итого доп. услуги:</span>
                                      <span>
                                        {serviceSummary.breakdown
                                          .filter(item => !item.label.includes('Забор') && !item.label.includes('Доставка'))
                                          .reduce((sum, item) => sum + item.amount, 0)
                                          .toLocaleString('ru-RU')} ₸
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Размер бокса */}
                                {previewStorage && (
                                  <div className="flex justify-between text-sm text-[#273655]">
                                    <span>Размер бокса:</span>
                                    <span className="font-medium">{previewStorage.available_volume || previewStorage.volume || "—"} м²</span>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Промокод */}
                            <div className="mt-4 mb-3">
                              {!showPromoInput && !promoSuccess && (
                                <button
                                  type="button"
                                  onClick={() => setShowPromoInput(true)}
                                  className="text-sm text-[#31876D] hover:text-[#276b57] underline cursor-pointer"
                                >
                                  Промокод
                                </button>
                              )}
                              {(showPromoInput || promoSuccess) && (
                                <>
                                  <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-[#273655]">
                                      Промокод
                                    </label>
                                    {!promoSuccess && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setShowPromoInput(false);
                                          setPromoCodeInput("");
                                          setPromoError("");
                                        }}
                                        className="text-xs text-gray-500 hover:text-gray-700 underline"
                                      >
                                        Скрыть
                                      </button>
                                    )}
                                  </div>
                                  <div className="flex flex-col sm:flex-row gap-2">
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
                                        className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm whitespace-nowrap"
                                      >
                                        <X className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={handleApplyPromoCode}
                                        disabled={isValidatingPromo || !promoCodeInput.trim()}
                                        className="px-3 py-2 bg-[#31876D] text-white rounded-lg hover:bg-[#276b57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                                      >
                                        {isValidatingPromo ? (
                                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                        ) : (
                                          <>
                                            <span className="sm:hidden">Применить</span>
                                            <Check className="hidden sm:block w-4 h-4" />
                                          </>
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
                                </>
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
                      className="w-full bg-[#31876D] text-white font-semibold py-2.5 px-6 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmittingOrder ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
                    </button>
                    <button
                      onClick={handleCallbackRequestClick}
                      className="w-full bg-transparent border border-gray-300 text-[#616161] font-semibold py-2.5 px-6 rounded-3xl hover:bg-gray-100/50 transition-colors"
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
                        <path d="M12 8H4M4 8L8 4M4 8L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                        <path d="M4 8H12M12 8L8 4M12 8L8 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
                          ? 'bg-[#B0E4DD] ring-4 ring-[#31876D]/30' 
                          : 'bg-[#B0E4DD] hover:bg-[#9dd9d0]'
                      }`}
                    >
                      <div className="w-full h-32 md:h-40 mb-4 flex items-center justify-center">
                        <Box className="w-24 h-24 md:w-28 md:h-28 text-[#04A68E]" strokeWidth={1.5} />
                      </div>
                      <p className="text-[#393939] text-center text-sm md:text-base font-medium leading-tight">
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
                            <p className="text-[#B0E4DD] text-center text-sm md:text-base font-medium leading-tight">
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
                {/* Левая колонка - Габариты, Итог, Кнопка бронирования */}
                <div className="flex flex-col order-1 lg:order-1">
                  <h2 className="text-2xl font-bold text-[#202422] mb-6">
                    {selectedTariff?.isCustom 
                      ? 'Укажите габариты вещей' 
                      : selectedTariff 
                        ? 'Информация о тарифе' 
                        : 'Выберите тариф или укажите габариты'}
                  </h2>
                  
                  {/* Поля габаритов - белый фон, серая рамка */}
                  <div className="space-y-4 mb-6">
                    {selectedTariff?.isCustom ? (
                      <>
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
                              <SelectTrigger className="w-full min-w-[155px] h-auto min-h-[74px] text-base border border-gray-200 rounded-2xl bg-white flex flex-col items-start justify-center p-3 px-4 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500">
                                <span className="text-xs text-gray-500 mb-0.5">{dim.label}</span>
                                <SelectValue className="text-[#373737] text-base">{String(dim.value)} м</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                                  <SelectItem key={val} value={String(val)}>{val} м</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ))}
                        </div>
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
                          <SelectTrigger className="w-full h-auto min-h-[60px] text-base border border-gray-200 rounded-2xl bg-white flex flex-col items-start justify-center p-3 px-4 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500">
                            <span className="text-xs text-gray-500 mb-0.5">Длина</span>
                            <SelectValue className="text-[#373737] text-base">{String(cloudDimensions.length)} м</SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                              <SelectItem key={val} value={String(val)}>{val} м</SelectItem>
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
                  <div className="bg-white rounded-3xl px-6 py-6 mb-6 border-2 border-dashed border-gray-300">
                    <p className="text-sm text-[#555A65] mb-7">Рассчитанный объём: {cloudVolume.toFixed(2)} м³</p>
                    <div className="flex items-center justify-between mb-7">
                      <h3 className="text-xl font-bold text-[#04A68E]">ИТОГ</h3>
                      <span className="text-xl font-bold text-[#04A68E]">{cloudVolume.toFixed(2)} м³</span>
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
                      <div className="flex justify-between mt-4 mb-3">
                        <span className="text-[#04A68E]">За месяц</span>
                        <span className="font-medium text-[#04A68E]">{cloudPricePreview?.monthly?.toLocaleString() ?? "—"} ₸</span>
                      </div>

                      {/* Промокод для облачного хранения */}
                      <div className="mt-4 mb-4 pt-4 border-t border-gray-200">
                        {!showCloudPromoInput && !cloudPromoSuccess && (
                          <button
                            type="button"
                            onClick={() => setShowCloudPromoInput(true)}
                            className="text-sm text-[#31876D] hover:text-[#276b57] underline cursor-pointer"
                          >
                            Промокод
                          </button>
                        )}
                        {(showCloudPromoInput || cloudPromoSuccess) && (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-[#273655]">
                                Промокод
                              </label>
                              {!cloudPromoSuccess && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowCloudPromoInput(false);
                                    setCloudPromoCodeInput("");
                                    setCloudPromoError("");
                                  }}
                                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                                >
                                  Скрыть
                                </button>
                              )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
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
                                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm whitespace-nowrap"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleApplyCloudPromoCode}
                                  disabled={isValidatingCloudPromo || !cloudPromoCodeInput.trim()}
                                  className="px-3 py-2 bg-[#31876D] text-white rounded-lg hover:bg-[#276b57] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm whitespace-nowrap"
                                >
                                  {isValidatingCloudPromo ? (
                                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                                  ) : (
                                    <>
                                      <span className="sm:hidden">Применить</span>
                                      <Check className="hidden sm:block w-4 h-4" />
                                    </>
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
                          </>
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
                        <span className="text-xl font-bold text-[#04A68E]">За {cloudMonthsNumber} {cloudMonthsNumber === 1 ? 'месяц' : cloudMonthsNumber < 5 ? 'месяца' : 'месяцев'}</span>
                        <span className="text-xl font-bold text-[#04A68E]">
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

                  {/* Кнопка бронирования - в левой колонке */}
                  <button
                    onClick={handleCloudBookingClick}
                    disabled={!isCloudFormReady || isSubmittingOrder}
                    className="w-full bg-[#31876D] text-white font-semibold py-2.5 px-6 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingOrder ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
                  </button>
                </div>

                {/* Правая колонка - Дата, Срок аренды, Доп. услуги, Кнопка обратного звонка */}
                <div className="flex flex-col order-2 lg:order-2 lg:pt-14">
                  {/* Дата начала бронирования */}
                  <div className="mb-3">
                    <DatePicker
                      value={cloudBookingStartDate}
                      onChange={(value) => {
                        setCloudBookingStartDate(value);
                        setSubmitError(null);
                      }}
                      minDate={new Date().toISOString().split('T')[0]}
                      allowFutureDates={true}
                      placeholder="Дата начала бронирования"
                      className="[&>div]:bg-white [&>div]:border [&>div]:border-gray-200 [&>div]:rounded-2xl [&_input]:text-[#373737]"
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

                  {/* Дополнительные услуги */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#273655] mb-3">Дополнительные услуги</h3>
                    <p className="text-sm text-[#555A65] mb-4">
                      Мы сами забираем, упаковываем и возвращаем ваши вещи. Все услуги включены в тариф — вам нужно только указать адрес забора.
                    </p>
                    <p className="text-sm text-[#555A65] mb-4">Перевозка и упаковка включены в стоимость.</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-[#373737] mb-1">Дата забора вещей</label>
                        <DatePicker
                          value={cloudBookingStartDate}
                          onChange={(value) => { setCloudBookingStartDate(value); setSubmitError(null); }}
                          minDate={new Date().toISOString().split('T')[0]}
                          allowFutureDates={true}
                          placeholder="Дата забора вещей"
                          className="[&>div]:bg-gray-100 [&>div]:border-0 [&>div]:rounded-2xl [&_input]:text-[#373737]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#373737] mb-1">Адрес забора вещей</label>
                        <input
                          type="text"
                          value={cloudStreetFrom}
                          onChange={(e) => { setCloudStreetFrom(e.target.value); setSubmitError(null); }}
                          placeholder="Например: г. Алматы, Абая 25"
                          className="w-full h-[52px] rounded-2xl bg-gray-100 border-0 px-4 text-sm text-[#373737] placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Кнопка обратного звонка */}
                  <button
                    onClick={handleCallbackRequestClick}
                    className="w-full bg-white border border-gray-300 text-[#616161] font-semibold py-2.5 px-6 rounded-3xl hover:bg-gray-50 transition-colors"
                  >
                    Заказать обратный звонок
                  </button>
                </div>

                {/* Дубликат - скрыт, т.к. правая колонка (order-2) уже содержит весь контент */}
                <div className="hidden">
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
                  <div className="mb-6 w-full max-w-full bg-gradient-to-r from-[#26B3AB] to-[#104D4A] rounded-3xl p-4 sm:p-6 shadow-lg">
                    <div className="flex flex-col gap-2 w-full">
                      <label className="text-s text-white/90">Адрес откуда забрать вещи</label>
                      <input
                        type="text"
                        value={cloudStreetFrom}
                        onChange={(e) => {
                          setCloudStreetFrom(e.target.value);
                          setSubmitError(null);
                        }}
                        placeholder="Микрорайон или улица"
                        className="w-full h-[42px] rounded-3xl border border-white bg-gradient-to-r from-[#26B3AB] to-[#104D4A] px-3 text-sm text-white placeholder:text-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 min-w-0"
                      />
                    </div>
                  </div>
                  
                  {/* Кнопка бронирования - для десктопа */}
                  <button
                    onClick={handleCloudBookingClick}
                    disabled={!isCloudFormReady || isSubmittingOrder}
                    className="w-full bg-[#31876D] text-white font-semibold py-2.5 px-6 rounded-3xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                  >
                    {isSubmittingOrder ? "СОЗДАНИЕ ЗАКАЗА..." : "Забронировать бокс"}
                  </button>
                  
                  {/* Кнопка обратного звонка */}
                  <button
                    onClick={handleCallbackRequestClick}
                    className="w-full bg-transparent border border-gray-300 text-[#616161] font-semibold py-2.5 px-6 rounded-3xl hover:bg-gray-100/50 transition-colors"
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
      <div className="w-full bg-[#FFF] h-4 sm:h-8"></div>

      {/* Заказать обратный звонок */}
      <CallbackRequestSection showRegisterPrompt={!isAuthenticated} />

      {/* Шестой фрейм: филиалы Extra Space */}
      <section className="w-full bg-[#F7FAF9] pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-24 lg:pb-28">
        <div className="w-full px-4 sm:px-6 lg:px-8 mb-12 sm:mb-16 text-center">
          <h1 className="font-sf-pro-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#202422] mb-6 sm:mb-8">
            Филиалы
          </h1>
          <p className="text-sm sm:text-base text-[#555A65]">
            Выберите удобный филиал рядом с домом
          </p>
        </div>

        {/* Карта на всю ширину страницы */}
        <div className="w-full mb-12 sm:mb-16">
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
        onSelect={(sourceValue) => {
          saveLeadSource(sourceValue);
          const visitorId = getOrCreateVisitorId();
          if (visitorId) {
            trackVisit({ visitor_id: visitorId, lead_source: sourceValue }).then(() => {
              sessionStorage.setItem('extraspace_visit_sent', '1');
            }).catch(() => {});
          }
        }}
      />

      {/* Модалка предпросмотра платежей */}
      <PaymentPreviewModal
        isOpen={isPaymentPreviewOpen}
        onClose={handlePaymentPreviewClose}
        onConfirm={handlePaymentPreviewConfirm}
        storageType={paymentPreviewType || 'INDIVIDUAL'}
        monthsCount={
          paymentPreviewType === 'CLOUD'
            ? cloudMonthsNumber
            : monthsNumber
        }
        startDate={
          paymentPreviewType === 'CLOUD'
            ? cloudBookingStartDate
            : individualBookingStartDate
        }
        totalPrice={
          paymentPreviewType === 'CLOUD'
            ? (cloudPricePreview?.total || 0)
            : costSummary.baseTotal || 0
        }
        servicesTotal={
          paymentPreviewType === 'CLOUD'
            ? 0
            : serviceSummary.total || 0
        }
        discountAmount={
          paymentPreviewType === 'CLOUD'
            ? cloudPromoDiscount
            : promoDiscount
        }
        storageInfo={
          paymentPreviewType === 'CLOUD'
            ? {
                name: selectedTariff?.name || 'Облачное хранение',
                volume: selectedTariff?.type === 'CUSTOM' 
                  ? cloudVolumeDirect 
                  : (selectedTariff?.volume || cloudVolumeDirect),
              }
            : {
                name: previewStorage?.name || previewStorage?.display_name || `Бокс №${previewStorage?.id || ''}`,
                volume: previewStorage?.square || previewStorage?.area,
              }
        }
        isSubmitting={isSubmittingOrder}
      />

      {/* Анимированная бегущая строка с преимуществами перед футером */}
      <section className="w-full bg-[#FFF] pt-12 sm:pt-16 lg:pt-20 pb-6 overflow-hidden relative">
        <div className="flex animate-scroll">
          {/* Первый набор элементов */}
          <div className="flex items-center gap-8 sm:gap-24 md:gap-32 whitespace-nowrap flex-shrink-0">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Видеонаблюдение</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Бронирование онлайн</span>
            </div>
          </div>
          {/* Дублируем для бесконечной прокрутки */}
          <div className="flex items-center gap-8 sm:gap-24 md:gap-32 whitespace-nowrap flex-shrink-0 ml-8 sm:ml-24 md:ml-32">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Видеонаблюдение</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Бронирование онлайн</span>
            </div>
          </div>
          {/* Третий набор для более плавного перехода */}
          <div className="flex items-center gap-8 sm:gap-24 md:gap-32 whitespace-nowrap flex-shrink-0 ml-8 sm:ml-24 md:ml-32">
            <div className="flex items-center gap-3 text-gray-500">
              <Box size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Личные боксы 2 до 100 м²</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Moon size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Доступ 24/7</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Camera size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Доступ к видеонаблюдению</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Maximize size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Высота от 2м</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Thermometer size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Контроль температуры и влажности</span>
            </div>
            <div className="flex items-center gap-3 text-gray-500">
              <Wifi size={28} className="text-gray-500" strokeWidth={1.5} />
              <span className="text-lg sm:text-xl font-medium">Бронирование онлайн</span>
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
              animation: scroll 8s linear infinite;
            }
          }
        `}</style>
      </section>

      <div className="w-full bg-[#FFF] h-8 sm:h-16"></div>

      <Footer />
    </div>
  );
});

HomePage.displayName = "HomePage";

export default HomePage;
