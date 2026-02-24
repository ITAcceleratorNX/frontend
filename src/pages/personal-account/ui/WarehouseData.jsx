import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {showInfoToast, showSuccessToast, showErrorToast} from '../../../shared/lib/toast';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import { warehouseApi } from '../../../shared/api/warehouseApi';
import { paymentsApi } from '../../../shared/api/paymentsApi';
import Sidebar from './Sidebar';
import WarehouseCanvasViewer from '../../../shared/components/WarehouseCanvasViewer';
import WarehouseSVGMap from '../../../components/WarehouseSVGMap';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '../../../components/ui';
import { Popover, PopoverTrigger, PopoverContent } from '../../../components/ui/popover';
import { X, Info, User } from 'lucide-react';
import { Dropdown } from '../../../shared/components/Dropdown';
import PendingOrderModal from './PendingOrderModal';
import { ordersApi } from '../../../shared/api/ordersApi';
import { RentalPeriodSelect } from '../../../shared/ui/RentalPeriodSelect';
import { getTodayLocalDateString } from '../../../shared/lib/utils/date';
import PricingRuleManagement from './PricingRuleManagement';
import {StoragePricesMatrix} from "../../../../src/pages/personal-account/admin/StoragePricesMatrix.js";
import {useStoragePrices} from "../../../../src/shared/hooks/useStoragePrices.js";
import { formatServiceDescription } from '@/shared/lib/utils/serviceNames';
import { promoApi } from '@/shared/api/promoApi';
import CloudTariffs from '@/pages/home/components/order/CloudTariffs.jsx';
import sumkaImg from '../../../assets/cloud-tariffs/sumka.png';
import motorcycleImg from '../../../assets/cloud-tariffs/motorcycle.png';
import bicycleImg from '../../../assets/cloud-tariffs/bicycle.png';
import furnitureImg from '../../../assets/cloud-tariffs/furniture.png';
import shinaImg from '../../../assets/cloud-tariffs/shina.png';
import sunukImg from '../../../assets/cloud-tariffs/sunuk.png';
import garazhImg from '../../../assets/cloud-tariffs/garazh.png';
import skladImg from '../../../assets/cloud-tariffs/sklad.png';

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
    case "GAZELLE_FROM":
      return "Газель - Доставка";
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

