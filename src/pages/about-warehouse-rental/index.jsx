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
      name: "EXTRA SPACE Главный склад",
      address: "Касымова улица, 32, Алматы",
      phone: "+7 727 123 4567",
      workingHours: "Пн-Пт: 09:00-18:00, Сб-Вс: 10:00-16:00",
      coordinates: [76.930495, 43.225893],
      available: true,
      image: extraspaceLogo
    },
    {
      id: 2,
      name: "EXTRA SPACE Мега",
      address: "Абиша Кекилбайулы, 270 блок 4, Алматы",
      phone: "+7 727 987 6543",
      workingHours: "Ежедневно: 08:00-22:00",
      coordinates: [76.890647, 43.201397],
      available: true,
      image: extraspaceLogo
    }
  ], []);

  // Состояние для переключателя
  const [viewMode, setViewMode] = useState('map');

  return (
    <>
      <div className="bg-white font-sans">
        <Header />

        {/* Main Section */}
        <div className="relative w-full min-h-[650px] flex flex-col items-center justify-center">
          {/* Фоновое изображение */}
          <img 
            src={Image23} 
            alt="background" 
            className="absolute inset-0 w-full h-full mt-12 object-cover object-center z-10" 
            style={{
              minHeight: '650px',
              height: '100%',
              width: '100%'
            }} 
          />
          {/* Верхний белый вектор */}
          <img src={topVector} alt="top vector" className="absolute top-[-12px] left-0 w-full h-[180px] z-20" />
          {/* Нижний белый вектор */}
          <img src={Vector4} alt="bottom vector" className="absolute bottom-[-12px] left-0 w-full h-[200px] z-20" />
          {/* Контент */}
          <div className="relative z-30 w-full flex flex-col items-center pt-[30px] pb-[30px]">
            <div className="flex flex-col items-center justify-center mb-80 mt-[-230px]">
              <div className="flex items-center justify-center">
                <img src={Vector038} alt="icon" className="w-10 h-10 mt-8 mr-2" />
                <h1 className="text-[40px] md:text-[55px] mt-8 font-bold text-[#273655] font-['Montserrat'] tracking-[0.05em]">ОБ АРЕНДЕ СКЛАДА</h1>
                <img src={Vector038} alt="icon" className="w-10 h-10 mt-8 ml-2" />
              </div>
              <p className="text-[26px] text-[#273655] font-['Montserrat'] font-bold mt-[-12px]">Удобное и безопасное хранение ваших вещей</p>
            </div>
          </div>
        </div>

        {/* Текстовый блок */}
        <section className="relative z-30 w-full flex flex-col items-center mt-[-97px]">
          <div className="w-full px-4 pt-[10px] pb-[50px] bg-white">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-[45px] font-bold text-[#273655] mb-4 font-['DM Sans'] text-left">Ищете надежное и удобное решение для хранения?</h2>
              <p className="text-[16px] text-[#273655] font-medium leading-relaxed font-['Montserrat'] text-left">Компания ExtraSpace предлагает аренду современных складских помещений для бизнеса и частных клиентов. Мы предоставляем склады различного формата — от небольших боксов до просторных помещений — с круглосуточным доступом и охраной.</p>
            </div>
          </div>
        </section>

        {/* Секция: Наши склады */}
        <section className="w-full flex flex-col items-center justify-center py-12 bg-white mt-[-30px]">
          <h2 className="text-[44px] font-bold text-[#273655] mb-6 text-center">Наши склады</h2>
          <div className="flex flex-row items-center justify-center mb-8 gap-2">
            <div className="flex bg-[#E6E6E6] rounded-full p-1">
              <button
                className={`px-10 py-2 rounded-full text-[22px] font-semibold focus:outline-none transition-colors duration-200 ${viewMode === 'map' ? 'bg-[#A35656] text-white shadow' : 'bg-transparent text-[#383838]'}`}
                onClick={() => setViewMode('map')}
                type="button"
              >
                На карте
              </button>
              <button
                className={`px-10 py-2 rounded-full text-[22px] font-semibold focus:outline-none transition-colors duration-200 ${viewMode === 'list' ? 'bg-[#A35656] text-white shadow' : 'bg-transparent text-[#383838]'}`}
                onClick={() => setViewMode('list')}
                type="button"
              >
                Списком
              </button>
            </div>
          </div>
          <div className="w-full flex justify-center">
            {viewMode === 'map' && (
              <div className="border border-[#8C5B55] rounded-lg overflow-hidden" style={{width: 700, height: 400}}>
                <WarehouseMap warehouses={warehouses} />
              </div>
            )}
            {viewMode === 'list' && (
              <div className="flex flex-col items-center justify-center w-[1100px] min-h-[400px]">
                <div className="w-full flex flex-col items-center">
                  <div className="bg-[#A35656] text-white px-16 py-1 text-[20px] font-semibold focus:outline-none">
                    Алматы
                  </div>
                  <div className="w-full mt-6 space-y-4">
                    {warehouses.map((warehouse) => (
                      <div key={warehouse.id} className="w-full bg-white border border-gray-200 rounded-lg shadow-md p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-[22px] font-bold text-[#273655] mb-2">{warehouse.name}</h3>
                            <div className="space-y-2 text-[16px] text-gray-700">
                              <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#A35656]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                </svg>
                                <span>{warehouse.address}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#A35656]" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                <span>{warehouse.phone}</span>
                              </div>
                              <div className="flex items-center">
                                <svg className="w-5 h-5 mr-2 text-[#A35656]" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                </svg>
                                <span>{warehouse.workingHours}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${warehouse.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {warehouse.available ? 'Доступен' : 'Занят'}
                            </div>
                            <button className="bg-[#A35656] text-white px-6 py-2 rounded-lg hover:bg-[#8a4848] transition-colors">
                              Выбрать
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Секция: Выберите складское помещение 1 */}
        <section className="w-full flex flex-col items-center justify-center py-12 bg-white">
          <h2 className="text-[64px] font-bold font-['DM Sans'] text-[#273655] mb-16 text-center">Выберите складское помещение</h2>
          <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-1 px-4 max-w-7xl mx-auto">
            {/* Левая часть — отдельная большая карточка с тенью */}
            <div className="flex flex-col items-center justify-center bg-white rounded-3xl shadow-md w-[280px] md:w-[280px] min-h-[400px] max-w-[380px] ml-16 p-4 mr-0 md:mr-12"
              style={{ boxShadow: '2px 3px 0px 0px rgba(0,0,0,0.1), -2px 3px 0px 0px rgba(0,0,0,0.1), 0px 4px 1px 0px rgba(0,0,0,0.3)', border: 'none' }}>
              <img src={image3} alt="storage size" className="w-[380px] h-[310px] object-contain mb-0 mt-[-16px]" />
              <div className="text-[16px] text-[#222] text-left font-small mb-[-12px]">3 м³ — идеально для коробок, сезонных вещей.</div>
            </div>
            {/* Правая часть — параметры и описание */}
            <div className="flex flex-col justify-between font-['Montserrat'] flex-1 p-6 max-w-3xl mt-[-22px]">
              <div className="flex flex-row flex-wrap gap-x-16 gap-y-2 mb-2 text-[20px] font-medium">
                <span>Площадь: <span className="text-[#C73636] font-bold">9</span>м³</span>
                <span>Объем: <span className="font-bold">5,10</span>м³</span>
                <span>Загрузка: <span className="font-bold">1 800</span>кг</span>
              </div>
              <div className="text-[19px] text-[#000000] mb-8 mt-[-22px] leading-snug">
                Этот модуль идеально подойдёт для хранения коробок, сезонной одежды, мелкой мебели и бытовых вещей. Благодаря компактным размерам и хорошей вместимости он станет отличным решением для тех, кто хочет освободить место дома или в офисе, не расставаясь с нужными вещами.
              </div>
              <button className="w-[340px] py-5 bg-[#A35656] text-white text-[20px] font-['Montserrat'] font-semibold rounded-2xl transition-colors hover:bg-[#A35656] ml-0 mt-[-10px]">Оставить заявку</button>
            </div>
          </div>
        </section>

         {/* Секция: Выберите складское помещение 2 */}
         <section className="w-full flex flex-col items-center justify-center py-12 bg-white mt-5">
          <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-1 px-4 max-w-7xl mx-auto">
            {/* Левая часть — отдельная большая карточка с тенью */}
            <div className="flex flex-col items-center justify-center bg-white rounded-3xl shadow-md w-[280px] md:w-[280px] min-h-[400px] max-w-[380px] ml-16 p-4 mr-0 md:mr-12"
              style={{ boxShadow: '2px 3px 0px 0px rgba(0,0,0,0.1), -2px 3px 0px 0px rgba(0,0,0,0.1), 0px 4px 1px 0px rgba(0,0,0,0.3)', border: 'none' }}>
              <img src={image4} alt="storage size" className="w-[380px] h-[310px] object-contain mb-0 mt-[-16px]" />
              <div className="text-[16px] text-[#222] text-left font-small mb-[-12px]">5 м³ — помещается мебель, велосипеды, техника</div>
            </div>
            {/* Правая часть — параметры и описание */}
            <div className="flex flex-col justify-between font-['Montserrat'] flex-1 p-6 max-w-3xl mt-[-22px]">
              <div className="flex flex-row flex-wrap gap-x-16 gap-y-2 mb-2 text-[20px] font-medium">
                <span>Площадь: <span className="text-[#C73636] font-bold">25</span>м³</span>
                <span>Объем: <span className="font-bold">50</span>м³</span>
                <span>Загрузка: <span className="font-bold">7000–8000</span>кг</span>
              </div>
              <div className="text-[19px] text-[#000000] mb-8 mt-[-22px] leading-snug">
                Этот модуль идеально подходит для хранения:
                <ul className="list-disc pl-6 mt-2 space-y-1">
                  <li>крупной мебели (диваны, шкафы, кровати и пр.),</li>
                  <li>бытовой техники,</li>
                </ul>
                Высокие стены позволяют размещать вещи в несколько ярусов, что делает модуль особенно удобным при переезде, ремонте или длительном хранении имущества.
                <p className="mt-2">Может использоваться как мини-склад.</p>
              </div>
              <button className="w-[340px] py-5 bg-[#A35656] text-white text-[20px] font-['Montserrat'] font-semibold rounded-2xl transition-colors hover:bg-[#A35656] ml-0 mt-[-10px]">Оставить заявку</button>
            </div>
          </div>
        </section>

        {/* Секция: Выберите складское помещение 3 */}
        <section className="w-full flex flex-col items-center justify-center py-12 bg-white mt-5">
          <div className="w-full flex flex-col md:flex-row items-stretch justify-center gap-1 px-4 max-w-7xl mx-auto">
            {/* Левая часть — отдельная большая карточка с тенью */}
            <div className="flex flex-col items-center justify-center bg-white rounded-3xl shadow-md w-[280px] md:w-[280px] min-h-[400px] max-w-[380px] ml-16 p-4 mr-0 md:mr-12"
              style={{ boxShadow: '2px 3px 0px 0px rgba(0,0,0,0.1), -2px 3px 0px 0px rgba(0,0,0,0.1), 0px 4px 1px 0px rgba(0,0,0,0.3)', border: 'none' }}>
              <img src={image5} alt="storage size" className="w-[380px] h-[310px] object-contain mb-0 mt-[-16px]" />
              <div className="text-[16px] text-[#222] text-left font-small mb-[-12px]">10 м³ — подойдёт при переезде или хранении офисного оборудования.</div>
            </div>
            {/* Правая часть — параметры и описание */}
            <div className="flex flex-col justify-between font-['Montserrat'] flex-1 p-6 max-w-3xl mt-[-22px]">
              <div className="flex flex-row flex-wrap gap-x-16 gap-y-2 mb-2 text-[20px] font-medium">
                <span>Площадь: <span className="text-[#C73636] font-bold">100</span>м³</span>
                <span>Объем: <span className="font-bold">200</span>м³</span>
                <span>Загрузка: <span className="font-bold">15 000–18 000</span>кг</span>
              </div>
              <div className="text-[19px] text-[#000000] mb-8 mt-[-22px] leading-snug">
              Модуль размером 10×10 метров — это полноценное складское помещение, идеально подходящее для решения самых масштабных задач. Он предоставляет огромное пространство, которого хватит для хранения большого количества мебели, техники, стройматериалов или коммерческих грузов.
              </div>
              <button className="w-[340px] py-5 bg-[#A35656] text-white text-[20px] font-['Montserrat'] font-semibold rounded-2xl transition-colors hover:bg-[#A35656] ml-0 mt-[-10px]">Оставить заявку</button>
            </div>
          </div>
        </section>
      </div>
      
      <Footer />
    </>
  );
} 