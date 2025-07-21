import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { toast } from 'react-toastify';
import { EyeIcon, EyeOffIcon, Mail, Lock, ArrowRight } from 'lucide-react';
import '../styles/auth-forms.css';
import api from '../../../shared/api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../../shared/lib/hooks/use-user-query';

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
      
      if (error.response?.data?.message) {
        if (typeof error.response.data.message === 'object') {
          const messages = Object.values(error.response.data.message).join(', ');
          setServerError(`Ошибка: ${messages}`);
          toast.error(messages);
        } else {
          setServerError(`Ошибка: ${error.response.data.message}`);
          toast.error(error.response.data.message);
        }
      } else {
        setServerError('Произошла ошибка при входе. Пожалуйста, попробуйте еще раз.');
        toast.error('Произошла ошибка при входе. Пожалуйста, попробуйте еще раз.');
      }
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-[450px] mx-auto">
        {/* Блок с логотипом компании */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#273655]">ExtraSpace</h2>
          <div className="h-1 w-20 bg-[#273655] mx-auto mt-2 rounded-full"></div>
        </div>
        
        {/* Карточка формы входа */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Заголовок формы */}
          <div className="p-8 pb-0">
            <h1 className="text-2xl font-semibold mb-1 text-slate-800">Добро пожаловать</h1>
            <p className="text-slate-500 mb-6">Введите данные для входа в систему</p>
          </div>
          
          {/* Форма входа */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 pt-4 space-y-5">
            {/* Email поле */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  } ${isSubmitting ? 'bg-slate-50 text-slate-400' : 'bg-white'}`}
                  placeholder="example@email.com"
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
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  {errors.email.message}
                </p>
              )}
            </div>
            
            {/* Password поле */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Lock className="h-4 w-4" />
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  } ${isSubmitting ? 'bg-slate-50 text-slate-400' : 'bg-white'}`}
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
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={togglePasswordVisibility}
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  {errors.password.message}
                </p>
              )}
            </div>
            
            {/* Запомнить меня и Забыли пароль */}
            <div className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="remember" 
                  className="h-4 w-4 rounded border-slate-300 text-[#273655] focus:ring-[#273655]"
                />
                <label htmlFor="remember" className="text-slate-600">Запомнить меня</label>
              </div>
              <button 
                type="button" 
                onClick={() => navigate('/restore-password')}
                className="text-[#273655] hover:underline"
                disabled={isSubmitting}
              >
                Забыли пароль?
              </button>
            </div>
            
            {/* Сообщение об ошибке */}
            {serverError && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-sm text-red-600">
                {serverError}
              </div>
            )}
            
            {/* Кнопка входа */}
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-[#273655] text-white rounded-lg font-medium shadow-lg shadow-[#273655]/20 hover:bg-[#324569] transition-all duration-200 disabled:opacity-70"
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
                <>
                  <span>Войти</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
            {/* Разделитель */}
            <div className="relative flex items-center justify-center mt-8 mb-4">
              <span className="absolute inset-x-0 h-px bg-slate-200"></span>
              <span className="relative bg-white px-4 text-sm text-slate-500">или продолжить с</span>
            </div>
            
            {/* Кнопка Google */}
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              disabled={isSubmitting}
              className="w-full py-3 px-4 flex items-center justify-center gap-3 bg-white border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            
            {/* Ссылка на регистрацию */}
            <div className="text-center mt-6">
              <p className="text-slate-600">
                Нет аккаунта?{" "}
                <button 
                  type="button" 
                  className="text-[#273655] font-medium hover:underline"
                  onClick={() => navigate('/register')}
                  disabled={isSubmitting}
                >
                  Зарегистрироваться
                </button>
              </p>
            </div>
          </form>
        </div>
        
        {/* Футер */}
        <div className="text-center mt-6 text-sm text-slate-500">
          &copy; 2025 ExtraSpace. Все права защищены.
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 