import { api } from './axios';

// Базовый URL уже настроен в axios.js:
// const API_URL = isDevelopment ? '/api' : 'https://extraspace-backend.onrender.com';
// Не нужно добавлять префикс '/api' к путям

class NotificationAPI {

  // Получение уведомлений для пользователя
  async getUserNotifications() {
    try {
      const response = await api.get('/notifications/user');
      console.log('Ответ с сервера:', response.data);
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Получение всех уведомлений (для менеджеров/админов)
  async getAllNotifications() {
    try {
      const response = await api.get('/notifications');
      console.log('Ответ с сервера:', response.data);
      // Проверяем структуру данных и возвращаем их в правильном формате
      if (Array.isArray(response.data)) {
        // Если сервер вернул массив, используем его напрямую
        return { data: response.data };
      } else if (response.data && response.data.notifications) {
        // Если сервер вернул объект с полем notifications
        return { data: response.data.notifications };
      } else {
        // Если структура неизвестна, возвращаем данные как есть
        return { data: response.data };
      }
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  }

  // Отправка уведомления
  async sendNotification(notification) {
    try {
      console.log(notification);
      const response = await api.post('/notifications/bulk', notification);
      return { data: response.data };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Пометить уведомление как прочитанное
  async markAsRead(notificationId) {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      if (response.data) {
        console.log(response.data);
      }
      return { data: { id: notificationId, isRead: true } };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Получение списка пользователей (для отправки уведомлений)
  async getUsers() {
    try {
      const response = await api.get('/users');
      return { data: response.data };
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

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

// Создаем и экспортируем экземпляр API
export const notificationApi = new NotificationAPI();

// Экспортируем класс для возможного использования в других местах
export default NotificationAPI;