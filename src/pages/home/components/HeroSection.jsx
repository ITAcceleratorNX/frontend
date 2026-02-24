import React from "react";
import { ChevronRight, Gift } from "lucide-react";
import heroVideo from "@/video/extraspace.mp4";

export default function HeroSection({ handleHeroBookingClick }) {
    return (
        <div className="flex-1 relative overflow-hidden -mt-16 pt-16 min-h-[100vh] flex flex-col">
            <video
                src={heroVideo}
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" aria-hidden />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 lg:pt-8 pb-8 sm:pb-12 lg:pb-16 relative z-10 flex-1 flex flex-col min-h-0">
                <section className="grid grid-cols-1 grid-rows-[1fr_auto] flex-1 min-h-0 items-center text-center">
                    <div className="flex flex-col items-center justify-start">
                        <h1 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                            храните там, где удобно
                        </h1>
                        <h2 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 sm:mb-8">
                            и безопасно
                        </h2>
                        <div className="text-sm sm:text-base text-white leading-relaxed max-w-2xl">
                            <p className="mb-1">Боксы от 2 до 50 м² по специальной цене при аренде от 3 месяцев.</p>
                            <p className="flex flex-wrap items-center justify-center">
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E0F2F1] font-normal text-sm sm:text-base rounded-xl">
                                    <Gift size={18} strokeWidth={2} className="text-[#00897B] shrink-0" />
                                    <span className="text-[#00897B]">Хранение за м² от 5 990 ₸</span>
                                </span>
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col items-center mb-8 sm:mb-12">
                        <button
                            onClick={handleHeroBookingClick}
                            className="flex items-center gap-2 bg-[#31876D] hover:bg-[#2a7260] text-white font-medium px-6 py-3 rounded-full text-sm sm:text-base transition-colors duration-300"
                        >
                            <span>Забронировать</span>
                            <ChevronRight size={16} strokeWidth={2.5} />
                        </button>
                    </div>
                </section>
            </div>
        </div>
    );
}