import React, { useState, memo, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box, Moon, Camera, Wifi, Maximize, Thermometer
} from "lucide-react";


import {
  Tabs,
  TabsContent,
} from "../../components/ui";
import DatePicker from "../../shared/ui/DatePicker";
import { RentalPeriodSelect } from "../../shared/ui/RentalPeriodSelect";
import { getTodayLocalDateString } from "../../shared/lib/utils/date";

import { warehouseApi } from "../../shared/api/warehouseApi";
import { paymentsApi } from "../../shared/api/paymentsApi";
import { promoApi } from "../../shared/api/promoApi";
import { trackVisit } from "@/shared/api/visitsApi";


import { useAuth } from "../../shared/context/AuthContext";
import { validateUserProfile } from "../../shared/lib/validation/profileValidation";
import { getOrCreateVisitorId } from "@/shared/lib/utm";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  toastOrderRequestSent,
} from "../../shared/lib/toast";
import {getServiceTypeName} from "../../../src/pages/home/components/order/PackingServicesSection.jsx";
import {formatServiceDescription} from "@/shared/lib/utils/serviceNames";

import CallbackRequestModal from "@/shared/components/CallbackRequestModal.jsx";
import CallbackRequestSection from "@/shared/components/CallbackRequestSection.jsx";
import PaymentPreviewModal from "@/shared/components/PaymentPreviewModal.jsx";
import { LeadSourceModal, useLeadSource, shouldShowLeadSourceModal } from "@/shared/components/LeadSourceModal.jsx";


import { Header } from "../../widgets";
import Footer from "../../widgets/Footer";
import WarehouseSVGMap from "../../components/WarehouseSVGMap";
import HeroSection from "../../../src/pages/home/components/HeroSection.jsx";
import QuickBookingSection from "../../../src/pages/home/components/QuickBookingSection.jsx";
import StorageFormatsSection from "../../../src/pages/home/components/StorageFormatsSection.jsx";
import BranchesSection from "../../../src/pages/home/components/BranchesSection.jsx";
import WarehouseSchemePanel from "../../../src/pages/home/components/order/WarehouseSchemePanel.jsx";
import StorageWarnings from "../../../src/pages/home/components/order/StorageWarnings.jsx";
import MovingSection from "../../../src/pages/home/components/order/MovingSection.jsx";
import PackingServicesSection from "../../../src/pages/home/components/order/PackingServicesSection.jsx";
import IndividualStorageSummary from "../../../src/pages/home/components/order/IndividualStorageSummary.jsx";
import CloudTariffs from "../../../src/pages/home/components/order/CloudTariffs.jsx";
import CloudDimensions from "../../../src/pages/home/components/order/CloudDimensions.jsx";
import CloudStorageSummary from "../../../src/pages/home/components/order/CloudStorageSummary.jsx";


import extraspaceLogo from "../../assets/photo_5440760864748731559_y.jpg";


import TelegramIcon from "@/assets/lead-source-icons/telegram.webp";
import SiteIcon from "@/assets/lead-source-icons/site.webp";
import WhatsappIcon from "@/assets/lead-source-icons/whatsapp.webp";
import TwoGisIcon from "@/assets/lead-source-icons/2gis.webp";
import InstagramIcon from "@/assets/lead-source-icons/instagram.webp";
import TiktokIcon from "@/assets/lead-source-icons/tiktok.webp";
import AdsIcon from "@/assets/lead-source-icons/ads.webp";


import sumkaImg from "../../assets/cloud-tariffs/sumka.png";
import motorcycleImg from "../../assets/cloud-tariffs/motorcycle.png";
import bicycleImg from "../../assets/cloud-tariffs/bicycle.png";
import furnitureImg from "../../assets/cloud-tariffs/furniture.png";
import shinaImg from "../../assets/cloud-tariffs/shina.png";
import sunukImg from "../../assets/cloud-tariffs/sunuk.png";
import garazhImg from "../../assets/cloud-tariffs/garazh.png";
import skladImg from "../../assets/cloud-tariffs/sklad.png";


