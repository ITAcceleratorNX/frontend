import { useCallback, useEffect, useMemo } from 'react';
import { useChatStore, PAGINATION } from '../../../entities/chat/model';
import { chatApi } from '../../api/chatApi';
import { toast } from 'react-toastify';

export const useChatMessages = (chatId) => {
  const {
    messages,
    setMessages,
    prependMessages,
    hasMoreMessages,
    setHasMoreMessages,
    isLoadingMessages,
    setIsLoadingMessages
  } = useChatStore();

  // Загрузка сообщений с пагинацией
  const loadMessages = useCallback(async (beforeId = null, replace = false) => {
    if (!chatId || isLoadingMessages) {
      return false;
    }
    
    try {
      setIsLoadingMessages(true);
      
      const response = await chatApi.getMessages(chatId, {
        beforeId,
        limit: PAGINATION.MESSAGES_LIMIT
      });
      
      const { messages: newMessages, hasMore } = response;
      
      if (replace) {
        // Первоначальная загрузка - заменяем все сообщения
        setMessages(newMessages);
      } else {
        // Загружаем более старые сообщения - добавляем в начало
        prependMessages(newMessages);
      }
      
      setHasMoreMessages(hasMore);
      
      if (import.meta.env.DEV) {
        console.log('ChatMessages: Загружено сообщений:', newMessages.length, 'hasMore:', hasMore);
      }
      
      return true;
    } catch (error) {
      console.error('ChatMessages: Ошибка при загрузке сообщений:', error);
      toast.error('Не удалось загрузить сообщения');
      return false;
    } finally {
      setIsLoadingMessages(false);
    }
  }, [chatId, isLoadingMessages, setIsLoadingMessages, setMessages, prependMessages, setHasMoreMessages]);

  // Загрузка начальных сообщений при изменении chatId
  useEffect(() => {
    if (chatId) {
      loadMessages(null, true); // replace = true для первоначальной загрузки
    }
  }, [chatId, loadMessages]);

  // Загрузка предыдущих сообщений
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoadingMessages || messages.length === 0) {
      return false;
    }
    
    const oldestMessageId = messages[0]?.id;
    return await loadMessages(oldestMessageId, false);
  }, [hasMoreMessages, isLoadingMessages, messages, loadMessages]);

  // Очистка сообщений
  const clearMessages = useCallback(async () => {
    if (!chatId) {
      return false;
    }
    
    try {
      await chatApi.clearMessages(chatId);
      setMessages([]);
      setHasMoreMessages(true);
      toast.success('Сообщения очищены');
      
      if (import.meta.env.DEV) {
        console.log('ChatMessages: Сообщения очищены для чата:', chatId);
      }
      
      return true;
    } catch (error) {
      console.error('ChatMessages: Ошибка при очистке сообщений:', error);
      toast.error('Не удалось очистить сообщения');
      return false;
    }
  }, [chatId, setMessages, setHasMoreMessages]);

  // Группировка сообщений по дням
  const groupMessagesByDate = useCallback((messagesList) => {
    const grouped = [];
    let currentDate = null;
    
    messagesList.forEach((msg) => {
      const msgDate = new Date(msg.createdAt || Date.now());
      const dateStr = msgDate.toLocaleDateString('ru-RU', { 
        day: 'numeric',
        month: 'long'
      });
      
      if (dateStr !== currentDate) {
        grouped.push({ type: 'date', date: dateStr, id: `date-${msgDate.getTime()}` });
        currentDate = dateStr;
      }
      
      grouped.push({ type: 'message', ...msg });
    });
    
    return grouped;
  }, []);

  // Мемоизированные группированные сообщения
  const groupedMessages = useMemo(() => {
    return groupMessagesByDate(messages);
  }, [messages, groupMessagesByDate]);

  // Счетчик непрочитанных сообщений
  const unreadCount = useMemo(() => {
    return messages.filter(msg => !msg.is_read && !msg.is_from_user).length;
  }, [messages]);

  // Проверка, является ли сообщение последним от пользователя
  const isLastFromSender = useCallback((messageIndex, senderId) => {
    const nextMessage = messages[messageIndex + 1];
    return !nextMessage || nextMessage.sender_id !== senderId;
  }, [messages]);

  return {
    // Данные
    messages,
    groupedMessages,
    hasMoreMessages,
    isLoadingMessages,
    unreadCount,
    
    // Методы
    loadMessages,
    loadMoreMessages,
    clearMessages,
    isLastFromSender,
    
    // Статус
    isEmpty: messages.length === 0,
    canLoadMore: hasMoreMessages && !isLoadingMessages && messages.length > 0
  };
}; 