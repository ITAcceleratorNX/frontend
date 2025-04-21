import api from './axios';

export const authApi = {
  // Проверка существования email в системе
  checkEmail: async (email) => {
    try {
      console.log(`Отправка запроса на проверку email: ${email}`);
      const response = await api.post('/auth/email', { email });
      console.log('Ответ сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при проверке email:', error);
      // Пробрасываем ошибку дальше для обработки в компоненте
      throw error;
    }
  },

  // Аутентификация пользователя
  login: async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      return response.data;
    } catch (error) {
      console.error('Ошибка при аутентификации:', error);
      throw error;
    }
  },

  // Регистрация нового пользователя
  register: async (email, unique_code, password) => {
    try {
      const response = await api.post('/auth/register', { email, unique_code, password });
      return response.data;
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      throw error;
    }
  }
}; 