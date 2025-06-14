import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
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
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // Защита от параллельных запросов
  const fetchInProgress = useRef(false);
  
  // Кеш для предотвращения повторных запросов
  const CACHE_DURATION = 30 * 1000; // 30 секунд

  // Проверка прав доступа
  const isManager = useMemo(() => {
    return user?.role === USER_ROLES.MANAGER || user?.role === USER_ROLES.ADMIN;
  }, [user?.role]);

  // Оптимизированная загрузка чатов с кешированием
  const loadChats = useCallback(async (forceRefresh = false) => {
    if (!isManager) {
      return false;
    }
    
    // Проверяем кеш
    const now = Date.now();
    if (!forceRefresh && (now - lastFetchTime) < CACHE_DURATION && chats.length > 0) {
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Используем кешированные данные');
      }
      return true;
    }
    
    // Защита от параллельных запросов
    if (fetchInProgress.current) {
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Запрос уже выполняется');
      }
      return false;
    }
    
    try {
      fetchInProgress.current = true;
      setIsLoadingChats(true);
      
      const response = await chatApi.getManagerChats();
      setChats(response);
      setLastFetchTime(now);
      
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Загружено чатов:', response.length);
      }
      
      return true;
    } catch (error) {
      console.error('ManagerChats: Ошибка при загрузке чатов:', error);
      
      // Более детальная обработка ошибок
      let errorMessage = 'Не удалось загрузить чаты';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Сервер не отвечает. Попробуйте позже.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте обновить страницу.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Нет доступа. Войдите в систему заново.';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoadingChats(false);
      fetchInProgress.current = false;
    }
  }, [isManager, lastFetchTime, chats.length, setChats]);

  // Автоматическая загрузка чатов при монтировании и каждые 2 минуты
  useEffect(() => {
    if (!isManager) return;

    // Загружаем чаты при первом рендере
    loadChats();

    // Устанавливаем интервал для автоматического обновления
    const interval = setInterval(() => {
      loadChats(true); // forceRefresh = true
    }, 2 * 60 * 1000); // каждые 2 минуты

    return () => {
      clearInterval(interval);
    };
  }, [isManager]); // ✅ Убираем loadChats из зависимостей

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
      
      // Перезагружаем список чатов с принудительным обновлением
      await loadChats(true);
      
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
      
      // Перезагружаем список чатов с принудительным обновлением
      await loadChats(true);
      
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