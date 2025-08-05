import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Volume3Image from "../assets/Frame 48.png";
import Volume5Image from "../assets/Frame 49.png";
import Volume10Image from "../assets/Frame 50.png";

const VolumeSelector = () => {
    const [selectedVolume, setSelectedVolume] = useState(3);
    const navigate = useNavigate();

    const descriptions = {
        3: {
            text: [
                "Такой объём подходит для хранения части мебели и бытовой техники из небольшой комнаты.",
                "Примерно столько занимает багаж из однокомнатной квартиры при переезде.",
                "Когда нужно спрятать всё лишнее, но пока не расставаться."
            ],
            boxes: "Вмещает до 15 коробок или 3 предметов мебели",
            examples: "Матрас, стиральная машина, пылесос, тумбочка, чемодан и несколько коробок",
            image: Volume3Image,
        },
        5: {
            text: [
                "Подходит для хранения мебели из 1–2 комнат.",
                "Можно поместить холодильник, диван и десятки коробок.",
                "Идеально для ремонта или долгосрочного хранения."
            ],
            boxes: "Вмещает до 25 коробок или 5 предметов мебели",
            examples: "Диван, шкаф, стиральная машина, стулья, коробки",
            image: Volume5Image,
        },
        10: {
            text: [
                "Достаточно для мебели из 2–3 комнат.",
                "Помещается бытовая техника, шкафы, диваны и коробки.",
                "Используется при полном переезде."
            ],
            boxes: "Вмещает до 50 коробок или 10 предметов мебели",
            examples: "2 дивана, шкаф, кровать, холодильник, стиральная машина, столы",
            image: Volume10Image,
        }
    };

    return (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 p-4 sm:p-6">
            {/* Картинка */}
            <div className="w-full md:w-1/2 flex justify-center">
                <img
                    src={descriptions[selectedVolume].image}
                    alt={`${selectedVolume} м³`}
                    className="max-w-full md:max-w-[400px] rounded-xl shadow-md transition-all duration-300"
                />
            </div>

            {/* Описание и кнопки */}
            <div className="w-full md:w-1/2 flex flex-col justify-start">
                <div className="flex gap-3 sm:gap-4 mb-6 flex-wrap justify-center md:justify-start">
                    {[3, 5, 10].map((volume) => (
                        <button
                            key={volume}
                            onClick={() => setSelectedVolume(volume)}
                            className={`px-5 py-2 sm:px-6 sm:py-3 rounded-[15px] text-[14px] sm:text-[16px] font-medium border-2 ${
                                selectedVolume === volume
                                    ? "bg-[#273655] text-white border-[#273655]"
                                    : "bg-white text-[#273655] border-[#273655]"
                            }`}
                        >
                            {volume} м³
                        </button>
                    ))}
                </div>

                <div className="mb-6 text-[14px] sm:text-[16px] leading-snug">
                    {descriptions[selectedVolume].text.map((line, index) => (
                        <p key={index} className="text-[#A3A3A3] font-medium mb-2">
                            {line}
                        </p>
                    ))}
                    <p className="text-[#273655] text-[13px] sm:text-[14px] font-medium mb-1">
                        {descriptions[selectedVolume].boxes}
                    </p>
                    <p className="text-[#273655] text-[13px] sm:text-[14px] font-medium">
                        – {descriptions[selectedVolume].examples}
                    </p>
                </div>

                <div className="flex justify-center md:justify-start">
                    <button
                        onClick={() => navigate("/warehouse-order")}
                        className="mt-2 sm:mt-4 w-full sm:w-[165px] h-[40px] bg-[#273655] text-white text-[14px] sm:text-[16px] font-medium rounded-[20px] flex items-center justify-center gap-2 hover:bg-[#1e2940] transition-colors"
                    >
                        Подробнее
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VolumeSelector;
