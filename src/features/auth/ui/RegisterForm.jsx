import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { toast } from 'react-toastify';
import { EyeIcon, EyeOffIcon, Mail, Lock, ArrowRight, Shield, UserPlus, RefreshCw } from 'lucide-react';
import '../styles/auth-forms.css';
import { authApi } from '../../../shared/api/auth';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, checkEmail } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  // Состояния для функциональности повторной отправки кода
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isResendingCode, setIsResendingCode] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    getValues,
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
  
  const password = watch('password', '');

  // Автоматическое заполнение email из location.state
  useEffect(() => {
    if (location.state?.email) {
      console.log('RegisterForm: Автоматическое заполнение email из state:', location.state.email);
      setValue('email', location.state.email);
      // Если email уже пришел, то можно показать что код можно отправить повторно
      setCodeSent(true);
    } else {
      // Проверяем URL параметры как fallback
      const params = new URLSearchParams(location.search);
      const emailParam = params.get('email');
      if (emailParam) {
        console.log('RegisterForm: Автоматическое заполнение email из URL параметров:', emailParam);
        setValue('email', emailParam);
        setCodeSent(true);
      }
    }
  }, [location.state, location.search, setValue]);

  // Таймер для повторной отправки кода
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(timer => timer - 1);
      }, 1000);
    } else if (timer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Функция для отправки кода на email
  const sendCodeAgain = async () => {
    const email = getValues('email');
    
    if (!email) {
      toast.error('Введите email для отправки кода');
      return;
    }

    // Простая валидация email
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    if (!emailRegex.test(email)) {
      toast.error('Введите корректный email');
      return;
    }

    setIsResendingCode(true);
    try {
      const result = await checkEmail(email);
      
      if (result.success) {
        setCodeSent(true);
        setTimer(60); // 60 секунд до повторной отправки
        toast.success('Код отправлен на вашу почту');
      } else {
        toast.error(result.error || 'Ошибка при отправке кода');
      }
    } catch (error) {
      console.error('Ошибка при отправке кода:', error);
      toast.error('Произошла ошибка при отправке кода');
    } finally {
      setIsResendingCode(false);
    }
  };
  
  const onSubmit = async (data) => {
    setIsLoading(true);
    setServerError(null);
    
    try {
      console.log('RegisterForm: Отправка запроса на регистрацию:', data);
      
      // Проверяем, совпадают ли пароли
      if (data.password !== data.confirm_password) {
        setServerError('Пароли не совпадают');
        toast.error('Пароли не совпадают');
        setIsLoading(false);
        return;
      }
      
      // Отправляем данные регистрации через контекст
      const result = await registerUser(data.email, data.unique_code, data.password);
      
      console.log('RegisterForm: Ответ от регистрации:', result);
      
      if (result.success) {
        // В случае успешной регистрации показываем уведомление
        toast.success('Регистрация прошла успешно! Теперь вы можете войти в систему.');
        
        // Перенаправляем на страницу входа с передачей email
        navigate('/login', { state: { email: data.email } });
      } else {
        // Отображаем ошибку, полученную от сервера
        const errorMessage = result.error || 'Ошибка при регистрации. Пожалуйста, попробуйте снова.';
        setServerError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (error) {
      console.error('RegisterForm: Ошибка при регистрации:', error);
      
      // Обрабатываем ошибки ответа
      if (error.response) {
        if (error.response.status === 409) {
          const message = 'Пользователь с таким email уже существует';
          setServerError(message);
          toast.error(message);
          return;
        }
        
        if (error.response.data?.message) {
          if (typeof error.response.data.message === 'object') {
            // Если сообщение об ошибке - объект с несколькими ошибками
            const messages = Object.values(error.response.data.message).join(', ');
            setServerError(messages);
            toast.error(messages);
          } else {
            // Если сообщение об ошибке - строка
            setServerError(error.response.data.message);
            toast.error(error.response.data.message);
          }
        } else {
          // Если нет конкретного сообщения об ошибке
          setServerError('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
          toast.error('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
        }
      } else {
        // Общая ошибка
        setServerError('Ошибка соединения с сервером. Пожалуйста, проверьте интернет-соединение.');
        toast.error('Ошибка соединения с сервером. Пожалуйста, проверьте интернет-соединение.');
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 p-4">
      <div className="w-full max-w-[500px] mx-auto">
        {/* Блок с логотипом компании */}
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-[#273655]">ExtraSpace</h2>
          <div className="h-1 w-20 bg-[#273655] mx-auto mt-2 rounded-full"></div>
        </div>
        
        {/* Карточка формы регистрации */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Заголовок формы */}
          <div className="bg-[#273655] text-white p-6">
            <div className="flex items-center justify-center space-x-3 mb-2">
              <UserPlus size={26} />
              <h1 className="text-2xl font-semibold">Создание аккаунта</h1>
            </div>
            <p className="text-blue-100 text-center">Введите код из email и заполните остальные поля</p>
          </div>
          
          {/* Форма регистрации */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-5">
            {/* Email поле */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Mail className="h-4 w-4 text-[#273655]" />
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 ${
                    errors.email ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  } ${isLoading ? 'bg-slate-50 text-slate-400' : 'bg-white'}`}
                  placeholder="example@email.com"
                  disabled={isLoading}
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
            
            {/* Уникальный код */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Shield className="h-4 w-4 text-[#273655]" />
                Проверочный код
              </label>
              <div className="flex gap-2">
                <div className="flex-1">
                <input
                  type="text"
                  maxLength="6"
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 text-center text-lg tracking-widest ${
                    errors.unique_code ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  } ${isLoading ? 'bg-slate-50 text-slate-400' : 'bg-white'}`}
                  placeholder="123456"
                  disabled={isLoading}
                  onInput={(e) => {
                    // Разрешаем только цифры
                    e.target.value = e.target.value.replace(/[^0-9]/g, '');
                  }}
                  {...register('unique_code', {
                    required: 'Проверочный код обязателен',
                    pattern: {
                      value: /^\d{6}$/,
                      message: 'Код должен содержать ровно 6 цифр'
                    }
                  })}
                />
                </div>
                
                {/* Кнопка отправки/переотправки кода */}
                <button
                  type="button"
                  onClick={sendCodeAgain}
                  disabled={timer > 0 || isResendingCode || isLoading}
                  className="px-4 py-3 bg-[#273655] text-white rounded-lg font-medium hover:bg-[#324569] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 whitespace-nowrap"
                >
                  {isResendingCode ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {timer > 0 ? `${timer}с` : codeSent ? 'Отправить повторно' : 'Отправить код'}
                </button>
              </div>
              {errors.unique_code && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  {errors.unique_code.message}
                </p>
              )}
            </div>
            
            {/* Password поле */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Lock className="h-4 w-4 text-[#273655]" />
                Пароль
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 ${
                    errors.password ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  } ${isLoading ? 'bg-slate-50 text-slate-400' : 'bg-white'}`}
                  placeholder="Минимум 6 символов"
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
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
              
              {/* Индикатор силы пароля */}
              {password && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${
                          password.length < 6 ? 'bg-red-500 w-1/4' : 
                          password.length < 8 ? 'bg-orange-500 w-2/4' : 
                          password.length < 10 ? 'bg-yellow-500 w-3/4' : 
                          'bg-green-500 w-full'
                        }`}
                      ></div>
                    </div>
                    <span className="text-xs text-slate-500">
                      {password.length < 6 ? 'Слабый' : 
                       password.length < 8 ? 'Средний' : 
                       password.length < 10 ? 'Хороший' : 
                       'Отличный'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Confirm Password поле */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2 text-slate-700">
                <Lock className="h-4 w-4 text-[#273655]" />
                Подтверждение пароля
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full px-4 py-3 border rounded-lg transition-all duration-200 outline-none focus:ring-2 focus:ring-[#273655]/20 ${
                    errors.confirm_password ? 'border-red-400 bg-red-50' : 'border-slate-200'
                  } ${isLoading ? 'bg-slate-50 text-slate-400' : 'bg-white'}`}
                  placeholder="Повторите пароль"
                  disabled={isLoading}
                  {...register('confirm_password', {
                    required: 'Подтверждение пароля обязательно',
                    validate: value => value === password || 'Пароли не совпадают',
                  })}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  onClick={toggleConfirmPasswordVisibility}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
              {errors.confirm_password && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-500"></span>
                  {errors.confirm_password.message}
                </p>
              )}
            </div>
            
            {/* Согласие с условиями */}
            <div className="flex items-start gap-2 mt-4">
              <input 
                type="checkbox" 
                id="terms" 
                className="h-4 w-4 mt-1 rounded border-slate-300 text-[#273655] focus:ring-[#273655]" 
              />
              <label htmlFor="terms" className="text-sm text-slate-600">
                Я согласен с <a href="#" className="text-[#273655] hover:underline">Условиями обслуживания</a> и 
                <a href="#" className="text-[#273655] hover:underline"> Политикой конфиденциальности</a>
              </label>
            </div>
            
            {/* Сообщение об ошибке */}
            {serverError && (
              <div className="rounded-lg bg-red-50 p-3 border border-red-200 text-sm text-red-600">
                {serverError}
              </div>
            )}
            
            {/* Кнопка регистрации */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 px-4 flex items-center justify-center gap-2 bg-[#273655] text-white rounded-lg font-medium shadow-lg shadow-[#273655]/20 hover:bg-[#324569] transition-all duration-200 disabled:opacity-70"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Создание аккаунта...</span>
                </div>
              ) : (
                <>
                  <span>Создать аккаунт</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
            
            {/* Ссылка на страницу входа */}
            <div className="text-center mt-6">
              <p className="text-slate-600">
                Уже есть аккаунт?{" "}
                <button 
                  type="button" 
                  className="text-[#273655] font-medium hover:underline" 
                  onClick={() => navigate('/login')} 
                  disabled={isLoading}
                >
                  Войти
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

export default RegisterForm; 