import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../api/paymentsApi';

const MovingPricingTable = () => {
  const [prices, setPrices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await paymentsApi.getPrices();
        // Фильтруем только элементы с id >= 5
        const filteredPrices = data.filter(price => price.id >= 5);
        setPrices(filteredPrices);

        if (import.meta.env.DEV) {
          console.log('MovingPricingTable: Загружены тарифы с id >= 5:', filteredPrices);
        }
      } catch (error) {
        console.error('MovingPricingTable: Ошибка при загрузке тарифов:', error);
        setError('Не удалось загрузить тарифы. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Функция для перевода типов на русский язык
  const translateType = (type) => {
    const translations = {
      'LOADER': 'Грузчик',
      'PACKER': 'Упаковщик',
      'FURNITURE_SPECIALIST': 'Мебельщик',
      'GAZELLE': 'Газель',
      'STRETCH_FILM': 'Стрейч-плёнка',
      'BOX_SIZE': 'Коробка',
      'MARKER': 'Маркер',
      'UTILITY_KNIFE': 'Канцелярский нож',
      'BUBBLE_WRAP_1': 'Пузырчатая плёнка (10м)',
      'BUBBLE_WRAP_2': 'Пузырчатая плёнка (120м)',
    };
    return translations[type] || type;
  };

  // Функция для форматирования цены
  const formatPrice = (price) => {
    return `${parseFloat(price).toLocaleString('ru-RU')} ₸`;
  };

  const renderStatus = (message, spinner = false) => (
    <section className="w-full flex justify-center items-center py-12 sm:py-16 md:py-24 font-['Montserrat']">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <h2 className="text-[28px] sm:text-[32px] md:text-[35px] font-bold text-[#273655] text-center mb-6 sm:mb-10">
          Тарифы на услуги
        </h2>
        <div className="flex justify-center items-center py-12">
          {spinner ? (
            <div className="flex items-center gap-4">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#F86812]"></div>
              <span className="text-[#273655] text-base md:text-lg">Загрузка тарифов...</span>
            </div>
          ) : (
            <div className="text-[#666] text-base md:text-lg text-center">{message}</div>
          )}
        </div>
      </div>
    </section>
  );

  if (isLoading) return renderStatus('Загрузка тарифов...', true);
  if (error) return renderStatus(error);
  if (prices.length === 0) return renderStatus('Тарифы временно недоступны');

  return (
    <section className="w-full flex justify-center items-center py-12 sm:py-16 md:py-24 font-['Montserrat']">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <h2 className="text-[28px] sm:text-[32px] md:text-[35px] font-bold text-[#273655] text-center mb-3 sm:mb-4">
          Тарифы на услуги
        </h2>
        <p className="text-center text-[#666] text-sm sm:text-base mb-8 sm:mb-12 max-w-2xl mx-auto">
          Актуальные цены на услуги мувинга
        </p>
        
        {/* Desktop версия - таблица */}
        <div className="hidden md:block bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-[#273655] text-white">
                  <th className="text-left px-6 py-4 font-semibold text-base">Услуга</th>
                  <th className="text-left px-6 py-4 font-semibold text-base">Описание</th>
                  <th className="text-right px-6 py-4 font-semibold text-base">Цена</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((priceItem, index) => (
                  <tr 
                    key={priceItem.id} 
                    className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                      index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-[#273655]">
                      {translateType(priceItem.type)}
                    </td>
                    <td className="px-6 py-4 text-[#666] text-sm">
                      {priceItem.description}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#273655]">
                      {formatPrice(priceItem.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile версия - карточки */}
        <div className="md:hidden space-y-3">
          {prices.map((priceItem) => (
            <div 
              key={priceItem.id} 
              className="bg-white rounded-lg shadow-md border border-gray-200 p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-[#273655] text-base flex-1">
                  {translateType(priceItem.type)}
                </h4>
                <span className="font-bold text-[#273655] text-base ml-3 whitespace-nowrap">
                  {formatPrice(priceItem.price)}
                </span>
              </div>
              <p className="text-[#666] text-sm leading-relaxed">
                {priceItem.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MovingPricingTable;