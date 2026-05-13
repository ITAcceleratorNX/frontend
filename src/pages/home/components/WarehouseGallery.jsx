import React, { useState, useCallback, memo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useWindowWidth } from '@/shared/lib/hooks/useWindowWidth';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  LIVE_CAMERA_IDS,
  LiveCameraGalleryTile,
} from '@/pages/home/components/WarehouseCctvDashboard.jsx';

function basenameFromGlobKey(key) {
  const seg = key.split('/').pop() ?? key;
  return seg.split('\\').pop() ?? seg;
}

function sortedAssetUrls(globRecord) {
  return Object.entries(globRecord)
    .sort(([a], [b]) =>
      basenameFromGlobKey(a).localeCompare(basenameFromGlobKey(b), undefined, { numeric: true }),
    )
    .map(([, url]) => url);
}

const thumbGlob = import.meta.glob('../../../assets/komfort-city/thumbs/*.webp', {
  eager: true,
  import: 'default',
});
const displayGlob = import.meta.glob('../../../assets/komfort-city/display/*.webp', {
  eager: true,
  import: 'default',
});

const THUMB_URLS = sortedAssetUrls(thumbGlob);
const DISPLAY_URLS = sortedAssetUrls(displayGlob);

/** Имя склада в списке бронирования; для каждого слайда можно задать своё при расширении галереи. */
export const WAREHOUSE_GALLERY_DEFAULT_WAREHOUSE_NAME = 'Жилой комплекс «Комфорт Сити»';

const SLIDES = THUMB_URLS.map((thumb, i) => ({
  thumb,
  display: DISPLAY_URLS[i],
  warehouseName: WAREHOUSE_GALLERY_DEFAULT_WAREHOUSE_NAME,
}));

const IMAGE_COUNT = SLIDES.length;

const MOBILE_BREAKPOINT = 640;

function preloadImageUrls(urls) {
  for (const url of urls) {
    if (!url) continue;
    const img = new Image();
    img.decoding = 'async';
    img.src = url;
  }
}

function WarehouseGallery({ onBookInWarehouse }) {
  const [startIndex, setStartIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const width = useWindowWidth();
  const visibleCount = width < MOBILE_BREAKPOINT ? 2 : 4;

  useEffect(() => {
    setStartIndex((i) => Math.min(i, Math.max(0, IMAGE_COUNT - visibleCount)));
  }, [visibleCount]);

  const maxStartIndex = Math.max(0, IMAGE_COUNT - visibleCount);
  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex < maxStartIndex;

  const handlePrev = useCallback(() => {
    setStartIndex((i) => Math.max(0, i - 4));
  }, []);

  const handleNext = useCallback(() => {
    setStartIndex((i) => Math.min(maxStartIndex, i + 4));
  }, [maxStartIndex]);

  const visibleSlides = SLIDES.slice(startIndex, startIndex + visibleCount);

  /** Предзагрузка превью текущей страницы, следующей и предыдущей — чтобы стрелки не ждали сеть. */
  useEffect(() => {
    if (IMAGE_COUNT === 0) return;
    const urls = new Set();
    const addRange = (from, to) => {
      for (let i = from; i <= to; i += 1) {
        if (i >= 0 && i < IMAGE_COUNT) urls.add(SLIDES[i].thumb);
      }
    };
    addRange(startIndex, startIndex + visibleCount - 1);
    addRange(startIndex + visibleCount, startIndex + visibleCount + 3);
    addRange(startIndex - 4, startIndex - 1);

    preloadImageUrls([...urls]);
  }, [startIndex, visibleCount]);

  /** В лайтбоксе заранее подгружаем соседние кадры (полный размер display/). */
  useEffect(() => {
    if (!lightboxOpen || IMAGE_COUNT === 0) return;
    const urls = [];
    if (lightboxIndex > 0) urls.push(SLIDES[lightboxIndex - 1].display);
    if (lightboxIndex < IMAGE_COUNT - 1) urls.push(SLIDES[lightboxIndex + 1].display);
    preloadImageUrls(urls);
  }, [lightboxOpen, lightboxIndex]);

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

  if (IMAGE_COUNT === 0) {
    return null;
  }

  return (
    <section className="w-full bg-white py-8 sm:py-12 md:py-16 lg:py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90rem] mx-auto">
          <h2 className="text-center font-soyuz-grotesk text-2xl font-bold text-[#202422] sm:mb-5 sm:text-3xl md:mb-6 md:text-4xl lg:text-5xl xl:text-6xl">
            <span className="font-['Montserrat']">Г</span>алерея наших складов
          </h2>

          {LIVE_CAMERA_IDS.length > 0 && (
            <div className="mb-8 sm:mb-10 md:mb-14">
              <p className="mb-3 text-center font-['Montserrat'] text-sm text-[#5a625f] sm:mb-4 sm:text-base">
                Прямая трансляция
              </p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 md:gap-6">
                {LIVE_CAMERA_IDS.map((id) => (
                  <LiveCameraGalleryTile key={id} cameraId={id} />
                ))}
              </div>
            </div>
          )}

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
                {visibleSlides.map((slide, idx) => {
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
                        src={slide.thumb}
                        alt={`Склад Комфорт Сити ${globalIndex + 1}`}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                        decoding="async"
                        loading="eager"
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
          <div className="relative flex h-[max(200px,min(78vh,720px))] w-full items-stretch justify-center bg-black/40">
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <img
                src={lightboxSlide.display}
                alt={`Склад, фото ${lightboxIndex + 1}`}
                className="max-h-full max-w-full object-contain"
                decoding="async"
              />
            </div>
            <div className="relative z-10 flex w-12 shrink-0 items-center justify-center sm:w-14">
              <button
                type="button"
                onClick={handleLightboxPrev}
                disabled={!canLightboxPrev}
                aria-label="Предыдущее фото"
                className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#31876D] text-white shadow-lg outline-none ring-0 transition-colors hover:bg-[#2a735c] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1412] disabled:pointer-events-none disabled:bg-[#31876D]/40 sm:h-12 sm:w-12"
              >
                <ChevronLeft className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>
            <div className="relative z-0 min-w-0 flex-1" aria-hidden="true" />
            <div className="relative z-10 flex w-12 shrink-0 items-center justify-center sm:w-14">
              <button
                type="button"
                onClick={handleLightboxNext}
                disabled={!canLightboxNext}
                aria-label="Следующее фото"
                className="pointer-events-auto flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#31876D] text-white shadow-lg outline-none ring-0 transition-colors hover:bg-[#2a735c] focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0f1412] disabled:pointer-events-none disabled:bg-[#31876D]/40 sm:h-12 sm:w-12"
              >
                <ChevronRight className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>
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
