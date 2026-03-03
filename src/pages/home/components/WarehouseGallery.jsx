import React, { useState, useCallback, memo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';

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
const MOBILE_BREAKPOINT = 640;

function WarehouseGallery() {
  const [startIndex, setStartIndex] = useState(0);
  const width = useWindowWidth();
  const visibleCount = width < MOBILE_BREAKPOINT ? 2 : 4;

  useEffect(() => {
    setStartIndex((i) => Math.min(i, Math.max(0, IMAGES.length - visibleCount)));
  }, [visibleCount]);

  const maxStartIndex = Math.max(0, IMAGES.length - visibleCount);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex < maxStartIndex;

  const handlePrev = useCallback(() => {
    setStartIndex((i) => Math.max(0, i - 1));
  }, []);

  const handleNext = useCallback(() => {
    setStartIndex((i) => Math.min(maxStartIndex, i + 1));
  }, [maxStartIndex]);

  const visibleImages = IMAGES.slice(startIndex, startIndex + visibleCount);

  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90rem] mx-auto">
          <h2 className="font-soyuz-grotesk text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-[#202422] text-center mb-6 sm:mb-8 md:mb-12">
            Галерея складов
          </h2>
          <p className="text-sm sm:text-base text-[#555A65] text-center mb-6 sm:mb-8 md:mb-12">
            Склад Жилого комплекса Комфорт Сити
          </p>

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
                {visibleImages.map((src, idx) => (
                  <div
                    key={`${startIndex}-${idx}`}
                    className="aspect-[3/4] min-h-[140px] sm:min-h-[200px] md:min-h-[260px] lg:min-h-[320px] rounded-xl overflow-hidden bg-gray-100"
                  >
                    <img
                      src={src}
                      alt={`Склад Комфорт Сити ${startIndex + idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
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
    </section>
  );
}

export default memo(WarehouseGallery);
