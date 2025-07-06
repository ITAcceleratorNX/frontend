import api from './axios';

export const usersApi = {
  // Получение всех пользователей (для ADMIN и MANAGER)
  getAllUsers: async () => {
    try {
      console.log('Отправка запроса на получение всех пользователей');
      const response = await api.get('/users');
      console.log('Пользователи загружены:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке пользователей:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление роли пользователя (только для ADMIN)
  updateUserRole: async (userId, role) => {
    try {
      console.log('Отправка запроса на обновление роли пользователя:', { userId, role });
      const response = await api.patch(`/users/${userId}/role`, { role });
      console.log('Роль пользователя успешно обновлена:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении роли пользователя:', error.response?.data || error.message);
      throw error;
    }
  },

  // Удаление пользователя (только для ADMIN)
  deleteUser: async (userId) => {
    try {
      console.log('Отправка запроса на удаление пользователя:', userId);
      const response = await api.delete(`/users/${userId}`);
      console.log('Пользователь успешно удален:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error.response?.data || error.message);
      throw error;
    }
  }
}; 