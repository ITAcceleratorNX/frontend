import React, { useState } from 'react';
import { Header } from '../../widgets';
import vectorLeaves from '../../assets/Vector_038 (Illustrator Vectors) svg-01 2.png';
import mainImg from '../../assets/image 17.png';
import topOverlay from '../../assets/Vector 3.png';
import bottomOverlay from '../../assets/Vector 2.png';
import autoLayout from '../../assets/Auto Layout Horizontal.png';
import image21 from '../../assets/image 21.png';
import kazakhstanMap from '../../assets/Kazakhstan.png';
import frameCheck from '../../assets/Frame.svg';
import LinkedInIcon from '../../assets/linkedin black.1.svg';
import InstagramIcon from '../../assets/instagram black.1.svg';
import YouTubeIcon from '../../assets/youtube color.1.svg';
import RoundPlaceIcon from '../../assets/round-place-24px.svg';
import RoundPhoneIcon from '../../assets/round-phone-24px.svg';
import Footer from '../../widgets/Footer';
import housePlanIcon from '../../assets/house-plan_5203481 1.svg';
import arrowDownIcon from '../../assets/arrow-down.svg';
import warehouseImg from '../../assets/image_84.png';
import api from '../../shared/api/axios';

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

const MovingCostCalculator = () => {
  const [area, setArea] = React.useState(50);
  const [month, setMonth] = React.useState(1);
  const [day, setDay] = React.useState(0);
  const [type, setType] = React.useState('INDIVIDUAL');
  const [prices, setPrices] = React.useState([]);
  const [totalCost, setTotalCost] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/prices');
        setPrices(response.data);
      } catch (error) {
        setError('Не удалось загрузить цены. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPrices();
  }, []);

  const calculateCost = () => {
    const selectedPrice = prices.find(price => price.type === type);
    if (!selectedPrice) {
      setError('Цена для выбранного типа услуги не найдена');
      return;
    }
    const amount = parseFloat(selectedPrice.amount);
    const monthlyCost = amount * area * month;
    const dailyCost = (amount * area / 30) * day;
    const total = monthlyCost + dailyCost;
    setTotalCost(Math.round(total));
    setError(null);
  };

  const handleServiceTypeClick = (serviceType) => {
    setType(serviceType);
    setTotalCost(null);
  };

  return (
    <section className="w-full flex justify-center items-center mb-24 font-['Montserrat'] mt-40">
      <div className="w-full max-w-[1100px] mx-auto flex flex-row items-start gap-[60px] bg-transparent px-4">
        {/* Левая колонка: калькулятор */}
        <div className="flex flex-col flex-[0_0_440px] items-start font-['Montserrat']">
          <label className="text-[22px] text-[#9C9C9C] font-bold mb-4 font-['Montserrat']" htmlFor="area">Площадь выбранного склада:</label>
          <div className="w-full flex flex-col mb-8">
            <div className="relative w-full h-[56px] flex items-center bg-white" style={{borderRadius:'8px 8px 8px 0', boxShadow:'4px 4px 8px 0 #B0B0B0'}}>
              <span className="absolute left-4 flex items-center h-full">
                <img src={housePlanIcon} alt="house plan" className="w-6 h-6" />
              </span>
              <span className="ml-12 text-[#C7C7C7] text-[18px] font-['Montserrat']">— {area} кв.м</span>
            </div>
            <div className="w-full relative" style={{marginTop:'-22px'}}>
              <div className="absolute left-0 bottom-0 h-[2px] bg-[#0062D3] rounded-full" style={{width: `${area}%`, zIndex:1}}></div>
              <div className="absolute right-0 bottom-0 h-[2px] bg-transparent" style={{left: `${area}%`, zIndex:1}}></div>
              <input 
                id="area" 
                type="range" 
                min="1" 
                max="100" 
                value={area} 
                onChange={e => {
                  setArea(Number(e.target.value));
                  setTotalCost(null);
                }} 
                className="w-full h-[2px] bg-transparent appearance-none relative z-10" 
                style={{WebkitAppearance:'none'}} 
              />
            </div>
          </div>
          <label className="text-[22px] text-[#9C9C9C] font-bold mb-4 font-['Montserrat']">Тип вашего склада:</label>
          <div className="flex flex-row gap-4 w-full mb-4">
            <button 
              onClick={() => handleServiceTypeClick('INDIVIDUAL')}
              className={`h-[56px] rounded-lg text-[16px] font-bold w-1/2 font-['Montserrat'] transition-colors ${type === 'INDIVIDUAL' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'}`}
              style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}
            >
              Обычное хранение
            </button>
            <button 
              onClick={() => handleServiceTypeClick('CLOUD')}
              className={`h-[56px] rounded-lg text-[16px] font-bold w-1/2 font-['Montserrat'] transition-colors ${type === 'CLOUD' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'}`}
              style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}
            >
              Облачное хранение
            </button>
          </div>
          <div className="flex flex-row gap-4 w-full mb-8">
          <button 
            onClick={() => handleServiceTypeClick('RACK')}
            className={`h-[56px] rounded-lg text-[16px] font-bold w-1/2 font-['Montserrat'] transition-colors ${type === 'RACK' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'}`}
            style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}
          >
            Мувинг
          </button>
          </div>
          {/* Блок с результатом расчета */}
          {totalCost !== null && (
            <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="text-[20px] font-bold text-[#273655] text-center">
                Итого: {totalCost.toLocaleString()} ₸
              </div>
            </div>
          )}
          {/* Блок с ошибкой */}
          {error && (
            <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="text-[16px] text-red-600 text-center">
                {error}
              </div>
            </div>
          )}
          <button 
            onClick={calculateCost}
            disabled={isLoading || prices.length === 0}
            className="w-full h-[56px] bg-[#32BA16] text-white text-[18px] font-bold rounded-lg hover:bg-[#28a012] transition-colors mt-4 font-['Montserrat'] disabled:opacity-50 disabled:cursor-not-allowed" 
            style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}
          >
            {isLoading ? 'ЗАГРУЗКА...' : 'РАССЧИТАТЬ'}
          </button>
        </div>
        {/* Правая колонка: заголовок и картинка */}
        <div className="flex flex-col items-start flex-1 pl-20">
          <h2 className="text-[28px] md:text-[50px] font-bold text-[#273655] mb-4 ml-20 mt-4 text-left tracking-tight leading-tight">
            КАЛЬКУЛЯТОР<br />
            <span style={{marginLeft: '40px', display: 'inline-block'}}>СТОИМОСТИ</span>
          </h2>
          <img src={warehouseImg} alt="Склад warehouse" className="w-full ml-20 max-w-[400px] object-contain" style={{transform:'scaleX(-1)'}} />
        </div>
      </div>
    </section>
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
      <MovingCostCalculator />
      <StepperForm />

      {/* Третий фрейм: О компании */}
      <section className="w-full flex flex-col md:flex-row items-center justify-between mt-8 mb-20 max-w-[1200px] mx-auto">
        <div className="flex-1 flex flex-col items-start justify-center md:pr-12">
          <h2 className="text-[#F86812] text-[36px] md:text-[38px] font-bold font-['DM Sans'] leading-tight ml-[1px] mb-4">
            Lorem Ipsum is simply<br />dummy
          </h2>
          <div className="bg-white rounded-xl shadow-none p-0 mb-2">
            <h3 className="text-[#273655] text-lg font-medium font-['DM Sans'] ml-[1px] mb-2">Lorem Ipsum is simply dummy</h3>
            <p className="text-[#273655] text-sm font-normal font-['DM Sans'] ml-[1px] mb-4 max-w-[350px]">
              Welcome to Burger Bliss, where we take your cravings to a whole new level! Our mouthwatering burgers are made from 100% beef and are served on freshly baked buns.
            </p>
            <button className="border border-[#D9D9D9] text-[#273655] px-5 py-1 rounded-full text-sm ml-[1px] font-['DM Sans'] hover:bg-[#f5f5f5] transition-colors">
              Do something
            </button>
          </div>
        </div>
        <div className="flex-1 flex justify-end items-center mr-[70px] mt-8 md:mt-0">
          <img src={image21} alt="Warehouse" className="rounded-2xl w-full max-w-[420px] h-[320px] mt-10 object-cover shadow-md" />
        </div>
      </section>
      {/* Четвертый фрейм: Описание и карта */}
      <section className="w-full flex flex-col items-left justify-center mt-10 mb-24">
        <h2 className="text-[#273655] text-[32px] md:text-[36px] font-bold font-['DM Sans'] text-left ml-[105px] mb-6">
          Lorem Ipsum is simply dummy
        </h2>
        <div className="flex flex-col md:flex-row justify-center items-start gap-12 ml-[106px] mb-10 max-w-[900px] w-full">
          <p className="text-[#273655] text-base font-normal font-['DM Sans'] max-w-[450px]">
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters
          </p>
          <p className="text-[#273655] text-base font-normal font-['DM Sans'] max-w-[450px]">
            It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters
          </p>
        </div>
        <div className="w-full flex justify-center">
          <img src={kazakhstanMap} alt="Kazakhstan map" className="w-full max-w-[800px] object-contain" />
        </div>
      </section>
      {/* Пятый фрейм: Сравнение тарифов */}
      <section className="w-full flex flex-col items-center justify-center mt-[150px] mb-20 font-['Inter']">
        <div className="w-full mb-20 max-w-[1100px] bg-white border border-[#E6E9F5] overflow-x-auto shadow-sm">
          <table className="w-full text-[#222] text-[15px] font-normal border-collapse">
            <thead>
              <tr className="border-b border-[#E6E9F5]">
                <th className="text-left align-bottom font-['Roboto'] p-6 py-10 w-[220px] font-bold text-[18px]">
                  Compare plans <span className="ml-2 text-xs font-medium bg-white text-[#222] px-4 py-2 rounded-full border border-[#858BA0]">40% Off</span>
                  <div className="text-xs font-normal font-['Inter'] text-[#888] mt-2">Choose your workspace plan according to your organisational plan</div>
                </th>
                <th className="text-center align-bottom p-6 w-[220px] border-l border-[#E6E9F5]">
                  <div className="flex flex-col items-center">
                    <span className="text-[32px] font-bold">$15 <span className="text-xs text-[#858BA0] align-middle">/помощь в складе</span></span>
                    <button className="bg-[#F86812] text-white rounded font-semibold px-6 py-2 text-[16px] w-full mt-3">Choose This Plan</button>
                  </div>
                </th>
                <th className="text-center align-bottom p-6 w-[220px] border-l border-[#E6E9F5]">
                  <div className="flex flex-col items-center">
                    <span className="text-[32px] font-bold">$20 <span className="text-xs text-[#858BA0] align-middle">/доставка</span></span>
                    <button className="bg-[#F86812] text-white rounded font-semibold px-6 py-2 text-[16px] w-full mt-3">Choose This Plan</button>
                  </div>
                </th>
                <th className="text-center align-bottom p-6 w-[220px] border-l border-[#E6E9F5]">
                  <div className="flex flex-col items-center">
                    <span className="text-[32px] font-bold">$30 <span className="text-xs text-[#858BA0] align-middle">/упаковка+доставка</span></span>
                    <button className="bg-[#F86812] text-white rounded font-semibold px-6 py-2 text-[16px] w-full mt-3">Choose This Plan</button>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#E6E9F5]">
                <td className="p-4 text-[#222]">Number of Users</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">20 Pages</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">600 Pages<br /><span className="text-xs text-[#858BA0]">Pages Add-ons on Demand</span></td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">Unlimited<br /><span className="text-xs text-[#858BA0]">Pages Add-ons on Demand</span></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Users Per Page</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">5 Pages</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">50 Pages</td>
                <td className="p-4 text-center text-[#252430] border-l border-[#E6E9F5]">Unlimited<br /><span className="text-xs text-[#858BA0]">Pages Add-ons on Demand</span></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Includes essential features to get started</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">More advanced features for increased productivity</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Designing & Development</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Customizable options to meet your specific needs</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Secure data storage</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Email Support</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">24/7 customer support</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr className="border-b border-[#F2F2F2]">
                <td className="p-4 text-[#222]">Analytics and reporting</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
              <tr>
                <td className="p-4 text-[#222]">Account Management</td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
                <td className="p-4 text-center border-l border-[#E6E9F5]"><img src={frameCheck} alt="check" className="inline w-5 h-5" /></td>
              </tr>
            </tbody>
          </table>
        </div>
        <button className="mt-20 bg-[#F86812] text-white rounded-full px-20 py-1 text-[20px] font-medium font-['Montserrat'] hover:bg-[#d87d1c] transition-colors">заказать доставку</button>
      </section>
      
      <Footer />
    </div>
  );
};

export default MovingPage; 