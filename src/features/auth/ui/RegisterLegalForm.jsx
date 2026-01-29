import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../shared/context/AuthContext';
import { showSuccessToast, showErrorToast, toastValidationError } from '../../../shared/lib/toast';
import { Mail, Phone, Building2, MapPin, ChevronDown, RefreshCw, User } from 'lucide-react';
import '../styles/auth-forms.css';
import { authApi } from '../../../shared/api/auth';
import { getStoredLeadSource } from '../../../shared/components/LeadSourceModal.jsx';
import { getOrCreateVisitorId } from '../../../shared/lib/utm';
import loginLogo from '../../../assets/login-logo-66f0b4.png';

// Список регионов Казахстана
const regions = [
  'Акмолинская область',
  'Актюбинская область',
  'Алматинская область',
  'Атырауская область',
  'Восточно-Казахстанская область',
  'Жамбылская область',
  'Западно-Казахстанская область',
  'Карагандинская область',
  'Костанайская область',
  'Кызылординская область',
  'Мангистауская область',
  'Павлодарская область',
  'Северо-Казахстанская область',
  'Туркестанская область',
  'Алматы',
  'Астана',
  'Шымкент'
];

// Список городов (можно расширить)
const cities = [
  'Алматы',
  'Астана',
  'Шымкент',
  'Караганда',
  'Актобе',
  'Тараз',
  'Павлодар',
  'Усть-Каменогорск',
  'Семей',
  'Атырау',
  'Костанай',
  'Кызылорда',
  'Уральск',
  'Петропавловск',
  'Актау',
  'Темиртау',
  'Туркестан',
  'Кокшетау',
  'Талдыкорган',
  'Экибастуз'
];

