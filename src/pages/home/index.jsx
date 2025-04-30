import React from 'react';
import { Header } from '../../widgets';
import vectorImg from '../../assets/vector.png';
import backgroundTextImg from '../../assets/background-text.png';
import boxesImg from '../../assets/boxes.png';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />
      
      <div className="flex-1 relative overflow-hidden">
        <div className="container mx-auto tracking-[0.1em] px-2 py-8">
          <div className="text-center relative flex flex-col items-center">
            <h1 className="text-[40px] md:text-[55px] font-bold text-[#273655] mb-2 flex flex-col items-center leading-[1.0] font-['Montserrat']">
              <span className="mb-1">БЕРЕЖНОЕ ХРАНЕНИЕ</span>
              <div className="flex justify-center items-center gap-2">
                <img src={vectorImg} alt="Декоративный элемент" className="w-10 h-10" />
                <span>ВАШИХ ВЕЩЕЙ</span>
                <img src={vectorImg} alt="Декоративный элемент" className="w-10 h-10" />
              </div>
            </h1>
            
            <div className="mt-3">
              <button className="bg-[#273655] text-white px-10 py-1 rounded-[30px] text-lg font-medium hover:bg-[#2a3c64] transition-colors font-['Montserrat']">
                Теплые склады с охраной от 3 м²
              </button>
            </div>

            <div className="relative mt-5 w-full h-[470px]">
              {/* Фоновый текст */}
              <div className="absolute left-1/2 transform -translate-x-1/2 w-[126%] max-w-none z-0 h-full flex items-center justify-center">
                <img 
                  src={backgroundTextImg}
                  alt="Background" 
                  className="w-full h-auto object-contain mix-blend-normal opacity-[0.9] brightness-[0] contrast-[100%] scale-90"
                />
              </div>
              
              {/* Коробки поверх текста */}
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <img 
                  src={boxesImg}
                  alt="Storage boxes" 
                  className="w-full max-w-6xl object-contain transform scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 