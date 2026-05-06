import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { BookingCtaButton } from '../components/CtaButtons.jsx';

/**
 * Lightweight volume calculator — slider over rooms (0.5..5).
 * Maps rooms → recommended bоx size & price (rough estimation, matches BOXES table).
 */

const ROOM_OPTIONS = [
  { rooms: 0.5, label: 'Студия / 1 комната', size: '2 м²', price: 12000, sizeKey: '2' },
  { rooms: 1, label: '1 комната + балкон', size: '4 м²', price: 24000, sizeKey: '4' },
  { rooms: 2, label: '2 комнаты', size: '6 м²', price: 36000, sizeKey: '6' },
  { rooms: 3, label: '3 комнаты', size: '10 м²', price: 60000, sizeKey: '10' },
  { rooms: 4, label: '3+ комнаты / большой переезд', size: '15 м²', price: null, sizeKey: '15' },
  { rooms: 5, label: 'Бизнес / товарные остатки', size: '25+ м²', price: null, sizeKey: '25' },
];

function format(num) {
  return num.toLocaleString('ru-RU');
}

export default function VolumeCalculator({ onBook }) {
  const [idx, setIdx] = useState(2);
  const current = useMemo(() => ROOM_OPTIONS[idx], [idx]);

  return (
    <section className="w-full bg-white py-16 sm:py-20 lg:py-24" id="kalkulyator">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#e5e9ed] bg-[#F7FAF9] p-6 sm:p-10">
          <header className="text-center">
            <h2 className="font-soyuz-grotesk text-3xl font-bold text-[#202422] sm:text-4xl">
              Калькулятор объёма
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Передвиньте бегунок — подскажем подходящий размер бокса и стоимость аренды.
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">Сколько у вас вещей?</p>
              <p className="text-xl font-bold text-[#273655] sm:text-2xl">{current.label}</p>
            </div>

            <input
              type="range"
              min={0}
              max={ROOM_OPTIONS.length - 1}
              step={1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="w-full accent-[#31876D]"
              aria-label="Сколько у вас вещей"
            />

            <div className="flex justify-between text-xs text-[#6b7280]">
              <span>Студия</span>
              <span>2 комн.</span>
              <span>3+ комн.</span>
              <span>Бизнес</span>
            </div>

            <div className="grid gap-3 rounded-2xl border border-[#e5e9ed] bg-white p-5 sm:grid-cols-3 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">Рекомендуем</p>
                <p className="font-soyuz-grotesk text-2xl font-bold text-[#202422]">{current.size}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">Стоимость</p>
                <p className="text-2xl font-bold text-[#31876D]">
                  {current.price ? `${format(current.price)} ₸/мес` : 'по запросу'}
                </p>
              </div>
              <div className="sm:text-right">
                <BookingCtaButton
                  section="calculator"
                  serviceType="individual"
                  boxSize={current.sizeKey}
                  onClick={onBook}
                  variant="primary"
                  className="w-full sm:w-auto"
                >
                  Забронировать
                  <ChevronRight size={16} aria-hidden />
                </BookingCtaButton>
              </div>
            </div>

            <p className="text-center text-xs text-[#6b7280]">
              Финальная стоимость зависит от срока и доступности бокса. Точный расчёт менеджер пришлёт после заявки.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
