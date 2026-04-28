import React, { useState, memo, useMemo, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Moon,
  Camera,
  Wifi,
  Maximize,
  Thermometer,
  User,
  ArrowLeft,
} from "lucide-react";


import {
  Tabs,
  TabsContent,
} from "../../components/ui";
import DatePicker from "../../shared/ui/DatePicker";
import { RentalPeriodSelect } from "../../shared/ui/RentalPeriodSelect";
import { getTodayLocalDateString } from "../../shared/lib/utils/date";

import { warehouseApi } from "../../shared/api/warehouseApi";
import { ordersApi } from "../../shared/api/ordersApi";
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

import CallbackRequestModal, { WHATSAPP_LINK } from "@/shared/components/CallbackRequestModal.jsx";
import CallbackRequestSection from "@/shared/components/CallbackRequestSection.jsx";
import ClientSelector from "@/shared/components/ClientSelector.jsx";
import PaymentPreviewModal from "@/shared/components/PaymentPreviewModal.jsx";
import BoxVisualModal from "@/shared/components/BoxVisualModal.jsx";
import PendingOrderModal from "@/pages/personal-account/ui/PendingOrderModal.jsx";
import OrderDetailView from "@/pages/personal-account/ui/OrderDetailView.jsx";
import { useApproveCancelOrder, useUnlockStorage } from "@/shared/lib/hooks/use-orders";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadSourceModal, useLeadSource, shouldShowLeadSourceModal } from "@/shared/components/LeadSourceModal.jsx";


import { Header } from "../../widgets";
import Footer from "../../widgets/Footer";
import WarehouseSVGMap from "../../components/WarehouseSVGMap";
import HeroSection from "../../../src/pages/home/components/HeroSection.jsx";
import QuickBookingSection from "../../../src/pages/home/components/QuickBookingSection.jsx";
import StorageFormatsSection from "../../../src/pages/home/components/StorageFormatsSection.jsx";
import BranchesSection from "../../../src/pages/home/components/BranchesSection.jsx";
import WarehouseGallery from "../../../src/pages/home/components/WarehouseGallery.jsx";
import WarehouseSchemePanel from "../../../src/pages/home/components/order/WarehouseSchemePanel.jsx";
import StorageWarnings from "../../../src/pages/home/components/order/StorageWarnings.jsx";
import MovingSection from "../../../src/pages/home/components/order/MovingSection.jsx";
import PackingServicesSection from "../../../src/pages/home/components/order/PackingServicesSection.jsx";
import IndividualStorageSummary from "../../../src/pages/home/components/order/IndividualStorageSummary.jsx";
import CloudTariffs from "../../../src/pages/home/components/order/CloudTariffs.jsx";
import CloudDimensions from "../../../src/pages/home/components/order/CloudDimensions.jsx";
import CloudStorageSummary from "../../../src/pages/home/components/order/CloudStorageSummary.jsx";
import StorageLockersSection from "../../../src/pages/home/components/storage-lockers/StorageLockersSection.jsx";


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

/** Неоновая обводка карты склада */
const HOME_INDIVIDUAL_NEON_BOX_SHADOW = [
  "0 0 0 2px #ffffff",
  "0 0 0 4px #5eead4",
  "0 0 0 8px rgba(45, 212, 191, 0.95)",
  "0 0 0 12px rgba(6, 182, 212, 0.55)",
  "0 0 28px 4px rgba(34, 211, 238, 0.9)",
  "0 0 52px 12px rgba(103, 232, 249, 0.65)",
  "0 0 88px 20px rgba(165, 243, 252, 0.45)",
].join(", ");

/** Тот же стиль неона, но компактнее — срок аренды и доставка/доп. услуги */
const HOME_INDIVIDUAL_NEON_BOX_SHADOW_FORM = [
  "0 0 0 2px #ffffff",
  "0 0 0 3px #5eead4",
  "0 0 0 6px rgba(45, 212, 191, 0.88)",
  "0 0 0 9px rgba(6, 182, 212, 0.42)",
  "0 0 16px 2px rgba(34, 211, 238, 0.72)",
  "0 0 32px 8px rgba(103, 232, 249, 0.48)",
  "0 0 48px 12px rgba(165, 243, 252, 0.28)",
].join(", ");

/** Секция «Хранение в городе»: тип → описание → бронирование */
const CITY_STORAGE_PHASE = Object.freeze({
  PICK: "pick",
  ABOUT: "about",
  BOOKING: "booking",
});

const CITY_STORAGE_SHORT_LABEL = {
  INDIVIDUAL: "Индивидуальное",
  LOCKERS: "Камера",
  CLOUD: "Облако",
};

const STORAGE_ABOUT_COPY = {
  INDIVIDUAL: {
    title: "Индивидуальное хранение",
    teaser:
      "Отдельный бокс только под ваши вещи - помесячная оплата и доступ к своему хранению.",
    bullets: [
      "Арендуйте отдельный бокс только под свои вещи.",
      "Удобный вариант для тех, кому нужно личное пространство с помесячной оплатой и доступом к своему хранению.",
    ],
  },
  LOCKERS: {
    title: "Камера хранения",
    teaser:
      "Чемодан, сумки и небольшие вещи на короткий срок - для поездок, переездов и на несколько дней до двух недель.",
    bullets: [
      "Оставьте чемодан, сумки или другие небольшие вещи на короткий срок.",
      "Идеально для поездок, переездов и временного хранения - от нескольких дней до двух недель.",
    ],
  },
  CLOUD: {
    title: "Облачное хранение",
    teaser:
      "Без аренды отдельного бокса - платите только за нужный объём хранения помесячно.",
    bullets: [
      "Сдайте вещи на хранение без аренды отдельного бокса.",
      "Подходит для коробок, сезонных вещей и имущества разного объёма - вы оплачиваете только нужный вам объём хранения помесячно.",
    ],
  },
};

const CITY_STORAGE_EASE = [0.22, 1, 0.36, 1];

