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
  Play,
} from "lucide-react";


import {
  Tabs,
  TabsContent,
  Switch,
} from "../../components/ui";
import { DateField } from '@/shared/ui/DateField.jsx';
import { RentalPeriodSelect } from "../../shared/ui/RentalPeriodSelect";
import { getTodayLocalDateString } from "../../shared/lib/utils/date";

import { warehouseApi } from "../../shared/api/warehouseApi";
import { filterVisibleWarehouses } from "../../shared/lib/warehouseLayoutUtils";
import { ordersApi } from "../../shared/api/ordersApi";
import { paymentsApi } from "../../shared/api/paymentsApi";
import { promoApi } from "../../shared/api/promoApi";
import { useAuth } from "../../shared/context/AuthContext";
import { validateUserProfile } from "../../shared/lib/validation/profileValidation";
import {
  showSuccessToast,
  showErrorToast,
  showInfoToast,
  toastOrderRequestSent,
} from "../../shared/lib/toast";

import CallbackRequestModal from "@/shared/components/CallbackRequestModal.jsx";
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
import { Header } from "../../widgets";
import Footer from "../../widgets/Footer";
import WarehouseSVGMap from "../../components/WarehouseSVGMap";
import HeroSection from "../../../src/pages/home/components/HeroSection.jsx";
import QuickBookingSection from "../../../src/pages/home/components/QuickBookingSection.jsx";
import ClimateSensorsSection from "../../../src/pages/home/components/ClimateSensorsSection.jsx";
import BranchesSection from "../../../src/pages/home/components/BranchesSection.jsx";
import WarehouseGallery from "../../../src/pages/home/components/WarehouseGallery.jsx";
import StorageFormatsSection from "@/components/home/StorageFormatsSection.jsx";
import StorageFormatsExplainerSection from "@/components/home/StorageFormatsExplainerSection.jsx";
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
  ABOUT: "about",
  BOOKING: "booking",
});

const CITY_STORAGE_SHORT_LABEL = {
  INDIVIDUAL: "Индивидуальное",
  LOCKERS: "Камера",
  CLOUD: "Облако",
};

const PAYMENT_TYPE_OPTIONS = Object.freeze({
  MONTHLY: "MONTHLY",
  FULL: "FULL",
});

const EMPTY_INDIVIDUAL_PRICE_PREVIEWS = Object.freeze({
  MONTHLY: null,
  FULL: null,
});

const STORAGE_ABOUT_COPY = {
  INDIVIDUAL: {
    title: "Индивидуальное хранение",
    videoSrc: "/videos/individualnoe-hranenie.mp4",
    videoPoster: "/videos/individualnoe-hranenie-poster.jpg",
    teaser:
      "Личный бокс с самостоятельным доступом клиента. Вы арендуете пространство только под свои вещи и можете пользоваться им в удобное время.",
    bullets: [
      "Для кого: семей, спортсменов, интернет-магазинов, малого бизнеса.",
      "Что удобнее хранить: мебель во время ремонта или переезда, сезонные вещи, бытовую технику, спортивный инвентарь, документы, товары для бизнеса, оборудование, личные вещи.",
    ],
  },
  LOCKERS: {
    title: "Камера хранения",
    videoSrc: "/videos/kamera-hraneniya.mp4",
    videoPoster: "/videos/kamera-hraneniya-poster.jpg",
    teaser:
      "Краткосрочное хранение вещей от одного дня до двух недель.",
    bullets: [
      "Для кого: путешественников, туристов, арендаторов, командировочных, участников мероприятий, студентов.",
      "Что удобнее хранить: чемоданы, сумки, коробки, личные вещи, оборудование для мероприятий, вещи при переезде, временные грузы или документы.",
    ],
  },
  CLOUD: {
    title: "Облачное хранение",
    videoSrc: "/videos/oblachnoe-hranenie.mp4",
    videoPoster: "/videos/oblachnoe-hranenie-poster.jpg",
    teaser:
      "Сервис полного цикла: вещи забирают, упаковывают, хранят на складе и возвращают по запросу. У вас нет прямого доступа к складу.",
    bullets: [
      "Для кого: занятых людей, семей, офисов, компаний и тех, кто хочет освободить пространство без личного участия в процессе хранения.",
      "Что удобнее хранить: сезонную одежду, архивы, документы, детские вещи, декор, редко используемую мебель, оборудование, долгосрочные запасы.",
    ],
  },
};

const CITY_STORAGE_EASE = [0.22, 1, 0.36, 1];

