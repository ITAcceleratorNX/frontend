import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authApi } from '../../api/auth';
import { validateUserProfile } from '../validation/profileValidation';

// Хук для получения и проверки данных пользователя
export const useProfileCheck = () => {
  const navigate = useNavigate();

  // Получаем данные пользователя через React Query
  const {
    data: user,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authApi.getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 минут
  });

  // Валидируем профиль пользователя
  const profileValidation = user ? validateUserProfile(user) : null;

  // Функция для проверки профиля с редиректом
  const validateAndRedirect = (customToastMessage) => {
    if (!user) {
      toast.error('Необходимо войти в систему');
      navigate('/auth');
      return false;
    }

    if (!profileValidation?.isValid) {
      const message = customToastMessage || 
        'Пожалуйста, заполните все данные в личном кабинете перед оформлением заказа бокса.';
      
      toast.error(message, {
        duration: 4000,
        position: 'top-center'
      });
      
      navigate('/personal-account');
      return false;
    }
    
    return true;
  };

  // Функция для проверки конкретных полей
  const checkRequiredFields = (requiredFields) => {
    if (!user) return { isValid: false, missingFields: ['Авторизация'] };

    const missingFields = [];
    requiredFields.forEach(fieldKey => {
      const value = user[fieldKey];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        missingFields.push(fieldKey);
      }
    });

    return {
      isValid: missingFields.length === 0,
      missingFields
    };
  };

  return {
    user,
    isLoading,
    error,
    refetch,
    profileValidation,
    validateAndRedirect,
    checkRequiredFields,
    isProfileComplete: profileValidation?.isValid || false
  };
};

// Хук для быстрой проверки авторизации без загрузки полного профиля
export const useAuthCheck = () => {
  const navigate = useNavigate();

  const {
    data: authStatus,
    isLoading,
    error
  } = useQuery({
    queryKey: ['authCheck'],
    queryFn: authApi.checkAuth,
    retry: false,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });

  const requireAuth = (redirectPath = '/auth') => {
    if (!authStatus?.isAuthenticated) {
      toast.error('Необходимо войти в систему');
      navigate(redirectPath);
      return false;
    }
    return true;
  };

  return {
    isAuthenticated: authStatus?.isAuthenticated || false,
    user: authStatus?.user,
    isLoading,
    error,
    requireAuth
  };
};