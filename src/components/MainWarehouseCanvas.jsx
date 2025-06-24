import React, { useEffect, useRef, useState, memo } from "react";
import { Stage, Layer, Rect, Text, Image, Line } from "react-konva";
import backgroundImage from "../assets/Main_Individual.png";
import lockIcon from "../assets/lock.png";
import warehouseLayoutData from "../assets/Main_Individual_storage.json";

const MainWarehouseCanvas = memo(({ storageBoxes, onBoxSelect, selectedStorage }) => {
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [lockImg, setLockImg] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Отладочная информация для проверки данных с API
  useEffect(() => {
    if (import.meta.env.DEV && storageBoxes?.length > 0) {
      console.log('MainWarehouseCanvas: Данные боксов с API:', storageBoxes);
      console.log('MainWarehouseCanvas: Имена боксов INDIVIDUAL:', 
        storageBoxes.filter(s => s.storage_type === 'INDIVIDUAL').map(s => s.name)
      );
      console.log('MainWarehouseCanvas: Боксы со статусом OCCUPIED:', 
        storageBoxes.filter(s => s.status === 'OCCUPIED').map(s => ({ name: s.name, status: s.status }))
      );
      console.log('MainWarehouseCanvas: Боксы со статусом VACANT:', 
        storageBoxes.filter(s => s.status === 'VACANT').map(s => ({ name: s.name, status: s.status }))
      );
    }
  }, [storageBoxes]);

  // Отладочная информация для схемы складов
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('MainWarehouseCanvas: Все боксы в схеме:', 
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
        console.log('MainWarehouseCanvas: Фоновое изображение загружено');
      }
    };
    img.onerror = () => {
      console.error('MainWarehouseCanvas: Ошибка загрузки фонового изображения');
    };
  }, []);

  // Загрузка иконки замка
  useEffect(() => {
    const img = new window.Image();
    img.src = lockIcon;
    img.onload = () => {
      setLockImg(img);
      if (import.meta.env.DEV) {
        console.log('MainWarehouseCanvas: Иконка замка загружена');
      }
    };
    img.onerror = () => {
      console.error('MainWarehouseCanvas: Ошибка загрузки иконки замка');
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
    
    // Отладочная информация только в режиме разработки
    if (import.meta.env.DEV) {
      if (!box) {
        console.log(`MainWarehouseCanvas: Бокс "${boxName}" не найден в API данных. Доступные боксы:`, 
          storageBoxes.filter(s => s.storage_type === 'INDIVIDUAL').map(s => s.name)
        );
      }
      console.log(`MainWarehouseCanvas: Бокс "${boxName}": найден=${!!box}, статус=${status}`);
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

  // Функция для расчета центра произвольной формы
  const getPolygonCenter = (points) => {
    let x = 0, y = 0;
    for (let i = 0; i < points.length; i += 2) {
      x += points[i];
      y += points[i + 1];
    }
    return {
      x: x / (points.length / 2),
      y: y / (points.length / 2)
    };
  };

  return (
    <div className="flex flex-col items-center">
      <Stage width={1280} height={751}>
        <Layer>
          {/* Фоновое изображение */}
          {backgroundImg && (
            <Image
              image={backgroundImg}
              x={0}
              y={0}
              width={1280}
              height={751}
              listening={false}
            />
          )}
          
          {warehouseLayoutData.map((box) => {
            const status = getBoxStatus(box.name);
            const isHovered = hoveredId === box.name;
            const boxData = getBoxData(box.name);
            
            // Рассчитываем центр фигуры
            let centerX, centerY;
            if (box.type && box.points) {
              // Для произвольных форм рассчитываем центр полигона
              const center = getPolygonCenter(box.points);
              centerX = box.x + center.x * (box.scaleX || 1);
              centerY = box.y + center.y * (box.scaleY || 1);
            } else {
              // Для прямоугольных форм
              centerX = box.x + (box.width || 50) / 2;
              centerY = box.y + (box.height || 50) / 2;
            }
            
            // Отладочная информация для каждого бокса
            if (import.meta.env.DEV && status === 'OCCUPIED') {
              console.log(`MainWarehouseCanvas: Рендеринг занятого бокса: ${box.name}, lockImg загружен: ${!!lockImg}`);
            }
            
            return (
              <React.Fragment key={box.name}>
                {box.type && box.points ? (
                  // Произвольная форма (L-образная или полигональная)
                  <Line
                    x={box.x}
                    y={box.y}
                    points={box.points}
                    scaleX={box.scaleX || 1}
                    scaleY={box.scaleY || 1}
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
                    closed={true}
                    onClick={() => handleBoxClick(box.name)}
                    onMouseEnter={() => handleMouseEnter(box.name)}
                    onMouseLeave={handleMouseLeave}
                    listening={true}
                  />
                ) : (
                  // Прямоугольная форма
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
                    listening={true}
                  />
                )}
                
                {/* Иконка замка для занятых боксов */}
                {status === 'OCCUPIED' && lockImg && (
                  <Image
                    image={lockImg}
                    x={centerX - 12}
                    y={centerY - 12}
                    width={24}
                    height={24}
                    listening={false}
                  />
                )}
                
                {/* Название бокса - строго по центру */}
                <Text
                  text={box.name}
                  x={centerX}
                  y={status === 'OCCUPIED' ? centerY + 20 : centerY}
                  fontSize={14}
                  fontFamily="Montserrat, sans-serif"
                  fontStyle="bold"
                  fill={
                    status === 'VACANT'
                      ? "#92400e" // Темно-желтый текст для свободных
                      : "#6b7280" // Серый текст для занятых
                  }
                  align="center"
                  verticalAlign="middle"
                  offsetX={0}
                  offsetY={7}
                  listening={false}
                />
                
                {/* Информация о доступном объеме при hover */}
                {isHovered && status === 'VACANT' && boxData && (
                  <Text
                    text={`${boxData.available_volume} м³`}
                    x={centerX}
                    y={centerY + 18}
                    fontSize={12}
                    fontFamily="Montserrat, sans-serif"
                    fill="#92400e"
                    align="center"
                    verticalAlign="middle"
                    offsetX={0}
                    offsetY={6}
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

MainWarehouseCanvas.displayName = 'MainWarehouseCanvas';

export default MainWarehouseCanvas; 