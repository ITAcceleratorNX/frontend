import React from "react";
import { ChevronRight } from "lucide-react";
import section1Img from "../../../assets/1section.png";

export default function HeroSection({ handleHeroBookingClick }) {
    return (
        <div className="flex-1 relative overflow-hidden bg-gradient-to-r bg-[#FFF] -mt-16 pt-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16 relative z-10">
                <section className="flex flex-col items-center text-center">
                    <h1 className="font-belcanto text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal text-[#202422] leading-tight mb-6 sm:mb-8">
                        храните там, где удобно
                    </h1>
                    <div className="text-sm sm:text-base text-[#5C625F] leading-relaxed mb-12 max-w-2xl mt-2">
                        <p className="mb-1">Склады от 1 до 100 м² с безопасным хранением и доступом 24/7.</p>
                        <p className="mb-1">Боксы от 2 до 50 м² по спец.цене при аренде от 3 месяцев.</p>
                        <p className="flex flex-wrap items-center justify-center gap-2">
                            <span>Хранение за м² от</span>
                            <span className="inline-flex px-2.5 py-0.5 bg-[#4F9A75] text-white font-normal text-sm sm:text-base rounded-2xl">
                  5 990 ₸
                </span>
                        </p>
                    </div>
                    <button
                        onClick={handleHeroBookingClick}
                        className="flex items-center gap-2 bg-[#31876D] hover:bg-[#2a7260] text-white font-medium px-6 py-3 rounded-full text-sm sm:text-base transition-colors duration-300 mb-8 sm:mb-8"
                    >
                        <span>Забронировать</span>
                        <ChevronRight size={16} strokeWidth={2.5} />
                    </button>
                    <img
                        src={section1Img}
                        alt="Extra Space — индивидуальное хранение"
                        className="w-full max-w-2xl sm:max-w-3xl lg:max-w-4xl h-auto object-contain"
                    />
                </section>
            </div>
        </div>
    );
}