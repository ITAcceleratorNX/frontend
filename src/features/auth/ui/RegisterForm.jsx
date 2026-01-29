import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  toastAuthSuccess,
  toastValidationError,
  showErrorToast,
} from '../../../shared/lib/toast';
import { EyeIcon, EyeOffIcon, Phone, Lock, RefreshCw } from 'lucide-react';
import '../styles/auth-forms.css';
import { authApi } from '../../../shared/api/auth';
import { getStoredLeadSource } from '../../../shared/components/LeadSourceModal.jsx';
import { getOrCreateVisitorId } from '../../../shared/lib/utm';
import loginLogo from '../../../assets/login-logo-66f0b4.png';
import api from '../../../shared/api/axios';

export const RegisterForm = ({ userType = 'INDIVIDUAL', setUserType, showTypeSelector = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser, checkPhone } = useAuth();
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
      phone: '',
      unique_code: '',
      password: '',
      confirm_password: '',
      terms: false,
    },
  });
  
  const password = watch('password', '');

  // Функция форматирования номера телефона
  const formatPhoneNumber = (value) => {
    // Если значение пустое, возвращаем пустую строку
    if (!value || value.trim() === '') {
      return '';
    }
    
    // Удаляем все символы кроме цифр
    const numbers = value.replace(/\D/g, '');
    
    // Если нет цифр, возвращаем пустую строку
    if (numbers.length === 0) {
      return '';
    }
    
    // Если начинается с 8, заменяем на 7
    let cleaned = numbers;
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    }
    
    // Если не начинается с 7, добавляем 7
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    
    // Ограничиваем до 11 цифр (7 + 10 цифр)
    cleaned = cleaned.slice(0, 11);
    
    // Форматируем в формат +7 (XXX) XXX-XX-XX
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = '+7';
      if (cleaned.length > 1) {
        formatted += ' (' + cleaned.slice(1, 4);
      }
      if (cleaned.length > 4) {
        formatted += ') ' + cleaned.slice(4, 7);
      }
      if (cleaned.length > 7) {
        formatted += '-' + cleaned.slice(7, 9);
      }
      if (cleaned.length > 9) {
        formatted += '-' + cleaned.slice(9, 11);
      }
    }
    
    return formatted;
  };

  // Автоматическое заполнение phone из location.state
  useEffect(() => {
    if (location.state?.phone) {
      console.log('RegisterForm: Автоматическое заполнение phone из state:', location.state.phone);
      setValue('phone', location.state.phone);
      setCodeSent(true);
    } else {
      // Проверяем URL параметры как fallback
      const params = new URLSearchParams(location.search);
      const phoneParam = params.get('phone');
      if (phoneParam) {
        console.log('RegisterForm: Автоматическое заполнение phone из URL параметров:', phoneParam);
        setValue('phone', phoneParam);
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

  // Функция для отправки кода на телефон
  const sendCodeAgain = async () => {
    const phone = getValues('phone');
    
    if (!phone) {
      toastValidationError('Введите номер телефона для отправки кода');
      return;
    }

    // Простая валидация телефона (минимум 10 цифр после +7)
    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/;
    if (!phoneRegex.test(phone)) {
      toastValidationError('Введите корректный номер телефона');
      return;
    }

    setIsResendingCode(true);
    try {
      const result = await checkPhone(phone);
      
      if (result.success) {
        setCodeSent(true);
        if (result.remainingSeconds) {
          setTimer(result.remainingSeconds);
        } else {
          setTimer(60); // 60 секунд до повторной отправки
        }
        toastAuthSuccess('Код отправлен на ваш телефон');
      } else {
        if (result.remainingSeconds) {
          setTimer(result.remainingSeconds);
          showErrorToast(result.error || 'Подождите перед повторной отправкой');
        } else {
          showErrorToast(result.error || 'Ошибка при отправке кода');
        }
      }
    } catch (error) {
      console.error('Ошибка при отправке кода:', error);
      if (error.response?.status === 429) {
        const remainingSeconds = error.response?.data?.remainingSeconds || 60;
        setTimer(remainingSeconds);
          showErrorToast(error.response?.data?.error || 'Подождите перед повторной отправкой');
      } else {
          showErrorToast('Произошла ошибка при отправке кода');
      }
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
        toastValidationError('Пароли не совпадают');
        setIsLoading(false);
        return;
      }
      
      // Получаем сохраненный источник лида и visitor_id для связки с первым визитом
      const leadSource = getStoredLeadSource();
      const visitorId = getOrCreateVisitorId();
      
      const result = await registerUser(data.phone, data.unique_code, data.password, leadSource, visitorId);
      
      console.log('RegisterForm: Ответ от регистрации:', result);
      
      if (result.success) {
        // В случае успешной регистрации показываем уведомление
        toastAuthSuccess('Регистрация прошла успешно! Теперь вы можете войти в систему.');
        
        // Перенаправляем на страницу входа с передачей phone
        navigate('/login', { state: { phone: data.phone } });
      } else {
        // Отображаем ошибку, полученную от сервера
        const errorMessage = result.error || 'Ошибка при регистрации. Пожалуйста, попробуйте снова.';
        setServerError(errorMessage);
        showErrorToast(errorMessage);
      }
    } catch (error) {
      console.error('RegisterForm: Ошибка при регистрации:', error);
      
      // Обрабатываем ошибки ответа
      if (error.response) {
        if (error.response.status === 409) {
          const message = 'Пользователь с таким email уже существует';
          setServerError(message);
          showErrorToast(message);
          return;
        }
        
        if (error.response.data?.message) {
          if (typeof error.response.data.message === 'object') {
            // Если сообщение об ошибке - объект с несколькими ошибками
            const messages = Object.values(error.response.data.message).join(', ');
            setServerError(messages);
            showErrorToast(messages);
          } else {
            // Если сообщение об ошибке - строка
            setServerError(error.response.data.message);
            showErrorToast(error.response.data.message);
          }
        } else {
          // Если нет конкретного сообщения об ошибке
          setServerError('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
          showErrorToast('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
        }
      } else {
        // Общая ошибка
        setServerError('Ошибка соединения с сервером. Пожалуйста, проверьте интернет-соединение.');
        showErrorToast('Ошибка соединения с сервером. Пожалуйста, проверьте интернет-соединение.');
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

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('phone', formatted, { shouldValidate: true });
  };

  const handleGoogleRegister = async () => {
    try {
      console.log('Начинаем регистрацию через Google');
      
      // Перенаправляем пользователя на URL, который обрабатывает бэкенд
      window.location.href = `${api.defaults.baseURL}/auth/google`;
      
    } catch (error) {
      // Если сервер возвращает 302, axios может воспринять это как ошибку
      // Проверяем, есть ли в ответе URL для редиректа
      if (error.response && error.response.status === 302 && error.response.headers.location) {
        console.log('Получен редирект URL:', error.response.headers.location);
        window.location.href = error.response.headers.location;
      } else {
        console.error('Ошибка при регистрации через Google:', error);
        showErrorToast('Не удалось выполнить регистрацию через Google');
      }
    }
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
                  Введите код из SMS и заполните остальные поля
                </p>
              </div>
            </div>

            {/* Выбор типа регистрации */}
            {showTypeSelector && setUserType && (
              <div className="w-full flex justify-center">
                <div className="inline-flex bg-gray-100 rounded-full p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => setUserType('INDIVIDUAL')}
                    className={`px-4 py-1.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                      userType === 'INDIVIDUAL'
                        ? 'bg-white text-[#26B3AB] shadow-sm'
                        : 'text-[#5C5C5C] hover:text-[#363636]'
                    }`}
                  >
                    Физ. лицо
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('LEGAL')}
                    className={`px-4 py-1.5 rounded-full text-[13px] sm:text-[14px] font-medium transition-all duration-200 ${
                      userType === 'LEGAL'
                        ? 'bg-white text-[#26B3AB] shadow-sm'
                        : 'text-[#5C5C5C] hover:text-[#363636]'
                    }`}
                  >
                    Юр. лицо
                  </button>
                </div>
              </div>
            )}
            
            {/* Кнопка Google и разделитель */}
            <div className="flex flex-col gap-[22px] w-full max-w-[400px]">
              {/* Кнопка Google */}
              <button 
                type="button" 
                onClick={handleGoogleRegister}
                disabled={isLoading}
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
            
            {/* Форма регистрации */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[22px] w-full">
              {/* Поля ввода */}
              <div className="flex flex-col gap-[20px] w-full">
                {/* Phone поле */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Phone className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    Телефон
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] outline-none ${
                        errors.phone ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="+7 (___) ___-__-__"
                      disabled={isLoading}
                      {...register('phone', {
                        required: 'Телефон обязателен',
                        pattern: {
                          value: /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/,
                          message: 'Неверный формат телефона',
                        },
                        onChange: handlePhoneChange
                      })}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      {errors.phone.message}
                    </p>
                  )}
                </div>
            
                {/* Проверочный код */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Phone className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    Проверочный код
                  </label>
                  <div className="flex gap-[8px] w-full">
                    <input
                      type="text"
                      maxLength="6"
                      className={`flex-1 min-w-0 h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] outline-none focus:border-[#26B3AB] text-center tracking-widest ${
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
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] outline-none focus:border-[#26B3AB] ${
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
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 pr-12 sm:pr-14 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] outline-none focus:border-[#26B3AB] ${
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