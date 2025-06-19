import React, { useState, useEffect } from 'react';
import { Header } from '../../widgets';
import bgImage from '../../assets/image 38.png';
import topVector from '../../assets/Vector_9.png';
import bottomVector from '../../assets/Vector_10.png';
import leafIcon from '../../assets/Vector_038 (Illustrator Vectors) svg-01 2 (1).png';
import housePlanIcon from '../../assets/house-plan_5203481 1.svg';
import arrowDownIcon from '../../assets/arrow-down.svg';
import textAlignIcon from '../../assets/textalign-justifycenter.svg';
import warehouseImg from '../../assets/warehouse.png';
import tariffs1 from '../../assets/tariffs_1.png';
import tariffs2 from '../../assets/tariffs_2.png';
import tariffs3 from '../../assets/tariffs_3.png';
import Footer from '../../widgets/Footer';
import api from '../../shared/api/axios';
import CostCalculator from '../../shared/components/CostCalculator';

const tariffs = [
  { no: '01.', loan: '$100,000', left: '$40,500', duration: '8 Months', rate: '12%', installment: '$2,000 / month', repay: true },
  { no: '02.', loan: '$500,000', left: '$250,000', duration: '36 Months', rate: '10%', installment: '$8,000 / month', repay: false },
  { no: '03.', loan: '$900,000', left: '$40,500', duration: '12 Months', rate: '12%', installment: '$5,000 / month', repay: false },
  { no: '04.', loan: '$50,000', left: '$40,500', duration: '25 Months', rate: '5%', installment: '$2,000 / month', repay: false },
  { no: '05.', loan: '$50,000', left: '$40,500', duration: '5 Months', rate: '16%', installment: '$10,000 / month', repay: false },
  { no: '06.', loan: '$80,000', left: '$25,500', duration: '14 Months', rate: '8%', installment: '$2,000 / month', repay: false },
  { no: '07.', loan: '$12,000', left: '$5,500', duration: '9 Months', rate: '13%', installment: '$500 / month', repay: false },
  { no: '08.', loan: '$160,000', left: '$100,800', duration: '3 Months', rate: '12%', installment: '$900 / month', repay: false },
];

