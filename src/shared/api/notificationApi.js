import { api } from './axios';


const isDevelopment = import.meta.env.DEV;

export const notificationApi = {

  // Получение уведомлений для пользователя
  async getUserNotifications() {
    try {
      const response = await api.get('/notifications/user');
      if (isDevelopment) {
        console.log('Ответ с сервера (пользовательские уведомления):', response.data);
      }
      // Проверяем структуру ответа и возвращаем массив уведомлений
      const notifications = Array.isArray(response.data) ? response.data : 
                           (response.data.notifications || []);
      return { data: notifications };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  // Получение всех уведомлений (для менеджеров/админов)
  async getAllNotifications(page = 1, limit = 10) {
    try {
      const response = await api.get(`/notifications?page=${page}&limit=${limit}`);

      if (isDevelopment) {
        console.log('Ответ с сервера (все уведомления):', response.data);
      }

      const data = response.data;

      // Проверка структуры
      if (!data || !Array.isArray(data.notifications)) {
        throw new Error('Некорректный формат ответа API');
      }

      // Возвращаем весь объект, а не только notifications!
      return {
        notifications: data.notifications,
        total: data.total,
        page: data.page,
        limit: data.limit,
        totalPages: data.totalPages,
        hasMore: data.hasMore
      };
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  },

  // Отправка уведомления
  async sendNotification(notification) {
    try {
      if (isDevelopment) {
        console.log('Отправка уведомления:', notification);
      }
      const response = await api.post('/notifications/bulk', notification);
      return { data: response.data };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Пометить уведомление как прочитанное
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      if (response.data && isDevelopment) {
        console.log('Уведомление помечено как прочитанное:', response.data);
      }
      return { data: { id: notificationId, isRead: true } };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Получение списка пользователей (для отправки уведомлений)
  async getUsers() {
    try {
      const response = await api.get('/users');
      if (isDevelopment) {
        console.log('Получен список пользователей:', response.data.length, 'пользователей');
      }
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Получение статистики уведомлений
  async getNotificationStats() {
    try {
      // В будущем: const response = await api.get('/notifications/stats');
      
      // Mock статистика
      const mockStats = {
        total: 15,
        read: 8,
        unread: 7,
        sentToday: 3,
        sentThisWeek: 12
      };

      return { data: mockStats };
    } catch (error) {
      console.error('Error fetching notification stats:', error);
      throw error;
    }
  }
}