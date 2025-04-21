import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../../api/auth';

// Создаем хранилище Zustand с персистентностью в localStorage
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      isAuthenticated: false,
      user: null,
      
      setToken: (token) => set({ token, isAuthenticated: !!token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth-storage', // Название хранилища в localStorage
    }
  )
);

// Хук для работы с авторизацией в компонентах
export const useAuth = () => {
  const { token, isAuthenticated, user, setToken, setUser, logout } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Проверка токена при инициализации
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Здесь можно добавить проверку валидности токена через API
        // Например, запрос к /auth/verify-token
        setIsLoading(false);
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        logout();
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [logout]);
  
  // Функция для логина пользователя
  const login = async (email, password) => {
    try {
      const response = await authApi.login(email, password);
      
      if (response.success && response.token) {
        setToken(response.token);
        // Здесь можно добавить запрос информации о пользователе
        setUser({ email, id: 'user-id' }); // Замените на реальные данные
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
  
  // Функция для регистрации пользователя
  const register = async (email, password, uniqueCode) => {
    try {
      const response = await authApi.register(email, uniqueCode, password);
      
      if (response.success && response.token) {
        setToken(response.token);
        setUser({ email, id: 'user-id' }); // Замените на реальные данные
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
    isAuthenticated,
    isLoading,
    token,
    user,
    login,
    logout,
    register,
    checkEmail,
  };
}; 