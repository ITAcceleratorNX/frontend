import api from './axios';

export const chatApi = {
  // Получить сообщения чата с пагинацией
  getMessages: async (chatId, beforeId = null, limit = 50) => {
    try {
      const params = new URLSearchParams();
      if (beforeId) params.append('beforeId', beforeId);
      params.append('limit', limit.toString());
      
      const response = await api.get(`/chats/${chatId}/messages?${params}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении сообщений чата:', error);
      throw error;
    }
  },

  // Удалить все сообщения чата
  clearMessages: async (chatId) => {
    try {
      const response = await api.delete(`/chats/${chatId}/messages`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении сообщений чата:', error);
      throw error;
    }
  },

  // Назначить менеджера для чата
  assignManager: async (chatId, newManagerId) => {
    try {
      const response = await api.put(`/chats/${chatId}/manager`, {
        newManagerId
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка при назначении менеджера:', error);
      throw error;
    }
  },

  // Получить список активных чатов (для менеджеров)
  getActiveChats: async () => {
    try {
      const response = await api.get('/chats/active');
      return response.data;
    } catch (error) {
      console.error('Ошибка при получении списка чатов:', error);
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