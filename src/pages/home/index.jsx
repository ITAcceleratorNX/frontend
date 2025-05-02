import React from 'react';
import { Header } from '../../widgets';
import vectorImg from '../../assets/vector.png';
import backgroundTextImg from '../../assets/background-text.png';
import boxesImg from '../../assets/boxes.png';
import good2 from '../../assets/good2.png';
import procent2 from '../../assets/procent2.png';
import key2 from '../../assets/key2.png';
import chatgptImg from '../../assets/chatgpt.png';

const HomePage = () => {
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
          <div className="w-full max-w-[1220px] pl-11 mb-6">
            <span className="text-xs text-[#7A7A7A] font-medium">Почему Extra Space?</span>
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
            <div className="text-xs text-[#7A7A7A] font-medium mb-6">Наши склады</div>
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
    </div>
  );
};

export default HomePage; 