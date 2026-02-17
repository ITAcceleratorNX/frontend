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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-16 md:gap-y-8 lg:gap-x-16 lg:gap-y-8 items-center">

            {/* image — адаптировано для планшетов (768, 820, 912, 1024) */}
            <div
                className={`w-full max-w-full md:max-w-[380px] lg:max-w-[420px] xl:max-w-lg aspect-[4/3] overflow-hidden rounded-xl md:rounded-2xl mx-auto md:mx-0 ${
                    reverse ? "md:order-1 md:ml-8 lg:ml-16 xl:ml-24" : "md:ml-8 lg:ml-16 xl:ml-24"
                }`}
            >
                <img src={image} alt={title} className="w-full h-full object-cover object-center" />
            </div>

            {/* text */}
            <div className={reverse ? "md:order-2" : ""}>
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-[#202422] mb-4">
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
        <section className="w-full bg-white py-10 sm:py-14 md:py-16 lg:py-20">
            <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-8">

                <h2 className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[#202422] font-bold text-center mb-4">
                    форматы хранения
                </h2>

                <p className="text-[#5C625F] text-sm sm:text-base text-center max-w-2xl mx-auto mb-10 sm:mb-12 md:mb-14 lg:mb-16">
                    Выберите подходящий формат хранения — отдельный бокс или индивидуальную полку. Платите только за нужный объём и пользуйтесь безопасным доступом 24/7.
                </p>

                {/* Индивидуальное */}
                <div className="mb-12 md:mb-16 lg:mb-20">
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