const HomePage = memo(() => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const isUserRole = user?.role === "USER";

  const [apiWarehouses, setApiWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [activeStorageTab, setActiveStorageTab] = useState("INDIVIDUAL");
  const tabsSectionRef = useRef(null);
  const [individualMonths, setIndividualMonths] = useState("1");
  const [individualBookingStartDate, setIndividualBookingStartDate] = useState(() => getTodayLocalDateString());
  const [cloudBookingStartDate, setCloudBookingStartDate] = useState(() => getTodayLocalDateString());
  const [includeMoving, setIncludeMoving] = useState(false);
  const [includePacking, setIncludePacking] = useState(false);
  const [cloudMonths, setCloudMonths] = useState("1");
  const [cloudDimensions, setCloudDimensions] = useState({ width: 1, height: 1, length: 1 });
  const [cloudVolumeDirect, setCloudVolumeDirect] = useState(1); // Прямой ввод объема для тарифов
  const [movingStreetFrom, setMovingStreetFrom] = useState("");
  const [movingHouseFrom, setMovingHouseFrom] = useState("");
  const [movingFloorFrom, setMovingFloorFrom] = useState("");
  const [movingApartmentFrom, setMovingApartmentFrom] = useState("");
  const [movingPickupDate, setMovingPickupDate] = useState(() => getTodayLocalDateString());
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
  const [previewStorage, setPreviewStorage] = useState(null);
  const [pricePreview, setPricePreview] = useState(null);
  const [isPriceCalculating, setIsPriceCalculating] = useState(false);
  const [cloudPricePreview, setCloudPricePreview] = useState(null);
  // Состояние для информации о бронировании занятого бокса
  const [bookingInfo, setBookingInfo] = useState(null);
  const [isLoadingBookingInfo, setIsLoadingBookingInfo] = useState(false);
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
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackModalContext, setCallbackModalContext] = useState('callback');
  const [isLeadSourceModalOpen, setIsLeadSourceModalOpen] = useState(false);
  const { saveLeadSource } = useLeadSource();
  // Состояние для модалки предпросмотра платежей
  const [isPaymentPreviewOpen, setIsPaymentPreviewOpen] = useState(false);
  const [paymentPreviewType, setPaymentPreviewType] = useState(null); // 'INDIVIDUAL' или 'CLOUD'
  // Состояние для цен услуг (для расчета процента скидки)
  // Состояние для карусели тарифов
  const [currentTariffIndex, setCurrentTariffIndex] = useState(0);
  const [tariffsPerView, setTariffsPerView] = useState(4);
  const [selectedTariff, setSelectedTariff] = useState(null);
  // Состояние для цены доставки
  const [gazelleFromPrice, setGazelleFromPrice] = useState(null);
  // Состояние для цен тарифов облачного хранения из API
  const [tariffPrices, setTariffPrices] = useState({});
  // Состояние для цен кастомного тарифа (CLOUD_M3 — одна цена за м³)
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
          "M2",
          "CLOUD_M3",
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
        // Проверяем, была ли добавлена услуга GAZELLE_TO
        if (value && serviceOptions.length > 0) {
          const selectedOption = serviceOptions.find(opt => String(opt.id) === String(value));
          if (selectedOption && selectedOption.type === "GAZELLE_TO") {
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
                return prev;
              }
              
              const newOrder = {
                moving_date: returnDate.toISOString(),
                status: "PENDING",
                direction: "TO_CLIENT",
                address: movingAddressTo || getMovingAddressFrom || "",
              };
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
  }, [serviceOptions]);

  const cloudMonthsNumber = useMemo(() => {
    const parsed = parseInt(cloudMonths, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [cloudMonths]);

  const serviceSummary = useMemo(() => {
    const breakdown = [];
    let total = 0;

    if (includeMoving && gazelleService && gazelleFromPrice !== null) {
      // Для индивидуального хранения: только GAZELLE_FROM (доставка)
      total += gazelleFromPrice;
      breakdown.push({
        label: "Доставка (с клиента на склад)",
        amount: gazelleFromPrice,
      });
    }

    if (includePacking) {
      services.forEach((service) => {
        if (!service?.service_id || !service?.count || service.count <= 0) {
          return;
        }
        const option = serviceOptions.find((item) => String(item.id) === String(service.service_id));
        const unitPrice = option?.price ?? 0;
        const count = Number(service.count) || 1;
        const amount = unitPrice * count;
        total += amount;
        const serviceName = formatServiceDescription(option?.description) || getServiceTypeName(option?.type) || "Услуга";
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

  useMemo(() => {
    // Для индивидуального хранения: только GAZELLE_FROM (доставка)
    if (gazelleFromPrice !== null) {
      return gazelleFromPrice;
    }
    // Fallback на дефолтные значения, если цены еще не загружены
    return 14000;
  }, [gazelleFromPrice]);

  const costSummary = useMemo(() => {
    const baseMonthly = pricePreview?.monthly ? Math.round(pricePreview.monthly) : null;
    const baseTotal = pricePreview ? Math.round(pricePreview.total) : null;
    const serviceTotal = serviceSummary.total;
    // combinedTotal включает аренду + услуги
    const combinedTotal = (baseTotal || 0) + serviceTotal;

    return {
      baseMonthly,
      baseTotal,
      serviceTotal,
      combinedTotal,
      pricingBreakdown: pricePreview?.pricingBreakdown || null,
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
  // Цена для кастомного тарифа загружается из API (CLOUD_M3)
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
    // Используем переданную дату доставки или текущую дату
    const pickupDate = pickupDateString 
      ? new Date(pickupDateString)
      : new Date();
    
    // Устанавливаем время на начало дня для даты доставки
    pickupDate.setHours(10, 0, 0, 0); // 10:00 утра для доставки

    // Возвращаем доставку (PENDING с direction TO_WAREHOUSE)
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
        let errorMessage = profileValidation.message;
        
        // Если проблема только в верификации телефона
        if (profileValidation.phoneNotVerified && 
            profileValidation.missingFields.length === 0 && 
            profileValidation.invalidFields.length === 0) {
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
      return;
    }

    if (!monthsNumber || monthsNumber <= 0) {
      return;
    }

    if (includeMoving && !movingStreetFrom.trim()) {
      return;
    }

    if (includePacking && packagingServicesForOrder.length === 0) {
      return;
    }

    const storageId = Number(previewStorage.id ?? previewStorage.storage_id);
    if (!Number.isFinite(storageId) || storageId <= 0) {
      return;
    }

    try {
      setIsSubmittingOrder(true);

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
        // Ищем GAZELLE_FROM (доставка)
        const gazelleFromOption =
          gazelleService ||
          availableOptions?.find((option) => option.type === "GAZELLE_FROM");
        const gazelleFromId =
          gazelleFromOption?.id ?? gazelleFromOption?.service_id ?? gazelleFromOption ?? null;

        if (!gazelleFromId || !Number.isFinite(Number(gazelleFromId))) {
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
        return service && service.type === "GAZELLE_TO";
      });

      // Создаем moving_orders
      const allMovingOrders = [];
      
      if (includeMoving) {
        // Добавляем доставку (PENDING с direction TO_WAREHOUSE)
        const pickupOrder = buildMovingOrders(trimmedAddress, monthsNumber, movingPickupDate)[0];
        allMovingOrders.push(pickupOrder);
      }
      
      // Добавляем возврат вещей, если есть GAZELLE_TO в услугах
      if (hasGazelleTo) {
        const returnOrder = movingOrders.find(order => order.status === "PENDING" && order.direction === "TO_CLIENT");
        if (returnOrder) {
          allMovingOrders.push({
            moving_date: returnOrder.moving_date,
            status: "PENDING",
            direction: "TO_CLIENT",
            address: returnOrder.address || movingAddressTo.trim() || (includeMoving ? trimmedAddress : ""),
          });
        } else {
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
      
      // Добавляем moving_orders только если они есть
      if (allMovingOrders.length > 0) {
        orderData.moving_orders = allMovingOrders;
        // Если есть moving_orders, устанавливаем is_selected_moving в true
        orderData.is_selected_moving = true;
      }

      if (finalServices.length > 0) {
        orderData.services = finalServices;
      }

      await warehouseApi.createOrder(orderData);

      // Закрываем модалку предпросмотра платежей
      setIsPaymentPreviewOpen(false);
      setPaymentPreviewType(null);

      // Обновляем кэш заказов и переходим на thank-you страницу
      toastOrderRequestSent();

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
        setIsSubmittingOrder(false);
        return;
      }

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
        let errorMessage = profileValidation.message;
        
        // Если проблема только в верификации телефона
        if (profileValidation.phoneNotVerified && 
            profileValidation.missingFields.length === 0 && 
            profileValidation.invalidFields.length === 0) {
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
      return;
    }

    if (!cloudMonthsNumber || cloudMonthsNumber <= 0) {
      return;
    }

    if (!selectedTariff) {
      return;
    }

    if (!cloudStreetFrom.trim()) {
      return;
    }

    try {
      setIsSubmittingOrder(true);

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

      // Добавляем услугу "Газель - Доставка" для перевозки (только GAZELLE_FROM)
      if (hasGazelleForCloud) {
        orderData.services = [
          {
            service_id: Number(gazelleFromId),
            count: 1, // только доставка
          },
        ];
      }

      await warehouseApi.createOrder(orderData);

      // Закрываем модалку предпросмотра платежей
      setIsPaymentPreviewOpen(false);
      setPaymentPreviewType(null);

      toastOrderRequestSent();

      // Обновляем кэш заказов и переходим на thank-you страницу
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
        setIsSubmittingOrder(false);
        return;
      }

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

  const scrollToCallbackSection = useCallback(() => {
    document.getElementById('callback-request-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCallbackRequestClick = useCallback(() => {
    scrollToCallbackSection();
  }, [scrollToCallbackSection]);

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
      return;
    }

    if (!cloudMonthsNumber || cloudMonthsNumber <= 0) {
      setCloudPricePreview(null);
      return;
    }

    if (!cloudVolume || cloudVolume <= 0) {
      setCloudPricePreview(null);
      return;
    }

    // Если выбран тариф (не "Свои габариты"), требуется selectedTariff
    if (selectedTariff && !selectedTariff.isCustom) {

      // Для тарифов с basePrice используем basePrice, для остальных - pricePerM3 из API
      // Оба значения уже содержат финальную статичную цену тарифа
      const monthlyPrice = selectedTariff.basePrice || selectedTariff.pricePerM3 || 0;
      const totalPrice = Math.round(monthlyPrice * cloudMonthsNumber);

      setCloudPricePreview({
        total: totalPrice,
        monthly: monthlyPrice,
        isFallback: false,
      });

    } else if (selectedTariff?.isCustom) {

      // Одна цена за м³ (CLOUD_M3)
      const pricePerM3 = cloudCustomPrices.low ?? cloudCustomPrices.high ?? 9500;
      
      const monthlyPrice = Math.round(pricePerM3 * cloudVolume);
      const totalPrice = Math.round(monthlyPrice * cloudMonthsNumber);

      setCloudPricePreview({
        total: totalPrice,
        monthly: monthlyPrice,
        isFallback: false,
      });

    } else {
      // Если тариф не выбран, не показываем цену
      setCloudPricePreview(null);
    }
  }, [activeStorageTab, cloudMonthsNumber, selectedTariff, cloudVolume, cloudCustomPrices]);

  // Загрузка складов с API
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const data = await warehouseApi.getAllWarehouses();
        setApiWarehouses(Array.isArray(data) ? data : []);

        // Устанавливаем первый склад INDIVIDUAL как выбранный по умолчанию
        if (data && data.length > 0) {
          const firstIndividual = data.find((item) => item.type === "INDIVIDUAL");
          setSelectedWarehouse(firstIndividual || data[0]);
        }

      } catch (error) {
        console.error("Ошибка при загрузке складов:", error);
        setSelectedWarehouse(warehouses[0]);
      }
    };

    fetchWarehouses();
  }, [warehouses]);

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
      } catch (error) {
        console.error('Ошибка при загрузке цен услуг для расчета скидки:', error);
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
        let cloudM3Price = null;
        
        pricesData.forEach(price => {
          if (tariffTypes.includes(price.type)) {
            pricesMap[price.type] = parseFloat(price.price);
          }
          if (price.type === 'CLOUD_M3') {
            cloudM3Price = parseFloat(price.price);
          }
        });
        
        setTariffPrices(pricesMap);
        setCloudCustomPrices({ low: cloudM3Price, high: cloudM3Price });
      } catch (error) {
        console.error('Ошибка при загрузке цен тарифов облачного хранения:', error);
        // Используем дефолтные значения при ошибке
        setTariffPrices({});
        setCloudCustomPrices({ low: null, high: null });
      }
    };

    loadTariffPrices();
  }, []);

  useEffect(() => {
    if (selectedWarehouse?.name === "Жилой комплекс «Комфорт Сити»") {
      setPreviewStorage(null);
    }
  }, [komfortSelectedMap, megaSelectedMap, selectedWarehouse]);

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
        name: getServiceTypeName(gazelleFrom.type) || gazelleFrom.description || "Газель - Доставка",
        price: gazelleFrom.price,
      });
    } else {
      setGazelleService(null);
    }
  }, [includeMoving, serviceOptions, ensureServiceOptions]);

  useEffect(() => {
    let isCancelled = false;

    const calculatePrice = async () => {
      if (activeStorageTab !== "INDIVIDUAL") {
        setPricePreview(null);
        return;
      }

      if (!selectedWarehouse || selectedWarehouse?.type === "CLOUD") {
        setPricePreview(null);
        return;
      }

      if (!previewStorage) {
        setPricePreview(null);
        return;
      }

      if (!monthsNumber || monthsNumber <= 0) {
        setPricePreview(null);
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
        return;
      }

      setIsPriceCalculating(true);

      try {
        const payload = {
          storageType: "INDIVIDUAL",
          months: monthsNumber,
          area: rawArea,
          services: [],
          warehouse_id: selectedWarehouse.id,
          storage_id: previewStorage?.id,
          // Добавляем tier из выбранного бокса, если есть
          ...(previewStorage?.tier !== undefined && previewStorage?.tier !== null && { tier: previewStorage.tier }),
        };

        const response = await warehouseApi.calculateBulkPrice(payload);

        if (isCancelled) return;

        const storagePrice = response?.storage?.price;

        if (typeof storagePrice === "number" && !Number.isNaN(storagePrice) && storagePrice > 0) {
          const pricingBreakdown = response?.storage?.pricingBreakdown;
          setPricePreview({
            total: storagePrice,
            monthly: pricingBreakdown ? null : storagePrice / monthsNumber,
            pricingBreakdown: pricingBreakdown || null,
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
        } else {
          setPricePreview(null);
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
      </div>
    );
  };

  const dropdownItems = useMemo(() => {
    const source = Array.isArray(apiWarehouses) && apiWarehouses.length > 0 ? apiWarehouses : warehouses;
    const list = Array.isArray(source) ? source : [];
    return list.filter((item) => item && item.type !== "CLOUD");
  }, [apiWarehouses, warehouses]);

  useEffect(() => {
    if (!Array.isArray(dropdownItems) || dropdownItems.length === 0) return;
    if (!selectedWarehouse || selectedWarehouse.type === "CLOUD") {
      const first = dropdownItems[0];
      if (!selectedWarehouse || selectedWarehouse?.id !== first?.id) {
        setSelectedWarehouse(first);
      }
    }
  }, [dropdownItems, selectedWarehouse, setSelectedWarehouse]);

  return (
    <div className="font-['Montserrat'] min-h-screen bg-white flex flex-col">
      <Header />

      {/* Первая секция: Храните там, где удобно */}
      < HeroSection handleHeroBookingClick={handleHeroBookingClick} />

      {/* Секция: Быстрое бронирование */}
      < QuickBookingSection />

      {/* Секция: Хранение в городе */}
      <section ref={tabsSectionRef} className="w-full bg-[#FFF] py-6 sm:py-8">
        <div className="container mx-auto px-2 sm:px-2 lg:px-3 xl:px-3 max-w-7xl">
          {/* Заголовок */}
          <h2 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-bold mb-6">
            хранение в городе
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
                <WarehouseSchemePanel
                    dropdownItems={dropdownItems}
                    selectedWarehouse={selectedWarehouse}
                    setSelectedWarehouse={setSelectedWarehouse}
                    mapRef={mapRef}
                    renderWarehouseScheme={renderWarehouseScheme}
                />

                {/* Правая панель - Форма конфигурации */}
                <div className="bg-[#F7FAF9] rounded-3xl p-6 shadow-lg min-h-[450px] flex flex-col">
                  <h2 className="font-soyuz-grotesk text-2xl sm:text-3xl font-bold text-[#202422] mb-6">
                    Настройте хранение
                  </h2>
                  
                  {/* Предупреждение для Яруса 2 Mega Tower Almaty */}
                  <StorageWarnings
                      selectedWarehouse={selectedWarehouse}
                      megaSelectedMap={megaSelectedMap}
                      komfortSelectedMap={komfortSelectedMap}
                  />
                  
                  {/* Срок аренды */}
                  <div className="mb-6">
                    <RentalPeriodSelect
                      value={individualMonths}
                      onChange={(value) => {
                        setIndividualMonths(value);
                      }}
                      label="Срок аренды (месяцы):"
                      variant="individual-home"
                      triggerClassName="bg-transparent"
                    />
                  </div>
                  
                  {/* Перевозка вещей */}
                  <MovingSection
                      includeMoving={includeMoving}
                      setIncludeMoving={setIncludeMoving}
                      previewStorage={previewStorage}
                      movingPickupDate={movingPickupDate}
                      setMovingPickupDate={setMovingPickupDate}
                      movingStreetFrom={movingStreetFrom}
                      setMovingStreetFrom={setMovingStreetFrom}
                      movingHouseFrom={movingHouseFrom}
                      setMovingHouseFrom={setMovingHouseFrom}
                      movingFloorFrom={movingFloorFrom}
                      setMovingFloorFrom={setMovingFloorFrom}
                      movingApartmentFrom={movingApartmentFrom}
                      setMovingApartmentFrom={setMovingApartmentFrom}
                      ensureServiceOptions={ensureServiceOptions}
                  />

                  <PackingServicesSection
                      includePacking={includePacking}
                      setIncludePacking={setIncludePacking}
                      previewStorage={previewStorage}
                      isServicesLoading={isServicesLoading}
                      servicesError={servicesError}
                      services={services}
                      serviceOptions={serviceOptions}
                      ensureServiceOptions={ensureServiceOptions}
                      updateServiceRow={updateServiceRow}
                      removeServiceRow={removeServiceRow}
                      addServiceRow={addServiceRow}
                      movingAddressTo={movingAddressTo}
                      setMovingAddressTo={setMovingAddressTo}
                      movingOrders={movingOrders}
                      setMovingOrders={setMovingOrders}
                  />
                  
                  {/* Итог */}
                  <IndividualStorageSummary
                      // обязательные / ключевые пропсы
                      previewStorage={previewStorage}
                      bookingInfo={bookingInfo}
                      isLoadingBookingInfo={isLoadingBookingInfo}
                      costSummary={costSummary}
                      finalIndividualTotal={finalIndividualTotal}
                      isPriceCalculating={isPriceCalculating}
                      monthsNumber={monthsNumber}

                      // промокод
                      promoSuccess={promoSuccess}
                      promoDiscount={promoDiscount}
                      promoDiscountPercent={promoDiscountPercent}
                      promoCode={promoCode}
                      promoError={promoError}
                      promoCodeInput={promoCodeInput}
                      isValidatingPromo={isValidatingPromo}
                      showPromoInput={showPromoInput}
                      showOrderDetails={showOrderDetails}

                      // услуги и доставка
                      includeMoving={includeMoving}
                      includePacking={includePacking}
                      services={services}
                      serviceOptions={serviceOptions}
                      serviceSummary={serviceSummary}

                      // сеттеры состояний
                      setShowOrderDetails={setShowOrderDetails}
                      setShowPromoInput={setShowPromoInput}
                      setPromoCodeInput={setPromoCodeInput}
                      setPromoError={setPromoError}

                      // обработчики
                      handleApplyPromoCode={handleApplyPromoCode}
                      handleRemovePromoCode={handleRemovePromoCode}
                  />
                  
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
                      заказать обратный звонок
                    </button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="CLOUD" className="mt-8">
              {/* Секция Тарифы */}
              <CloudTariffs
                  customTariff={customTariff}
                  regularTariffs={regularTariffs}
                  selectedTariff={selectedTariff}
                  setSelectedTariff={setSelectedTariff}
                  tariffsPerView={tariffsPerView}
                  currentTariffIndex={currentTariffIndex}
                  maxTariffIndex={maxTariffIndex}
                  handleTariffPrev={handleTariffPrev}
                  handleTariffNext={handleTariffNext}
                  setCloudDimensions={setCloudDimensions}
                  setCloudVolumeDirect={setCloudVolumeDirect}
              />

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
                  <CloudDimensions
                      selectedTariff={selectedTariff}
                      cloudDimensions={cloudDimensions}
                      setCloudDimensions={setCloudDimensions}
                      cloudVolumeDirect={cloudVolumeDirect}
                  />

                  {/* Блок ИТОГ */}
                  <CloudStorageSummary
                      selectedTariff={selectedTariff}
                      cloudDimensions={cloudDimensions}
                      cloudVolume={cloudVolume}
                      cloudPricePreview={cloudPricePreview}
                      finalCloudTotal={finalCloudTotal}
                      cloudMonthsNumber={cloudMonthsNumber}
                      showCloudPromoInput={showCloudPromoInput}
                      cloudPromoSuccess={cloudPromoSuccess}
                      cloudPromoDiscount={cloudPromoDiscount}
                      cloudPromoDiscountPercent={cloudPromoDiscountPercent}
                      cloudPromoCode={cloudPromoCode}
                      cloudPromoCodeInput={cloudPromoCodeInput}
                      cloudPromoError={cloudPromoError}
                      isValidatingCloudPromo={isValidatingCloudPromo}
                      setShowCloudPromoInput={setShowCloudPromoInput}
                      setCloudPromoCodeInput={setCloudPromoCodeInput}
                      setCloudPromoError={setCloudPromoError}
                      handleApplyCloudPromoCode={handleApplyCloudPromoCode}
                      handleRemoveCloudPromoCode={handleRemoveCloudPromoCode}
                  />

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
                      }}
                      minDate={getTodayLocalDateString()}
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
                      Мы сами забираем, упаковываем и возвращаем ваши вещи. Все услуги включены в тариф — вам нужно только указать адрес доставки.
                    </p>
                    <p className="text-sm text-[#555A65] mb-4">Перевозка и упаковка включены в стоимость.</p>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-[#373737] mb-1">Дата доставки</label>
                        <DatePicker
                          value={cloudBookingStartDate}
                          onChange={(value) => { setCloudBookingStartDate(value); }}
                          minDate={getTodayLocalDateString()}
                          allowFutureDates={true}
                          placeholder="Дата доставки"
                          className="[&>div]:bg-gray-100 [&>div]:border-0 [&>div]:rounded-2xl [&_input]:text-[#373737]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-[#373737] mb-1">Адрес доставки</label>
                      <input
                        type="text"
                        value={cloudStreetFrom}
                          onChange={(e) => { setCloudStreetFrom(e.target.value); }}
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
                      }}
                      minDate={getTodayLocalDateString()}
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

      {/* Отступ с фоном хэдера */}
      <div className="w-full bg-[#FFF] h-4 sm:h-8"></div>

      {/* Секция: Форматы хранения */}
      <StorageFormatsSection onMore={scrollToCallbackSection} />

      {/* Отступ с фоном хэдера */}
      <div className="w-full bg-[#FFF] h-4 sm:h-8"></div>

      {/* Заказать обратный звонок */}
      <CallbackRequestSection showRegisterPrompt={!isAuthenticated} />

      {/* Шестой фрейм: филиалы Extra Space */}
      <BranchesSection warehouses={warehouses} />

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
        pricingBreakdown={
          paymentPreviewType === 'CLOUD'
            ? null
            : costSummary.pricingBreakdown || null
        }
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
