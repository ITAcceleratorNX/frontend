import React from 'react';
import { Header } from '../../widgets';
import bgImage from '../../assets/image_47.png';
import combinedVector from '../../assets/Vector_1306.png';
import leafIcon from '../../assets/Vector_038.svg';
import Footer from "../../widgets/Footer/index.jsx";
import CostCalculator from "../../shared/components/CostCalculator.jsx";
import FileCheckIcon from '../../assets/File_Check.png';
import GroupIcon from '../../assets/group.png';
import ShieldTickIcon from '../../assets/shield-tick.png';
import BoxTickIcon from '../../assets/box-tick.png';

const CloudStorage = () => {
    return (
        <>
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
                <div className="w-full max-w-[1100px] bg-white mt-10 px-4 md:px-8 py-8 md:py-12 text-center">
                    <h2 className="text-[26px] md:text-[46px] font-bold text-[#000000] font-['DM Sans'] mb-4 md:mb-6">
                        Облачное хранение
                    </h2>
                    <p className="text-[16px] md:text-[18px] text-[#000000] font-['DM Sans'] font-normal leading-relaxed mb-4 max-w-full md:max-w-[730px] mx-auto">
                        Это современный способ хранить вещи без поездок на склад. Мы приезжаем к вам, забираем и бережно упаковываем вещи, размещаем их на стеллажах в охраняемом складе и возвращаем по первому запросу. Всё просто: заказ — забор — хранение — доставка обратно.
                    </p>
                    <p className="text-[16px] md:text-[18px] text-[#000000] font-['DM Sans'] font-normal leading-relaxed mb-4 max-w-full md:max-w-[730px] mx-auto">
                        Ваши вещи всегда в безопасности и под контролем.
                    </p>
                    <p className="text-[16px] md:text-[18px] text-[#000000] font-['DM Sans'] font-normal leading-relaxed max-w-full md:max-w-[730px] mx-auto">
                        А для вас это больше свободы, меньше забот и уверенность, что всё ценное всегда рядом, даже если оно хранится не у вас дома.
                    </p>
                </div>
            </div>

            {/* Секция видео и шагов */}
            <section className="w-full flex flex-col items-center justify-center mt-1 font-['Montserrat'] px-4">
                <div className="w-full max-w-[1100px] mx-auto">
                    {/* Заголовок */}
                    <h2 className="text-[24px] md:text-[30px] font-bold text-[#273655] text-center mb-8">
                        Как работает облачное хранение?
                    </h2>

                    {/* Видео */}
                    <div className="w-full flex justify-center mb-6">
                        <div className="w-full max-w-[900px] aspect-video shadow-lg rounded-lg overflow-hidden">
                            <iframe
                                src="https://www.youtube.com/embed/nW1yLTEeLWc?si=4O4dNpCsmMSlLY0x"
                                title="Как работает облачное хранение"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                    </div>

                    {/* Подпись */}
                    <div className="text-[18px] md:text-[20px] font-medium text-[#273655] text-center mb-10 px-2">
                        Платите только за объем ваших вещей, а не за весь склад
                    </div>

                    {/* Блок шагов */}
                    <div className="relative flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 w-full max-w-[900px] mx-auto mt-4 pb-2">
                        {/* Соединяющая линия для desktop */}
                        <div
                            className="hidden md:block absolute left-[130px] right-[130px] top-[60%] h-[2px] bg-[#273655] z-0"
                            style={{ transform: "translateY(-50%)" }}
                        />

                        {/* Шаги */}
                        {[
                            {
                                title: "Заявка",
                                icon: FileCheckIcon,
                            },
                            {
                                title: "Упаковка",
                                icon: BoxTickIcon,
                            },
                            {
                                title: "Доставка",
                                icon: GroupIcon,
                            },
                            {
                                title: "Хранение",
                                icon: ShieldTickIcon,
                            },
                            {
                                title: "Возврат",
                                icon: GroupIcon,
                                flipped: true,
                            },
                        ].map((step, index) => (
                            <div
                                key={index}
                                className="flex flex-col items-center z-10 text-center"
                            >
                                <span className="text-[#000] text-[16px] md:text-[18px] mb-1">
                                    {step.title}
                                </span>
                                <div className="w-[56px] h-[56px] rounded-full bg-[#273655] flex items-center justify-center mt-1">
                                    <img
                                        src={step.icon}
                                        alt={step.title}
                                        className="w-[36px] h-[36px]"
                                        style={step.flipped ? { transform: "scaleX(-1)" } : {}}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <CostCalculator />
        </div>

    <Footer />
    </>
    );
};

export default CloudStorage;