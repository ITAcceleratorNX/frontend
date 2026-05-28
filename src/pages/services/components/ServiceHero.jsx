import React, { useEffect, useRef, useState } from 'react';
import { ChevronRight, Play } from 'lucide-react';

/**
 * Compact top block: title + short description + CTA, with explanation video next to it.
 * No big hero-image, no dark gradient — the new pages live on the main site.
 *
 * Video is lazy-loaded on first scroll into view (IntersectionObserver), shows poster
 * with a play button until the user clicks (no autoplay to avoid distracting LCP).
 */
export default function ServiceHero({
  badge,
  title,
  description,
  ctaLabel = 'Рассчитать стоимость',
  onCtaClick,
  videoSrc,
  videoPoster,
  videoTitle,
}) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handlePlay = () => {
    setIsPlaying(true);
    const el = videoRef.current;
    if (!el) return;
    el.load();
    const p = el.play();
    if (p !== undefined && typeof p.catch === 'function') p.catch(() => {});
  };

  return (
    <section className="w-full bg-stone-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10 items-center">
          <div className="lg:col-span-6">
            {badge && (
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-[#31876D]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#31876D]">
                {badge}
              </span>
            )}
            <h1 className="font-soyuz-grotesk text-3xl font-bold leading-tight text-[#202422] sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#5C625F] sm:text-base">
              {description}
            </p>
            {onCtaClick && (
              <button
                type="button"
                onClick={onCtaClick}
                className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#31876D] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#2a7260] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#31876D] focus-visible:ring-offset-2 sm:h-14 sm:px-8 sm:text-base"
              >
                {ctaLabel}
                <ChevronRight size={16} aria-hidden />
              </button>
            )}
          </div>

          {videoSrc ? (
            <div ref={containerRef} className="lg:col-span-6">
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                <video
                  ref={videoRef}
                  poster={videoPoster}
                  controls={isPlaying}
                  playsInline
                  preload="metadata"
                  title={videoTitle ?? title}
                  className="absolute inset-0 h-full w-full object-cover"
                >
                  {isVisible && isPlaying ? (
                    <source src={videoSrc} type="video/mp4" />
                  ) : null}
                  Ваш браузер не поддерживает воспроизведение видео.
                </video>
                {!isPlaying && (
                  <button
                    type="button"
                    onClick={handlePlay}
                    aria-label="Воспроизвести видео"
                    className="absolute inset-0 flex items-center justify-center bg-black/15 transition-colors hover:bg-black/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/95 shadow-lg transition-transform hover:scale-105 sm:h-20 sm:w-20">
                      <Play size={28} className="ml-1 text-[#31876D]" fill="currentColor" />
                    </span>
                  </button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
