import React, { useState, useEffect } from 'react';
import { paymentsApi } from '../api/paymentsApi';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

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
      'LOADER': '💪 Грузчик',
      'PACKER': '📦 Упаковщик',
      'FURNITURE_SPECIALIST': '🔧 Мебельщик',
      'GAZELLE': '🚚 Газель',
      'STRETCH_FILM': '🎥 Стрейч-плёнка',
      'BOX_SIZE': '📦 Коробка',
      'MARKER': '🖊 Маркер',
      'UTILITY_KNIFE': '🔪 Канцелярский нож',
      'BUBBLE_WRAP_1': '🫧 Пузырчатая плёнка (10м)',
      'BUBBLE_WRAP_2': '🫧 Пузырчатая плёнка (120м)',
    };
    return translations[type] || type;
  };

  // Функция для форматирования цены
  const formatPrice = (price) => {
    return `${parseFloat(price).toLocaleString('ru-RU')} ₸`;
  };

  const renderStatus = (message, spinner = false) => (
    <section className="w-full flex justify-center items-center mb-24 font-['Montserrat']">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <h2 className="text-[28px] md:text-[35px] font-bold text-[#1e2c4f] text-center mb-10">
          Тарифные пакеты
        </h2>
        <div className="flex justify-center items-center py-12">
          {spinner ? (
            <>
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#1e2c4f]"></div>
              <span className="ml-4 text-[#1e2c4f] text-base md:text-lg">Загрузка тарифов...</span>
            </>
          ) : (
            <div className="text-[#666] text-base md:text-lg">{message}</div>
          )}
        </div>
      </div>
    </section>
  );

  if (isLoading) return renderStatus('Загрузка тарифов...', true);
  if (error) return renderStatus(error);
  if (prices.length === 0) return renderStatus('Тарифы временно недоступны');

  return (
    <section className="w-full flex justify-center items-center mb-24 font-['Montserrat']">
      <div className="w-full max-w-[1100px] mx-auto px-4">
        <h2 className="text-[28px] md:text-[35px] font-bold text-[#1e2c4f] text-center mb-10">
          Тарифные пакеты
        </h2>
        
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableCaption className="text-[#666] text-sm mt-4">
              Актуальные тарифы на услуги мувинга
            </TableCaption>
            <TableHeader>
              <TableRow className="bg-[#f8f9fa]">
                <TableHead className="font-bold text-[#1e2c4f] text-base">
                  📌 Тип услуги
                </TableHead>
                <TableHead className="font-bold text-[#1e2c4f] text-base">
                  📝 Описание
                </TableHead>
                <TableHead className="font-bold text-[#1e2c4f] text-base text-right">
                  💰 Цена
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prices.map((priceItem) => (
                <TableRow key={priceItem.id} className="hover:bg-[#f8f9fa]/50">
                  <TableCell className="font-medium text-[#1e2c4f]">
                    {translateType(priceItem.type)}
                  </TableCell>
                  <TableCell className="text-[#666]">
                    {priceItem.description}
                  </TableCell>
                  <TableCell className="text-right font-bold text-[#1e2c4f]">
                    {formatPrice(priceItem.price)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
};

export default MovingPricingTable;