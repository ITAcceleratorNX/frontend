import React from "react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"; // скорректируй путь под свой проект

export default function CloudDimensions({
                                            selectedTariff,
                                            cloudDimensions,
                                            setCloudDimensions,
                                            cloudVolumeDirect
                                        }) {
    return (
        <div className="space-y-4 mb-6">
            {selectedTariff?.isCustom ? (
                <>
                    {/* Ширина и Высота */}
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { key: 'width', label: 'Ширина', value: cloudDimensions.width },
                            { key: 'height', label: 'Высота', value: cloudDimensions.height }
                        ].map((dim) => (
                            <Select
                                key={dim.key}
                                value={String(dim.value)}
                                onValueChange={(value) => {
                                    setCloudDimensions(prev => ({
                                        ...prev,
                                        [dim.key]: parseFloat(value)
                                    }));
                                }}
                            >
                                <SelectTrigger className="w-full min-w-[155px] h-auto min-h-[74px] text-base border border-gray-200 rounded-2xl bg-white flex flex-col items-start justify-center p-3 px-4 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500">
                                    <span className="text-xs text-gray-500 mb-0.5">{dim.label}</span>
                                    <SelectValue className="text-[#373737] text-base">{String(dim.value)} м</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                                        <SelectItem key={val} value={String(val)}>{val} м</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        ))}
                    </div>

                    {/* Длина */}
                    <Select
                        value={String(cloudDimensions.length)}
                        onValueChange={(value) => {
                            setCloudDimensions(prev => ({
                                ...prev,
                                length: parseFloat(value)
                            }));
                        }}
                    >
                        <SelectTrigger className="w-full h-auto min-h-[60px] text-base border border-gray-200 rounded-2xl bg-white flex flex-col items-start justify-center p-3 px-4 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500">
                            <span className="text-xs text-gray-500 mb-0.5">Длина</span>
                            <SelectValue className="text-[#373737] text-base">{String(cloudDimensions.length)} м</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map((val) => (
                                <SelectItem key={val} value={String(val)}>{val} м</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </>
            ) : selectedTariff ? (
                // Режим тарифа — показываем фиксированный объем
                <div className="bg-[#E0F2FE] rounded-2xl p-6 border-2 border-[#00A991]/20">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[#273655]">Тариф:</span>
                        <span className="text-base font-semibold text-[#31876D]">{selectedTariff.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[#273655]">Фиксированный объем:</span>
                        <span className="text-lg font-bold text-[#31876D]">
              {selectedTariff.baseVolume ?? selectedTariff.maxVolume ?? cloudVolumeDirect} м³
            </span>
                    </div>
                    <p className="text-xs text-[#6B6B6B] mt-3 italic">
                        Объем для данного тарифа фиксирован и не может быть изменен
                    </p>
                </div>
            ) : (
                // Тариф не выбран — подсказка
                <p className="text-sm text-[#6B6B6B]">
                    Выберите тариф или режим "Свои габариты" для начала расчета
                </p>
            )}
        </div>
    );
}