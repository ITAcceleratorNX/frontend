import React from "react";
import { Box, FileText, CreditCard, Truck } from "lucide-react";

const stepsTop = [
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
];

const lastStep = {
    Icon: Truck,
    title: "Назначьте доставку",
    text: "Укажите удобное время, и мы организуем забор и доставку ваших вещей до бокса.",
};

function StepCard({ Icon, title, text }) {
    return (
        <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F7F8FA] flex items-center justify-center mb-4">
                <Icon size={24} className="text-[#31876D]" strokeWidth={1.5} />
            </div>

            <h3 className="font-bold text-[#202422] text-base sm:text-lg mb-2">
                {title}
            </h3>

            <p className="text-[#5C625F] text-xs sm:text-sm font-normal leading-relaxed">
                {text}
            </p>
        </div>
    );
}

export default function QuickBookingSection() {
    return (
        <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                <h2 className="font-sf-pro-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-normal text-center mb-12 sm:mb-16">
                    быстрое бронирование
                </h2>

                <div className="flex flex-col items-center">

                    {/* первые 3 шага */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12 w-full max-w-5xl mb-10">
                        {stepsTop.map((step, i) => (
                            <StepCard key={i} {...step} />
                        ))}
                    </div>

                    {/* последний шаг */}
                    <div className="flex flex-col items-center text-center max-w-md">
                        <StepCard {...lastStep} />
                    </div>

                </div>
            </div>
        </section>
    );
}