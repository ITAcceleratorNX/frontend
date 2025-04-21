import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../../../shared/api/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export const EmailCheckForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
    },
  });
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    
    try {
      console.log('Проверка email:', data.email);
      
      // Используем API через созданный модуль authApi
      const response = await authApi.checkEmail(data.email);
      
      if (typeof response.user_exists === 'boolean') {
        // Успешный запрос
        if (response.user_exists === true) {
          console.log('Пользователь существует, перенаправление на страницу входа');
          toast.info('Перенаправление на страницу входа');
          navigate('/login', { state: { email: data.email } });
          return;
        } else {
          console.log('Пользователь не существует, перенаправление на страницу регистрации');
          toast.info('Перенаправление на страницу регистрации');
          navigate('/register', { state: { email: data.email } });
          return;
        }
      } else {
        // Неожиданный формат ответа
        setServerError('Ошибка: Неожиданный формат ответа от сервера');
        toast.error('Неожиданный ответ от сервера');
        console.error('Неожиданный формат ответа:', response);
      }
    } catch (error) {
      console.error('Ошибка при запросе API:', error);
      
      if (error.response?.data?.message) {
        const errorMessage = typeof error.response.data.message === 'string' 
          ? error.response.data.message 
          : 'Ошибка проверки email';
        setServerError(errorMessage);
        toast.error(errorMessage);
      } else {
        setServerError('Произошла ошибка при проверке вашего email. Пожалуйста, проверьте ваше интернет-соединение.');
        toast.error('Ошибка соединения. Пожалуйста, попробуйте ещё раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Функция для тестирования API (только для разработки)
  const isDevelopment = 
    typeof window !== 'undefined' && 
    window.location.hostname === 'localhost';
  
  const checkEmailDirectly = async (email) => {
    try {
      console.log(`Тестовый запрос для email: ${email}`);
      const response = await authApi.checkEmail(email);
      console.log(`Результат для ${email}:`, response);
      return response;
    } catch (err) {
      console.error('Ошибка при тестировании API:', err);
      return { error: err };
    }
  };
  
  // Добавляем тестовую функцию в глобальный объект для доступа из консоли
  if (typeof window !== 'undefined') {
    window.checkEmailDirectly = checkEmailDirectly;
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4ff] p-4">
      <div className="auth-card animate-fadeIn">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2"> Проверка Email</h1>
        <p className="text-center text-gray-600 mb-8">Введите свой адрес электронной почты, чтобы продолжить</p>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6">
            <label className="block text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'border-red-500' : 'border-gray-200'} ${isLoading ? 'bg-amber-50' : 'bg-white'}`}
              placeholder="Введите свой адрес email"
              disabled={isLoading}
              {...register('email', {
                required: 'Email обязателен',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Неверный формат email',
                },
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-sm font-medium text-red-500">{errors.email.message}</p>
            )}
          </div>
          
          {serverError && (
            <div className="rounded-md bg-red-50 p-3 border border-red-200 mb-6">
              <p className="text-sm text-red-600">{serverError}</p>
            </div>
          )}
        
          <div className="flex justify-center">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`btn-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${isLoading ? 'bg-blue-400' : ''}`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loader-container">
                    <div className="loader-ring"></div>
                    <div className="loader-text">Checking...</div>
                  </div>
                </div>
              ) : (
                'Продолжать'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailCheckForm; 