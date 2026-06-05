import React from "react";
import { FormSelect } from "@/shared/ui/FormSelect.jsx";

const DIMENSION_OPTIONS = Array.from({ length: 10 }, (_, i) => ({
  value: String(i + 1),
  label: `${i + 1} м`,
}));

const DIMENSION_TRIGGER_CLASS =
  "w-full min-w-[155px] h-auto min-h-[74px] text-base border border-gray-200 rounded-2xl bg-white flex flex-col items-start justify-center p-3 px-4 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500";

const LENGTH_TRIGGER_CLASS =
  "w-full h-auto min-h-[60px] text-base border border-gray-200 rounded-2xl bg-white flex flex-col items-start justify-center p-3 px-4 [&>svg]:absolute [&>svg]:right-3 [&>svg]:top-1/2 [&>svg]:-translate-y-1/2 [&>svg]:text-gray-500";

export default function CloudDimensions({
  selectedTariff,
  cloudDimensions,
  setCloudDimensions,
  cloudVolumeDirect,
}) {
  return (
    <div className="space-y-4 mb-6">
      {selectedTariff?.isCustom ? (
        <>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: "width", label: "Ширина", value: cloudDimensions.width },
              { key: "height", label: "Высота", value: cloudDimensions.height },
            ].map((dim) => (
              <FormSelect
                key={dim.key}
                value={String(dim.value)}
                onChange={(value) => {
                  setCloudDimensions((prev) => ({
                    ...prev,
                    [dim.key]: parseFloat(value),
                  }));
                }}
                options={DIMENSION_OPTIONS}
                triggerStart={
                  <span className="text-xs text-gray-500 mb-0.5">{dim.label}</span>
                }
                triggerClassName={DIMENSION_TRIGGER_CLASS}
              />
            ))}
          </div>

          <FormSelect
            value={String(cloudDimensions.length)}
            onChange={(value) => {
              setCloudDimensions((prev) => ({
                ...prev,
                length: parseFloat(value),
              }));
            }}
            options={DIMENSION_OPTIONS}
            triggerStart={<span className="text-xs text-gray-500 mb-0.5">Длина</span>}
            triggerClassName={LENGTH_TRIGGER_CLASS}
          />
        </>
      ) : selectedTariff ? (
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
        <p className="text-sm text-[#6B6B6B]">
          Выберите тариф или режим "Свои габариты" для начала расчета
        </p>
      )}
    </div>
  );
}
