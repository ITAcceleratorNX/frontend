import React, { memo, useEffect } from 'react';
import { QueryClient, QueryClientProvider, focusManager } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import Routing from './routing';
import './styles/global.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../shared/styles/toast.css';
import { AuthProvider } from '../shared/context/AuthContext';
import ResponseInterceptor from '../shared/components/ResponseInterceptor';
import ScrollToTop from "../components/ScrollToTop.jsx";
import { useSSENotifications } from '../shared/lib/hooks/useSSENotifications';
import {
  getUtmParams,
  mapUtmSourceToLeadSource,
  getOrCreateVisitorId,
  cleanUrlFromUtm,
} from '../shared/lib/utm';
import { trackVisit } from '../shared/api/visitsApi';

const LEAD_SOURCE_STORAGE_KEY = 'extraspace_lead_source';
const LEAD_SOURCE_SHOWN_KEY = 'extraspace_lead_source_shown';
const VISIT_SENT_KEY = 'extraspace_visit_sent';

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
    autoClose={5000}
    hideProgressBar
    closeOnClick
    newestOnTop
    closeButton={false}
    icon={false}
    draggable
    pauseOnHover={false}
    pauseOnFocusLoss={false}
    theme="light"
  />
));

NotificationContainer.displayName = 'NotificationContainer';

// Компонент для инициализации SSE уведомлений
const SSEProvider = memo(() => {
  useSSENotifications();
  return null;
});

SSEProvider.displayName = 'SSEProvider';

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

  // UTM: при первом заходе с UTM сохраняем lead_source и отправляем визит
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const utm = getUtmParams();
    const utmSource = utm.utm_source;
    if (utmSource) {
      const leadSource = mapUtmSourceToLeadSource(utmSource);
      if (leadSource) {
        localStorage.setItem(LEAD_SOURCE_STORAGE_KEY, leadSource);
        localStorage.setItem(LEAD_SOURCE_SHOWN_KEY, 'true');
      }
    }
    cleanUrlFromUtm();

    const leadSource = localStorage.getItem(LEAD_SOURCE_STORAGE_KEY);
    const visitorId = getOrCreateVisitorId();
    const alreadySent = sessionStorage.getItem(VISIT_SENT_KEY);
    if (leadSource && visitorId && !alreadySent) {
      trackVisit({
        visitor_id: visitorId,
        lead_source: leadSource,
        ...(utm.utm_source && { utm_source: utm.utm_source }),
        ...(utm.utm_medium && { utm_medium: utm.utm_medium }),
        ...(utm.utm_campaign && { utm_campaign: utm.utm_campaign }),
        ...(utm.utm_content && { utm_content: utm.utm_content }),
        ...(utm.utm_term && { utm_term: utm.utm_term }),
      }).then(() => {
        sessionStorage.setItem(VISIT_SENT_KEY, '1');
      }).catch(() => {});
    }
  }, []);
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="font-sans">
            <ResponseInterceptor />
            <SSEProvider />
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