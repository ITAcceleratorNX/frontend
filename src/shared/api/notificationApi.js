import { api } from './axios';

// Mock API endpoints для уведомлений
// В будущем можно будет заменить на реальные API вызовы

class NotificationAPI {
  // Получение уведомлений для пользователя
  async getUserNotifications(userId) {
    try {
      // В будущем: const response = await api.get(`/notifications/user/${userId}`);
      
      // Mock данные
      const mockNotifications = [
        {
          id: '1',
          title: 'Добрый день, Иван!',
          content: 'Ваш договор успешно подписан и вступил в силу.',
          timestamp: new Date('2024-03-12T18:30:00'),
          isRead: false,
          sender: 'system',
          recipients: [userId]
        },
        {
          id: '2',
          title: 'Добрый день, Иван!',
          content: 'Сообщаем, что срок действия вашего договора истекает через одну неделю.',
          timestamp: new Date('2024-08-05T18:38:00'),
          isRead: true,
          sender: 'system',
          recipients: [userId]
        },
        {
          id: '3',
          title: 'Уведомление о платеже',
          content: 'Ваш ежемесячный платеж был успешно обработан.',
          timestamp: new Date('2024-01-15T12:00:00'),
          isRead: false,
          sender: 'system',
          recipients: [userId]
        }
      ];

      return { data: mockNotifications };
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  }

  // Получение всех уведомлений (для менеджеров/админов)
  async getAllNotifications() {
    try {
      // В будущем: const response = await api.get('/notifications');
      
      // Mock данные
      const mockNotifications = [
        {
          id: '1',
          title: 'Добрый день, Иван!',
          content: 'Ваш договор успешно подписан и вступил в силу.',
          timestamp: new Date('2024-03-12T18:30:00'),
          isRead: false,
          sender: 'system',
          recipients: ['user1', 'user2']
        },
        {
          id: '2',
          title: 'Системное обновление',
          content: 'Запланировано техническое обслуживание системы.',
          timestamp: new Date('2024-08-05T18:38:00'),
          isRead: true,
          sender: 'admin',
          recipients: ['user1', 'user2', 'user3']
        }
      ];

      return { data: mockNotifications };
    } catch (error) {
      console.error('Error fetching all notifications:', error);
      throw error;
    }
  }

  // Отправка уведомления
  async sendNotification(notification) {
    try {
      // В будущем: const response = await api.post('/notifications', notification);
      
      // Симуляция отправки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newNotification = {
        ...notification,
        id: Date.now().toString(),
        timestamp: new Date()
      };

      return { data: newNotification };
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  // Пометить уведомление как прочитанное
  async markAsRead(notificationId) {
    try {
      // В будущем: const response = await api.patch(`/notifications/${notificationId}/read`);
      
      // Симуляция пометки как прочитанное
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return { data: { id: notificationId, isRead: true } };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Получение списка пользователей (для отправки уведомлений)
  async getUsers() {
    try {
      // В будущем: const response = await api.get('/users');
      
      // Mock данные
      const mockUsers = [
        { id: 'user1', name: 'Иван Петров', email: 'ivan@example.com', role: 'USER' },
        { id: 'user2', name: 'Мария Сидорова', email: 'maria@example.com', role: 'USER' },
        { id: 'user3', name: 'Алексей Козлов', email: 'alexey@example.com', role: 'USER' },
        { id: 'user4', name: 'Елена Васильева', email: 'elena@example.com', role: 'USER' },
        { id: 'user5', name: 'Дмитрий Смирнов', email: 'dmitry@example.com', role: 'USER' }
      ];

      return { data: mockUsers };
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