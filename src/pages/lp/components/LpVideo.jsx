import React, { useEffect, useRef, useState } from 'react';

/**
 * Self-hosted LP video: lazy source via IntersectionObserver, muted autoplay,
 * playsInline for iOS, controls for sound/seek.
 */
export default function LpVideo({ src, poster, title }) {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' },
    );

    const node = containerRef.current;
    if (node) {
      observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const el = videoRef.current;
    if (!el) return;
    el.load();
    const playAttempt = el.play();
    if (playAttempt !== undefined && typeof playAttempt.catch === 'function') {
      playAttempt.catch(() => {});
    }
  }, [isVisible]);

  return (
    <section
      ref={containerRef}
      className="box-border w-full px-4 py-10"
      aria-label={title}
    >
      <div className="mx-auto max-w-[700px]">
        <video
          ref={videoRef}
          className="block aspect-[848/464] w-full rounded-2xl bg-black shadow-[0_8px_24px_rgba(0,0,0,0.12)]"
          poster={poster}
          controls
          muted
          autoPlay
          playsInline
          preload="metadata"
          title={title}
        >
          {isVisible ? <source src={src} type="video/mp4" /> : null}
          Ваш браузер не поддерживает воспроизведение видео.
        </video>
      </div>
    </section>
  );
}
