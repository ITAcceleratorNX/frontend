import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { toast } from 'react-toastify';
import { EyeIcon, EyeOffIcon, Mail, Lock } from 'lucide-react';
import '../styles/auth-forms.css';
import api from '../../../shared/api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../../shared/lib/hooks/use-user-query';
import loginLogo from '../../../assets/login-logo-66f0b4.png';

export const LoginForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  // Заполняем email, если он пришёл из проверки email
  useEffect(() => {
    if (location.state?.email) {
      console.log('Вход в систему: устанавливаем email из state:', location.state.email);
      setValue('email', location.state.email);
    } else {
      // Проверяем URL параметры
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        console.log('Вход в систему: устанавливаем email из URL:', emailParam);
        setValue('email', emailParam);
      }
    }
    
    // Показываем сообщение о восстановлении пароля, если оно есть
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location, setValue]);
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    
    try {
      console.log('LoginForm: Отправка запроса на логин:', data.email);
      
      // Используем функцию login из контекста
      const result = await login(data.email, data.password);
      
      if (result.success) {
        console.log('LoginForm: Успешный вход, перенаправляем на главную');
        toast.success('Вход выполнен успешно!');
        
        // Инвалидируем кеш пользователя для принудительного обновления после входа
        queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
        
        // Получаем целевой маршрут для перенаправления
        const redirectTo = location.state?.from?.pathname || '/personal-account';
        
        // Небольшая задержка перед перенаправлением
        setTimeout(() => {
          // Предотвращаем перенаправление на внешний URL
          if (redirectTo.startsWith('http')) {
        navigate('/', { replace: true });
          } else {
            navigate(redirectTo, { replace: true });
          }
        }, 100);
      } else {
        setServerError(result.error || 'Не удалось войти. Пожалуйста, проверьте введенные данные.');
        toast.error(result.error || 'Не удалось войти. Пожалуйста, проверьте введенные данные.');
      }
    } catch (error) {
      console.error('LoginForm: Ошибка при входе:', error);
      
      // Обрабатываем различные типы ошибок
      let errorMessage = 'Произошла ошибка при входе. Пожалуйста, попробуйте еще раз.';
      
      if (error.response) {
        const { status, data } = error.response;
        
        // Обрабатываем HTTP статусы
        switch (status) {
          case 401:
            if (data?.message) {
              errorMessage = data.message;
            } else {
              errorMessage = 'Неверный email или пароль. Пожалуйста, проверьте введенные данные.';
            }
            break;
          case 400:
            if (data?.message) {
              if (typeof data.message === 'object') {
                const messages = Object.values(data.message).join(', ');
                errorMessage = messages;
              } else {
                errorMessage = data.message;
              }
            } else {
              errorMessage = 'Некорректные данные. Пожалуйста, проверьте введенную информацию.';
            }
            break;
          case 429:
            errorMessage = 'Слишком много попыток входа. Пожалуйста, подождите немного и попробуйте снова.';
            break;
          case 500:
            errorMessage = 'Ошибка сервера. Пожалуйста, попробуйте позже.';
            break;
          default:
            if (data?.message) {
              errorMessage = data.message;
            } else {
              errorMessage = `Ошибка ${status}. Пожалуйста, попробуйте еще раз.`;
            }
        }
      } else if (error.request) {
        // Запрос был отправлен, но ответ не получен
        errorMessage = 'Не удалось подключиться к серверу. Проверьте интернет-соединение.';
      } else {
        // Ошибка в коде
        errorMessage = error.message || 'Произошла неизвестная ошибка.';
      }
      
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleGoogleLogin = async () => {
    try {
      console.log('Начинаем авторизацию через Google');
      
      // Перенаправляем пользователя на URL, который обрабатывает бэкенд
      window.location.href = `${api.defaults.baseURL}/auth/google`;
      
    } catch (error) {
      // Если сервер возвращает 302, axios может воспринять это как ошибку
      // Проверяем, есть ли в ответе URL для редиректа
      if (error.response && error.response.status === 302 && error.response.headers.location) {
        console.log('Получен редирект URL:', error.response.headers.location);
        window.location.href = error.response.headers.location;
      } else {
        console.error('Ошибка при авторизации через Google:', error);
        toast.error('Не удалось выполнить вход через Google');
      }
    }
  };
  
  // Общее состояние загрузки, учитывая как локальное состояние формы, так и состояние авторизации
  const isSubmitting = isLoading || authLoading;
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[450px] mx-auto">
        {/* Карточка формы входа */}
        <div className="bg-white rounded-[25px] border border-[#DFDFDF] shadow-[0px_4px_8.8px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="flex flex-col items-center gap-[24px] sm:gap-[28px] lg:gap-[35px] p-5 sm:p-6 lg:p-8">
            {/* Верхняя часть с логотипом и заголовком */}
            <div className="flex flex-col items-center gap-[20px] w-full">
              {/* Логотип */}
              <div className="w-[48px] h-[54px] sm:w-[52px] sm:h-[58px] flex-shrink-0">
                <img 
                  src={loginLogo} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Заголовок и подзаголовок */}
              <div className="flex flex-col items-center gap-[8px] w-full">
                <h1 className="text-[22px] sm:text-[24px] lg:text-[26px] font-medium leading-[1.19] tracking-[-0.05em] text-center text-[#363636] max-w-fit mx-auto">
                  Добро пожаловать!
                </h1>
                <p className="text-[13px] sm:text-[14px] lg:text-[15px] font-normal leading-[1.19] text-center text-[#5C5C5C] w-full max-w-[320px]">
                  Введите данные для входа в систему.
                </p>
              </div>
            </div>
            
            {/* Кнопка Google и разделитель */}
            <div className="flex flex-col gap-[22px] w-full max-w-[400px]">
              {/* Кнопка Google */}
              <button 
                type="button" 
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2.5 px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4 border border-[#DFDFDF] rounded-[25px] bg-white hover:bg-gray-50 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] flex-shrink-0">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-[15px] sm:text-[16px] lg:text-[18px] font-normal leading-[1.25] text-[#5F6368] font-['Google_Sans',sans-serif]">
                  Google
                </span>
              </button>
              
              {/* Разделитель */}
              <div className="flex items-center justify-between gap-[14px] w-full">
                <div className="flex-1 h-px bg-[#7A7A7A]"></div>
                <span className="text-[14px] sm:text-[15px] lg:text-[16px] font-normal leading-[1.19] text-[#7A7A7A] whitespace-nowrap">
                  ИЛИ ВВЕСТИ
                </span>
                <div className="flex-1 h-px bg-[#7A7A7A]"></div>
              </div>
            </div>
            
            {/* Форма входа */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[28px] w-full max-w-[400px]">
              {/* Поля ввода */}
              <div className="flex flex-col gap-[24px] w-full">
                {/* Email поле */}
                <div className="flex flex-col gap-[8px] w-full">
                  <label className="flex items-center gap-[6px] text-[13px] sm:text-[14px] lg:text-[15px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Mail className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-[#5C5C5C] flex-shrink-0" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className={`w-full h-[52px] sm:h-[56px] lg:h-[60px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[14px] sm:text-[15px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.email ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isSubmitting ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="example@gmail.com"
                      disabled={isSubmitting}
                      {...register('email', {
                        required: 'Email обязателен',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Неверный формат email',
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                
                {/* Password поле */}
                <div className="flex flex-col gap-[8px] w-full">
                  <label className="flex items-center gap-[6px] text-[13px] sm:text-[14px] lg:text-[15px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Lock className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-[#5C5C5C] flex-shrink-0" />
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full h-[52px] sm:h-[56px] lg:h-[60px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[14px] sm:text-[15px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.password ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isSubmitting ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="Введите пароль"
                      disabled={isSubmitting}
                      {...register('password', {
                        required: 'Пароль обязателен',
                        minLength: {
                          value: 6,
                          message: 'Минимум 6 символов',
                        },
                      })}
                    />
                    <div className="absolute right-4 sm:right-5 top-0 bottom-0 flex items-center pointer-events-none">
                      <button 
                        type="button"
                        className="flex items-center justify-center text-[#BEBEBE] hover:text-[#5C5C5C] transition-colors disabled:opacity-50 cursor-pointer pointer-events-auto"
                        onClick={togglePasswordVisibility}
                        disabled={isSubmitting}
                      >
                        {showPassword ? <EyeOffIcon className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" /> : <EyeIcon className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px]" />}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
                
                {/* Запомнить меня и Забыли пароль */}
                <div className="flex justify-between items-center text-[13px] sm:text-[14px] lg:text-[15px] font-normal leading-[1.19]">
                  <div className="flex items-center gap-[12px]">
                    <input 
                      type="checkbox" 
                      id="remember" 
                      className="w-[18px] h-[18px] rounded-[3px] border border-[#5C5C5C] bg-white text-[#26B3AB] focus:ring-2 focus:ring-[#26B3AB]/20 cursor-pointer"
                    />
                    <label htmlFor="remember" className="text-[#363636] cursor-pointer">
                      Запомнить меня
                    </label>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => navigate('/restore-password')}
                    className="text-[#363636] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    Забыли пароль?
                  </button>
                </div>
              </div>
              
              {/* Сообщение об ошибке */}
              {serverError && (
                <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-sm text-red-600 flex items-start gap-2">
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{serverError}</span>
                </div>
              )}
              
              {/* Кнопка входа и ссылка на регистрацию */}
              <div className="flex flex-col items-center gap-[16px] w-full">
                {/* Кнопка входа */}
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-4 sm:px-6 py-3.5 sm:py-4 bg-gradient-to-br from-[#26B3AB] to-[#104D4A] rounded-[25px] text-[15px] sm:text-[17px] lg:text-[18px] font-medium leading-[1.4] text-[#F5F5F5] hover:opacity-90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Выполняется вход...</span>
                    </div>
                  ) : (
                    <span>Войти</span>
                  )}
                </button>
                
                {/* Ссылка на регистрацию */}
                <p className="text-[13px] sm:text-[14px] lg:text-[15px] font-normal leading-[1.19] text-center text-[#363636]">
                  Нет аккаунта?{" "}
                  <button 
                    type="button" 
                    className="text-[#363636] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => navigate('/register')}
                    disabled={isSubmitting}
                  >
                    Зарегистрироваться
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 