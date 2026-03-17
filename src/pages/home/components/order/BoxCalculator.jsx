import React, { useState, useCallback, useMemo, memo } from "react";
import { Search } from "lucide-react";
import { getLayoutBoxNames } from "@/shared/lib/warehouseLayoutUtils";

/**
 * Калькулятор подбора боксов по размеру (м²).
 * Работает в рамках выбранного склада.
 * - Точное совпадение → все подходящие боксы
 * - Нет точного → ближайшие по размеру
 * - Нет подходящих → рекомендация сменить ярус/склад
 */
function BoxCalculator({
  storageBoxes = [],
  selectedWarehouse,
  selectedMap = 1,
  onHighlightedBoxes,
  onBoxSelect,
}) {
  const [inputValue, setInputValue] = useState("");
  const [lastSearchedSize, setLastSearchedSize] = useState(null);

  // Боксы на текущем ярусе (только видимые на схеме)
  const layoutBoxNames = useMemo(() => {
    return getLayoutBoxNames(selectedWarehouse?.name, selectedMap);
  }, [selectedWarehouse?.name, selectedMap]);

  // Боксы в выбранном складе, фильтруем по текущему ярусу
  const individualBoxes = useMemo(() => {
    return (storageBoxes || [])
      .filter((s) => s.storage_type === "INDIVIDUAL")
      .filter((s) => layoutBoxNames.has((s.name || "").toLowerCase()));
  }, [storageBoxes, layoutBoxNames]);

  const uniqueSizes = useMemo(() => {
    const sizes = new Set();
    individualBoxes.forEach((s) => {
      const v = parseFloat(s.available_volume);
      if (!Number.isNaN(v) && v > 0) sizes.add(v);
    });
    return Array.from(sizes).sort((a, b) => a - b);
  }, [individualBoxes]);

  const findMatchingBoxes = useCallback(
    (desiredSize) => {
      const num = parseFloat(desiredSize);
      if (Number.isNaN(num) || num <= 0 || individualBoxes.length === 0) {
        return { boxes: [], message: null, isExact: false };
      }

      // Точное совпадение (с допуском 0.01 для float)
      const exactMatches = individualBoxes.filter((b) => {
        const v = parseFloat(b.available_volume);
        return !Number.isNaN(v) && Math.abs(v - num) < 0.01;
      });

      if (exactMatches.length > 0) {
        return { boxes: exactMatches, message: null, isExact: true };
      }

      // Ближайшие по размеру
      const withDiff = individualBoxes
        .map((b) => {
          const v = parseFloat(b.available_volume);
          if (Number.isNaN(v) || v <= 0) return null;
          return { box: b, diff: Math.abs(v - num), size: v };
        })
        .filter(Boolean);

      if (withDiff.length === 0) {
        return {
          boxes: [],
          message:
            "В выбранном складе подходящих боксов нет. Рекомендуем выбрать другой ярус или склад.",
          isExact: false,
        };
      }

      withDiff.sort((a, b) => a.diff - b.diff);
      const minDiff = withDiff[0].diff;
      const nearest = withDiff.filter((x) => x.diff === minDiff).map((x) => x.box);

      return {
        boxes: nearest,
        message: `Точного совпадения нет. Показаны ближайшие боксы (${nearest.map((b) => `${b.available_volume} м²`).join(", ")}).`,
        isExact: false,
      };
    },
    [individualBoxes]
  );

  const handleSearch = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onHighlightedBoxes?.([]);
      setLastSearchedSize(null);
      return;
    }
    const { boxes, message } = findMatchingBoxes(trimmed);
    setLastSearchedSize(trimmed);
    onHighlightedBoxes?.(boxes);
  }, [inputValue, findMatchingBoxes, onHighlightedBoxes]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  const result = useMemo(() => {
    if (!lastSearchedSize) return null;
    return findMatchingBoxes(lastSearchedSize);
  }, [lastSearchedSize, findMatchingBoxes]);

  const hasStorage = individualBoxes.length > 0;
  const isCloud = selectedWarehouse?.type === "CLOUD";

  if (isCloud || !selectedWarehouse) return null;
  if (!hasStorage) return null;

  return (
    <div className="mb-4 flex flex-col gap-3" style={{ zIndex: 1 }}>
      <p className="text-white text-sm font-medium text-center">
        Введите нужный размер бокса
      </p>
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-center">
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 w-full sm:w-auto h-12 sm:h-12">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="м²"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-white placeholder-white/70 w-24 sm:w-20 text-center text-lg font-semibold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-white/90 text-sm">м²</span>
        </div>
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#273655] font-bold shadow-lg ring-2 ring-white/50 hover:bg-[#F0FDF4] hover:ring-white hover:shadow-xl transition-all whitespace-nowrap h-12 sm:h-12"
        >
          <Search className="w-5 h-5 shrink-0" strokeWidth={2.5} />
          Найти
        </button>
      </div>

      {result && (
        <div className="text-center">
          {result.message && (
            <p className="text-white/95 text-sm">{result.message}</p>
          )}
          {result.boxes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2 justify-center">
              {result.boxes.map((box) => (
                <button
                  key={box.id ?? box.name}
                  type="button"
                  onClick={() => {
                    onBoxSelect?.(box);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/25 text-white text-sm font-medium hover:bg-white/35 transition-colors"
                >
                  {box.name} ({box.available_volume} м²)
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default memo(BoxCalculator);
