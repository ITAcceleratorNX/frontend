import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/auth';

// Ключ для кеширования данных пользователя
export const USER_QUERY_KEY = 'currentUser';

/**
 * Хук для получения данных текущего пользователя с использованием React Query
 * с оптимизированными настройками для предотвращения лишних запросов
 * 
 * @param {Object} options - Дополнительные опции для useQuery
 * @returns {Object} Результат выполнения useQuery
 */
export const useUserQuery = (options = {}) => {
  // Функция для запроса данных пользователя
  const queryFn = async () => {
    try {
      if (import.meta.env.DEV) {
        console.log('useUserQuery: Запрос данных пользователя');
      }
      
      const userData = await authApi.getCurrentUser();
      
      if (import.meta.env.DEV) {
        console.log('useUserQuery: Данные пользователя получены:', !!userData);
      }
      
      return userData;
    } catch (error) {
      if (error.response?.status === 401) {
        // Для 401 ошибки возвращаем null, не выбрасывая исключение
        if (import.meta.env.DEV) {
          console.log('useUserQuery: Пользователь не авторизован (401)');
        }
        return null;
      }
      
      // Для других ошибок пробрасываем их дальше
      throw error;
    }
  };

  // Настройки запроса с возможностью переопределения через параметры
  const queryOptions = {
    queryKey: [USER_QUERY_KEY],
    queryFn,
    // Кешировать данные на 30 минут
    staleTime: 30 * 60 * 1000,
    // Хранить данные в кеше 60 минут
    cacheTime: 60 * 60 * 1000,
    // Не перезапрашивать при возвращении на страницу
    refetchOnWindowFocus: false,
    // Не перезапрашивать при восстановлении соединения
    refetchOnReconnect: false,
    // Не перезапрашивать при монтировании компонентов по умолчанию
    refetchOnMount: false,
    // Одна повторная попытка при ошибке
    retry: 1,
    // Данные пользователя могут быть null (когда не авторизован)
    // Это нормальное состояние, не ошибка
    useErrorBoundary: false,
    ...options,
  };

  return useQuery(queryOptions);
};

export default useUserQuery; 