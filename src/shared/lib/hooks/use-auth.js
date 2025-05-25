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
  const { 
    user, 
    isAuthenticated, 
    isLoading, 
    error, 
    login: sessionLogin, 
    logout: sessionLogout,
    loadUser
  } = useSessionStore();

  // Загрузка пользователя при инициализации
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await loadUser();
      } catch (error) {
        console.error('useAuth: Ошибка при проверке авторизации:', error);
      }
    };
    
    checkAuth();
  }, [loadUser]);
  
  // Функция для логина пользователя
  const login = async (email, password) => {
    try {
      const result = await sessionLogin(email, password);
      return result;
    } catch (error) {
      console.error('useAuth: Ошибка при авторизации:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Неизвестная ошибка'
      };
    }
  };
  
  // Функция выхода из системы
  const logout = async () => {
    try {
      const result = await sessionLogout();
      return result;
    } catch (error) {
      console.error('useAuth: Ошибка при выходе из системы:', error);
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
      
      if (response.success) {
        console.log('useAuth: Пользователь успешно зарегистрирован');
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
    user,
    error,
    login,
    logout,
    register,
    checkEmail,
  };
}; 