import React, { useState } from 'react';
import { Header } from '../../widgets';
import vectorLeaves from '../../assets/Vector_038 (Illustrator Vectors) svg-01 2.png';
import mainImg from '../../assets/image 17.png';
import topOverlay from '../../assets/Vector 3.png';
import bottomOverlay from '../../assets/Vector 2.png';
import autoLayout from '../../assets/Auto Layout Horizontal.png';
import housePlanIcon from '../../assets/house-plan_5203481 1.svg';
import Footer from '../../widgets/Footer';
import warehouseImg from '../../assets/warehouse.png';
import api from '../../shared/api/axios'; 

import CostCalculator from '../../shared/components/CostCalculator';

const ProgressCircle = ({ step }) => {
  const total = 5;
  const radius = 130;
  const stroke = 38;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const progress = step / total;
  const offset = circumference * (1 - progress);
  return (
    <svg width={260} height={260} className="block mx-auto">
      <circle
        cx={130}
        cy={130}
        r={normalizedRadius}
        fill="none"
        stroke="transparent"
        strokeWidth={stroke}
      />
      <circle
        cx={130}
        cy={130}
        r={normalizedRadius}
        fill="none"
        stroke="#273655"
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="butt"
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="30"
        fill="#273655"
        fontFamily="'Audiowide'"
      >
        ExtraSpace
      </text>
    </svg>
  );
};

