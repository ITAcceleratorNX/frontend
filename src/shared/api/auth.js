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
      const response = await api.get('/auth/logout');
      console.log('Успешный выход из системы');

      // Явно очищаем куки при выходе
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error.response?.data || error.message);
      
      // Даже при ошибке очищаем куки
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
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
  },
  
  // Проверка статуса аутентификации (более легкий вызов)
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/check');
      return { 
        isAuthenticated: true,
        user: response.data
      };
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        return { isAuthenticated: false, user: null };
      }
      console.error('Ошибка при проверке авторизации:', error.response?.data || error.message);
      return { isAuthenticated: false, error: error.message };
    }
  },

  // Проверка существования email для восстановления пароля
  checkEmailForRestore: async (email) => {
    try {
      console.log(`Отправка запроса на проверку email для восстановления: ${email}`);
      const response = await api.post('/auth/check-email', { email });
      console.log('Ответ сервера при проверке email:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при проверке email для восстановления:', error.response?.data || error.message);
      throw error;
    }
  },

  // Восстановление пароля
  restorePassword: async (email, unique_code, password) => {
    try {
      console.log(`Отправка запроса на восстановление пароля для: ${email}`);
      const response = await api.post('/auth/restore-password', { 
        email, 
        unique_code, 
        password 
      });
      console.log('Пароль успешно восстановлен');
      return response.data;
    } catch (error) {
      console.error('Ошибка при восстановлении пароля:', error.response?.data || error.message);
      throw error;
    }
  }
}; 