import React, { useEffect, useState, memo } from "react";
import { Stage, Layer, Rect, Text, Image, Line } from "react-konva";
import firstBackgroundImg from "../assets/zhkomfort_map.jpeg";
import secondBackgroundImg from "../assets/second_zhkomfort_map.jpeg";
import lockIcon from "../assets/lock.png";
import firstMapData from "../assets/ZHK_Komfort_storage.json";
import secondMapData from "../assets/second_ZHK_Komfort_storage.json";

const ZhkKomfortCanvas = memo(({ storageBoxes, onBoxSelect, selectedStorage, userRole, isViewOnly = false, selectedMap = 1 }) => {
    const [backgroundImg, setBackgroundImg] = useState(null);
    const [lockImg, setLockImg] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);
    const [imageDimensions, setImageDimensions] = useState({});

    // Отладочная информация для проверки данных с API
    useEffect(() => {
        if (import.meta.env.DEV && storageBoxes?.length > 0) {
            console.log('ZhkKomfortCanvas: Данные боксов с API:', storageBoxes);
            console.log('ZhkKomfortCanvas: Режим просмотра:', isViewOnly, 'Роль пользователя:', userRole);
            console.log('ZhkKomfortCanvas: Выбранная карта:', selectedMap);
            console.log('ZhkKomfortCanvas: Имена боксов ЖК Комфорт:',
                storageBoxes.filter(s => s.storage_type === 'INDIVIDUAL').map(s => s.name)
            );
            console.log('ZhkKomfortCanvas: Боксы со статусом OCCUPIED:',
                storageBoxes.filter(s => s.status === 'OCCUPIED').map(s => ({ name: s.name, status: s.status }))
            );
            console.log('ZhkKomfortCanvas: Боксы со статусом PENDING:',
                storageBoxes.filter(s => s.status === 'PENDING').map(s => ({ name: s.name, status: s.status }))
            );
            console.log('ZhkKomfortCanvas: Боксы со статусом VACANT:',
                storageBoxes.filter(s => s.status === 'VACANT').map(s => ({ name: s.name, status: s.status }))
            );
        }
    }, [storageBoxes, isViewOnly, userRole, selectedMap]);

    // Отладочная информация для схемы складов
    useEffect(() => {
        if (import.meta.env.DEV) {
            const currentMapData = selectedMap === 1 ? firstMapData : secondMapData;
            console.log(`ZhkKomfortCanvas: Все боксы в схеме карты ${selectedMap}:`,
                currentMapData.map(box => box.name)
            );
            console.log('ZhkKomfortCanvas: Выбранный бокс:', selectedStorage);
        }
    }, [selectedStorage, selectedMap]);

    // Загрузка фонового изображения в зависимости от выбранной карты
    useEffect(() => {
      const img = new window.Image();
      const backgroundSource = selectedMap === 1 ? firstBackgroundImg : secondBackgroundImg;
      img.src = backgroundSource;
      const { width, height } = { width: 960, height: 705 };
      setImageDimensions({width, height});
        img.onload = () => {
            setBackgroundImg(img);
            // Автоматически определяем размеры изображения
            if (import.meta.env.DEV) {
                console.log(`ZhkKomfortCanvas: Фоновое изображение карты ${selectedMap} загружено`, {
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight
                });
            }
        };
        img.onerror = () => {
            console.error(`ZhkKomfortCanvas: Ошибка загрузки фонового изображения карты ${selectedMap}`);
        };
    }, [selectedMap]);

    // Загрузка иконки замка
    useEffect(() => {
        const img = new window.Image();
        img.src = lockIcon;
        img.onload = () => {
            setLockImg(img);
            if (import.meta.env.DEV) {
                console.log('ZhkKomfortCanvas: Иконка замка загружена');
            }
        };
        img.onerror = () => {
            console.error('ZhkKomfortCanvas: Ошибка загрузки иконки замка');
        };
    }, []);

    // Функция получения статуса бокса по имени
    const getBoxStatus = (boxName) => {
        const box = storageBoxes.find(storage =>
            storage.name.toLowerCase() === boxName.toLowerCase() && storage.storage_type === 'INDIVIDUAL'
        );
        const status = box ? box.status : 'OCCUPIED';
        if (import.meta.env.DEV && (status === 'OCCUPIED' || status === 'PENDING')) {
            if (!box) {
                console.log(`ZhkKomfortCanvas: Бокс "${boxName}" не найден в API данных.`,
                    storageBoxes.filter(s => s.storage_type === 'INDIVIDUAL').map(s => s.name)
                );
            }
            console.log(`ZhkKomfortCanvas: Бокс "${boxName}": найден=${!!box}, статус=${status}, box data:`, box);
        }
        return status;
    };

    // Получение данных бокса
    const getBoxData = (boxName) => {
        return storageBoxes.find(storage =>
            storage.name.toLowerCase() === boxName.toLowerCase() && storage.storage_type === 'INDIVIDUAL'
        );
    };

    const isBoxSelected = (boxName) => {
        if (!selectedStorage) return false;
        return selectedStorage.name.toLowerCase() === boxName.toLowerCase();
    };

    const isBoxOccupied = (status) => {
        return status === 'OCCUPIED' || status === 'PENDING';
    };

    const handleBoxClick = (boxName) => {
        const boxData = getBoxData(boxName);
        const status = getBoxStatus(boxName);

        if (isViewOnly) {
            if (boxData) {
                onBoxSelect(boxData);
                if (import.meta.env.DEV) {
                    console.log('Выбран бокс для просмотра:', boxData);
                }
            }
        } else {
            // Для обычных пользователей можно выбрать любой бокс (включая занятые) для просмотра информации о бронировании
            if (boxData) {
                onBoxSelect(boxData);
                if (import.meta.env.DEV) {
                    console.log('Выбран бокс:', boxData, 'статус:', status);
                }
            }
        }
    };

    const handleMouseEnter = (boxName) => {
        const status = getBoxStatus(boxName);
        const boxData = getBoxData(boxName);
        // Теперь можно ховерить на любой бокс для просмотра информации
            if (boxData) {
                setHoveredId(boxName);
        }
    };

    const handleMouseLeave = () => setHoveredId(null);

    const currentMapData = selectedMap === 1 ? firstMapData : secondMapData;

    return (
      <div
        className="block"
        style={{ overflow: 'auto', width: '100%', height: imageDimensions.height }}
      >
        <div style={{ width: imageDimensions.width, height: imageDimensions.height }}>
          <Stage width={imageDimensions.width} height={imageDimensions.height}>
            <Layer>
              {backgroundImg && (
                <Image
                  image={backgroundImg}
                  x={0}
                  y={0}
                  width={imageDimensions.width}
                  height={imageDimensions.height}
                  listening={false}
                />
              )}

              {currentMapData.map((box) => {
                const scaledX = (box.x || 0);
                const scaledY = (box.y || 0);
                const scaledWidth = (box.width || 0);
                const scaledHeight = (box.height || 0);
                let scaledPoints = null;
                if (box.points) {
                  scaledPoints = box.points.map((p, idx) => (idx % 2 === 0 ? p: p));
                }

                const status = getBoxStatus(box.name);
                const isHovered = hoveredId === box.name;
                const isSelected = isBoxSelected(box.name);
                const isOccupied = isBoxOccupied(status);
                const boxData = getBoxData(box.name);

                let centerX, centerY;
                if (scaledPoints) {
                  let sx = 0, sy = 0;
                  for (let i = 0; i < scaledPoints.length; i += 2) {
                    sx += scaledPoints[i];
                    sy += scaledPoints[i + 1];
                  }
                  centerX = scaledX + sx / (scaledPoints.length / 2);
                  centerY = scaledY + sy / (scaledPoints.length / 2);
                } else {
                  centerX = scaledX + (scaledWidth || 50) / 2;
                  centerY = scaledY + (scaledHeight || 50) / 2;
                }

                let fillColor;
                if (isSelected) fillColor = 'rgba(39, 54, 85, 0.7)';
                else if (isHovered) {
                    // При hover показываем подсветку для всех боксов
                    if (status === 'VACANT') fillColor = 'rgba(254, 243, 178, 0.9)';
                    else fillColor = 'rgba(220, 220, 220, 0.9)';
                }
                else if (status === 'VACANT') fillColor = '#fef3b2';
                else fillColor = 'rgba(200, 200, 200, 0.8)';

                let strokeColor, strokeWidth;
                if (isSelected) { strokeColor = '#273655'; strokeWidth = 3; }
                else if (status === 'VACANT') { strokeColor = '#f59e0b'; strokeWidth = 1; }
                else { strokeColor = '#6b7280'; strokeWidth = 1; }

                let textColor;
                if (isSelected) textColor = '#ffffff';
                else if (status === 'VACANT') textColor = '#92400e';
                else textColor = '#6b7280';

                // Теперь все боксы кликабельны для просмотра информации о бронировании
                const cursorStyle = 'pointer';

                return (
                  <React.Fragment key={box.name}>
                    {scaledPoints ? (
                      <Line
                        points={box.points.map((p, i) => (i % 2 === 0 ? p : p))}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        closed={true}
                        onClick={() => handleBoxClick(box.name)}
                        onTap={() => handleBoxClick(box.name)}
                        onMouseEnter={() => handleMouseEnter(box.name)}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={() => handleMouseEnter(box.name)}
                        onTouchEnd={handleMouseLeave}
                        listening={true}
                        cursor={cursorStyle}
                      />
                    ) : (
                      <Rect
                        x={scaledX}
                        y={scaledY}
                        width={scaledWidth}
                        height={scaledHeight}
                        fill={fillColor}
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        cornerRadius={4}
                        onClick={() => handleBoxClick(box.name)}
                        onTap={() => handleBoxClick(box.name)}
                        onMouseEnter={() => handleMouseEnter(box.name)}
                        onMouseLeave={handleMouseLeave}
                        onTouchStart={() => handleMouseEnter(box.name)}
                        onTouchEnd={handleMouseLeave}
                        listening={true}
                        cursor={cursorStyle}
                      />
                    )}

                    {isOccupied && lockImg && (
                      <Image
                        image={lockImg}
                        x={centerX - 12}
                        y={centerY - 12}
                        width={24}
                        height={24}
                        listening={false}
                      />
                    )}

                    <Text
                      text={box.name}
                      x={centerX}
                      y={isOccupied ? centerY + 20 : centerY}
                      fontSize={14}
                      fontFamily="Montserrat, sans-serif"
                      fontStyle="bold"
                      fill={textColor}
                      align="center"
                      verticalAlign="middle"
                      offsetX={0}
                      offsetY={7}
                      listening={false}
                    />

                    {isHovered && boxData && (
                      <Text
                        text={`${boxData.available_volume} м²`}
                        x={centerX}
                        y={centerY + 18}
                        fontSize={12}
                        fontFamily="Montserrat, sans-serif"
                        fill={isViewOnly ? '#273655' : '#92400e'}
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
      </div>
    );
});

ZhkKomfortCanvas.displayName = 'ZhkKomfortCanvas';

export default ZhkKomfortCanvas;