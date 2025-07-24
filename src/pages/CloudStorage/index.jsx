import React from 'react';
import { Header } from '../../widgets';
import bgImage from '../../assets/image_47.png';
import combinedVector from '../../assets/Vector_1306.png';
import leafIcon from '../../assets/Vector_038.svg';

const CloudStorage = () => {
    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Header />

            {/* 🖥️ Десктопный заголовок — над изображением */}
            <div className="hidden md:flex w-full justify-center py-10">
                <div className="flex items-center justify-center">
                    <img src={leafIcon} alt="icon" className="w-10 h-10 mr-2" />
                    <h1 className="text-[#273655] text-[45px] font-bold font-['Montserrat'] tracking-[0.05em]">
                        ОБЛАЧНОЕ ХРАНЕНИЕ
                    </h1>
                    <img src={leafIcon} alt="icon" className="w-10 h-10 ml-2" />
                </div>
            </div>

            {/* Блок с изображением */}
            <div className="relative w-full min-h-[300px] md:min-h-[550px]">
                {/* 📷 Фон */}
                <img
                    src={bgImage}
                    alt="background"
                    className="absolute inset-0 w-full h-full object-cover object-center z-10"
                />
                <img
                    src={combinedVector}
                    alt="combined vector"
                    className="absolute inset-0 w-full h-full object-cover object-center z-20"
                />

                {/* 📱 Мобильный заголовок поверх изображения */}
                <div className="absolute top-6 left-0 w-full px-4 z-30 md:hidden">
                    <div className="flex items-center justify-center">
                        <img src={leafIcon} alt="icon" className="w-6 h-6 mr-2" />
                        <div className="text-center leading-snug">
                            <h1 className="text-[#273655] text-[20px] font-bold font-['Montserrat']">
                                ОБЛАЧНОЕ ХРАНЕНИЕ
                            </h1>
                        </div>
                        <img src={leafIcon} alt="icon" className="w-6 h-6 ml-2" />
                    </div>
                </div>
            </div>

            {/* Основной контент */}
            <div
                className="relative w-full flex justify-center"
                style={{ marginTop: '-120px', zIndex: 40 }}
            >
                <div className="w-full max-w-[1100px] bg-white mt-10 px-4 md:px-8 py-8 md:py-12">
                    <h2 className="text-[26px] md:text-[46px] font-bold text-[#000000] font-['DM Sans'] mb-4 md:mb-6">
                        Облачное хранение от ExtraSpace
                    </h2>
                    <p className="text-[16px] md:text-[18px] text-[#000000] font-['DM Sans'] font-normal leading-relaxed mb-4 max-w-full md:max-w-[730px]">
                        Ваши вещи — в безопасности, даже когда вас нет рядом.
                    </p>
                    <p className="text-[16px] md:text-[18px] text-[#000000] font-['DM Sans'] font-normal leading-relaxed max-w-full md:max-w-[730px]">
                        Облачное хранение — это удобный способ сдать вещи на хранение без необходимости
                        самостоятельно ехать на склад. Мы забираем ваши вещи, бережно упаковываем, храним на
                        охраняемом складе и возвращаем по первому запросу.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CloudStorage;
