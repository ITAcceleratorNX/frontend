import { useState } from "react";
import Volume3Image from "../assets/Frame 50.png";
import Volume5Image from "../assets/Frame 49.png";
import Volume10Image from "../assets/Frame 48.png";

const MiniVolumeSelector = ({ onVolumeChange, selectedVolume = 3 }) => {
  const volumes = [
    { value: 3, image: Volume3Image },
    { value: 5, image: Volume5Image },
    { value: 10, image: Volume10Image }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-[#273655] mb-2">
          Выберите объем для хранения
        </h3>
        <p className="text-sm text-gray-600">
          Выберите подходящий объем для ваших вещей
        </p>
      </div>
      
      <div className="flex gap-48 items-center">
        {/* Изображение слева */}
        <div className="w-96 h-96 bg-gray-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <img
            src={volumes.find(v => v.value === selectedVolume)?.image}
            alt={`${selectedVolume} м³`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
        
        {/* Кнопки выбора справа */}
        <div className="flex flex-col gap-16">
          {volumes.map((volume) => (
            <button
              key={volume.value}
              onClick={() => onVolumeChange(volume.value)}
              className={`w-72 h-12 rounded-lg border-2 transition-colors flex items-center justify-center ${
                selectedVolume === volume.value
                  ? "bg-[#273655] text-white border-[#273655]"
                  : "bg-white text-[#273655] border-[#273655] hover:bg-gray-50"
              }`}
            >
              <span className="font-medium text-lg">{volume.value} м³</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MiniVolumeSelector;
