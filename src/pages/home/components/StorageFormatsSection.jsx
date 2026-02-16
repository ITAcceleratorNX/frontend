import React from "react";
import { ChevronRight } from "lucide-react";
import indiImg from "../../../assets/indi.png";
import oblachImg from "../../../assets/oblach.png";


function FormatBlock({
                         title,
                         text,
                         features,
                         image,
                         reverse = false,
                         onMore,
                     }) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-center">

            {/* image */}
            <div
                className={`w-full max-w-lg aspect-[4/3] overflow-hidden rounded-2xl mx-auto lg:mx-0 ${
                    reverse ? "lg:order-1 lg:ml-24" : "lg:ml-24"
                }`}
            >
                <img src={image} alt={title} className="w-full h-full object-cover" />
            </div>

            {/* text */}
            <div className={reverse ? "lg:order-2" : ""}>
                <h3 className="text-2xl sm:text-3xl font-bold text-[#202422] mb-4">
                    {title}
                </h3>

                <p className="text-[#5C625F] text-sm sm:text-base mb-4">{text}</p>

                <ul className="space-y-2 mb-6">
                    {features.map((f, i) => (
                        <li key={i} className="flex items-center gap-2 text-[#5C625F] text-sm sm:text-base">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#202422] flex-shrink-0"></span>
                            {f}
                        </li>
                    ))}
                </ul>

                <button
                    onClick={onMore}
                    className="inline-flex items-center gap-2 text-[#31876D] font-medium hover:opacity-80 transition-opacity"
                >
                    <span>Подробнее</span>
                    <ChevronRight size={18} />
                </button>
            </div>
        </div>
    );
}

export default function StorageFormatsSection({ onMore }) {
    return (
        <section className="w-full bg-white py-12 sm:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">

                <h2 className="font-sf-pro-text text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-normal text-center mb-4">
                    форматы хранения
                </h2>

                <p className="text-[#5C625F] text-sm sm:text-base text-center max-w-2xl mx-auto mb-12 sm:mb-16">
                    Выберите подходящий формат хранения — отдельный бокс или индивидуальную полку. Платите только за нужный объём и пользуйтесь безопасным доступом 24/7.
                </p>

                {/* Индивидуальное */}
                <div className="mb-16 lg:mb-20">
                    <FormatBlock
                        title="Индивидуальное хранение"
                        text="Ваш личный закрытый бокс. Только вы имеете доступ — как мини-склад под ключ."
                        features={[
                            "Полная приватность",
                            "Круглосуточный доступ",
                        ]}
                        image={indiImg}
                        reverse
                        onMore={onMore}
                    />
                </div>

                {/* Облачное */}
                <FormatBlock
                    title="Облачное хранение"
                    text="Сдайте вещи без аренды бокса — мы разместим их на индивидуальной полке в охраняемом складе. Удобно, если вещей немного."
                    features={[
                        "Платите только за объём",
                        "Быстрая приёмка вещей",
                        "Упрощённый доступ",
                    ]}
                    image={oblachImg}
                    onMore={onMore}
                />

            </div>
        </section>
    );
}