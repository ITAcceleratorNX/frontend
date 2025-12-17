import React, { useEffect, useRef, useState, useCallback } from 'react';
import svgPanZoom from 'svg-pan-zoom';
import warehouseLayoutData from '../assets/warehouseLayout.json';
import mainWarehouseLayoutData from '../assets/Main_Individual_storage.json';
import komfortLayoutData1 from '../assets/ZHK_Komfort_storage.json';
import komfortLayoutData2 from '../assets/second_ZHK_Komfort_storage.json';

const WarehouseSVGMap = React.forwardRef(({ 
  warehouse,
  storageBoxes = [], 
  onBoxSelect, 
  selectedStorage,
  selectedMap: initialSelectedMap = 1,
  onMapChange
}, ref) => {
  const svgRef = useRef(null);
  const panZoomRef = useRef(null);
  const [hoveredId, setHoveredId] = useState(null);
  const [selectedMap, setSelectedMap] = useState(initialSelectedMap);
  const animationFrameRef = useRef(null);
  const getPanBoundsRef = useRef(null);
  const constrainPanRef = useRef(null);
  const touchStartRef = useRef(null);

  const warehouseName = warehouse?.name || '';
  
  // Отслеживаем текущий key SVG (должно быть после определения warehouseName и selectedMap)
  const svgKeyRef = useRef(`${warehouseName}-${selectedMap}`);

  // Определяем размеры и данные в зависимости от склада
  const getWarehouseConfig = (overrideName = null, overrideSelectedMap = null) => {
    const name = (overrideName ?? warehouseName)?.toLowerCase() || '';
    const mapNum = overrideSelectedMap ?? selectedMap;
    
    if (name.includes('mega')) {
      return {
        width: 615,
        height: 1195,
        layoutData: warehouseLayoutData,
        viewBox: '0 0 615 1195'
      };
    } else if (name.includes('есентай') || name.includes('esentai')) {
      return {
        width: 1280,
        height: 751,
        layoutData: mainWarehouseLayoutData,
        viewBox: '0 0 1280 751'
      };
    } else if (name.includes('комфорт') || name.includes('komfort')) {
      const isFirstMap = mapNum === 1;
      return {
        width: isFirstMap ? 1123 : 1176,
        height: isFirstMap ? 423 : 537,
        layoutData: isFirstMap ? komfortLayoutData1 : komfortLayoutData2,
        viewBox: isFirstMap ? '0 0 1123 423' : '0 0 1176 537'
      };
    }
    
    // Default
    return {
      width: 615,
      height: 1195,
      layoutData: warehouseLayoutData,
      viewBox: '0 0 615 1195'
    };
  };

  const config = React.useMemo(() => {
    const cfg = getWarehouseConfig(warehouseName, selectedMap);
    if (import.meta.env.DEV) {
      console.log('📦 Config обновлен:', {
        warehouse: warehouseName,
        map: selectedMap,
        width: cfg.width,
        height: cfg.height,
        boxCount: cfg.layoutData?.length || 0
      });
    }
    return cfg;
  }, [warehouseName, selectedMap]);

  // Функция для вычисления адаптивных minZoom и maxZoom
  const getAdaptiveZoomLimits = useCallback((containerWidth, containerHeight, nameArg = null, mapArg = null) => {
    if (!containerWidth || !containerHeight) {
      return { minZoom: 0.2, maxZoom: 3 };
    }

    const currentConfig = getWarehouseConfig(nameArg ?? warehouseName, mapArg ?? selectedMap);

    const zoomByWidth = (containerWidth * 0.95) / currentConfig.width;
    const zoomByHeight = (containerHeight * 0.95) / currentConfig.height;
    const minZoom = Math.min(zoomByWidth, zoomByHeight, 0.7);
    
    const maxZoom = Math.min(minZoom * 4, 3);
    
    return { 
      minZoom: Math.max(0.2, minZoom),
      maxZoom: Math.max(1.5, maxZoom)
    };
  }, [warehouseName, selectedMap]);

  // Вычисление границ всех боксов для адаптивной окантовки
  const getBoundingBox = useCallback(() => {
    const currentConfig = getWarehouseConfig();
    
    if (!currentConfig.layoutData || currentConfig.layoutData.length === 0) {
      return { minX: 0, minY: 0, maxX: currentConfig.width, maxY: currentConfig.height };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    currentConfig.layoutData.forEach((box) => {
      if (box.points && box.points.length > 0) {
        for (let i = 0; i < box.points.length; i += 2) {
          const x = box.x + box.points[i];
          const y = box.y + box.points[i + 1];
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      } else {
        const boxMinX = box.x;
        const boxMinY = box.y;
        const boxMaxX = box.x + (box.width || 0);
        const boxMaxY = box.y + (box.height || 0);
        
        minX = Math.min(minX, boxMinX);
        minY = Math.min(minY, boxMinY);
        maxX = Math.max(maxX, boxMaxX);
        maxY = Math.max(maxY, boxMaxY);
      }
    });

    const padding = 20;
    return {
      minX: Math.max(0, minX - padding),
      minY: Math.max(0, minY - padding),
      maxX: Math.min(currentConfig.width, maxX + padding),
      maxY: Math.min(currentConfig.height, maxY + padding)
    };
  }, [warehouseName, selectedMap]);

  // Функция для вычисления оптимальной начальной позиции на основе реальных границ боксов
  const getInitialView = useCallback((nameArg, mapArg, containerWidth, containerHeight) => {
    const name = nameArg?.toLowerCase() || '';

    const currentConfig = getWarehouseConfig(nameArg, mapArg);

    let optimalZoom, optimalPanX, optimalPanY;

    if (name.includes('mega')) {
      // Mega Tower: 615x1195 (высокая, узкая карта)
      const zoomByHeight = (containerHeight * 0.9) / currentConfig.height;
      const zoomByWidth = (containerWidth * 0.9) / currentConfig.width;
      optimalZoom = Math.min(zoomByHeight, zoomByWidth, 1.0);

      const scaledWidth = currentConfig.width * optimalZoom;
      const scaledHeight = currentConfig.height * optimalZoom;
      optimalPanX = (containerWidth - scaledWidth) / 2;
      optimalPanY = (containerHeight - scaledHeight) * 0.1; // 10% отступ сверху

    } else if (name.includes('есентай') || name.includes('esentai')) {
      // Esentai: 1280x751 (широкая, низкая карта)
      const zoomByWidth = (containerWidth * 0.95) / currentConfig.width;
      const zoomByHeight = (containerHeight * 0.95) / currentConfig.height;
      optimalZoom = Math.min(zoomByWidth, zoomByHeight, 1.0);

      const scaledWidth = currentConfig.width * optimalZoom;
      const scaledHeight = currentConfig.height * optimalZoom;
      optimalPanX = (containerWidth - scaledWidth) / 2;
      optimalPanY = (containerHeight - scaledHeight) / 2;

    } else if (name.includes('комфорт') || name.includes('komfort')) {
      // Komfort: очень широкая, низкая карта
      const zoomByWidth = (containerWidth * 0.95) / currentConfig.width;
      const zoomByHeight = (containerHeight * 0.95) / currentConfig.height;
      optimalZoom = Math.min(zoomByWidth, zoomByHeight, 1.0);

      const scaledWidth = currentConfig.width * optimalZoom;
      const scaledHeight = currentConfig.height * optimalZoom;
      optimalPanX = (containerWidth - scaledWidth) / 2;
      optimalPanY = (containerHeight - scaledHeight) / 2;

    } else {
      // Default: используем fit
      const zoomByWidth = (containerWidth * 0.9) / currentConfig.width;
      const zoomByHeight = (containerHeight * 0.9) / currentConfig.height;
      optimalZoom = Math.min(zoomByWidth, zoomByHeight, 1.0);

      const scaledWidth = currentConfig.width * optimalZoom;
      const scaledHeight = currentConfig.height * optimalZoom;
      optimalPanX = (containerWidth - scaledWidth) / 2;
      optimalPanY = (containerHeight - scaledHeight) / 2;
    }

    optimalZoom = Math.max(0.2, Math.min(optimalZoom, 1.0));

    return { zoom: optimalZoom, panX: optimalPanX, panY: optimalPanY };
  }, []);

  // Функция для вычисления границ панорамирования
  const getPanBounds = useCallback(() => {
    if (!panZoomRef.current || !svgRef.current) {
      return { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
    }

    const container = svgRef.current.parentElement;
    if (!container) {
      return { minX: -Infinity, maxX: Infinity, minY: -Infinity, maxY: Infinity };
    }

    const currentConfig = getWarehouseConfig();

    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;
    const currentZoom = panZoomRef.current.getZoom();
    const scaledWidth = currentConfig.width * currentZoom;
    const scaledHeight = currentConfig.height * currentZoom;
    const isWideMap = currentConfig.width > currentConfig.height * 1.5;

    const zoomLimits = getAdaptiveZoomLimits(containerWidth, containerHeight);
    const minZoom = zoomLimits.minZoom;
    const maxZoom = zoomLimits.maxZoom;
    
    const zoomRange = maxZoom - minZoom;
    const zoomProgress = zoomRange > 0 ? Math.max(0, Math.min(1, (currentZoom - minZoom) / zoomRange)) : 0;
    
    const minMultiplier = 0.3;
    const maxMultiplier = 3.0;
    const paddingMultiplier = minMultiplier + (zoomProgress * (maxMultiplier - minMultiplier));
    
    const basePaddingX = isWideMap ? 80 : 40;
    const basePaddingY = isWideMap ? 80 : 40;

    const paddingX = basePaddingX * paddingMultiplier;
    const paddingY = basePaddingY * paddingMultiplier;

    let minX, maxX, minY, maxY;

    if (scaledWidth > containerWidth) {
      minX = containerWidth - scaledWidth - paddingX;
      maxX = paddingX;
    } else {
      const diffX = containerWidth - scaledWidth;
      minX = -diffX / 2 - paddingX;
      maxX = diffX / 2 + paddingX;
    }

    if (scaledHeight > containerHeight) {
      minY = containerHeight - scaledHeight - paddingY;
      maxY = paddingY;
    } else {
      const diffY = containerHeight - scaledHeight;
      minY = -diffY / 2 - paddingY;
      maxY = diffY / 2 + paddingY;
    }

    return { minX, maxX, minY, maxY };
  }, [warehouseName, selectedMap, getAdaptiveZoomLimits]);

  useEffect(() => {
    getPanBoundsRef.current = getPanBounds;
  }, [getPanBounds]);

  const constrainPan = useCallback((panX, panY) => {
    const bounds = getPanBounds();
    return {
      x: Math.max(bounds.minX, Math.min(bounds.maxX, panX)),
      y: Math.max(bounds.minY, Math.min(bounds.maxY, panY))
    };
  }, [getPanBounds]);

  useEffect(() => {
    constrainPanRef.current = constrainPan;
  }, [constrainPan]);

  // Получение статуса бокса
  const getBoxStatus = useCallback((boxName) => {
    const box = storageBoxes.find(storage => 
      storage.name.toLowerCase() === boxName.toLowerCase() && 
      storage.storage_type === 'INDIVIDUAL'
    );
    return box ? box.status : 'OCCUPIED';
  }, [storageBoxes]);

  // Получение данных бокса
  const getBoxData = useCallback((boxName) => {
    return storageBoxes.find(storage => 
      storage.name.toLowerCase() === boxName.toLowerCase() && 
      storage.storage_type === 'INDIVIDUAL'
    );
  }, [storageBoxes]);

  // Проверка выбранного бокса
  const isBoxSelected = useCallback((boxName) => {
    if (!selectedStorage) return false;
    return selectedStorage.name.toLowerCase() === boxName.toLowerCase();
  }, [selectedStorage]);

  // Проверка занятости
  const isBoxOccupied = (status) => {
    return status === 'OCCUPIED' || status === 'PENDING';
  };

  // Обработчик клика по боксу
  const handleBoxClick = useCallback((boxName, event) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    const boxData = getBoxData(boxName);
    if (boxData && onBoxSelect) {
      onBoxSelect(boxData);
      
      if (panZoomRef.current && svgRef.current) {
        const currentConfig = getWarehouseConfig(warehouseName, selectedMap);
        const box = currentConfig.layoutData.find(b => 
          b.name.toLowerCase() === boxName.toLowerCase()
        );
        
        if (box) {
          let centerX, centerY;
          
          if (box.points && box.points.length > 0) {
            // Улучшенное вычисление центра полигона
            let sumX = 0, sumY = 0;
            let signedArea = 0;
            const numPoints = box.points.length / 2;
            
            if (numPoints <= 4) {
              for (let i = 0; i < box.points.length; i += 2) {
                sumX += box.points[i];
                sumY += box.points[i + 1];
              }
              centerX = box.x + (sumX / numPoints);
              centerY = box.y + (sumY / numPoints);
            } else {
              // Для сложных полигонов используем центроид
              for (let i = 0; i < box.points.length - 2; i += 2) {
                const x0 = box.points[i];
                const y0 = box.points[i + 1];
                const x1 = box.points[i + 2];
                const y1 = box.points[i + 3];
                const a = x0 * y1 - x1 * y0;
                signedArea += a;
                sumX += (x0 + x1) * a;
                sumY += (y0 + y1) * a;
              }
              // Замыкаем полигон
              const x0 = box.points[box.points.length - 2];
              const y0 = box.points[box.points.length - 1];
              const x1 = box.points[0];
              const y1 = box.points[1];
              const a = x0 * y1 - x1 * y0;
              signedArea += a;
              sumX += (x0 + x1) * a;
              sumY += (y0 + y1) * a;
              
              signedArea *= 0.5;
              if (Math.abs(signedArea) > 0.001) {
                centerX = box.x + (sumX / (6 * signedArea));
                centerY = box.y + (sumY / (6 * signedArea));
              } else {
                // Fallback: простое среднее
                sumX = 0; sumY = 0;
                for (let i = 0; i < box.points.length; i += 2) {
                  sumX += box.points[i];
                  sumY += box.points[i + 1];
                }
                centerX = box.x + (sumX / numPoints);
                centerY = box.y + (sumY / numPoints);
              }
            }
          } else {
            centerX = box.x + (box.width || 0) / 2;
            centerY = box.y + (box.height || 0) / 2;
          }
          
          const container = svgRef.current?.parentElement;
          if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            const startZoom = panZoomRef.current.getZoom();
            const startPan = panZoomRef.current.getPan();
            const targetZoom = 2.0;
            
            const viewportCenterX = containerWidth / 2;
            const viewportCenterY = containerHeight / 2;
            
            const targetBoxZoomedX = centerX * targetZoom;
            const targetBoxZoomedY = centerY * targetZoom;
            const targetPanX = viewportCenterX - targetBoxZoomedX;
            const targetPanY = viewportCenterY - targetBoxZoomedY;
            
            if (animationFrameRef.current) {
              cancelAnimationFrame(animationFrameRef.current);
              animationFrameRef.current = null;
            }
            
            const duration = 600;
            const startTime = performance.now();
            
            const easeOutCubic = (t) => {
              return 1 - Math.pow(1 - t, 3);
            };
            
            const animate = (currentTime) => {
              if (!panZoomRef.current) {
                return;
              }
              
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const eased = easeOutCubic(progress);
              
              const currentZoomValue = startZoom + (targetZoom - startZoom) * eased;
              
              const boxAfterZoomX = centerX * currentZoomValue;
              const boxAfterZoomY = centerY * currentZoomValue;
              
              const neededPanX = viewportCenterX - boxAfterZoomX;
              const neededPanY = viewportCenterY - boxAfterZoomY;
              
              let currentPanX = startPan.x + (neededPanX - startPan.x) * eased;
              let currentPanY = startPan.y + (neededPanY - startPan.y) * eased;
              
              const constrainedPan = constrainPan(currentPanX, currentPanY);
              currentPanX = constrainedPan.x;
              currentPanY = constrainedPan.y;
              
              panZoomRef.current.zoomAtPoint(currentZoomValue, {
                x: viewportCenterX,
                y: viewportCenterY
              });
              
              panZoomRef.current.pan({
                x: currentPanX,
                y: currentPanY
              });
              
              if (progress < 1) {
                animationFrameRef.current = requestAnimationFrame(animate);
              } else {
                panZoomRef.current.zoomAtPoint(targetZoom, {
                  x: viewportCenterX,
                  y: viewportCenterY
                });
                
                const finalConstrainedPan = constrainPan(targetPanX, targetPanY);
                panZoomRef.current.pan({ 
                  x: finalConstrainedPan.x, 
                  y: finalConstrainedPan.y 
                });
                
                animationFrameRef.current = null;
              }
            };
            
            animationFrameRef.current = requestAnimationFrame(animate);
          }
        }
      }
    }
  }, [getBoxData, onBoxSelect, constrainPan, warehouseName, selectedMap]);

  // Инициализация svg-pan-zoom - ТОЛЬКО при первой загрузке компонента
  useEffect(() => {
    if (!svgRef.current || panZoomRef.current || !warehouse) {
      return;
    }

    // Сохраняем текущие значения
    const currentWarehouseName = warehouseName;
    const currentSelectedMap = selectedMap;
    
    if (import.meta.env.DEV) {
      console.log('🎬 Первая инициализация svg-pan-zoom для:', currentWarehouseName);
    }
    
    try {
      const container = svgRef.current.parentElement;
      const containerWidth = container ? container.clientWidth : 800;
      const containerHeight = container ? container.clientHeight : 600;
      const zoomLimits = getAdaptiveZoomLimits(containerWidth, containerHeight, currentWarehouseName, currentSelectedMap);
      
      panZoomRef.current = svgPanZoom(svgRef.current, {
        panEnabled: true,
        controlIconsEnabled: false,
        zoomEnabled: true,
        dblClickZoomEnabled: true,
        mouseWheelZoomEnabled: true,
        preventMouseEventsDefault: true,
        zoomScaleSensitivity: 0.2,
        minZoom: zoomLimits.minZoom,
        maxZoom: zoomLimits.maxZoom,
        fit: false,
        contain: false,
        center: false,
        refreshRate: 60,
        beforePan: (oldPan, newPan) => {
          if (!getPanBoundsRef.current) {
            return { x: newPan.x, y: newPan.y };
          }
          
          const bounds = getPanBoundsRef.current();
          const constrainedX = Math.max(bounds.minX, Math.min(bounds.maxX, newPan.x));
          const constrainedY = Math.max(bounds.minY, Math.min(bounds.maxY, newPan.y));
          
          return { x: constrainedX, y: constrainedY };
        },
        onZoom: () => {
          if (panZoomRef.current && constrainPanRef.current) {
            const currentPan = panZoomRef.current.getPan();
            const constrainedPan = constrainPanRef.current(currentPan.x, currentPan.y);
            
            if (constrainedPan.x !== currentPan.x || constrainedPan.y !== currentPan.y) {
              panZoomRef.current.pan({ 
                x: constrainedPan.x, 
                y: constrainedPan.y 
              });
            }
          }
        }
      });
      
      // Применяем начальный вид сразу после создания
      requestAnimationFrame(() => {
        if (panZoomRef.current && svgRef.current) {
          const container = svgRef.current.parentElement;
          if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const initialView = getInitialView(currentWarehouseName, currentSelectedMap, containerWidth, containerHeight);
            
            panZoomRef.current.zoomAtPoint(initialView.zoom, {
              x: containerWidth / 2,
              y: containerHeight / 2
            });
            
            panZoomRef.current.pan({ 
              x: initialView.panX, 
              y: initialView.panY 
            });
          }
        }
      });
    } catch (error) {
      console.error('Error initializing svg-pan-zoom:', error);
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (panZoomRef.current) {
        try {
          panZoomRef.current.destroy();
        } catch (error) {
          console.error('Error destroying svg-pan-zoom:', error);
        }
        panZoomRef.current = null;
      }
    };
  }, [warehouse]);

  // Обновление при изменении склада или карты - ПЕРЕСОЗДАЕМ panZoom если SVG изменился
  useEffect(() => {
    if (!svgRef.current || !warehouse) {
      return;
    }

    // Проверяем, изменился ли key SVG (это означает, что React пересоздал элемент)
    const currentKey = `${warehouseName}-${selectedMap}`;
    const needsReinit = panZoomRef.current && svgKeyRef.current !== currentKey;

    if (import.meta.env.DEV) {
      console.log('🔄 Обновление вида карты:', {
        warehouse: warehouseName,
        map: selectedMap,
        currentKey,
        previousKey: svgKeyRef.current,
        needsReinit,
        hasPanZoom: !!panZoomRef.current
      });
    }

    // Если SVG изменился (из-за key), пересоздаем panZoom
    if (needsReinit) {
      if (import.meta.env.DEV) {
        console.log('🔄 SVG key изменился - пересоздаем panZoom');
      }
      
      // Обновляем отслеживаемый key
      svgKeyRef.current = currentKey;
      
      // Уничтожаем старый экземпляр
      try {
        panZoomRef.current.destroy();
      } catch (error) {
        console.error('Error destroying panZoom:', error);
      }
      panZoomRef.current = null;

      // Даем React время обновить DOM перед созданием нового экземпляра
      setTimeout(() => {
        if (!svgRef.current) return;
        
        const container = svgRef.current.parentElement;
        if (!container) {
          console.error('Map container not found');
          return;
        }

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const zoomLimits = getAdaptiveZoomLimits(containerWidth, containerHeight, warehouseName, selectedMap);

        try {
          panZoomRef.current = svgPanZoom(svgRef.current, {
            panEnabled: true,
            controlIconsEnabled: false,
            zoomEnabled: true,
            dblClickZoomEnabled: true,
            mouseWheelZoomEnabled: true,
            preventMouseEventsDefault: true,
            zoomScaleSensitivity: 0.2,
            minZoom: zoomLimits.minZoom,
            maxZoom: zoomLimits.maxZoom,
            fit: false,
            contain: false,
            center: false,
            refreshRate: 60,
            beforePan: (oldPan, newPan) => {
              if (!getPanBoundsRef.current) {
                return { x: newPan.x, y: newPan.y };
              }
              const bounds = getPanBoundsRef.current();
              return {
                x: Math.max(bounds.minX, Math.min(bounds.maxX, newPan.x)),
                y: Math.max(bounds.minY, Math.min(bounds.maxY, newPan.y))
              };
            },
            onZoom: () => {
              if (panZoomRef.current && constrainPanRef.current) {
                const currentPan = panZoomRef.current.getPan();
                const constrainedPan = constrainPanRef.current(currentPan.x, currentPan.y);
                if (constrainedPan.x !== currentPan.x || constrainedPan.y !== currentPan.y) {
                  panZoomRef.current.pan({ x: constrainedPan.x, y: constrainedPan.y });
                }
              }
            }
          });

          // Применяем начальный вид сразу после создания
          if (panZoomRef.current) {
            const initialView = getInitialView(warehouseName, selectedMap, containerWidth, containerHeight);
            panZoomRef.current.zoomAtPoint(initialView.zoom, {
              x: containerWidth / 2,
              y: containerHeight / 2
            });
            panZoomRef.current.pan({ 
              x: initialView.panX, 
              y: initialView.panY 
            });
          }
        } catch (error) {
          console.error('Error creating panZoom:', error);
        }
      }, 50);
      
      return; // Выходим, чтобы не применять вид дважды
    }

    // Применяем начальный вид
    if (panZoomRef.current && svgRef.current) {
      requestAnimationFrame(() => {
        if (panZoomRef.current && svgRef.current) {
          const container = svgRef.current.parentElement;
          if (container) {
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            
            // Обновляем zoom limits
            const zoomLimits = getAdaptiveZoomLimits(containerWidth, containerHeight, warehouseName, selectedMap);
            panZoomRef.current.updateBBox();
            panZoomRef.current.setMinZoom(zoomLimits.minZoom);
            panZoomRef.current.setMaxZoom(zoomLimits.maxZoom);
            
            // Применяем начальный вид
            const initialView = getInitialView(warehouseName, selectedMap, containerWidth, containerHeight);
            
            if (import.meta.env.DEV) {
              console.log('🎯 Применение начального вида:', {
                zoom: initialView.zoom,
                panX: initialView.panX,
                panY: initialView.panY
              });
            }
            
            panZoomRef.current.zoomAtPoint(initialView.zoom, {
              x: containerWidth / 2,
              y: containerHeight / 2
            });
            
            panZoomRef.current.pan({ 
              x: initialView.panX, 
              y: initialView.panY 
            });
          }
        }
      });
    }
  }, [warehouseName, selectedMap, warehouse, getAdaptiveZoomLimits, getInitialView]);

  useEffect(() => {
    if (initialSelectedMap !== selectedMap) {
      setSelectedMap(initialSelectedMap);
    }
  }, [initialSelectedMap]);

  // Обработчик изменения размера окна
  useEffect(() => {
    const handleResize = () => {
      if (panZoomRef.current && svgRef.current) {
        const container = svgRef.current.parentElement;
        if (container) {
          const containerWidth = container.clientWidth;
          const containerHeight = container.clientHeight;
          const zoomLimits = getAdaptiveZoomLimits(containerWidth, containerHeight);
          
          const currentZoom = panZoomRef.current.getZoom();
          if (currentZoom < zoomLimits.minZoom) {
            panZoomRef.current.zoomAtPoint(zoomLimits.minZoom, {
              x: containerWidth / 2,
              y: containerHeight / 2
            });
          } else if (currentZoom > zoomLimits.maxZoom) {
            panZoomRef.current.zoomAtPoint(zoomLimits.maxZoom, {
              x: containerWidth / 2,
              y: containerHeight / 2
            });
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [getAdaptiveZoomLimits]);

  // Получение цветов для бокса
  const getBoxColors = (boxName) => {
    const status = getBoxStatus(boxName);
    const isSelected = isBoxSelected(boxName);
    const isHovered = hoveredId === boxName;
    const isOccupied = isBoxOccupied(status);

    let fillColor, strokeColor, strokeWidth, textColor;

    const baseColor = isOccupied ? '#4A5568' : '#07574F';
    const textBaseColor = '#C5E0DB';

    if (isSelected) {
      if (isOccupied) {
        fillColor = '#6A7588';
      } else {
        fillColor = '#0F8A77';
      }
      strokeColor = '#FFFFFF';
      strokeWidth = 4;
      textColor = '#FFFFFF';
    } else if (isHovered) {
      if (isOccupied) {
        fillColor = '#6A7588';
      } else {
        fillColor = '#0D7A6B';
      }
      strokeColor = '#C5E0DB';
      strokeWidth = 2.5;
      textColor = '#FFFFFF';
    } else {
      fillColor = baseColor;
      strokeColor = isOccupied ? '#5A6578' : '#0A6B5F';
      strokeWidth = 1;
      textColor = textBaseColor;
    }

    return { fillColor, strokeColor, strokeWidth, textColor, isOccupied };
  };

  // Вычисление центра для полигонов
  const getPolygonCenter = (points, x, y) => {
    if (!points || points.length === 0) return { x: 0, y: 0 };
    let sumX = 0, sumY = 0;
    for (let i = 0; i < points.length; i += 2) {
      sumX += points[i];
      sumY += points[i + 1];
    }
    return {
      x: x + (sumX / (points.length / 2)),
      y: y + (sumY / (points.length / 2))
    };
  };

  // Обработчик изменения карты для Комфорт
  const handleMapChange = (mapNumber) => {
    setSelectedMap(mapNumber);
    if (onMapChange) {
      onMapChange(mapNumber);
    }
  };

  const isKomfortWarehouse = warehouseName?.includes('Комфорт') || warehouseName?.includes('Komfort');

  // Если нет склада или это CLOUD склад, не рендерим карту
  if (!warehouse || warehouse.type === 'CLOUD') {
    return null;
  }

  // Проверяем, есть ли layoutData для этого склада
  if (!config.layoutData || config.layoutData.length === 0) {
    return (
      <div style={{
        minHeight: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        color: '#6B6B6B'
      }}>
        Для выбранного склада пока нет схемы. Пожалуйста, свяжитесь с менеджером для подробной информации.
      </div>
    );
  }

  // Функции зума для использования через ref
  const handleZoomIn = useCallback(() => {
    if (panZoomRef.current && svgRef.current) {
      const container = svgRef.current.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const zoomLimits = getAdaptiveZoomLimits(containerWidth, containerHeight);
        const currentZoom = panZoomRef.current.getZoom();
        const newZoom = Math.min(currentZoom * 1.2, zoomLimits.maxZoom);
        
        panZoomRef.current.zoomAtPoint(newZoom, {
          x: containerWidth / 2,
          y: containerHeight / 2
        });
      }
    }
  }, [getAdaptiveZoomLimits]);

  const handleZoomOut = useCallback(() => {
    if (panZoomRef.current && svgRef.current) {
      const container = svgRef.current.parentElement;
      if (container) {
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const zoomLimits = getAdaptiveZoomLimits(containerWidth, containerHeight);
        const currentZoom = panZoomRef.current.getZoom();
        const newZoom = Math.max(currentZoom / 1.2, zoomLimits.minZoom);
        
        panZoomRef.current.zoomAtPoint(newZoom, {
          x: containerWidth / 2,
          y: containerHeight / 2
        });
      }
    }
  }, [getAdaptiveZoomLimits]);

  // Expose zoom functions via ref
  React.useImperativeHandle(ref, () => ({
    zoomIn: handleZoomIn,
    zoomOut: handleZoomOut
  }));

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      overflow: 'hidden', 
      position: 'relative',
      perspective: '1200px',
      perspectiveOrigin: '50% 50%'
    }}>
      {/* Селектор карт для Комфорт - вверху слева */}
      {isKomfortWarehouse && (
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          zIndex: 10,
          display: 'inline-flex',
          gap: '8px'
        }}>
          {[1, 2].map((mapNumber) => {
            const isActive = selectedMap === mapNumber;
            return (
              <button
                key={mapNumber}
                onClick={() => handleMapChange(mapNumber)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'transparent',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontFamily: 'Montserrat, sans-serif',
                  transition: 'all 0.2s',
                  border: '2px solid white',
                  boxShadow: isActive ? '0 2px 8px rgba(0, 0, 0, 0.15)' : 'none'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'rgba(255, 255, 255, 0.15)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.background = 'transparent';
                  }
                }}
                aria-pressed={isActive}
              >
                Карта {mapNumber}
              </button>
            );
          })}
        </div>
      )}

      <svg
        key={`${warehouseName}-${selectedMap}`}
        ref={svgRef}
        width={config.width}
        height={config.height}
        viewBox={config.viewBox}
        style={{ 
          display: 'block', 
          cursor: 'grab',
          transform: 'rotateX(30deg)',
          transformStyle: 'preserve-3d',
          transformOrigin: 'center center'
        }}
        onMouseDown={(e) => {
          if (e.target.tagName === 'svg' || e.target.classList.contains('box-rect') || e.target.classList.contains('box-polygon')) {
            if (svgRef.current) {
              svgRef.current.style.cursor = 'grabbing';
            }
          }
        }}
        onMouseUp={() => {
          if (svgRef.current) {
            svgRef.current.style.cursor = 'grab';
          }
        }}
      >
        <g>
          {/* Адаптивная окантовка вокруг всех боксов */}
          {(() => {
            const bounds = getBoundingBox();
            const width = bounds.maxX - bounds.minX;
            const height = bounds.maxY - bounds.minY;
            
            return (
              <rect
                x={bounds.minX}
                y={bounds.minY}
                width={width}
                height={height}
                fill="#C5E0DB"
                stroke="none"
                rx="8"
                style={{ pointerEvents: 'none' }}
              />
            );
          })()}
          
          {/* Рендеринг боксов */}
          {config.layoutData.map((box) => {
            const { fillColor, strokeColor, strokeWidth, textColor, isOccupied } = getBoxColors(box.name);
            const boxData = getBoxData(box.name);
            
            let centerX, centerY;
            
            if (box.points && box.points.length > 0) {
              const center = getPolygonCenter(box.points, box.x, box.y);
              centerX = center.x;
              centerY = center.y;
            } else {
              centerX = box.x + (box.width || 0) / 2;
              centerY = box.y + (box.height || 0) / 2;
            }

            return (
              <g key={box.name}>
                {box.points && box.points.length > 0 ? (
                  <polygon
                    className="box-polygon"
                    points={box.points.map((p, i) => {
                      if (i % 2 === 0) {
                        return box.x + p;
                      } else {
                        return box.y + p;
                      }
                    }).join(' ')}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    style={{ 
                      cursor: 'pointer',
                      filter: isBoxSelected(box.name) ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))' : 'none',
                      transition: 'all 0.2s ease',
                      touchAction: 'manipulation'
                    }}
                    onClick={(e) => handleBoxClick(box.name, e)}
                    onTouchStart={(e) => {
                      touchStartRef.current = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY,
                        time: Date.now()
                      };
                    }}
                    onTouchEnd={(e) => {
                      if (touchStartRef.current) {
                        const touchEnd = e.changedTouches[0];
                        const deltaX = Math.abs(touchEnd.clientX - touchStartRef.current.x);
                        const deltaY = Math.abs(touchEnd.clientY - touchStartRef.current.y);
                        const deltaTime = Date.now() - touchStartRef.current.time;
                        
                        // Если движение было небольшое и быстрое - это клик
                        if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBoxClick(box.name, e);
                        }
                        touchStartRef.current = null;
                      }
                    }}
                    onMouseEnter={() => setHoveredId(box.name)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                ) : (
                  <rect
                    className="box-rect"
                    x={box.x}
                    y={box.y}
                    width={box.width || 0}
                    height={box.height || 0}
                    fill={fillColor}
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    rx="4"
                    style={{ 
                      cursor: 'pointer',
                      filter: isBoxSelected(box.name) ? 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))' : 'none',
                      transition: 'all 0.2s ease',
                      touchAction: 'manipulation'
                    }}
                    onClick={(e) => handleBoxClick(box.name, e)}
                    onTouchStart={(e) => {
                      touchStartRef.current = {
                        x: e.touches[0].clientX,
                        y: e.touches[0].clientY,
                        time: Date.now()
                      };
                    }}
                    onTouchEnd={(e) => {
                      if (touchStartRef.current) {
                        const touchEnd = e.changedTouches[0];
                        const deltaX = Math.abs(touchEnd.clientX - touchStartRef.current.x);
                        const deltaY = Math.abs(touchEnd.clientY - touchStartRef.current.y);
                        const deltaTime = Date.now() - touchStartRef.current.time;
                        
                        // Если движение было небольшое и быстрое - это клик
                        if (deltaX < 10 && deltaY < 10 && deltaTime < 300) {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBoxClick(box.name, e);
                        }
                        touchStartRef.current = null;
                      }
                    }}
                    onMouseEnter={() => setHoveredId(box.name)}
                    onMouseLeave={() => setHoveredId(null)}
                  />
                )}
                
                {/* Название бокса */}
                <text
                  x={centerX}
                  y={centerY}
                  textAnchor="middle"
                  fontSize="16"
                  fontFamily="Montserrat, sans-serif"
                  fontWeight="bold"
                  fill={textColor}
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {box.name}
                </text>
                
                {/* Информация при hover */}
                {hoveredId === box.name && boxData && (
                  <text
                    x={centerX}
                    y={centerY + 22}
                    textAnchor="middle"
                    fontSize="12"
                    fontFamily="Montserrat, sans-serif"
                    fill={textColor}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                  >
                    {boxData.available_volume || boxData.volume || ''} м²
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
});

WarehouseSVGMap.displayName = 'WarehouseSVGMap';

export default WarehouseSVGMap;

