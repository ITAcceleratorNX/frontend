import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Thermometer, Droplets, Check } from "lucide-react";

const ACCENT = "#2D7A4D";
const TEXT_MAIN = "#1A1A1A";
const TEXT_MUTED = "#808080";
const STATUS_BG = "#E6F4EA";
const BORDER = "#E8E8E8";

function clamp(n, lo, hi) {
  return Math.min(hi, Math.max(lo, n));
}

function nextTemperature(prev) {
  const mag = Math.random() < 0.5 ? 0.1 : 0.2;
  let sign = Math.random() < 0.5 ? -1 : 1;
  if (prev >= 21.8) sign = -1;
  if (prev <= 20.5) sign = 1;
  const next = Number((prev + sign * mag).toFixed(1));
  return clamp(next, 20.5, 21.8);
}

function nextHumidity(prev) {
  if (prev >= 51) return prev - 1;
  if (prev <= 46) return prev + 1;
  return prev + (Math.random() < 0.5 ? -1 : 1);
}

function pushHistory(prev, next) {
  return [prev[1], prev[2], next];
}

function MiniClimateGraph({ values, yMin, yMax, formatLabel }) {
  const w = 100;
  const h = 40;
  const padY = 10;
  const baselineY = h - 2;
  const xs = [14, 50, 86];
  const dotR = 2.65;
  const dotStroke = 0.95;

  const toY = (v) => {
    const t = (v - yMin) / (yMax - yMin || 1);
    return h - padY - t * (h - 2 * padY);
  };

  const linePath = values
    .map((v, i) => `${i === 0 ? "M" : "L"} ${xs[i]} ${toY(v)}`)
    .join(" ");

  return (
    <div className="w-full mt-5">
      <svg
        viewBox={`0 0 ${w} ${h + 14}`}
        className="w-full h-auto block"
        aria-hidden
      >
        {values.map((v, i) => (
          <line
            key={i}
            x1={xs[i]}
            y1={toY(v)}
            x2={xs[i]}
            y2={baselineY}
            stroke="#D8D8D8"
            strokeWidth="0.42"
            strokeDasharray="2 2"
          />
        ))}
        <path
          d={linePath}
          fill="none"
          stroke={ACCENT}
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {values.map((v, i) => {
          const cx = xs[i];
          const cy = toY(v);
          return (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={dotR}
              fill="#FFFFFF"
              stroke={ACCENT}
              strokeWidth={dotStroke}
            />
          );
        })}
        {values.map((v, i) => (
          <text
            key={`l-${i}`}
            x={xs[i]}
            y={h + 10}
            textAnchor="middle"
            fill={TEXT_MUTED}
            fontSize="8"
            fontFamily="system-ui, sans-serif"
          >
            {formatLabel(v)}
          </text>
        ))}
      </svg>
    </div>
  );
}

function SensorCard({
  title,
  Icon,
  valueKey,
  valueDisplay,
  normLabel,
  history,
  yMin,
  yMax,
  formatGraphLabel,
  statusText,
}) {
  return (
    <article
      className="rounded-2xl border bg-white px-5 py-6 sm:px-6 sm:py-8 flex flex-col items-center text-center shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      style={{ borderColor: BORDER }}
    >
      <div
        className="flex h-11 w-11 items-center justify-center rounded-full mb-3"
        style={{ backgroundColor: STATUS_BG }}
      >
        <Icon size={22} strokeWidth={2} style={{ color: ACCENT }} aria-hidden />
      </div>
      <h3
        className="text-[15px] sm:text-base font-medium mb-1"
        style={{ color: TEXT_MAIN }}
      >
        {title}
      </h3>
      <motion.span
        key={valueKey}
        className="text-2xl sm:text-3xl font-bold tabular-nums tracking-tight"
        style={{ color: TEXT_MAIN }}
        initial={{ opacity: 0.72 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {valueDisplay}
      </motion.span>
      <p className="text-xs sm:text-sm mt-1" style={{ color: TEXT_MUTED }}>
        {normLabel}
      </p>
      <MiniClimateGraph
        values={history}
        yMin={yMin}
        yMax={yMax}
        formatLabel={formatGraphLabel}
      />
      <div
        className="mt-5 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:text-sm font-medium"
        style={{ backgroundColor: STATUS_BG, color: ACCENT }}
      >
        <span
          className="flex h-5 w-5 items-center justify-center rounded-full bg-white/80"
          aria-hidden
        >
          <Check size={12} strokeWidth={3} style={{ color: ACCENT }} />
        </span>
        {statusText}
      </div>
    </article>
  );
}

export default function ClimateSensorsSection() {
  const [tempHistory, setTempHistory] = useState(() => [20.8, 20.9, 21.0]);
  const [humHistory, setHumHistory] = useState(() => [47, 48, 49]);

  const tickTemp = useCallback(() => {
    setTempHistory((h) => pushHistory(h, nextTemperature(h[2])));
  }, []);

  const tickHum = useCallback(() => {
    setHumHistory((h) => pushHistory(h, nextHumidity(h[2])));
  }, []);

  useEffect(() => {
    const id = setInterval(tickTemp, 15000);
    return () => clearInterval(id);
  }, [tickTemp]);

  useEffect(() => {
    const id = setInterval(tickHum, 12000);
    return () => clearInterval(id);
  }, [tickHum]);

  const tempCurrent = tempHistory[2];
  const humCurrent = humHistory[2];

  return (
    <section className="w-full bg-white py-10 sm:py-14 md:py-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-8 max-w-5xl">
        <h2
          className="font-soyuz-grotesk text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-3"
          style={{ color: TEXT_MAIN }}
        >
          Климат под контролем
        </h2>
        <p
          className="text-sm sm:text-base text-center mb-10 sm:mb-12"
          style={{ color: TEXT_MUTED }}
        >
          Данные обновляются каждые 12 секунд
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 md:gap-8">
          <SensorCard
            title="Температура"
            Icon={Thermometer}
            valueKey={String(tempCurrent)}
            valueDisplay={`${tempCurrent.toFixed(1)}°C`}
            normLabel="Норма: 20.5–21.8°C"
            history={tempHistory}
            yMin={20.4}
            yMax={21.9}
            formatGraphLabel={(v) => `${v.toFixed(1)}°`}
            statusText="Стабильно"
          />
          <SensorCard
            title="Влажность"
            Icon={Droplets}
            valueKey={String(humCurrent)}
            valueDisplay={`${humCurrent}%`}
            normLabel="Норма: 46–51%"
            history={humHistory}
            yMin={45.5}
            yMax={51.5}
            formatGraphLabel={(v) => `${Math.round(v)}%`}
            statusText="В пределах нормы"
          />
        </div>
      </div>
    </section>
  );
}
