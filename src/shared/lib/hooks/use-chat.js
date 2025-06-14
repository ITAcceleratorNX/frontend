import { useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from './use-websocket';
import { useChatStore, WS_MESSAGE_TYPES, CHAT_STATUS, USER_ROLES } from '../../../entities/chat/model';
import { toast } from 'react-toastify';

export const useChat = () => {
  const { user, isAuthenticated } = useAuth();
  const { isConnected, isReconnecting, sendMessage: sendWebSocketMessage, addMessageHandler, removeMessageHandler } = useWebSocket();
  
  // Zustand store
  const {
    chatStatus,
    setChatStatus,
    setConnectionStatus,
    activeChat,
    setActiveChat,
    messages,
    addMessage,
    setManagerId,
    addNewChatNotification,
    removeNewChatNotification,
    resetChat
  } = useChatStore();

  // Обновляем статус соединения в store
  useEffect(() => {
    setConnectionStatus(isConnected);
  }, [isConnected, setConnectionStatus]);

  // Обработка WebSocket сообщений
  const handleWebSocketMessage = useCallback((data) => {
    if (import.meta.env.DEV) {
      console.log('Chat: Получено WebSocket сообщение:', data.type);
    }

    switch (data.type) {
      case WS_MESSAGE_TYPES.WAITING_FOR_MANAGER:
        setChatStatus(CHAT_STATUS.PENDING);
        toast.info(data.message || 'Ожидаем менеджера...');
        break;
        
      case WS_MESSAGE_TYPES.CHAT_ACCEPTED:
        setActiveChat({ id: data.chatId });
        setManagerId(data.managerId);
        setChatStatus(CHAT_STATUS.ACTIVE);
        toast.success('Менеджер присоединился к чату');
        break;
        
      case WS_MESSAGE_TYPES.NEW_MESSAGE:
        addMessage(data.message);
        break;
        
      case WS_MESSAGE_TYPES.NEW_CHAT:
        // Для менеджеров - уведомление о новом чате
        if (user?.role === USER_ROLES.MANAGER) {
          addNewChatNotification({
            chatId: data.chatId,
            userId: data.userId,
            timestamp: Date.now()
          });
          toast.info(`Новый чат от пользователя ${data.userId}`);
        }
        break;
        
      case WS_MESSAGE_TYPES.CHAT_CLOSED:
        setChatStatus(CHAT_STATUS.CLOSED);
        toast.info('Чат завершен');
        break;
        
      default:
        if (import.meta.env.DEV) {
          console.log('Chat: Неизвестный тип WebSocket сообщения:', data.type);
        }
    }
  }, [setChatStatus, setActiveChat, setManagerId, addMessage, addNewChatNotification, user?.role]);

  // Подключение обработчика сообщений
  useEffect(() => {
    if (isConnected) {
      addMessageHandler(handleWebSocketMessage);
      
      return () => {
        removeMessageHandler(handleWebSocketMessage);
      };
    }
  }, [isConnected, addMessageHandler, removeMessageHandler, handleWebSocketMessage]);

  // Начать новый чат
  const startChat = useCallback(() => {
    if (!isConnected) {
      toast.error('Нет соединения с сервером');
      return false;
    }
    
    if (!user?.id) {
      toast.error('Пользователь не авторизован');
      return false;
    }
    
    const success = sendWebSocketMessage({
      type: WS_MESSAGE_TYPES.START_CHAT,
      userId: user.id
    });
    
    if (success) {
      setChatStatus(CHAT_STATUS.PENDING);
      if (import.meta.env.DEV) {
        console.log('Chat: Инициация чата для пользователя:', user.id);
      }
    }
    
    return success;
  }, [isConnected, sendWebSocketMessage, user?.id, setChatStatus]);

  // Отправка сообщения
  const sendMessage = useCallback((messageText) => {
    if (!messageText?.trim()) {
      return false;
    }
    
    if (!isConnected) {
      toast.error('Нет соединения с сервером');
      return false;
    }
    
    if (!activeChat?.id) {
      toast.error('Чат не активен');
      return false;
    }
    
    const success = sendWebSocketMessage({
      type: WS_MESSAGE_TYPES.SEND_MESSAGE,
      chatId: activeChat.id,
      senderId: user.id,
      message: messageText.trim(),
      isFromUser: user.role !== USER_ROLES.MANAGER
    });
    
    if (import.meta.env.DEV && success) {
      console.log('Chat: Сообщение отправлено:', messageText.trim());
    }
    
    return success;
  }, [isConnected, sendWebSocketMessage, activeChat?.id, user?.id, user?.role]);

  // Принять чат (для менеджеров)
  const acceptChat = useCallback((chatId) => {
    if (user?.role !== USER_ROLES.MANAGER) {
      toast.error('Недостаточно прав');
      return false;
    }
    
    if (!isConnected) {
      toast.error('Нет соединения с сервером');
      return false;
    }
    
    const success = sendWebSocketMessage({
      type: WS_MESSAGE_TYPES.ACCEPT_CHAT,
      chatId: chatId,
      managerId: user.id
    });
    
    if (success) {
      setActiveChat({ id: chatId });
      setChatStatus(CHAT_STATUS.ACTIVE);
      removeNewChatNotification(chatId);
      
      if (import.meta.env.DEV) {
        console.log('Chat: Чат принят менеджером:', chatId);
      }
    }
    
    return success;
  }, [user?.role, user?.id, isConnected, sendWebSocketMessage, setActiveChat, setChatStatus, removeNewChatNotification]);

  // Сброс состояния чата
  const resetChatState = useCallback(() => {
    resetChat();
  }, [resetChat]);

  // Мемоизируем результат
  const chatData = useMemo(() => {
    const canSendMessage = isAuthenticated && isConnected && activeChat && chatStatus === CHAT_STATUS.ACTIVE;
    
    if (import.meta.env.DEV && activeChat) {
      console.log('useChat: Проверка canSendMessage:', {
        isAuthenticated,
        isConnected,
        hasActiveChat: !!activeChat,
        chatStatus,
        expectedStatus: CHAT_STATUS.ACTIVE,
        canSendMessage
      });
    }
    
    return {
      // Состояние
      chatStatus,
      isConnected,
      isReconnecting,
      activeChat,
      messages,
      
      // Методы
      startChat,
      sendMessage,
      acceptChat,
      resetChatState,
      
      // Проверки
      canStartChat: isAuthenticated && isConnected && chatStatus === CHAT_STATUS.IDLE,
      canSendMessage,
      isManager: user?.role === USER_ROLES.MANAGER
    };
  }, [
    chatStatus,
    isConnected, 
    isReconnecting,
    activeChat,
    messages,
    startChat,
    sendMessage,
    acceptChat,
    resetChatState,
    isAuthenticated,
    user?.role
  ]);

  return chatData;
}; 