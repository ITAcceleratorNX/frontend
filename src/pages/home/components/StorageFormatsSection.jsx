import React, { useState } from "react";
import { ChevronRight, Play } from "lucide-react";
import indiImg from "../../../assets/indi.png";
import oblachImg from "../../../assets/oblach.png";
import oblozhImg from "../../../assets/oblozh.png";
import indivHranVideo from "@/video/indiv_hran.mp4";
import { Dialog, DialogContent } from "@/components/ui";


function FormatBlock({
                         title,
                         text,
                         features,
                         image,
                         reverse = false,
                         onMore,
                         videoSrc,
                         videoPoster,
                     }) {
    const [isVideoOpen, setIsVideoOpen] = useState(false);

    const handleMoreClick = () => {
        if (videoSrc) {
            setIsVideoOpen(true);
        } else {
            onMore?.();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-x-16 md:gap-y-10 lg:gap-x-16 lg:gap-y-12 items-center py-4 md:py-6">

            {/* image или видео с кнопкой воспроизведения */}
            <div
                className={`relative w-full max-w-full md:max-w-[380px] lg:max-w-[420px] xl:max-w-lg aspect-[4/3] overflow-hidden rounded-2xl md:rounded-3xl mx-auto md:mx-0 cursor-pointer group ${
                    reverse ? "md:order-1 md:ml-8 lg:ml-16 xl:ml-24" : "md:ml-8 lg:ml-16 xl:ml-24"
                }`}
                onClick={videoSrc ? () => setIsVideoOpen(true) : undefined}
                role={videoSrc ? "button" : undefined}
                tabIndex={videoSrc ? 0 : undefined}
                onKeyDown={videoSrc ? (e) => e.key === "Enter" && setIsVideoOpen(true) : undefined}
            >
                {videoSrc ? (
                    <>
                        {videoPoster ? (
                            <img src={videoPoster} alt="" className="w-full h-full object-cover object-center" />
                        ) : (
                            <video
                                src={videoSrc}
                                muted
                                loop
                                playsInline
                                preload="auto"
                                className="w-full h-full object-cover object-center"
                                aria-hidden
                            />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:bg-white group-hover:scale-110 transition-transform">
                                <Play size={28} className="text-[#31876D] ml-1" fill="currentColor" />
                            </div>
                        </div>
                    </>
                ) : (
                    <img src={image} alt={title} className="w-full h-full object-cover object-center" />
                )}
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

                
            </div>

            {/* Video modal */}
            {videoSrc && (
                <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
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
            )}
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
                <div className="mb-12 md:mb-16 lg:mb-4">
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
                        videoSrc={indivHranVideo}
                        videoPoster={oblozhImg}
                    />
                </div>

                {/* Облачное
                <FormatBlock
                    title="Облачное хранение"
                    text="Сдайте вещи без аренды бокса — мы разместим их на индивидуальной полке в охраняемом складе. Удобно, если вещей немного."
                    features={[
                        "Платите только за объём",
                        "Быстрая приёмка вещей",
                        "Упрощённый доступ",
                    ]}
                    image={oblachImg}
                /> */}

            </div>
        </section>
    );
}