const TariffsPage = () => {
  const [area, setArea] = useState(50);
  
  // Состояния для калькулятора стоимости
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(0);
  const [type, setType] = useState('INDIVIDUAL');
  const [prices, setPrices] = useState([]);
  const [totalCost, setTotalCost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка цен при монтировании компонента
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await api.get('/prices');
        setPrices(response.data);
        if (import.meta.env.DEV) {
          console.log('TariffsPage: Цены загружены:', response.data);
        }
      } catch (error) {
        console.error('TariffsPage: Ошибка при загрузке цен:', error);
        setError('Не удалось загрузить цены. Попробуйте позже.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrices();
  }, []);

  // Функция расчета стоимости
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
    
    if (import.meta.env.DEV) {
      console.log('TariffsPage: Расчет стоимости:', {
        area,
        month,
        day,
        type,
        amount,
        monthlyCost,
        dailyCost,
        total
      });
    }
  };

  // Обработчики для кнопок типа услуги
  const handleServiceTypeClick = (serviceType) => {
    setType(serviceType);
    setTotalCost(null); // Сбрасываем результат при смене типа
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      <div className="relative w-full min-h-[700px] flex flex-col items-center justify-center">
        {/* Фоновое изображение */}
        <img src={bgImage} alt="background" className="absolute inset-0 w-full h-full object-cover object-center z-10" style={{minHeight:'700px', height:'100%', width:'100%'}} />
        {/* Верхний белый вектор */}
        <img src={topVector} alt="top vector" className="absolute top-[-1px] left-0 w-full h-[180px] z-20" />
        {/* Нижний белый вектор */}
        <img src={bottomVector} alt="bottom vector" className="absolute bottom-[-11px] left-0 w-full h-[200px] z-20" />
        {/* Контент */}
        <div className="relative z-30 w-full flex flex-col items-center pt-[30px] pb-[30px]">
          <div className="flex items-center justify-center mb-80 mt-[-230px]">
            <img src={leafIcon} alt="icon" className="w-10 h-10 mr-2" />
            <h1 className="text-[40px] md:text-[55px] font-bold text-[#273655] font-['Montserrat'] tracking-[0.05em]">РАСЧЕТ ТАРИФА</h1>
            <img src={leafIcon} alt="icon" className="w-10 h-10 ml-2" />
          </div>
        </div>
      </div>
      {/* Таблица на белом фоне, вне блока с фоном */}
      <div className="relative w-full flex justify-center" style={{marginTop: '-290px', zIndex: 40}}>
        <div className="w-full max-w-[1100px] bg-white rounded-sm shadow-2xl overflow-x-auto border border-[#E6E9F5] mt-[40px]" style={{boxShadow:'0 8px 32px 0 rgba(40,40,80,0.10)', borderRadius:'32px', paddingTop:'32px', paddingBottom:'16px', position:'relative', zIndex:30}}>
          <table className="w-full text-[#222] text-[15px] font-normal border-collapse">
            <thead>
              <tr className="border-b border-[#E6E9F5] text-[#A6A6A6] text-[13px]">
                <th className="p-4 font-semibold">SL No</th>
                <th className="p-4 font-semibold">Loan Money</th>
                <th className="p-4 font-semibold">Left to repay</th>
                <th className="p-4 font-semibold">Duration</th>
                <th className="p-4 font-semibold">Interest rate</th>
                <th className="p-4 font-semibold">Installment</th>
                <th className="p-4 font-semibold">Repay</th>
              </tr>
            </thead>
            <tbody>
              {tariffs.map((row, idx) => (
                <tr key={row.no} className="border-b border-[#E6E9F5] hover:bg-[#FAFAFA] transition-colors">
                  <td className="p-4 text-[#273655] font-medium">{row.no}</td>
                  <td className="p-4">{row.loan}</td>
                  <td className="p-4">{row.left}</td>
                  <td className="p-4">{row.duration}</td>
                  <td className="p-4">{row.rate}</td>
                  <td className="p-4">{row.installment}</td>
                  <td className="p-4">
                    <button className={`px-6 py-1 rounded-full border ${idx === 0 ? 'border-[#273655] text-[#273655] bg-white' : 'bg-[#F5F5F5] text-[#273655] border-[#E6E9F5]'} font-medium text-[15px] transition-all duration-200 hover:scale-105`}>{idx === 0 ? 'Repay' : 'Repay'}</button>
                  </td>
                </tr>
              ))}
              <tr className="bg-white">
                <td className="p-4 font-bold text-[#C73636]">Total</td>
                <td className="p-4 font-bold text-[#C73636]">$125,0000</td>
                <td className="p-4 font-bold text-[#273655]">$750,000</td>
                <td className="p-4"></td>
                <td className="p-4"></td>
                <td className="p-4 font-bold text-[#C73636]">$50,000 / month</td>
                <td className="p-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      {/* Второй фрейм: калькулятор стоимости */}
      <CostCalculator />
      {/* Третий фрейм: изображения тарифов */}
      <section className="w-full flex flex-col items-center mt-10 mb-24 font-['Montserrat']">
        <div className="w-full max-w-4xl mb-0">
          <ul className="list-disc pl-6 text-[20px] font-bold md:text-[18px] text-[#222] font-['Montserrat']">
            <li>
              Страница "Тарифы"
              <ul className="list-disc pl-8 mt-0 text-[18px] md:text-[19px] space-y-1 font-bold">
                <li>
                  Содержание:
                  <ul className="list-disc pl-8 mt-0 space-y-1">
                    <li>Таблица с карточками и картинками - тарифами на все виды услуг.</li>
                    <li>Сравнительная таблица цен по услугам: аренда складов, облачное хранение, мувинг.</li>
                    <li>Калькулятор для расчета стоимости.</li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <img src={tariffs1} alt="Тарифы 1" className="w-full max-w-3xl object-contain mb-32" />
        <img src={tariffs2} alt="Тарифы 2" className="w-full max-w-4xl object-contain mb-32" />
        <img src={tariffs3} alt="Тарифы 3" className="w-full max-w-4xl object-contain mb-80" />
      </section>
      <Footer />
    </div>
  );
};

export default TariffsPage; 