import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Volume3Image from "../assets/Frame 50.png";
import Volume5Image from "../assets/Frame 49.png";
import Volume10Image from "../assets/Frame 48.png";

const VolumeSelector = () => {
  const [selectedVolume, setSelectedVolume] = useState(3);
  const navigate = useNavigate();

  const descriptions = {
    3: {
      text: [
        "Такой объём подходит для хранения части мебели и бытовой техники из небольшой комнаты.",
        "Примерно столько занимает багаж из однокомнатной квартиры при переезде.",
        "Когда нужно спрятать всё лишнее, но пока не расставаться.",
      ],
      boxes: "Вмещает до 15 коробок или 3 предметов мебели",
      examples:
        "Матрас, стиральная машина, пылесос, тумбочка, чемодан и несколько коробок",
      image: Volume3Image,
    },
    5: {
      text: [
        "Подходит для хранения мебели из 1–2 комнат.",
        "Можно поместить холодильник, диван и десятки коробок.",
        "Идеально для ремонта или долгосрочного хранения.",
      ],
      boxes: "Вмещает до 25 коробок или 5 предметов мебели",
      examples: "Диван, шкаф, стиральная машина, стулья, коробки",
      image: Volume5Image,
    },
    10: {
      text: [
        "Достаточно для мебели из 2–3 комнат.",
        "Помещается бытовая техника, шкафы, диваны и коробки.",
        "Используется при полном переезде.",
      ],
      boxes: "Вмещает до 50 коробок или 10 предметов мебели",
      examples:
        "2 дивана, шкаф, кровать, холодильник, стиральная машина, столы",
      image: Volume10Image,
    },
  };

  return (
    <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row items-start gap-10 p-6">
      {/* Левая колонка */}
      <div className="w-full md:basis-3/5 flex justify-center">
        <div className="relative w-full h-[360px] p-6 bg-white border border-gray-200 rounded-xl shadow-sm flex items-center justify-center">
          <img
            src={descriptions[selectedVolume].image}
            alt={`${selectedVolume} м³`}
            className="max-h-full max-w-full object-contain"
          />
        </div>
      </div>

      {/* Правая колонка */}
      <div className="w-full md:basis-2/5 flex flex-col justify-start">
        <div className="flex gap-4 mb-6 flex-wrap justify-center md:justify-start">
          {[3, 5, 10].map((volume) => (
            <button
              key={volume}
              onClick={() => setSelectedVolume(volume)}
              className={`w-[110px] h-[44px] rounded-[15px] text-[16px] font-medium border-2 transition-colors ${
                selectedVolume === volume
                  ? "bg-[#273655] text-white border-[#273655]"
                  : "bg-white text-[#273655] border-[#273655] hover:bg-[#f5f6fa]"
              }`}
            >
              {volume} м³
            </button>
          ))}
        </div>

        <div className="mb-6 text-[15px] leading-relaxed">
          {descriptions[selectedVolume].text.map((line, i) => (
            <p key={i} className="text-[#8a8a8a] font-medium mb-2">
              {line}
            </p>
          ))}
          <p className="text-[#273655] text-[14px] font-medium mb-1">
            {descriptions[selectedVolume].boxes}
          </p>
          <p className="text-[#273655] text-[14px] font-medium">
            – {descriptions[selectedVolume].examples}
          </p>
        </div>

        <button
          onClick={() => navigate("/warehouse-order")}
          className="w-full sm:w-[165px] h-[44px] bg-[#273655] text-white text-[16px] font-medium rounded-[20px] hover:bg-[#1e2940] transition-colors"
        >
          Подробнее
        </button>
      </div>
    </div>
  );
};

export default VolumeSelector;