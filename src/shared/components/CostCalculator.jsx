import React, { useState, useEffect } from 'react';
import housePlanIcon from '../../assets/house-plan_5203481 1.svg';
import warehouseImg from '../../assets/warehouse.png';
import api from '../../shared/api/axios';

const CostCalculator = () => {
  const [area, setArea] = useState(50);
  const [month, setMonth] = useState(1);
  const [type, setType] = useState('INDIVIDUAL');
  const [prices, setPrices] = useState([]);
  const [totalCost, setTotalCost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
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
    const price = parseFloat(selectedPrice.price);
    const total = price * area * month;
    setTotalCost(Math.round(total));
    setError(null);
    
    if (import.meta.env.DEV) {
      console.log('Расчет стоимости:', {
        area,
        month,
        type,
        price,
        total,
      });
    }
  };

  const handleServiceTypeClick = (serviceType) => {
    setType(serviceType);
    setTotalCost(null);
  };

  // Простая SVG иконка стрелки вниз
  const ArrowDownIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <section className="w-full flex justify-center items-center mb-24 font-['Montserrat'] mt-40">
      <div className="w-full max-w-[1100px] mx-auto flex flex-row items-start gap-[60px] bg-transparent px-4">
        {/* Левая колонка: калькулятор */}
        <div className="flex flex-col flex-[0_0_440px] items-start font-['Montserrat']">
          <label className="text-[18px] text-[#6B6B6B] font-bold mb-4 font-['Montserrat']" htmlFor="area">Площадь:</label>
          <div className="w-full flex flex-col mb-8">
            <div className="relative w-full h-[56px] flex items-center bg-white" style={{borderRadius:'8px 8px 8px 0', boxShadow:'4px 4px 8px 0 #B0B0B0'}}>
              <span className="absolute left-4 flex items-center h-full">
                <img src={housePlanIcon} alt="house plan" className="w-6 h-6" />
              </span>
              <span className="ml-12 text-[#C7C7C7] text-[14px] font-['Montserrat']">— {area} кв.м</span>
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
          <label className="text-[18px] text-[#9C9C9C] font-bold mb-4 font-['Montserrat']" htmlFor="period">Срок аренды (месяцы):</label>
          <div className="relative w-full mb-8">
            <select 
              value={month}
              onChange={(e) => {
                setMonth(Number(e.target.value));
                setTotalCost(null);
              }}
              className="w-full h-[56px] rounded-lg border-none bg-white pr-10 pl-4 text-[18px] text-[#273655] font-normal focus:outline-none appearance-none font-['Montserrat']" 
              style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}
            >
              <option value={1}>1 месяц</option>
              <option value={2}>2 месяца</option>
              <option value={3}>3 месяца</option>
              <option value={6}>6 месяцев</option>
              <option value={12}>12 месяцев</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <ArrowDownIcon />
            </div>
          </div>
          <label className="text-[18px] text-[#9C9C9C] font-bold mb-4 font-['Montserrat']">Тип услуги:</label>
          <div className="flex flex-row gap-4 mb-4 w-full">
            <div className="flex flex-col gap-4 w-1/2">
              <button
                onClick={() => handleServiceTypeClick('INDIVIDUAL')}
                className={`h-[56px] rounded-lg text-[16px] font-bold w-full font-['Montserrat'] transition-colors ${
                  type === 'INDIVIDUAL' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'
                }`}
                style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}
              >
                Индивидуальное хранение
              </button>
              <button
                onClick={() => handleServiceTypeClick('CLOUD')}
                className={`h-[56px] rounded-lg text-[16px] font-bold w-full font-['Montserrat'] transition-colors ${
                  type === 'CLOUD' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'
                }`}
                style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}
              >
                Облачное хранилище
              </button>
            </div>
            <div className="flex flex-col gap-4 w-1/2">
              <button
                onClick={() => handleServiceTypeClick('RACK')}
                className={`h-[56px] rounded-lg text-[16px] font-bold w-full font-['Montserrat'] transition-colors ${
                  type === 'RACK' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'
                }`}
                style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}
              >
                Стеллажное хранение
              </button>
              <div className="h-[56px] w-full"></div>
            </div>
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
            className="w-full h-[56px] bg-[#f86812] text-white text-[18px] font-bold rounded-lg hover:bg-[#f86812] transition-colors mt-4 font-['Montserrat'] disabled:opacity-50 disabled:cursor-not-allowed" 
            style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}
          >
            {isLoading ? 'ЗАГРУЗКА...' : 'РАССЧИТАТЬ'}
          </button>
        </div>
        {/* Правая колонка: заголовок и картинка */}
        <div className="flex flex-col items-start flex-1 pt-4 pl-20">
          <h2 className="text-[18px] md:text-[30px] font-bold text-[#273655] mb-4 ml-40 text-left tracking-tight leading-tight">
            КАЛЬКУЛЯТОР<br />
            <span style={{marginLeft: '30px', display: 'inline-block'}}>СТОИМОСТИ</span>
          </h2>
          <img src={warehouseImg} alt="Склад warehouse" className="w-full max-w-[500px] object-contain" style={{transform:'scaleX(-1)'}} />
        </div>
      </div>
    </section>
  );
};

export default CostCalculator; 