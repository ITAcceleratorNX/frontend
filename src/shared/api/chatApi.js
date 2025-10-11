import api from './axios';

// Кеш для дедупликации запросов
const requestCache = new Map();
const CACHE_DURATION = 30 * 1000; // 30 секунд

const getCacheKey = (url, params) => {
  return `${url}?${JSON.stringify(params || {})}`;
};

const isRequestCached = (cacheKey) => {
  const cached = requestCache.get(cacheKey);
  if (!cached) return false;
  
  const now = Date.now();
  return (now - cached.timestamp) < CACHE_DURATION;
};

export const chatApi = {
  // Получить сообщения чата с пагинацией
  getMessages: async (chatId, { beforeId, limit = 20 } = {}) => {
    try {
      const params = new URLSearchParams({ limit: limit.toString() });
      if (beforeId) params.append('beforeId', beforeId.toString());
      
      const response = await api.get(`/chats/${chatId}/messages?${params}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении сообщений чата:', error);
      throw error;
    }
  },

  // Получить чаты менеджера с кешированием и дедупликацией
  getManagerChats: async () => {
    const cacheKey = '/chats/manager';
    
    // Проверяем кеш
    if (isRequestCached(cacheKey)) {
      const cached = requestCache.get(cacheKey);
      if (import.meta.env.DEV) {
        console.log('ChatAPI: Используем кешированные чаты менеджера');
      }
      return cached.data;
    }
    
    try {
      const response = await api.get('/chats/manager');
      
      // Кешируем результат
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении чатов менеджера:', error);
      throw error;
    }
  },

  // Получить все ожидающие чаты (только для MANAGER/ADMIN)
  getPendingChats: async () => {
    const cacheKey = '/chats/pending-chats';
    
    // Проверяем кеш (короткий кеш для pending чатов - 10 секунд)
    const cached = requestCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < 10000) {
      if (import.meta.env.DEV) {
        console.log('ChatAPI: Используем кешированные ожидающие чаты');
      }
      return cached.data;
    }
    
    try {
      const response = await api.get('/chats/pending-chats');
      
      // Кешируем результат на короткое время
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
      
      if (import.meta.env.DEV) {
        console.log('ChatAPI: Получены ожидающие чаты:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении ожидающих чатов:', error);
      throw error;
    }
  },

  // Очистить сообщения чата
  clearMessages: async (chatId) => {
    try {
      const response = await api.delete(`/chats/${chatId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при очистке сообщений чата:', error);
      throw error;
    }
  },

  // Сменить менеджера чата
  changeManager: async (chatId, newManagerId) => {
    try {
      const response = await api.put(`/chats/${chatId}/manager`, { newManagerId });
      
      // Инвалидируем кеш чатов менеджера после изменения
      chatApi.invalidateManagerChats();
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при смене менеджера чата:', error);
      throw error;
    }
  },

  // Получить информацию о чате
  getChatInfo: async (chatId) => {
    try {
      const response = await api.get(`/chats/${chatId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении информации о чате:', error);
      throw error;
    }
  },

  // Закрыть чат
  closeChat: async (chatId) => {
    try {
      const response = await api.put(`/chats/${chatId}/close`);
      
      // Инвалидируем кеш чатов менеджера после закрытия
      chatApi.invalidateManagerChats();
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при закрытии чата:', error);
      throw error;
    }
  },

  // Получить активный чат пользователя (новый endpoint /chats/me)
  getUserChat: async () => {
    const cacheKey = '/chats/me';
    
    try {
      const response = await api.get('/chats/me');
      
      if (import.meta.env.DEV) {
        console.log('ChatAPI: Получен чат пользователя:', response.data);
      }
      
      return response.data;
    } catch (error) {
      // 404 - это нормально, значит у пользователя нет активного чата
      if (error.response?.status === 404) {
        if (import.meta.env.DEV) {
          console.log('ChatAPI: У пользователя нет активного чата');
        }
        return null;
      }
      
      console.error('Ошибка при получении чата пользователя:', error);
      throw error;
    }
  },

  // Получить количество непрочитанных сообщений для всех чатов пользователя
  getUnreadMessagesCount: async () => {
    try {
      const response = await api.get('/chats/unread-count');
      
      if (import.meta.env.DEV) {
        console.log('ChatAPI: Получено количество непрочитанных сообщений:', response.data);
      }
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении количества непрочитанных сообщений:', error);
      return {};
    }
  },

  // Утилиты для управления кешем
  
  // Очистить весь кеш API
  clearCache: () => {
    requestCache.clear();
    if (import.meta.env.DEV) {
      console.log('ChatAPI: Кеш очищен');
    }
  },

  // Инвалидировать кеш чатов менеджера
  invalidateManagerChats: () => {
    requestCache.delete('/chats/manager');
    if (import.meta.env.DEV) {
      console.log('ChatAPI: Кеш чатов менеджера инвалидирован');
    }
  },

  // Инвалидировать кеш ожидающих чатов
  invalidatePendingChats: () => {
    requestCache.delete('/chats/pending-chats');
    if (import.meta.env.DEV) {
      console.log('ChatAPI: Кеш ожидающих чатов инвалидирован');
    }
  },

  // Инвалидировать кеш чата пользователя
  invalidateUserChat: () => {
    requestCache.delete('/chats/me');
    if (import.meta.env.DEV) {
      console.log('ChatAPI: Кеш чата пользователя инвалидирован');
    }
  },

  // Получить статистику кеша (для отладки)
  getCacheStats: () => {
    const now = Date.now();
    const stats = {
      totalEntries: requestCache.size,
      validEntries: 0,
      expiredEntries: 0,
      entries: []
    };

    for (const [key, value] of requestCache.entries()) {
      const isValid = (now - value.timestamp) < CACHE_DURATION;
      if (isValid) {
        stats.validEntries++;
      } else {
        stats.expiredEntries++;
      }
      
      stats.entries.push({
        key,
        timestamp: value.timestamp,
        age: now - value.timestamp,
        isValid
      });
    }

    return stats;
  }
}; 