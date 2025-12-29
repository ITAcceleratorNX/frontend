import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { toast } from 'react-toastify';
import { EyeIcon, EyeOffIcon, Mail, Lock, RefreshCw } from 'lucide-react';
import '../styles/auth-forms.css';
import { authApi } from '../../../shared/api/auth';
import { getStoredLeadSource } from '../../../shared/components/LeadSourceModal.jsx';
import loginLogo from '../../../assets/login-logo-66f0b4.png';

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
      terms: false,
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
      
      // Получаем сохраненный источник лида
      const leadSource = getStoredLeadSource();
      
      // Отправляем данные регистрации через контекст
      const result = await registerUser(data.email, data.unique_code, data.password, leadSource);
      
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
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-[520px] mx-auto">
        {/* Карточка формы регистрации */}
        <div className="bg-white rounded-[25px] border border-[#DFDFDF] shadow-[0px_4px_8.8px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="flex flex-col items-center gap-[20px] sm:gap-[24px] lg:gap-[28px] p-4 sm:p-5 lg:p-6">
            {/* Верхняя часть с логотипом и заголовком */}
            <div className="flex flex-col items-center gap-[16px] w-full">
              {/* Логотип */}
              <div className="w-[44px] h-[50px] sm:w-[48px] sm:h-[54px] flex-shrink-0">
                <img 
                  src={loginLogo} 
                  alt="Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              
              {/* Заголовок и подзаголовок */}
              <div className="flex flex-col items-center gap-[6px] w-full">
                <h1 className="text-[20px] sm:text-[22px] lg:text-[24px] font-medium leading-[1.19] tracking-[-0.05em] text-center text-[#363636] max-w-fit mx-auto">
                  Создание аккаунта
                </h1>
                <p className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-center text-[#5C5C5C] w-full max-w-[3600px]">
                  Введите код из email и заполните остальные поля
                </p>
              </div>
            </div>
            
            {/* Форма регистрации */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[22px] w-full">
              {/* Поля ввода */}
              <div className="flex flex-col gap-[20px] w-full">
                {/* Email поле */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Mail className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.email ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="example@gmail.com"
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
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>
            
                {/* Проверочный код */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Mail className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    Проверочный код
                  </label>
                  <div className="flex gap-[8px] w-full">
                    <input
                      type="text"
                      maxLength="6"
                      className={`flex-1 min-w-0 h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] text-center tracking-widest ${
                        errors.unique_code ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
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
                    
                    {/* Кнопка отправки/переотправки кода */}
                    <button
                      type="button"
                      onClick={sendCodeAgain}
                      disabled={timer > 0 || isResendingCode || isLoading}
                      className="h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 bg-gradient-to-br from-[#26B3AB] to-[#104D4A] text-[#F5F5F5] rounded-[25px] text-[12px] sm:text-[13px] font-medium leading-[1.19] hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 flex-shrink-0"
                    >
                      {isResendingCode ? (
                        <RefreshCw className="w-[14px] h-[14px] animate-spin flex-shrink-0" />
                      ) : (
                        <RefreshCw className="w-[14px] h-[14px] flex-shrink-0" />
                      )}
                      <span className="hidden sm:inline">{timer > 0 ? `${timer}с` : codeSent ? 'Повторно' : 'Отправить'}</span>
                      <span className="sm:hidden">{timer > 0 ? `${timer}с` : 'Код'}</span>
                    </button>
                  </div>
                  {errors.unique_code && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      {errors.unique_code.message}
                    </p>
                  )}
                </div>
            
                {/* Password поле */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Lock className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    Пароль
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.password ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
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
                    <div className="absolute right-4 sm:right-5 top-0 bottom-0 flex items-center pointer-events-none">
                      <button 
                        type="button"
                        className="flex items-center justify-center text-[#BEBEBE] hover:text-[#5C5C5C] transition-colors disabled:opacity-50 cursor-pointer pointer-events-auto"
                        onClick={togglePasswordVisibility}
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOffIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" /> : <EyeIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />}
                      </button>
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>
            
                {/* Confirm Password поле */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Lock className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    Подтверждение пароля
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.confirm_password ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="Повторите пароль"
                      disabled={isLoading}
                      {...register('confirm_password', {
                        required: 'Подтверждение пароля обязательно',
                        validate: value => value === password || 'Пароли не совпадают',
                      })}
                    />
                    <div className="absolute right-4 sm:right-5 top-0 bottom-0 flex items-center pointer-events-none">
                      <button 
                        type="button"
                        className="flex items-center justify-center text-[#BEBEBE] hover:text-[#5C5C5C] transition-colors disabled:opacity-50 cursor-pointer pointer-events-auto"
                        onClick={toggleConfirmPasswordVisibility}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOffIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" /> : <EyeIcon className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px]" />}
                      </button>
                    </div>
                  </div>
                  {errors.confirm_password && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      {errors.confirm_password.message}
                    </p>
                  )}
                </div>
                
                {/* Согласие с условиями */}
                <div className="flex flex-col gap-[6px] w-full">
                  <div className="flex items-center gap-[10px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19]">
                    <input 
                      type="checkbox" 
                      id="terms" 
                      className={`w-[16px] h-[16px] rounded-[3px] border ${
                        errors.terms ? 'border-red-400' : 'border-[#5C5C5C]'
                      } bg-white text-[#26B3AB] focus:ring-2 focus:ring-[#26B3AB]/20 cursor-pointer flex-shrink-0`}
                      {...register('terms', {
                        required: 'Необходимо согласиться с условиями обслуживания и политикой конфиденциальности',
                      })}
                    />
                    <label htmlFor="terms" className="text-[#363636] cursor-pointer">
                      Я согласен с <a href="/public-offer" target="_blank" rel="noopener noreferrer" className="text-[#363636] hover:underline">Условиями обслуживания</a> и <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-[#363636] hover:underline">Политикой конфиденциальности</a>
                    </label>
                  </div>
                  {errors.terms && (
                    <p className="text-xs sm:text-sm text-red-500">
                      {errors.terms.message}
                    </p>
                  )}
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
              
              {/* Кнопка регистрации и ссылка на вход */}
              <div className="flex flex-col items-center gap-[14px] w-full">
                {/* Кнопка регистрации */}
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-br from-[#26B3AB] to-[#104D4A] rounded-[25px] text-[14px] sm:text-[15px] lg:text-[16px] font-medium leading-[1.4] text-[#F5F5F5] hover:opacity-90 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Создание аккаунта...</span>
                    </div>
                  ) : (
                    <span>Создать аккаунт</span>
                  )}
                </button>
                
                {/* Ссылка на страницу входа */}
                <p className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-center text-[#363636]">
                  Уже есть аккаунт?{" "}
                  <button 
                    type="button" 
                    className="text-[#363636] hover:underline disabled:opacity-50 disabled:cursor-not-allowed" 
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
      </div>
    </div>
  );
};

export default RegisterForm; 