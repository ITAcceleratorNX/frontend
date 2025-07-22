import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import { validateUserProfile } from '../validation/profileValidation';
import { isProfileValidationRequired } from '../routes/protectedRoutes';

/**
 * Хук для валидации профиля пользователя на защищённых маршрутах
 * @param {Object} options - Опции валидации
 * @param {boolean} options.autoRedirect - Автоматически перенаправлять при неполном профиле
 * @param {string} options.redirectTo - Маршрут для перенаправления
 * @returns {Object} Результат валидации и функции управления
 */
export const useProfileValidation = (options = {}) => {
  const {
    autoRedirect = true,
    redirectTo = '/personal-account'
  } = options;

  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isValidating, setIsValidating] = useState(true);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    // Ждём загрузки данных пользователя
    if (isLoading) {
      return;
    }

    // Проверяем, требует ли текущий маршрут валидацию профиля
    if (!isProfileValidationRequired(location.pathname)) {
      setIsValidating(false);
      return;
    }

    // Если пользователь не авторизован, не проверяем профиль
    if (!user) {
      setIsValidating(false);
      return;
    }

    // Проверяем профиль пользователя
    const validation = validateUserProfile(user);
    setValidationResult(validation);
    
    if (!validation.isValid && autoRedirect) {
      console.log('Профиль пользователя неполный:', validation.message);
      
      // Показываем уведомление
      toast.error(
        'Пожалуйста, заполните все данные в личном кабинете перед оформлением заказа бокса.',
        {
          autoClose: 4000,
          position: 'top-center'
        }
      );
      
      // Перенаправляем в личный кабинет
      navigate(redirectTo, { 
        replace: true,
        state: { 
          message: 'Необходимо заполнить все поля профиля для оформления заказа',
          activeSection: 'personal',
          fromRoute: location.pathname
        }
      });
      return;
    }

    // Профиль валиден или автоперенаправление отключено
    setIsValidating(false);
  }, [user, isLoading, location.pathname, navigate, redirectTo, autoRedirect]);

  /**
   * Ручная проверка профиля с возможностью кастомной обработки
   */
  const validateProfile = () => {
    if (!user) {
      return {
        isValid: false,
        message: 'Пользователь не авторизован'
      };
    }

    return validateUserProfile(user);
  };

  /**
   * Проверка профиля с автоматическим перенаправлением
   */
  const validateAndRedirect = (customRedirectTo = redirectTo) => {
    const validation = validateProfile();
    
    if (!validation.isValid) {
      toast.error(
        'Пожалуйста, заполните все данные в личном кабинете перед продолжением.',
        {
          autoClose: 4000,
          position: 'top-center'
        }
      );
      
      navigate(customRedirectTo, { 
        replace: true,
        state: { 
          message: 'Необходимо заполнить все поля профиля',
          activeSection: 'personal',
          fromRoute: location.pathname
        }
      });
      return false;
    }
    
    return true;
  };

  return {
    isValidating,
    isProfileValid: validationResult?.isValid ?? true,
    validationResult,
    validateProfile,
    validateAndRedirect
  };
};