import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { NOTIFICATION_QUERY_KEYS } from './use-notifications';
import { showInfoToast } from '../toast';

// Функция для получения базового URL API
const getApiBaseUrl = () => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? '/api' : 'https://api.extraspace.kz';
};

/**
 * Хук для подключения к SSE потоку уведомлений
 * Автоматически обновляет кеш React Query при получении новых уведомлений
 */
export const useSSENotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const eventSourceRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 секунды

  // Функция для подключения к SSE
  const connect = useCallback(() => {
    if (!user?.id) {
      return;
    }

    // Закрываем предыдущее соединение, если оно существует
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    const apiBaseUrl = getApiBaseUrl();
    const url = `${apiBaseUrl}/notifications/stream`;

    try {
      // Создаем EventSource
      // Cookies будут переданы автоматически, так как они установлены в браузере
      // EventSource автоматически отправляет cookies для запросов к тому же домену
      const eventSource = new EventSource(url);

      eventSource.onopen = () => {
        console.log('✅ SSE соединение установлено');
        reconnectAttempts.current = 0;
      };

      eventSource.onmessage = (event) => {
        try {
          // Пропускаем служебные сообщения (heartbeat, connected)
          if (event.data.startsWith(':')) {
            return;
          }

          const data = JSON.parse(event.data);

          if (data.type === 'notification' && data.data) {
            const notification = data.data;

            // Показываем toast уведомление по новому дизайну (синяя "i")
            showInfoToast(notification.title || 'Новое уведомление', {
              autoClose: 5000,
            });

            // Определяем ключ кеша в зависимости от роли
            const isUser = user?.role === 'USER' || user?.role === 'COURIER';
            const queryKey = isUser
              ? NOTIFICATION_QUERY_KEYS.user(user.id)
              : NOTIFICATION_QUERY_KEYS.all;

            // Оптимистично обновляем кеш
            if (isUser) {
              // Для обычных пользователей API возвращает { data: [...] }
              queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) {
                  return { data: [notification] };
                }

                const existingNotifications = oldData.data || [];
                
                // Проверяем, нет ли уже такого уведомления
                const exists = existingNotifications.some(
                  (n) => n.notification_id === notification.notification_id || 
                         n.id === notification.id ||
                         (n.notification_id && notification.notification_id && n.notification_id === notification.notification_id)
                );
                
                if (exists) {
                  return oldData;
                }

                // Добавляем новое уведомление в начало списка
                return {
                  ...oldData,
                  data: [notification, ...existingNotifications]
                };
              });
            } else {
              // Для менеджеров/админов - infinite query структура
              queryClient.setQueryData(queryKey, (oldData) => {
                if (!oldData) {
                  return {
                    pages: [{ notifications: [notification], total: 1, page: 1, limit: 10, hasMore: false }],
                    pageParams: [1]
                  };
                }

                const pages = oldData.pages || [];
                if (pages.length > 0) {
                  const firstPage = pages[0];
                  const existingNotifications = firstPage.notifications || [];
                  
                  const exists = existingNotifications.some(
                    (n) => n.notification_id === notification.notification_id || 
                           n.id === notification.id ||
                           (n.notification_id && notification.notification_id && n.notification_id === notification.notification_id)
                  );
                  
                  if (exists) {
                    return oldData;
                  }
                  
                  return {
                    ...oldData,
                    pages: [
                      {
                        ...firstPage,
                        notifications: [notification, ...existingNotifications],
                        total: (firstPage.total || 0) + 1
                      },
                      ...pages.slice(1)
                    ]
                  };
                }
                return oldData;
              });
            }

            // Инвалидируем кеш для принудительного обновления компонентов
            // Это гарантирует, что все компоненты, использующие этот кеш, обновятся
            queryClient.invalidateQueries({ 
              queryKey: queryKey,
              refetchType: 'active'
            });

            // Инвалидируем статистику уведомлений
            queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.stats });
          }
        } catch (error) {
          console.error('Ошибка обработки SSE сообщения:', error);
        }
      };

      eventSource.onerror = (error) => {
        // Проверяем состояние соединения
        if (eventSource.readyState === EventSource.CLOSED) {
          console.log('SSE соединение закрыто');
          
          // Пытаемся переподключиться только если это не было намеренное закрытие
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            console.log(`Попытка переподключения ${reconnectAttempts.current}/${maxReconnectAttempts}...`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectDelay * reconnectAttempts.current);
          } else {
            console.error('Достигнуто максимальное количество попыток переподключения');
          }
        } else if (eventSource.readyState === EventSource.CONNECTING) {
          console.log('SSE соединение устанавливается...');
        } else {
          console.error('❌ Ошибка SSE соединения:', error);
        }
      };

      eventSourceRef.current = eventSource;
    } catch (error) {
      console.error('Ошибка создания SSE соединения:', error);
    }
  }, [user, queryClient]);

  // Функция для отключения от SSE
  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Подключаемся при монтировании и при изменении пользователя
  useEffect(() => {
    if (user?.id) {
      connect();
    }

    // Отключаемся при размонтировании
    return () => {
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  return {
    connect,
    disconnect,
    isConnected: eventSourceRef.current?.readyState === EventSource.OPEN
  };
};