const StepperForm = () => {
  const [step, setStep] = useState(0);
  const [city, setCity] = useState('');
  const [warehouse, setWarehouse] = useState('');
  const [type, setType] = useState('');
  const [area, setArea] = useState(50);
  const [date, setDate] = useState('');

  const cities = ['Алматы', 'Астана', 'Шымкент', 'Караганда', 'Актобе'];
  const warehouses = [
    'Есентай, жк Касымова улица, 32',
    'Улица А. Кекильбайулы, 270 блок 4',
  ];
  const types = [
    { value: 'usual', label: 'Обычное хранение' },
    { value: 'cloud', label: 'Облачное хранение' },
  ];

  return (
    <div className="flex flex-row items-start justify-between mt-16 mb-24 gap-32 w-[1000px] max-w-[900px] mx-auto">
      <div className="bg-white rounded-xl shadow p-8 min-w-[500px] max-w-[420px] w-full border border-[#E6E9F5]">
        {step === 0 && (
          <form onSubmit={e => { e.preventDefault(); if (city) setStep(1); }}>
            <div className="mb-8">
              <label className="block text-xl font-medium font-['Montserrat'] mb-4">Выберите город:</label>
              <select
                className="w-full border border-[#E6E9F5] rounded px-4 py-2 text-lg focus:outline-none"
                value={city}
                onChange={e => setCity(e.target.value)}
                required
              >
                <option value="" disabled>Выберите...</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <button type="submit" className="w-full bg-[#273655] text-white rounded py-2 font-bold text-lg mt-2 disabled:opacity-50" disabled={!city}>Продолжить</button>
          </form>
        )}
        {step === 1 && (
          <form onSubmit={e => { e.preventDefault(); if (warehouse) setStep(2); }}>
            <div className="mb-8">
              <label className="block text-xl font-medium mb-4">Выберите склад:</label>
              {warehouses.map((w, i) => (
                <div key={w} className="mb-2 flex items-center">
                  <input
                    type="radio"
                    id={`warehouse${i}`}
                    name="warehouse"
                    value={w}
                    checked={warehouse === w}
                    onChange={() => setWarehouse(w)}
                    className="mr-2"
                  />
                  <label htmlFor={`warehouse${i}`}>{w}</label>
                </div>
              ))}
            </div>
            <button type="submit" className="w-full bg-[#273655] text-white rounded py-2 font-bold text-lg mt-2 disabled:opacity-50" disabled={!warehouse}>Продолжить</button>
          </form>
        )}
        {step === 2 && (
          <form onSubmit={e => { e.preventDefault(); if (type) setStep(3); }}>
            <div className="mb-8">
              <label className="block text-xl font-medium font-['Montserrat'] mb-4">Выберите тип вашего склад:</label>
              <div className="flex gap-4">
                {types.map((t, i) => (
                  <button
                    type="button"
                    key={t.value}
                    className={`h-[56px] rounded-lg text-[16px] w-1/2 font-bold font-['Montserrat'] transition-colors ${
                      t.label === 'Облачное хранение'
                        ? 'bg-white text-[#273655]'
                        : type === t.value
                        ? 'bg-[#273655] text-white'
                        : 'bg-[#273655] text-white'
                    }`}
                    style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}
                    onClick={() => setType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" className="w-full bg-[#273655] text-white rounded py-2 font-bold text-lg mt-2 disabled:opacity-50" disabled={!type}>Продолжить</button>
          </form>
        )}
        {step === 3 && (
          <form onSubmit={e => { e.preventDefault(); setStep(4); }}>
            <div className="mb-8">
              <label className="block text-xl font-medium mb-4">Выберите площадь:</label>
              <div className="flex items-center gap-2 mb-2">
                <img src={housePlanIcon} alt="icon" className="w-6 h-6" />
                <span className="text-[#C7C7C7] text-lg">— {area} кв.м</span>
              </div>
              <input
                type="range"
                min={1}
                max={100}
                value={area}
                onChange={e => setArea(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <button type="submit" className="w-full bg-[#273655] text-white rounded py-2 font-bold text-lg mt-2">Продолжить</button>
          </form>
        )}
        {step === 4 && (
          <form onSubmit={e => { e.preventDefault(); if (date) setStep(5); }}>
            <div className="mb-8">
              <label className="block text-xl font-medium mb-4">Выберите дату:</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full border border-[#E6E9F5] rounded px-4 py-2 text-lg focus:outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-[#273655] text-white rounded py-2 font-bold text-lg mt-2 disabled:opacity-50" disabled={!date}>Закончить</button>
          </form>
        )}
        {step === 5 && (
          <div className="text-center py-12">
            <div className="text-2xl font-bold mb-4">Спасибо! Все шаги пройдены.</div>
            <div className="text-base text-[#273655]">Ваши данные отправлены.</div>
          </div>
        )}
      </div>
      <div className="flex flex-col items-center justify-center min-w-[200px]">
        <ProgressCircle step={step} />
      </div>
    </div>
  );
};

const MovingPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      {/* Первый фрейм: Заказать доставку */}
      <section className="relative w-full h-[500px] mt-5 flex items-center justify-center">
        <img src={mainImg} alt="Delivery Truck" className="absolute inset-0 w-full h-[414px] top-20 object-cover z-10" />
        <img src={topOverlay} alt="top shape" className="absolute top-0 bottom-0 left-0 w-full h-[205px] z-20" />
        <img src={bottomOverlay} alt="bottom shape" className="absolute bottom-0 left-0 w-full h-[140px] z-20" />
        <div className="absolute z-30 top-[50px] flex flex-col items-center space-y-4">
          <div className="flex items-center">
            <img src={vectorLeaves} alt="deco" className="w-10 h-10 mr-1" />
            <h1 className="text-[40px] md:text-[55px] font-bold text-[#F86812] font-['Montserrat']">
              ЗАКАЗАТЬ ДОСТАВКУ
            </h1>
            <img src={vectorLeaves} alt="deco" className="w-10 h-10 ml-1" />
          </div>
          <button className="bg-[#F86812] text-white px-20 py-1 rounded-full text-lg font-medium hover:bg-[#d87d1c] transition-colors font-['Montserrat']">
            заказать доставку
          </button>
        </div>
      </section>
      {/* Второй фрейм: Гарантия */}
      <section className="w-full flex flex-col items-center justify-center -mt-[165px] pt-[150px] font-['DM Sans']">
        <h2 className="text-[42px] md:text-[44px] font-bold text-[#273655] text-center mb-4">
          Гарантия сохранности ваших вещей
        </h2>
        <p className="text-[#273655] text-left max-w-[720px] ml-[-58px] mb-8 text-[18px] leading-snug">
          В любой точке Алматы наши специалисты приедут, упакуют, погрузят и доставят ваши вещи на склад хранения. Вам не нужно беспокоиться о разборке мебели — мы предоставляем полный комплекс услуг по мувингу и хранению вещей. Ваши вещи под надежной защитой.
        </p>
        <div className="w-full flex justify-center">
          <img src={autoLayout} alt="Features" className="w-full max-w-[770px] object-contain" />
        </div>
      </section>

      {/* Калькулятор стоимости — локально для мувинга */}
      <CostCalculator />
      <StepperForm />
      
      <Footer />
    </div>
  );
};

export default MovingPage; 