import React, { memo } from 'react';
import { ChevronRight } from 'lucide-react';
// Используем то же лого, что и на главной странице сайта (см. widgets/Header).
import logo from '@/assets/novaloga.png';

/**
 * Minimal LP header — logo only + a CTA button. No links to the main site
 * navigation per ТЗ §2 (LPs are isolated from the main menu).
 *
 * Лого визуально совпадает с главной страницей (novaloga.png + надпись
 * "EXTRA SPACE"), но клик НЕ ведёт на главную — изоляция LP сохраняется.
 */
function LpHeader({ onBookClick, ctaLabel = 'Оставить заявку' }) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-black/5 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 sm:h-16 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <img
            src={logo}
            alt="ExtraSpace Logo"
            className="h-7 sm:h-8 w-auto object-contain"
          />
          <span className="font-bold text-[#1F2937] text-xs sm:text-sm tracking-wide hidden min-[380px]:inline">
            EXTRA SPACE
          </span>
        </div>
        <button
          type="button"
          onClick={onBookClick}
          className="inline-flex h-10 items-center gap-1.5 rounded-full bg-[#31876D] px-4 text-xs font-semibold text-white transition hover:bg-[#2a7260] sm:h-11 sm:px-5 sm:text-sm"
        >
          {ctaLabel}
          <ChevronRight size={14} aria-hidden />
        </button>
      </div>
    </header>
  );
}

export default memo(LpHeader);
