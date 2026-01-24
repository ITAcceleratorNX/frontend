import React, { memo, useEffect } from 'react';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import Routing from './routing';
import './styles/global.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from '../shared/context/AuthContext';
import ResponseInterceptor from '../shared/components/ResponseInterceptor';
import ScrollToTop from "../components/ScrollToTop.jsx";

// Полностью отключаем рефетчинг при фокусе окна
focusManager.setEventListener(() => {
  return () => {}; // Пустая функция для отключения обработчиков
});

// Создаем клиент для React Query с оптимизированными настройками
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Отключаем автоматическое обновление при фокусе окна
      refetchOnMount: false, // Отключаем перезапрос при монтировании компонентов
      retry: 1, // Одна повторная попытка при ошибке
      staleTime: 30 * 60 * 1000, // Данные считаются свежими в течение 30 минут
      cacheTime: 60 * 60 * 1000, // Кеш хранится 60 минут
      refetchOnReconnect: false, // Отключаем автоматическое обновление при восстановлении соединения
    },
  },
});

// Компонент уведомлений для предотвращения ререндеров
const NotificationContainer = memo(() => (
  <ToastContainer
    position="top-right"
    autoClose={3000}
    hideProgressBar={false}
    newestOnTop={true}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
  />
));

NotificationContainer.displayName = 'NotificationContainer';

// Основной компонент приложения с мемоизацией
const App = memo(() => {
  // Применяем шрифт Montserrat ко всему приложению через Tailwind класс font-sans
  if (import.meta.env.DEV) {
    console.log('Рендеринг корневого компонента App');
  }
  
  // Сбрасываем масштаб viewport при загрузке приложения на мобильных устройствах
  useEffect(() => {
    const resetViewportZoom = () => {
      const viewport = document.querySelector('meta[name="viewport"]');
      if (viewport) {
        const originalContent = viewport.getAttribute('content');
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        setTimeout(() => {
          viewport.setAttribute('content', originalContent || 'width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes');
        }, 50);
      }
    };
    
    // Сбрасываем масштаб при загрузке
    resetViewportZoom();
    setTimeout(resetViewportZoom, 100);
    setTimeout(resetViewportZoom, 300);
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="font-sans">
            <ResponseInterceptor />
            <Routing />
            <NotificationContainer />
          </div>
        </BrowserRouter>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
    </QueryClientProvider>
  );
});

App.displayName = 'App';

export default App;