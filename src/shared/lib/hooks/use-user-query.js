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
        // Если ошибка 401 или 403, считаем что пользователь не авторизован
        if (error?.response?.status === 401 || error?.response?.status === 403) {
          if (import.meta.env.DEV) {
            console.log('useUserQuery: Пользователь не авторизован (401/403)');
          }
          return null;
        }
        if (import.meta.env.DEV) {
          console.error('useUserQuery: Ошибка при получении данных пользователя:', error);
        }
        throw error;
      }
    },
    // Усиленные настройки кеширования для минимизации запросов
    retry: false, // Не повторять запрос при ошибке
    staleTime: 30 * 60 * 1000, // Данные считаются свежими в течение 30 минут
    cacheTime: 60 * 60 * 1000, // Кеш хранится 60 минут
    refetchOnMount: false,  // Не запрашивать данные повторно при монтировании, если они уже в кеше
    refetchOnWindowFocus: false, // Не запрашивать при фокусе окна
    refetchOnReconnect: false, // Не запрашивать при восстановлении соединения
    refetchInterval: false, // Отключаем периодический опрос
    ...options, // Возможность переопределить настройки
  });
}; 