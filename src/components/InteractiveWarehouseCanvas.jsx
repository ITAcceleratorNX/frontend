import React, { useEffect, useRef, useState, memo } from "react";
import { Stage, Layer, Rect, Text, Image } from "react-konva";
import backgroundImage from "../assets/INDIVIDUAL.png";
import lockIcon from "../assets/lock.png";
import warehouseLayoutData from "../assets/warehouseLayout.json";

const InteractiveWarehouseCanvas = memo(({ storageBoxes, onBoxSelect, selectedStorage }) => {
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [lockImg, setLockImg] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Отладочная информация для проверки данных
  useEffect(() => {
    if (import.meta.env.DEV && storageBoxes?.length > 0) {
      console.log('InteractiveWarehouseCanvas: Данные боксов с API:', storageBoxes);
      console.log('InteractiveWarehouseCanvas: Боксы со статусом OCCUPIED:', 
        storageBoxes.filter(s => s.status === 'OCCUPIED').map(s => ({ name: s.name, status: s.status }))
      );
      console.log('InteractiveWarehouseCanvas: Боксы со статусом VACANT:', 
        storageBoxes.filter(s => s.status === 'VACANT').map(s => ({ name: s.name, status: s.status }))
      );
    }
  }, [storageBoxes]);

  // Отладочная информация для схемы складов
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('InteractiveWarehouseCanvas: Все боксы в схеме:', 
        warehouseLayoutData.map(box => box.name)
      );
    }
  }, []);

  // Загрузка фонового изображения
  useEffect(() => {
    const img = new window.Image();
    img.src = backgroundImage;
    img.onload = () => {
      setBackgroundImg(img);
      if (import.meta.env.DEV) {
        console.log('InteractiveWarehouseCanvas: Фоновое изображение загружено');
      }
    };
    img.onerror = () => {
      console.error('InteractiveWarehouseCanvas: Ошибка загрузки фонового изображения');
    };
  }, []);

  // Загрузка иконки замка
  useEffect(() => {
    const img = new window.Image();
    img.src = lockIcon;
    img.onload = () => {
      setLockImg(img);
      if (import.meta.env.DEV) {
        console.log('InteractiveWarehouseCanvas: Иконка замка загружена');
      }
    };
    img.onerror = () => {
      console.error('InteractiveWarehouseCanvas: Ошибка загрузки иконки замка');
    };
  }, []);

  // Функция получения статуса бокса по имени (учитывает разный регистр)
  const getBoxStatus = (boxName) => {
    const box = storageBoxes.find(storage => 
      storage.name.toLowerCase() === boxName.toLowerCase() && storage.storage_type === 'INDIVIDUAL'
    );
    
    // Если бокс найден в API данных, используем его статус
    // Если не найден, считаем его занятым (OCCUPIED)
    const status = box ? box.status : 'OCCUPIED';
    
    // Отладочная информация
    if (import.meta.env.DEV) {
      console.log(`Бокс "${boxName}": найден=${!!box}, статус=${status}`);
    }
    
    return status;
  };

  // Функция получения данных бокса по имени (учитывает разный регистр)
  const getBoxData = (boxName) => {
    return storageBoxes.find(storage => 
      storage.name.toLowerCase() === boxName.toLowerCase() && storage.storage_type === 'INDIVIDUAL'
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
            const isHovered = hoveredId === box.name;
            const boxData = getBoxData(box.name);
            
            // Отладочная информация для каждого бокса
            if (import.meta.env.DEV && status === 'OCCUPIED') {
              console.log(`Рендеринг занятого бокса: ${box.name}, lockImg загружен: ${!!lockImg}`);
            }
            
            return (
              <React.Fragment key={box.name}>
                <Rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  fill={
                    isHovered && status === 'VACANT'
                      ? "rgba(254, 243, 178, 0.9)" // Более яркий жёлтый при hover
                      : status === 'VACANT'
                      ? "#fef3b2" // Жёлтый для свободных
                      : "rgba(200, 200, 200, 0.8)" // Серый для занятых
                  }
                  stroke={
                    status === 'VACANT'
                      ? "#f59e0b" // Оранжевая граница для свободных
                      : "#6b7280" // Серая граница для занятых
                  }
                  strokeWidth={1}
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
                
                {/* Название бокса - строго по центру */}
                <Text
                  text={box.name}
                  x={box.x}
                  y={status === 'OCCUPIED' ? box.y + box.height / 2 + 20 : box.y + box.height / 2}
                  width={box.width}
                  fontSize={12}
                  fontFamily="Montserrat, sans-serif"
                  fontStyle="bold"
                  fill={
                    status === 'VACANT'
                      ? "#92400e" // Темно-желтый текст для свободных
                      : "#6b7280" // Серый текст для занятых
                  }
                  align="center"
                  verticalAlign="middle"
                  offsetY={6}
                  listening={false}
                />
                
                {/* Информация о доступном объеме при hover */}
                {isHovered && status === 'VACANT' && boxData && (
                  <Text
                    text={`${boxData.available_volume} м³`}
                    x={box.x}
                    y={box.y + box.height / 2 + 15}
                    width={box.width}
                    fontSize={10}
                    fontFamily="Montserrat, sans-serif"
                    fill="#92400e"
                    align="center"
                    verticalAlign="middle"
                    offsetY={5}
                    listening={false}
                  />
                )}
              </React.Fragment>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
});

InteractiveWarehouseCanvas.displayName = 'InteractiveWarehouseCanvas';

export default InteractiveWarehouseCanvas; 