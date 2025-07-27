import { useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useWebSocket } from './use-websocket';
import { useUserChat } from './use-user-chat';
import { useChatStore, WS_MESSAGE_TYPES, CHAT_STATUS, USER_ROLES } from '../../../entities/chat/model';
import { toast } from 'react-toastify';

export const useChat = () => {
  const { user, isAuthenticated } = useAuth();
  const { isConnected, isReconnecting, sendMessage: sendWebSocketMessage, addMessageHandler, removeMessageHandler } = useWebSocket();

  // Автоматическая загрузка чата пользователя
  const { loadUserChat } = useUserChat();

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
    resetChat,
    setManagerName
  } = useChatStore();

  // Обновляем статус соединения в store
  useEffect(() => {
    setConnectionStatus(isConnected);
  }, [isConnected, setConnectionStatus]);

  // Обработка WebSocket сообщений
  const handleWebSocketMessage = useCallback((data) => {
    if (import.meta.env.DEV) {
      console.log('Chat: Получено WebSocket сообщение:', data.type, data);
    }

    switch (data.type) {
      case WS_MESSAGE_TYPES.WAITING_FOR_MANAGER:
        setChatStatus(CHAT_STATUS.PENDING);
        toast.info(data.message || 'Ожидаем менеджера...');
        break;

      case WS_MESSAGE_TYPES.CHAT_ACCEPTED:
        setActiveChat({
          id: data.chatId,
          manager_id: data.managerId
        });
        setManagerId(data.managerId);
        if (data.managerName) {
          setManagerName(data.managerName);
        }
        setChatStatus(CHAT_STATUS.ACTIVE);
        toast.success('Менеджер присоединился к чату');

        // Инвалидируем кеш чата пользователя
        import('../../api/chatApi').then(({ chatApi }) => {
          chatApi.invalidateUserChat();
        });
        break;

      case WS_MESSAGE_TYPES.CHAT_ASSIGNED:
        // Новое событие: чат назначен менеджеру
        if (user?.role === USER_ROLES.MANAGER && data.managerId === user.id) {
          setActiveChat({
            id: data.chatId,
            user_id: data.userId,
            manager_id: data.managerId
          });
          setManagerId(data.managerId);
          if (data.managerName) {
            setManagerName(data.managerName);
          }
          setChatStatus(CHAT_STATUS.ACTIVE);
          toast.success(`Вам назначен чат #${data.chatId}`);
        }

        // Инвалидируем кеши
        import('../../api/chatApi').then(({ chatApi }) => {
          chatApi.invalidateManagerChats();
          chatApi.invalidatePendingChats();
          if (user?.role !== USER_ROLES.MANAGER) {
            chatApi.invalidateUserChat();
          }
        });
        break;

      case WS_MESSAGE_TYPES.NEW_MESSAGE:
        // Реализация realtime доставки сообщений
        if (data.message) {
          // ВСЕГДА добавляем сообщение (и для отправителя, и для других)
          const messageWithTime = {
            ...data.message,
            created_at: data.message.created_at || new Date().toISOString(),
            isTemporary: false
          };
          addMessage(messageWithTime);
          if (import.meta.env.DEV) {
            console.log('Chat: Добавлено realtime сообщение:', messageWithTime);
          }
          // Показываем уведомление если сообщение не от текущего пользователя
          if (user?.role === USER_ROLES.USER && !data.message.is_from_user) {
            toast.info('Новое сообщение от менеджера');
          } else if (user?.role === USER_ROLES.MANAGER && data.message.is_from_user) {
            toast.info('Новое сообщение от пользователя');
          }
        }
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

          // Инвалидируем кеш ожидающих чатов
          import('../../api/chatApi').then(({ chatApi }) => {
            chatApi.invalidatePendingChats();
          });
        }
        break;

      case WS_MESSAGE_TYPES.CHAT_CLOSED:
        setChatStatus(CHAT_STATUS.CLOSED);
        toast.info('Чат завершен');

        // Инвалидируем кеш чата пользователя
        import('../../api/chatApi').then(({ chatApi }) => {
          chatApi.invalidateUserChat();
          if (user?.role === USER_ROLES.MANAGER) {
            chatApi.invalidateManagerChats();
          }
        });
        break;

      default:
        if (import.meta.env.DEV) {
          console.log('Chat: Неизвестный тип WebSocket сообщения:', data.type);
        }
    }
  }, [setChatStatus, setActiveChat, setManagerId, addMessage, addNewChatNotification, user?.role, user?.id, setManagerName]);

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
  const sendMessage = useCallback(
      (messageText) => {
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

        const tempMessage = {
          id: `temp-${Date.now()}`,
          chat_id: activeChat.id,
          sender_id: user.id,
          text: messageText.trim(),
          is_from_user: user.role !== USER_ROLES.MANAGER,
          created_at: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          isTemporary: true
        };

        addMessage(tempMessage);

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

        if (!success) {
          toast.error('Не удалось отправить сообщение');
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