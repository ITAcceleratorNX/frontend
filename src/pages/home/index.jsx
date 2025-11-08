import React, { useState, memo, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../widgets";
import vectorImg from "../../assets/vector.png";
import backgroundTextImg from "../../assets/background-text.png";
import boxesImg from "../../assets/boxes.png";
import beigeCircle from "../../assets/beige_circle.svg";
import houseOnBeigeCircle from "../../assets/house_on_beige_circle.svg";
import extraspaceLogo from "../../assets/photo_5440760864748731559_y.jpg";
import Footer from "../../widgets/Footer";
import FAQ from "../../components/FAQ";
import WarehouseMap from "../../components/WarehouseMap";
import InteractiveWarehouseCanvas from "../../components/InteractiveWarehouseCanvas";
import MainWarehouseCanvas from "../../components/MainWarehouseCanvas";
import ZhkKomfortCanvas from "../../components/ZhkKomfortCanvas.jsx";
import ChatButton from "../../shared/components/ChatButton";
import { warehouseApi } from "../../shared/api/warehouseApi";
import VolumeSelector from "../../components/VolumeSelector.jsx";
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
import { Truck, Package, X } from "lucide-react";

const MOVING_SERVICE_ESTIMATE = 7000;
const PACKING_SERVICE_ESTIMATE = 4000;
// Мемоизируем компонент HomePage для предотвращения лишних ререндеров
const HomePage = memo(() => {
  const navigate = useNavigate();

  // Новые состояния для выбора склада
  const [apiWarehouses, setApiWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState(null);
  const [activeStorageTab, setActiveStorageTab] = useState("INDIVIDUAL");
  const [individualMonths, setIndividualMonths] = useState("1");
  const [includeMoving, setIncludeMoving] = useState(false);
  const [includePacking, setIncludePacking] = useState(false);
  const [cloudMonths, setCloudMonths] = useState("1");
  const [cloudDimensions, setCloudDimensions] = useState({ width: 1, height: 1, length: 1 });
  const [movingAddressFrom, setMovingAddressFrom] = useState("");
  const [cloudPickupAddress, setCloudPickupAddress] = useState("");
  const [previewStorage, setPreviewStorage] = useState(null);
  const [pricePreview, setPricePreview] = useState(null);
  const [isPriceCalculating, setIsPriceCalculating] = useState(false);
  const [priceError, setPriceError] = useState(null);
  const [cloudPricePreview, setCloudPricePreview] = useState(null);
  const [isCloudPriceCalculating, setIsCloudPriceCalculating] = useState(false);
  const [cloudPriceError, setCloudPriceError] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [komfortSelectedMap, setKomfortSelectedMap] = useState(1);

  const monthsNumber = useMemo(() => {
    const parsed = parseInt(individualMonths, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [individualMonths]);

  const cloudMonthsNumber = useMemo(() => {
    const parsed = parseInt(cloudMonths, 10);
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [cloudMonths]);

  const serviceEstimate = useMemo(() => {
    const breakdown = [];
    let total = 0;

    if (includeMoving) {
      total += MOVING_SERVICE_ESTIMATE;
      breakdown.push({
        label: "Перевозка вещей",
        amount: MOVING_SERVICE_ESTIMATE,
      });
    }

    if (includePacking) {
      total += PACKING_SERVICE_ESTIMATE;
      breakdown.push({
        label: "Услуга упаковки",
        amount: PACKING_SERVICE_ESTIMATE,
      });
    }

    return {
      total,
      breakdown,
    };
  }, [includeMoving, includePacking]);

  const costSummary = useMemo(() => {
    const baseMonthly = pricePreview ? Math.round(pricePreview.monthly) : null;
    const baseTotal = pricePreview ? Math.round(pricePreview.total) : null;
    const serviceTotal = serviceEstimate.total;
    const combinedTotal = (baseTotal || 0) + serviceTotal;

    return {
      baseMonthly,
      baseTotal,
      serviceTotal,
      combinedTotal,
    };
  }, [pricePreview, serviceEstimate.total]);

  const handleCloudDimensionChange = (dimension, rawValue) => {
    const value = Math.max(0.1, Number(rawValue) || 0);
    setCloudDimensions((prev) => ({ ...prev, [dimension]: value }));
  };

  const cloudVolume = useMemo(() => {
    const { width, height, length } = cloudDimensions;
    const volume = Number(width) * Number(height) * Number(length);
    return Number.isFinite(volume) && volume > 0 ? volume : 0;
  }, [cloudDimensions]);

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

  // Данные для складов на карте
  const warehouses = useMemo(
    () => [
      {
        id: 1,
        name: "ЖК Есентай",
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
        name: "ЖК Mega Towers",
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
        name: "ЖК Комфорт Сити",
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
    if (selectedWarehouse?.name !== "ЖК Комфорт Сити") {
      setKomfortSelectedMap(1);
    }
  }, [selectedWarehouse]);

  useEffect(() => {
    if (selectedWarehouse?.name === "ЖК Комфорт Сити") {
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

    const isKomfortWarehouse = selectedWarehouse.name === "ЖК Комфорт Сити";
    if (isKomfortWarehouse) {
      canvasProps.selectedMap = komfortSelectedMap;
    }

    let canvas = null;

    if (selectedWarehouse.name === "ЖК Mega Towers") {
      canvas = <InteractiveWarehouseCanvas {...canvasProps} />;
    } else if (selectedWarehouse.name === "ЖК Есентай") {
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
        <span className="text-sm font-semibold text-[#273655]">Карта ЖК Комфорт Сити</span>
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

    return (
      <div className={`flex flex-col gap-4 ${isFullscreen ? "h-full" : ""}`}>
        {komfortControls}
        <div className={wrapperClasses}>
          <div className="min-w-max mx-auto py-3 px-2">
            {canvas}
          </div>
        </div>
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
                onClick={() => navigate("/warehouse-order")}
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
                    <h3 className="text-xl font-bold text-[#273655] mb-4">
                      Выберите склад
                    </h3>
                    <p className="text-sm text-[#3E4958] mb-4">
                      Укажите удобную локацию, чтобы увидеть подробную схему склада и доступные боксы.
                    </p>
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
                    <div>
                      <h3 className="text-xl font-bold text-[#273655] mb-2">
                        Карта-схема склада
                      </h3>
                      <p className="text-sm text-[#6B6B6B]">
                        Посмотрите расположение боксов и их доступность прямо на главной странице.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-[#f5f6fa] p-4">
                      {renderWarehouseScheme()}
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#273655] mb-2">
                      Настройте хранение
                    </h3>
                    <p className="text-sm text-[#6B6B6B]">
                      Выберите срок аренды и дополнительные услуги — всё как на странице оформления заказа.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-[#273655]">
                        Срок аренды (месяцы)
                      </span>
                      <Select value={individualMonths} onValueChange={setIndividualMonths}>
                        <SelectTrigger className="h-[50px] rounded-2xl border-[#273655]/20 text-[#273655]">
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

                    <div className="space-y-2">
                      <span className="text-sm font-semibold text-[#273655]">
                        Предварительная стоимость
                      </span>
                      <div className="rounded-2xl border border-dashed border-[#273655]/30 bg-white p-4 text-sm text-[#273655] space-y-2">
                        {isPriceCalculating ? (
                          <div className="flex items-center justify-center gap-2 text-base font-semibold">
                            <span className="w-4 h-4 border-2 border-t-transparent border-[#273655] rounded-full animate-spin" />
                            Расчёт...
                          </div>
                        ) : previewStorage ? (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-[#6B6B6B]">Выбранный бокс</span>
                              <span className="font-semibold">{previewStorage.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-[#6B6B6B]">Площадь</span>
                              <span className="font-semibold">
                                {parseFloat(previewStorage.available_volume ?? previewStorage.total_volume ?? previewStorage.area ?? 0).toLocaleString()} м²
                              </span>
                            </div>
                            {pricePreview ? (
                              <>
                                {costSummary.baseMonthly !== null && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#6B6B6B]">За месяц</span>
                                    <span className="text-base font-semibold">
                                      {costSummary.baseMonthly.toLocaleString()} ₸
                                    </span>
                                  </div>
                                )}
                                {costSummary.baseTotal !== null && (
                                  <div className="flex items-center justify-between">
                                    <span className="text-[#6B6B6B]">За {monthsNumber} мес</span>
                                    <span className="text-lg font-bold text-[#273655]">
                                      {costSummary.baseTotal.toLocaleString()} ₸
                                    </span>
                                  </div>
                                )}
                                {pricePreview.isFallback && (
                                  <p className="text-xs text-[#C67A00]">
                                    Показана ориентировочная стоимость по базовому тарифу бокса.
                                  </p>
                                )}
                              </>
                            ) : (
                              <p className="text-[#6B6B6B]">
                                Не удалось получить расчёт. Стоимость уточним на следующем шаге.
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-[#6B6B6B]">
                            Выберите бокс на схеме слева, чтобы увидеть ориентировочную стоимость аренды.
                          </p>
                        )}

                        {serviceEstimate.breakdown.length > 0 && (
                          <div className="pt-3 mt-3 border-t border-dashed border-[#273655]/20 space-y-2">
                            <div className="text-[#6B6B6B] font-semibold">Дополнительные услуги</div>
                            {serviceEstimate.breakdown.map((item) => (
                              <div key={item.label} className="flex items-center justify-between">
                                <span>{item.label}</span>
                                <span className="font-semibold">+{item.amount.toLocaleString()} ₸</span>
                              </div>
                            ))}
                            <div className="flex items-center justify-between text-[#273655] font-semibold">
                              <span>Услуги итого</span>
                              <span>{serviceEstimate.total.toLocaleString()} ₸</span>
                            </div>
                          </div>
                        )}

                        {(costSummary.baseTotal || serviceEstimate.total) && (
                          <div className="pt-3 mt-3 border-t border-dashed border-[#273655]/20">
                            <div className="flex items-center justify-between text-sm text-[#6B6B6B]">
                              <span>Предварительно за весь срок</span>
                              <span className="text-lg font-bold text-[#273655]">
                                {(costSummary.combinedTotal || serviceEstimate.total).toLocaleString()} ₸
                              </span>
                            </div>
                            {serviceEstimate.total > 0 && costSummary.baseTotal !== null && (
                              <p className="text-xs text-[#6B6B6B] mt-1">
                                Включая дополнительные услуги на {serviceEstimate.total.toLocaleString()} ₸
                              </p>
                            )}
                          </div>
                        )}

                        {priceError && (
                          <p className="text-xs text-[#C73636]">
                            {priceError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4">
                      <div>
                        <div className="flex items-center gap-2 text-[#273655] font-semibold">
                          <Truck className="w-5 h-5" />
                          Перевозка вещей
                        </div>
                        <p className="text-sm text-[#6B6B6B] mt-1">
                          Заберём ваши вещи и привезём обратно по завершении аренды.
                        </p>
                        {includeMoving && (
                          <div className="mt-4 grid grid-cols-1 gap-3 sm:max-w-md">
                            <div className="flex flex-col gap-1">
                              <label className="text-xs text-[#6B6B6B]">Адрес забора</label>
                              <input
                                type="text"
                                value={movingAddressFrom}
                                onChange={(e) => setMovingAddressFrom(e.target.value)}
                                placeholder="Например: г. Алматы, Абая 25"
                                className="h-[46px] rounded-xl border border-[#d5d8e1] px-3 text-sm text-[#273655] placeholder:text-[#B0B7C3] focus:outline-none focus:ring-2 focus:ring-[#273655]/30"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      <Switch
                        checked={includeMoving}
                        onCheckedChange={(checked) => {
                          setIncludeMoving(checked);
                          if (!checked) {
                            setIncludePacking(false);
                            setMovingAddressFrom("");
                          }
                        }}
                        className="bg-gray-200 data-[state=checked]:bg-[#273655]"
                      />
                    </div>

                    {includeMoving && (
                      <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 p-4">
                        <div>
                          <div className="flex items-center gap-2 text-[#273655] font-semibold">
                            <Package className="w-5 h-5" />
                            Услуга упаковки
                          </div>
                          <p className="text-sm text-[#6B6B6B] mt-1">
                            Подготовим и упакуем вещи для безопасного хранения.
                          </p>
                        </div>
                        <Switch
                          checked={includePacking}
                          onCheckedChange={setIncludePacking}
                          className="bg-gray-200 data-[state=checked]:bg-[#273655]"
                        />
                      </div>
                    )}
                  </div>

                  <div className="rounded-2xl bg-[#273655]/5 border border-[#273655]/20 p-4 text-sm text-[#273655]">
                    Итоговая стоимость и доступные боксы уточняются при бронировании. Мы рассчитаем цену с учётом выбранных услуг.
                    {(includeMoving || includePacking) && (
                      <span className="block mt-2">
                        Стоимость {includeMoving && includePacking ? "перевозки и упаковки" : includeMoving ? "перевозки" : "упаковки"} добавится на этапе оформления заказа.
                      </span>
                    )}
                  </div>

                  <SmartButton
                    variant="success"
                    size="lg"
                    className="w-full h-[56px] text-base font-semibold"
                    onClick={() => navigate("/warehouse-order")}
                  >
                    Забронировать бокс
                  </SmartButton>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="CLOUD" className="mt-8">
              <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-6">
                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#273655] mb-2">
                      Укажите габариты вещей
                    </h3>
                    <p className="text-sm text-[#6B6B6B]">
                      Введите ширину, высоту и длину (в метрах) — мы посчитаем общий объём для облачного хранения.
                    </p>
                  </div>

                  <div className="flex flex-col gap-4">
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

                  <div className="rounded-2xl bg-[#273655]/5 border border-[#273655]/15 p-4">
                    <p className="text-sm text-[#6B6B6B]">
                      Рассчитанный объём: <span className="font-semibold text-[#273655]">{cloudVolume.toFixed(2)} м³</span>
                    </p>
                    <p className="mt-1 text-xs text-[#6B6B6B]">
                      Минимальный объём — 0.1 м³. Если вещей больше, добавьте отдельные размеры — мы суммируем общий объём при бронировании.
                    </p>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#273655] mb-2">
                      Облачное хранение ExtraSpace
                    </h3>
                    <p className="text-sm text-[#6B6B6B]">
                      Мы сами забираем и возвращаем ваши вещи. Перевозка и упаковка уже включены в тариф.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-[#273655]">
                      Срок аренды (месяцы)
                    </span>
                    <Select value={cloudMonths} onValueChange={setCloudMonths}>
                      <SelectTrigger className="h-[50px] rounded-2xl border-[#273655]/20 text-[#273655]">
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

                  <div className="rounded-2xl bg-[#273655]/5 border border-[#273655]/20 p-4 text-sm text-[#273655] space-y-2">
                    <p>
                      Рассчитанный объём: <span className="font-semibold">{cloudVolume.toFixed(2)} м³</span>
                    </p>
                    <p>
                      Срок аренды: <span className="font-semibold">{cloudMonths} мес</span>
                    </p>
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

                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-[#273655]">
                      Предварительная стоимость
                    </span>
                    <div className="rounded-2xl border border-dashed border-[#273655]/30 bg-white p-4 text-sm text-[#273655] space-y-2">
                      {isCloudPriceCalculating ? (
                        <div className="flex items-center justify-center gap-2 text-base font-semibold">
                          <span className="w-4 h-4 border-2 border-t-transparent border-[#273655] rounded-full animate-spin" />
                          Расчёт...
                        </div>
                      ) : cloudPricePreview ? (
                        <>
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
                          {cloudPricePreview.isFallback && (
                            <p className="text-xs text-[#C67A00]">
                              Показана ориентировочная стоимость. Точный расчёт подтвердим при бронировании.
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-[#6B6B6B]">
                          Укажите габариты и срок аренды, чтобы увидеть ориентировочную стоимость.
                        </p>
                      )}

                      {cloudPriceError && (
                        <p className="text-xs text-[#C73636]">
                          {cloudPriceError}
                        </p>
                      )}
                    </div>
                  </div>

                  <SmartButton
                    variant="success"
                    size="lg"
                    className="w-full h-[56px] text-base font-semibold"
                    onClick={() => navigate("/warehouse-order")}
                  >
                    Забронировать бокс
                  </SmartButton>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
      {/* Третий фрейм: карточка склада */}
      <section className="w-full flex justify-center items-center px-4 py-8 font-['Montserrat']">
        <VolumeSelector />
      </section>

      {isMapModalOpen && (
        <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
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
              <div className="flex-1 min-h-[40vh]">
                {renderWarehouseScheme({ isFullscreen: true })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Шестой фрейм: филиалы Extra Space */}
      <section className="w-full flex flex-col items-center justify-center mt-28 mb-24 font-['Montserrat']">
        <div className="w-full max-w-6xl mx-auto mb-10 px-4 md:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[#273655]">
            ФИЛИАЛЫ
          </h2>
        </div>

        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-8 px-4 md:px-8">
          {/* Карта */}
          <div className="w-full md:w-[45%] rounded-2xl overflow-hidden bg-[#f3f3f3] shadow-md">
            <div style={{ width: "100%", height: 340 }}>
              <WarehouseMap warehouses={warehouses} mapId="home-branches-map" />
            </div>
          </div>

          {/* Карточка склада */}
          <div className="relative w-full md:w-[55%] bg-white rounded-2xl shadow-md p-6">
            {warehousesLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-2xl">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#273655]" />
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start gap-6">
              {/* Логотип */}
              <div className="w-full md:w-[200px] h-[200px] flex-shrink-0">
                <img
                  src={selectedWarehouse?.image || extraspaceLogo}
                  alt="logo"
                  className="w-full h-full rounded-xl object-cover bg-[#273655]"
                />
              </div>

              {/* Инфо */}
              <div className="flex flex-col flex-1 gap-2">
                <h3 className="text-xl font-semibold text-[#273655]">
                  {selectedWarehouse?.name || "Загрузка..."}
                </h3>

                {selectedWarehouse && (
                  <>
                    <p className="text-sm text-[#3E4958]">
                      Статус:{" "}
                      <span
                        className={`font-medium ${selectedWarehouse.status === "AVAILABLE" ? "text-green-600" : "text-red-600"}`}
                      >
                        {selectedWarehouse.status === "AVAILABLE"
                          ? "Доступен"
                          : "Недоступен"}
                      </span>
                    </p>
                    <p className="text-sm text-[#3E4958]">
                      {selectedWarehouse.work_start &&
                      selectedWarehouse.work_end ? (
                        selectedWarehouse.work_start === "00:00" && selectedWarehouse.work_end === "23:59" ? (
                          "Режим: Круглосуточно"
                        ) : (
                          `Режим: ${selectedWarehouse.work_start} - ${selectedWarehouse.work_end}`
                        )
                      ) : (
                        "Режим работы уточняется"
                      )}
                    </p>
                    {selectedWarehouse?.address && (
                        <div className="flex items-center gap-2 text-sm text-[#273655] mt-2">
                          <span className="relative w-6 h-6">
                            <img
                                src={beigeCircle}
                                alt=""
                                className="absolute w-full h-full"
                            />
                            <img
                                src={houseOnBeigeCircle}
                                alt=""
                                className="absolute w-4 h-4 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                            />
                          </span>
                          {selectedWarehouse?.address}
                        </div>
                    )}
                  </>
                )}

                {warehousesError && (
                  <p className="text-sm text-red-600">{warehousesError}</p>
                )}

                {/* Dropdown */}
                <div className="relative mt-4 w-full max-w-xs">
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

                {/* Бронирование */}
                {selectedWarehouse?.status === "AVAILABLE" && (
                  <SmartButton variant="outline" onClick={() => navigate("/warehouse-order")}>Забронировать бокс</SmartButton>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Секция FAQ */}
      <FAQ />

      {/* Плавающая кнопка чата */}
      <ChatButton />

      <Footer />
    </div>
  );
});

HomePage.displayName = "HomePage";

export default HomePage;
