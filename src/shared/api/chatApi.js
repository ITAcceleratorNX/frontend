import api from './axios';

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

  // Получить чаты менеджера
  getManagerChats: async () => {
    try {
      const response = await api.get('/chats/manager');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении чатов менеджера:', error);
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
      return response.data;
    } catch (error) {
      console.error('Ошибка при закрытии чата:', error);
      throw error;
    }
  }
}; 