export const RegisterLegalForm = ({ userType = 'LEGAL', setUserType, showTypeSelector = true }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { registerLegal: registerLegalUser, checkPhone } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState(null);
  
  // Состояния для функциональности повторной отправки кода
  const [codeSent, setCodeSent] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isResendingCode, setIsResendingCode] = useState(false);
  
  // Состояния для зависимых списков
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  
  const {
    register,
    handleSubmit,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      bin_iin: '',
      company_name: '',
      bik: '',
      iik: '',
      region: '',
      city: '',
      street: '',
      house: '',
      building: '',
      office: '',
      postal_code: '',
      phone: '',
      email: '',
      unique_code: '',
      password: '',
      confirm_password: '',
      amount: '',
      terms: false,
    },
  });

  // Функция форматирования номера телефона
  const formatPhoneNumber = (value) => {
    if (!value || value.trim() === '') {
      return '';
    }
    
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) {
      return '';
    }
    
    let cleaned = numbers;
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    }
    
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    
    cleaned = cleaned.slice(0, 11);
    
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

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('phone', formatted, { shouldValidate: true });
  };

  // Автоматическое заполнение phone из location.state
  useEffect(() => {
    if (location.state?.phone) {
      console.log('RegisterLegalForm: Автоматическое заполнение phone из state:', location.state.phone);
      setValue('phone', location.state.phone);
      setCodeSent(true);
    } else {
      const params = new URLSearchParams(location.search);
      const phoneParam = params.get('phone');
      if (phoneParam) {
        console.log('RegisterLegalForm: Автоматическое заполнение phone из URL параметров:', phoneParam);
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

  // Функция для отправки кода на телефон (SMS)
  const sendCodeAgain = async () => {
    const phone = getValues('phone');
    
    if (!phone) {
      showErrorToast('Введите номер телефона для отправки кода');
      return;
    }

    const phoneRegex = /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/;
    if (!phoneRegex.test(phone)) {
      showErrorToast('Введите корректный номер телефона');
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
          setTimer(60);
        }
        showSuccessToast('Код отправлен на ваш телефон');
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
      console.log('RegisterLegalForm: Отправка запроса на регистрацию юридического лица:', data);
      
      // Проверяем, совпадают ли пароли
      if (data.password !== data.confirm_password) {
        setServerError('Пароли не совпадают');
        showErrorToast('Пароли не совпадают');
        setIsLoading(false);
        return;
      }
      
      const leadSource = getStoredLeadSource();
      const visitorId = getOrCreateVisitorId();
      
      const legalEntityData = {
        name: data.name,
        bin_iin: data.bin_iin,
        company_name: data.company_name,
        bik: data.bik,
        iik: data.iik,
        legal_address: {
          region: data.region,
          city: data.city,
          street: data.street,
          house: data.house,
          building: data.building || '',
          office: data.office || '',
          postal_code: data.postal_code,
        },
        email: data.email || null,
      };
      
      const result = await registerLegalUser(
        data.phone,
        data.unique_code,
        data.password,
        legalEntityData,
        leadSource,
        visitorId
      );
      
      console.log('RegisterLegalForm: Ответ от регистрации:', result);
      
      if (result.success) {
        showSuccessToast('Регистрация прошла успешно! Теперь вы можете войти в систему.');
        navigate('/login', { state: { phone: data.phone } });
      } else {
        const errorMessage = result.error || 'Ошибка при регистрации. Пожалуйста, попробуйте снова.';
        setServerError(errorMessage);
        showErrorToast(errorMessage);
      }
    } catch (error) {
      console.error('RegisterLegalForm: Ошибка при регистрации:', error);
      
      if (error.response) {
        if (error.response.status === 409) {
          const message = 'Пользователь с таким номером телефона уже существует';
          setServerError(message);
          showErrorToast(message);
          return;
        }
        
        if (error.response.data?.message) {
          if (typeof error.response.data.message === 'object') {
            const messages = Object.values(error.response.data.message).join(', ');
            setServerError(messages);
            showErrorToast(messages);
          } else {
            setServerError(error.response.data.message);
            showErrorToast(error.response.data.message);
          }
        } else {
          setServerError('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
          showErrorToast('Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.');
        }
      } else {
        setServerError('Ошибка соединения с сервером. Пожалуйста, проверьте интернет-соединение.');
        showErrorToast('Ошибка соединения с сервером. Пожалуйста, проверьте интернет-соединение.');
      }
    } finally {
      setIsLoading(false);
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
                  Заполните данные для регистрации юридического лица
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
            
            {/* Форма регистрации */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[22px] w-full">
              {/* Поля ввода */}
              <div className="flex flex-col gap-[20px] w-full">
                {/* БИН/ИИН */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Building2 className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    БИН/ИИН
                  </label>
                  <input
                    type="text"
                    className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                      errors.bin_iin ? 'border-red-400 bg-red-50' : 'bg-white'
                    } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                    placeholder="Введите БИН/ИИН"
                    disabled={isLoading}
                    {...register('bin_iin', {
                      required: 'БИН/ИИН обязателен',
                      pattern: {
                        value: /^\d{12}$/,
                        message: 'БИН/ИИН должен содержать 12 цифр'
                      }
                    })}
                  />
                  {errors.bin_iin && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      {errors.bin_iin.message}
                    </p>
                  )}
                </div>

                {/* ФИО */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <User className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    ФИО
                  </label>
                  <input
                    type="text"
                    className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                      errors.name ? 'border-red-400 bg-red-50' : 'bg-white'
                    } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                    placeholder="Введите ФИО"
                    disabled={isLoading}
                    {...register('name', {
                      required: 'ФИО обязательно',
                      minLength: {
                        value: 2,
                        message: 'ФИО должно содержать минимум 2 символа'
                      }
                    })}
                  />
                  {errors.name && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Наименование */}
                <div className="flex flex-col gap-[6px] w-full">
                  <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                    <Building2 className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                    Наименование
                  </label>
                  <input
                    type="text"
                    className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                      errors.company_name ? 'border-red-400 bg-red-50' : 'bg-white'
                    } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                    placeholder="Введите наименование организации"
                    disabled={isLoading}
                    {...register('company_name', {
                      required: 'Наименование обязательно'
                    })}
                  />
                  {errors.company_name && (
                    <p className="text-xs sm:text-sm text-red-500 mt-1">
                      {errors.company_name.message}
                    </p>
                  )}
                </div>

                {/* БИК и ИИК в одной строке */}
                <div className="flex gap-[8px] w-full">
                  {/* БИК */}
                  <div className="flex flex-col gap-[6px] flex-1">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      БИК
                    </label>
                    <input
                      type="text"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.bik ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="БИК"
                      disabled={isLoading}
                      {...register('bik', {
                        required: 'БИК обязателен'
                      })}
                    />
                    {errors.bik && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.bik.message}
                      </p>
                    )}
                  </div>

                  {/* ИИК */}
                  <div className="flex flex-col gap-[6px] flex-1">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      ИИК
                    </label>
                    <input
                      type="text"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.iik ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="ИИК"
                      disabled={isLoading}
                      {...register('iik', {
                        required: 'ИИК обязателен'
                      })}
                    />
                    {errors.iik && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.iik.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Раздел: Юридический адрес */}
                <div className="flex flex-col gap-[16px] w-full mt-2">
                  <h2 className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold leading-[1.19] text-[#363636]">
                    Юридический адрес
                  </h2>

                  {/* Регион */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      <MapPin className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                      Выберите регион
                    </label>
                    <div className="relative">
                      <select
                        className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] bg-white appearance-none cursor-pointer transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                          errors.region ? 'border-red-400 bg-red-50' : ''
                        } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                        {...register('region', {
                          required: 'Регион обязателен'
                        })}
                        onChange={(e) => {
                          setSelectedRegion(e.target.value);
                          setValue('region', e.target.value);
                        }}
                      >
                        <option value="">Выберите регион</option>
                        {regions.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 w-[16px] h-[16px] text-[#5C5C5C] pointer-events-none" />
                    </div>
                    {errors.region && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.region.message}
                      </p>
                    )}
                  </div>

                  {/* Город */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      <MapPin className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                      Выберите город
                    </label>
                    <div className="relative">
                      <select
                        className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] bg-white appearance-none cursor-pointer transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                          errors.city ? 'border-red-400 bg-red-50' : ''
                        } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        disabled={isLoading}
                        {...register('city', {
                          required: 'Город обязателен'
                        })}
                        onChange={(e) => {
                          setSelectedCity(e.target.value);
                          setValue('city', e.target.value);
                        }}
                      >
                        <option value="">Выберите город</option>
                        {cities.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 sm:right-5 top-1/2 transform -translate-y-1/2 w-[16px] h-[16px] text-[#5C5C5C] pointer-events-none" />
                    </div>
                    {errors.city && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  {/* Улица */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      Улица
                    </label>
                    <input
                      type="text"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.street ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="Введите улицу"
                      disabled={isLoading}
                      {...register('street', {
                        required: 'Улица обязательна'
                      })}
                    />
                    {errors.street && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  {/* Дом, Корпус, Офис, Индекс в одной строке */}
                  <div className="grid grid-cols-2 gap-[8px] w-full">
                    {/* Дом */}
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                        Дом
                      </label>
                      <input
                        type="text"
                        className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                          errors.house ? 'border-red-400 bg-red-50' : 'bg-white'
                        } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder="Дом"
                        disabled={isLoading}
                        {...register('house', {
                          required: 'Дом обязателен'
                        })}
                      />
                      {errors.house && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">
                          {errors.house.message}
                        </p>
                      )}
                    </div>

                    {/* Корпус */}
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                        Корпус
                      </label>
                      <input
                        type="text"
                        className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] bg-white ${
                          isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''
                        }`}
                        placeholder="Корпус"
                        disabled={isLoading}
                        {...register('building')}
                      />
                    </div>

                    {/* Офис */}
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                        Офис
                      </label>
                      <input
                        type="text"
                        className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] bg-white ${
                          isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''
                        }`}
                        placeholder="Офис"
                        disabled={isLoading}
                        {...register('office')}
                      />
                    </div>

                    {/* Индекс */}
                    <div className="flex flex-col gap-[6px]">
                      <label className="text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                        Индекс
                      </label>
                      <input
                        type="text"
                        className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                          errors.postal_code ? 'border-red-400 bg-red-50' : 'bg-white'
                        } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder="Индекс"
                        disabled={isLoading}
                        {...register('postal_code', {
                          required: 'Индекс обязателен',
                          pattern: {
                            value: /^\d{6}$/,
                            message: 'Индекс должен содержать 6 цифр'
                          }
                        })}
                      />
                      {errors.postal_code && (
                        <p className="text-xs sm:text-sm text-red-500 mt-1">
                          {errors.postal_code.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Раздел: Контактная информация */}
                <div className="flex flex-col gap-[16px] w-full mt-2">
                  <h2 className="text-[14px] sm:text-[15px] lg:text-[16px] font-bold leading-[1.19] text-[#363636]">
                    Контактная информация
                  </h2>

                  {/* Телефон с кнопкой отправки кода */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      <Phone className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                      Телефон
                    </label>
                    <div className="flex gap-[8px] w-full">
                      <input
                        type="tel"
                        className={`flex-1 min-w-0 h-[48px] sm:h-[52px] lg:h-[56px] px-3 sm:px-4 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                          errors.phone ? 'border-red-400 bg-red-50' : 'bg-white'
                        } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                        placeholder="+7 (___) ___-__-__"
                        disabled={isLoading}
                        {...register('phone', {
                          required: 'Телефон обязателен',
                          pattern: {
                            value: /^\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}$/,
                            message: 'Введите корректный номер телефона'
                          },
                          onChange: handlePhoneChange
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
                      Проверочный код из SMS
                    </label>
                    <input
                      type="text"
                      maxLength="6"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] text-center tracking-widest ${
                        errors.unique_code ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="123456"
                      disabled={isLoading}
                      onInput={(e) => {
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
                    {errors.unique_code && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.unique_code.message}
                      </p>
                    )}
                  </div>

                  {/* Email (необязательный - для закрывающих документов) */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      <Mail className="w-[16px] h-[16px] sm:w-[18px] sm:h-[18px] text-[#5C5C5C] flex-shrink-0" />
                      Email (необязательно)
                    </label>
                    <input
                      type="email"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.email ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="example@gmail.com"
                      disabled={isLoading}
                      {...register('email', {
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Неверный формат email',
                        },
                      })}
                    />
                    {errors.email && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.email.message}
                      </p>
                    )}
                    <p className="text-[11px] sm:text-[12px] text-[#5C5C5C] mt-1">
                      закрывающие документы придут в письме на почту
                    </p>
                  </div>

                  {/* Пароль */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      Пароль
                    </label>
                    <input
                      type="password"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
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
                    {errors.password && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Подтверждение пароля */}
                  <div className="flex flex-col gap-[6px] w-full">
                    <label className="flex items-center gap-[6px] text-[12px] sm:text-[13px] lg:text-[14px] font-normal leading-[1.19] text-[#5C5C5C]">
                      Подтверждение пароля
                    </label>
                    <input
                      type="password"
                      className={`w-full h-[48px] sm:h-[52px] lg:h-[56px] px-4 sm:px-5 border border-[#DFDFDF] rounded-[25px] text-[13px] sm:text-[14px] font-medium leading-[1.19] text-[#363636] placeholder:text-[#BEBEBE] transition-all duration-200 outline-none focus:border-[#26B3AB] ${
                        errors.confirm_password ? 'border-red-400 bg-red-50' : 'bg-white'
                      } ${isLoading ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : ''}`}
                      placeholder="Повторите пароль"
                      disabled={isLoading}
                      {...register('confirm_password', {
                        required: 'Подтверждение пароля обязательно',
                        validate: value => value === watch('password') || 'Пароли не совпадают',
                      })}
                    />
                    {errors.confirm_password && (
                      <p className="text-xs sm:text-sm text-red-500 mt-1">
                        {errors.confirm_password.message}
                      </p>
                    )}
                  </div>

                  
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
                        required: 'Необходимо согласиться с условиями оферты',
                      })}
                    />
                    <label htmlFor="terms" className="text-[#363636] cursor-pointer">
                      Согласен с <a href="/public-offer" target="_blank" rel="noopener noreferrer" className="text-[#26B3AB] hover:underline">подписанием оферты</a>
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
                    <span>Зарегистрироваться</span>
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

              {/* Ссылка на помощь */}
              <div className="flex justify-center w-full pt-2">
                <p className="text-[12px] sm:text-[13px] text-center text-[#5C5C5C]">
                  Остались вопросы?{" "}
                  <a href="/chat" className="text-[#26B3AB] hover:underline">
                    Напишите нам
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterLegalForm;

