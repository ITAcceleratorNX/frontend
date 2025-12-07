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
  getCountAllUsers: async () => {
    try {
      console.log('Отправка запроса на получение всех пользователей');
      const response = await api.get('/users/count');
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
  },

  // Поиск пользователей по email, phone или name (для ADMIN и MANAGER)
  searchUsers: async (query) => {
    try {
      console.log('Отправка запроса на поиск пользователей:', query);
      const response = await api.get('/users/search', { params: { query } });
      console.log('Пользователи найдены:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при поиске пользователей:', error.response?.data || error.message);
      throw error;
    }
  },

  // Создание пользователя без пароля (для ADMIN и MANAGER)
  createUserByManager: async (userData) => {
    try {
      console.log('Отправка запроса на создание пользователя:', userData);
      const response = await api.post('/users/create', userData);
      console.log('Пользователь успешно создан:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление разрешения на превышение лимита заказов (для ADMIN и MANAGER)
  updateOrderLimitPermission: async (userId, canExceed) => {
    try {
      console.log('Отправка запроса на обновление разрешения лимита заказов:', { userId, canExceed });
      const response = await api.patch(`/users/${userId}/order-limit-permission`, { 
        can_exceed_order_limit: canExceed 
      });
      console.log('Разрешение успешно обновлено:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении разрешения:', error.response?.data || error.message);
      throw error;
    }
  }
}; 