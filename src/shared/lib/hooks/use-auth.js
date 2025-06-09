import { authApi } from '../../api/auth';

// Хук для работы с авторизацией в компонентах
export const useAuth = () => {
  // Функция для логина пользователя
  const login = async (email, password) => {
    try {
      const result = await authApi.login(email, password);
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
      const result = await authApi.logout();
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
    login,
    logout,
    register,
    checkEmail,
  };
}; 