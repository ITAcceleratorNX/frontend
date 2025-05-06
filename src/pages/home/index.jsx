import React, { useState } from 'react';
import { Header } from '../../widgets';
import vectorImg from '../../assets/vector.png';
import backgroundTextImg from '../../assets/background-text.png';
import boxesImg from '../../assets/boxes.png';
import good2 from '../../assets/good2.png';
import procent2 from '../../assets/procent2.png';
import key2 from '../../assets/key2.png';
import chatgptImg from '../../assets/chatgpt.png';
import warehouseImg from '../../assets/warehouse.png';
import housePlanIcon from '../../assets/house-plan_5203481 1.svg';
import arrowDownIcon from '../../assets/arrow-down.svg';
import textAlignIcon from '../../assets/textalign-justifycenter.svg';
import FileCheckIcon from '../../assets/File_Check.png';
import GroupIcon from '../../assets/group.png';
import ShieldTickIcon from '../../assets/shield-tick.png';
import BoxTickIcon from '../../assets/box-tick.png';
import beigeCircle from '../../assets/beige_circle.svg';
import houseOnBeigeCircle from '../../assets/house_on_beige_circle.svg';
import extraOldLogo from '../../assets/extra_old_logo.jpg';
import LinkedInIcon from '../../assets/linkedin black.1.svg';
import InstagramIcon from '../../assets/instagram black.1.svg';
import YouTubeIcon from '../../assets/youtube color.1.svg';
import RoundPlaceIcon from '../../assets/round-place-24px.svg';
import RoundPhoneIcon from '../../assets/round-phone-24px.svg';

// ... existing imports ...

