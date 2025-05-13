import React, { createContext, useState, useEffect, useContext } from 'react';
import Cookies from 'js-cookie';
import { authApi } from '../api/auth';

// Создаем контекст
export const AuthContext = createContext(null);

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // Проверяем наличие токена в cookie при загрузке
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = Cookies.get('token');
        console.log('AuthContext: Проверка токена в cookies:', !!storedToken);
        
        if (storedToken) {
          setToken(storedToken);
          setIsAuthenticated(true);
          
          // Пытаемся получить информацию о пользователе из cookie
          const userCookie = Cookies.get('user');
          if (userCookie) {
            try {
              const userData = JSON.parse(userCookie);
              setUser(userData);
              console.log('AuthContext: Пользовательские данные загружены из cookie:', userData);
            } catch (e) {
              console.error('AuthContext: Ошибка при парсинге данных пользователя из cookie:', e);
            }
          } else {
            // Если в токене закодирован email (формат temp_base64email)
            const tokenParts = storedToken.split('_');
            if (tokenParts[0] === 'temp' && tokenParts.length >= 2) {
              try {
                const email = atob(tokenParts[1]);
                const userInfo = {
                  email,
                  name: email.split('@')[0],
                  id: 'temp-user'
                };
                setUser(userInfo);
                console.log('AuthContext: Данные пользователя получены из токена:', userInfo);
              } catch (e) {
                console.error('AuthContext: Ошибка при извлечении email из токена:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error('AuthContext: Ошибка при проверке авторизации:', error);
        logout(); // Сбрасываем данные при ошибке
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Функция для входа пользователя
  const login = async (email, password) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Попытка входа:', email);
      
      const response = await authApi.login(email, password);
      console.log('AuthContext: Ответ от входа:', response);
      
      if (response && response.token) {
        // Сохраняем токен в cookie (срок действия 7 дней)
        Cookies.set('token', response.token, { expires: 7, path: '/' });
        
        // Получаем информацию о пользователе из ответа или создаем базовую
        const userData = response.user || { 
          email, 
          name: email.split('@')[0],
          id: response.userId || 'user-id'
        };
        
        // Сохраняем данные пользователя в cookie
        Cookies.set('user', JSON.stringify(userData), { expires: 7, path: '/' });
        
        // Обновляем состояние
        setToken(response.token);
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('AuthContext: Пользователь успешно авторизован', { token: response.token, user: userData });
        
        return { success: true };
      } else if (response && response.success === true) {
        // Случай, когда ответ успешный, но без токена 
        const tempToken = `temp_${btoa(email)}`;
        const userData = { 
          email,
          name: email.split('@')[0],
          id: 'temp-user'
        };
        
        // Сохраняем временный токен в cookie
        Cookies.set('token', tempToken, { expires: 7, path: '/' });
        Cookies.set('user', JSON.stringify(userData), { expires: 7, path: '/' });
        
        // Обновляем состояние
        setToken(tempToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        console.log('AuthContext: Создан временный токен:', tempToken);
        
        return { success: true };
      } else {
        throw new Error('Не удалось получить токен');
      }
    } catch (error) {
      console.error('AuthContext: Ошибка при авторизации:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Неизвестная ошибка'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для регистрации пользователя
  const register = async (email, uniqueCode, password) => {
    try {
      setIsLoading(true);
      console.log('AuthContext: Попытка регистрации:', email);
      
      const response = await authApi.register(email, uniqueCode, password);
      console.log('AuthContext: Ответ от регистрации:', response);
      
      if (response && response.success) {
        // Если регистрация успешна, но не выполняем автоматический вход
        return { success: true };
      } else {
        throw new Error('Не удалось завершить регистрацию');
      }
    } catch (error) {
      console.error('AuthContext: Ошибка при регистрации:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Неизвестная ошибка'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Функция для выхода пользователя
  const logout = async () => {
    try {
      console.log('AuthContext: Выход из системы');
      
      // Пытаемся выполнить запрос на logout
      try {
        await authApi.logout();
        console.log('AuthContext: Успешное выполнение запроса logout на сервере');
      } catch (error) {
        console.error('AuthContext: Ошибка при запросе logout на сервер:', error);
        // Продолжаем локальный logout даже при ошибке запроса
      }
      
      // Удаляем все связанные cookie
      Cookies.remove('token', { path: '/' });
      Cookies.remove('user', { path: '/' });
      Cookies.remove('connect.sid', { path: '/' });
      
      // Очищаем состояние
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('AuthContext: Пользователь вышел из системы');
    } catch (error) {
      console.error('AuthContext: Ошибка при выходе из системы:', error);
    }
  };

  // Функция для проверки email
  const checkEmail = async (email) => {
    try {
      console.log('AuthContext: Проверка email:', email);
      const response = await authApi.checkEmail(email);
      
      return { 
        success: true, 
        userExists: response.user_exists,
        email: response.email
      };
    } catch (error) {
      console.error('AuthContext: Ошибка при проверке email:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Неизвестная ошибка'
      };
    }
  };

  // Экспортируем значение контекста
  const value = {
    isAuthenticated,
    isLoading,
    user,
    token,
    login,
    logout,
    register,
    checkEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Хук для использования контекста
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 