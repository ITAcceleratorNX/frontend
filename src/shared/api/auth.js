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

  // Проверка существования телефона в системе и отправка SMS
  checkPhone: async (phone) => {
    try {
      console.log(`Отправка запроса на проверку телефона: ${phone}`);
      const response = await api.post('/auth/phone', { phone });
      console.log('Ответ сервера:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при проверке телефона:', error.response?.data || error.message);
      // Пробрасываем ошибку дальше для обработки в компоненте
      throw error;
    }
  },

  // Аутентификация пользователя
  login: async (login, password) => {
    try {
      console.log(`Отправка запроса на вход пользователя: ${login}`);
      const response = await api.post('/auth/login', { login, password });
      console.log('Успешный вход в систему');
      return response.data;
    } catch (error) {
      console.error('Ошибка при аутентификации:', error.response?.data || error.message);
      throw error;
    }
  },

  // Регистрация нового пользователя
  register: async (phone, unique_code, password, lead_source = undefined) => {
    try {
      console.log(`Отправка запроса на регистрацию пользователя: ${phone}`, lead_source ? `с источником: ${lead_source}` : '');
      const response = await api.post('/auth/register', { 
        phone, 
        unique_code, 
        password,
        lead_source 
      });
      console.log('Успешная регистрация пользователя');
      return response.data;
    } catch (error) {
      console.error('Ошибка при регистрации:', error.response?.data || error.message);
      throw error;
    }
  },

  // Регистрация юридического лица
  registerLegal: async (email, unique_code, password, legalData, lead_source = undefined) => {
    try {
      console.log(`Отправка запроса на регистрацию юридического лица: ${email}`, lead_source ? `с источником: ${lead_source}` : '');
      const response = await api.post('/auth/register-legal', { 
        email, 
        unique_code, 
        password,
        lead_source,
        user_type: 'LEGAL',
        ...legalData
      });
      console.log('Успешная регистрация юридического лица');
      return response.data;
    } catch (error) {
      console.error('Ошибка при регистрации юридического лица:', error.response?.data || error.message);
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

  // Проверка существования телефона для восстановления пароля
  checkPhoneForRestore: async (phone) => {
    try {
      console.log(`Отправка запроса на проверку телефона для восстановления: ${phone}`);
      const response = await api.post('/auth/check-phone', { phone });
      console.log('Ответ сервера при проверке телефона:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при проверке телефона для восстановления:', error.response?.data || error.message);
      throw error;
    }
  },

  // Восстановление пароля
  restorePassword: async (phone, unique_code, password) => {
    try {
      console.log(`Отправка запроса на восстановление пароля для: ${phone}`);
      const response = await api.post('/auth/restore-password', { 
        phone, 
        unique_code, 
        password 
      });
      console.log('Пароль успешно восстановлен');
      return response.data;
    } catch (error) {
      console.error('Ошибка при восстановлении пароля:', error.response?.data || error.message);
      throw error;
    }
  },

  // Отправка кода для изменения пароля (используем существующий endpoint)
  sendChangePasswordCode: async (email) => {
    try {
      console.log(`Отправка запроса на отправку кода для изменения пароля: ${email}`);
      const response = await api.post('/auth/check-email', { email });
      console.log('Код для изменения пароля отправлен');
      return response.data;
    } catch (error) {
      console.error('Ошибка при отправке кода для изменения пароля:', error.response?.data || error.message);
      throw error;
    }
  },

  // Изменение пароля (используем существующий endpoint для восстановления)
  changePassword: async (email, unique_code, password) => {
    try {
      console.log(`Отправка запроса на изменение пароля для: ${email}`);
      const response = await api.post('/auth/restore-password', { 
        email, 
        unique_code, 
        password 
      });
      console.log('Пароль успешно изменен');
      return response.data;
    } catch (error) {
      console.error('Ошибка при изменении пароля:', error.response?.data || error.message);
      throw error;
    }
  }
}; 