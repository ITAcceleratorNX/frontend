import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../api/paymentsApi';

const MovingPricingCards = () => {
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await paymentsApi.getPrices();
        // Фильтруем только нужные тарифы для мувинга
        const movingPrices = data.filter(price => 
          ['LIGHT', 'STANDARD', 'HARD'].includes(price.type)
        );
        setPrices(movingPrices);
        
        if (import.meta.env.DEV) {
          console.log('MovingPricingCards: Загружены тарифы мувинга:', movingPrices);
        }
      } catch (error) {
        console.error('MovingPricingCards: Ошибка при загрузке тарифов:', error);
        setError('Не удалось загрузить тарифы. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  const formatPrice = (price) => {
    const numPrice = parseFloat(price);
    return numPrice.toLocaleString('ru-RU');
  };

  const getOldPrice = (currentPrice) => {
    // Старая цена примерно на 20% выше текущей
    const oldPrice = parseFloat(currentPrice) * 1.2;
    return Math.round(oldPrice).toLocaleString('ru-RU');
  };

  const getPricingDetails = (type) => {
    switch (type) {
      case 'LIGHT':
        return {
          name: 'LIGHT',
          workers: '2 грузчика',
          vehicle: '1 газель',
          hours: '4 часа работы',
          buttonClass: 'bg-[#f86812] hover:bg-[#f86812] text-white',
          buttonText: 'ЗАКАЗАТЬ'
        };
      case 'STANDARD':
        return {
          name: 'STANDARD',
          workers: '3 грузчика',
          vehicle: '1 газель',
          hours: '8 часов работы',
          buttonClass: 'bg-[#1e2c4f] hover:bg-[#1e2c4f] text-white',
          buttonText: 'ЗАКАЗАТЬ'
        };
      case 'HARD':
        return {
          name: 'HARD',
          workers: '3 грузчика',
          vehicle: '1 газель',
          hours: '12 часов работы',
          buttonClass: 'bg-[#f86812] hover:bg-[#f86812] text-white',
          buttonText: 'ЗАКАЗАТЬ'
        };
      default:
        return {
          name: type,
          workers: 'уточняется',
          vehicle: 'уточняется',
          hours: 'уточняется',
          buttonClass: 'bg-[#f86812] hover:bg-[#f86812] text-white',
          buttonText: 'ЗАКАЗАТЬ'
        };
    }
  };

  const handleOrderClick = (tariffType) => {
    if (import.meta.env.DEV) {
      console.log('MovingPricingCards: Заказ тарифа:', tariffType);
    }
    // Здесь можно добавить логику перехода на страницу заказа или открытие модального окна
  };

  if (isLoading) {
    return (
      <section className="w-full flex justify-center items-center mb-24 font-['Montserrat']">
        <div className="w-full max-w-[1100px] mx-auto px-4">
          <h2 className="text-[32px] md:text-[35px] font-bold text-[#1e2c4f] text-center mb-10">
            ТАРИФНЫЕ ПАКЕТЫ
          </h2>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
            <span className="ml-4 text-[#1e2c4f] text-lg">Загрузка тарифов...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full flex justify-center items-center mb-24 font-['Montserrat']">
        <div className="w-full max-w-[1100px] mx-auto px-4">
          <h2 className="text-[32px] md:text-[35px] font-bold text-[#1e2c4f] text-center mb-10">
            ТАРИФНЫЕ ПАКЕТЫ
          </h2>
          <div className="flex justify-center items-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-red-600 text-lg">{error}</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (prices.length === 0) {
    return (
      <section className="w-full flex justify-center items-center mb-24 font-['Montserrat']">
        <div className="w-full max-w-[1100px] mx-auto px-4">
          <h2 className="text-[32px] md:text-[35px] font-bold text-[#1e2c4f] text-center mb-10">
            ТАРИФНЫЕ ПАКЕТЫ
          </h2>
          <div className="flex justify-center items-center py-12">
            <div className="text-[#666] text-lg">Тарифы временно недоступны</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full flex justify-center items-center mb-24 font-['Montserrat']">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <h2 className="text-[32px] md:text-[35px] font-bold text-[#1e2c4f] text-center mb-10">
          ТАРИФНЫЕ ПАКЕТЫ
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
          {prices.map((priceItem) => {
            const details = getPricingDetails(priceItem.type);
            const currentPrice = formatPrice(priceItem.price);
            const oldPrice = getOldPrice(priceItem.price);
            
            return (
              <div
                key={priceItem.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 w-full max-w-[320px] hover:shadow-xl transition-all duration-300 hover:scale-105"
                style={{ boxShadow: '4px 4px 12px 0 rgba(0,0,0,0.1)' }}
              >
                {/* Заголовок тарифа */}
                <div className="text-center mb-6">
                  <h3 className="text-[28px] font-bold text-[#1e2c4f] mb-4">
                    {details.name}
                  </h3>
                </div>

                {/* Цена */}
                <div className="mb-6 text-center">
                  <div className="text-[16px] text-[#666] mb-2">Цена:</div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-[24px] font-bold text-[#1e2c4f]">
                      {currentPrice} тг
                    </span>
                    <span className="text-[16px] text-[#999] line-through">
                      {oldPrice} тг
                    </span>
                  </div>
                </div>

                {/* Описание услуг */}
                <div className="mb-6 space-y-3 text-center">
                  <div className="text-[16px] text-[#1e2c4f] font-medium">
                    {details.workers}
                  </div>
                  <div className="text-[16px] text-[#1e2c4f] font-medium">
                    {details.vehicle}
                  </div>
                  <div className="text-[16px] text-[#1e2c4f] font-medium">
                    {details.hours}
                  </div>
                  {priceItem.description && (
                    <div className="text-[14px] text-[#666] mt-4 leading-relaxed px-2">
                      {priceItem.description}
                    </div>
                  )}
                </div>

                {/* Кнопка заказа */}
                <button
                  onClick={() => handleOrderClick(priceItem.type)}
                  className={`w-full h-[50px] rounded-lg font-bold text-[16px] transition-all duration-300 hover:shadow-lg hover:scale-105 ${details.buttonClass}`}
                  style={{ boxShadow: '2px 2px 6px 0 rgba(0,0,0,0.15)' }}
                >
                  {details.buttonText}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MovingPricingCards; 