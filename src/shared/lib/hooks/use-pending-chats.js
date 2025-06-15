import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { chatApi } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';

// Ключ для React Query
export const PENDING_CHATS_QUERY_KEY = 'pendingChats';

// Хук для получения ожидающих чатов (только для менеджеров)
export const usePendingChats = (options = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Проверяем, является ли пользователь менеджером или админом
  const isManagerOrAdmin = user && (user.role === 'MANAGER' || user.role === 'ADMIN');
  
  // Запрос ожидающих чатов
  const query = useQuery({
    queryKey: [PENDING_CHATS_QUERY_KEY],
    queryFn: chatApi.getPendingChats,
    enabled: isManagerOrAdmin, // Запрос выполняется только для менеджеров/админов
    refetchInterval: 5000, // Обновляем каждые 5 секунд
    refetchIntervalInBackground: true, // Обновляем даже когда вкладка неактивна
    staleTime: 0, // Данные всегда считаются устаревшими
    cacheTime: 30000, // Кеш на 30 секунд
    retry: 2, // 2 попытки при ошибке
    ...options
  });

  // Функция для принудительного обновления
  const refetchPendingChats = useCallback(() => {
    if (isManagerOrAdmin) {
      chatApi.invalidatePendingChats();
      return query.refetch();
    }
  }, [isManagerOrAdmin, query]);

  // Функция для инвалидации кеша
  const invalidatePendingChats = useCallback(() => {
    chatApi.invalidatePendingChats();
    queryClient.invalidateQueries({ queryKey: [PENDING_CHATS_QUERY_KEY] });
  }, [queryClient]);

  // Получить количество ожидающих чатов
  const pendingChatsCount = query.data?.length || 0;

  // Проверить, есть ли новые чаты
  const hasNewChats = pendingChatsCount > 0;

  if (import.meta.env.DEV && query.data) {
    console.log('usePendingChats: Ожидающие чаты:', {
      count: pendingChatsCount,
      chats: query.data,
      isLoading: query.isLoading,
      error: query.error
    });
  }

  return {
    // Данные
    pendingChats: query.data || [],
    pendingChatsCount,
    hasNewChats,
    
    // Состояние запроса
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    
    // Функции управления
    refetchPendingChats,
    invalidatePendingChats,
    
    // Доступность для роли
    isManagerOrAdmin
  };
};

// Хук для подписки на изменения ожидающих чатов через WebSocket
export const usePendingChatsSubscription = () => {
  const { invalidatePendingChats } = usePendingChats();
  
  // Функция для обработки WebSocket событий
  const handleWebSocketMessage = useCallback((message) => {
    const data = typeof message === 'string' ? JSON.parse(message) : message;
    
    // Обновляем список при создании нового чата или принятии чата
    if (data.type === 'NEW_CHAT' || data.type === 'CHAT_ACCEPTED') {
      if (import.meta.env.DEV) {
        console.log('usePendingChatsSubscription: Обновляем список ожидающих чатов');
      }
      invalidatePendingChats();
    }
  }, [invalidatePendingChats]);
  
  return {
    handleWebSocketMessage
  };
}; 