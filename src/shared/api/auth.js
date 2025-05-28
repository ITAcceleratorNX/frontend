import api from './axios';

// Вспомогательная функция для очистки cookies с учетом особенностей разных браузеров
const clearAuthCookies = () => {
  const domain = window.location.hostname;
  const paths = ['/', '/api', ''];
  const cookies = ['token', 'connect.sid', 'jwt'];
  
  // Очищаем cookies для разных путей и с разными доменами для максимальной совместимости
  cookies.forEach(cookieName => {
    // Удаление для текущего домена
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/`;
    
    // Специально для Safari - попробуем разные варианты параметров
    if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${domain}`;
      
      // Пробуем для субдоменов
      if (domain.includes('.')) {
        const rootDomain = domain.split('.').slice(-2).join('.');
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${rootDomain}`;
      }
      
      // Для каждого пути
      paths.forEach(path => {
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
      });
    }
  });
};

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
      
      // Явно указываем полный набор заголовков для совместимости с Safari
      const response = await api.post('/auth/login', 
        { email, password },
        {
          withCredentials: true, // Явно указываем для запроса
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        }
      );
      
      console.log('Успешный вход в систему');
      
      // Проверяем, установлены ли cookies после входа
      setTimeout(() => {
        const hasAuthCookie = document.cookie.includes('token') || document.cookie.includes('connect.sid');
        if (!hasAuthCookie && import.meta.env.DEV) {
          console.warn('Предупреждение: Cookie авторизации не установлены после входа!');
          console.log('Текущие cookies:', document.cookie);
        }
      }, 100);
      
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
      const response = await api.post('/auth/register', 
        { email, unique_code, password },
        { withCredentials: true } // Явно указываем для запроса
      );
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
      const response = await api.get('/auth/logout', { withCredentials: true });
      console.log('Успешный выход из системы');

      // Явно очищаем куки при выходе с учетом особенностей разных браузеров
      clearAuthCookies();
      
      return response.data;
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error.response?.data || error.message);
      
      // Даже при ошибке очищаем куки
      clearAuthCookies();
      
      throw error;
    }
  },

  // Получение информации о текущем пользователе
  getCurrentUser: async () => {
    try {
      const response = await api.get('/users/me', { withCredentials: true });
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
      const response = await api.get('/auth/check', { withCredentials: true });
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
  }
}; 