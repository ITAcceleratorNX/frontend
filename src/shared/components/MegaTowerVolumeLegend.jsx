import React from 'react';

/** Высота потолков Mega Tower для расчёта объёма (м³) по площади (м²). */
export const MEGA_TOWER_CEILING_M = 3;

/**
 * Компактная схема: «комната» в изометрии + подпись высоты 3 м и связь м² → м³.
 */
export default function MegaTowerVolumeLegend({ className = '' }) {
  return (
    <div
      className={`pointer-events-none select-none rounded-xl border border-white/80 bg-white/95 p-2.5 shadow-lg backdrop-blur-sm ${className}`}
      role="img"
      aria-label="Схема бокса: высота потолков 3 метра, объём в кубометрах равен площади в квадратных метрах, умноженной на 3"
    >
      <p className="mb-1.5 text-center text-[11px] font-semibold leading-tight text-[#273655]">
        Потолки 3&nbsp;м · объём в м³
      </p>
      <svg viewBox="0 0 200 112" className="mx-auto h-[72px] w-full max-w-[220px]" aria-hidden>
        <defs>
          <linearGradient id="megaFloor" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#C5E0DB" />
            <stop offset="100%" stopColor="#9DCFC4" />
          </linearGradient>
          <linearGradient id="megaWall" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#E8F5F2" />
            <stop offset="100%" stopColor="#B8DDD4" />
          </linearGradient>
        </defs>
        {/* Пол (параллелограмм) */}
        <path
          d="M 38 78 L 118 62 L 168 78 L 88 94 Z"
          fill="url(#megaFloor)"
          stroke="#31876D"
          strokeWidth="1.5"
        />
        {/* Задняя стена */}
        <path
          d="M 38 78 L 38 38 L 118 22 L 118 62 Z"
          fill="url(#megaWall)"
          stroke="#31876D"
          strokeWidth="1.5"
        />
        {/* Боковая стена */}
        <path
          d="M 118 62 L 118 22 L 168 38 L 168 78 Z"
          fill="#D4EDE8"
          stroke="#31876D"
          strokeWidth="1.5"
        />
        {/* Ребро высоты (условная линия у заднего угла) */}
        <line x1="38" y1="78" x2="38" y2="38" stroke="#31876D" strokeWidth="2" strokeLinecap="round" />
        {/* Стрелка высоты */}
        <polygon points="34,42 42,42 38,32" fill="#31876D" />
        <polygon points="34,74 42,74 38,84" fill="#31876D" />
        <text x="22" y="62" fill="#1e4d42" fontSize="11" fontWeight="700" fontFamily="Montserrat, system-ui, sans-serif">
          3 м
        </text>
        {/* Подпись площадь → объём */}
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fill="#273655"
          fontSize="10"
          fontFamily="Montserrat, system-ui, sans-serif"
        >
          м³ = м² × 3
        </text>
      </svg>
    </div>
  );
}
