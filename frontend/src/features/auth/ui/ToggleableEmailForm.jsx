import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { authApi } from '../../../shared/api/authApi';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/auth-forms.css';

export const ToggleableEmailForm = ({ isOpen, onClose }) => {
  // Добавляем логирование при изменении состояния isOpen
  useEffect(() => {
    if (isOpen) {
      console.log('Форма проверки Email открыта');
    }
  }, [isOpen]);
  
  // Функция закрытия с логированием
  const handleClose = () => {
    console.log('Форма проверки Email закрыта');
    onClose();
  };
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
      
      if (response.data && typeof response.data.user_exists === 'boolean') {
        // Успешный запрос
        if (response.data.user_exists === true) {
          console.log('Пользователь существует, перенаправление на страницу входа');
          toast.info('Перенаправление на страницу входа');
          navigate('/login', { state: { email: data.email } });
          onClose(); // Закрываем форму
          return;
        } else {
          console.log('Пользователь не существует, перенаправление на страницу регистрации');
          toast.info('Перенаправление на страницу регистрации');
          navigate('/register', { state: { email: data.email } });
          onClose(); // Закрываем форму
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
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Затемнение фона */}
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />
          
          {/* Модальное окно */}
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="flex min-h-screen items-center justify-center p-4"  
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Проверка Email</h1>
              <p className="text-center text-gray-600 mb-8">Введите свой адрес электронной почты, чтобы продолжить</p>
              <button 
                onClick={handleClose}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
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
                    className="btn-primary transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] w-full py-2 rounded-md text-white"
                    style={{ backgroundColor: '#273655' }}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="loader-container">
                          <div className="loader-ring"></div>
                          <div className="loader-text">Проверка...</div>
                        </div>
                      </div>
                    ) : (
                      'Продолжить'
                    )}
                  </button>
                </div>
              </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ToggleableEmailForm;
