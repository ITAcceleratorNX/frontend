import React, { useState } from "react";
import { Box, FileText, CreditCard, Truck, Play } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui";
import arendaBoksaVideo from "@/video/arenda_boksa.mp4";

const steps = [
    {
        Icon: Box,
        title: "Забронируйте бокс",
        text: "Выберите подходящий размер бокса и забронируйте его онлайн за пару минут без визита в офис.",
    },
    {
        Icon: FileText,
        title: "Подпишите договор по СМС",
        text: "Подтвердите договор прямо с телефона — код придёт по СМС, никаких бумаг и встреч.",
    },
    {
        Icon: CreditCard,
        title: "Оплатите онлайн или по СМС",
        text: "Оплатите хранение удобным способом: картой онлайн или подтверждением через СМС.",
    },
    {
        Icon: Truck,
        title: "Назначьте доставку",
        text: "Укажите удобное время, и мы организуем доставку ваших вещей до бокса.",
    },
];

function StepCard({ Icon, title, text }) {
    return (
        <div className="flex flex-col items-center text-center min-w-0 relative z-10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 flex-shrink-0 rounded-full bg-[#F7F8FA] flex items-center justify-center mb-3 relative z-10">
                <Icon size={22} className="text-[#31876D] sm:w-7 sm:h-7" strokeWidth={1.5} />
            </div>
            <h3 className="font-bold text-[#202422] text-sm sm:text-base mb-1.5">
                {title}
            </h3>
            <p className="text-[#5C625F] text-xs font-normal leading-relaxed">
                {text}
            </p>
        </div>
    );
}

function VideoModal({ open, onOpenChange, videoSrc }) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[100vw] w-[100vw] sm:w-auto sm:max-w-[95vw] !h-[95vh] sm:!h-auto sm:!min-h-0 p-0 gap-0 overflow-hidden bg-transparent sm:bg-transparent border-0 shadow-none rounded-none [&>button]:text-white [&>button]:hover:text-white [&>button]:sm:bg-black/50 [&>button]:sm:rounded-full">
                <div className="relative w-full h-full min-h-[85vh] sm:min-h-0 sm:flex sm:items-center sm:justify-center">
                    <video
                        src={videoSrc}
                        controls
                        className="block w-full h-full sm:w-auto sm:h-auto sm:max-h-[90vh] sm:max-w-full object-contain"
                        autoPlay
                        playsInline
                    >
                        Ваш браузер не поддерживает воспроизведение видео.
                    </video>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default function QuickBookingSection() {
    const [isVideoOpen, setIsVideoOpen] = useState(false);
    return (
        <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                <h2 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-bold text-center mb-8 sm:mb-10">
                    быстрое бронирование
                </h2>

                {/* четыре шага в один ряд */}
                <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 w-full max-w-6xl mx-auto mb-10 sm:mb-12 lg:before:content-[''] lg:before:absolute lg:before:left-[12.5%] lg:before:w-[75%] lg:before:top-7 lg:before:h-[2px] lg:before:bg-[#31876D] lg:before:opacity-60 lg:before:z-0">
                    {steps.map((step, i) => (
                        <StepCard key={i} {...step} />
                    ))}
                </div>

                {/* кнопка Смотреть видео по центру */}
                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => setIsVideoOpen(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 bg-white border-2 border-[#31876D] text-[#31876D] text-sm sm:text-base font-medium rounded-lg hover:bg-[#F7F8FA] focus:outline-none focus:ring-2 focus:ring-[#31876D] focus:ring-offset-2 touch-manipulation"
                    >
                        <Play size={18} className="flex-shrink-0" fill="currentColor" />
                        Смотреть инструкцию
                    </button>
                </div>

                <VideoModal
                    open={isVideoOpen}
                    onOpenChange={setIsVideoOpen}
                    videoSrc={arendaBoksaVideo}
                />
            </div>
        </section>
    );
}