import React from 'react';
import { Header } from '../../widgets';
import bgImage from '../../assets/image_47.png';
import combinedVector from '../../assets/Vector_1306.png';
import leafIcon from '../../assets/Vector_038.svg';

const CloudStorage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      {/* Блок с заголовком и иконками - теперь над изображением */}
      <div className="w-full flex flex-col items-center py-10 mb-[-10px]">
        <div className="flex items-center justify-center">
          <img src={leafIcon} alt="icon" className="w-10 h-10 mr-2" />
          <h1 className="text-[40px] md:text-[55px] font-bold text-[#273655] font-['Montserrat'] tracking-[0.05em]">ОБЛАЧНОЕ ХРАНЕНИЕ</h1>
          <img src={leafIcon} alt="icon" className="w-10 h-10 ml-2" />
        </div>
      </div>
      {/* Основной контейнер с фоновым изображением и вектором */}
      <div className="relative w-full min-h-[550px]">
        {/* Фоновое изображение */}
        <img src={bgImage} alt="background" className="absolute inset-0 w-full h-full object-cover object-center z-10" style={{minHeight:'550px', height:'100%', width:'100%'}} />
        {/* Объединенный верхний и нижний белый вектор */}
        <img src={combinedVector} alt="combined vector" className="absolute inset-0 w-full h-full object-cover object-center z-20" />
      </div>

      <div className="relative w-full flex justify-center" style={{marginTop: '-210px', zIndex: 40}}>
        <div className="w-full max-w-[1100px] bg-white mt-[40px] px-8 py-12" >
          <h2 className="text-[46px] font-bold text-[#000000] font-['DM Sans'] mb-6">Облачное хранение от ExtraSpace</h2>
          <p className="text-[18px] max-w-[730px] text-[#000000] font-['DM Sans'] font-normal leading-relaxed">
            Ваши вещи — в безопасности, даже когда вас нет рядом.
          </p>
          <p className="text-[18px] max-w-[730px] text-[#000000] font-['DM Sans'] font-normal leading-relaxed">
            Облачное хранение — это удобный способ сдать вещи на хранение без необходимости самостоятельно ехать на склад. Мы забираем ваши вещи, бережно упаковываем, храним на охраняемом складе и возвращаем по первому запросу.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CloudStorage; 