const WarehouseData = ({ embedded = false, onBookingComplete }) => {
  const navigate = useNavigate();
  const { warehouseId: routeWarehouseId } = useParams();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [embeddedWarehouseId, setEmbeddedWarehouseId] = useState(null);
  const [embeddedStorageType, setEmbeddedStorageType] = useState('INDIVIDUAL'); // 'INDIVIDUAL' | 'CLOUD'
  const warehouseId = embedded ? embeddedWarehouseId : routeWarehouseId;
  const [warehouse, setWarehouse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeNav, setActiveNav] = useState('warehouses');
  const [warehouseTab, setWarehouseTab] = useState('warehouse'); // 'warehouse' | 'pricing'
  const [isCloud, setIsCloud] = useState(false);
  const [servicePrices, setServicePrices] = useState({});
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);
  const [individualMonths, setIndividualMonths] = useState('1');
  const [individualBookingStartDate, setIndividualBookingStartDate] = useState(() => getTodayLocalDateString());
  const [cloudMonths, setCloudMonths] = useState('1');
  const [cloudBookingStartDate, setCloudBookingStartDate] = useState(() => getTodayLocalDateString());
  const [cloudDimensions, setCloudDimensions] = useState({ width: 1, height: 1, length: 1 });
  const [cloudVolumeDirect, setCloudVolumeDirect] = useState(1);
  const [selectedTariff, setSelectedTariff] = useState(null);
  const [currentTariffIndex, setCurrentTariffIndex] = useState(0);
  const [tariffsPerView, setTariffsPerView] = useState(3);
  const [tariffPrices, setTariffPrices] = useState({});
  const [cloudCustomPrices, setCloudCustomPrices] = useState({ low: null, high: null });
  const [includeMoving, setIncludeMoving] = useState(false);
  const [includePacking, setIncludePacking] = useState(false);
  const [movingAddressFrom, setMovingAddressFrom] = useState('');
  const [movingPickupDate, setMovingPickupDate] = useState(() => getTodayLocalDateString());
  // Состояние для moving_orders (для возврата вещей при добавлении GAZELLE_TO)
  const [movingOrders, setMovingOrders] = useState([]);
  // Состояние для адреса возврата (GAZELLE_TO)
  const [movingAddressTo, setMovingAddressTo] = useState('');
  const [cloudPickupAddress, setCloudPickupAddress] = useState('');
  const [cloudPickupDate, setCloudPickupDate] = useState(() => getTodayLocalDateString());
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
  const [orderError, setOrderError] = useState(null);
  // Промокод INDIVIDUAL
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState(false);
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);
  // Промокод CLOUD
  const [cloudPromoCode, setCloudPromoCode] = useState('');
  const [cloudPromoCodeInput, setCloudPromoCodeInput] = useState('');
  const [cloudPromoDiscount, setCloudPromoDiscount] = useState(0);
  const [cloudPromoDiscountPercent, setCloudPromoDiscountPercent] = useState(0);
  const [cloudPromoError, setCloudPromoError] = useState('');
  const [cloudPromoSuccess, setCloudPromoSuccess] = useState(false);
  const [isValidatingCloudPromo, setIsValidatingCloudPromo] = useState(false);
  const [showCloudPromoInput, setShowCloudPromoInput] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [isPendingOrderModalOpen, setIsPendingOrderModalOpen] = useState(false);
  const [isLoadingPendingOrder, setIsLoadingPendingOrder] = useState(false);
  const [isUnbooking, setIsUnbooking] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [megaSelectedMap, setMegaSelectedMap] = useState(1);
  const [komfortSelectedMap, setKomfortSelectedMap] = useState(1);
  const mapRef = useRef(null);

  // Массовое обновление цен боксов (по фильтрам)
  const [bulkPriceTier, setBulkPriceTier] = useState('');
  const [bulkPriceFrom, setBulkPriceFrom] = useState('');
  const [bulkPriceTo, setBulkPriceTo] = useState('');
  const [bulkPriceValue, setBulkPriceValue] = useState('');
  const [bulkPriceUpdating, setBulkPriceUpdating] = useState(false);
  const [bulkPriceUpdatedCount, setBulkPriceUpdatedCount] = useState(null);
  const [bulkPriceWarehouseId, setBulkPriceWarehouseId] = useState(warehouseId || '');

  const { refetch, prices } = useStoragePrices();

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

  // Карточка "Свои габариты" - статичная
  const customTariff = useMemo(() => ({
    id: 'custom',
    name: 'Свои габариты',
    image: null,
    isCustom: true
  }), []);

  // Остальные тарифы - подвижные в карусели
  const regularTariffs = useMemo(() => {
    const tariffs = [
      { id: 'sumka', name: 'Хранения сумки / коробки вещей', image: sumkaImg, pricePerM3: tariffPrices['CLOUD_TARIFF_SUMKA'] || 6000, maxVolume: 0.25, baseVolume: 0.25, basePrice: null },
      { id: 'shina', name: 'Шины', image: shinaImg, pricePerM3: tariffPrices['CLOUD_TARIFF_SHINA'] || 5000, maxVolume: 0.5, baseVolume: 0.5, basePrice: null },
      { id: 'motorcycle', name: 'Хранение мотоцикла', image: motorcycleImg, pricePerM3: tariffPrices['CLOUD_TARIFF_MOTORCYCLE'] || 25000, maxVolume: 1.8, baseVolume: 1.8, basePrice: null },
      { id: 'bicycle', name: 'Хранение велосипед', image: bicycleImg, pricePerM3: tariffPrices['CLOUD_TARIFF_BICYCLE'] || 6000, maxVolume: 0.9, baseVolume: 0.9, basePrice: null },
      { id: 'sunuk', name: 'Сундук до 1 м³', image: sunukImg, basePrice: 15000, pricePerM3: tariffPrices['CLOUD_TARIFF_SUNUK'] || 15000, maxVolume: 1, baseVolume: 1 },
      { id: 'furniture', name: 'Шкаф до 2 м³', image: furnitureImg, basePrice: 27000, pricePerM3: tariffPrices['CLOUD_TARIFF_FURNITURE'] || 13500, baseVolume: 2, maxVolume: 2 },
      { id: 'sklad', name: 'Кладовка до 3 м³', image: skladImg, basePrice: 38000, pricePerM3: tariffPrices['CLOUD_TARIFF_SKLAD'] || 12667, maxVolume: 3, baseVolume: 3 },
      { id: 'garazh', name: 'Гараж до 9м³', image: garazhImg, basePrice: 90000, pricePerM3: tariffPrices['CLOUD_TARIFF_GARAZH'] || 10000, maxVolume: 9, baseVolume: 9 }
    ];
    return tariffs;
  }, [tariffPrices]);

  const maxTariffIndex = Math.max(0, regularTariffs.length - tariffsPerView);
  const handleTariffPrev = useCallback(() => {
    setCurrentTariffIndex((prev) => Math.max(0, prev - 1));
  }, []);
  const handleTariffNext = useCallback(() => {
    setCurrentTariffIndex((prev) => Math.min(maxTariffIndex, prev + 1));
  }, [maxTariffIndex]);

  // Расчет объема для CLOUD
  const cloudVolume = useMemo(() => {
    if (selectedTariff && !selectedTariff.isCustom) {
      const tariffVolume = selectedTariff.baseVolume ?? selectedTariff.maxVolume ?? cloudVolumeDirect;
      return Number.isFinite(tariffVolume) && tariffVolume > 0 ? tariffVolume : 0;
    }
    const { width, height, length } = cloudDimensions;
    const volume = Number(width) * Number(height) * Number(length);
    return Number.isFinite(volume) && volume > 0 ? volume : 0;
  }, [cloudDimensions, cloudVolumeDirect, selectedTariff]);

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
      if (embedded) {
        setEmbeddedWarehouseId(String(newWarehouseId));
      } else {
        navigate(`/personal-account/${user?.role === 'ADMIN' ? 'admin' : 'manager'}/warehouses/${newWarehouseId}`);
      }
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

  // Загрузка цен тарифов облачного хранения из API
  useEffect(() => {
    const loadTariffPrices = async () => {
      try {
        const pricesData = await paymentsApi.getPrices();
        const tariffTypes = [
          'CLOUD_TARIFF_SUMKA', 'CLOUD_TARIFF_SHINA', 'CLOUD_TARIFF_MOTORCYCLE', 'CLOUD_TARIFF_BICYCLE',
          'CLOUD_TARIFF_SUNUK', 'CLOUD_TARIFF_FURNITURE', 'CLOUD_TARIFF_SKLAD', 'CLOUD_TARIFF_GARAZH'
        ];
        const pricesMap = {};
        let cloudM3Price = null;
        pricesData.forEach((price) => {
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
        setTariffPrices({});
        setCloudCustomPrices({ low: null, high: null });
      }
    };
    loadTariffPrices();
  }, []);

  // При переключении на облако устанавливаем "Свои габариты" по умолчанию
  useEffect(() => {
    if (isCloud && !selectedTariff) {
      setSelectedTariff(customTariff);
      setCloudDimensions({ width: 1, height: 1, length: 1 });
    }
  }, [isCloud, selectedTariff, customTariff]);

  // Обработка изменения размера экрана для карусели тарифов
  useEffect(() => {
    const handleResize = () => {
      const newTariffsPerView = window.innerWidth < 768 ? 1 : 3;
      setTariffsPerView(newTariffsPerView);
      const newMaxIndex = Math.max(0, regularTariffs.length - newTariffsPerView);
      setCurrentTariffIndex((prev) => Math.min(prev, newMaxIndex));
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [regularTariffs.length]);

  // Расчет цены для CLOUD складов (на фронте по выбранному тарифу)
  useEffect(() => {
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
    if (!selectedTariff) {
      setCloudPricePreview(null);
      setCloudPriceError(null);
      return;
    }
    if (selectedTariff && !selectedTariff.isCustom) {
      const monthlyPrice = selectedTariff.basePrice ?? selectedTariff.pricePerM3 ?? 0;
      const totalPrice = Math.round(monthlyPrice * cloudMonthsNumber);
      setCloudPricePreview({
        total: totalPrice,
        monthly: monthlyPrice,
        isFallback: false,
      });
      setCloudPriceError(null);
    } else if (selectedTariff?.isCustom) {
      if (!cloudVolume || cloudVolume <= 0) {
        setCloudPricePreview(null);
        setCloudPriceError("Укажите габариты вещей, чтобы рассчитать объём хранения.");
        return;
      }
      const pricePerM3 = cloudCustomPrices.low ?? cloudCustomPrices.high ?? 9500;
      const monthlyPrice = Math.round(pricePerM3 * cloudVolume);
      const totalPrice = Math.round(monthlyPrice * cloudMonthsNumber);
      setCloudPricePreview({
        total: totalPrice,
        monthly: monthlyPrice,
        isFallback: false,
      });
      setCloudPriceError(null);
    } else {
      setCloudPricePreview(null);
      setCloudPriceError(null);
    }
  }, [isCloud, warehouse, cloudMonthsNumber, cloudVolume, selectedTariff, cloudCustomPrices]);

  // Расчет стоимости услуг (перевозка, упаковка)
  const serviceSummary = useMemo(() => {
    const breakdown = [];
    let total = 0;

    // Перевозка вещей (только доставка)
    if (includeMoving && gazelleService) {
      const count = 1; // Только доставка
      const amount = (gazelleService.price ?? MOVING_SERVICE_ESTIMATE) * count;
      total += amount;
      breakdown.push({
        label: gazelleService.name || "Доставка (с клиента на склад)",
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
          label: formatServiceDescription(option?.description) || getServiceTypeName(option?.type) || "Услуга",
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
    const baseMonthly = pricePreview ? Math.round(pricePreview.monthly || (pricePreview.total / (parseInt(individualMonths, 10) || 1))) : null;
    const baseTotal = pricePreview ? Math.round(pricePreview.total) : null;
    const serviceTotal = serviceSummary.total;
    const combinedTotal = (baseTotal || 0) + serviceTotal;

    return {
      baseMonthly,
      baseTotal,
      serviceTotal,
      combinedTotal,
      pricingBreakdown: pricePreview?.pricingBreakdown || null,
    };
  }, [pricePreview, serviceSummary.total, individualMonths]);

  // Промокод INDIVIDUAL
  const handleApplyPromoCode = useCallback(async () => {
    if (!promoCodeInput.trim()) {
      setPromoError('Введите промокод');
      return;
    }
    const totalAmount = costSummary.combinedTotal || 0;
    if (totalAmount <= 0) {
      setPromoError('Сначала выберите бокс и срок аренды');
      return;
    }
    try {
      setIsValidatingPromo(true);
      setPromoError('');
      setPromoSuccess(false);
      const result = await promoApi.validate(promoCodeInput.trim(), totalAmount);
      if (result.valid) {
        setPromoCode(promoCodeInput.trim());
        setPromoDiscount(result.discount_amount || 0);
        setPromoDiscountPercent(result.discount_percent || 0);
        setPromoSuccess(true);
        setPromoError('');
        showSuccessToast(`Промокод применен! Скидка ${result.discount_percent}%`);
      } else {
        setPromoError(result.error || 'Недействительный промокод');
        setPromoCode('');
        setPromoDiscount(0);
        setPromoDiscountPercent(0);
        setPromoSuccess(false);
      }
    } catch (err) {
      console.error('Ошибка при проверке промокода:', err);
      setPromoError('Ошибка при проверке промокода');
      setPromoCode('');
      setPromoDiscount(0);
      setPromoDiscountPercent(0);
      setPromoSuccess(false);
    } finally {
      setIsValidatingPromo(false);
    }
  }, [promoCodeInput, costSummary.combinedTotal]);

  const handleRemovePromoCode = useCallback(() => {
    setPromoCode('');
    setPromoCodeInput('');
    setPromoDiscount(0);
    setPromoDiscountPercent(0);
    setPromoError('');
    setPromoSuccess(false);
    setShowPromoInput(false);
  }, []);

  // Промокод CLOUD
  const handleApplyCloudPromoCode = useCallback(async () => {
    if (!cloudPromoCodeInput.trim()) {
      setCloudPromoError('Введите промокод');
      return;
    }
    const totalAmount = cloudPricePreview?.total || 0;
    if (totalAmount <= 0) {
      setCloudPromoError('Сначала выберите тариф и срок аренды');
      return;
    }
    try {
      setIsValidatingCloudPromo(true);
      setCloudPromoError('');
      setCloudPromoSuccess(false);
      const result = await promoApi.validate(cloudPromoCodeInput.trim(), totalAmount);
      if (result.valid) {
        setCloudPromoCode(cloudPromoCodeInput.trim());
        setCloudPromoDiscount(result.discount_amount || 0);
        setCloudPromoDiscountPercent(result.discount_percent || 0);
        setCloudPromoSuccess(true);
        setCloudPromoError('');
        showSuccessToast(`Промокод применен! Скидка ${result.discount_percent}%`);
      } else {
        setCloudPromoError(result.error || 'Недействительный промокод');
        setCloudPromoCode('');
        setCloudPromoDiscount(0);
        setCloudPromoDiscountPercent(0);
        setCloudPromoSuccess(false);
      }
    } catch (err) {
      console.error('Ошибка при проверке промокода:', err);
      setCloudPromoError('Ошибка при проверке промокода');
      setCloudPromoCode('');
      setCloudPromoDiscount(0);
      setCloudPromoDiscountPercent(0);
      setCloudPromoSuccess(false);
    } finally {
      setIsValidatingCloudPromo(false);
    }
  }, [cloudPromoCodeInput, cloudPricePreview?.total]);

  const handleRemoveCloudPromoCode = useCallback(() => {
    setCloudPromoCode('');
    setCloudPromoCodeInput('');
    setCloudPromoDiscount(0);
    setCloudPromoDiscountPercent(0);
    setCloudPromoError('');
    setCloudPromoSuccess(false);
    setShowCloudPromoInput(false);
  }, []);

  // Пересчёт скидки при изменении суммы (INDIVIDUAL)
  useEffect(() => {
    if (promoCode && promoDiscountPercent > 0) {
      const totalAmount = costSummary.combinedTotal || 0;
      const newDiscount = Math.round((totalAmount * promoDiscountPercent / 100) * 100) / 100;
      setPromoDiscount(newDiscount);
    }
  }, [costSummary.combinedTotal, promoCode, promoDiscountPercent]);

  // Пересчёт скидки при изменении суммы (CLOUD)
  useEffect(() => {
    if (cloudPromoCode && cloudPromoDiscountPercent > 0) {
      const totalAmount = cloudPricePreview?.total || 0;
      const newDiscount = Math.round((totalAmount * cloudPromoDiscountPercent / 100) * 100) / 100;
      setCloudPromoDiscount(newDiscount);
    }
  }, [cloudPricePreview?.total, cloudPromoCode, cloudPromoDiscountPercent]);


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

  // Управление услугами
  const addServiceRow = useCallback(() => {
    setServices((prev) => [...prev, { service_id: "", count: 1 }]);
  }, []);

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

      return updated;
    });

    // Обрабатываем изменение service_id отдельно, вне setServices
    if (field === "service_id") {
      // Получаем текущую услугу
      const currentService = services[index];

      // Проверяем, была ли добавлена услуга GAZELLE_TO
      if (value && serviceOptions.length > 0) {
        const selectedOption = serviceOptions.find(opt => String(opt.id) === String(value));

        if (selectedOption && selectedOption.type === "GAZELLE_TO") {
          console.log("✅ GAZELLE_TO выбрана, создаем moving_order");

          // Добавляем moving_order для возврата вещей
          // Дата возврата = дата начала бронирования + количество месяцев
          const startDate = individualBookingStartDate ? new Date(individualBookingStartDate) : new Date();
          const returnDate = new Date(startDate);
          returnDate.setMonth(returnDate.getMonth() + monthsNumber);
          returnDate.setHours(10, 0, 0, 0);

          setMovingOrders(prevOrders => {
            // Проверяем, нет ли уже такого moving_order
            const exists = prevOrders.some(order => order.status === "PENDING" && order.direction === "TO_CLIENT");
            if (exists) {
              console.log("⚠️ moving_order PENDING (TO_CLIENT) уже существует");
              return prevOrders;
            }

            const newOrder = {
              moving_date: returnDate.toISOString(),
              status: "PENDING",
              direction: "TO_CLIENT",
              address: movingAddressTo || movingAddressFrom || "",
            };

            console.log("✅ Создан новый moving_order:", newOrder);
            return [...prevOrders, newOrder];
          });
        }
      }

      // Проверяем, была ли удалена услуга GAZELLE_TO
      if (currentService?.service_id && serviceOptions.length > 0) {
        const oldOption = serviceOptions.find(opt => String(opt.id) === String(currentService.service_id));
        if (oldOption && oldOption.type === "GAZELLE_TO") {
          console.log("🗑️ GAZELLE_TO удалена, удаляем moving_order");
          // Удаляем moving_order для возврата вещей
          setMovingOrders(prev => prev.filter(order => !(order.status === "PENDING" && order.direction === "TO_CLIENT")));
        }
      }
    }
  }, [serviceOptions, individualBookingStartDate, monthsNumber, movingAddressFrom, movingAddressTo, services]);

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

  // Синхронизация услуги "Газель - Доставка" (GAZELLE_FROM)
  // Добавляем только GAZELLE_FROM с count: 1 при включении перевозки
  const syncGazelleService = useCallback((currentServices) => {
    if (!gazelleService || !includeMoving) {
      return currentServices.filter((s) => s.service_id?.toString() !== gazelleService?.id?.toString());
    }

    const gazelleId = gazelleService.id?.toString();
    const existingIndex = currentServices.findIndex((s) => s.service_id?.toString() === gazelleId);
    const updated = [...currentServices];

    if (existingIndex >= 0) {
      // Обновляем количество (всегда 1 для GAZELLE_FROM)
      updated[existingIndex] = { ...updated[existingIndex], count: 1 };
    } else {
      // Добавляем "Газель - Доставка" с количеством 1
      updated.push({ service_id: gazelleService.id, count: 1 });
    }

    return updated;
  }, [gazelleService, includeMoving]);

  // Автоматическое добавление услуги GAZELLE_FROM при включении перевозки
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
        type: gazelleFrom.type,
        name: getServiceTypeName(gazelleFrom.type) || gazelleFrom.description || "Газель - Доставка",
        price: gazelleFrom.price,
      });
    } else {
      setGazelleService(null);
    }
  }, [includeMoving, serviceOptions, ensureServiceOptions]);

  const finalIndividualTotal = useMemo(() => {
    const total = costSummary.combinedTotal || 0;
    return Math.max(0, total - promoDiscount);
  }, [costSummary.combinedTotal, promoDiscount]);

  const finalCloudTotal = useMemo(() => {
    const total = cloudPricePreview?.total || 0;
    return Math.max(0, total - cloudPromoDiscount);
  }, [cloudPricePreview?.total, cloudPromoDiscount]);

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
    // Если warehouseId не передан, не загружаем склад
    if (!warehouseId) {
      setIsLoading(false);
      return;
    }

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
          const priceTypes = data.type === 'CLOUD' ? ['CLOUD_M3'] : ['M2'];

          // Для всех складов получаем цены из warehouse-service-prices
          const prices = await warehouseApi.getWarehouseServicePrices(warehouseId);
          // Преобразуем массив цен в объект для удобства
          prices.forEach(price => {
            pricesMap[price.service_type] = parseFloat(price.price);
          });

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
          const priceTypes = data.type === 'CLOUD' ? ['CLOUD_M3'] : ['M2'];

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
        showErrorToast('Ошибка загрузки данных склада');
      } finally {
        setIsLoading(false);
      }
    };

    if (warehouseId) {
      fetchWarehouse();
    }
  }, [warehouseId, reset]);

  // Устанавливаем selectedWarehouse когда warehouse загружается
  useEffect(() => {
    if (warehouse) {
      setSelectedWarehouse(warehouse);
    }
  }, [warehouse]);

  // Автоматически выбираем первый склад, если склад не выбран
  useEffect(() => {
    if (!warehouseId && allWarehouses.length > 0 && !warehouse && !isLoading && !warehousesLoading && !error) {
      let firstWarehouse;
      if (embedded) {
        // В embedded-режиме выбираем склад в зависимости от вкладки
        if (embeddedStorageType === 'CLOUD') {
          firstWarehouse = allWarehouses.find(w => w.type === 'CLOUD') || allWarehouses[0];
        } else {
          firstWarehouse = allWarehouses.find(w => w.type !== 'CLOUD') || allWarehouses[0];
        }
      } else {
        firstWarehouse = allWarehouses.find(w => w.type !== 'CLOUD') || allWarehouses[0];
      }
      if (firstWarehouse) {
        if (embedded) {
          setEmbeddedWarehouseId(String(firstWarehouse.id));
        } else {
          const basePath = user?.role === 'ADMIN' ? 'admin' : 'manager';
          navigate(`/personal-account/${basePath}/warehouses/${firstWarehouse.id}`, { replace: true });
        }
      }
    }
  }, [warehouseId, allWarehouses, warehouse, isLoading, warehousesLoading, error, navigate, user?.role, embedded, embeddedStorageType]);

  // Переключение типа хранения в embedded-режиме
  const handleEmbeddedStorageTypeChange = useCallback((newType) => {
    if (newType === embeddedStorageType) return;
    setEmbeddedStorageType(newType);
    // Сбрасываем состояния при переключении
    setWarehouse(null);
    setSelectedWarehouse(null);
    setPreviewStorage(null);
    setPricePreview(null);
    setPriceError(null);
    setCloudPricePreview(null);
    setCloudPriceError(null);
    setSelectedClientUser(null);
    setOrderError(null);
    setServices([]);
    setIncludeMoving(false);
    setIncludePacking(false);
    // Ищем подходящий склад для нового типа
    if (allWarehouses.length > 0) {
      let targetWarehouse;
      if (newType === 'CLOUD') {
        targetWarehouse = allWarehouses.find(w => w.type === 'CLOUD');
      } else {
        targetWarehouse = allWarehouses.find(w => w.type !== 'CLOUD');
      }
      if (targetWarehouse) {
        setEmbeddedWarehouseId(String(targetWarehouse.id));
      }
    }
  }, [embeddedStorageType, allWarehouses]);

  const onSubmit = async (data) => {
    try {
      setIsSaving(true);

      // Обрезаем секунды от времени (09:00:00 -> 09:00)
      const formatTime = (timeString) => {
        if (!timeString) return timeString;
        return timeString.substring(0, 5); // Берем только HH:MM
      };

      // Определяем типы цен в зависимости от типа склада
      const priceTypes = warehouse?.type === 'CLOUD' ? ['CLOUD_M3'] : ['M2'];

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

            // Проверяем, что текущая цена является валидным положительным числом
            if (!isNaN(currentPrice) && isFinite(currentPrice) && currentPrice > 0 && currentPrice !== initialPrice) {
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
            const price = parseFloat(data[type]);
            // Проверяем, что цена является валидным положительным числом
            if (!isNaN(price) && isFinite(price) && price > 0) {
              changedPrices.push({
                service_type: type,
                price: price
              });
            }
          }
        });
      }

      // Добавляем цены только если есть изменения
      if (changedPrices.length > 0) {
        updateData.service_prices = changedPrices;
      }

      // Проверяем, есть ли что отправлять
      if (Object.keys(updateData).length === 0) {
        showInfoToast('Нет изменений для сохранения');
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

      showSuccessToast('Данные склада успешно обновлены');

      if (import.meta.env.DEV) {
        console.log('Склад успешно обновлен:', updateData);
      }

      // Автоматическое перенаправление на список складов после успешного сохранения
      setTimeout(() => {
        navigate('/personal-account', { state: { activeSection: 'warehouses' } });
      }, 1000);
    } catch (error) {
      console.error('Ошибка при обновлении склада:', error);
      console.error('Детали ошибки:', error.response?.data);

      // Показываем детали ошибки валидации если они есть
      if (error.response?.status === 400) {
        if (error.response?.data?.details && Array.isArray(error.response.data.details)) {
          console.error('Детали ошибки валидации:', error.response.data.details);
          const errorMessages = error.response.data.details.map(d => {
            if (typeof d === 'string') return d;
            if (d.message) return d.message;
            if (d.path) return `${d.path.join('.')}: ${d.message || 'Invalid value'}`;
            return JSON.stringify(d);
          }).join(', ');
          showErrorToast(`Ошибка валидации: ${errorMessages}`);
        } else if (error.response?.data?.message) {
          showErrorToast(`Ошибка: ${error.response.data.message}`);
        } else if (error.response?.data?.error) {
          showErrorToast(`Ошибка: ${error.response.data.error}`);
        } else {
          showErrorToast('Ошибка валидации данных. Проверьте введенные значения.');
        }
      } else {
        showErrorToast('Не удалось обновить данные склада. Попробуйте позже.');
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
      ? ['CLOUD_M3']
      : ['M2'];

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

  // Функция для рендеринга схемы склада (как на главной странице)
  const renderWarehouseScheme = ({ isFullscreen = false } = {}) => {
    if (!selectedWarehouse) {
      return (
        <div className="min-h-[220px] flex items-center justify-center text-center text-white">
          Выберите склад, чтобы увидеть схему расположения боксов.
        </div>
      );
    }

    if (selectedWarehouse?.type === "CLOUD") {
      return (
        <div className="min-h-[220px] flex items-center justify-center text-center text-white">
          Для облачного хранения схема склада не требуется — мы забираем и возвращаем ваши вещи сами.
        </div>
      );
    }

    const storageBoxes = selectedWarehouse?.storage ?? [];

    if (!storageBoxes.length) {
      return (
        <div className="min-h-[220px] flex items-center justify-center text-center text-white">
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
              key={`warehouse-map-${selectedWarehouse?.id || warehouseId}`}
              ref={isFullscreen ? mapRef : null}
              warehouse={selectedWarehouse}
              storageBoxes={storageBoxes}
              onBoxSelect={async (storage) => {
                if ((storage?.status === 'PENDING' || storage?.status === 'OCCUPIED') && isAdminOrManager) {
                  setIsLoadingPendingOrder(true);
                  try {
                    const order = await ordersApi.getPendingOrderByStorageId(storage.id);
                    setPendingOrder(order);
                    setIsPendingOrderModalOpen(true);
                    setIsMapModalOpen(false);
                  } catch (error) {
                    if (error.response?.status === 404) {
                      setPendingOrder(null);
                      setIsPendingOrderModalOpen(true);
                      setIsMapModalOpen(false);
                    } else {
                      console.error('Ошибка при загрузке заказа:', error);
                    }
                  } finally {
                    setPreviewStorage(storage);
                    setIsLoadingPendingOrder(false);
                  }
                } else {
                  setPreviewStorage(storage);
                }
              }}
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
          <div className="rounded-2xl border border-dashed border-white/20 bg-white/10 px-4 py-3 text-sm text-white">
            Нажмите «Смотреть карту», чтобы открыть схему склада на весь экран.
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    const loadingContent = (
      <div className={embedded ? "p-6" : "max-w-6xl mx-auto space-y-6"}>
        <div className="flex items-center space-x-4">
          <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
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
    );

    if (embedded) return loadingContent;

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex flex-1">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          <main className="flex-1 p-6">{loadingContent}</main>
        </div>
      </div>
    );
  }


  // Если есть ошибка загрузки, показываем сообщение об ошибке
  if (error) {
    const errorContent = (
      <div className={embedded ? "p-6" : "max-w-6xl mx-auto"}>
        <div className="bg-white rounded-xl border border-red-200 shadow-sm">
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Ошибка загрузки</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex justify-center space-x-4">
              {!embedded && (
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  Назад к списку
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center px-4 py-2 bg-[#00A991] hover:bg-[#009882] text-white text-sm font-medium rounded-lg transition-colors"
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
    );

    if (embedded) return errorContent;

    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="flex flex-1">
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          <main className="flex-1 p-6">{errorContent}</main>
        </div>
      </div>
    );
  }

  return (
    <div className={embedded ? "" : "min-h-screen flex flex-col bg-gray-50"}>
      <div className={embedded ? "" : "flex flex-1"}>
        {!embedded && <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />}
        <main className={embedded ? "" : "flex-1 p-6"}>
          <div className={embedded ? "space-y-6" : "max-w-6xl mx-auto space-y-6"}>
            {/* Табы INDIVIDUAL / CLOUD — для embedded-режима */}
            {embedded && (
              <div className="flex gap-1 bg-gray-100 p-1 rounded-2xl w-full sm:w-fit">
                <button
                  onClick={() => handleEmbeddedStorageTypeChange('INDIVIDUAL')}
                  className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                    embeddedStorageType === 'INDIVIDUAL'
                      ? 'bg-white text-[#273655] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Индивидуальное хранение
                </button>
                <button
                  onClick={() => handleEmbeddedStorageTypeChange('CLOUD')}
                  className={`flex-1 sm:flex-none px-5 py-2.5 text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2 ${
                    embeddedStorageType === 'CLOUD'
                      ? 'bg-white text-[#273655] shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                  Облачное хранение
                </button>
              </div>
            )}

            {/* Breadcrumb и заголовок — только для полной страницы */}
            {!embedded && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <button
                  onClick={handleBackToList}
                  className="inline-flex items-center text-gray-600 hover:text-[#004743] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span className="text-sm font-medium">Склады</span>
                </button>
                <svg className="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
                {warehouse && isAdminOrManager && allWarehouses.length > 1 ? (
                  <Select value={String(warehouseId)} onValueChange={handleWarehouseChange}>
                    <SelectTrigger className="w-full min-w-[200px] max-w-[280px] border-gray-300 rounded-lg text-base font-semibold text-gray-900">
                      <SelectValue placeholder="Выберите склад" />
                    </SelectTrigger>
                    <SelectContent>
                      {allWarehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <h1 className="text-2xl font-bold text-gray-900">{warehouse?.name}</h1>
                )}
              </div>

              {!isEditing && (
                <button
                  onClick={handleEditClick}
                  className="inline-flex items-center px-4 py-2 bg-[#00A991] hover:bg-[#009882] text-white text-sm font-medium rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Редактировать
                </button>
              )}
            </div>
            )}

            {/* Табы переключения: Склад / Тарифы и акции — только для полной страницы */}
            {!embedded && isAdminOrManager && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
                  <button
                    onClick={() => setWarehouseTab('warehouse')}
                    className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                      warehouseTab === 'warehouse'
                        ? 'bg-white text-[#004743] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Управление складом
                  </button>
                  <button
                    onClick={() => setWarehouseTab('pricing')}
                    className={`px-5 py-2 text-sm font-medium rounded-lg transition-all ${
                      warehouseTab === 'pricing'
                        ? 'bg-white text-[#004743] shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Тарифы и акции
                  </button>
                </div>
              </div>
            )}

            {/* Контент: Тарифы и акции — только для полной страницы */}
            {!embedded && warehouseTab === 'pricing' && isAdminOrManager && (
              <div className="space-y-6">
                <PricingRuleManagement />

                {/* Управление ценами боксов по фильтрам */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Цены боксов (по фильтрам)</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Обновляет поле цены на уровне бокса (storages) для INDIVIDUAL хранения.
                    </p>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Склад</label>
                      <select
                        value={bulkPriceWarehouseId || ''}
                        onChange={(e) => setBulkPriceWarehouseId(e.target.value)}
                        className="w-full md:w-72 px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
                      >
                        <option value="">Текущий склад</option>
                        {allWarehouses.map(w => (
                          <option key={w.id} value={String(w.id)}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Ярус (tier)</label>
                        <select
                          value={bulkPriceTier}
                          onChange={(e) => setBulkPriceTier(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
                        >
                          <option value="">Все ярусы</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Пусто = все ярусы</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Объем от</label>
                        <input
                          type="number"
                          step="0.01"
                          value={bulkPriceFrom}
                          onChange={(e) => setBulkPriceFrom(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
                          placeholder="например 2"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Объем до</label>
                        <input
                          type="number"
                          step="0.01"
                          value={bulkPriceTo}
                          onChange={(e) => setBulkPriceTo(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
                          placeholder="например 4"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Цена за м² (₸)</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={bulkPriceValue}
                          onChange={(e) => setBulkPriceValue(e.target.value)}
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:border-transparent"
                          placeholder="например 9000"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between flex-wrap gap-3">
                      <button
                        type="button"
                        disabled={bulkPriceUpdating || !warehouseId || !bulkPriceValue}
                        onClick={async () => {
                          if (!warehouseId) return;
                          const price = parseFloat(bulkPriceValue);
                          if (!price || Number.isNaN(price)) {
                            showErrorToast('Укажите корректную цену');
                            return;
                          }

                          const payload = {
                            warehouse_id: Number(bulkPriceWarehouseId || warehouseId),
                            price_per_m2: price,
                          };

                          if (bulkPriceTier !== '') payload.tier = Number(bulkPriceTier);
                          if (bulkPriceFrom !== '') payload.volume_from = Number(bulkPriceFrom);
                          if (bulkPriceTo !== '') payload.volume_to = Number(bulkPriceTo);

                          try {
                            setBulkPriceUpdating(true);
                            setBulkPriceUpdatedCount(null);
                            const res = await warehouseApi.bulkUpdateStoragePricePerM2(payload);
                            setBulkPriceUpdatedCount(res?.updated ?? null);
                            showSuccessToast(`Обновлено боксов: ${res?.updated ?? 0}`);
                          } catch (e) {
                            console.error(e);
                            showErrorToast('Не удалось обновить цены боксов');
                          } finally {
                            setBulkPriceUpdating(false);
                            await refetch()
                          }
                        }}
                        className="px-6 py-2.5 bg-[#00A991] text-white text-sm font-medium rounded-lg hover:bg-[#009882] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {bulkPriceUpdating ? 'Обновление...' : 'Применить'}
                      </button>

                      {bulkPriceUpdatedCount !== null && (
                        <div className="text-sm text-gray-700">
                          Обновлено: <span className="font-semibold">{bulkPriceUpdatedCount}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <StoragePricesMatrix prices={prices} />
              </div>
            )}

            {/* Информация о складе — только для полной страницы и вкладки "склад" */}
            {!embedded && warehouseTab === 'warehouse' && (
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


                      {/* Секция цен облачного хранения в режиме просмотра */}
                      {isCloud && (
                        <div className="pt-4 border-t border-gray-100">
                          <h3 className="text-sm font-semibold text-gray-900 mb-4">
                            Цена за 1 м³ в месяц (облачное хранение)
                          </h3>
                          <div className="bg-gray-50 rounded-lg p-4">
                            <p className="text-lg font-semibold text-gray-900">
                              {servicePrices['CLOUD_M3']
                                ? `${Number(servicePrices['CLOUD_M3']).toLocaleString('ru-RU')} ₸`
                                : 'Не установлена'}
                            </p>
                          </div>
                        </div>
                      )}
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


                        {/* Секция цен облачного хранения */}
                        {isCloud && (
                          <div className="pt-6 border-t border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                              Цена за 1 м³ в месяц (облачное хранение)
                            </h3>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Цена за м³ (₸) *
                              </label>
                              <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                {...register('CLOUD_M3', { 
                                  required: 'Цена обязательна',
                                  valueAsNumber: true,
                                  min: { value: 0.01, message: 'Цена должна быть больше 0' }
                                })}
                                className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#273655] focus:border-transparent transition-colors ${
                                  errors['CLOUD_M3'] ? 'border-red-300 bg-red-50' : 'border-gray-300'
                                }`}
                                placeholder="Введите цену за м³"
                              />
                              {errors['CLOUD_M3'] && (
                                <p className="mt-1 text-sm text-red-600 flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {errors['CLOUD_M3'].message}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
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
                            className="px-6 py-2.5 bg-[#00A991] text-white text-sm font-medium rounded-lg hover:bg-[#009882] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
            )}

            </div>
          </main>
        </div>

      {/* Модальное окно информации о заказе PENDING */}
      {isAdminOrManager && (
        <PendingOrderModal
          isOpen={isPendingOrderModalOpen}
          order={pendingOrder}
          storageId={previewStorage?.id}
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