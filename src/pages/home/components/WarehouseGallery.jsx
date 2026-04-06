import React, { useState, useCallback, memo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';

import img1 from '@/assets/komfort-city/20260226-IMG_5194.webp';
import img2 from '@/assets/komfort-city/20260226-IMG_5195.webp';
import img3 from '@/assets/komfort-city/20260226-IMG_5196.webp';
import img4 from '@/assets/komfort-city/20260226-IMG_5197.webp';
import img5 from '@/assets/komfort-city/20260226-IMG_5198.webp';
import img6 from '@/assets/komfort-city/20260226-IMG_5202.webp';
import img7 from '@/assets/komfort-city/20260226-IMG_5203.webp';
import img8 from '@/assets/komfort-city/20260226-IMG_5204.webp';
import img9 from '@/assets/komfort-city/20260226-IMG_5205.webp';
import img10 from '@/assets/komfort-city/20260226-IMG_5206.webp';
import img11 from '@/assets/komfort-city/20260226-IMG_5207.webp';
import img12 from '@/assets/komfort-city/20260226-IMG_5208.webp';
import img13 from '@/assets/komfort-city/20260226-IMG_5209.webp';
import img14 from '@/assets/komfort-city/20260226-IMG_5210.webp';
import img15 from '@/assets/komfort-city/20260226-IMG_5211.webp';
import img16 from '@/assets/komfort-city/20260226-IMG_5212.webp';
import img17 from '@/assets/komfort-city/20260226-IMG_5213.webp';
import img18 from '@/assets/komfort-city/20260226-IMG_5214.webp';
import img19 from '@/assets/komfort-city/20260226-IMG_5215.webp';
import img20 from '@/assets/komfort-city/20260226-IMG_5216.webp';
import img21 from '@/assets/komfort-city/20260226-IMG_5217.webp';
import img22 from '@/assets/komfort-city/20260226-IMG_5218.webp';
import img23 from '@/assets/komfort-city/20260226-IMG_5219.webp';
import img24 from '@/assets/komfort-city/20260226-IMG_5220.webp';

const IMAGES = [img1, img2, img3, img4, img5, img6, img7, img8, img9, img10, img11, img12, img13, img14, img15, img16, img17, img18, img19, img20, img21, img22, img23, img24];

/** Имя склада в списке бронирования; для каждого слайда можно задать своё при расширении галереи. */
export const WAREHOUSE_GALLERY_DEFAULT_WAREHOUSE_NAME = 'Жилой комплекс «Комфорт Сити»';

const SLIDES = IMAGES.map((src) => ({
  src,
  warehouseName: WAREHOUSE_GALLERY_DEFAULT_WAREHOUSE_NAME,
}));

const MOBILE_BREAKPOINT = 640;

function WarehouseGallery({ onBookInWarehouse }) {
  const [startIndex, setStartIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const width = useWindowWidth();
  const visibleCount = width < MOBILE_BREAKPOINT ? 2 : 4;

  useEffect(() => {
    setStartIndex((i) => Math.min(i, Math.max(0, IMAGES.length - visibleCount)));
  }, [visibleCount]);

  const maxStartIndex = Math.max(0, IMAGES.length - visibleCount);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex < maxStartIndex;

  const handlePrev = useCallback(() => {
    setStartIndex((i) => Math.max(0, i - 4));
  }, []);

  const handleNext = useCallback(() => {
    setStartIndex((i) => Math.min(maxStartIndex, i + 4));
  }, [maxStartIndex]);

  const visibleImages = IMAGES.slice(startIndex, startIndex + visibleCount);

  const openLightbox = useCallback((globalIndex) => {
    setLightboxIndex(Math.max(0, Math.min(SLIDES.length - 1, globalIndex)));
    setLightboxOpen(true);
  }, []);

  const lightboxSlide = SLIDES[lightboxIndex] ?? SLIDES[0];
  const canLightboxPrev = lightboxIndex > 0;
  const canLightboxNext = lightboxIndex < SLIDES.length - 1;

  const handleLightboxPrev = useCallback(() => {
    setLightboxIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleLightboxNext = useCallback(() => {
    setLightboxIndex((i) => Math.min(SLIDES.length - 1, i + 1));
  }, []);

  const handleBookClick = useCallback(() => {
    const name = lightboxSlide?.warehouseName;
    if (name && typeof onBookInWarehouse === 'function') {
      onBookInWarehouse(name);
    }
    setLightboxOpen(false);
  }, [lightboxSlide, onBookInWarehouse]);

  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90rem] mx-auto">
          <h2 className="font-soyuz-grotesk text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#202422] text-center mb-6 sm:mb-8 md:mb-20">
            <span className="font-['Montserrat']">Г</span>алерея наших складов
          </h2>

          <div className="flex items-center gap-3 sm:gap-6 md:gap-8 lg:gap-12">
            <button
              type="button"
              onClick={handlePrev}
              disabled={!canGoPrev}
              aria-label="Предыдущие фото"
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#31876D] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <div className="flex-1 min-w-0 overflow-hidden">
              <div className={`grid gap-3 sm:gap-4 md:gap-6 ${visibleCount === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
                {visibleImages.map((src, idx) => {
                  const globalIndex = startIndex + idx;
                  return (
                    <button
                      key={`${startIndex}-${idx}`}
                      type="button"
                      onClick={() => openLightbox(globalIndex)}
                      className="aspect-[3/4] min-h-[140px] sm:min-h-[200px] md:min-h-[260px] lg:min-h-[320px] rounded-xl overflow-hidden bg-gray-100 text-left ring-offset-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#31876D] focus-visible:ring-offset-2"
                      aria-label={`Открыть фото склада ${globalIndex + 1}`}
                    >
                      <img
                        src={src}
                        alt={`Склад Комфорт Сити ${globalIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label="Следующие фото"
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-[#31876D] text-white flex items-center justify-center hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[min(96vw,920px)] w-full gap-0 border-0 bg-[#0f1412] p-0 text-white shadow-2xl sm:rounded-2xl overflow-hidden [&>button]:right-3 [&>button]:top-3 [&>button]:text-white [&>button]:opacity-90 [&>button]:hover:opacity-100 [&>button]:ring-offset-[#0f1412]"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <DialogTitle className="sr-only">Просмотр фото склада</DialogTitle>
          <div className="relative flex max-h-[min(78vh,720px)] min-h-[200px] w-full items-center justify-center bg-black/40">
            <img
              src={lightboxSlide.src}
              alt={`Склад, фото ${lightboxIndex + 1}`}
              className="max-h-[min(78vh,720px)] w-full object-contain"
            />
            <button
              type="button"
              onClick={handleLightboxPrev}
              disabled={!canLightboxPrev}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#31876D] p-2.5 text-white shadow-lg transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-35 sm:left-4 sm:p-3"
            >
              <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
            <button
              type="button"
              onClick={handleLightboxNext}
              disabled={!canLightboxNext}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-[#31876D] p-2.5 text-white shadow-lg transition-opacity hover:opacity-90 disabled:pointer-events-none disabled:opacity-35 sm:right-4 sm:p-3"
            >
              <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
          <div className="border-t border-white/10 bg-white px-4 py-4 sm:px-6 sm:py-5">
            <button
              type="button"
              onClick={handleBookClick}
              disabled={typeof onBookInWarehouse !== 'function'}
              className="w-full rounded-2xl bg-[#31876D] py-3.5 px-4 text-center text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:text-base"
            >
              Подобрать бокс в этом складе
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

export default memo(WarehouseGallery);
