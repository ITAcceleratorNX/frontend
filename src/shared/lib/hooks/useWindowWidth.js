import { useState, useEffect } from 'react';

/**
 * Хук для отслеживания ширины окна браузера
 * @returns {number} Текущая ширина окна
 */
export const useWindowWidth = () => {
  const [windowWidth, setWindowWidth] = useState(() => {
    // Проверяем, доступен ли объект window (SSR compatibility)
    if (typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return 1024; // Значение по умолчанию для SSR
  });

  useEffect(() => {
    // Функция для обновления ширины окна
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Добавляем слушатель события изменения размера окна
    window.addEventListener('resize', handleResize);

    // Получаем текущую ширину окна при монтировании
    handleResize();

    // Очищаем слушатель при размонтировании
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowWidth;
};

/**
 * Утилитарные функции для проверки типа устройства
 */
export const useDeviceType = () => {
  const width = useWindowWidth();

  return {
    isMobile: width < 768,
    isTablet: width >= 768 && width < 1024,
    isDesktop: width >= 1024,
    isLarge: width >= 1280,
    width
  };
}; 