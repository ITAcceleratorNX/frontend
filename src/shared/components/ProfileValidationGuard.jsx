import { useProfileValidation } from '../lib/hooks/useProfileValidation';

/**
 * Компонент-защита для страниц, требующих полностью заполненный профиль
 * Проверяет профиль пользователя и перенаправляет в личный кабинет при необходимости
 */
const ProfileValidationGuard = ({ children, redirectTo = '/personal-account' }) => {
  const { isValidating } = useProfileValidation({ 
    autoRedirect: true, 
    redirectTo 
  });

  // Показываем загрузку во время валидации
  if (isValidating) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e2c4f] mx-auto mb-4"></div>
          <p className="text-gray-600">Проверка данных профиля...</p>
        </div>
      </div>
    );
  }

  // Рендерим дочерние компоненты только если профиль валиден
  return <>{children}</>;
};

export default ProfileValidationGuard;