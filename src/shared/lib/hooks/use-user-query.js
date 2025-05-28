import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/auth';

// Ключ для кеширования данных пользователя
export const USER_QUERY_KEY = 'currentUser';

/**
 * Функция для проверки наличия авторизационных cookies
 * @returns {boolean} Результат проверки
 */
const hasAuthCookies = () => {
  const cookies = document.cookie;
  return cookies.includes('token') || cookies.includes('connect.sid') || cookies.includes('jwt');
};

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
      // Проверяем наличие авторизационных cookies перед запросом
      // Это особенно важно для Safari, который может строго обрабатывать cookies
      const hasCookies = hasAuthCookies();
      
      if (!hasCookies) {
        if (import.meta.env.DEV) {
          console.log('useUserQuery: Авторизационные cookies не обнаружены, пропускаем запрос');
        }
        // Если нет cookies, сразу возвращаем null без запроса к API
        return null;
      }
      
      if (import.meta.env.DEV) {
        console.log('useUserQuery: Запрос данных пользователя');
      }
      
      // Safari требует явного указания withCredentials
      const userData = await authApi.getCurrentUser();
      
      if (import.meta.env.DEV) {
        console.log('useUserQuery: Данные пользователя получены:', !!userData);
      }
      
      return userData;
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Для 401/403 ошибок возвращаем null, не выбрасывая исключение
        if (import.meta.env.DEV) {
          console.log(`useUserQuery: Пользователь не авторизован (${error.response?.status})`);
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
    // Оптимизируем для Safari - увеличиваем время кеширования
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
    // Добавляем задержку между повторными запросами
    retryDelay: 1000,
    // Данные пользователя могут быть null (когда не авторизован)
    // Это нормальное состояние, не ошибка
    useErrorBoundary: false,
    ...options,
  };

  return useQuery(queryOptions);
};

export default useUserQuery; 