import React, { useEffect, useState, memo } from "react";
import { Stage, Layer, Rect, Text, Image, Line } from "react-konva";
import backgroundImage from "../assets/ZHK_Komfort_storage.jpeg";
import lockIcon from "../assets/lock.png";
import warehouseLayoutData from "../assets/ZHK_Komfort_storage.json";

const ZhkKomfortCanvas = memo(({ storageBoxes, onBoxSelect, selectedStorage, userRole, isViewOnly = false }) => {
    const [backgroundImg, setBackgroundImg] = useState(null);
    const [lockImg, setLockImg] = useState(null);
    const [hoveredId, setHoveredId] = useState(null);

    // Отладочная информация для проверки данных с API
    useEffect(() => {
        if (import.meta.env.DEV && storageBoxes?.length > 0) {
            console.log('ZhkKomfortCanvas: Данные боксов с API:', storageBoxes);
            console.log('ZhkKomfortCanvas: Режим просмотра:', isViewOnly, 'Роль пользователя:', userRole);
            console.log('ZhkKomfortCanvas: Имена боксов ЖК Комфорт:',
                storageBoxes.filter(s => s.storage_type === 'ZHK_KOMFORT').map(s => s.name)
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
    }, [storageBoxes, isViewOnly, userRole]);

    // Отладочная информация для схемы складов
    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('ZhkKomfortCanvas: Все боксы в схеме:',
                warehouseLayoutData.map(box => box.name)
            );
            console.log('ZhkKomfortCanvas: Выбранный бокс:', selectedStorage);
        }
    }, [selectedStorage]);

    // Загрузка фонового изображения
    useEffect(() => {
        const img = new window.Image();
        img.src = backgroundImage;
        img.onload = () => {
            setBackgroundImg(img);
            if (import.meta.env.DEV) {
                console.log('ZhkKomfortCanvas: Фоновое изображение загружено');
            }
        };
        img.onerror = () => {
            console.error('ZhkKomfortCanvas: Ошибка загрузки фонового изображения');
        };
    }, []);

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
            storage.name.toLowerCase() === boxName.toLowerCase() && storage.storage_type === 'ZHK_KOMFORT'
        );
        const status = box ? box.status : 'OCCUPIED';
        if (import.meta.env.DEV && (status === 'OCCUPIED' || status === 'PENDING')) {
            if (!box) {
                console.log(`ZhkKomfortCanvas: Бокс "${boxName}" не найден в API данных.`,
                    storageBoxes.filter(s => s.storage_type === 'ZHK_KOMFORT').map(s => s.name)
                );
            }
            console.log(`ZhkKomfortCanvas: Бокс "${boxName}": найден=${!!box}, статус=${status}, box data:`, box);
        }
        return status;
    };

    // Получение данных бокса
    const getBoxData = (boxName) => {
        return storageBoxes.find(storage =>
            storage.name.toLowerCase() === boxName.toLowerCase() && storage.storage_type === 'ZHK_KOMFORT'
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

    const handleMouseEnter = (boxName) => {
        const status = getBoxStatus(boxName);
        const boxData = getBoxData(boxName);
        if (isViewOnly) {
            if (boxData) {
                setHoveredId(boxName);
            }
        } else {
            if (status === 'VACANT') {
                setHoveredId(boxName);
            }
        }
    };

    const handleMouseLeave = () => setHoveredId(null);

    // Responsive scaling for scrollable canvas
    const stageWidth = 1280;
    const stageHeight = 751;
    const scaleX = stageWidth / 1280;
    const scaleY = stageHeight / 751;

    return (
      <div
        className="block"
        style={{ overflow: 'auto', width: '100%', height: '90vh' }}
      >
        <div style={{ width: stageWidth, height: stageHeight }}>
          <Stage width={stageWidth} height={stageHeight}>
            <Layer>
              {backgroundImg && (
                <Image
                  image={backgroundImg}
                  x={0}
                  y={0}
                  width={stageWidth}
                  height={stageHeight}
                  listening={false}
                />
              )}

              {warehouseLayoutData.map((box) => {
                const scaledX = (box.x || 0) * scaleX;
                const scaledY = (box.y || 0) * scaleY;
                const scaledWidth = (box.width || 0) * scaleX;
                const scaledHeight = (box.height || 0) * scaleY;
                let scaledPoints = null;
                if (box.points) {
                  scaledPoints = box.points.map((p, idx) => (idx % 2 === 0 ? p * scaleX : p * scaleY));
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
                else if (isHovered && (isViewOnly || status === 'VACANT')) fillColor = 'rgba(254, 243, 178, 0.9)';
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

                const cursorStyle = isViewOnly ? 'pointer' : (status === 'VACANT' ? 'pointer' : 'not-allowed');

                return (
                  <React.Fragment key={box.name}>
                    {scaledPoints ? (
                      <Line
                        points={box.points.map((p, i) => (i % 2 === 0 ? p * scaleX : p * scaleY))}
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
                        text={`${boxData.available_volume} м³`}
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