/**
 * Booking shell: inline-блок на product-страницах (`isEmbed=true`)
 * или модальное окно `<Dialog>` на главной (`isEmbed=false`).
 * Один и тот же контент в обоих случаях — без дублирования JSX.
 */
function BookingShell({ isEmbed, isOpen, onOpenChange, children }) {
  if (isEmbed) {
    return <div className="w-full bg-white">{children}</div>;
  }
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="h-[92vh] w-[96vw] max-w-[1240px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-0 sm:h-[90vh]">
        {children}
      </DialogContent>
    </Dialog>
  );
}

const HomePage = memo(({
  bookingEmbedFormat = null,
  embedInitialVolume = null,
  embedInitialMonths = null,
  embedInitialDays = null,
} = {}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuth();
  const isEmbed = !!bookingEmbedFormat;
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
  /** INDIVIDUAL | LOCKERS | CLOUD */
  const [activeStorageTab, setActiveStorageTab] = useState("INDIVIDUAL");
  /** about: кнопки типов и описание → booking: карта и формы */
  const [cityStoragePhase, setCityStoragePhase] = useState(CITY_STORAGE_PHASE.ABOUT);
  const [cityStorageVideoModalOpen, setCityStorageVideoModalOpen] = useState(false);
  const [isStorageFormatModalOpen, setIsStorageFormatModalOpen] = useState(false);
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
  const [cloudIncludeMoving, setCloudIncludeMoving] = useState(false);
  const [cloudIncludePacking, setCloudIncludePacking] = useState(false);
  const [cloudMonths, setCloudMonths] = useState("1");
  const [cloudDimensions, setCloudDimensions] = useState({ width: 1, height: 1, length: 1 });
  const [cloudVolumeDirect, setCloudVolumeDirect] = useState(1); // Прямой ввод объема для тарифов
  const [previewStorage, setPreviewStorage] = useState(null);
  const [individualPricePreviews, setIndividualPricePreviews] = useState(EMPTY_INDIVIDUAL_PRICE_PREVIEWS);
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
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);
  const [callbackModalContext, setCallbackModalContext] = useState('callback');
  const [isPromoBookingModalOpen, setIsPromoBookingModalOpen] = useState(false);
  const [promoGuidedBooking, setPromoGuidedBooking] = useState(false);
  // Состояние для модалки предпросмотра платежей
  const [isPaymentPreviewOpen, setIsPaymentPreviewOpen] = useState(false);
  const [paymentPreviewType, setPaymentPreviewType] = useState(null); // 'INDIVIDUAL' или 'CLOUD'
  // Состояние для цен услуг (для расчета процента скидки)
  // Состояние для карусели тарифов
  const [currentTariffIndex, setCurrentTariffIndex] = useState(0);
  const [tariffsPerView, setTariffsPerView] = useState(4);
  const [selectedTariff, setSelectedTariff] = useState(null);
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

  const pricePreview = individualPricePreviews[PAYMENT_TYPE_OPTIONS.MONTHLY];
  const fullPricePreview = individualPricePreviews[PAYMENT_TYPE_OPTIONS.FULL];

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
          phone: "+7 778 391 1425",
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
          phone: "+7 778 391 1425",
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

  const cloudMonthsNumber = useMemo(() => {
    const parsed = parseInt(cloudMonths, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [cloudMonths]);

  const serviceSummary = useMemo(() => {
    return {
      total: 0,
      breakdown: [],
    };
  }, []);

  const callbackModalDescription = useMemo(() => {
    if (callbackModalContext === 'booking') {
      return 'Оставьте контакты, и менеджер поможет подобрать бокс и оформить бронирование.';
    }
    if (callbackModalContext === 'max_orders_limit') {
      return 'Вы уже забронировали максимальное количество боксов (2). Для аренды дополнительных боксов оставьте заявку, и наш менеджер свяжется с вами.';
    }
    return undefined;
  }, [callbackModalContext]);

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
    return { section: null, message: null };
  }, [
    activeStorageTab,
    monthsNumber,
    individualMonths,
    previewStorage,
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
    // Требуется либо выбран тариф, либо выбрано "Свои габариты"
    if (!selectedTariff) return false;
    return true;
  }, [cloudStorage, cloudMonthsNumber, cloudVolume, selectedTariff]);

  const calculatePercentDiscountAmount = useCallback((amount, percent) => {
    const totalAmount = Number(amount) || 0;
    const discountPercent = Number(percent) || 0;
    if (totalAmount <= 0 || discountPercent <= 0) return 0;
    return Math.round((totalAmount * discountPercent / 100) * 100) / 100;
  }, []);

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

  const fullPaymentCostSummary = useMemo(() => {
    const baseMonthly = fullPricePreview?.monthly ? Math.round(fullPricePreview.monthly) : null;
    const baseTotal = fullPricePreview ? Math.round(fullPricePreview.total) : null;
    const serviceTotal = serviceSummary.total;
    const combinedTotal = (baseTotal || 0) + serviceTotal;

    return {
      baseMonthly,
      baseTotal,
      serviceTotal,
      combinedTotal,
      pricingBreakdown: fullPricePreview?.pricingBreakdown || null,
    };
  }, [fullPricePreview, serviceSummary.total]);

  // Расчет итоговой суммы с учетом промокода (индивидуальное хранение)
  const finalIndividualTotal = useMemo(() => {
    const total = costSummary.combinedTotal || 0;
    return Math.max(0, total - promoDiscount);
  }, [costSummary.combinedTotal, promoDiscount]);

  const fullPaymentPromoDiscount = useMemo(() => {
    if (!promoCode || promoDiscountPercent <= 0) return 0;
    return calculatePercentDiscountAmount(fullPaymentCostSummary.combinedTotal, promoDiscountPercent);
  }, [promoCode, promoDiscountPercent, fullPaymentCostSummary.combinedTotal, calculatePercentDiscountAmount]);

  const finalIndividualFullPaymentTotal = useMemo(() => {
    const total = fullPaymentCostSummary.combinedTotal || 0;
    return Math.max(0, total - fullPaymentPromoDiscount);
  }, [fullPaymentCostSummary.combinedTotal, fullPaymentPromoDiscount]);

  const fullPaymentDiscountInfo = useMemo(() => {
    if (!fullPricePreview || !pricePreview) return null;
    const pricingBreakdown = fullPricePreview.pricingBreakdown || null;
    const discountPercent = Number(pricingBreakdown?.discountPercent) || 0;
    const fullCombinedTotal = fullPaymentCostSummary.combinedTotal || 0;
    const monthlyCombinedTotal = costSummary.combinedTotal || 0;
    const savingsAmount = Math.max(0, monthlyCombinedTotal - fullCombinedTotal);

    if (pricingBreakdown?.paymentType !== PAYMENT_TYPE_OPTIONS.FULL && savingsAmount <= 0) {
      return null;
    }

    return {
      discountPercent,
      savingsAmount,
      fullCombinedTotal,
      monthlyCombinedTotal,
    };
  }, [fullPricePreview, pricePreview, fullPaymentCostSummary.combinedTotal, costSummary.combinedTotal]);

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
        showSuccessToast(`Промокод применён! Скидка ${result.discount_percent}%`);
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
      showSuccessToast(`Промокод применён! Скидка ${result.discount_percent}%`);
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

    // Ошибки сервера / внешних сервисов (TrustMe и т.д.): показываем текст от API, если он есть
    if (status >= 500) {
      const serverMsg = String(
        errorData?.message || errorData?.error || ''
      ).trim();
      if (
        serverMsg &&
        !/^internal server error$/i.test(serverMsg)
      ) {
        return {
          userMessage: serverMsg,
          shouldRedirect: false,
        };
      }
      return {
        userMessage:
          'Произошла ошибка на сервере. Пожалуйста, попробуйте позже или свяжитесь с поддержкой.',
        shouldRedirect: false,
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

    // Проверка профиля перед отправкой заказа
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

    // Менеджер: проверяем профиль выбранного клиента
    if (isAdminOrManager && selectedClientUser) {
      const clientValidation = validateUserProfile(selectedClientUser);
      if (!clientValidation.isValid) {
        const clientName = selectedClientUser.name || selectedClientUser.company_name || 'Клиент';
        showErrorToast(
          `Профиль клиента «${clientName}» не заполнен. ${clientValidation.message}`
        );
        return;
      }
    }

    if (!selectedWarehouse || !previewStorage) {
      return;
    }

    if (!monthsNumber || monthsNumber <= 0) {
      return;
    }

    const storageId = Number(previewStorage.id ?? previewStorage.storage_id);
    if (!Number.isFinite(storageId) || storageId <= 0) {
      return;
    }

    const selectedPricePreview =
      paymentType === PAYMENT_TYPE_OPTIONS.FULL
        ? (fullPricePreview || pricePreview)
        : (pricePreview || fullPricePreview);

    try {
      setIsSubmittingOrder(true);

      const orderItems = [
        {
          name: "Вещь",
          volume: 1,
          cargo_mark: "NO",
        },
      ];

      // Формируем дату начала бронирования
      const startDate = individualBookingStartDate ? new Date(individualBookingStartDate).toISOString() : new Date().toISOString();

      const orderData = {
        storage_id: storageId,
        months: monthsNumber,
        start_date: startDate,
        order_items: orderItems,
        is_selected_moving: includeMoving,
        is_selected_package: includePacking,
        payment_type: paymentType, // Тип оплаты: MONTHLY или FULL
      };

      if (isAdminOrManager && selectedClientUser) {
        orderData.user_id = selectedClientUser.id;
      }

      // Добавляем промокод, если он применен
      if (promoSuccess && promoCode) {
        orderData.promo_code = promoCode;
      }

      // MANAGER/ADMIN: сумма аренды и разбивка как в превью (calculate-bulk), иначе на бэкенде пересчёт не совпадёт с orders.total_price
      if (
        isAdminOrManager &&
        selectedPricePreview &&
        Number.isFinite(Number(selectedPricePreview.total)) &&
        Number(selectedPricePreview.total) >= 0
      ) {
        orderData.total_price = Math.round(Number(selectedPricePreview.total));
        if (selectedPricePreview.pricingBreakdown) {
          orderData.pricing_breakdown = selectedPricePreview.pricingBreakdown;
          const rid = selectedPricePreview.pricingBreakdown.ruleId;
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
    includeMoving,
    includePacking,
    isAuthenticated,
    isSubmittingOrder,
    isUserRole,
    isAdminOrManager,
    selectedClientUser,
    monthsNumber,
    navigate,
    previewStorage,
    selectedWarehouse,
    openCallbackModal,
    individualBookingStartDate,
    promoCode,
    fullPricePreview,
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

    // Проверка профиля перед отправкой заказа
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

    // Менеджер: проверяем профиль выбранного клиента
    if (isAdminOrManager && selectedClientUser) {
      const clientValidation = validateUserProfile(selectedClientUser);
      if (!clientValidation.isValid) {
        const clientName = selectedClientUser.name || selectedClientUser.company_name || 'Клиент';
        showErrorToast(
          `Профиль клиента «${clientName}» не заполнен. ${clientValidation.message}`
        );
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

    try {
      setIsSubmittingOrder(true);

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

      const orderData = {
        storage_id: Number(cloudStorage.id),
        months: cloudMonthsNumber,
        start_date: cloudStartDate,
        order_items: orderItems,
        is_selected_moving: cloudIncludeMoving,
        is_selected_package: cloudIncludePacking,
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
    cloudBookingStartDate,
    cloudIncludeMoving,
    cloudIncludePacking,
    cloudMonthsNumber,
    cloudStorage,
    cloudVolume,
    isAuthenticated,
    isSubmittingOrder,
    isUserRole,
    isAdminOrManager,
    selectedClientUser,
    navigate,
    selectedTariff,
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

  const openStorageFormatModal = useCallback((formatKey = "INDIVIDUAL") => {
    setActiveStorageTab(formatKey);
    setCityStoragePhase(CITY_STORAGE_PHASE.BOOKING);
    setIsStorageFormatModalOpen(true);
  }, []);

  /** CTA hero: сразу открываем модал с бронированием индивидуального хранения. */
  const scrollToCityStorageSection = useCallback(() => {
    openStorageFormatModal("INDIVIDUAL");
  }, [openStorageFormatModal]);

  const scrollToStorageFormatsSection = useCallback(() => {
    document.getElementById("storage-formats-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlePromoModalContinue = useCallback(() => {
    setIsPromoBookingModalOpen(false);
    setPromoGuidedBooking(true);
    setIndividualMonths("2");
    setActiveStorageTab("INDIVIDUAL");
    setCityStoragePhase(CITY_STORAGE_PHASE.BOOKING);
    setIsStorageFormatModalOpen(true);
  }, []);

  const handleStorageFormatCardClick = useCallback((formatKey) => {
    openStorageFormatModal(formatKey);
  }, [openStorageFormatModal]);

  /**
   * Embed-режим: страница встроена в product-страницу как inline-секция.
   * Сразу открываем нужный формат в фазе BOOKING и предзаполняем параметры,
   * выбранные в калькуляторе на product-странице (объём, срок).
   */
  useEffect(() => {
    if (!bookingEmbedFormat) return;
    if (!["INDIVIDUAL", "CLOUD", "LOCKERS"].includes(bookingEmbedFormat)) return;
    setActiveStorageTab(bookingEmbedFormat);
    setCityStoragePhase(CITY_STORAGE_PHASE.BOOKING);
    setIsStorageFormatModalOpen(true);

    const months = Number.parseInt(embedInitialMonths, 10);
    const volume = Number.parseFloat(embedInitialVolume);

    if (bookingEmbedFormat === "INDIVIDUAL") {
      if (Number.isFinite(months) && months > 0) {
        setIndividualMonths(String(months));
      }
    } else if (bookingEmbedFormat === "CLOUD") {
      if (Number.isFinite(volume) && volume > 0) {
        setCloudVolumeDirect(volume);
        // Активируем тариф «Свои габариты» и подгоняем объём через габариты —
        // тогда `cloudVolume` в расчётах будет равен запрошенному объёму.
        setSelectedTariff({
          id: 'custom',
          name: 'Свои габариты',
          image: null,
          isCustom: true,
        });
        setCloudDimensions({ width: volume, height: 1, length: 1 });
      }
      if (Number.isFinite(months) && months > 0) {
        setCloudMonths(String(months));
      }
    }
    // Для LOCKERS параметры (объём/дни) прокидываются в StorageLockersSection
    // напрямую через initialVolumeM3 / initialDays, см. рендер.
  }, [bookingEmbedFormat, embedInitialVolume, embedInitialMonths]);

  const scrollToCallbackSection = useCallback(() => {
    document.getElementById('callback-request-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleCallbackRequestClick = useCallback(() => {
    scrollToCallbackSection();
  }, [scrollToCallbackSection]);

  useEffect(() => {
    if (cityStoragePhase !== CITY_STORAGE_PHASE.ABOUT) {
      setCityStorageVideoModalOpen(false);
    }
  }, [cityStoragePhase]);

  useEffect(() => {
    if (activeStorageTab !== "CLOUD") {
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
        const filtered = filterVisibleWarehouses(data);
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
    let isCancelled = false;

    const calculatePrice = async () => {
      if (activeStorageTab !== "INDIVIDUAL") {
        setIndividualPricePreviews(EMPTY_INDIVIDUAL_PRICE_PREVIEWS);
        return;
      }

      if (!selectedWarehouse || selectedWarehouse?.type === "CLOUD") {
        setIndividualPricePreviews(EMPTY_INDIVIDUAL_PRICE_PREVIEWS);
        return;
      }

      if (!previewStorage) {
        setIndividualPricePreviews(EMPTY_INDIVIDUAL_PRICE_PREVIEWS);
        return;
      }

      if (!monthsNumber || monthsNumber <= 0) {
        setIndividualPricePreviews(EMPTY_INDIVIDUAL_PRICE_PREVIEWS);
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
        setIndividualPricePreviews(EMPTY_INDIVIDUAL_PRICE_PREVIEWS);
        return;
      }

      setIsPriceCalculating(true);

      try {
        const basePayload = {
          storageType: "INDIVIDUAL",
          months: monthsNumber,
          area: rawArea,
          services: [],
          warehouse_id: selectedWarehouse.id,
          storage_id: previewStorage?.id,
          // Добавляем tier из выбранного бокса, если есть
          ...(previewStorage?.tier !== undefined && previewStorage?.tier !== null && { tier: previewStorage.tier }),
        };

        const buildPreviewFromResponse = (response, paymentType) => {
          const storagePrice = response?.storage?.price;
          if (typeof storagePrice !== "number" || Number.isNaN(storagePrice) || storagePrice <= 0) {
            return null;
          }

          const pricingBreakdown = response?.storage?.pricingBreakdown;
          return {
            total: storagePrice,
            monthly: pricingBreakdown ? null : storagePrice / monthsNumber,
            pricingBreakdown: pricingBreakdown || null,
            paymentType,
            isFallback: false,
          };
        };

        const paymentTypes = [PAYMENT_TYPE_OPTIONS.MONTHLY, PAYMENT_TYPE_OPTIONS.FULL];
        const previewEntries = await Promise.all(
          paymentTypes.map(async (paymentType) => {
            const response = await warehouseApi.calculateBulkPrice({
              ...basePayload,
              payment_type: paymentType,
            });

            return [paymentType, buildPreviewFromResponse(response, paymentType)];
          })
        );

        if (isCancelled) return;

        const previews = Object.fromEntries(previewEntries);
        const fallback = (parseFloat(previewStorage.price) || 0) * monthsNumber;

        if (!previews[PAYMENT_TYPE_OPTIONS.MONTHLY] && fallback > 0) {
          previews[PAYMENT_TYPE_OPTIONS.MONTHLY] = {
            total: fallback,
            monthly: fallback / monthsNumber,
            pricingBreakdown: null,
            paymentType: PAYMENT_TYPE_OPTIONS.MONTHLY,
            isFallback: true,
          };
        }

        if (!previews[PAYMENT_TYPE_OPTIONS.FULL]) {
          previews[PAYMENT_TYPE_OPTIONS.FULL] =
            (previews[PAYMENT_TYPE_OPTIONS.MONTHLY]
              ? {
                  ...previews[PAYMENT_TYPE_OPTIONS.MONTHLY],
                  paymentType: PAYMENT_TYPE_OPTIONS.FULL,
                }
              : null) ||
            (fallback > 0
              ? {
                  total: fallback,
                  monthly: fallback / monthsNumber,
                  pricingBreakdown: null,
                  paymentType: PAYMENT_TYPE_OPTIONS.FULL,
                  isFallback: true,
                }
              : null);
        }

        setIndividualPricePreviews({
          MONTHLY: previews[PAYMENT_TYPE_OPTIONS.MONTHLY] || null,
          FULL: previews[PAYMENT_TYPE_OPTIONS.FULL] || null,
        });
      } catch (error) {
        console.error("Ошибка при расчёте предварительной стоимости:", error);
        if (isCancelled) return;

        const fallback = monthsNumber && previewStorage?.price
          ? (parseFloat(previewStorage.price) || 0) * monthsNumber
          : null;

        if (fallback) {
          const fallbackPreview = {
            total: fallback,
            monthly: fallback / monthsNumber,
            pricingBreakdown: null,
            isFallback: true,
          };
          setIndividualPricePreviews({
            MONTHLY: {
              ...fallbackPreview,
              paymentType: PAYMENT_TYPE_OPTIONS.MONTHLY,
            },
            FULL: {
              ...fallbackPreview,
              paymentType: PAYMENT_TYPE_OPTIONS.FULL,
            },
          });
        } else {
          setIndividualPricePreviews(EMPTY_INDIVIDUAL_PRICE_PREVIEWS);
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
      const updated = filterVisibleWarehouses(data);
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
      const updated = filterVisibleWarehouses(data);
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

  const individualPaymentPreviewOptions = useMemo(() => ({
    MONTHLY: {
      totalPrice: costSummary.baseTotal || 0,
      discountAmount: promoDiscount,
      pricingBreakdown: costSummary.pricingBreakdown || null,
    },
    FULL: {
      totalPrice: fullPaymentCostSummary.baseTotal || 0,
      discountAmount: fullPaymentPromoDiscount,
      pricingBreakdown: fullPaymentCostSummary.pricingBreakdown || null,
    },
  }), [
    costSummary.baseTotal,
    costSummary.pricingBreakdown,
    promoDiscount,
    fullPaymentCostSummary.baseTotal,
    fullPaymentCostSummary.pricingBreakdown,
    fullPaymentPromoDiscount,
  ]);

  return (
    <div
      className={
        isEmbed
          ? "font-['Montserrat'] w-full bg-white"
          : "font-['Montserrat'] min-h-screen bg-white flex flex-col"
      }
    >
      {!isEmbed && <Header />}

      {!isEmbed && (
        <HeroSection
          onOpenPromoBooking={openPromoBookingModal}
          onBookClick={scrollToStorageFormatsSection}
        />
      )}

      {!isEmbed && (
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
      )}

      {!isEmbed && (
      <Dialog open={cityStorageVideoModalOpen} onOpenChange={setCityStorageVideoModalOpen}>
        <DialogContent className="!max-w-[100vw] w-[100vw] sm:w-auto sm:max-w-[95vw] !h-[95vh] sm:!h-auto sm:!min-h-0 p-0 gap-0 overflow-hidden bg-transparent sm:bg-transparent border-0 shadow-none rounded-none [&>button]:text-white [&>button]:hover:text-white [&>button]:sm:bg-black/50 [&>button]:sm:rounded-full">
          <div className="relative w-full h-full min-h-[85vh] sm:min-h-0 sm:flex sm:items-center sm:justify-center">
            {activeStorageTab && STORAGE_ABOUT_COPY[activeStorageTab]?.videoSrc ? (
              <video
                key={activeStorageTab}
                src={STORAGE_ABOUT_COPY[activeStorageTab].videoSrc}
                poster={STORAGE_ABOUT_COPY[activeStorageTab].videoPoster}
                controls
                className="block w-full h-full sm:w-auto sm:h-auto sm:max-h-[90vh] sm:max-w-full object-contain"
                autoPlay
                playsInline
                title={STORAGE_ABOUT_COPY[activeStorageTab].title}
              >
                Ваш браузер не поддерживает воспроизведение видео.
              </video>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
      )}

      <BookingShell isEmbed={isEmbed} isOpen={isStorageFormatModalOpen} onOpenChange={setIsStorageFormatModalOpen}>
      {/* Секция: Хранение в городе */}
      <section ref={tabsSectionRef} className="w-full scroll-mt-14 bg-[#FFF] py-6 sm:scroll-mt-16 sm:py-8">
        <div className="container mx-auto px-2 sm:px-2 lg:px-3 xl:px-3 max-w-7xl">
          {/* Заголовок */}
          {!isEmbed && (
            <h2 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-bold mb-6">
              хранение в городе
            </h2>
          )}

          <AnimatePresence mode="wait">
            {/* Типы слева, описание и «Выбрать» справа */}
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
                  {["INDIVIDUAL", "LOCKERS", "CLOUD"].map((key, index) => {
                    const active = activeStorageTab === key;
                    return (
                      <motion.button
                        key={key}
                        type="button"
                        layout
                        initial={{ opacity: 0, x: 8 }}
                        animate={{
                          opacity: 1,
                          x: 0,
                          scale: active ? 1.03 : 1,
                        }}
                        transition={{
                          delay: 0.06 + index * 0.06,
                          duration: 0.35,
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
                      {STORAGE_ABOUT_COPY[activeStorageTab].videoSrc ? (
                        <motion.div
                          className="mt-5 overflow-hidden rounded-2xl bg-black shadow-md ring-1 ring-black/10 md:hidden"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay:
                              0.06 +
                              STORAGE_ABOUT_COPY[activeStorageTab].bullets.length * 0.06,
                            duration: 0.35,
                            ease: CITY_STORAGE_EASE,
                          }}
                        >
                          <video
                            key={activeStorageTab}
                            className="aspect-video w-full object-cover"
                            src={STORAGE_ABOUT_COPY[activeStorageTab].videoSrc}
                            poster={STORAGE_ABOUT_COPY[activeStorageTab].videoPoster}
                            controls
                            playsInline
                            preload="metadata"
                            title={STORAGE_ABOUT_COPY[activeStorageTab].title}
                          >
                            Ваш браузер не поддерживает воспроизведение видео.
                          </video>
                        </motion.div>
                      ) : null}
                      <div className="mt-8 flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center md:gap-4">
                        {STORAGE_ABOUT_COPY[activeStorageTab].videoSrc ? (
                          <motion.button
                            type="button"
                            onClick={() => setCityStorageVideoModalOpen(true)}
                            className="hidden md:inline-flex md:flex-shrink-0 items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-transparent border-2 border-[#31876D] text-[#31876D] text-sm sm:text-base font-medium rounded-lg hover:bg-[#31876D]/10 focus:outline-none focus:ring-2 focus:ring-[#31876D] focus:ring-offset-2 touch-manipulation"
                            initial={{ opacity: 0, x: 8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay:
                                0.06 +
                                STORAGE_ABOUT_COPY[activeStorageTab].bullets.length * 0.06,
                              duration: 0.35,
                              ease: CITY_STORAGE_EASE,
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Play size={18} className="flex-shrink-0" fill="currentColor" aria-hidden />
                            Посмотреть видео
                          </motion.button>
                        ) : null}
                        <motion.button
                          type="button"
                          onClick={() => setCityStoragePhase(CITY_STORAGE_PHASE.BOOKING)}
                          className="w-full rounded-2xl bg-[#31876D] px-8 py-3.5 text-center text-base font-semibold text-white shadow-md md:w-auto"
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{
                            delay:
                              0.06 +
                              (STORAGE_ABOUT_COPY[activeStorageTab].bullets.length +
                                (STORAGE_ABOUT_COPY[activeStorageTab].videoSrc ? 1 : 0)) *
                                0.06,
                            duration: 0.35,
                            ease: CITY_STORAGE_EASE,
                          }}
                          whileHover={{ scale: 1.02, boxShadow: "0 12px 28px rgba(49, 135, 109, 0.35)" }}
                          whileTap={{ scale: 0.98 }}
                        >
                          Выбрать
                        </motion.button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
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
              {!isEmbed && (
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
              )}

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
                    initialSearchSize={
                      isEmbed && bookingEmbedFormat === "INDIVIDUAL"
                        ? embedInitialVolume
                        : undefined
                    }
                  />
                </div>

                {/* Правая панель - Форма конфигурации */}
                <div className="bg-[#F7FAF9] rounded-3xl p-6 shadow-lg min-h-[450px] flex flex-col">
                  <h2 className="font-soyuz-grotesk text-2xl sm:text-3xl font-bold text-[#202422] mb-6">
                    Настройте хранение
                  </h2>

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
                      />
                    </div>

                    <div ref={promoPackingSectionRef}>
                      <PackingServicesSection
                        includePacking={includePacking}
                        setIncludePacking={setIncludePacking}
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
                      fullPaymentDiscountInfo={fullPaymentDiscountInfo}
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

                      // сеттеры состояний
                      setShowOrderDetails={setShowOrderDetails}
                      setShowPromoInput={setShowPromoInput}
                      setPromoCodeInput={setPromoCodeInput}
                      setPromoError={setPromoError}

                      // обработчики
                      handleApplyPromoCode={handleApplyPromoCode}
                      handleRemovePromoCode={handleRemovePromoCode}
                      selectedWarehouse={selectedWarehouse}
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
                    <DateField
                      label="Дата начала бронирования"
                      value={cloudBookingStartDate}
                      onChange={setCloudBookingStartDate}
                      minDate={getTodayLocalDateString()}
                      allowFutureDates
                      variant="account"
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

                  {/* Дополнительные опции */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-[#273655] mb-3">Дополнительно</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
                        <span className="text-sm font-medium text-[#273655]">Нужна перевозка</span>
                        <Switch
                          checked={cloudIncludeMoving}
                          onCheckedChange={setCloudIncludeMoving}
                          className="bg-gray-300 data-[state=checked]:bg-[#00A991]"
                        />
                      </div>
                      <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3">
                        <span className="text-sm font-medium text-[#273655]">Нужна упаковка</span>
                        <Switch
                          checked={cloudIncludePacking}
                          onCheckedChange={setCloudIncludePacking}
                          className="bg-gray-300 data-[state=checked]:bg-[#00A991]"
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
                initialVolumeM3={
                  isEmbed && bookingEmbedFormat === "LOCKERS"
                    ? embedInitialVolume
                    : undefined
                }
                initialDays={
                  isEmbed && bookingEmbedFormat === "LOCKERS"
                    ? embedInitialDays
                    : undefined
                }
              />
            </TabsContent>
          </Tabs>
              </motion.div>
          )}
          </AnimatePresence>
        </div>
      </section>
      </BookingShell>

      {!isEmbed && <StorageFormatsSection />}

      {!isEmbed && <StorageFormatsExplainerSection />}

      {!isEmbed && <CallbackRequestSection showRegisterPrompt={!isAuthenticated} />}

      {!isEmbed && <QuickBookingSection />}

      {!isEmbed && <WarehouseGallery onBookInWarehouse={handleGalleryBookInWarehouse} />}

      {!isEmbed && <ClimateSensorsSection />}

      {!isEmbed && <BranchesSection warehouses={warehouses} />}

      <CallbackRequestModal
        open={isCallbackModalOpen}
        onOpenChange={handleCallbackModalOpenChange}
        showRegisterPrompt={!isAuthenticated}
        title={callbackModalContext === 'max_orders_limit' ? 'Связаться с поддержкой' : undefined}
        description={callbackModalDescription}
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
          0
        }
        discountAmount={
          paymentPreviewType === 'CLOUD'
            ? cloudPromoDiscount
            : promoDiscount
        }
        priceOptions={
          paymentPreviewType === 'CLOUD'
            ? null
            : individualPaymentPreviewOptions
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
              const updated = filterVisibleWarehouses(data);
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

      {!isEmbed && (
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
      )}

      {!isEmbed && <div className="w-full bg-[#FFF] h-8 sm:h-16"></div>}

      {!isEmbed && <Footer />}
    </div>
  );
});

HomePage.displayName = "HomePage";

export default HomePage;
