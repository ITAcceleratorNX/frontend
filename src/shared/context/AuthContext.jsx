import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/auth';
import { USER_QUERY_KEY, useUserQuery } from '../lib/hooks/use-user-query';

// Создаем контекст
export const AuthContext = createContext(null);

// Провайдер контекста
export const AuthProvider = ({ children }) => {
  // Используем React Query для получения данных пользователя с оптимизированными настройками
  const { 
    data: user, 
    isLoading, 
    error, 
    refetch,
    isSuccess,
    isError,
    isFetching,
  } = useUserQuery({
    suspense: false, // Не использовать React Suspense
    useErrorBoundary: false, // Не использовать Error Boundary
    // Для основного запроса пользователя разрешаем загрузку при монтировании
    refetchOnMount: true,
    retry: 1, // Одна попытка повторного запроса
  });

  // Доступ к кешу React Query
  const queryClient = useQueryClient();

  // Расширенное логирование в режиме разработки
  useEffect(() => {
    if (import.meta.env.DEV && (!isLoading || !isFetching)) {
      console.log('AuthContext: Данные пользователя:', { 
        isAuthenticated: !!user,
        role: user?.role,
        hasUser: !!user,
        isLoading,
        isFetching,
        user // Полные данные пользователя
      });
    }
  }, [user, isLoading, isFetching]);

  // Мемоизированная функция для входа
  const login = useCallback(async (login, password) => {
    try {
      if (import.meta.env.DEV) console.log('AuthContext: Попытка входа:', login);
      
      // Выполняем запрос на авторизацию
      const response = await authApi.login(login, password);
      
      if (response.success) {
        // Инвалидируем кеш пользователя, чтобы запросить свежие данные
        queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
        
        // Перезапускаем запрос для получения данных пользователя
        await refetch();
        
        if (import.meta.env.DEV) console.log('AuthContext: Пользователь успешно авторизован');
        
        return { success: true };
      } else {
        throw new Error(response.message || 'Ошибка авторизации');
      }
    } catch (error) {
      console.error('AuthContext: Ошибка при авторизации:', error);
      
      // Преобразуем технические ошибки в понятные пользователю сообщения
      let userFriendlyError = 'Неизвестная ошибка';
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            userFriendlyError = data?.message || 'Неверный логин или пароль';
            break;
          case 400:
            userFriendlyError = data?.message || 'Некорректные данные';
            break;
          case 429:
            userFriendlyError = 'Слишком много попыток входа. Попробуйте позже';
            break;
          case 500:
            userFriendlyError = 'Ошибка сервера. Попробуйте позже';
            break;
          default:
            userFriendlyError = data?.message || `Ошибка ${status}`;
        }
      } else if (error.request) {
        userFriendlyError = 'Не удалось подключиться к серверу';
      } else {
        userFriendlyError = error.message || 'Произошла ошибка';
      }
      
      return { 
        success: false, 
        error: userFriendlyError
      };
    }
  }, [queryClient, refetch]);

  // Мемоизированная функция для регистрации
  const register = useCallback(async (phone, uniqueCode, password, leadSource = undefined, visitorId = undefined) => {
    try {
      if (import.meta.env.DEV) console.log('AuthContext: Попытка регистрации:', phone, 'lead_source:', leadSource);
      
      const response = await authApi.register(phone, uniqueCode, password, leadSource, visitorId);
      
      if (response.success) {
        if (import.meta.env.DEV) console.log('AuthContext: Регистрация успешна');
        // Очищаем сохраненный источник после успешной регистрации
        if (leadSource) {
          localStorage.removeItem('extraspace_lead_source');
        }
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
    }
  }, []);

  // Мемоизированная функция для регистрации юридического лица (верификация через SMS по телефону)
  const registerLegal = useCallback(async (phone, uniqueCode, password, legalData, leadSource = null, visitorId = undefined) => {
    try {
      if (import.meta.env.DEV) console.log('AuthContext: Попытка регистрации юридического лица:', phone, 'lead_source:', leadSource);
      
      const response = await authApi.registerLegal(phone, uniqueCode, password, legalData, leadSource, visitorId);
      
      if (response.success) {
        if (import.meta.env.DEV) console.log('AuthContext: Регистрация юридического лица успешна');
        // Очищаем сохраненный источник после успешной регистрации
        if (leadSource) {
          localStorage.removeItem('extraspace_lead_source');
        }
        return { success: true };
      } else {
        throw new Error('Не удалось завершить регистрацию');
      }
    } catch (error) {
      console.error('AuthContext: Ошибка при регистрации юридического лица:', error);
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Неизвестная ошибка'
      };
    }
  }, []);

  // Мемоизированная функция для выхода
  const logout = useCallback(async () => {
    try {
      if (import.meta.env.DEV) console.log('AuthContext: Выход из системы');
      
      // Пытаемся выполнить запрос на logout
        await authApi.logout();
      
      // Очищаем кеш пользователя
      queryClient.setQueryData([USER_QUERY_KEY], null);
      
      if (import.meta.env.DEV) console.log('AuthContext: Пользователь вышел из системы');
      return { success: true };
    } catch (error) {
      console.error('AuthContext: Ошибка при выходе из системы:', error);
      
      // Даже при ошибке сбрасываем состояние
      queryClient.setQueryData([USER_QUERY_KEY], null);
      
      return { success: false, error: error.message || 'Ошибка при выходе из системы' };
    }
  }, [queryClient]);

  // Функция для проверки email
  const checkEmail = useCallback(async (email) => {
    try {
      if (import.meta.env.DEV) console.log('AuthContext: Проверка email:', email);
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
  }, []);

  // Функция для проверки телефона
  const checkPhone = useCallback(async (phone) => {
    try {
      if (import.meta.env.DEV) console.log('AuthContext: Проверка телефона:', phone);
      const response = await authApi.checkPhone(phone);
      
      return { 
        success: true, 
        userExists: response.user_exists,
        phone: response.phone
      };
    } catch (error) {
      console.error('AuthContext: Ошибка при проверке телефона:', error);
      
      // Обработка ошибки rate limit
      if (error.response?.status === 429) {
        return {
          success: false,
          error: error.response.data?.error || 'Слишком много запросов. Пожалуйста, подождите.',
          remainingSeconds: error.response.data?.remainingSeconds
        };
      }
      
      return { 
        success: false, 
        error: error.response?.data?.message || error.message || 'Неизвестная ошибка'
      };
    }
  }, []);

  // Мемоизируем значение контекста для предотвращения лишних ререндеров
  const value = useMemo(() => ({
    isAuthenticated: !!user,
    isLoading: isLoading || isFetching,
    user,
    error,
    login,
    logout,
    register,
    registerLegal,
    checkEmail,
    checkPhone,
    refetchUser: refetch
  }), [
    user, 
    isLoading, 
    isFetching, 
    error, 
    login, 
    logout, 
    register,
    registerLegal,
    checkEmail,
    checkPhone, 
    refetch
  ]);

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