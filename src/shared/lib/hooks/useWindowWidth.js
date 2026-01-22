import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

/**
 * Хук для отслеживания ширины окна браузера
 * @returns {number} Текущая ширина окна
 */
export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(() => {
    if (typeof window !== 'undefined') return window.innerWidth;
    return 1024;
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowWidth;
};

/**
 * Утилитарные функции для проверки типа устройства.
 * isMobile использует matchMedia + change: обновляется сразу при переключении
 * устройства в DevTools и при resize окна (без перезагрузки).
 */
export const useDeviceType = () => {
  const width = useWindowWidth();

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    setIsMobile(mq.matches);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return {
    isMobile,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isLarge: width >= 1280,
    width
  };
}; 