import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { chatApi } from '../../api/chatApi';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from './use-websocket';
import { WS_MESSAGE_TYPES } from '../../../entities/chat/model';

// Ключ для React Query
export const PENDING_CHATS_QUERY_KEY = 'pendingChats';

// Хук для получения ожидающих чатов (только для менеджеров)
export const usePendingChats = (options = {}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addMessageHandler, removeMessageHandler, isConnected } = useWebSocket();
  
  // Проверяем, является ли пользователь менеджером или админом
  const isManagerOrAdmin = user && (user.role === 'MANAGER' || user.role === 'ADMIN');
  
  // Запрос ожидающих чатов с адаптивным интервалом обновления
  const query = useQuery({
    queryKey: [PENDING_CHATS_QUERY_KEY],
    queryFn: chatApi.getPendingChats,
    enabled: isManagerOrAdmin, // Запрос выполняется только для менеджеров/админов
    // Адаптивный интервал: если есть WebSocket, обновляем реже
    refetchInterval: isConnected ? 30000 : 5000, // 30 сек с WebSocket, 5 сек без
    refetchIntervalInBackground: true, // Обновляем даже когда вкладка неактивна
    staleTime: isConnected ? 10000 : 0, // С WebSocket данные дольше актуальны
    cacheTime: 30000, // Кеш на 30 секунд
    retry: 2, // 2 попытки при ошибке
    ...options
  });

  // WebSocket обработчик для автоматического обновления
  const handleWebSocketMessage = useCallback((data) => {
    if (!isManagerOrAdmin) return;
    
    // Обновляем список при событиях, связанных с чатами
    if ([
      WS_MESSAGE_TYPES.NEW_CHAT,
      WS_MESSAGE_TYPES.CHAT_ACCEPTED,
      WS_MESSAGE_TYPES.CHAT_ASSIGNED,
      WS_MESSAGE_TYPES.CHAT_CLOSED
    ].includes(data.type)) {
      
      if (import.meta.env.DEV) {
        console.log('usePendingChats: WebSocket обновление списка чатов:', data.type);
      }
      
      // Инвалидируем кеш и перезапрашиваем данные
      queryClient.invalidateQueries({ queryKey: [PENDING_CHATS_QUERY_KEY] });
    }
  }, [isManagerOrAdmin, queryClient]);

  // Подписка на WebSocket события
  useEffect(() => {
    if (isManagerOrAdmin && isConnected) {
      addMessageHandler(handleWebSocketMessage);
      
      return () => {
        removeMessageHandler(handleWebSocketMessage);
      };
    }
  }, [isManagerOrAdmin, isConnected, addMessageHandler, removeMessageHandler, handleWebSocketMessage]);

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
      error: query.error,
      hasWebSocket: isConnected
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
    isManagerOrAdmin,
    
    // WebSocket статус
    hasWebSocketConnection: isConnected
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