const HomePage = () => {
  const [area, setArea] = useState(50);

  const mapSrc = "https://2gis.kz/almaty?m=76.9167%2C43.25%2F11";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 relative overflow-hidden">
        <div className="container mx-auto tracking-[0.1em] px-2 py-8">
          <div className="text-center relative flex flex-col items-center">
            <h1 className="text-[40px] md:text-[55px] font-bold text-[#273655] mb-2 flex flex-col items-center leading-[1.0] font-['Montserrat']">
              <span className="mb-1">БЕРЕЖНОЕ ХРАНЕНИЕ</span>
              <div className="flex justify-center items-center gap-2">
                <img src={vectorImg} alt="Декоративный элемент" className="w-10 h-10" />
                <span>ВАШИХ ВЕЩЕЙ</span>
                <img src={vectorImg} alt="Декоративный элемент" className="w-10 h-10" />
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
          <div className="w-full max-w-[1220px] pl-11 mb-6 flex items-center">
            <img src={textAlignIcon} alt="icon" className="w-[18px] h-[18px] mr-[6px]" />
            <span className="text-xs text-[#A6A6A6] font-medium">Почему Extra Space?</span>
          </div>
          <div className="grid grid-cols-2 grid-rows-2 gap-x-6 gap-y-2" style={{width: 1144, height: 560}}>
            {/* Верхний левый — текстовый блок */}
            <div className="flex flex-col h-[255px] w-[560px] pl-2 pt-6">
              <div className="text-[28px] font-bold text-[#273655] leading-tight mb-6" style={{maxWidth: 560}}>
                мы предоставляем <span className="text-[#C73636]">автоматизированные склады</span><br />
                для хранения вещей.
              </div>
              <div className="font-bold text-[#273655] text-[28px] leading-tight" style={{maxWidth: 560}}>
                современные складские системы, оборудования и инфраструктура.
              </div>
            </div>
            {/* Верхний правый — бежевый с замком */}
            <div className="relative rounded-3xl bg-[#F3EEDD] shadow-md flex flex-col justify-between p-8 w-[560px] h-[255px] overflow-hidden">
              <div className="z-10 relative">
                <div className="text-[24px] font-bold text-[#273655] mb-3">Безопасность и надежность</div>
                <div className="text-[#7A7A7A] text-[16px] leading-snug max-w-[340px]">
                  Наши склады оборудованы современными системами безопасности, включая видеонаблюдение, охрану и контроль доступа.
                </div>
              </div>
              <img src={key2} alt="key" className="absolute right-[-40px] bottom-[-120px] w-[320px] rotate-[20deg] select-none pointer-events-none z-0" />
            </div>
            {/* Нижний левый — зеленый с процентами */}
            <div className="relative rounded-3xl bg-[#6AD960] shadow-md flex flex-col justify-between items-end p-8 w-[560px] h-[255px] overflow-hidden">
              <div className="z-10 relative text-right">
                <div className="text-[24px] font-bold text-white mb-3">Конкурентные цены</div>
                <div className="text-white text-[16px] leading-snug max-w-[340px]">
                  Мы предлагаем конкурентоспособные цены на аренду, чтобы помочь вам сэкономить на затратах и улучшить вашу рентабельность.
                </div>
              </div>
              <img src={procent2} alt="procent" className="absolute left-[-80px] bottom-[-120px] w-[320px] rotate-[-1deg] select-none pointer-events-none z-0" />
            </div>
            {/* Нижний правый — оранжевый с рукой */}
            <div className="relative rounded-3xl bg-[#EA9938] shadow-md flex flex-col justify-between p-8 w-[560px] h-[255px] overflow-hidden">
              <div className="z-10 relative">
                <div className="text-[24px] font-bold text-white mb-3">Репутация</div>
                <div className="text-white text-[16px] leading-snug max-w-[340px]">
                  Мы имеем прочную репутацию, основанную на долгосрочных отношениях с нашими клиентами и их полной удовлетворенности нашими услугами.
                </div>
              </div>
              <img src={good2} alt="good" className="absolute right-[-80px] bottom-[-120px] w-[320px] rotate-[-20deg] select-none pointer-events-none z-0" />
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
            <div className="flex items-center mb-6">
              <img src={textAlignIcon} alt="icon" className="w-[18px] h-[18px] mr-[6px]" />
              <span className="text-xs text-[#A6A6A6] font-medium">Наши склады</span>
            </div>
            {/* Кнопки выбора объёма */}
            <div className="flex gap-4 mb-8">
              <button className="px-8 py-3 rounded-full bg-[#273655] text-white text-[22px] font-medium shadow-sm border-2 border-[#273655] focus:outline-none">3 м³</button>
              <button className="px-8 py-3 rounded-full bg-white text-[#273655] text-[22px] font-medium border-2 border-[#273655] focus:outline-none">5 м³</button>
              <button className="px-8 py-3 rounded-full bg-white text-[#273655] text-[22px] font-medium border-2 border-[#273655] focus:outline-none">10 м³</button>
            </div>
            {/* Описание */}
            <div className="mb-6">
              <div className="text-[#A3A3A3] text-[20px] font-medium leading-snug mb-2">Такой объём подходит для хранения части мебели и бытовой техники из небольшой комнаты.</div>
              <div className="text-[#A3A3A3] text-[20px] font-medium leading-snug mb-2">Примерно столько занимает багаж из однокомнатной квартиры при переезде.</div>
              <div className="text-[#A3A3A3] text-[20px] font-medium leading-snug mb-6">Когда нужно спрятать всё лишнее, но пока не расставаться.</div>
              <div className="text-[#273655] text-[18px] font-medium leading-snug mb-1">Вмещает до X коробок или Y предметов мебели</div>
              <div className="text-[#273655] text-[18px] font-medium leading-snug mb-1">Примеры:</div>
              <div className="text-[#273655] text-[18px] font-medium leading-snug">- Матрас, стиральная машина, пылесос, тумбочка, чемодан и несколько коробок с вещами</div>
            </div>
            {/* Кнопка Подробнее */}
            <button className="mt-6 w-[260px] h-[56px] bg-[#273655] text-white text-[22px] font-medium rounded-full flex items-center justify-center gap-2 hover:bg-[#1e2940] transition-colors">
              Подробнее
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          {/* Правая часть: картинка с мебелью и размерами */}
          <div className="flex-1 flex items-center justify-center">
            <img src={chatgptImg} alt="Склад с мебелью" className="w-[420px] h-[420px] object-contain rounded-2xl mt-10" />
          </div>
        </div>
      </section>
      {/* Четвертый фрейм: калькулятор стоимости и warehouse.png */}
      <section className="w-full flex justify-center items-center mb-24 font-['Montserrat']">
        <div className="w-full max-w-[1100px] mx-auto flex flex-row items-start gap-[60px] bg-transparent px-4">
          {/* Левая колонка: калькулятор */}
          <div className="flex flex-col flex-[0_0_440px] items-start font-['Montserrat']">
            <div className="flex items-center mb-8">
              <img src={textAlignIcon} alt="icon" className="w-[18px] h-[18px] mr-[6px]" />
              <span className="text-xs text-[#A6A6A6]">Быстро и удобно</span>
            </div>
            <label className="text-[22px] text-[#6B6B6B] font-bold mb-4 font-['Montserrat']" htmlFor="area">Площадь:</label>
            <div className="w-full flex flex-col mb-8">
              <div className="relative w-full h-[56px] flex items-center bg-white" style={{borderRadius:'8px 8px 8px 0', boxShadow:'4px 4px 8px 0 #B0B0B0'}}>
                <span className="absolute left-4 flex items-center h-full">
                  <img src={housePlanIcon} alt="house plan" className="w-6 h-6" />
                </span>
                <span className="ml-12 text-[#C7C7C7] text-[18px] font-['Montserrat']">— {area} кв.м</span>
              </div>
              <div className="w-full relative" style={{marginTop:'-22px'}}>
                {/* Синий прогресс-бар до ползунка */}
                <div className="absolute left-0 bottom-0 h-[2px] bg-[#0062D3] rounded-full" style={{width: `${area}%`, zIndex:1}}></div>
                {/* Прозрачная часть */}
                <div className="absolute right-0 bottom-0 h-[2px] bg-transparent" style={{left: `${area}%`, zIndex:1}}></div>
                <input id="area" type="range" min="1" max="100" value={area} onChange={e => setArea(Number(e.target.value))} className="w-full h-[2px] bg-transparent appearance-none relative z-10" style={{WebkitAppearance:'none'}} />
                <style>{`
                  input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #F86812;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
                    cursor: pointer;
                  }
                  input[type='range']::-webkit-slider-runnable-track {
                    height: 2px;
                    background: transparent;
                  }
                  input[type='range']:focus {
                    outline: none;
                  }
                  input[type='range']::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #EA9938;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
                    cursor: pointer;
                  }
                  input[type='range']::-ms-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #EA9938;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
                    cursor: pointer;
                  }
                  input[type='range']::-ms-fill-lower {
                    background: transparent;
                  }
                  input[type='range']::-ms-fill-upper {
                    background: transparent;
                  }
                `}</style>
              </div>
            </div>
            <label className="text-[22px] text-[#9C9C9C] font-bold mb-4 font-['Montserrat']" htmlFor="period">Срок аренды (дни/месяцы):</label>
            <div className="flex gap-4 mb-8 w-full">
              <div className="relative flex-1">
                <select className="w-full h-[56px] rounded-lg border-none bg-white pr-10 pl-4 text-[18px] text-[#C7C7C7] font-normal focus:outline-none appearance-none font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}>
                  <option>— месяц</option>
                </select>
                <img src={arrowDownIcon} alt="arrow down" className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <select className="w-full h-[56px] rounded-lg border-none bg-white pr-10 pl-4 text-[18px] text-[#C7C7C7] font-normal focus:outline-none appearance-none font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}>
                  <option>— день</option>
                </select>
                <img src={arrowDownIcon} alt="arrow down" className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <label className="text-[22px] text-[#9C9C9C] font-bold mb-4 font-['Montserrat']">Тип услуги:</label>
            <div className="flex flex-row gap-4 mb-4 w-full">
              <div className="flex flex-col gap-4 w-1/2">
                <button className="h-[56px] rounded-lg bg-[#273655] text-white text-[16px] font-bold w-full font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}>Обычное хранение</button>
                <button className="h-[56px] rounded-lg bg-white text-[#273655] text-[16px] font-bold w-full font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}>Мувинг</button>
              </div>
              <div className="flex flex-col gap-4 w-1/2">
                <button className="h-[56px] rounded-lg bg-white text-[#273655] text-[16px] font-bold w-full font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}>Облачное хранение</button>
                <div className="h-[56px] w-full"></div>
              </div>
            </div>
            <button className="w-full h-[56px] bg-[#F86812] text-white text-[18px] font-bold rounded-lg hover:bg-[#d87d1c] transition-colors mt-4 font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}>РАССЧИТАТЬ</button>
          </div>
          {/* Правая колонка: заголовок и картинка */}
          <div className="flex flex-col items-start flex-1 pt-16 pl-20">
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#273655] mb-4 ml-40 mt-4 text-left tracking-tight leading-tight">
              КАЛЬКУЛЯТОР<br />
              <span style={{marginLeft: '40px', display: 'inline-block'}}>СТОИМОСТИ</span>
            </h2>
            <img src={warehouseImg} alt="Склад warehouse" className="w-full max-w-[500px] object-contain" style={{transform:'scaleX(-1)'}} />
          </div>
        </div>
      </section>
      {/* Пятый фрейм: как работает облачное хранение */}
      <section className="w-full flex flex-col items-center justify-center mt-1 mb-10 font-['Montserrat']">
        <div className="w-full max-w-[1100px] mx-auto">
          {/* Верхняя строка с иконкой и надписью */}
          <div className="flex items-center mb-4">
            <img src={textAlignIcon} alt="icon" className="w-[18px] h-[18px] mr-[6px]" />
            <span className="text-xs text-[#A6A6A6] font-medium">Что такое "Облачное хранение"?</span>
          </div>
          {/* Заголовок */}
          <h2 className="text-[32px] md:text-[35px] font-bold text-[#273655] text-center mb-10">Как работает облачное хранение?</h2>
          {/* Видео */}
          <div className="w-full flex justify-center mb-7">
            <video controls className="w-full max-w-[900px] shadow-lg">
              <source src="https://www.freeloops.tv/download/?download_id=2150&collection_id=2658" type="video/mp4" />
              Ваш браузер не поддерживает видео.
            </video>
          </div>
          {/* Подпись жирная */}
          <div className="text-[24px] md:text-[24px] font-bold text-[#273655] text-center mb-10">Платите только за объем ваших вещей, а не за весь склад</div>
          {/* Блок шагов */}
          <div className="relative flex flex-row items-end justify-center gap-x-16 w-full max-w-[900px] mx-auto mt-4 pb-2">
            {/* Одна соединяющая линия под всеми шагами */}
            <div className="absolute left-[130px] right-[130px] top-[60%] h-[2px] bg-[#273655] z-0" style={{transform: 'translateY(-50%)'}} />
            {/* Шаг 1: Заявка */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">Заявка</span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img src={FileCheckIcon} alt="Заявка" className="w-[36px] h-[36px]" />
              </div>
            </div>
            {/* Шаг 2: Упаковка */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">Упаковка</span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img src={BoxTickIcon} alt="Упаковка" className="w-[36px] h-[36px]" />
              </div>
            </div>
            {/* Шаг 3: Доставка */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">Доставка</span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img src={GroupIcon} alt="Доставка" className="w-[36px] h-[36px]" />
              </div>
            </div>
            {/* Шаг 4: Хранение */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">Хранение</span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img src={ShieldTickIcon} alt="Хранение" className="w-[36px] h-[36px]" />
              </div>
            </div>
            {/* Шаг 5: Возврат */}
            <div className="flex flex-col items-center z-10">
              <span className="text-[#000000] text-[18px] font-little mb-1">Возврат</span>
              <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                <img src={GroupIcon} alt="Возврат" className="w-[36px] h-[36px]" style={{transform:'scaleX(-1)'}} />
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Шестой фрейм: филиалы Extra Space */}
      <section className="w-full flex flex-col items-center justify-center mt-28 mb-24 font-['Montserrat']">
        <div className="w-full max-w-[1300px] flex flex-col items-start mx-auto mb-10 px-20 md:px-24">
          <div className="flex items-center mb-2 mt-2">
            <img src={textAlignIcon} alt="icon" className="w-[18px] h-[18px] mr-[6px]" />
            <span className="text-xs text-[#A6A6A6] font-medium">Наши адреса</span>
          </div>
          <h2 className="text-[48px] md:text-[56px] font-bold text-[#273655] ml-2 mt-0">ФИЛИАЛЫ</h2>
        </div>
        <div className="w-full max-w-[1300px] flex flex-row gap-12 items-start mx-auto px-20 md:px-24">
          {/* Левая часть: квадратная карта 2ГИС */}
          <div className="rounded-3xl overflow-hidden bg-[#f3f3f3] flex items-center justify-center" style={{width: 480, height: 480, boxShadow: '4px 4px 8px 0 #B0B0B0'}}>
            <div className="flex flex-col items-center justify-center w-full h-full p-8">
              <svg width="100" height="100" fill="none" viewBox="0 0 100 100" className="mb-6 opacity-40">
                <rect width="100" height="100" rx="24" fill="#E5E7EB"/>
                <path d="M30 70V40a10 10 0 0 1 10-10h20a10 10 0 0 1 10 10v30" stroke="#A6A6A6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="50" cy="55" r="8" stroke="#A6A6A6" strokeWidth="4"/>
              </svg>
              <div className="text-[#A6A6A6] text-xl md:text-2xl font-semibold text-center max-w-xs">Здесь будет карта 2ГИС</div>
            </div>
          </div>
          {/* Правая часть: прямоугольная карточка филиала */}
          <div className="bg-white rounded-lg flex flex-row items-center justify-start pr- py-8 self-center" style={{minWidth: 540, minHeight: 300, height: 300, maxHeight: 320, maxWidth: 600, width: 560, boxShadow: '4px 4px 8px 0 #B0B0B0'}}>
            {/* Левая часть: только крупный логотип */}
            <div className="flex items-center justify-center w-[270px] h-[270px] p-2">
              <img src={extraOldLogo} alt="logo" className="w-[270px] h-[270px] rounded-lg object-cover bg-[#273655]" />
            </div>
            {/* Правая часть: все надписи и кнопка */}
            <div className="flex flex-col items-start justify-center flex-1 h-full gap-y-2 ml-6">
              <div className="text-[#3E4958] text-[20px] font-medium leading-tight" style={{lineHeight: 1.1}}>Название филиала (например, "Склад на Сайна")</div>
              <div className="text-[#3E4958] text-[15px] font-normal leading-tight">Телефон</div>
              <div className="text-[#3E4958] text-[15px] font-normal">Время работы (по желанию)</div>
              <div className="flex items-center mt-1 mb-2">
                <span className="relative inline-block" style={{width: 24, height: 24}}>
                  <img src={beigeCircle} alt="beige circle" className="absolute left-0 top-0 w-full h-full" />
                  <img src={houseOnBeigeCircle} alt="house on beige" className="absolute left-1/2 top-1/2" style={{width: '15px', height: '15px', transform: 'translate(-50%, -50%)'}} />
                </span>
                <span className="text-[#273655] text-[15px] font-normal ml-2">Полный адрес</span>
              </div>
              <button className="px-2 py-3 bg-[#273655] text-white rounded-full text-lg font-medium hover:bg-[#193A7E] transition-colors w-full max-w-[240px] mt-0">
                Выбрать этот склад
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Седьмой фрейм: FAQ */}
      <section className="w-full flex flex-col items-center justify-center mb-80 font-['Montserrat']">
        <h2 className="text-4xl md:text-5xl font-medium text-[#273655] text-center mb-10">Часто задаваемые вопросы:</h2>
        <div className="w-full max-w-[820px] flex flex-col gap-7">
          {/* Вопрос 1 */}
          <div className="flex items-center justify-between bg-white border border-[#3E4958] rounded-3xl px-8 py-5">
            <div className="flex items-center min-w-[100px]">
              <span className="text-4xl text-[#000000] mr-4" style={{fontFamily: 'Space Grotesk', fontWeight: 400, lineHeight: '100%', letterSpacing: 0}}>01</span>
              <span className="text-xl text-[#222] font-normal font-['Space_Grotesk']">Какие вещи нельзя хранить?</span>
            </div>
            <button className="flex items-center justify-center w-11 h-11 border border-[#3E4958] rounded-full text-[#3E4958] text-3xl font-bold transition bg-[#F3F3F3] hover:bg-[#E0E0E0]">
              <span className="mt-[-2px] font-extrabold" style={{color:'#191A23', fontWeight:900}}>+</span>
            </button>
          </div>
          {/* Вопрос 2 */}
          <div className="flex items-center justify-between bg-white border border-[#3E4958] rounded-3xl px-8 py-5">
            <div className="flex items-center min-w-[100px]">
              <span className="text-4xl text-[#000000] mr-4" style={{fontFamily: 'Space Grotesk', fontWeight: 400, lineHeight: '100%', letterSpacing: 0}}>02</span>
              <span className="text-xl text-[#222] font-normal font-['Space_Grotesk']">Где посмотреть тарифы?</span>
            </div>
            <button className="flex items-center justify-center w-11 h-11 border border-[#3E4958] rounded-full text-[#3E4958] text-3xl font-bold transition bg-[#F3F3F3] hover:bg-[#E0E0E0]">
              <span className="mt-[-2px] font-extrabold" style={{color:'#191A23', fontWeight:900}}>+</span>
            </button>
          </div>
          {/* Вопрос 3 */}
          <div className="flex items-center justify-between bg-white border border-[#3E4958] rounded-3xl px-8 py-5">
            <div className="flex items-center min-w-[100px]">
              <span className="text-4xl text-[#000000] mr-4" style={{fontFamily: 'Space Grotesk', fontWeight: 400, lineHeight: '100%', letterSpacing: 0}}>03</span>
              <span className="text-xl text-[#222] font-normal font-['Space_Grotesk']">Как обеспечивается безопасность?</span>
            </div>
            <button className="flex items-center justify-center w-11 h-11 border border-[#3E4958] rounded-full text-[#3E4958] text-3xl font-bold transition bg-[#F3F3F3] hover:bg-[#E0E0E0]">
              <span className="mt-[-2px] font-extrabold" style={{color:'#191A23', fontWeight:900}}>+</span>
            </button>
          </div>
          {/* Вопрос 4 */}
          <div className="flex items-center justify-between bg-white border border-[#3E4958] rounded-3xl px-8 py-5">
            <div className="flex items-center min-w-[100px]">
              <span className="text-4xl text-[#000000] mr-4" style={{fontFamily: 'Space Grotesk', fontWeight: 400, lineHeight: '100%', letterSpacing: 0}}>04</span>
              <span className="text-xl text-[#222] font-normal font-['Space_Grotesk']">Какие условия хранения?</span>
            </div>
            <button className="flex items-center justify-center w-11 h-11 border border-[#3E4958] rounded-full text-[#3E4958] text-3xl font-bold transition bg-[#F3F3F3] hover:bg-[#E0E0E0]">
              <span className="mt-[-2px] font-extrabold" style={{color:'#191A23', fontWeight:900}}>+</span>
            </button>
          </div>
        </div>
      </section>
      <footer className="bg-[#0A142F] w-[1417px] h-[450px] text-white font-['Assistant'] mt-48">
        <div className="container mx-auto px-4">
          <hr className="border-t border-[#FFFFFF] mt-20 mb-10 ml-20 mr-20 opacity-50"/>
          <div className="flex flex-col md:flex-row items-start justify-between py-8">
            <h2 className="text-7xl py-6 ml-20 font-bold font-['Audiowide']">ExtraSpace</h2>
            <div className="flex flex-col md:items-start md:text-left mt-4 md:mt-0">
              <a href="#" className="flex items-center mb-2 mr-40">
                <img src={RoundPlaceIcon} alt="location" className="w-6 h-6 mr-2" />
                <span>345 Faulconer Drive, Suite 4 · Charlottesville, CA, 12345</span>
              </a>
              <a href="tel:(123)456-7890" className="flex items-center mb-4">
                <img src={RoundPhoneIcon} alt="phone" className="w-6 h-6 mr-2" />
                <span>(123) 456-7890</span>
              </a>
              <div className="flex space-x-3 mt-5">
              <span className="uppercase text-xs mb-2">Social Media</span>
                <a href="#"><img src={LinkedInIcon} alt="LinkedIn" className="w-6 h-6" /></a>
                <a href="#"><img src={YouTubeIcon} alt="YouTube" className="w-6 h-6" /></a>
                <a href="#"><img src={InstagramIcon} alt="Instagram" className="w-6 h-6 mt-[3.5px]" /></a>
              </div>
            </div>
          </div>
          <div className="flex justify-between items-center mt-4">
            <nav className="flex space-x-8 uppercase text-xs ml-20">
              <a href="#" className="hover:underline">About Us</a>
              <a href="#" className="hover:underline">Contact Us</a>
              <a href="#" className="hover:underline">Privacy Policy</a>
            </nav>
            <div className="text-xs text-[#A6A6A6] mr-20">Copyright © 2018 · Lift Media Inc.</div>
          </div>
          <hr className="border-t border-[#FFFFFF] my-4 ml-20 mr-20 opacity-50"/>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 