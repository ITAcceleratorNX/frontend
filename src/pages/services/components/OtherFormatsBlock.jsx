import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const ALL_FORMATS = {
  INDIVIDUAL: {
    title: 'Индивидуальное хранение',
    description: 'Личный бокс, доступ 24/7.',
    to: '/individual-storage',
  },
  CLOUD: {
    title: 'Облачное хранение',
    description: 'Мы забираем, храним и возвращаем.',
    to: '/cloud-storage',
  },
  LOCKERS: {
    title: 'Камера хранения',
    description: 'Краткосрочное хранение от 1 дня.',
    to: '/storage-room',
  },
};

/**
 * Compact 2-link block at the bottom of each service page.
 * Per ТЗ: must NOT duplicate main "Форматы хранения" section.
 */
export default function OtherFormatsBlock({ exclude }) {
  const items = Object.entries(ALL_FORMATS).filter(([key]) => key !== exclude);

  return (
    <section className="w-full bg-white py-10 sm:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-base font-semibold text-[#5C625F] sm:text-lg">
          Другие форматы хранения
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map(([key, item]) => (
            <Link
              key={key}
              to={item.to}
              className="group flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-[#31876D]/40 hover:bg-[#F7FAF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31876D] focus-visible:ring-offset-2 sm:p-5"
            >
              <div>
                <p className="text-base font-semibold text-[#202422]">{item.title}</p>
                <p className="mt-0.5 text-sm text-[#5C625F]">{item.description}</p>
              </div>
              <ArrowRight
                className="h-5 w-5 shrink-0 text-[#5C625F] transition-transform group-hover:translate-x-1 group-hover:text-[#31876D]"
                aria-hidden
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
