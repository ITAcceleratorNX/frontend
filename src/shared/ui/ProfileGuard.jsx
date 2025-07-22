import { useEffect } from 'react';
import { useProfileCheck } from '../lib/hooks/useProfileCheck';
import { Loader2 } from 'lucide-react';

// Компонент для защиты маршрутов, требующих заполненный профиль
export const ProfileGuard = ({ 
  children, 
  customMessage,
  showLoader = true,
  fallback = null 
}) => {
  const { 
    isLoading, 
    validateAndRedirect, 
    isProfileComplete 
  } = useProfileCheck();

  useEffect(() => {
    if (!isLoading && !isProfileComplete) {
      validateAndRedirect(customMessage);
    }
  }, [isLoading, isProfileComplete, validateAndRedirect, customMessage]);

  // Показываем загрузку
  if (isLoading && showLoader) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Проверка профиля...</span>
      </div>
    );
  }

  // Показываем fallback если профиль не заполнен
  if (!isLoading && !isProfileComplete) {
    return fallback;
  }

  // Показываем контент если все ок
  return isProfileComplete ? children : null;
};

// HOC для защиты компонентов
export const withProfileGuard = (Component, options = {}) => {
  return function ProfileGuardedComponent(props) {
    return (
      <ProfileGuard {...options}>
        <Component {...props} />
      </ProfileGuard>
    );
  };
};