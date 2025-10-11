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
    setMessages,
    setManagerId,
    addNewChatNotification,
    removeNewChatNotification,
    resetChat,
    setManagerName,
    clearUnreadMessages,
    incrementUnreadMessages,
    getUnreadCount
  } = useChatStore();

  // Обновляем статус соединения в store
  useEffect(() => {
    setConnectionStatus(isConnected);
  }, [isConnected, setConnectionStatus]);

  // Загрузка непрочитанных сообщений при подключении
  useEffect(() => {
    const loadUnreadMessages = async () => {
      if (!isConnected || !isAuthenticated || !user?.id) return;

      try {
        const unreadCounts = await import('../../api/chatApi').then(({ chatApi }) => 
          chatApi.getUnreadMessagesCount()
        );

        // Обновляем store с непрочитанными сообщениями из БД
        const { unreadMessages: currentUnread } = useChatStore.getState();
        const updatedUnread = { ...currentUnread, ...unreadCounts };
        
        // Устанавливаем непрочитанные сообщения в store
        Object.entries(unreadCounts).forEach(([chatId, count]) => {
          const currentCount = currentUnread[chatId] || 0;
          if (count > currentCount) {
            // Обновляем только если в БД больше непрочитанных
            useChatStore.setState(state => ({
              unreadMessages: {
                ...state.unreadMessages,
                [chatId]: count
              }
            }));
          }
        });

        if (import.meta.env.DEV) {
          console.log('Chat: Загружены непрочитанные сообщения из БД:', unreadCounts);
        }
      } catch (error) {
        console.error('Chat: Ошибка загрузки непрочитанных сообщений:', error);
      }
    };

    loadUnreadMessages();
  }, [isConnected, isAuthenticated, user?.id]);

  // Обработка WebSocket сообщений
  const handleWebSocketMessage = useCallback((data) => {
    if (import.meta.env.DEV) {
      console.log('Chat: Получено WebSocket сообщение:', data.type, data);
    }

    switch (data.type) {
      case WS_MESSAGE_TYPES.WAITING_FOR_MANAGER:
        setChatStatus(CHAT_STATUS.PENDING);
        toast.info(data.message || 'Создаем чат...');
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
        toast.success(data.message || 'Менеджер подключен к чату');

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
          // Используем isSelf из backend, если он есть, иначе проверяем sender_id
          const isOwnMessage = data.isSelf !== undefined ? data.isSelf : (data.message.sender_id === user?.id);
          const messageChatId = data.message.chat_id;
          const isActiveChat = activeChat?.id === messageChatId;

          // Сообщение с правильной временной меткой
          const messageWithTime = {
            ...data.message,
            created_at: data.message.created_at || new Date().toISOString(),
            isTemporary: false
          };

          if (import.meta.env.DEV) {
            console.log('Chat: Получено WebSocket сообщение NEW_MESSAGE:', {
              type: data.type,
              isOwnMessage,
              messageChatId,
              isActiveChat,
              activeChat: activeChat?.id,
              userId: user?.id,
              messageSenderId: data.message.sender_id,
              isSelf: data.isSelf,
              message: messageWithTime
            });
          }

          if (!isOwnMessage) {
            // Сообщение от другого пользователя
            if (import.meta.env.DEV) {
              console.log('Chat: Обработка сообщения от другого пользователя:', {
                isActiveChat,
                messageChatId,
                activeChatId: activeChat?.id,
                willAddToChat: isActiveChat
              });
            }
            
            if (isActiveChat) {
              // Добавляем в активный чат
              addMessage(messageWithTime);
              
              if (import.meta.env.DEV) {
                console.log('Chat: Добавлено realtime сообщение в активный чат:', messageWithTime);
                console.log('Chat: Текущее количество сообщений в store:', messages.length + 1);
              }
            } else {
              // Сообщение из другого чата - увеличиваем счетчик непрочитанных
              incrementUnreadMessages(messageChatId);
              
              if (import.meta.env.DEV) {
                console.log('Chat: Получено сообщение из неактивного чата:', messageChatId, messageWithTime);
              }
            }

            // Показываем уведомление
            if (user?.role === USER_ROLES.USER && !data.message.is_from_user) {
              toast.info('Новое сообщение от менеджера');
            } else if (user?.role === USER_ROLES.MANAGER && data.message.is_from_user) {
              if (isActiveChat) {
                toast.info('Новое сообщение от пользователя');
              } else {
                toast.info(`Новое сообщение в чате #${messageChatId}`);
              }
            }
          } else {
            // Собственное сообщение - обновляем временное на реальное
            if (isActiveChat) {
              if (import.meta.env.DEV) {
                console.log('Chat: Получено подтверждение отправки собственного сообщения');
              }
              
              // Удаляем временные сообщения от текущего пользователя
              const currentMessages = messages;
              const filteredMessages = currentMessages.filter(msg => 
                !msg.isTemporary || msg.sender_id !== user?.id
              );
              
              // Заменяем все сообщения обновленным списком с подтвержденным сообщением
              setMessages([...filteredMessages, messageWithTime]);
              
              if (import.meta.env.DEV) {
                console.log('Chat: Временное сообщение заменено на подтвержденное:', messageWithTime);
              }
            }
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

    // Создаем временное сообщение для оптимистичного обновления
    const tempMessage = {
      id: `temp-${Date.now()}`,
      chat_id: activeChat.id,
      sender_id: user.id,
      text: messageText.trim(),
      is_from_user: user.role !== USER_ROLES.MANAGER,
      created_at: new Date().toISOString(), // Используем created_at для совместимости
      createdAt: new Date().toISOString(), // Fallback для старых компонентов
      isTemporary: true
    };

    // Оптимистично добавляем сообщение в UI
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
      // Если отправка не удалась, удаляем временное сообщение
      // TODO: Реализовать логику удаления временного сообщения
      toast.error('Не удалось отправить сообщение');
    }

    return success;
  }, [isConnected, sendWebSocketMessage, activeChat?.id, user?.id, user?.role, addMessage]);

  // Пометка сообщений как прочитанных
  const markMessagesAsRead = useCallback((chatId = activeChat?.id) => {
    if (!chatId || !isConnected || !user?.id) return;

    const success = sendWebSocketMessage({
      type: 'MARK_MESSAGES_READ',
      chatId,
      userId: user.id
    });

    if (success) {
      // Очищаем счетчик непрочитанных для этого чата
      clearUnreadMessages(chatId);
      
      if (import.meta.env.DEV) {
        console.log('Chat: Сообщения помечены как прочитанные для чата:', chatId);
      }
    }

    return success;
  }, [isConnected, sendWebSocketMessage, activeChat?.id, user?.id, clearUnreadMessages]);

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
      // Чатты таңдағанда оқылмаған хабарламаларды тазалау
      clearUnreadMessages(chatId);

      if (import.meta.env.DEV) {
        console.log('Chat: Чат принят менеджером:', chatId);
      }
    }

    return success;
  }, [user?.role, user?.id, isConnected, sendWebSocketMessage, setActiveChat, setChatStatus, removeNewChatNotification, clearUnreadMessages]);

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
      markMessagesAsRead,
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