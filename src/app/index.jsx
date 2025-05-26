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
  // Отключаем повторное подключение обработчиков focusManager при каждом рендере
  useEffect(() => {
    // Явно отключаем рефетчинг при фокусе для всего приложения
    focusManager.setFocused(false);
    return () => {};
  }, []);
  
  if (import.meta.env.DEV) {
    console.log('Рендеринг корневого компонента App');
  }
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ResponseInterceptor />
          <Routing />
          <NotificationContainer />
        </BrowserRouter>
      </AuthProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />}
    </QueryClientProvider>
  );
});

App.displayName = 'App';

export default App; 