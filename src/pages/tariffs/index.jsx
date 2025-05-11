import React, { useState } from 'react';
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
      <section className="w-full flex justify-center items-center mb-24 font-['Montserrat'] mt-40">
        <div className="w-full max-w-[1100px] mx-auto flex flex-row items-start gap-[60px] bg-transparent px-4">
          {/* Левая колонка: калькулятор */}
          <div className="flex flex-col flex-[0_0_440px] items-start font-['Montserrat']">
            <div className="flex items-center mb-8">
              <img src={textAlignIcon} alt="icon" className="w-[18px] h-[18px] mr-[6px]" />
              <span className="text-xs text-[#A6A6A6]">Быстро и удобно</span>
            </div>
            <label className="text-[22px] text-[#6B6B6B] font-bold mb-4 font-['Montserrat']" htmlFor="area">Площадь:</label>
            <div className="w-full flex flex-col mb-8">
              <div className="relative w-full h-[56px] flex items-center bg-white" style={{borderRadius:'8px 8px 8px 0', boxShadow:'4px 4px 8px 0 #B0B0B0'}}>
                <span className="absolute left-4 flex items-center h-full">
                  <img src={housePlanIcon} alt="house plan" className="w-6 h-6" />
                </span>
                <span className="ml-12 text-[#C7C7C7] text-[18px] font-['Montserrat']">— {area} кв.м</span>
              </div>
              <div className="w-full relative" style={{marginTop:'-22px'}}>
                {/* Синий прогресс-бар до ползунка */}
                <div className="absolute left-0 bottom-0 h-[2px] bg-[#0062D3] rounded-full" style={{width: `${area}%`, zIndex:1}}></div>
                {/* Прозрачная часть */}
                <div className="absolute right-0 bottom-0 h-[2px] bg-transparent" style={{left: `${area}%`, zIndex:1}}></div>
                <input id="area" type="range" min="1" max="100" value={area} onChange={e => setArea(Number(e.target.value))} className="w-full h-[2px] bg-transparent appearance-none relative z-10" style={{WebkitAppearance:'none'}} />
                <style>{`
                  input[type='range']::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #F86812;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
                    cursor: pointer;
                  }
                  input[type='range']::-webkit-slider-runnable-track {
                    height: 2px;
                    background: transparent;
                  }
                  input[type='range']:focus {
                    outline: none;
                  }
                  input[type='range']::-moz-range-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #EA9938;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
                    cursor: pointer;
                  }
                  input[type='range']::-ms-thumb {
                    width: 16px;
                    height: 16px;
                    border-radius: 50%;
                    background: #EA9938;
                    border: 2px solid #fff;
                    box-shadow: 0 2px 8px 0 rgba(0,0,0,0.08);
                    cursor: pointer;
                  }
                  input[type='range']::-ms-fill-lower {
                    background: transparent;
                  }
                  input[type='range']::-ms-fill-upper {
                    background: transparent;
                  }
                `}</style>
              </div>
            </div>
            <label className="text-[22px] text-[#9C9C9C] font-bold mb-4 font-['Montserrat']" htmlFor="period">Срок аренды (дни/месяцы):</label>
            <div className="flex gap-4 mb-8 w-full">
              <div className="relative flex-1">
                <select className="w-full h-[56px] rounded-lg border-none bg-white pr-10 pl-4 text-[18px] text-[#C7C7C7] font-normal focus:outline-none appearance-none font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}>
                  <option>— месяц</option>
                </select>
                <img src={arrowDownIcon} alt="arrow down" className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <select className="w-full h-[56px] rounded-lg border-none bg-white pr-10 pl-4 text-[18px] text-[#C7C7C7] font-normal focus:outline-none appearance-none font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}>
                  <option>— день</option>
                </select>
                <img src={arrowDownIcon} alt="arrow down" className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            <label className="text-[22px] text-[#9C9C9C] font-bold mb-4 font-['Montserrat']">Тип услуги:</label>
            <div className="flex flex-row gap-4 mb-4 w-full">
              <div className="flex flex-col gap-4 w-1/2">
                <button className="h-[56px] rounded-lg bg-[#273655] text-white text-[16px] font-bold w-full font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}>Обычное хранение</button>
                <button className="h-[56px] rounded-lg bg-white text-[#273655] text-[16px] font-bold w-full font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}>Мувинг</button>
              </div>
              <div className="flex flex-col gap-4 w-1/2">
                <button className="h-[56px] rounded-lg bg-white text-[#273655] text-[16px] font-bold w-full font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0', border:'1px solid #273655'}}>Облачное хранение</button>
                <div className="h-[56px] w-full"></div>
              </div>
            </div>
            <button className="w-full h-[56px] bg-[#32BA16] text-white text-[18px] font-bold rounded-lg hover:bg-[#d87d1c] transition-colors mt-4 font-['Montserrat']" style={{boxShadow:'4px 4px 8px 0 #B0B0B0'}}>РАССЧИТАТЬ</button>
          </div>
          {/* Правая колонка: заголовок и картинка */}
          <div className="flex flex-col items-start flex-1 pt-16 pl-20">
            <h2 className="text-[28px] md:text-[32px] font-bold text-[#273655] mb-4 ml-40 mt-4 text-left tracking-tight leading-tight">
              КАЛЬКУЛЯТОР<br />
              <span style={{marginLeft: '40px', display: 'inline-block'}}>СТОИМОСТИ</span>
            </h2>
            <img src={warehouseImg} alt="Склад warehouse" className="w-full max-w-[500px] object-contain" style={{transform:'scaleX(-1)'}} />
          </div>
        </div>
      </section>
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
    </div>
  );
};

export default TariffsPage; 