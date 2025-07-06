import React, { useEffect, useRef, useState, memo } from "react";
import { Stage, Layer, Rect, Text, Image } from "react-konva";
import backgroundImage from "../assets/INDIVIDUAL.png";
import lockIcon from "../assets/lock.png";
import warehouseLayoutData from "../assets/warehouseLayout.json";

const InteractiveWarehouseCanvas = memo(({ storageBoxes, onBoxSelect, selectedStorage, userRole, isViewOnly = false }) => {
  const [backgroundImg, setBackgroundImg] = useState(null);
  const [lockImg, setLockImg] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  // Отладочная информация для проверки данных
  useEffect(() => {
    if (import.meta.env.DEV && storageBoxes?.length > 0) {
      console.log('InteractiveWarehouseCanvas: Данные боксов с API:', storageBoxes);
      console.log('InteractiveWarehouseCanvas: Режим просмотра:', isViewOnly, 'Роль пользователя:', userRole);
      console.log('InteractiveWarehouseCanvas: Боксы со статусом OCCUPIED:', 
        storageBoxes.filter(s => s.status === 'OCCUPIED').map(s => ({ name: s.name, status: s.status }))
      );
      console.log('InteractiveWarehouseCanvas: Боксы со статусом PENDING:', 
        storageBoxes.filter(s => s.status === 'PENDING').map(s => ({ name: s.name, status: s.status }))
      );
      console.log('InteractiveWarehouseCanvas: Боксы со статусом VACANT:', 
        storageBoxes.filter(s => s.status === 'VACANT').map(s => ({ name: s.name, status: s.status }))
      );
    }
  }, [storageBoxes, isViewOnly, userRole]);

  // Отладочная информация для схемы складов
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('InteractiveWarehouseCanvas: Все боксы в схеме:', 
        warehouseLayoutData.map(box => box.name)
      );
      console.log('InteractiveWarehouseCanvas: Выбранный бокс:', selectedStorage);
    }
  }, [selectedStorage]);

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
    
    // Отладочная информация для проблемных боксов
    if (import.meta.env.DEV && (status === 'OCCUPIED' || status === 'PENDING')) {
      console.log(`Бокс "${boxName}": найден=${!!box}, статус=${status}, box data:`, box);
    }
    
    return status;
  };

  // Функция получения данных бокса по имени (учитывает разный регистр)
  const getBoxData = (boxName) => {
    return storageBoxes.find(storage => 
      storage.name.toLowerCase() === boxName.toLowerCase() && storage.storage_type === 'INDIVIDUAL'
    );
  };

  // Проверка, является ли бокс выбранным
  const isBoxSelected = (boxName) => {
    if (!selectedStorage) return false;
    return selectedStorage.name.toLowerCase() === boxName.toLowerCase();
  };

  // Функция проверки, занят ли бокс (OCCUPIED или PENDING)
  const isBoxOccupied = (status) => {
    return status === 'OCCUPIED' || status === 'PENDING';
  };

  // Обработчик клика по боксу
  const handleBoxClick = (boxName) => {
    const boxData = getBoxData(boxName);
    const status = getBoxStatus(boxName);
    
    if (isViewOnly) {
      // В режиме просмотра (для ADMIN/MANAGER) можно выбрать любой бокс для просмотра информации
      if (boxData) {
        onBoxSelect(boxData);
        if (import.meta.env.DEV) {
          console.log('Выбран бокс для просмотра:', boxData);
        }
      }
    } else {
      // Для обычных пользователей работает старая логика - только свободные боксы
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
    }
  };

  // Обработчики для hover эффектов
  const handleMouseEnter = (boxName) => {
    const status = getBoxStatus(boxName);
    const boxData = getBoxData(boxName);
    
    if (isViewOnly) {
      // В режиме просмотра можно ховерить на любой бокс
      if (boxData) {
        setHoveredId(boxName);
      }
    } else {
      // Для обычных пользователей - только на свободные боксы
      if (status === 'VACANT') {
        setHoveredId(boxName);
      }
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
            const isSelected = isBoxSelected(box.name);
            const isOccupied = isBoxOccupied(status);
            const boxData = getBoxData(box.name);
            
            // Отладочная информация для каждого занятого бокса
            if (import.meta.env.DEV && isOccupied) {
              console.log(`Рендеринг занятого бокса: ${box.name}, статус: ${status}, lockImg загружен: ${!!lockImg}, позиция: x=${box.x}, y=${box.y}, размер: ${box.width}x${box.height}`);
            }
            
            // Определяем цвет заливки с учетом всех состояний
            let fillColor;
            if (isSelected) {
              fillColor = "rgba(39, 54, 85, 0.7)"; // Тёмно-синий для выбранного
            } else if (isHovered && status === 'VACANT') {
              fillColor = "rgba(254, 243, 178, 0.9)"; // Более яркий жёлтый при hover
            } else if (status === 'VACANT') {
              fillColor = "#fef3b2"; // Жёлтый для свободных
            } else {
              fillColor = "rgba(200, 200, 200, 0.8)"; // Серый для занятых (OCCUPIED/PENDING)
            }

            // Определяем цвет границы
            let strokeColor;
            let strokeWidth;
            if (isSelected) {
              strokeColor = "#273655"; // Тёмно-синий для выбранного
              strokeWidth = 3;
            } else if (status === 'VACANT') {
              strokeColor = "#f59e0b"; // Оранжевая граница для свободных
              strokeWidth = 1;
            } else {
              strokeColor = "#6b7280"; // Серая граница для занятых
              strokeWidth = 1;
            }

            // Определяем цвет текста
            let textColor;
            if (isSelected) {
              textColor = "#ffffff"; // Белый текст для выбранного
            } else if (status === 'VACANT') {
              textColor = "#92400e"; // Темно-желтый текст для свободных
            } else {
              textColor = "#6b7280"; // Серый текст для занятых
            }
            
            // Определяем стиль курсора
            const cursorStyle = isViewOnly 
              ? 'pointer' // В режиме просмотра все боксы кликабельны
              : (status === 'VACANT' ? 'pointer' : 'not-allowed');
            
            return (
              <React.Fragment key={box.name}>
                <Rect
                  x={box.x}
                  y={box.y}
                  width={box.width}
                  height={box.height}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  cornerRadius={4}
                  onClick={() => handleBoxClick(box.name)}
                  onMouseEnter={() => handleMouseEnter(box.name)}
                  onMouseLeave={handleMouseLeave}
                  style={{
                    cursor: cursorStyle
                  }}
                />
                
                {/* Иконка замка для занятых боксов (OCCUPIED или PENDING) */}
                {isOccupied && lockImg && (
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
                  y={isOccupied ? box.y + box.height / 2 + 20 : box.y + box.height / 2}
                  width={box.width}
                  fontSize={12}
                  fontFamily="Montserrat, sans-serif"
                  fontStyle="bold"
                  fill={textColor}
                  align="center"
                  verticalAlign="middle"
                  offsetY={6}
                  listening={false}
                />
                
                {/* Информация при hover */}
                {isHovered && boxData && (
                  <Text
                    text={isViewOnly 
                      ? `${boxData.available_volume} м³`
                      : `${boxData.available_volume} м³`
                    }
                    x={box.x}
                    y={box.y + box.height / 2 + 15}
                    width={box.width}
                    fontSize={10}
                    fontFamily="Montserrat, sans-serif"
                    fill={isViewOnly ? "#273655" : "#92400e"}
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