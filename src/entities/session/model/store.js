import { create } from 'zustand';

export const useSessionStore = create((set, get) => {
  // Инициализация из sessionStorage
  const initialToken = sessionStorage.getItem('token');
  let initialUser = null;
  
  try {
    const userData = sessionStorage.getItem('user');
    if (userData) {
      initialUser = JSON.parse(userData);
    }
  } catch (e) {
    console.error('Ошибка при получении данных пользователя из sessionStorage:', e);
  }
  
  return {
    user: initialUser,
    token: initialToken,
    isAuthenticated: !!initialToken,
  isLoading: false,
  error: null,
  
  // Actions
    setUser: (user) => {
      if (user) {
        sessionStorage.setItem('user', JSON.stringify(user));
        console.log('SessionStore: Данные пользователя обновлены:', user);
      } else {
        sessionStorage.removeItem('user');
        console.log('SessionStore: Данные пользователя удалены');
      }
      set({ user });
    },
    
    setToken: (token) => {
      if (token) {
        sessionStorage.setItem('token', token);
        console.log('SessionStore: Токен установлен:', token);
      } else {
        sessionStorage.removeItem('token');
        console.log('SessionStore: Токен удален');
      }
      set({ token, isAuthenticated: !!token });
    },
    
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  
    login: (token, userData = null) => {
      console.log('SessionStore: Вход в систему', { token, userData });
      
      if (!token) {
        console.error('SessionStore: Попытка входа без токена');
        return;
      }
      
      // Сохраняем токен
      sessionStorage.setItem('token', token);
      
      // Сохраняем данные пользователя
      if (userData) {
        sessionStorage.setItem('user', JSON.stringify(userData));
        set({ user: userData });
        console.log('SessionStore: Сохранены данные пользователя:', userData);
      } else {
        // Пытаемся извлечь email из токена если формат temp_base64email
        const tokenParts = token.split('_');
        if (tokenParts[0] === 'temp' && tokenParts.length >= 2) {
          try {
            const email = atob(tokenParts[1]);
            const user = {
              email,
              name: email.split('@')[0]
            };
            sessionStorage.setItem('user', JSON.stringify(user));
            set({ user });
            console.log('SessionStore: Извлечены данные из токена:', user);
          } catch (e) {
            console.error('SessionStore: Не удалось извлечь данные пользователя из токена:', e);
          }
        }
      }
      
      set({ token, isAuthenticated: true, error: null });
      console.log('SessionStore: Состояние после входа:', { token, isAuthenticated: true, user: get().user });
  },
  
  logout: () => {
      console.log('SessionStore: Выход из системы');
      
      // Очищаем sessionStorage
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      
      // Очищаем куки
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      
      // Обновляем состояние
      set({ user: null, token: null, isAuthenticated: false });
      console.log('SessionStore: Состояние после выхода:', { token: null, isAuthenticated: false, user: null });
  },
  };
}); 