import React from "react";
import { Box } from "lucide-react";

export default function CloudTariffs({
                                         customTariff,
                                         regularTariffs,
                                         selectedTariff,
                                         setSelectedTariff,
                                         tariffsPerView = 1,
                                         currentTariffIndex,
                                         maxTariffIndex,
                                         handleTariffPrev,
                                         handleTariffNext,
                                         setCloudDimensions,
                                         setCloudVolumeDirect
                                     }) {
    return (
        <div className="mb-8">
            {/* Заголовок и кнопки навигации */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl md:text-3xl font-bold text-[#273655]">
                    Тарифы:
                </h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleTariffPrev}
                        disabled={currentTariffIndex === 0}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                            currentTariffIndex === 0
                                ? "border-gray-300 text-gray-400 cursor-not-allowed bg-transparent"
                                : "border-[#31876D] text-[#31876D] hover:bg-[#31876D]/10 cursor-pointer bg-transparent"
                        }`}
                        aria-label="Предыдущий"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 8H4M4 8L8 4M4 8L8 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                    <button
                        onClick={handleTariffNext}
                        disabled={currentTariffIndex >= maxTariffIndex}
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all border-2 ${
                            currentTariffIndex >= maxTariffIndex
                                ? "border-gray-300 text-gray-400 cursor-not-allowed bg-transparent"
                                : "border-[#31876D] text-[#31876D] hover:bg-[#31876D]/10 cursor-pointer bg-transparent"
                        }`}
                        aria-label="Следующий"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4 8H12M12 8L8 4M12 8L8 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Карточки тарифов */}
            <div className="flex flex-col md:flex-row gap-4">
                {/* Статичная карточка "Свои габариты" */}
                <div
                    className="flex-shrink-0 px-2 w-full"
                    style={{ width: tariffsPerView === 1 ? "100%" : "calc(25% - 0.75rem)" }}
                >
                    <div
                        onClick={() => {
                            setSelectedTariff(customTariff);
                            setCloudDimensions({ width: 1, height: 1, length: 1 });
                        }}
                        className={`rounded-3xl p-4 md:p-6 flex flex-col items-center cursor-pointer transition-colors h-full ${
                            selectedTariff?.id === customTariff.id
                                ? "bg-[#B0E4DD] ring-4 ring-[#31876D]/30"
                                : "bg-[#B0E4DD] hover:bg-[#9dd9d0]"
                        }`}
                    >
                        <div className="w-full h-32 md:h-40 mb-4 flex items-center justify-center">
                            <Box className="w-24 h-24 md:w-28 md:h-28 text-[#04A68E]" strokeWidth={1.5} />
                        </div>
                        <p className="text-[#393939] text-center text-sm md:text-base font-medium leading-tight">
                            {customTariff.name}
                        </p>
                    </div>
                </div>

                {/* Карусель остальных тарифов */}
                <div className="relative overflow-hidden w-full md:flex-1 md:w-auto">
                    <div
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{
                            transform:
                                tariffsPerView === 1
                                    ? `translateX(-${currentTariffIndex * 100}%)`
                                    : `translateX(calc(-${currentTariffIndex * (100 / tariffsPerView)}% - ${currentTariffIndex * 16 / tariffsPerView}px))`,
                            gap: tariffsPerView === 1 ? "0" : "1rem"
                        }}
                    >
                        {regularTariffs.map((tariff) => (
                            <div
                                key={tariff.id}
                                className="flex-shrink-0 px-2"
                                style={{
                                    width:
                                        tariffsPerView === 1
                                            ? "100%"
                                            : `calc(${100 / tariffsPerView}% - ${
                                                tariffsPerView > 1 ? ((tariffsPerView - 1) * 16) / tariffsPerView : 0
                                            }px)`,
                                    boxSizing: "border-box"
                                }}
                            >
                                <div
                                    onClick={() => {
                                        setSelectedTariff(tariff);
                                        const tariffVolume = tariff.baseVolume ?? tariff.maxVolume ?? 1;
                                        setCloudVolumeDirect(tariffVolume);
                                    }}
                                    className={`rounded-3xl p-4 md:p-6 flex flex-col items-center cursor-pointer transition-colors h-full ${
                                        selectedTariff?.id === tariff.id
                                            ? "bg-[#31876D] ring-4 ring-[#31876D]/30"
                                            : "bg-[#04A68E] hover:bg-[#038a77]"
                                    }`}
                                >
                                    <div className="w-full h-32 md:h-40 mb-4 flex items-center justify-center">
                                        <img
                                            src={tariff.image}
                                            alt={tariff.name}
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    </div>
                                    <p className="text-[#B0E4DD] text-center text-sm md:text-base font-medium leading-tight">
                                        {tariff.name}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}