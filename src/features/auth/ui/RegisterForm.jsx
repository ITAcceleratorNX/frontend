import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { authApi } from '../../../shared/api/auth';
import { useSessionStore } from '../../../entities/session';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { toast } from 'react-toastify';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useSessionStore(state => state.login);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      unique_code: '',
      password: '',
      confirm_password: '',
    },
  });
  
  // Заполняем email, если он пришёл из проверки email
  useEffect(() => {
    if (location.state?.email) {
      console.log('RegisterForm: устанавливаем email из state:', location.state.email);
      setValue('email', location.state.email);
    } else {
      // Проверяем URL параметры
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        console.log('RegisterForm: устанавливаем email из URL:', emailParam);
        setValue('email', emailParam);
      }
    }
  }, [location, setValue]);
  
  const password = watch('password');
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    
    if (data.password !== data.confirm_password) {
      setServerError('Пароли не совпадают');
      toast.error('Пароли не совпадают');
      setIsLoading(false);
      return;
    }
    
    try {
      console.log('Отправка запроса на регистрацию:', data.email);
      const response = await authApi.register(data.email, data.unique_code, data.password);
      
      if (response.success && response.token) {
        // Сохраняем токен в хранилище сессии
        login(response.token);
        
        console.log('Успешная регистрация, перенаправляем на главную');
        toast.success('Регистрация прошла успешно!');
        navigate('/', { replace: true });
      } else {
        setServerError('Не удалось зарегистрироваться. Пожалуйста, проверьте введенные данные.');
        toast.error('Не удалось зарегистрироваться. Пожалуйста, проверьте введенные данные.');
      }
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      
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
        setServerError('Произошла ошибка при регистрации. Пожалуйста, попробуйте еще раз.');
        toast.error('Ошибка регистрации. Пожалуйста, попробуйте ещё раз.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const handleGoogleLogin = () => {
    console.log('Регистрация через Google');
    toast.info('Регистрация через Google не реализована ещё');
    // Здесь будет реализация входа через Google
  };
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f0f4ff] p-4">
      <div className="auth-card w-full max-w-[450px] bg-white rounded-xl shadow-lg p-10 mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">Создать аккаунт</h1>
        <p className="text-center text-gray-600 mb-8">Зарегистрируйтесь, чтобы начать</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-4"> 
            <div>
              <label className="block text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                className={`form-input ${errors.email ? 'border-red-500' : 'border-gray-200'} ${isLoading ? 'bg-amber-50' : 'bg-white'}`}
                placeholder="Введите свой email"
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
                <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">
                Confirm Email <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.unique_code ? 'border-red-500' : 'border-gray-200'} ${isLoading ? 'bg-amber-50' : 'bg-white'}`}
                placeholder="Подтвердите свой email"
                disabled={isLoading}
                {...register('unique_code', {
                  required: 'Подтверждение Email обязательно',
                })}
              />
              {errors.unique_code && (
                <p className="mt-1 text-sm text-red-500">{errors.unique_code.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-input pr-10 ${errors.password ? 'border-red-500' : 'border-gray-200'} ${isLoading ? 'bg-amber-50' : 'bg-white'}`}
                  placeholder="Создайте пароль"
                  disabled={isLoading}
                  {...register('password', {
                    required: 'Пароль обязателен',
                    minLength: {
                      value: 6,
                      message: 'Пароль должен содержать не менее 6 символов',
                    },
                  })}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-gray-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`form-input pr-10 ${errors.confirm_password ? 'border-red-500' : 'border-gray-200'} ${isLoading ? 'bg-amber-50' : 'bg-white'}`}
                  placeholder="Подтвердите пароль"
                  disabled={isLoading}
                  {...register('confirm_password', {
                    required: 'Подтверждение пароля обязательно',
                    validate: value => value === password || 'Пароли не совпадают',
                  })}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 px-2 flex items-center text-gray-500 hover:text-gray-700 focus:outline-none"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="mt-1 text-sm text-red-500">{errors.confirm_password.message}</p>
              )}
            </div>
            
            {serverError && (
              <div className="rounded-md bg-red-50 p-3 border border-red-200">
                <p className="text-sm text-red-600">{serverError}</p>
              </div>
            )}
          </div>
          
          <div className="flex justify-center mt-6">
            <button 
              type="submit" 
              disabled={isLoading}
              className={`btn-primary ${isLoading ? 'bg-blue-400' : ''} transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="loader-container">
                    <div className="loader-ring"></div>
                    <div className="loader-text">Регистрация...</div>
                  </div>
                </div>
              ) : (
                'Регистрация'
              )}
            </button>
          </div>
          
          <div className="divider">
            <span>Или продолжить с</span>
          </div>
          
          <div className="flex justify-center">
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="btn-google"
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-gray-600">
              Уже есть аккаунт?{" "}
              <button 
                type="button" 
                className="text-blue-600 hover:underline font-medium"
                onClick={() => navigate('/login')}
                disabled={isLoading}
              >
                Войти
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterForm; 