import React, { useState, useMemo, memo, useEffect } from 'react';
import InteractiveWarehouseCanvas from '../../components/InteractiveWarehouseCanvas';
import MainWarehouseCanvas from '../../components/MainWarehouseCanvas';
import ZhkKomfortCanvas from '../../components/ZhkKomfortCanvas';

/**
 * Переиспользуемый компонент для отображения карты склада
 * @param {Object} props
 * @param {Object} props.warehouse - Данные склада
 * @param {Function} props.onBoxSelect - Callback при выборе бокса (опционально)
 * @param {Object} props.selectedStorage - Выбранный бокс (опционально)
 * @param {string} props.userRole - Роль пользователя (по умолчанию 'USER')
 * @param {boolean} props.isViewOnly - Режим только просмотра (по умолчанию true)
 * @param {boolean} props.showControls - Показывать ли элементы управления (по умолчанию true)
 * @param {string} props.className - Дополнительные CSS классы для обертки
 * @param {boolean} props.isCompact - Компактный режим (уменьшенный вид с кнопкой "Смотреть карту")
 * @param {Function} props.onViewMore - Callback для открытия модального окна (опционально)
 * @param {boolean} props.isFullscreen - Полноэкранный режим (для модального окна)
 */
const WarehouseCanvasViewer = memo(({
  warehouse,
  onBoxSelect,
  selectedStorage,
  userRole = 'USER',
  isViewOnly = true,
  showControls = true,
  className = '',
  isCompact = false,
  onViewMore,
  isFullscreen = false
}) => {
  const [komfortSelectedMap, setKomfortSelectedMap] = useState(1);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Нормализуем название склада для проверки
  const warehouseName = warehouse?.name?.toLowerCase() || '';
  const isKomfortWarehouse = warehouseName.includes('комфорт') || warehouseName.includes('komfort');
  const isMegaWarehouse = warehouseName.includes('mega towers') || warehouseName.includes('mega');
  const isEsentaiWarehouse = warehouseName.includes('есентай') || warehouseName.includes('esentai');

  // Определяем, какой компонент карты использовать
  const canvasComponent = useMemo(() => {
    if (!warehouse) {
      return null;
    }

    if (warehouse.type === 'CLOUD') {
      return null; // Для CLOUD складов карта не нужна
    }

    const storageBoxes = warehouse?.storage ?? [];
    
    if (!storageBoxes.length) {
      return null;
    }

    const canvasProps = {
      storageBoxes,
      onBoxSelect: onBoxSelect || (() => {}),
      selectedStorage: selectedStorage || null,
      userRole,
      isViewOnly,
    };

    if (isKomfortWarehouse) {
      canvasProps.selectedMap = komfortSelectedMap;
    }

    // Определяем компонент карты на основе имени склада
    if (isMegaWarehouse) {
      return <InteractiveWarehouseCanvas {...canvasProps} />;
    } else if (isEsentaiWarehouse) {
      return <MainWarehouseCanvas {...canvasProps} />;
    } else if (isKomfortWarehouse) {
      return <ZhkKomfortCanvas {...canvasProps} />;
    }

    return null;
  }, [warehouse, onBoxSelect, selectedStorage, userRole, isViewOnly, komfortSelectedMap, isKomfortWarehouse, isMegaWarehouse, isEsentaiWarehouse]);

  // Определяем состояние для отображения
  const getEmptyState = () => {
    if (!warehouse) {
      return {
        icon: (
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        ),
        title: 'Склад не выбран',
        message: 'Выберите склад, чтобы увидеть схему расположения боксов',
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-400'
      };
    }

    if (warehouse.type === 'CLOUD') {
      return {
        icon: (
          <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
          </svg>
        ),
        title: 'Облачное хранение',
        message: 'Для облачного хранения схема склада не требуется — мы забираем и возвращаем ваши вещи сами.',
        bgColor: 'bg-blue-100',
        iconColor: 'text-blue-500'
      };
    }

    const storageBoxes = warehouse?.storage ?? [];
    if (!storageBoxes.length) {
      return {
        icon: (
          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        ),
        title: 'Схема недоступна',
        message: 'Схема для выбранного склада появится после синхронизации с системой бронирования.',
        bgColor: 'bg-yellow-100',
        iconColor: 'text-yellow-500'
      };
    }

    if (!canvasComponent) {
      return {
        icon: (
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        ),
        title: 'Схема не найдена',
        message: 'Для выбранного склада пока нет схемы. Пожалуйста, свяжитесь с менеджером для подробной информации.',
        bgColor: 'bg-gray-100',
        iconColor: 'text-gray-400'
      };
    }

    return null;
  };

  const emptyState = getEmptyState();

  // Если есть пустое состояние и не компактный режим или нет onViewMore
  if (emptyState && !isCompact) {
    const minHeight = isFullscreen ? 'min-h-[40vh]' : 'min-h-[220px]';
    return (
      <div className={`${minHeight} flex items-center justify-center text-center text-[#6B6B6B]`}>
        <div className="max-w-md">
          <div className={`w-16 h-16 mx-auto mb-4 ${emptyState.bgColor} rounded-full flex items-center justify-center`}>
            {emptyState.icon}
          </div>
          <p className="text-lg font-semibold text-gray-700">{emptyState.title}</p>
          <p className="text-sm text-gray-500 mt-2">{emptyState.message}</p>
        </div>
      </div>
    );
  }

  // Если компактный режим и есть пустое состояние, показываем его в компактном виде
  if (emptyState && isCompact) {
    return (
      <div className="rounded-2xl border border-dashed border-[#273655]/20 bg-white px-4 py-3 text-sm text-[#6B6B6B] text-center">
        {emptyState.message}
      </div>
    );
  }

  // Элементы управления для склада Жилой комплекс «Комфорт Сити»
  const komfortControls = isKomfortWarehouse && showControls ? (
    <div
      className={`flex ${isFullscreen ? "flex-col sm:flex-row sm:items-center sm:justify-between gap-3" : "items-center justify-center gap-3"} flex-wrap`}
    >
      <span className="text-sm font-semibold text-[#273655]">Карта Жилой комплекс «Комфорт Сити»</span>
      <div className="inline-flex rounded-xl border border-[#d7dbe6] bg-white p-1 shadow-sm">
        {[1, 2].map((mapNumber) => {
          const isActive = komfortSelectedMap === mapNumber;
          return (
            <button
              key={mapNumber}
              type="button"
              onClick={() => setKomfortSelectedMap(mapNumber)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                isActive
                  ? "bg-[#273655] text-white shadow"
                  : "text-[#273655] hover:bg-[#273655]/10"
              }`}
              aria-pressed={isActive}
            >
              Карта {mapNumber}
            </button>
          );
        })}
      </div>
    </div>
  ) : null;

  // Компактный режим (уменьшенный вид с кнопкой "Смотреть карту")
  if (isCompact) {
    const wrapperClasses = isFullscreen
      ? "flex-1 min-h-[50vh] rounded-2xl border border-[#d7dbe6] bg-white overflow-auto"
      : "rounded-2xl border border-dashed border-[#273655]/20 bg-white/70 max-h-[320px] overflow-auto";

    const showInlineCanvas = isFullscreen || !isMobileView;

    return (
      <div className={`flex flex-col gap-4 ${isFullscreen ? "h-full" : ""}`}>
        {showInlineCanvas && komfortControls}
        {showInlineCanvas ? (
          <div
            className={wrapperClasses}
            style={
              isFullscreen
                ? {
                    maxHeight: isMobileView ? "70vh" : "75vh",
                  }
                : undefined
            }
          >
            <div className="min-w-max mx-auto py-3 px-2">
              {canvasComponent}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#273655]/20 bg-white px-4 py-3 text-sm text-[#6B6B6B]">
            Нажмите «Смотреть карту», чтобы открыть схему склада на весь экран.
          </div>
        )}
        {!isFullscreen && onViewMore && (
          <button
            type="button"
            onClick={onViewMore}
            className="self-center w-full sm:w-auto px-4 py-2 rounded-xl border border-[#273655] text-[#273655] text-sm font-semibold hover:bg-[#273655] hover:text-white transition-colors"
          >
            Смотреть карту
          </button>
        )}
      </div>
    );
  }

  // Полноэкранный режим (без компактного вида) - для прямого использования с isFullscreen=true
  if (isFullscreen && !isCompact) {
    const wrapperClasses = "flex-1 min-h-[50vh] rounded-2xl border border-[#d7dbe6] bg-white overflow-auto";
    
    return (
      <div className={`flex flex-col gap-4 h-full ${className}`}>
        {komfortControls}
        <div
          className={wrapperClasses}
          style={
            isMobileView
              ? {
                  maxHeight: "70vh",
                }
              : {
                  maxHeight: "75vh",
                }
          }
        >
          <div className="min-w-max mx-auto py-3 px-2">
            {canvasComponent}
          </div>
        </div>
      </div>
    );
  }

  // Обычный режим (без компактного вида)
  return (
    <div className={`flex flex-col gap-6 ${className}`}>
      {komfortControls}
      <div className="rounded-xl border border-gray-200 bg-white overflow-auto shadow-sm hover:shadow-md transition-all duration-300">
        <div className="min-w-max mx-auto py-8 px-6">
          <div className="flex justify-center items-center w-full">
            {canvasComponent}
          </div>
        </div>
      </div>
    </div>
  );
});

WarehouseCanvasViewer.displayName = 'WarehouseCanvasViewer';

export default WarehouseCanvasViewer;

