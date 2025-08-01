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

  // Добавляем состояния для размеров (облачное хранение)
  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
    length: 1
  });

  // Состояния для стеллажного хранения (RACK) - простые размеры без полок
  const [rackDimensions, setRackDimensions] = useState({
    width: 1,    // ширина (м)
    height: 1, // высота (м) 
    length: 1    // длина (м)
  });

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

  // Функция для расчета объема
  const calculateVolume = (width, height, length) => {
    return width * height * length;
  };

  // Функция для расчета объема стеллажа (RACK) - простая формула без полок
  const calculateRackVolume = (width, height, length) => {
    return width * height * length;
  };

  // Обработчик изменения размеров (для облачного хранения)
  const handleDimensionChange = (e, dimension) => {
    const value = Math.max(1, Number(e.target.value)); // Минимальное значение 1
    const newDimensions = {
      ...dimensions,
      [dimension]: value
    };

    setDimensions(newDimensions);

    // Если выбран тип CLOUD, пересчитываем площадь как объем
    if (type === 'CLOUD') {
      const volume = calculateVolume(newDimensions.width, newDimensions.height, newDimensions.length);
      setArea(volume);
    }

    setTotalCost(null);
  };

  // Обработчик изменения размеров стеллажа (RACK)
  const handleRackDimensionChange = (e, dimension) => {
    const value = Math.max(1, Number(e.target.value)); // Минимальное значение 1
    const newRackDimensions = {
      ...rackDimensions,
      [dimension]: value
    };

    setRackDimensions(newRackDimensions);

    // Если выбран тип RACK, пересчитываем площадь как объем стеллажа
    if (type === 'RACK') {
      const volume = calculateRackVolume(
        newRackDimensions.width, 
        newRackDimensions.height, 
        newRackDimensions.length
      );
      setArea(volume);
    }

    setTotalCost(null);
  };

  const calculateCost = () => {
    let price;
    
    // Для стеллажного хранения (RACK) используем особую логику
    if (type === 'RACK') {
      const selectedPrice = prices.find(price => price.type === 'RACK');
      // Если тариф из API доступен - используем его, иначе дефолтный 20₸
      price = selectedPrice ? parseFloat(selectedPrice.price) : 20;
    } else {
      // Для остальных типов используем обычную логику
      const selectedPrice = prices.find(price => price.type === type);
      if (!selectedPrice) {
        setError('Цена для выбранного типа услуги не найдена');
        return;
      }
      price = parseFloat(selectedPrice.price);
    }
    
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
        ...(type === 'CLOUD' && { dimensions }),
        ...(type === 'RACK' && { rackDimensions })
      });
    }
  };

  const handleServiceTypeClick = (serviceType) => {
    setType(serviceType);
    setTotalCost(null);

    // Устанавливаем area в зависимости от типа услуги
    if (serviceType === 'CLOUD') {
      // Для облачного хранения используем объем
      const volume = calculateVolume(dimensions.width, dimensions.height, dimensions.length);
      setArea(volume);
    } else if (serviceType === 'RACK') {
      // Для стеллажного хранения используем простой объем
      const volume = calculateRackVolume(
        rackDimensions.width, 
        rackDimensions.height, 
        rackDimensions.length
      );
      setArea(volume);
    } else {
      // Для индивидуального хранения используем площадь по умолчанию
      setArea(50);
    }
  };

  const ArrowDownIcon = () => (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
  );

  return (
      <section className="w-full flex justify-center items-center mb-24 mt-40 px-4">
        <div className="w-full max-w-[1100px] mx-auto flex flex-col lg:flex-row items-start gap-10 lg:gap-[60px] bg-transparent">

          {/* Правая колонка: заголовок и картинка */}
          <div className="w-full flex flex-col items-center lg:items-start lg:flex-1 lg:pt-4 lg:pl-20 mb-10 lg:mb-0">
            <h2 className="text-[22px] sm:text-[26px] md:text-[30px] font-bold text-[#273655] mb-4 text-center lg:text-left leading-tight tracking-tight">
              КАЛЬКУЛЯТОР<br />
              <span className="inline-block mt-1">СТОИМОСТИ</span>
            </h2>
            <img
                src={warehouseImg}
                alt="Склад warehouse"
                className="w-full max-w-[400px] md:max-w-[500px] object-contain transform -scale-x-100"
            />
          </div>

          {/* Левая колонка: калькулятор */}
          <div className="w-full max-w-[500px] flex flex-col items-start mx-auto">

            {/* Площадь или размеры (для облачного и стеллажного хранения) */}
            {type === 'INDIVIDUAL' ? (
                <>
                  <label htmlFor="area" className="text-[16px] sm:text-[18px] text-[#6B6B6B] font-bold mb-4">Площадь:</label>
                  <div className="w-full flex flex-col mb-8">
                    <div className="relative w-full h-[56px] flex items-center bg-white rounded-t-[8px]" style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}>
                  <span className="absolute left-4 flex items-center h-full">
                    <img src={housePlanIcon} alt="house plan" className="w-6 h-6" />
                  </span>
                      <span className="ml-12 text-[#C7C7C7] text-[14px]">— {area} кв.м</span>
                    </div>
                    <div className="w-full relative -mt-[22px]">
                      <div className="absolute left-0 bottom-0 h-[2px] bg-[#0062D3] rounded-full z-[1]" style={{ width: `${Math.min(100, area)}%` }}></div>
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
                          style={{ WebkitAppearance: 'none' }}
                      />
                    </div>
                  </div>
                </>
            ) : type === 'CLOUD' ? (
                <>
                  <label className="text-[16px] sm:text-[18px] text-[#6B6B6B] font-bold mb-4">Размеры (м):</label>
                  <div className="w-full flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <label className="text-[14px] text-[#6B6B6B]">Ширина:</label>
                      <input
                          type="number"
                          min="1"
                          value={dimensions.width}
                          onChange={(e) => handleDimensionChange(e, 'width')}
                          className="flex-1 h-[56px] rounded-lg border-none bg-white px-4 text-[16px] text-[#273655] font-normal focus:outline-none"
                          style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-[14px] text-[#6B6B6B]">Высота:</label>
                      <input
                          type="number"
                          min="1"
                          value={dimensions.height}
                          onChange={(e) => handleDimensionChange(e, 'height')}
                          className="flex-1 h-[56px] rounded-lg border-none bg-white px-4 text-[16px] text-[#273655] font-normal focus:outline-none"
                          style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-[14px] text-[#6B6B6B]">Длина:</label>
                      <input
                          type="number"
                          min="1"
                          value={dimensions.length}
                          onChange={(e) => handleDimensionChange(e, 'length')}
                          className="flex-1 h-[56px] rounded-lg border-none bg-white px-4 text-[16px] text-[#273655] font-normal focus:outline-none"
                          style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}
                      />
                    </div>
                    <div className="mt-2 text-[14px] text-[#6B6B6B]">
                      Объем: {area} м³
                    </div>
                  </div>
                </>
            ) : (
                <>
                  <label className="text-[16px] sm:text-[18px] text-[#6B6B6B] font-bold mb-4">Размеры стеллажа (м):</label>
                  <div className="w-full flex flex-col gap-4 mb-8">
                    <div className="flex items-center gap-4">
                      <label className="text-[14px] text-[#6B6B6B] w-16">Ширина:</label>
                      <input
                          type="number"
                          min="1"
                          value={rackDimensions.width}
                          onChange={(e) => handleRackDimensionChange(e, 'width')}
                          className="flex-1 h-[56px] rounded-lg border-none bg-white px-4 text-[16px] text-[#273655] font-normal focus:outline-none"
                          style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}
                          placeholder="1.0"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-[14px] text-[#6B6B6B] w-16">Высота:</label>
                      <input
                          type="number"
                          min="1"
                          value={rackDimensions.height}
                          onChange={(e) => handleRackDimensionChange(e, 'height')}
                          className="flex-1 h-[56px] rounded-lg border-none bg-white px-4 text-[16px] text-[#273655] font-normal focus:outline-none"
                          style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}
                          placeholder="0.5"
                      />
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="text-[14px] text-[#6B6B6B] w-16">Длина:</label>
                      <input
                          type="number"
                          min="1"
                          value={rackDimensions.length}
                          onChange={(e) => handleRackDimensionChange(e, 'length')}
                          className="flex-1 h-[56px] rounded-lg border-none bg-white px-4 text-[16px] text-[#273655] font-normal focus:outline-none"
                          style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}
                          placeholder="2.0"
                      />
                    </div>
                    <div className="mt-2 text-[14px] text-[#6B6B6B]">
                      Объем: {area} м³
                    </div>
                  </div>
                </>
            )}

            {/* Срок аренды */}
            <label htmlFor="period" className="text-[16px] sm:text-[18px] text-[#9C9C9C] font-bold mb-4">Срок аренды (месяцы):</label>
            <div className="relative w-full mb-8">
              <select
                  value={month}
                  onChange={(e) => {
                    setMonth(Number(e.target.value));
                    setTotalCost(null);
                  }}
                  className="w-full h-[56px] rounded-lg border-none bg-white pr-10 pl-4 text-[16px] sm:text-[18px] text-[#273655] font-normal focus:outline-none appearance-none"
                  style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}
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

            {/* Тип услуги */}
            <label className="text-[16px] sm:text-[18px] text-[#9C9C9C] font-bold mb-4">Тип услуги:</label>
            <div className="flex flex-col sm:flex-row gap-4 mb-4 w-full">
              <div className="flex flex-col gap-4 w-full sm:w-1/2">
                <button
                    onClick={() => handleServiceTypeClick('INDIVIDUAL')}
                    className={`h-[56px] rounded-lg text-[16px] font-bold w-full transition-colors ${
                        type === 'INDIVIDUAL' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'
                    }`}
                    style={{ boxShadow: '4px 4px 8px 0 #B0B0B0', border: '1px solid #273655' }}
                >
                  Индивидуальное
                </button>
                <button
                    onClick={() => handleServiceTypeClick('CLOUD')}
                    className={`h-[56px] rounded-lg text-[16px] font-bold w-full transition-colors ${
                        type === 'CLOUD' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'
                    }`}
                    style={{ boxShadow: '4px 4px 8px 0 #B0B0B0', border: '1px solid #273655' }}
                >
                  Облачное
                </button>
              </div>
              <div className="flex flex-col gap-4 w-full sm:w-1/2">
                <button
                    onClick={() => handleServiceTypeClick('RACK')}
                    className={`h-[56px] rounded-lg text-[16px] font-bold w-full transition-colors ${
                        type === 'RACK' ? 'bg-[#273655] text-white' : 'bg-white text-[#273655]'
                    }`}
                    style={{ boxShadow: '4px 4px 8px 0 #B0B0B0', border: '1px solid #273655' }}
                >
                  Стеллажное
                </button>
                <div className="h-[56px] w-full" />
              </div>
            </div>

            {/* Результат или ошибка */}
            {totalCost !== null && (
                <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="text-[18px] sm:text-[20px] font-bold text-[#273655] text-center">
                    Итого: {totalCost.toLocaleString()} ₸
                  </div>
                </div>
            )}
            {error && (
                <div className="w-full bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <div className="text-[14px] sm:text-[16px] text-red-600 text-center">
                    {error}
                  </div>
                </div>
            )}

            {/* Кнопка рассчитать */}
            <button
                onClick={calculateCost}
                disabled={isLoading || prices.length === 0}
                className="w-full h-[56px] bg-[#f86812] text-white text-[16px] sm:text-[18px] font-bold rounded-lg hover:bg-[#f86812] transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ boxShadow: '4px 4px 8px 0 #B0B0B0' }}
            >
              {isLoading ? 'ЗАГРУЗКА...' : 'РАССЧИТАТЬ'}
            </button>
          </div>
        </div>
      </section>
  );
};

export default CostCalculator;