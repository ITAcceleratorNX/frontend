import React, { useState, memo, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../../widgets";
import vectorImg from "../../assets/vector.png";
import backgroundTextImg from "../../assets/background-text.png";
import boxesImg from "../../assets/boxes.png";
import good2 from "../../assets/good2.png";
import procent2 from "../../assets/procent2.png";
import key2 from "../../assets/key2.png";
import chatgptImg from "../../assets/chatgpt.png";

import FileCheckIcon from "../../assets/File_Check.png";
import GroupIcon from "../../assets/group.png";
import ShieldTickIcon from "../../assets/shield-tick.png";
import BoxTickIcon from "../../assets/box-tick.png";
import beigeCircle from "../../assets/beige_circle.svg";
import houseOnBeigeCircle from "../../assets/house_on_beige_circle.svg";
import extraOldLogo from "../../assets/extra_old_logo.jpg";
import extraspaceLogo from "../../assets/extraspace_logo.png";
import image85 from "../../assets/image 85.png";
import group1010 from "../../assets/Group 1010.png";
import Footer from "../../widgets/Footer";
import FAQ from "../../components/FAQ";
import WarehouseMap from "../../components/WarehouseMap";
import ChatButton from "../../shared/components/ChatButton";
import CostCalculator from "../../shared/components/CostCalculator";
import { warehouseApi } from "../../shared/api/warehouseApi";

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
        const dropdown = event.target.closest('.warehouse-dropdown');
        if (!dropdown) {
          setIsWarehouseDropdownOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isWarehouseDropdownOpen]);

  // Функции для управления выпадающим списком
  const toggleWarehouseDropdown = () => {
    setIsWarehouseDropdownOpen(!isWarehouseDropdownOpen);
  };

  const handleWarehouseSelect = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setIsWarehouseDropdownOpen(false);
    if (import.meta.env.DEV) {
      console.log("Выбран склад:", warehouse);
    }
  };

  if (import.meta.env.DEV) {
    console.log("Рендеринг компонента HomePage");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      <div className="flex-1 relative overflow-hidden">
        <div className="container mx-auto tracking-[0.1em] px-2 py-8">
          <div className="text-center relative flex flex-col items-center">
            <h1 className="text-[40px] md:text-[55px] font-bold text-[#273655] mb-2 flex flex-col items-center leading-[1.0] font-['Montserrat']">
              <span className="mb-1">БЕРЕЖНОЕ ХРАНЕНИЕ</span>
              <div className="flex justify-center items-center gap-2">
                <img
                  src={vectorImg}
                  alt="Декоративный элемент"
                  className="w-10 h-10"
                />
                <span>ВАШИХ ВЕЩЕЙ</span>
                <img
                  src={vectorImg}
                  alt="Декоративный элемент"
                  className="w-10 h-10"
                />
              </div>
            </h1>

            <div className="mt-3">
              <button className="bg-[#273655] text-white px-10 py-1 rounded-[30px] text-lg font-medium hover:bg-[#2a3c64] transition-colors font-['Montserrat']">
                Теплые склады с охраной от 3 м²
              </button>
            </div>

            <div className="relative mt-5 w-full h-[470px]">
              {/* Фоновый текст */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-[126%] max-w-none z-0 h-full flex items-center justify-center">
                <img
                  src={backgroundTextImg}
                  alt="Background"
                  className="w-full h-auto object-contain mix-blend-normal opacity-[0.9] brightness-[0] contrast-[100%] scale-90"
                />
              </div>

              {/* Коробки поверх текста */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <img
                  src={boxesImg}
                  alt="Storage boxes"
                  className="w-full max-w-6xl object-contain transform scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Второй фрейм: преимущества */}
      <section className="w-full flex flex-col items-center justify-center mt-24 mb-24">
        <div className="w-full flex flex-col items-center">
          <div
            className="grid grid-cols-2 grid-rows-3 gap-x-6 gap-y-2"
            style={{ width: 1144 }}
          >
            {/* Верхний левый — текстовый блок */}
            <div className="flex flex-col h-[255px] w-[560px] pl-2 pt-6">
              <div
                className="text-[28px] font-bold text-[#273655] leading-tight mb-6"
                style={{ maxWidth: 560 }}
              >
                мы предоставляем{" "}
                <span className="text-[#C73636]">
                  автоматизированные склады
                </span>
                <br />
                для хранения вещей.
              </div>
              <div
                className="font-bold text-[#273655] text-[28px] leading-tight"
                style={{ maxWidth: 560 }}
              >
                современные складские системы, оборудования и инфраструктура.
              </div>
            </div>
            {/* Верхний правый — бежевый с замком */}
            <div className="relative rounded-3xl bg-[#F3EEDD] shadow-md flex flex-col justify-between p-8 w-[560px] h-[255px] overflow-hidden">
              <div className="z-10 relative">
                <div className="text-[24px] font-bold text-[#273655] mb-3">
                  Безопасность и надежность
                </div>
                <div className="text-[#717171] text-[16px] leading-snug max-w-[340px]">
                  Наши склады оборудованы современными системами безопасности,
                  включая видеонаблюдение, охрану и контроль доступа.
                </div>
              </div>
              <img
                src={key2}
                alt="key"
                className="absolute right-[-40px] bottom-[-120px] w-[320px] rotate-[20deg] select-none pointer-events-none z-0"
              />
            </div>
            {/* Посередине левый — зеленый с процентами */}
            <div className="relative rounded-3xl bg-[#6AD960] shadow-md flex flex-col justify-between items-end p-8 w-[560px] h-[255px] mt-2 overflow-hidden">
              <div className="z-10 relative text-right">
                <div className="text-[24px] font-bold text-white mb-3">
                  Конкурентные цены
                </div>
                <div className="text-[#313131B2] text-[16px] leading-snug max-w-[340px]">
                  Мы предлагаем конкурентоспособные цены на аренду, чтобы помочь
                  вам сэкономить на затратах и улучшить вашу рентабельность.
                </div>
              </div>
              <img
                src={procent2}
                alt="procent"
                className="absolute left-[-80px] bottom-[-120px] w-[320px] rotate-[-1deg] select-none pointer-events-none z-0"
              />
            </div>
            {/* Нижний правый — оранжевый с рукой */}
            {/* Посередине правый — оранжевый с рукой */}
            <div className="relative rounded-3xl bg-[#EA9938] shadow-md flex flex-col justify-between p-8 w-[560px] h-[255px] mt-2 overflow-hidden">
              <div className="z-10 relative">
                <div className="text-[24px] font-bold text-white mb-3">
                  Репутация
                </div>
                <div className="text-[#423131B2] text-[16px] leading-snug max-w-[340px]">
                  Мы имеем прочную репутацию, основанную на долгосрочных
                  отношениях с нашими клиентами и их полной удовлетворенности
                  нашими услугами.
                </div>
              </div>
              <img
                src={good2}
                alt="good"
                className="absolute right-[-80px] bottom-[-120px] w-[320px] rotate-[-20deg] select-none pointer-events-none z-0"
              />
            </div>
            {/* Нижний левый — Оплата банковской картой онлайн */}
            <div className="relative rounded-3xl bg-[#CFB238] shadow-md flex flex-col justify-between items-end p-8 w-[560px] h-[255px] mt-2 overflow-hidden">
              {/* Подробнее кнопка – верхняя левая часть */}
              <button
                className="absolute top-4 left-4 px-6 py-1 bg-[#2a3c64] text-white rounded-full text-sm font-medium hover:bg-[#1a2a4c] transition-colors z-20"
                onClick={() => navigate("/online-payment")}
              >
                Подробнее
              </button>

              {/* Текстовый блок */}
              <div className="z-10 relative text-right max-w-[310px]">
                <div className="text-[24px] font-bold text-white mb-3">
                  Оплата банковской картой онлайн
                </div>
                <div className="text-[#00000094] text-[16px] leading-snug max-w-[410px]">
                  Наш сайт подключен к интернет-эквайрингу, и Вы можете оплатить
                  услугу банковской картой Visa или Mastercard, а также с
                  помощью Apple Pay и Google Pay.
                </div>
              </div>

              {/* Картинка */}
              <img
                src={image85}
                alt="bank card"
                className="absolute right-[360px] bottom-[-10px] w-[220px] select-none pointer-events-none z-0"
              />
            </div>

            {/* Нижний правый — Гарантии безопасности */}
            <div className="relative rounded-3xl bg-[#0181D3] shadow-md flex flex-col justify-between p-8 w-[560px] h-[255px] mt-2 overflow-hidden">
              <div className="z-10 relative">
                <div className="text-[24px] font-bold text-white mb-3">
                  Гарантии безопасности
                </div>
                <div className="text-[#00000073] text-[16px] leading-snug max-w-[340px]">
                  OneVision не передает данные Вашей карты третьим лицам. Ввод
                  данных осуществляется в защищенном окне на платежной странице
                  OneVision.
                </div>
              </div>
              <img
                src={group1010}
                alt="security"
                className="absolute right-[40px] bottom-[20px] w-[150px] select-none pointer-events-none z-0"
              />
            </div>
          </div>
        </div>
      </section>
      {/* Третий фрейм: карточка склада */}
      <section className="w-full flex justify-center items-center mb-24 font-['Montserrat']">
        <div className="flex w-[1100px] min-h-[420px] bg-white rounded-3xl">
          {/* Левая часть: текст и кнопки */}
          <div className="flex-1 flex flex-col justify-between py-8 pr-10 pl-8">
            {/* Заголовок */}

            {/* Кнопки выбора объёма */}
            <div className="flex gap-4 mb-8">
              <button className="px-8 py-3 rounded-full bg-[#273655] text-white text-[22px] font-medium shadow-sm border-2 border-[#273655] focus:outline-none">
                3 м³
              </button>
              <button className="px-8 py-3 rounded-full bg-white text-[#273655] text-[22px] font-medium border-2 border-[#273655] focus:outline-none">
                5 м³
              </button>
              <button className="px-8 py-3 rounded-full bg-white text-[#273655] text-[22px] font-medium border-2 border-[#273655] focus:outline-none">
                10 м³
              </button>
            </div>
            {/* Описание */}
            <div className="mb-6">
              <div className="text-[#A3A3A3] text-[20px] font-medium leading-snug mb-2">
                Такой объём подходит для хранения части мебели и бытовой техники
                из небольшой комнаты.
              </div>
              <div className="text-[#A3A3A3] text-[20px] font-medium leading-snug mb-2">
                Примерно столько занимает багаж из однокомнатной квартиры при
                переезде.
              </div>
              <div className="text-[#A3A3A3] text-[20px] font-medium leading-snug mb-6">
                Когда нужно спрятать всё лишнее, но пока не расставаться.
              </div>
              <div className="text-[#273655] text-[18px] font-medium leading-snug mb-1">
                Вмещает до X коробок или Y предметов мебели
              </div>
              <div className="text-[#273655] text-[18px] font-medium leading-snug mb-1">
                Примеры:
              </div>
              <div className="text-[#273655] text-[18px] font-medium leading-snug">
                - Матрас, стиральная машина, пылесос, тумбочка, чемодан и
                несколько коробок с вещами
              </div>
            </div>
            {/* Кнопка Подробнее */}
            <button className="mt-6 w-[260px] h-[56px] bg-[#273655] text-white text-[22px] font-medium rounded-full flex items-center justify-center gap-2 hover:bg-[#1e2940] transition-colors">
              Подробнее
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
                className="ml-1"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
          {/* Правая часть: картинка с мебелью и размерами */}
          <div className="flex-1 flex items-center justify-center">
            <img
              src={chatgptImg}
              alt="Склад с мебелью"
              className="w-[420px] h-[420px] object-contain rounded-2xl mt-10"
            />
          </div>
        </div>
      </section>
      <div className="flex justify-center w-full px-10 my-10">
        <button 
          onClick={() => navigate("/warehouse-order")} 
          className="w-[320px] h-[56px] bg-[#F86812] text-white text-[18px] font-bold rounded-[28px] hover:bg-[#d87d1c] transition-colors font-['Montserrat'] disabled:opacity-50 disabled:cursor-not-allowed shadow-[4px_4px_8px_0_#B0B0B0]"
        >
          ЗАБРОНИРОВАТЬ БОКС
        </button>
      </div>

      {/* Четвертый фрейм: калькулятор стоимости */}
      <CostCalculator />
      {/* Пятый фрейм: как работает облачное хранение */}
      <section className="w-full flex flex-col items-center justify-center mt-1 mb-10 font-['Montserrat']">
        <div className="w-full max-w-[1100px] mx-auto">
          {/* Верхняя строка с иконкой и надписью */}

          {/* Заголовок */}
          <h2 className="text-[32px] md:text-[35px] font-bold text-[#273655] text-center mb-10">
            Как работает облачное хранение?
          </h2>
          {/* Видео */}
          <div className="w-full flex justify-center mb-7">
            <div className="w-full max-w-[900px] shadow-lg">
              <iframe
                width="100%"
                height="506"
                src="https://www.youtube.com/embed/nW1yLTEeLWc?si=4O4dNpCsmMSlLY0x"
                title="Как работает облачное хранение"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="rounded-lg"
              />
            </div>
          </div>
          {/* Подпись жирная */}
          <div className="text-[24px] md:text-[24px] font-bold text-[#273655] text-center mb-10">
            Платите только за объем ваших вещей, а не за весь склад
          </div>
          {/* Блок шагов */}
          <div className="relative flex flex-row items-end justify-center gap-x-16 w-full max-w-[900px] mx-auto mt-4 pb-2">
            {/* Одна соединяющая линия под всеми шагами */}
            <div
              className="absolute left-[130px] right-[130px] top-[60%] h-[2px] bg-[#273655] z-0"
              style={{ transform: "translateY(-50%)" }}
            />
            {/* Шаг 1: Заявка */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">
                Заявка
              </span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img
                  src={FileCheckIcon}
                  alt="Заявка"
                  className="w-[36px] h-[36px]"
                />
              </div>
            </div>
            {/* Шаг 2: Упаковка */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">
                Упаковка
              </span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img
                  src={BoxTickIcon}
                  alt="Упаковка"
                  className="w-[36px] h-[36px]"
                />
              </div>
            </div>
            {/* Шаг 3: Доставка */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">
                Доставка
              </span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img
                  src={GroupIcon}
                  alt="Доставка"
                  className="w-[36px] h-[36px]"
                />
              </div>
            </div>
            {/* Шаг 4: Хранение */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">
                Хранение
              </span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img
                  src={ShieldTickIcon}
                  alt="Хранение"
                  className="w-[36px] h-[36px]"
                />
              </div>
            </div>
            {/* Шаг 5: Возврат */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">
                Возврат
              </span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img
                  src={GroupIcon}
                  alt="Возврат"
                  className="w-[36px] h-[36px]"
                  style={{ transform: "scaleX(-1)" }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Шестой фрейм: филиалы Extra Space */}
      <section className="w-full flex flex-col items-center justify-center mt-28 mb-24 font-['Montserrat']">
        <div className="w-full max-w-[1300px] flex flex-col items-start mx-auto mb-10 px-20 md:px-24">
          <h2 className="text-[48px] md:text-[56px] font-bold text-[#273655] ml-2 mt-0">
            ФИЛИАЛЫ
          </h2>
        </div>
        <div className="w-full max-w-[1300px] flex flex-row gap-12 items-start mx-auto px-20 md:px-24">
          {/* Левая часть: интерактивная карта 2ГИС */}
          <div
            className="rounded-3xl overflow-hidden bg-[#f3f3f3]"
            style={{
              width: 480,
              height: 480,
              boxShadow: "4px 4px 8px 0 #B0B0B0",
            }}
          >
            <WarehouseMap warehouses={warehouses} />
          </div>
          {/* Правая часть: карточка выбранного склада */}
          <div className="relative">
            {warehousesLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#273655]"></div>
              </div>
            )}
            
          <div
            className="bg-white rounded-lg flex flex-row items-center justify-start pr- py-8 self-center"
            style={{
              minWidth: 540,
              minHeight: 300,
              height: 300,
              maxHeight: 320,
              maxWidth: 600,
              width: 560,
              boxShadow: "4px 4px 8px 0 #B0B0B0",
            }}
          >
              {/* Левая часть: логотип */}
            <div className="flex items-center justify-center w-[270px] h-[270px] p-2">
              <img
                  src={selectedWarehouse?.image || extraspaceLogo}
                alt="logo"
                className="w-[270px] h-[270px] rounded-lg object-cover bg-[#273655]"
              />
            </div>
              {/* Правая часть: информация о складе */}
            <div className="flex flex-col items-start justify-center flex-1 h-full gap-y-2 ml-6">
              <div
                className="text-[#3E4958] text-[20px] font-medium leading-tight"
                style={{ lineHeight: 1.1 }}
              >
                  {selectedWarehouse?.name || "Загрузка..."}
              </div>
                
                {selectedWarehouse && (
                  <>
              <div className="text-[#3E4958] text-[15px] font-normal leading-tight">
                      Статус: <span className={`font-medium ${selectedWarehouse.status === 'AVAILABLE' ? 'text-green-600' : 'text-red-600'}`}>
                        {selectedWarehouse.status === 'AVAILABLE' ? 'Доступен' : 'Недоступен'}
                      </span>
              </div>
              <div className="text-[#3E4958] text-[15px] font-normal">
                      {selectedWarehouse.work_start && selectedWarehouse.work_end ? 
                        `Режим: ${selectedWarehouse.work_start} - ${selectedWarehouse.work_end}` : 
                        "Режим работы уточняется"
                      }
              </div>
              <div className="flex items-center mt-1 mb-2">
                <span
                  className="relative inline-block"
                  style={{ width: 24, height: 24 }}
                >
                  <img
                    src={beigeCircle}
                    alt="beige circle"
                    className="absolute left-0 top-0 w-full h-full"
                  />
                  <img
                    src={houseOnBeigeCircle}
                    alt="house on beige"
                    className="absolute left-1/2 top-1/2"
                    style={{
                      width: "15px",
                      height: "15px",
                      transform: "translate(-50%, -50%)",
                    }}
                  />
                </span>
                <span className="text-[#273655] text-[15px] font-normal ml-2">
                        {selectedWarehouse.address || "Адрес уточняется"}
                </span>
              </div>
                  </>
                )}

                {warehousesError && (
                  <div className="text-red-600 text-sm mb-2">
                    {warehousesError}
                  </div>
                )}

                {/* Кнопка выбора склада с выпадающим списком */}
                <div className="relative w-full max-w-[240px] mt-0 warehouse-dropdown">
              <button
                    className="px-2 py-3 bg-[#273655] text-white rounded-full text-lg font-medium hover:bg-[#193A7E] transition-colors w-full flex items-center justify-center gap-2"
                    onClick={toggleWarehouseDropdown}
                    disabled={warehousesLoading}
                  >
                    Выбрать склад
                    <svg 
                      className={`w-4 h-4 transition-transform ${isWarehouseDropdownOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
              </button>

                  {/* Выпадающий список */}
                  {isWarehouseDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                      {apiWarehouses.length > 0 ? (
                        apiWarehouses.map((warehouse) => (
                          <button
                            key={warehouse.id}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 text-sm"
                            onClick={() => handleWarehouseSelect(warehouse)}
                          >
                            <div className="font-medium text-[#273655]">
                              {warehouse.name}
            </div>
                            <div className="text-gray-600 text-xs mt-1">
                              {warehouse.address}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                warehouse.status === 'AVAILABLE' 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-red-100 text-red-700'
                              }`}>
                                {warehouse.status === 'AVAILABLE' ? 'Доступен' : 'Недоступен'}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-gray-500 text-center">
                          Нет доступных складов
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Кнопка бронирования */}
                {selectedWarehouse && selectedWarehouse.status === 'AVAILABLE' && (
                  <button
                    className="px-2 py-2 bg-[#F86812] text-white rounded-full text-sm font-medium hover:bg-[#d87d1c] transition-colors w-full max-w-[240px] mt-2"
                    onClick={() => navigate("/warehouse-order")}
                  >
                    Забронировать бокс
                  </button>
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