const HomePage = memo(() => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const isUserRole = user?.role === "USER";
  const isAdminOrManager = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [selectedClientUser, setSelectedClientUser] = useState(null);
  const [isClientSelectorOpen, setIsClientSelectorOpen] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [isPendingOrderModalOpen, setIsPendingOrderModalOpen] = useState(false);
  const [orderForReturnApproval, setOrderForReturnApproval] = useState(null);
  const [isReturnApprovalModalOpen, setIsReturnApprovalModalOpen] = useState(false);
  const [isLoadingPendingOrder, setIsLoadingPendingOrder] = useState(false);
  const [isUnbooking, setIsUnbooking] = useState(false);

  const [apiWarehouses, setApiWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  /** INDIVIDUAL | LOCKERS | CLOUD — после выбора типа на главной */
  const [activeStorageTab, setActiveStorageTab] = useState(null);
  /** pick: три карточки → about: описание и «Выбрать» → booking: карта и формы */
  const [cityStoragePhase, setCityStoragePhase] = useState(CITY_STORAGE_PHASE.PICK);
  const tabsSectionRef = useRef(null);
  const promoMapSectionRef = useRef(null);
  const promoRentalSectionRef = useRef(null);
  const promoMovingSectionRef = useRef(null);
  const promoPackingSectionRef = useRef(null);
  const promoBookButtonRef = useRef(null);
  const individualGuideHighlightClearRef = useRef(null);
  const [galleryBookingFocusToken, setGalleryBookingFocusToken] = useState(0);
  const [individualGuideHighlight, setIndividualGuideHighlight] = useState(null);
  const [individualMonths, setIndividualMonths] = useState("1");
  /** После выбора срока в селекте — показываем неон на доставке и доп. услугах */
  const [individualRentalPeriodAcknowledged, setIndividualRentalPeriodAcknowledged] = useState(false);
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
  const [isBoxVisualModalOpen, setIsBoxVisualModalOpen] = useState(false);
  const [boxVisualStorage, setBoxVisualStorage] = useState(null);
  const [komfortSelectedMap, setKomfortSelectedMap] = useState(1);
  const [megaSelectedMap, setMegaSelectedMap] = useState(1);
  const [highlightedBoxes, setHighlightedBoxes] = useState([]);
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
  const [isPromoBookingModalOpen, setIsPromoBookingModalOpen] = useState(false);
  const [promoGuidedBooking, setPromoGuidedBooking] = useState(false);
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
        // ЖК Есентай убран с бронирования
        // {
        //   id: 1,
        //   name: "Есентай, жилой комплекс",
        //   address: "Касымова улица, 32",
        //   phone: "+7 727 123 4567",
        //   workingHours: "Круглосуточно",
        //   type: "INDIVIDUAL",
        //   storage: [],
        //   coordinates: [76.930495, 43.225893],
        //   available: true,
        //   image: extraspaceLogo,
        // },
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

  /** Данные брони для импорта офлайн-заказа (вкладка «Офлайн-импорт» в ClientSelector) */
  const buildLegacyImportOrderPayload = useCallback(() => {
    if (activeStorageTab !== "INDIVIDUAL") return null;
    if (!selectedWarehouse || !previewStorage) return null;
    if (!monthsNumber || monthsNumber <= 0) return null;
    const storageId = Number(previewStorage.id ?? previewStorage.storage_id);
    if (!Number.isFinite(storageId) || storageId <= 0) return null;
    // start_date/total_price для офлайн-импорта задаются в ClientSelector (дата якоря графика и сумма платежей)
    const startDate = individualBookingStartDate
      ? new Date(individualBookingStartDate).toISOString()
      : new Date().toISOString();
    return {
      storage_id: storageId,
      months: monthsNumber,
      start_date: startDate,
      order_items: [{ name: "Вещь", volume: 1, cargo_mark: "NO" }],
      is_selected_moving: false,
      is_selected_package: false,
    };
  }, [
    activeStorageTab,
    selectedWarehouse,
    previewStorage,
    monthsNumber,
    individualBookingStartDate,
  ]);

  /** Подпись к брони для модалки офлайн-импорта: склад, бокс, адрес, срок */
  const buildLegacyImportBookingSummary = useCallback(() => {
    if (activeStorageTab !== "INDIVIDUAL") return null;
    if (!selectedWarehouse || !previewStorage) return null;
    if (!monthsNumber || monthsNumber <= 0) return null;
    const storageId = Number(previewStorage.id ?? previewStorage.storage_id);
    if (!Number.isFinite(storageId) || storageId <= 0) return null;
    const startRaw = individualBookingStartDate || getTodayLocalDateString();
    return {
      warehouseName: selectedWarehouse.name || "—",
      warehouseAddress:
        selectedWarehouse.address ||
        selectedWarehouse.warehouse_address ||
        selectedWarehouse.full_address ||
        "",
      storageLabel:
        previewStorage.name ||
        previewStorage.display_name ||
        `Бокс №${storageId}`,
      storageId,
      months: monthsNumber,
      startDate: startRaw,
    };
  }, [
    activeStorageTab,
    selectedWarehouse,
    previewStorage,
    monthsNumber,
    individualBookingStartDate,
  ]);

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

  /** Обязательные условия для брони: срок + свободный бокс (доставка и доп. услуги — по желанию) */
  const isIndividualFormReady = useMemo(() => {
    if (previewStorage && previewStorage?.status !== "VACANT") return false;
    if (!previewStorage || !monthsNumber || monthsNumber <= 0) return false;
    return true;
  }, [monthsNumber, previewStorage]);

  const INDIVIDUAL_GUIDE_COPY = {
    term: "Выберите срок хранения для расчета стоимости",
    box: "Введите площадь (м²) над схемой и нажмите «Найти», затем выберите бокс на схеме — так вы увидите предварительную цену и сможете забронировать",
    delivery: "Выберите дату доставки",
    extras: "Добавьте дополнительные услуги при необходимости",
  };

  const individualBookingGuideTarget = useMemo(() => {
    if (activeStorageTab !== "INDIVIDUAL") {
      return { section: null, message: null };
    }
    const monthsOk = monthsNumber >= 1 && String(individualMonths ?? "").trim() !== "";
    if (!monthsOk) {
      return { section: "rental", message: INDIVIDUAL_GUIDE_COPY.term };
    }
    const hasVacantBox = previewStorage?.status === "VACANT";
    if (!hasVacantBox) {
      return { section: "map", message: INDIVIDUAL_GUIDE_COPY.box };
    }
    if (
      includeMoving &&
      (!movingPickupDate || !String(movingPickupDate).trim() || !movingStreetFrom.trim())
    ) {
      return { section: "moving", message: INDIVIDUAL_GUIDE_COPY.delivery };
    }
    if (includePacking && packagingServicesForOrder.length === 0) {
      return { section: "packing", message: INDIVIDUAL_GUIDE_COPY.extras };
    }
    return { section: null, message: null };
  }, [
    activeStorageTab,
    monthsNumber,
    individualMonths,
    previewStorage,
    includeMoving,
    movingPickupDate,
    movingStreetFrom,
    includePacking,
    packagingServicesForOrder.length,
  ]);

  const individualMandatoryBookingReady = useMemo(() => {
    return (
      monthsNumber >= 1 &&
      String(individualMonths ?? "").trim() !== "" &&
      previewStorage?.status === "VACANT"
    );
  }, [monthsNumber, individualMonths, previewStorage]);

  const flashIndividualGuideHighlight = useCallback((section) => {
    if (!section || typeof window === "undefined") return;
    if (individualGuideHighlightClearRef.current) {
      clearTimeout(individualGuideHighlightClearRef.current);
    }
    setIndividualGuideHighlight(section);
    individualGuideHighlightClearRef.current = setTimeout(() => {
      setIndividualGuideHighlight(null);
      individualGuideHighlightClearRef.current = null;
    }, 2600);
  }, []);

  const scrollToIndividualBookingGuideTarget = useCallback(() => {
    const { section } = individualBookingGuideTarget;
    if (!section) return;
    const refMap = {
      rental: promoRentalSectionRef,
      map: promoMapSectionRef,
      moving: promoMovingSectionRef,
      packing: promoPackingSectionRef,
    };
    const ref = refMap[section];
    ref?.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    flashIndividualGuideHighlight(section);
  }, [individualBookingGuideTarget, flashIndividualGuideHighlight]);

  useEffect(() => {
    return () => {
      if (individualGuideHighlightClearRef.current) {
        clearTimeout(individualGuideHighlightClearRef.current);
      }
    };
  }, []);

  const promoBookingGuide = useMemo(() => {
    if (!promoGuidedBooking || activeStorageTab !== "INDIVIDUAL") {
      return { highlight: null, message: null, step: 0 };
    }
    const hasVacantBox = previewStorage?.status === "VACANT";
    if (!hasVacantBox) {
      return {
        highlight: "map",
        message: "Выберите или укажите подходящий размер бокса",
        step: 1,
      };
    }
    if (
      includeMoving &&
      (!movingPickupDate || !String(movingPickupDate).trim() || !movingStreetFrom.trim())
    ) {
      return {
        highlight: "moving",
        message: "Теперь выберите дату доставки",
        step: 2,
      };
    }
    if (includePacking && packagingServicesForOrder.length === 0) {
      return {
        highlight: "packing",
        message: "Добавьте нужные дополнительные услуги",
        step: 3,
      };
    }
    const bookReady =
      isIndividualFormReady && !(isAdminOrManager && !selectedClientUser);
    if (bookReady) {
      return { highlight: "book", message: null, step: 4 };
    }
    return { highlight: null, message: null, step: 0 };
  }, [
    promoGuidedBooking,
    activeStorageTab,
    previewStorage,
    includeMoving,
    includePacking,
    movingPickupDate,
    movingStreetFrom,
    packagingServicesForOrder.length,
    isIndividualFormReady,
    isAdminOrManager,
    selectedClientUser,
  ]);

  useEffect(() => {
    if (!promoGuidedBooking || activeStorageTab !== "INDIVIDUAL") return;
    const { highlight } = promoBookingGuide;
    const ref =
      highlight === "map"
        ? promoMapSectionRef
        : highlight === "moving"
          ? promoMovingSectionRef
          : highlight === "packing"
            ? promoPackingSectionRef
            : highlight === "book"
              ? promoBookButtonRef
              : null;
    if (!ref?.current) return;
    ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [promoGuidedBooking, activeStorageTab, promoBookingGuide.step, promoBookingGuide.highlight]);

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
    if (!activeStorageTab) return;
    const storageType =
      activeStorageTab === "CLOUD"
        ? "CLOUD"
        : activeStorageTab === "LOCKERS"
          ? "LOCKERS"
          : "INDIVIDUAL";
    localStorage.setItem("prep_storage_type", storageType);
  }, [activeStorageTab]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!activeStorageTab || activeStorageTab === "LOCKERS") return;
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
    if (activeStorageTab === "LOCKERS") return;
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
    if (activeStorageTab === "LOCKERS") return;

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

    if (!isUserRole && !(isAdminOrManager && selectedClientUser)) {
      showErrorToast("Создание заказа доступно только клиентам с ролью USER или менеджерам с выбранным клиентом.");
      return;
    }

    // Проверка профиля перед отправкой заказа (только для USER, менеджеры создают заказ для клиента)
    if (isUserRole && user) {
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

      if (isAdminOrManager && selectedClientUser) {
        orderData.user_id = selectedClientUser.id;
      }

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

      // MANAGER/ADMIN: сумма аренды и разбивка как в превью (calculate-bulk), иначе на бэкенде пересчёт не совпадёт с orders.total_price
      if (
        isAdminOrManager &&
        pricePreview &&
        Number.isFinite(Number(pricePreview.total)) &&
        Number(pricePreview.total) >= 0
      ) {
        orderData.total_price = Math.round(Number(pricePreview.total));
        if (pricePreview.pricingBreakdown) {
          orderData.pricing_breakdown = pricePreview.pricingBreakdown;
          const rid = pricePreview.pricingBreakdown.ruleId;
          if (rid != null && Number.isFinite(Number(rid))) {
            orderData.pricing_rule_id = Number(rid);
          }
        }
      }

      await warehouseApi.createOrder(orderData);

      // Закрываем модалку предпросмотра платежей
      setIsPaymentPreviewOpen(false);
      setPaymentPreviewType(null);
      setPromoGuidedBooking(false);

      toastOrderRequestSent();

      const redirectSection = isAdminOrManager ? "request" : "orders";
      const redirectState = { activeSection: redirectSection };
      if (redirectSection === "orders") redirectState.ordersFilter = "contract";
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['orders', 'user'] });
        navigate("/personal-account", { state: redirectState });
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
    isAdminOrManager,
    selectedClientUser,
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
    pricePreview,
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

    if (!isUserRole && !(isAdminOrManager && selectedClientUser)) {
      showErrorToast("Создание заказа доступно только клиентам с ролью USER или менеджерам с выбранным клиентом.");
      return;
    }

    // Проверка профиля перед отправкой заказа (только для USER)
    if (isUserRole && user) {
      const profileValidation = validateUserProfile(user);
      if (!profileValidation.isValid) {
        let errorMessage = profileValidation.message;
        if (profileValidation.phoneNotVerified && 
            profileValidation.missingFields.length === 0 && 
            profileValidation.invalidFields.length === 0) {
          errorMessage = 'Пожалуйста, верифицируйте номер телефона в профиле перед созданием заказа.';
        }
        showErrorToast(errorMessage);
        setTimeout(() => {
          navigate("/personal-account", { state: { activeSection: "personal" } });
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

      if (isAdminOrManager && selectedClientUser) {
        orderData.user_id = selectedClientUser.id;
      }

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

      if (
        isAdminOrManager &&
        cloudPricePreview &&
        Number.isFinite(Number(cloudPricePreview.total)) &&
        Number(cloudPricePreview.total) >= 0
      ) {
        orderData.total_price = Math.round(Number(cloudPricePreview.total));
      }

      await warehouseApi.createOrder(orderData);

      // Закрываем модалку предпросмотра платежей
      setIsPaymentPreviewOpen(false);
      setPaymentPreviewType(null);

      toastOrderRequestSent();

      const cloudRedirectSection = isAdminOrManager ? "request" : "orders";
      const cloudRedirectState = { activeSection: cloudRedirectSection };
      if (cloudRedirectSection === "orders") cloudRedirectState.ordersFilter = "contract";
      setTimeout(async () => {
        await queryClient.refetchQueries({ queryKey: ['orders', 'user'] });
        navigate("/personal-account", { state: cloudRedirectState });
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
    isAdminOrManager,
    selectedClientUser,
    navigate,
    selectedTariff,
    serviceOptions,
    gazelleService,
    ensureServiceOptions,
    warehouseApi,
    cloudPromoCode,
    cloudPricePreview,
    user,
    validateUserProfile,
    translateBackendError,
  ]);

  const handleIndividualBookingClick = useCallback(() => {
    // Всегда показываем модалку предпросмотра платежей
    setPaymentPreviewType('INDIVIDUAL');
    setIsPaymentPreviewOpen(true);
  }, []);

  const handleIndividualBookButtonClick = useCallback(() => {
    if (!individualMandatoryBookingReady) {
      scrollToIndividualBookingGuideTarget();
      return;
    }
    handleIndividualBookingClick();
  }, [
    individualMandatoryBookingReady,
    scrollToIndividualBookingGuideTarget,
    handleIndividualBookingClick,
  ]);

  const handleIndividualSummaryGuideClick = useCallback(() => {
    if (individualBookingGuideTarget.section) {
      scrollToIndividualBookingGuideTarget();
    }
  }, [individualBookingGuideTarget.section, scrollToIndividualBookingGuideTarget]);

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

  const openPromoBookingModal = useCallback(() => {
    setIsPromoBookingModalOpen(true);
  }, []);

  /** Скролл из hero-секции к карте склада: переключаем на «Индивидуальное», ждём рендер и скроллим. */
  const scrollToWarehouseMap = useCallback(() => {
    setActiveStorageTab("INDIVIDUAL");
    setCityStoragePhase(CITY_STORAGE_PHASE.BOOKING);
    setTimeout(() => {
      const target = promoMapSectionRef.current ?? tabsSectionRef.current;
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }, []);

  const handlePromoModalContinue = useCallback(() => {
    setIsPromoBookingModalOpen(false);
    setPromoGuidedBooking(true);
    setIndividualMonths("2");
    setActiveStorageTab("INDIVIDUAL");
    setCityStoragePhase(CITY_STORAGE_PHASE.BOOKING);
    setTimeout(() => {
      tabsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
        // ЖК Есентай убран с бронирования
        const filtered = Array.isArray(data) ? data.filter(w => {
          const name = (w.name || '').toLowerCase();
          return !name.includes('есентай') && !name.includes('esentai');
        }) : [];
        setApiWarehouses(filtered);

        // Устанавливаем первый склад INDIVIDUAL как выбранный по умолчанию
        if (filtered.length > 0) {
          const firstIndividual = filtered.find((item) => item.type === "INDIVIDUAL");
          setSelectedWarehouse(firstIndividual || filtered[0]);
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

  const approveCancelOrder = useApproveCancelOrder();
  const unlockStorage = useUnlockStorage();

  const handleApproveReturn = useCallback(async (orderId) => {
    try {
      await approveCancelOrder.mutateAsync(orderId);
      setPreviewStorage(null);
      const data = await warehouseApi.getAllWarehouses();
      // ЖК Есентай убран с бронирования
      const updated = Array.isArray(data) ? data.filter(w => {
        const name = (w.name || '').toLowerCase();
        return !name.includes('есентай') && !name.includes('esentai');
      }) : [];
      setApiWarehouses(updated);
      if (selectedWarehouse?.id) {
        const fresh = updated.find((w) => w.id === selectedWarehouse.id);
        if (fresh) setSelectedWarehouse(fresh);
      }
      setIsReturnApprovalModalOpen(false);
      setOrderForReturnApproval(null);
    } catch (err) {
      console.error('Ошибка при подтверждении возврата:', err);
    }
  }, [approveCancelOrder, selectedWarehouse?.id]);

  const handleUnlockStorage = useCallback(async (orderId) => {
    try {
      await unlockStorage.mutateAsync(orderId);
      setPreviewStorage(null);
      const data = await warehouseApi.getAllWarehouses();
      // ЖК Есентай убран с бронирования
      const updated = Array.isArray(data) ? data.filter(w => {
        const name = (w.name || '').toLowerCase();
        return !name.includes('есентай') && !name.includes('esentai');
      }) : [];
      setApiWarehouses(updated);
      if (selectedWarehouse?.id) {
        const fresh = updated.find((w) => w.id === selectedWarehouse.id);
        if (fresh) setSelectedWarehouse(fresh);
      }
      setIsReturnApprovalModalOpen(false);
      setOrderForReturnApproval(null);
    } catch (err) {
      console.error('Ошибка при разблокировке бокса:', err);
      showErrorToast('Ошибка', {
        duration: 2000,
        position: 'top-right',
        description: err.response?.data?.message || err.message,
      });
    }
  }, [unlockStorage, selectedWarehouse?.id]);

  const handleBoxSelect = useCallback(async (storage) => {
    setHighlightedBoxes([]);
    if ((['OCCUPIED', 'PENDING', 'CANCELED'].includes(storage?.status)) && isAdminOrManager) {
      setIsLoadingPendingOrder(true);
      try {
        const order = await ordersApi.getPendingOrderByStorageId(storage.id);
        setPreviewStorage(storage);
        if ((order?.cancel_status === 'PENDING') || (order?.status === 'CANCELED' && order?.cancel_status === 'SIGNED')) {
          setOrderForReturnApproval(order);
          setIsReturnApprovalModalOpen(true);
        } else {
          setPendingOrder(order);
          setIsPendingOrderModalOpen(true);
        }
      } catch (error) {
        if (error?.response?.status === 404) {
          setPendingOrder(null);
          setIsPendingOrderModalOpen(true);
        } else {
          console.error('Ошибка при загрузке заказа:', error);
        }
      } finally {
        setIsLoadingPendingOrder(false);
      }
    } else {
      if (storage?.status === "VACANT") {
        setBoxVisualStorage(storage);
        setIsBoxVisualModalOpen(true);
      } else {
        setPreviewStorage(storage);
      }
    }
  }, [isAdminOrManager]);

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
              onBoxSelect={handleBoxSelect}
              selectedStorage={previewStorage}
              highlightedBoxes={highlightedBoxes}
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

  const handleGalleryBookInWarehouse = useCallback(
    (warehouseName) => {
      if (!warehouseName || typeof warehouseName !== "string") return;
      const list = Array.isArray(dropdownItems) ? dropdownItems : [];
      const wh =
        list.find((w) => w?.name === warehouseName) ||
        list.find(
          (w) =>
            w?.type === "INDIVIDUAL" &&
            (w.name || "").toLowerCase().includes("mega") &&
            warehouseName.toLowerCase().includes("mega")
        ) ||
        list.find(
          (w) =>
            w?.type === "INDIVIDUAL" &&
            ((w.name || "").toLowerCase().includes("комфорт") ||
              (w.name || "").toLowerCase().includes("komfort")) &&
            (warehouseName.toLowerCase().includes("комфорт") ||
              warehouseName.toLowerCase().includes("komfort"))
        );
      if (wh) {
        setSelectedWarehouse(wh);
      }
      setActiveStorageTab("INDIVIDUAL");
      setCityStoragePhase(CITY_STORAGE_PHASE.BOOKING);
      setGalleryBookingFocusToken((t) => t + 1);
    },
    [dropdownItems]
  );

  useEffect(() => {
    if (galleryBookingFocusToken === 0) return;
    if (activeStorageTab !== "INDIVIDUAL" || !selectedWarehouse) return;
    let innerTimer;
    const outerTimer = window.setTimeout(() => {
      tabsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      innerTimer = window.setTimeout(() => {
        scrollToIndividualBookingGuideTarget();
      }, 450);
    }, 100);
    return () => {
      window.clearTimeout(outerTimer);
      if (innerTimer) window.clearTimeout(innerTimer);
    };
  }, [
    galleryBookingFocusToken,
    selectedWarehouse?.id,
    activeStorageTab,
    scrollToIndividualBookingGuideTarget,
  ]);

  useEffect(() => {
    if (!Array.isArray(dropdownItems) || dropdownItems.length === 0) return;
    if (!selectedWarehouse || selectedWarehouse.type === "CLOUD") {
      const first = dropdownItems[0];
      if (!selectedWarehouse || selectedWarehouse?.id !== first?.id) {
        setSelectedWarehouse(first);
      }
    }
  }, [dropdownItems, selectedWarehouse, setSelectedWarehouse]);

  useEffect(() => {
    setHighlightedBoxes([]);
  }, [selectedWarehouse?.id, megaSelectedMap, komfortSelectedMap]);

  useEffect(() => {
    if (!previewStorage || previewStorage.status !== "VACANT") {
      setIndividualRentalPeriodAcknowledged(false);
    }
  }, [previewStorage?.id, previewStorage?.status]);

  /** Подсветка карты (промо / гид) — же условие, что «шаг карты», чтобы не дублировать неон срока */
  const mapStepEmphasisActive = useMemo(
    () =>
      (promoGuidedBooking &&
        activeStorageTab === "INDIVIDUAL" &&
        promoBookingGuide.highlight === "map") ||
      (activeStorageTab === "INDIVIDUAL" && individualGuideHighlight === "map"),
    [
      promoGuidedBooking,
      activeStorageTab,
      promoBookingGuide.highlight,
      individualGuideHighlight,
    ],
  );

  const individualRentalNeonActive = useMemo(
    () =>
      activeStorageTab === "INDIVIDUAL" &&
      (individualGuideHighlight === "rental" ||
        (previewStorage?.status === "VACANT" &&
          !individualRentalPeriodAcknowledged &&
          !mapStepEmphasisActive)),
    [
      activeStorageTab,
      individualGuideHighlight,
      previewStorage?.status,
      individualRentalPeriodAcknowledged,
      mapStepEmphasisActive,
    ],
  );

  const individualServicesNeonActive = useMemo(
    () =>
      activeStorageTab === "INDIVIDUAL" &&
      (individualGuideHighlight === "moving" ||
        individualGuideHighlight === "packing" ||
        (previewStorage?.status === "VACANT" &&
          individualRentalPeriodAcknowledged &&
          !mapStepEmphasisActive) ||
        (promoGuidedBooking &&
          (promoBookingGuide.highlight === "moving" ||
            promoBookingGuide.highlight === "packing"))),
    [
      activeStorageTab,
      individualGuideHighlight,
      previewStorage?.status,
      individualRentalPeriodAcknowledged,
      mapStepEmphasisActive,
      promoGuidedBooking,
      promoBookingGuide.highlight,
    ],
  );

  return (
    <div className="font-['Montserrat'] min-h-screen bg-white flex flex-col">
      <Header />

      {/* Первая секция: Храните там, где удобно */}
      <HeroSection
        onOpenPromoBooking={openPromoBookingModal}
        onBookClick={scrollToWarehouseMap}
      />

      <Dialog open={isPromoBookingModalOpen} onOpenChange={setIsPromoBookingModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-left text-lg font-bold text-[#202422] sm:text-xl pr-8">
              Акционная бронь
            </DialogTitle>
            <DialogDescription className="text-left text-[#5C625F] text-sm sm:text-base leading-relaxed pt-1">
              Забронируйте бокс в любом нашем складе по специальной цене — 5 990 ₸ за м² на первые 2
              месяца хранения.
            </DialogDescription>
          </DialogHeader>
          <button
            type="button"
            onClick={handlePromoModalContinue}
            className="mt-2 w-full rounded-2xl bg-[#31876D] py-3 px-4 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:text-base"
          >
            Забронировать бокс по акции
          </button>
        </DialogContent>
      </Dialog>

      {/* Секция: Быстрое бронирование */}
      < QuickBookingSection />

      {/* Секция: Хранение в городе */}
      <section ref={tabsSectionRef} className="w-full bg-[#FFF] py-6 sm:py-8">
        <div className="container mx-auto px-2 sm:px-2 lg:px-3 xl:px-3 max-w-7xl">
          {/* Заголовок */}
          <h2 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-bold mb-6">
            хранение в городе
          </h2>

          <AnimatePresence mode="wait">
            {/* Описание стартового экрана */}
            {cityStoragePhase === CITY_STORAGE_PHASE.PICK && (
              <motion.div
                key="city-storage-pick"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.35, ease: CITY_STORAGE_EASE }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-start mb-8">
                  <motion.p
                    className="text-[#5C625F] text-base sm:text-lg"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05, duration: 0.4, ease: CITY_STORAGE_EASE }}
                  >
                    Современное хранение в черте города — просто, безопасно и гибко.
                  </motion.p>
                  <motion.p
                    className="text-[#5C625F] text-sm sm:text-base"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12, duration: 0.4, ease: CITY_STORAGE_EASE }}
                  >
                    Сначала выберите тип хранения — затем откроются карта и форма бронирования.
                  </motion.p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
                  {["INDIVIDUAL", "LOCKERS", "CLOUD"].map((key, index) => (
                    <motion.button
                      key={key}
                      type="button"
                      layout
                      initial={{ opacity: 0, y: 28, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{
                        delay: 0.08 + index * 0.09,
                        duration: 0.45,
                        ease: CITY_STORAGE_EASE,
                      }}
                      whileHover={{ y: -4, transition: { duration: 0.22 } }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setActiveStorageTab(key);
                        setCityStoragePhase(CITY_STORAGE_PHASE.ABOUT);
                      }}
                      className="group rounded-2xl border-2 border-[#E8EBE9] bg-white p-6 text-left shadow-sm transition-colors duration-300 hover:border-[#31876D] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#31876D] focus-visible:ring-offset-2"
                    >
                      <span className="block font-soyuz-grotesk text-lg sm:text-xl font-bold text-[#202422] mb-3">
                        {STORAGE_ABOUT_COPY[key].title}
                      </span>
                      <span className="text-sm text-[#5C625F] leading-relaxed block">
                        {STORAGE_ABOUT_COPY[key].teaser}
                      </span>
                      <span className="mt-4 inline-flex items-center text-sm font-semibold text-[#31876D] group-hover:underline">
                        Подробнее →
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Экран описания + «Выбрать»: кнопки слева, текст справа */}
            {cityStoragePhase === CITY_STORAGE_PHASE.ABOUT && activeStorageTab && (
              <motion.div
                key="city-storage-about"
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                transition={{ duration: 0.42, ease: CITY_STORAGE_EASE }}
                className="mb-10 grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8"
              >
                <motion.div
                  className="flex flex-col gap-3 lg:col-span-4 lg:max-w-sm lg:pr-2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.06, ease: CITY_STORAGE_EASE }}
                >
                  <motion.button
                    type="button"
                    onClick={() => {
                      setCityStoragePhase(CITY_STORAGE_PHASE.PICK);
                      setActiveStorageTab(null);
                    }}
                    className="mb-1 self-start text-sm font-medium text-[#31876D] underline underline-offset-2 hover:text-[#276b57]"
                    whileHover={{ x: -2 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  >
                    ← Все типы
                  </motion.button>
                  {["INDIVIDUAL", "LOCKERS", "CLOUD"].map((key, index) => {
                    const active = activeStorageTab === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        layout
                        initial={{ opacity: 0, x: -16 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: active ? 1.03 : 1,
                        }}
                        transition={{
                          delay: 0.05 + index * 0.06,
                          duration: 0.38,
                          ease: CITY_STORAGE_EASE,
                          layout: { duration: 0.35 },
                        }}
                        whileHover={{ scale: active ? 1.04 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveStorageTab(key)}
                        className={`rounded-xl px-4 py-3 text-left text-sm font-semibold sm:text-base ${
                          active
                            ? "bg-[#31876D] text-white shadow-lg ring-2 ring-[#31876D]/30 sm:scale-[1.04]"
                            : "bg-[#EFEFEF] text-gray-700 hover:bg-[#E4E4E4]"
                        }`}
                      >
                        {STORAGE_ABOUT_COPY[key].title}
                      </motion.button>
                    );
                  })}
                </motion.div>

                <motion.div
                  className="flex min-h-[260px] flex-col justify-between rounded-3xl bg-[#F7FAF9] p-6 shadow-inner lg:col-span-8 lg:p-8"
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.1, ease: CITY_STORAGE_EASE }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeStorageTab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.28, ease: CITY_STORAGE_EASE }}
                    >
                      <h3 className="font-soyuz-grotesk mb-4 text-2xl font-bold text-[#202422] sm:text-3xl">
                        {STORAGE_ABOUT_COPY[activeStorageTab].title}
                      </h3>
                      <ul className="list-inside list-disc space-y-3 text-[#5C625F] marker:text-[#31876D]">
                        {STORAGE_ABOUT_COPY[activeStorageTab].bullets.map((line, idx) => (
                          <motion.li
                            key={`${activeStorageTab}-${idx}`}
                            className="pl-1 leading-relaxed"
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.06 + idx * 0.06,
                              duration: 0.35,
                              ease: CITY_STORAGE_EASE,
                            }}
                          >
                            {line}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  </AnimatePresence>
                  <motion.button
                    type="button"
                    onClick={() => setCityStoragePhase(CITY_STORAGE_PHASE.BOOKING)}
                    className="mt-8 w-full rounded-2xl bg-[#31876D] px-8 py-3.5 text-center text-base font-semibold text-white shadow-md sm:w-auto sm:self-start"
                    whileHover={{ scale: 1.02, boxShadow: "0 12px 28px rgba(49, 135, 109, 0.35)" }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  >
                    Выбрать
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

          {/* Карта и формы — только после «Выбрать» */}
          {cityStoragePhase === CITY_STORAGE_PHASE.BOOKING && activeStorageTab && (
              <motion.div
                key="city-storage-booking"
                initial={{ opacity: 0, y: 36 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ duration: 0.48, ease: CITY_STORAGE_EASE }}
                className="w-full"
              >
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <motion.button
                  type="button"
                  onClick={() => setCityStoragePhase(CITY_STORAGE_PHASE.ABOUT)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-[#31876D] hover:text-[#276b57]"
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 450, damping: 28 }}
                >
                  <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
                  Назад к описанию
                </motion.button>
                <div className="flex flex-wrap gap-2 sm:justify-end">
                  {["INDIVIDUAL", "LOCKERS", "CLOUD"].map((key) => (
                    <motion.button
                      key={key}
                      type="button"
                      layout
                      onClick={() => setActiveStorageTab(key)}
                      className={`rounded-full px-4 py-2 text-xs font-semibold sm:text-sm ${
                        activeStorageTab === key
                          ? "bg-[#31876D] text-white shadow-md"
                          : "bg-[#DFDFDF] text-gray-600 hover:bg-[#d0d0d0]"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.96 }}
                      transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    >
                      {CITY_STORAGE_SHORT_LABEL[key]}
                    </motion.button>
                  ))}
                </div>
              </div>

              <Tabs value={activeStorageTab} onValueChange={setActiveStorageTab} className="w-full">

            <TabsContent value="INDIVIDUAL" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
                {/* Левая панель - Карта склада */}
                <div
                  ref={promoMapSectionRef}
                  className={`self-start w-full ${
                    mapStepEmphasisActive
                      ? "rounded-[20px] transition-[box-shadow] duration-500 ease-out"
                      : ""
                  }`}
                  style={
                    mapStepEmphasisActive
                      ? { boxShadow: HOME_INDIVIDUAL_NEON_BOX_SHADOW }
                      : undefined
                  }
                >
                  <WarehouseSchemePanel
                    dropdownItems={dropdownItems}
                    selectedWarehouse={selectedWarehouse}
                    setSelectedWarehouse={setSelectedWarehouse}
                    mapRef={mapRef}
                    renderWarehouseScheme={renderWarehouseScheme}
                    storageBoxes={selectedWarehouse?.storage ?? []}
                    selectedMap={
                      selectedWarehouse?.name?.toLowerCase().includes("mega")
                        ? megaSelectedMap
                        : komfortSelectedMap
                    }
                    onHighlightedBoxes={setHighlightedBoxes}
                    onBoxSelect={handleBoxSelect}
                  />
                </div>

                {/* Правая панель - Форма конфигурации */}
                <div className="bg-[#F7FAF9] rounded-3xl p-6 shadow-lg min-h-[450px] flex flex-col">
                  <h2 className="font-soyuz-grotesk text-2xl sm:text-3xl font-bold text-[#202422] mb-6">
                    Настройте хранение
                  </h2>

                  {promoGuidedBooking && activeStorageTab === "INDIVIDUAL" && (
                    <div className="mb-4 rounded-2xl border border-[#31876D]/35 bg-gradient-to-r from-[#31876D]/12 to-[#26B3AB]/10 px-4 py-3 text-sm font-semibold text-[#273655]">
                      Акция активна: первые 2 месяца по 5 990 ₸ / м²
                    </div>
                  )}

                  {promoGuidedBooking &&
                    activeStorageTab === "INDIVIDUAL" &&
                    promoBookingGuide.message && (
                      <div
                        className="mb-4 rounded-2xl border border-[#31876D]/45 bg-white px-4 py-3 text-sm font-medium text-[#202422] shadow-sm"
                        role="status"
                        aria-live="polite"
                      >
                        {promoBookingGuide.message}
                      </div>
                    )}

                  {/* Предупреждение для Яруса 2 Mega Tower Almaty */}
                  <StorageWarnings
                    selectedWarehouse={selectedWarehouse}
                    megaSelectedMap={megaSelectedMap}
                    komfortSelectedMap={komfortSelectedMap}
                  />

                  {/* Срок аренды */}
                  <div
                    ref={promoRentalSectionRef}
                    className={`mb-6 rounded-2xl ${
                      individualRentalNeonActive
                        ? "transition-[box-shadow] duration-500 ease-out p-0.5"
                        : ""
                    }`}
                    style={
                      individualRentalNeonActive
                        ? { boxShadow: HOME_INDIVIDUAL_NEON_BOX_SHADOW_FORM }
                        : undefined
                    }
                  >
                    <RentalPeriodSelect
                      value={individualMonths}
                      onChange={(value) => {
                        setIndividualMonths(value);
                        if (previewStorage?.status === "VACANT") {
                          setIndividualRentalPeriodAcknowledged(true);
                        }
                      }}
                      onOpenChange={(open) => {
                        if (
                          !open &&
                          previewStorage?.status === "VACANT" &&
                          !individualRentalPeriodAcknowledged
                        ) {
                          setIndividualRentalPeriodAcknowledged(true);
                        }
                      }}
                      label="Срок аренды (месяцы):"
                      variant="individual-home"
                      triggerClassName="bg-transparent"
                    />
                  </div>

                  {/* Перевозка и доп. услуги — общая неоновая подсветка после выбора срока */}
                  <div
                    className={`space-y-4 ${
                      individualServicesNeonActive
                        ? "rounded-3xl transition-[box-shadow] duration-500 ease-out p-0.5"
                        : ""
                    }`}
                    style={
                      individualServicesNeonActive
                        ? { boxShadow: HOME_INDIVIDUAL_NEON_BOX_SHADOW_FORM }
                        : undefined
                    }
                  >
                    <div ref={promoMovingSectionRef}>
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
                    </div>

                    <div ref={promoPackingSectionRef}>
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
                    </div>
                  </div>
                  
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
                      guideMessage={individualBookingGuideTarget.message}
                      onGuideClick={
                        individualBookingGuideTarget.section
                          ? handleIndividualSummaryGuideClick
                          : undefined
                      }

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

                  {/* Блок выбора клиента для менеджеров/админов */}
                  {isAdminOrManager && (
                    <div className="mt-6 rounded-2xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#202422] font-semibold">
                          <User className="w-5 h-5 shrink-0" />
                          <span>Клиент</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsClientSelectorOpen(true)}
                          className="px-4 py-2 text-sm font-medium text-[#31876D] border border-[#31876D] rounded-lg hover:bg-[#31876D] hover:text-white transition-colors"
                        >
                          {selectedClientUser ? "Изменить" : "Выбрать клиента"}
                        </button>
                      </div>
                      {selectedClientUser && (
                        <div className="bg-[#31876D]/10 rounded-lg p-3">
                          <div className="text-sm font-medium text-[#202422]">
                            {selectedClientUser.name || "Без имени"}
                          </div>
                          <div className="text-xs text-gray-600">{selectedClientUser.email}</div>
                          {selectedClientUser.phone && (
                            <div className="text-xs text-gray-500">Телефон: {selectedClientUser.phone}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Кнопки действий */}
                  <div className="mt-6 space-y-3">
                    <button
                      ref={promoBookButtonRef}
                      type="button"
                      onClick={handleIndividualBookButtonClick}
                      disabled={
                        isSubmittingOrder ||
                        (isAdminOrManager && !selectedClientUser && individualMandatoryBookingReady)
                      }
                      className={`w-full font-semibold py-2.5 px-6 rounded-3xl transition-opacity ${
                        individualMandatoryBookingReady
                          ? "bg-[#31876D] text-white hover:opacity-90"
                          : "bg-[#31876D]/40 text-white hover:bg-[#31876D]/50 cursor-pointer"
                      } ${
                        promoGuidedBooking &&
                        activeStorageTab === "INDIVIDUAL" &&
                        promoBookingGuide.highlight === "book"
                          ? "ring-4 ring-[#31876D] ring-offset-2 ring-offset-[#F7FAF9]"
                          : ""
                      }`}
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

                  {/* Поля габаритов */}
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

                  {/* Блок выбора клиента для менеджеров/админов */}
                  {isAdminOrManager && (
                    <div className="mb-4 rounded-2xl border border-gray-200 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[#202422] font-semibold">
                          <User className="w-5 h-5 shrink-0" />
                          <span>Клиент</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsClientSelectorOpen(true)}
                          className="px-4 py-2 text-sm font-medium text-[#31876D] border border-[#31876D] rounded-lg hover:bg-[#31876D] hover:text-white transition-colors"
                        >
                          {selectedClientUser ? "Изменить" : "Выбрать клиента"}
                        </button>
                      </div>
                      {selectedClientUser && (
                        <div className="bg-[#31876D]/10 rounded-lg p-3">
                          <div className="text-sm font-medium text-[#202422]">
                            {selectedClientUser.name || "Без имени"}
                          </div>
                          <div className="text-xs text-gray-600">{selectedClientUser.email}</div>
                          {selectedClientUser.phone && (
                            <div className="text-xs text-gray-500">Телефон: {selectedClientUser.phone}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Кнопка бронирования */}
                  <button
                    onClick={handleCloudBookingClick}
                    disabled={!isCloudFormReady || isSubmittingOrder || (isAdminOrManager && !selectedClientUser && !isCloudFormReady)}
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
              </div>
            </TabsContent>

            <TabsContent value="LOCKERS" className="mt-8">
              <StorageLockersSection
                isActive={activeStorageTab === "LOCKERS"}
                warehouses={dropdownItems}
                onCallbackClick={handleCallbackRequestClick}
                selectedClientUser={selectedClientUser}
                isAdminOrManager={isAdminOrManager}
                isUserRole={isUserRole}
                onOpenClientSelector={() => setIsClientSelectorOpen(true)}
              />
            </TabsContent>
          </Tabs>
              </motion.div>
          )}
          </AnimatePresence>
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

      {/* Галерея складов ЖК Комфорт Сити */}
      <WarehouseGallery onBookInWarehouse={handleGalleryBookInWarehouse} />

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

      {isAdminOrManager && (
        <ClientSelector
          isOpen={isClientSelectorOpen}
          onClose={() => setIsClientSelectorOpen(false)}
          selectedUser={selectedClientUser}
          onUserSelect={(client) => {
            setSelectedClientUser(client);
            if (client) setIsClientSelectorOpen(false);
          }}
          legacyImportBuildOrderPayload={buildLegacyImportOrderPayload}
          legacyImportBookingSummary={buildLegacyImportBookingSummary}
          onLegacyImportSuccess={() => {
            queryClient.refetchQueries({ queryKey: ["orders", "user"] });
            const redirectSection = "request";
            const redirectState = { activeSection: redirectSection };
            navigate("/personal-account", { state: redirectState });
          }}
        />
      )}

      <BoxVisualModal
        open={isBoxVisualModalOpen && boxVisualStorage != null}
        onOpenChange={(open) => {
          setIsBoxVisualModalOpen(open);
          if (!open) setBoxVisualStorage(null);
        }}
        storage={boxVisualStorage}
        selectedWarehouse={selectedWarehouse}
        onTakeBox={(s) => {
          if (s) setPreviewStorage(s);
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

      {isAdminOrManager && (
        <Dialog open={isReturnApprovalModalOpen} onOpenChange={(open) => {
            if (!open) {
              setIsReturnApprovalModalOpen(false);
              setOrderForReturnApproval(null);
            }
          }}>
          <DialogContent className="w-[95vw] max-w-5xl max-h-[90vh] overflow-y-auto p-4 sm:p-6 rounded-2xl sm:rounded-3xl border-none">
            <DialogHeader className="pb-4 sm:pb-6 border-b">
              <DialogTitle className="text-lg sm:text-2xl font-semibold text-[#273655]">
                Детальная информация о заказе
              </DialogTitle>
            </DialogHeader>
            {orderForReturnApproval && (
              <div className="mt-4 sm:mt-6">
                <OrderDetailView
                  order={orderForReturnApproval}
                  isLoading={approveCancelOrder.isPending || unlockStorage.isPending}
                  onApproveReturn={handleApproveReturn}
                  onUnlockStorage={handleUnlockStorage}
                />
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {isAdminOrManager && (
        <PendingOrderModal
          isOpen={isPendingOrderModalOpen}
          order={pendingOrder}
          storageId={previewStorage?.id}
          onClose={() => {
            setIsPendingOrderModalOpen(false);
            setPendingOrder(null);
          }}
          onUnbook={async () => {
            setIsUnbooking(true);
            try {
              setPreviewStorage(null);
              const data = await warehouseApi.getAllWarehouses();
              // ЖК Есентай убран с бронирования
              const updated = Array.isArray(data) ? data.filter(w => {
                const name = (w.name || '').toLowerCase();
                return !name.includes('есентай') && !name.includes('esentai');
              }) : [];
              setApiWarehouses(updated);
              if (selectedWarehouse?.id) {
                const fresh = updated.find((w) => w.id === selectedWarehouse.id);
                if (fresh) setSelectedWarehouse(fresh);
              }
            } catch (error) {
              console.error('Ошибка при обновлении данных:', error);
            } finally {
              setIsUnbooking(false);
            }
          }}
          isUnbooking={isUnbooking}
        />
      )}

      {isLoadingPendingOrder && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-2 border-t-transparent border-[#31876D] rounded-full animate-spin" />
              <span className="text-sm font-medium text-[#202422]">Загрузка информации о заказе...</span>
            </div>
          </div>
        </div>
      )}

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

      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-4 right-4 z-[100] flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#31876D] text-white shadow-lg ring-2 ring-white transition-transform hover:scale-105 hover:bg-[#2a7260] hover:shadow-xl focus:outline-none focus-visible:ring-4 focus-visible:ring-[#31876D]/50"
        aria-label="Написать в WhatsApp"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="sm:w-8 sm:h-8" aria-hidden>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
        </svg>
      </a>
    </div>
  );
});

HomePage.displayName = "HomePage";

export default HomePage;
