import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Storage-room (camera) calculator.
 * Inputs: volume in m³ (preset chips), days (1..14).
 * Final price is computed server-side in the StorageLockersSection inside the booking modal.
 */
const INDICATIVE_PRICE_PER_M3_DAY = 4000;

const VOLUME_PRESETS = [
  { volume: 0.25, label: '1 чемодан' },
  { volume: 0.5, label: '2 чемодана + сумка' },
  { volume: 1, label: '3–4 коробки' },
  { volume: 2, label: 'Большой груз' },
];

function formatPrice(num) {
  return `${Math.round(num).toLocaleString('ru-RU')} ₸`;
}

export default function RoomCalculator({ onSubmit }) {
  const [volumeIdx, setVolumeIdx] = useState(1);
  const [days, setDays] = useState(3);

  const current = VOLUME_PRESETS[volumeIdx];
  const perDay = useMemo(
    () => current.volume * INDICATIVE_PRICE_PER_M3_DAY,
    [current],
  );
  const total = perDay * days;

  const handleBook = () => {
    onSubmit?.({
      volume: current.volume,
      days,
      label: current.label,
      estimatedPerDay: perDay,
      estimatedTotal: total,
    });
  };

  return (
    <section id="kalkulyator" className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#e5e9ed] bg-[#F7FAF9] p-5 sm:p-8 lg:p-10">
          <header className="text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl">
              Калькулятор камеры хранения
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Выберите объём и срок — увидите ориентировочную стоимость. Хранение от 1 дня до 2 недель.
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-6">
            <div>
              <p className="mb-3 text-xs uppercase tracking-[0.18em] text-[#6b7280]">Что хотите оставить?</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {VOLUME_PRESETS.map((preset, idx) => {
                  const active = idx === volumeIdx;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => setVolumeIdx(idx)}
                      className={`rounded-2xl border px-3 py-3 text-sm font-medium transition-colors ${
                        active
                          ? 'border-[#31876D] bg-[#31876D] text-white'
                          : 'border-[#e5e9ed] bg-white text-[#202422] hover:border-[#31876D]/40'
                      }`}
                    >
                      <span className="block text-base font-semibold">{preset.volume} м³</span>
                      <span className={`mt-0.5 block text-xs ${active ? 'text-white/85' : 'text-[#6b7280]'}`}>
                        {preset.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">Срок хранения</p>
              <p className="text-xl font-bold text-[#273655] sm:text-2xl">
                {days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}
              </p>
            </div>
            <input
              type="range"
              min={1}
              max={14}
              step={1}
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="w-full accent-[#31876D]"
              aria-label="Срок хранения в днях"
            />
            <div className="flex justify-between text-xs text-[#6b7280]">
              <span>1 день</span>
              <span>7 дней</span>
              <span>14 дней</span>
            </div>

            <div className="grid gap-3 rounded-2xl border border-[#e5e9ed] bg-white p-5 sm:grid-cols-3 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">В сутки</p>
                <p className="text-2xl font-bold text-[#31876D]">{formatPrice(perDay)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">За весь срок</p>
                <p className="text-2xl font-bold text-[#202422]">{formatPrice(total)}</p>
              </div>
              <div className="sm:text-right">
                <button
                  type="button"
                  onClick={handleBook}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#31876D] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2a7260] sm:w-auto sm:text-base"
                >
                  Забронировать
                  <ChevronRight size={16} aria-hidden />
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-[#6b7280]">
              Ориентировочный расчёт по ставке {INDICATIVE_PRICE_PER_M3_DAY.toLocaleString('ru-RU')} ₸/м³ в сутки. Финальная цена с учётом тарифа склада — в окне бронирования.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
