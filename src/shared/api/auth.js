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
      console.error('Ошибка при проверке email:', error.response?.data || error.message);
      // Пробрасываем ошибку дальше для обработки в компоненте
      throw error;
    }
  },

  // Аутентификация пользователя
  login: async (email, password) => {
    try {
      console.log(`Отправка запроса на вход пользователя: ${email}`);
      const response = await api.post('/auth/login', { email, password });
      console.log('Успешный вход в систему');
      return response.data;
    } catch (error) {
      console.error('Ошибка при аутентификации:', error.response?.data || error.message);
      throw error;
    }
  },

  // Регистрация нового пользователя
  register: async (email, unique_code, password) => {
    try {
      console.log(`Отправка запроса на регистрацию пользователя: ${email}`);
      const response = await api.post('/auth/register', { email, unique_code, password });
      console.log('Успешная регистрация пользователя');
      return response.data;
    } catch (error) {
      console.error('Ошибка при регистрации:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Выход из системы
  logout: async () => {
    try {
      console.log('Отправка запроса на выход из системы');
      const response = await api.get('/logout');
      console.log('Успешный выход из системы');
      return response.data;
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение информации о текущем пользователе
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me');
      return response.data;
    } catch (error) {
      // Для определенных кодов ошибок мы не логируем как ошибку
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('Пользователь не авторизован:', error.response.status);
      } else {
        console.error('Ошибка при получении данных пользователя:', error.response?.data || error.message);
      }
      throw error;
    }
  }
}; 