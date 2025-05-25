import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/auth';

// Ключ для запроса данных пользователя
export const USER_QUERY_KEY = 'currentUser';

/**
 * Хук для получения данных текущего пользователя с кешированием через React Query
 * @param {Object} options - Опции для useQuery
 * @returns {Object} - Результат запроса с данными пользователя
 */
export const useUserQuery = (options = {}) => {
  return useQuery({
    queryKey: [USER_QUERY_KEY],
    queryFn: async () => {
      try {
        if (import.meta.env.DEV) {
          console.log('useUserQuery: Выполняется запрос на получение данных пользователя');
        }
        const userData = await authApi.getCurrentUser();
        return userData;
      } catch (error) {
        // Если ошибка 401 или 403, значит пользователь не авторизован
        if (error.response?.status === 401 || error.response?.status === 403) {
          if (import.meta.env.DEV) {
            console.log('useUserQuery: Пользователь не авторизован (401/403)');
          }
          // Возвращаем null вместо ошибки для продолжения работы приложения
          return null;
        }
        // Для других ошибок бросаем исключение
        throw error;
      }
    },
    // Повторные попытки только для ошибок, кроме 401/403
    retry: (failureCount, error) => {
      // Для 401/403 ошибок не делаем повторных попыток
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      // Для других ошибок делаем максимум 1 повторную попытку
      return failureCount < 1;
    },
    // Оптимизированные настройки кеширования и обновления
    staleTime: 5 * 60 * 1000, // Данные считаются свежими 5 минут
    cacheTime: 10 * 60 * 1000, // Кеш хранится 10 минут
    refetchOnWindowFocus: false, // Отключаем автоматическое обновление при фокусе окна
    refetchOnReconnect: false, // Отключаем обновление при восстановлении соединения
    refetchOnMount: true, // Разрешаем обновление при монтировании для первоначальной загрузки
    
    // Обработка ошибок с использованием отдельного колбека
    useErrorBoundary: false, // Не используем Error Boundary
    
    // Объединяем с пользовательскими настройками
    ...options
  });
}; 
}; 