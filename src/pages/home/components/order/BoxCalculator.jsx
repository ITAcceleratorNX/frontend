import React, { useState, useCallback, useMemo, memo, useEffect } from "react";
import { Search } from "lucide-react";
import { getLayoutBoxNames } from "@/shared/lib/warehouseLayoutUtils";
import { MEGA_TOWER_CEILING_M } from "@/shared/components/MegaTowerVolumeLegend.jsx";

/** ±доля от запроса, не меньше RANGE_MIN_DELTA м² */
const RANGE_FRACTION = 0.12;
const RANGE_MIN_DELTA = 0.5;

function pluralBoxes(n) {
  const abs = n % 100;
  if (abs >= 11 && abs <= 14) return "боксов";
  const d = n % 10;
  if (d === 1) return "бокс";
  if (d >= 2 && d <= 4) return "бокса";
  return "боксов";
}

function formatM2(v) {
  const n = Math.round(Number(v) * 100) / 100;
  if (Number.isNaN(n)) return "";
  if (Number.isInteger(n)) return String(n);
  return String(n).replace(".", ",");
}

/**
 * Подбор по м²: свободные боксы на ярусе, попадающие в диапазон вокруг введённой площади.
 * Подсветка на схеме через onHighlightedBoxes.
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

  const layoutBoxNames = useMemo(() => {
    return getLayoutBoxNames(selectedWarehouse?.name, selectedMap);
  }, [selectedWarehouse?.name, selectedMap]);

  const individualBoxes = useMemo(() => {
    return (storageBoxes || [])
      .filter((s) => s.storage_type === "INDIVIDUAL")
      .filter((s) => layoutBoxNames.has((s.name || "").toLowerCase()));
  }, [storageBoxes, layoutBoxNames]);

  const isMegaWarehouse = useMemo(
    () => Boolean(selectedWarehouse?.name?.toLowerCase().includes("mega")),
    [selectedWarehouse?.name]
  );

  const findMatchingBoxes = useCallback(
    (desiredSize) => {
      const raw = String(desiredSize).trim().replace(",", ".");
      const num = parseFloat(raw);
      if (Number.isNaN(num) || num <= 0 || individualBoxes.length === 0) {
        return { boxes: [], summary: null };
      }

      const delta = Math.max(RANGE_MIN_DELTA, num * RANGE_FRACTION);
      const lo = num - delta;
      const hi = num + delta;

      const vacantOnMap = individualBoxes.filter((b) => b.status === "VACANT");
      const inRange = vacantOnMap.filter((b) => {
        const v = parseFloat(b.available_volume);
        return !Number.isNaN(v) && v > 0 && v >= lo && v <= hi;
      });

      if (inRange.length === 0) {
        return {
          boxes: [],
          summary:
            "Свободных боксов в этом диапазоне нет. Измените площадь или выберите другой ярус или склад.",
        };
      }

      const uniqueVol = [
        ...new Set(
          inRange.map((b) => Math.round(parseFloat(b.available_volume) * 100) / 100)
        ),
      ].sort((a, b) => a - b);

      let summary;
      if (uniqueVol.length === 1) {
        const m2s = formatM2(uniqueVol[0]);
        summary = isMegaWarehouse
          ? `Найдено ${inRange.length} ${pluralBoxes(inRange.length)} — ${m2s} м² ≈ ${formatM2(
              uniqueVol[0] * MEGA_TOWER_CEILING_M
            )} м³ (потолки ${MEGA_TOWER_CEILING_M} м). Выберите на схеме.`
          : `Найдено ${inRange.length} ${pluralBoxes(
              inRange.length
            )} размером ${m2s} м² — выберите на схеме.`;
      } else {
        const lo = formatM2(uniqueVol[0]);
        const hi = formatM2(uniqueVol[uniqueVol.length - 1]);
        summary = isMegaWarehouse
          ? `Найдено ${inRange.length} ${pluralBoxes(inRange.length)} (${lo}–${hi} м², ≈ ${formatM2(
              uniqueVol[0] * MEGA_TOWER_CEILING_M
            )}–${formatM2(uniqueVol[uniqueVol.length - 1] * MEGA_TOWER_CEILING_M)} м³). Выберите на схеме.`
          : `Найдено ${inRange.length} ${pluralBoxes(
              inRange.length
            )} (${lo}–${hi} м²) — выберите на схеме.`;
      }

      return { boxes: inRange, summary };
    },
    [individualBoxes, isMegaWarehouse]
  );

  useEffect(() => {
    setLastSearchedSize(null);
    onHighlightedBoxes?.([]);
  }, [selectedWarehouse?.id, selectedMap, onHighlightedBoxes]);

  const handleSearch = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      onHighlightedBoxes?.([]);
      setLastSearchedSize(null);
      return;
    }
    const { boxes } = findMatchingBoxes(trimmed);
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
      {isMegaWarehouse && (
        <p className="text-white/85 text-xs text-center leading-snug px-2 max-w-md mx-auto">
          Объём в м³ = площадь (м²) × {MEGA_TOWER_CEILING_M} м — высота потолков.
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center justify-center">
        <div className="flex items-center gap-2 bg-white/15 backdrop-blur rounded-xl px-4 py-2.5 w-full sm:w-auto h-12 sm:h-12">
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.5"
            placeholder="5"
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

      {result?.summary && (
        <p className="text-white text-sm font-medium text-center leading-snug px-1 max-w-xl mx-auto">
          {result.summary}
        </p>
      )}
    </div>
  );
}

export default memo(BoxCalculator);
