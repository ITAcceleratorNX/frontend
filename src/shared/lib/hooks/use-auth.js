import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { authApi } from '../../api/auth';
import { useSessionStore } from '../../../entities/session';

// Создаем хранилище Zustand с персистентностью в sessionStorage
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),
      logout: () => {
        // Удаляем все токены и cookie при выходе
        set({ token: null, isAuthenticated: false, user: null });
        // Удаляем любые связанные с токенами cookie
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      },
    }),
    {
      name: 'auth-storage', // Название хранилища в sessionStorage
      storage: createJSONStorage(() => sessionStorage), // Использование sessionStorage вместо localStorage
    }
  )
);

// Хук для работы с авторизацией в компонентах
export const useAuth = () => {
  const { token, isAuthenticated, user, setToken, setUser, logout: authLogout } = useAuthStore();
  const sessionLogout = useSessionStore(state => state.logout);
  const sessionLogin = useSessionStore(state => state.login);
  const [isLoading, setIsLoading] = useState(true);

  // Проверка токена при инициализации
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Синхронизация с useSessionStore
        const sessionToken = sessionStorage.getItem('token');
        if (sessionToken && !token) {
          setToken(sessionToken);
          try {
            const userData = JSON.parse(sessionStorage.getItem('user'));
            if (userData) {
              setUser(userData);
            }
          } catch (e) {
            console.error('Ошибка при получении данных пользователя из sessionStorage:', e);
          }
        }
        
        setIsLoading(false);
        console.log('useAuth: Проверка авторизации завершена, isAuthenticated:', !!token);
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        logout();
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [token, setToken, setUser]);
  
  // Функция для логина пользователя
  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.token) {
        // Обновляем оба хранилища
        setToken(response.token);
        
        // Получаем информацию о пользователе из ответа или создаем базовую
        const userData = response.user || { 
          email, 
          name: email.split('@')[0],
          id: response.userId || 'user-id'
        };
        
        setUser(userData);
        
        // Синхронизируем с SessionStore
        sessionLogin(response.token, userData);
        
        console.log('useAuth: Пользователь успешно авторизован', { token: response.token, user: userData });
        
        return { success: true };
      } else {
        throw new Error('Не удалось получить токен');
      }
    } catch (error) {
      console.error('Ошибка при авторизации:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  };
  
  // Улучшенная функция выхода из системы
  const logout = async () => {
    try {
      console.log('useAuth: Выполняем выход из системы');
      
      // Вызываем API для удаления токена на сервере
      await authApi.logout();
      
      // Удаляем данные в хранилищах
      authLogout();
      sessionLogout();
      
      console.log('useAuth: Пользователь успешно вышел из системы');
      return { success: true };
    } catch (error) {
      console.error('useAuth: Ошибка при выходе из системы:', error);
      
      // Даже при ошибке на сервере, мы всё равно удаляем данные на клиенте
      authLogout();
      sessionLogout();
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Ошибка при выходе из системы'
      };
    }
  };
  
  // Функция для регистрации пользователя
  const register = async (email, password, uniqueCode) => {
    try {
      const response = await authApi.register(email, uniqueCode, password);
      
      if (response.success && response.token) {
        const userData = response.user || { 
          email, 
          name: email.split('@')[0],
          id: response.userId || 'user-id'
        };
        
        setToken(response.token);
        setUser(userData);
        
        // Синхронизируем с SessionStore
        sessionLogin(response.token, userData);
        
        console.log('useAuth: Пользователь успешно зарегистрирован', { token: response.token, user: userData });
        
        return { success: true };
      } else {
        throw new Error('Не удалось завершить регистрацию');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  };
  
  // Функция для проверки существования email
  const checkEmail = async (email) => {
    try {
      const response = await authApi.checkEmail(email);
      
      return { 
        success: true, 
        userExists: response.user_exists,
        email: response.email
      };
    } catch (error) {
      console.error('Ошибка при проверке email:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  };

  return {
    isAuthenticated: !!token,
    isLoading,
    token,
    user,
    login,
    logout,
    register,
    checkEmail,
  };
}; 