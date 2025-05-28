import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { authApi } from '../../../shared/api/auth';
import { isEqual } from 'lodash-es';

// Функция для глубокого сравнения объектов
const deepCompare = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  return isEqual(a, b);
};

// Хранилище Zustand для управления сессией с оптимизированными обновлениями
export const useSessionStore = create((set, get) => ({
  // Состояние
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loadRequestInProgress: false, // Флаг для отслеживания текущего запроса
  
  // Actions
    setUser: (user) => {
    // Устанавливаем пользователя только если он изменился
    const currentUser = get().user;
    if (!deepCompare(user, currentUser)) {
      set({ 
        user, 
        isAuthenticated: !!user,
        // Если пользователь установлен, загрузка завершена
        ...(user ? { isLoading: false } : {})
      });
      
      if (import.meta.env.DEV) {
        console.log('SessionStore: Данные пользователя обновлены');
      }
    }
    },
    
  setAuthenticated: (isAuthenticated) => {
    if (isAuthenticated !== get().isAuthenticated) {
      set({ isAuthenticated });
      
      if (import.meta.env.DEV) {
        console.log('SessionStore: Статус аутентификации обновлен:', isAuthenticated);
      }
    }
    },
    
  setIsLoading: (isLoading) => {
    if (isLoading !== get().isLoading) {
      set({ isLoading });
    }
  },
  
  setError: (error) => {
    if (!deepCompare(error, get().error)) {
      set({ error });
    }
  },
  
  // Загрузка данных пользователя с сервера с защитой от параллельных запросов
  loadUser: async () => {
    // Если уже загружается или пользователь уже есть, или запрос в процессе - не делаем повторный запрос
    if (get().isLoading || get().loadRequestInProgress) return get().user;
    
    try {
      set({ isLoading: true, error: null, loadRequestInProgress: true });
      const user = await authApi.getCurrentUser();
      
      // Проверяем, изменились ли данные пользователя перед обновлением
      if (!deepCompare(user, get().user)) {
        set({ 
          user, 
          isAuthenticated: !!user, 
          isLoading: false 
        });
      } else {
        // Если данные не изменились, только сбрасываем флаг загрузки
        set({ isLoading: false });
      }
      
      return user;
    } catch (error) {
      console.error('SessionStore: Ошибка загрузки пользователя:', error);
      set({ 
        isAuthenticated: false, 
        user: null, 
        error, 
        isLoading: false 
      });
      return null;
    } finally {
      set({ loadRequestInProgress: false });
    }
  },
  
  // Обновление пользователя из кеша без повторного запроса
  updateUserFromCache: (user) => {
    const currentUser = get().user;
    if (!deepCompare(user, currentUser)) {
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else if (get().isAuthenticated) {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    }
  },
  
  // Войти в систему
  login: async (email, password) => {
    // Проверка наличия текущего запроса
    if (get().isLoading) return { success: false, error: 'Запрос уже выполняется' };
    
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login(email, password);
      
      // Если успешно, пользователь будет получен через React Query
      set({ isLoading: false });
      
      if (import.meta.env.DEV) {
        console.log('SessionStore: Запрос на вход выполнен успешно');
      }
      
      return { success: true };
    } catch (error) {
      console.error('SessionStore: Ошибка входа:', error);
      set({ error, isLoading: false });
      return { success: false, error };
    }
  },
  
  // Выйти из системы
  logout: async () => {
    // Проверка наличия текущего запроса
    if (get().isLoading) return { success: false, error: 'Запрос уже выполняется' };
    
    try {
      set({ isLoading: true });
      await authApi.logout();
      set({ user: null, isAuthenticated: false, isLoading: false });
      
      if (import.meta.env.DEV) {
        console.log('SessionStore: Выход выполнен успешно');
      }
      
      return { success: true };
    } catch (error) {
      console.error('SessionStore: Ошибка при выходе:', error);
      // Даже при ошибке сбрасываем состояние
      set({ user: null, isAuthenticated: false, isLoading: false });
      return { success: false, error };
    }
  },
})); 