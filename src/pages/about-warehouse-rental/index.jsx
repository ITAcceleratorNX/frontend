import React, { useMemo, useState } from 'react';
import { Header } from '../../widgets';
import Vector038 from '../../assets/Vector_038.svg';
import Image23 from '../../assets/image_23.png';
import topVector from '../../assets/Vector_9.png';
import Vector4 from '../../assets/Vector_4.png';
import WarehouseMap from '../../components/WarehouseMap';
import extraspaceLogo from '../../assets/extraspace_logo.png';
import image3 from '../../assets/image3.png';
import image4 from '../../assets/image4.png';
import image5 from '../../assets/image5.png';
import Footer from '../../widgets/Footer';

export default function AboutWarehouseRentPage() {
  const warehouses = useMemo(() => [
    {
      id: 1,
      name: "ЖК Есентай",
      address: "Касымова улица, 32, Алматы",
      phone: "+7 727 123 4567",
      // workingHours: "Пн-Пт: 09:00-18:00, Сб-Вс: 10:00-16:00",
      workingHours: "Круглосуточно",
      coordinates: [76.930495, 43.225893],
      available: true,
      image: extraspaceLogo
    },
    {
      id: 2,
      name: "ЖК Mega Towers",
      address: "Абиша Кекилбайулы, 270 блок 4, Алматы",
      phone: "+7 727 987 6543",
      // workingHours: "Ежедневно: 08:00-22:00",
      workingHours: "Круглосуточно",
      coordinates: [76.890647, 43.201397],
      available: true,
      image: extraspaceLogo
    },
    {
      id: 3,
      name: "ЖК Комфорт Сити",
      address: "Проспект Серкебаева, 146/3",
      phone: "+7 727 987 6543",
      workingHours: "Круглосуточно",
      coordinates: [76.900575, 43.201302],
      available: true,
      image: extraspaceLogo,
    },
  ], []);

  // Состояние для переключателя
  const [viewMode, setViewMode] = useState('map');

  return (
    <>
      <div className="bg-white font-sans">
        <Header />

        {/* Main Section */}
        <div className="relative w-full min-h-[650px] flex flex-col items-center justify-start">
          <img
              src={Image23}
              alt="background"
              className="absolute inset-0 w-full h-full mt-12 object-cover object-center z-10 hidden md:block"
              style={{ minHeight: '650px', height: '100%', width: '100%' }}
          />
          <img src={topVector} alt="top vector" className="absolute top-[-12px] left-0 w-full h-[180px] z-20" />
          <img src={Vector4} alt="bottom vector" className="absolute bottom-[-12px] left-0 w-full h-[200px] z-20" />

          {/* Header Title Over Image */}
          <div className="relative z-30 w-full flex flex-col items-center pt-10 pb-4">
            <div className="flex flex-col items-center justify-center px-4 text-center">
              <div className="flex items-center justify-between w-full max-w-md mx-auto mb-2">
                <img src={Vector038} alt="icon-left" className="w-8 h-8" />
                <div className="flex flex-col items-center">
                  <h1 className="text-[38px] md:text-[50px] font-bold text-[#273655] font-['Montserrat'] tracking-[0.05em] leading-tight uppercase">
                    об аренде
                  </h1>
                  <h1 className="text-[38px] md:text-[50px] font-bold text-[#273655] font-['Montserrat'] tracking-[0.05em] leading-tight uppercase">
                    склада
                  </h1>
                </div>
                <img src={Vector038} alt="icon-right" className="w-8 h-8" />
              </div>
              <p className="text-[16px] md:text-[18px] text-[#273655] font-['Montserrat'] font-bold">Удобное и безопасное хранение ваших вещей</p>
            </div>
          </div>
        </div>
        {/* Text Block */}
        <section className="relative z-30 w-full flex flex-col items-center mt-[-97px]">
          <div className="w-full px-4 pt-[10px] pb-[50px] bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-[32px] font-bold text-[#273655] mb-3 font-['DM Sans'] text-left">Ищете надежное и удобное решение для хранения?</h2>
              <p className="text-[14px] text-[#273655] font-medium leading-relaxed font-['Montserrat'] text-left">Компания ExtraSpace предлагает аренду современных складских помещений для бизнеса и частных клиентов. Мы предоставляем склады различного формата — от небольших боксов до просторных помещений — с круглосуточным доступом и охраной.</p>
            </div>
          </div>
        </section>

        {/* Warehouse View Switcher */}
        <section className="w-full flex flex-col items-center justify-center py-10 bg-white mt-[-30px]">
          <h2 className="text-[32px] font-bold text-[#273655] mb-5 text-center">Наши склады</h2>
          <div className="flex flex-row items-center justify-center mb-8 gap-2">
            <div className="flex bg-[#E6E6E6] rounded-full p-1">
              <button
                  className={`px-6 py-1 rounded-full text-[16px] font-semibold focus:outline-none transition-colors duration-200 ${viewMode === 'map' ? 'bg-[#A35656] text-white shadow' : 'bg-transparent text-[#383838]'}`}
                  onClick={() => setViewMode('map')}
                  type="button"
              >
                На карте
              </button>
              <button
                  className={`px-6 py-1 rounded-full text-[16px] font-semibold focus:outline-none transition-colors duration-200 ${viewMode === 'list' ? 'bg-[#A35656] text-white shadow' : 'bg-transparent text-[#383838]'}`}
                  onClick={() => setViewMode('list')}
                  type="button"
              >
                Списком
              </button>
            </div>
          </div>

          <div className="w-full flex justify-center">
            {viewMode === 'map' && (
                <div className="border border-[#8C5B55] rounded-lg overflow-hidden" style={{ width: 700, height: 400 }}>
                  <WarehouseMap warehouses={warehouses} />
                </div>
            )}

            {viewMode === 'list' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-7xl px-8">
                  {[{
                    img: image3,
                    size: '3 м³ — идеально для коробок, сезонных вещей.',
                    area: 9,
                    volume: '5,10',
                    load: '1 800',
                    desc: 'Этот модуль идеально подойдёт для хранения коробок, сезонной одежды, мелкой мебели и бытовых вещей. Благодаря компактным размерам и хорошей вместимости он станет отличным решением для тех, кто хочет освободить место дома или в офисе, не расставаясь с нужными вещами.'
                  }, {
                    img: image4,
                    size: '5 м³ — помещается мебель, велосипеды, техника',
                    area: 25,
                    volume: '50',
                    load: '7000–8000',
                    desc: 'Этот модуль идеально подходит для хранения: крупной мебели (диваны, шкафы, кровати и пр.), бытовой техники. Высокие стены позволяют размещать вещи в несколько ярусов. Может использоваться как мини-склад.'
                  }, {
                    img: image5,
                    size: '10 м³ — подойдёт при переезде или хранении офисного оборудования.',
                    area: 100,
                    volume: '200',
                    load: '15 000–18 000',
                    desc: 'Модуль размером 10×10 метров — полноценное складское помещение, идеально подходящее для хранения большого количества мебели, техники, стройматериалов или коммерческих грузов.'
                  }].map((item, index) => (
                      <div key={index} className="flex flex-col bg-white rounded-3xl shadow-lg p-4">
                        <img src={item.img} alt="storage" className="w-full h-52 object-contain mb-3 rounded-xl" />
                        <div className="text-[14px] font-medium text-[#222] mb-3">{item.size}</div>
                        <div className="flex flex-col gap-1 text-[15px] text-[#333] font-medium mb-3">
                          <div>Площадь: <span className="text-[#C73636] font-bold">{item.area}</span> м³</div>
                          <div>Объем: <span className="font-bold">{item.volume}</span> м³</div>
                          <div>Загрузка: <span className="font-bold">{item.load}</span> кг</div>
                        </div>
                        <p className="text-[14px] text-[#000000] mb-5 leading-relaxed font-['Montserrat']">{item.desc}</p>
                        <button className="py-2 bg-[#A35656] text-white text-[14px] font-semibold rounded-xl hover:bg-[#933333] transition-colors">Оставить заявку</button>
                      </div>
                  ))}
                </div>
            )}
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
} 