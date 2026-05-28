import React, { useMemo, useState } from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Cloud-storage calculator.
 * Inputs: volume in m³ (slider 0.5..5), months (1..12).
 * Estimation uses a rough indicative rate; final price is calculated server-side
 * inside the booking modal (CloudStorageSummary).
 */
const INDICATIVE_PRICE_PER_M3_MONTH = 9500;

function formatPrice(num) {
  return `${Math.round(num).toLocaleString('ru-RU')} ₸/мес`;
}

const VOLUME_PRESETS = [
  { volume: 0.5, label: '0.5 м³ · сумка-2 коробки' },
  { volume: 1, label: '1 м³ · 4-5 коробок' },
  { volume: 2, label: '2 м³ · мебель из 1 комнаты' },
  { volume: 3, label: '3 м³ · 1-комнатная квартира' },
  { volume: 5, label: '5 м³ · 2-комнатная квартира' },
];

export default function CloudCalculator({ onSubmit }) {
  const [volumeIdx, setVolumeIdx] = useState(2);
  const [months, setMonths] = useState(1);

  const current = VOLUME_PRESETS[volumeIdx];
  const estimatedPerMonth = useMemo(
    () => current.volume * INDICATIVE_PRICE_PER_M3_MONTH,
    [current],
  );
  const total = estimatedPerMonth * months;

  const handleLead = () => {
    onSubmit?.({
      volume: current.volume,
      months,
      label: current.label,
      estimatedPerMonth,
      estimatedTotal: total,
    });
  };

  return (
    <section id="kalkulyator" className="w-full bg-white py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-[#e5e9ed] bg-[#F7FAF9] p-5 sm:p-8 lg:p-10">
          <header className="text-center">
            <h2 className="font-soyuz-grotesk text-2xl font-bold text-[#202422] xs:text-3xl sm:text-4xl">
              Калькулятор облачного хранения
            </h2>
            <p className="mt-3 text-sm text-[#555A65] sm:text-base">
              Укажите объём вещей и срок — увидите ориентировочную стоимость. Точную цену менеджер посчитает после визита курьера.
            </p>
          </header>

          <div className="mt-8 flex flex-col gap-6">
            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">Объём вещей</p>
              <p className="text-xl font-bold text-[#273655] sm:text-2xl">{current.label}</p>
            </div>
            <input
              type="range"
              min={0}
              max={VOLUME_PRESETS.length - 1}
              step={1}
              value={volumeIdx}
              onChange={(e) => setVolumeIdx(Number(e.target.value))}
              className="w-full accent-[#31876D]"
              aria-label="Объём вещей"
            />

            <div className="flex flex-col items-center gap-2 text-center">
              <p className="text-xs uppercase tracking-[0.18em] text-[#6b7280]">Срок хранения</p>
              <p className="text-xl font-bold text-[#273655] sm:text-2xl">
                {months} {months === 1 ? 'месяц' : months < 5 ? 'месяца' : 'месяцев'}
              </p>
            </div>
            <input
              type="range"
              min={1}
              max={12}
              step={1}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full accent-[#31876D]"
              aria-label="Срок хранения в месяцах"
            />

            <div className="grid gap-3 rounded-2xl border border-[#e5e9ed] bg-white p-5 sm:grid-cols-3 sm:p-6">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">В месяц</p>
                <p className="text-2xl font-bold text-[#31876D]">{formatPrice(estimatedPerMonth)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#6b7280]">За весь срок</p>
                <p className="text-2xl font-bold text-[#202422]">
                  {Math.round(total).toLocaleString('ru-RU')} ₸
                </p>
              </div>
              <div className="sm:text-right">
                <button
                  type="button"
                  onClick={handleLead}
                  className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#31876D] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2a7260] sm:w-auto sm:text-base"
                >
                  Оставить заявку
                  <ChevronRight size={16} aria-hidden />
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-[#6b7280]">
              Ориентировочный расчёт по ставке {INDICATIVE_PRICE_PER_M3_MONTH.toLocaleString('ru-RU')} ₸/м³ в месяц. Финальная стоимость — после визита курьера и точного замера объёма.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
