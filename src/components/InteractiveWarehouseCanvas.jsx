import React, { useEffect, useRef, useState, memo } from "react";
import { Stage, Layer, Rect, Text, Image } from "react-konva";
import backgroundImage from "../assets/INDIVIDUAL.png";
import lockIcon from "../assets/lock.png";
import warehouseLayoutData from "../assets/warehouseLayout.json";

const InteractiveWarehouseCanvas = memo(({ storageBoxes, onBoxSelect, selectedStorage }) => {
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [lockImg, setLockImg] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Загрузка фонового изображения
  useEffect(() => {
    const img = new window.Image();
    img.src = backgroundImage;
    img.onload = () => {
      setBackgroundImg(img);
    };
  }, []);

  // Загрузка иконки замка
  useEffect(() => {
    const img = new window.Image();
    img.src = lockIcon;
    img.onload = () => {
      setLockImg(img);
    };
  }, []);

  // Функция получения статуса бокса по имени
  const getBoxStatus = (boxName) => {
    const box = storageBoxes.find(storage => 
      storage.name === boxName && storage.storage_type === 'INDIVIDUAL'
    );
    return box ? box.status : 'OCCUPIED'; // По умолчанию считаем занятым, если не найден
  };

  // Функция получения данных бокса по имени
  const getBoxData = (boxName) => {
    return storageBoxes.find(storage => 
      storage.name === boxName && storage.storage_type === 'INDIVIDUAL'
    );
  };

  // Обработчик клика по боксу
  const handleBoxClick = (boxName) => {
    const boxData = getBoxData(boxName);
    const status = getBoxStatus(boxName);
    
    if (status === 'VACANT' && boxData) {
      onBoxSelect(boxData);
      if (import.meta.env.DEV) {
        console.log('Выбран бокс:', boxData);
      }
    } else {
      if (import.meta.env.DEV) {
        console.log('Бокс недоступен:', boxName, status);
      }
    }
  };

  // Обработчики для hover эффектов
  const handleMouseEnter = (boxName) => {
    const status = getBoxStatus(boxName);
    if (status === 'VACANT') {
      setHoveredId(boxName);
    }
  };

  const handleMouseLeave = () => {
    setHoveredId(null);
  };

  return (
    <div className="flex flex-col items-center">
      <Stage width={615} height={1195}>
        <Layer>
          {/* Фоновое изображение */}
          {backgroundImg && (
            <Image
              image={backgroundImg}
              x={0}
              y={0}
              width={613}
              height={1191}
              listening={false}
            />
          )}
          
          {warehouseLayoutData.map((box) => {
            const status = getBoxStatus(box.name);
            const isSelected = selectedStorage?.name === box.name;
            const isHovered = hoveredId === box.name;
            const boxData = getBoxData(box.name);
            
            return (
              <React.Fragment key={box.name}>
                <Rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  fill={
                    isSelected
                      ? "rgba(39, 54, 85, 0.7)" // Темно-синий для выбранного
                      : isHovered && status === 'VACANT'
                      ? "rgba(254, 243, 178, 0.9)" // Более яркий жёлтый при hover
                      : status === 'VACANT'
                      ? "#fef3b2" // Жёлтый для свободных
                      : "rgba(200, 200, 200, 0.8)" // Серый для занятых
                  }
                  stroke={
                    isSelected
                      ? "#273655"
                      : status === 'VACANT'
                      ? "#f59e0b" // Оранжевая граница для свободных
                      : "#6b7280" // Серая граница для занятых
                  }
                  strokeWidth={isSelected ? 3 : 1}
                  cornerRadius={4}
                  onClick={() => handleBoxClick(box.name)}
                  onMouseEnter={() => handleMouseEnter(box.name)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    cursor: status === 'VACANT' ? 'pointer' : 'not-allowed'
                  }}
                />
                
                {/* Иконка замка для занятых боксов */}
                {status === 'OCCUPIED' && lockImg && (
                  <Image
                    image={lockImg}
                    x={box.x + box.width / 2 - 12}
                    y={box.y + box.height / 2 - 12}
                    width={24}
                    height={24}
                    listening={false}
                  />
                )}
                
                {/* Название бокса */}
                <Text
                  text={box.name}
                  x={box.x + box.width / 2}
                  y={status === 'OCCUPIED' ? box.y + box.height / 2 + 20 : box.y + box.height / 2}
                  fontSize={12}
                  fontFamily="Montserrat, sans-serif"
                  fontStyle="bold"
                  fill={
                    isSelected
                      ? "#ffffff"
                      : status === 'VACANT'
                      ? "#92400e" // Темно-желтый текст для свободных
                      : "#6b7280" // Серый текст для занятых
                  }
                  align="center"
                  verticalAlign="middle"
                  offsetX={0}
                  offsetY={6}
                  listening={false}
                />
                
                {/* Информация о доступном объеме для свободных боксов */}
                {status === 'VACANT' && boxData && (
                  <Text
                    text={`${boxData.available_volume} м³`}
                    x={box.x + box.width / 2}
                    y={box.y + box.height / 2 + 15}
                    fontSize={10}
                    fontFamily="Montserrat, sans-serif"
                    fill={isSelected ? "#ffffff" : "#92400e"}
                    align="center"
                    verticalAlign="middle"
                    offsetX={0}
                    offsetY={5}
                    listening={false}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>

      {/* Информация о выбранном боксе */}
      {selectedStorage && (
        <div className="mt-6 bg-white border border-gray-200 rounded-lg p-4 max-w-md">
          <h4 className="text-lg font-bold text-[#273655] mb-2">
            Выбранный бокс: {selectedStorage.name}
          </h4>
          <div className="space-y-1 text-sm text-[#6B6B6B]">
            <p>Общий объем: <span className="font-medium text-[#273655]">{selectedStorage.total_volume} м³</span></p>
            <p>Доступно: <span className="font-medium text-[#273655]">{selectedStorage.available_volume} м³</span></p>
            <p>Высота: <span className="font-medium text-[#273655]">{selectedStorage.height} м</span></p>
            <p className="text-[#273655] font-medium">{selectedStorage.description}</p>
          </div>
        </div>
      )}

      {/* Легенда */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-md">
        <h5 className="font-bold text-[#273655] mb-3">Обозначения:</h5>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#fef3b2] border border-[#f59e0b] rounded"></div>
            <span className="text-[#6B6B6B]">Свободный бокс</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-gray-300 border border-gray-400 rounded flex items-center justify-center">
              🔒
            </div>
            <span className="text-[#6B6B6B]">Занятый бокс</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-[#273655] border-2 border-[#273655] rounded"></div>
            <span className="text-[#6B6B6B]">Выбранный бокс</span>
          </div>
        </div>
      </div>
    </div>
  );
});

InteractiveWarehouseCanvas.displayName = 'InteractiveWarehouseCanvas';

export default InteractiveWarehouseCanvas; 