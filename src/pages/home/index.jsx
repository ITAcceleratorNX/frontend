import React, { useState, memo, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../widgets";
import vectorImg from "../../assets/vector.png";
import backgroundTextImg from "../../assets/background-text.png";
import boxesImg from "../../assets/boxes.png";
import good2 from "../../assets/good2.png";
import procent2 from "../../assets/procent2.png";
import key2 from "../../assets/key2.png";

import FileCheckIcon from "../../assets/File_Check.png";
import GroupIcon from "../../assets/group.png";
import ShieldTickIcon from "../../assets/shield-tick.png";
import BoxTickIcon from "../../assets/box-tick.png";
import beigeCircle from "../../assets/beige_circle.svg";
import houseOnBeigeCircle from "../../assets/house_on_beige_circle.svg";
import extraspaceLogo from "../../assets/extraspace_logo.png";
import image85 from "../../assets/image 85.png";
import group1010 from "../../assets/Group 1010.png";
import Footer from "../../widgets/Footer";
import FAQ from "../../components/FAQ";
import WarehouseMap from "../../components/WarehouseMap";
import ChatButton from "../../shared/components/ChatButton";
import CostCalculator from "../../shared/components/CostCalculator";
import { warehouseApi } from "../../shared/api/warehouseApi";
import VolumeSelector from "../../components/VolumeSelector.jsx";
import { Dropdown } from '../../shared/components/Dropdown.jsx';
import { SmartButton } from "../../shared/components/SmartButton.jsx";
// Мемоизируем компонент HomePage для предотвращения лишних ререндеров
const HomePage = memo(() => {
  const navigate = useNavigate();

  // Новые состояния для выбора склада
  const [isWarehouseDropdownOpen, setIsWarehouseDropdownOpen] = useState(false);
  const [apiWarehouses, setApiWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [warehousesLoading, setWarehousesLoading] = useState(false);
  const [warehousesError, setWarehousesError] = useState(null);

  // Данные для складов на карте
  const warehouses = useMemo(
    () => [
      {
        id: 1,
        name: "EXTRA SPACE Главный склад",
        address: "Касымова улица, 32, Алматы",
        phone: "+7 727 123 4567",
        workingHours: "Пн-Пт: 09:00-18:00, Сб-Вс: 10:00-16:00",
        coordinates: [76.930495, 43.225893],
        available: true,
        image: extraspaceLogo,
      },
      {
        id: 2,
        name: "EXTRA SPACE Мега",
        address: "Абиша Кекилбайулы, 270 блок 4, Алматы",
        phone: "+7 727 987 6543",
        workingHours: "Ежедневно: 08:00-22:00",
        coordinates: [76.890647, 43.201397],
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

        // Устанавливаем первый склад как выбранный по умолчанию
        if (data && data.length > 0) {
          setSelectedWarehouse(data[0]);
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

  // Закрытие dropdown при клике вне его
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isWarehouseDropdownOpen) {
        // Проверяем, что клик был не по элементу dropdown
        const dropdown = event.target.closest(".warehouse-dropdown");
        if (!dropdown) {
          setIsWarehouseDropdownOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWarehouseDropdownOpen]);

  // Функции для управления выпадающим списком
  const toggleWarehouseDropdown = () => {
    setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen);
  };

  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsWarehouseDropdownOpen(false);
  };

  const dropdownItems = apiWarehouses.length > 0 ? apiWarehouses : warehouses;


  return (
    <div className="font-['Montserrat'] min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 relative overflow-hidden">
        <div className="container mx-auto tracking-[0.1em] px-4 py-8">
          <div className="text-center relative flex flex-col items-center">
            <h1 className="text-[22px] sm:text-[28px] md:text-[45px] font-bold text-[#273655] mb-2 flex flex-col items-center leading-[1.0] font-['Montserrat']">
              <span className="mb-1">БЕРЕЖНОЕ ХРАНЕНИЕ</span>
              <div className="flex justify-center items-center gap-2">
                <img
                  src={vectorImg}
                  alt="Декор"
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                />
                <span>ВАШИХ ВЕЩЕЙ</span>
                <img
                  src={vectorImg}
                  alt="Декор"
                  className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8"
                />
              </div>
            </h1>

            <div className="mt-3">
              <div className="bg-[#273655] text-white px-6 sm:px-8 md:px-10 py-1 sm:py-1.5 rounded-[15px] text-base sm:text-lg font-medium hover:bg-[#2a3c64] transition-colors font-['Montserrat']">
                Теплые склады с охраной от 3 м²
              </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Верхний левый — текст */}
            <div className="flex flex-col w-full md:w-[560px] md:h-[255px] pl-2 pt-6">
              <div className="text-[20px] sm:text-[24px] md:text-[28px] font-bold font-['Montserrat'] text-[#273655] leading-tight mb-4">
                мы предоставляем{" "}
                <span className="text-[#C73636]">
                  автоматизированные склады
                </span>
                <br />
                для хранения вещей.
              </div>
              <div className="font-bold font-['Montserrat'] text-[#273655] text-[20px] sm:text-[24px] md:text-[28px] leading-tight">
                современные складские системы, оборудования и инфраструктура.
              </div>
            </div>

            {/* Верхний правый */}
            <div className="relative rounded-3xl bg-[#F3EEDD] shadow-md flex flex-col justify-between p-6 w-full md:w-[560px] md:h-[255px] overflow-hidden">
              <div className="z-10 relative">
                <div className="text-[20px] md:text-[24px] font-bold font-['Montserrat'] text-[#273655] mb-3">
                  Безопасность и надежность
                </div>
                <div className="text-[#717171] font-['Montserrat'] text-[14px] md:text-[16px] leading-snug">
                  Наши склады оборудованы современными системами безопасности,
                  включая видеонаблюдение,
                  <br /> охрану и контроль доступа.
                </div>
              </div>
              <img
                src={key2}
                alt="key"
                className="absolute right-[-40px] bottom-[-120px] w-[200px] md:w-[320px] rotate-[20deg] select-none pointer-events-none z-0"
              />
            </div>

            {/* Зелёный блок */}
            <div className="relative rounded-3xl bg-[#6AD960] shadow-md flex flex-col justify-between items-end p-6 w-full md:w-[560px] md:h-[255px] overflow-hidden">
              <div className="z-10 relative text-right">
                <div className="text-[20px] md:text-[24px] font-bold font-['Montserrat'] text-white mb-3">
                  Конкурентные цены
                </div>
                <div
                  className="text-[#313131B2] font-['Montserrat'] text-[14px] md:text-[16px] leading-snug"
                  style={{ paddingLeft: "100px" }}
                >
                  Мы предлагаем конкурентоспособные <br />цены на аренду, чтобы помочь
                  вам <br />сэкономить на затратах и улучшить <br />вашу рентабельность.
                </div>
              </div>
              <img
                src={procent2}
                alt="procent"
                className="absolute left-[-60px] bottom-[-100px] w-[200px] md:w-[320px] rotate-[-1deg] select-none pointer-events-none z-0"
              />
            </div>

            {/* Оранжевый — Репутация */}
            <div className="relative rounded-3xl bg-[#EA9938] shadow-md flex flex-col justify-between p-6 w-full md:w-[560px] md:h-[255px] overflow-hidden">
              <div className="z-10 relative">
                <div className="text-[20px] md:text-[24px] font-bold font-['Montserrat'] text-white mb-3">
                  Репутация
                </div>
                <div className="text-[#423131B2] font-['Montserrat'] text-[14px] md:text-[16px] leading-snug">
                  Мы имеем прочную репутацию, основанную
                  <br /> на долгосрочных отношениях с нашими
                  <br /> клиентами и их полной
                  <br /> удовлетворенности нашими услугами.
                </div>
              </div>
              <img
                src={good2}
                alt="good"
                className="absolute right-[-60px] bottom-[-100px] w-[200px] md:w-[320px] rotate-[-20deg] select-none pointer-events-none z-0"
              />
            </div>

            {/* Жёлтый — Оплата */}
            <div
              className="relative rounded-3xl bg-[#CFB238] shadow-md flex flex-col justify-between items-end p-6 w-full md:w-[560px] md:h-[255px] overflow-hidden cursor-pointer"

            >
              <div className="z-10 relative text-right">
                <div className="text-[20px] md:text-[24px] font-bold font-['Montserrat'] text-white mb-3">
                  Оплата банковской картой онлайн
                </div>
                <div className="text-[#00000094] font-['Montserrat'] text-[14px] md:text-[16px] leading-snug">
                  Вы можете оплатить услугу банковской картой Visa / Mastercard,
                  а также с помощью Apple Pay и Google Pay.
                </div>
              </div>
              <img
                src={image85}
                alt="bank card"
                className="absolute right-[180px] bottom-[-10px] w-[150px] md:w-[220px] select-none pointer-events-none z-0"
                style={{ paddingLeft: "70px" }}
              />
              <div className="flex justify-center md:justify-start">
                <button
                  onClick={() => navigate("/online-payment")}
                  className="mt-2 sm:mt-4 w-full sm:w-[165px] h-[36px] bg-[#273655] text-white text-[14px] sm:text-[16px] font-medium rounded-[20px] flex items-center justify-center gap-2 hover:bg-[#1e2940] transition-colors"
                >
                  Подробнее
                </button>
              </div>
            </div>


            {/* Синий — Гарантии */}
            <div className="relative rounded-3xl bg-[#0181D3] shadow-md flex flex-col justify-between p-6 w-full md:w-[560px] md:h-[255px] overflow-hidden">
              <div className="z-10 relative">
                <div className="text-[20px] md:text-[24px] font-bold font-['Montserrat'] text-white mb-3">
                  Гарантии безопасности
                </div>
                <div className="text-[#00000073] font-['Montserrat'] text-[14px] md:text-[16px] leading-snug" style={{ color: "white" }}>
                  OneVision не передает данные Вашей карты третьим <br />лицам. Ввод
                  данных осуществляется в <br />защищенном  окне на платежной
                  странице.
                </div>
              </div>
              <img
                src={group1010}
                alt="security"
                className="absolute right-[20px] bottom-[10px] w-[120px] md:w-[150px] select-none pointer-events-none z-0"
              />
            </div>
          </div>
        </div>
      </section>
      <div className="flex justify-center w-full px-5 my-5 mb-24">
        <button
          onClick={() => navigate("/warehouse-order")}
          className="w-[290px] h-[50px] bg-[#273655] text-white text-[18px] font-bold rounded-[20px] hover:bg-[#273655] transition-colors font-['Montserrat'] disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_4px_0_#B0B0B0]"
        >
          ЗАБРОНИРОВАТЬ БОКС
        </button>
      </div>
      {/* Третий фрейм: карточка склада */}
      <section className="w-full flex justify-center items-center px-4 py-8 font-['Montserrat']">
        <VolumeSelector />
      </section>

      {/* Четвертый фрейм: калькулятор стоимости */}
      <CostCalculator />
      {/* Пятый фрейм: как работает облачное хранение */}
      <section className="w-full flex flex-col items-center justify-center mt-1 font-['Montserrat'] px-4">
        <div className="w-full max-w-[1100px] mx-auto">
          {/* Заголовок */}
          <h2 className="text-[24px] md:text-[30px] font-bold text-[#273655] text-center mb-8">
            Как работает облачное хранение?
          </h2>

          {/* Видео */}
          <div className="w-full flex justify-center mb-6">
            <div className="w-full max-w-[900px] aspect-video shadow-lg rounded-lg overflow-hidden">
              <iframe
                src="https://www.youtube.com/embed/nW1yLTEeLWc?si=4O4dNpCsmMSlLY0x"
                title="Как работает облачное хранение"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Подпись */}
          <div className="text-[18px] md:text-[20px] font-medium text-[#273655] text-center mb-10 px-2">
            Платите только за объем ваших вещей, а не за весь склад
          </div>

          {/* Блок шагов */}
          <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-[900px] mx-auto mt-4 pb-2">
            {/* Соединяющая линия для desktop */}
            <div
              className="hidden md:block absolute left-[130px] right-[130px] top-[60%] h-[2px] bg-[#273655] z-0"
              style={{ transform: "translateY(-50%)" }}
            />

            {/* Шаги */}
            {[
              {
                title: "Заявка",
                icon: FileCheckIcon,
              },
              {
                title: "Упаковка",
                icon: BoxTickIcon,
              },
              {
                title: "Доставка",
                icon: GroupIcon,
              },
              {
                title: "Хранение",
                icon: ShieldTickIcon,
              },
              {
                title: "Возврат",
                icon: GroupIcon,
                flipped: true,
              },
            ].map((step, index) => (
              <div
                key={index}
                className="flex flex-col items-center z-10 text-center"
              >
                <span className="text-[#000] text-[16px] md:text-[18px] mb-1">
                  {step.title}
                </span>
                <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                  <img
                    src={step.icon}
                    alt={step.title}
                    className="w-[36px] h-[36px]"
                    style={step.flipped ? { transform: "scaleX(-1)" } : {}}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
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
              <WarehouseMap warehouses={warehouses} />
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
                        selectedWarehouse.work_end
                        ? `Режим: ${selectedWarehouse.work_start} - ${selectedWarehouse.work_end}`
                        : "Режим работы уточняется"}
                    </p>
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
                      {selectedWarehouse.address || "Адрес уточняется"}
                    </div>
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
