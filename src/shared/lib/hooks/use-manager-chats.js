import { useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChatStore, USER_ROLES } from '../../../entities/chat/model';
import { chatApi } from '../../api/chatApi';
import { toast } from 'react-toastify';

export const useManagerChats = () => {
  const { user } = useAuth();
  const { 
    chats, 
    setChats, 
    activeChat, 
    setActiveChat,
    newChatNotifications,
    removeNewChatNotification,
    clearNewChatNotifications
  } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);

  // Проверка прав доступа
  const isManager = useMemo(() => {
    return user?.role === USER_ROLES.MANAGER || user?.role === USER_ROLES.ADMIN;
  }, [user?.role]);

  // Загрузка чатов менеджера
  const loadChats = useCallback(async () => {
    if (!isManager || isLoadingChats) {
      return false;
    }
    
    try {
      setIsLoadingChats(true);
      const response = await chatApi.getManagerChats();
      setChats(response);
      
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Загружено чатов:', response.length);
      }
      
      return true;
    } catch (error) {
      console.error('ManagerChats: Ошибка при загрузке чатов:', error);
      toast.error('Не удалось загрузить чаты');
      return false;
    } finally {
      setIsLoadingChats(false);
    }
  }, [isManager, isLoadingChats, setChats]);

  // Принятие чата
  const acceptChat = useCallback(async (chatId) => {
    if (!isManager) {
      toast.error('Недостаточно прав');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Устанавливаем активный чат локально
      setActiveChat({ id: chatId });
      
      // Удаляем уведомление о новом чате
      removeNewChatNotification(chatId);
      
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Чат принят:', chatId);
      }
      
      return true;
    } catch (error) {
      console.error('ManagerChats: Ошибка при принятии чата:', error);
      toast.error('Не удалось принять чат');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isManager, setActiveChat, removeNewChatNotification]);

  // Закрытие чата
  const closeChat = useCallback(async (chatId) => {
    if (!isManager) {
      toast.error('Недостаточно прав');
      return false;
    }
    
    try {
      setIsLoading(true);
      await chatApi.closeChat(chatId);
      
      // Обновляем локальное состояние
      if (activeChat?.id === chatId) {
        setActiveChat(null);
      }
      
      // Перезагружаем список чатов
      await loadChats();
      
      toast.success('Чат закрыт');
      
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Чат закрыт:', chatId);
      }
      
      return true;
    } catch (error) {
      console.error('ManagerChats: Ошибка при закрытии чата:', error);
      toast.error('Не удалось закрыть чат');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isManager, activeChat?.id, setActiveChat, loadChats]);

  // Смена менеджера
  const changeManager = useCallback(async (chatId, newManagerId) => {
    if (!isManager) {
      toast.error('Недостаточно прав');
      return false;
    }
    
    try {
      setIsLoading(true);
      await chatApi.changeManager(chatId, newManagerId);
      
      // Перезагружаем список чатов
      await loadChats();
      
      toast.success('Менеджер изменен');
      
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Менеджер изменен для чата:', chatId, 'новый менеджер:', newManagerId);
      }
      
      return true;
    } catch (error) {
      console.error('ManagerChats: Ошибка при смене менеджера:', error);
      toast.error('Не удалось сменить менеджера');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isManager, loadChats]);

  // Очистка сообщений чата
  const clearChatMessages = useCallback(async (chatId) => {
    if (!isManager) {
      toast.error('Недостаточно прав');
      return false;
    }
    
    try {
      setIsLoading(true);
      await chatApi.clearMessages(chatId);
      
      toast.success('Сообщения очищены');
      
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Сообщения очищены для чата:', chatId);
      }
      
      return true;
    } catch (error) {
      console.error('ManagerChats: Ошибка при очистке сообщений:', error);
      toast.error('Не удалось очистить сообщения');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isManager]);

  // Очистка всех уведомлений
  const clearNotifications = useCallback(() => {
    clearNewChatNotifications();
  }, [clearNewChatNotifications]);

  // Автоматическая загрузка чатов при монтировании
  useEffect(() => {
    if (isManager) {
      loadChats();
    }
  }, [isManager, loadChats]);

  // Фильтрация и сортировка чатов
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      // Сначала активные чаты, затем ожидающие, затем закрытые
      const statusOrder = { 'ACCEPTED': 0, 'PENDING': 1, 'CLOSED': 2 };
      const statusDiff = (statusOrder[a.status] || 3) - (statusOrder[b.status] || 3);
      
      if (statusDiff !== 0) return statusDiff;
      
      // Внутри каждой группы сортируем по дате обновления
      return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
    });
  }, [chats]);

  // Счетчики
  const counts = useMemo(() => {
    const pending = chats.filter(chat => chat.status === 'PENDING').length;
    const active = chats.filter(chat => chat.status === 'ACCEPTED').length;
    const total = chats.length;
    const notifications = newChatNotifications.length;
    
    return { pending, active, total, notifications };
  }, [chats, newChatNotifications]);

  return {
    // Данные
    chats: sortedChats,
    activeChat,
    newChatNotifications,
    counts,
    
    // Состояние
    isLoading,
    isLoadingChats,
    isManager,
    
    // Методы
    loadChats,
    acceptChat,
    closeChat,
    changeManager,
    clearChatMessages,
    clearNotifications,
    
    // Утилиты
    getChatById: (chatId) => chats.find(chat => chat.id === chatId),
    isActiveChatId: (chatId) => activeChat?.id === chatId
  };
}; 