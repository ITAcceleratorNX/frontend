import React, { useEffect, useState, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import Input from '../../../shared/ui/Input';
import Button from '../../../shared/ui/Button';
import api from '../../../shared/api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../../shared/lib/hooks/use-user-query';
import ChangePasswordModal from './ChangePasswordModal';
import { Lock, Building2, CheckCircle2, MapPin, ChevronDown } from 'lucide-react';
import { usersApi } from '../../../shared/api/usersApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';

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

// Список городов
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

// Мемоизированный компонент личных данных для юридических лиц
const PersonalDataLegal = memo(() => {
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { user, isAuthenticated, isLoading, refetchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Функция форматирования номера телефона
  const formatPhoneNumber = (value) => {
    if (!value) return '';
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    
    let cleaned = numbers;
    if (cleaned.startsWith('8')) {
      cleaned = '7' + cleaned.slice(1);
    }
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    cleaned = cleaned.slice(0, 11);
    
    // Форматируем в формат +7 (XXX) XXX-XX-XX
    let formatted = '+7';
    if (cleaned.length > 1) {
      formatted += ' (' + cleaned.slice(1, 4);
    }
    if (cleaned.length >= 4) {
      formatted += ')';
    }
    if (cleaned.length > 4) {
      formatted += ' ' + cleaned.slice(4, 7);
    }
    if (cleaned.length > 7) {
      formatted += '-' + cleaned.slice(7, 9);
    }
    if (cleaned.length > 9) {
      formatted += '-' + cleaned.slice(9, 11);
    }
    
    return formatted;
  };

  // Функция для преобразования телефона в формат для отображения
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    let cleaned = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers;
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    return formatPhoneNumber(cleaned);
  };

  // Используем мемоизацию для defaultValues с форматированным телефоном
  const defaultValues = useMemo(() => ({
    bin_iin: user?.bin_iin || '',
    company_name: user?.company_name || '',
    bik: user?.bik || '',
    iik: user?.iik || '',
    region: user?.legal_address?.region || '',
    city: user?.legal_address?.city || '',
    street: user?.legal_address?.street || '',
    house: user?.legal_address?.house || '',
    building: user?.legal_address?.building || '',
    office: user?.legal_address?.office || '',
    postal_code: user?.legal_address?.postal_code || '',
    phone: formatPhoneForDisplay(user?.phone || ''),
    email: user?.email || '',
  }), [user]);

  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors, isSubmitting }, setError, clearErrors } = useForm({
    defaultValues
  });

  // Получаем текущие значения формы для валидации
  const formValues = watch();

  // Заполняем форму данными пользователя
  useEffect(() => {
    if (user) {
      reset({
        bin_iin: user.bin_iin || '',
        company_name: user.company_name || '',
        bik: user.bik || '',
        iik: user.iik || '',
        region: user.legal_address?.region || '',
        city: user.legal_address?.city || '',
        street: user.legal_address?.street || '',
        house: user.legal_address?.house || '',
        building: user.legal_address?.building || '',
        office: user.legal_address?.office || '',
        postal_code: user.legal_address?.postal_code || '',
        phone: formatPhoneForDisplay(user.phone || ''),
        email: user.email || '',
      });
    }
  }, [user, reset]);

  // Перенаправляем на страницу логина, если пользователь не авторизован
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Показываем сообщение валидации, если пользователь пришёл с проверки профиля
  useEffect(() => {
    if (location.state?.message) {
      toast.warning(location.state.message, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setIsEditing(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  // Функция для преобразования отформатированного телефона в формат для отправки на сервер
  const normalizePhoneForSubmit = (phone) => {
    if (!phone) return '';
    const numbers = phone.replace(/\D/g, '');
    let cleaned = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers;
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    return cleaned.startsWith('7') ? '+7' + cleaned.slice(1) : cleaned;
  };

  // Мемоизируем функцию обработки обновления данных пользователя
  const onSubmit = async (formData) => {
    // Нормализуем телефон перед отправкой
    const normalizedData = {
      bin_iin: formData.bin_iin,
      company_name: formData.company_name,
      bik: formData.bik,
      iik: formData.iik,
      phone: normalizePhoneForSubmit(formData.phone),
      email: formData.email,
      legal_address: {
        region: formData.region,
        city: formData.city,
        street: formData.street,
        house: formData.house,
        building: formData.building || '',
        office: formData.office || '',
        postal_code: formData.postal_code,
      }
    };

    // Проверяем, изменились ли данные
    const hasChanges = Object.keys(normalizedData).some(key => {
      if (key === 'legal_address') {
        return Object.keys(normalizedData.legal_address).some(addrKey => {
          const currentValue = normalizedData.legal_address[addrKey];
          const defaultValue = addrKey === 'phone' 
            ? normalizePhoneForSubmit(defaultValues[addrKey]) 
            : (defaultValues[addrKey] || user?.legal_address?.[addrKey] || '');
          return currentValue !== defaultValue;
        });
      }
      const currentValue = normalizedData[key];
      const defaultValue = key === 'phone' 
        ? normalizePhoneForSubmit(defaultValues[key]) 
        : (defaultValues[key] || '');
      return currentValue !== defaultValue;
    });

    if (!hasChanges) {
      toast.info('Данные не изменились');
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/users/me', normalizedData);

      if (response.status === 200) {
        // Инвалидируем кеш пользователя
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });

        // Обновляем локальные данные пользователя через кеш
        queryClient.setQueryData([USER_QUERY_KEY], {
          ...user,
          ...normalizedData
        });

        // Сбрасываем форму с новыми данными
        reset(formData);

        toast.success('Данные успешно обновлены');
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных пользователя:', error);

      if (error.response && error.response.status === 401) {
        toast.error('Сессия истекла. Пожалуйста, войдите снова.');
        navigate('/login');
      } else if (error.response && error.response.status === 400) {
        toast.error('Ошибка валидации данных. Проверьте введенные данные.');
      } else {
        toast.error('Не удалось обновить данные профиля');
      }
    } finally {
      setSaving(false);
    }
  };

  // Мемоизируем функцию переключения режима редактирования
  const toggleEdit = () => {
    setIsEditing(!isEditing);
    if (isEditing) {
      // При отмене сбрасываем на текущие данные пользователя с форматированным телефоном
      reset({
        bin_iin: user?.bin_iin || '',
        company_name: user?.company_name || '',
        bik: user?.bik || '',
        iik: user?.iik || '',
        region: user?.legal_address?.region || '',
        city: user?.legal_address?.city || '',
        street: user?.legal_address?.street || '',
        house: user?.legal_address?.house || '',
        building: user?.legal_address?.building || '',
        office: user?.legal_address?.office || '',
        postal_code: user?.legal_address?.postal_code || '',
        phone: formatPhoneForDisplay(user?.phone || ''),
        email: user?.email || '',
      });
    }
    clearErrors();
  };

  // Обработчик изменения телефона
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setValue('phone', formatted, { shouldValidate: true });
  };

  // Отправка SMS кода для верификации телефона
  const handleSendVerificationCode = async () => {
    const phoneFormatted = formValues.phone || user?.phone;
    if (!phoneFormatted) {
      toast.error('Пожалуйста, укажите номер телефона');
      return;
    }

    const phone = normalizePhoneForSubmit(phoneFormatted);

    try {
      setSendingCode(true);
      await usersApi.sendPhoneVerificationCode(phone);
      toast.success('Код подтверждения отправлен на ваш телефон');
      setIsPhoneVerificationModalOpen(true);
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || 'Не удалось отправить код подтверждения';
      
      if (error.response?.status === 429 && errorData?.code === 'RATE_LIMIT_EXCEEDED') {
        const remainingSeconds = errorData?.remainingSeconds || 60;
        toast.error(
          <div>
            <div><strong>Слишком много запросов</strong></div>
            <div style={{ marginTop: 5 }}>
              Пожалуйста, подождите {remainingSeconds} секунд перед повторной отправкой кода
            </div>
          </div>,
          {
            autoClose: 5000,
          }
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setSendingCode(false);
    }
  };

  // Верификация телефона по коду
  const handleVerifyPhone = async () => {
    const phone = formValues.phone || user?.phone;
    if (!phone) {
      toast.error('Пожалуйста, укажите номер телефона');
      return;
    }

    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Введите 6-значный код подтверждения');
      return;
    }

    try {
      setVerifying(true);
      const response = await usersApi.verifyPhone(verificationCode, phone);
      
      queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });
      queryClient.setQueryData([USER_QUERY_KEY], {
        ...user,
        phone_verified: true
      });

      toast.success('Телефон успешно верифицирован');
      setIsPhoneVerificationModalOpen(false);
      setVerificationCode('');
      refetchUser();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Неверный код подтверждения';
      toast.error(errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  // Отображение состояния загрузки
  if (isLoading) {
    return <div className="w-full text-center py-10">Загрузка данных...</div>;
  }

  // Если нет пользователя и загрузка завершена, показываем сообщение об ошибке
  if (!user && !isLoading) {
    return <div className="w-full text-center py-10">Не удалось загрузить данные пользователя</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Добро пожаловать в Extra Space!
            </h1>
            <p className="text-lg text-gray-600">
              Привет, {user?.company_name || 'Организация'}. Добро пожаловать.
            </p>
          </div>
          <button
            onClick={() => navigate('/personal-account', { state: { activeSection: 'personal' } })}
            className="px-6 py-2 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-[#D4FFFD] rounded-full shadow-md hover:shadow-lg transition-shadow font-sf-pro-text"
          >
            Личный кабинет
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-6 py-6">
        <div className="max-w-5xl mx-auto">
          {/* Заголовок секции */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Профиль юридического лица</h2>
            <p className="text-[#A2A2A2] mb-2">
              Просмотрите и обновите данные вашей организации
            </p>
            <p className="text-[#A2A2A2]">
              Пожалуйста, убедитесь, что эти данные актуальны, так как они будут использоваться для вашего бронирования боксов.
            </p>
          </div>

          {/* Блок с информацией организации */}
          <div className="bg-gray-100 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {user?.company_name || 'Организация'}
                </h3>
                <p className="text-sm text-[#A2A2A2]">
                  Пожалуйста, убедитесь, что эти данные актуальны, так как они будут использоваться для вашего бронирования боксов.
                </p>
              </div>
            </div>
          </div>

          {/* Форма личных данных */}
          <form className="w-full mb-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Основные поля организации */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Левая колонка */}
              <div className="space-y-4">
                <Input
                  label="БИН/ИИН"
                  placeholder="Введите БИН/ИИН"
                  disabled={!isEditing}
                  {...register('bin_iin', {
                    required: 'БИН/ИИН обязателен для заполнения',
                    pattern: {
                      value: /^\d{12}$/,
                      message: 'БИН/ИИН должен содержать 12 цифр'
                    }
                  })}
                  error={errors.bin_iin?.message}
                  className="bg-white rounded-lg"
                  labelClassName="font-sf-pro-text text-[#000000]"
                />
                <Input
                  label="Наименование организации"
                  placeholder="Введите наименование организации"
                  disabled={!isEditing}
                  {...register('company_name', {
                    required: 'Наименование обязательно для заполнения'
                  })}
                  error={errors.company_name?.message}
                  className="bg-white rounded-lg"
                  labelClassName="font-sf-pro-text text-[#000000]"
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="БИК"
                    placeholder="БИК"
                    disabled={!isEditing}
                    {...register('bik', {
                      required: 'БИК обязателен для заполнения'
                    })}
                    error={errors.bik?.message}
                    className="bg-white rounded-lg"
                    labelClassName="font-sf-pro-text text-[#000000]"
                  />
                  <Input
                    label="ИИК"
                    placeholder="ИИК"
                    disabled={!isEditing}
                    {...register('iik', {
                      required: 'ИИК обязателен для заполнения'
                    })}
                    error={errors.iik?.message}
                    className="bg-white rounded-lg"
                    labelClassName="font-sf-pro-text text-[#000000]"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      label="Телефон"
                      placeholder="+7 (XXX) XXX-XX-XX"
                      type="tel"
                      disabled={!isEditing}
                      {...register('phone', {
                        required: 'Телефон обязателен для заполнения',
                        pattern: {
                          value: /^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/,
                          message: 'Номер телефона должен быть в формате +7 (XXX) XXX-XX-XX'
                        },
                        onChange: handlePhoneChange
                      })}
                      error={errors.phone?.message}
                      className="bg-white rounded-lg flex-1"
                      labelClassName="font-sf-pro-text text-[#000000]"
                    />
                    {!isEditing && user?.phone && (
                      <div className="flex items-center gap-2 mt-6">
                        {user?.phone_verified ? (
                          <div className="flex items-center gap-1 text-green-600 text-sm">
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Верифицирован</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendVerificationCode}
                            disabled={sendingCode}
                            className="text-sm px-3 py-1.5 rounded-md border border-[#00A991] bg-white text-[#00A991] hover:bg-[#00A991] hover:text-white transition-colors duration-200 font-medium disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#00A991] focus:ring-offset-2"
                          >
                            {sendingCode ? 'Отправка...' : 'Верифицировать'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Правая колонка */}
              <div className="space-y-4">
                <Input
                  label="Электронная почта"
                  placeholder="email@example.com"
                  disabled={!isEditing}
                  {...register('email', {
                    required: 'Email обязателен для заполнения',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Некорректный email адрес'
                    }
                  })}
                  error={errors.email?.message}
                  className="bg-white rounded-lg"
                  labelClassName="font-sf-pro-text text-[#000000]"
                />
              </div>
            </div>

            {/* Юридический адрес */}
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Юридический адрес</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium font-sf-pro-text text-[#000000] mb-2">
                    Регион <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full rounded-md border px-4 py-2.5 text-sm shadow-sm transition-colors duration-200 font-sf-pro-text text-[#737373] ${
                      errors.region ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    } bg-white appearance-none cursor-pointer ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={!isEditing}
                    {...register('region', {
                      required: 'Регион обязателен для заполнения'
                    })}
                  >
                    <option value="">Выберите регион</option>
                    {regions.map((region) => (
                      <option key={region} value={region}>
                        {region}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-9 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  {errors.region && (
                    <p className="mt-1.5 text-sm font-medium text-red-500">{errors.region.message}</p>
                  )}
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium font-sf-pro-text text-[#000000] mb-2">
                    Город <span className="text-red-500">*</span>
                  </label>
                  <select
                    className={`w-full rounded-md border px-4 py-2.5 text-sm shadow-sm transition-colors duration-200 font-sf-pro-text text-[#737373] ${
                      errors.city ? 'border-red-500' : 'border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                    } bg-white appearance-none cursor-pointer ${!isEditing ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    disabled={!isEditing}
                    {...register('city', {
                      required: 'Город обязателен для заполнения'
                    })}
                  >
                    <option value="">Выберите город</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-9 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  {errors.city && (
                    <p className="mt-1.5 text-sm font-medium text-red-500">{errors.city.message}</p>
                  )}
                </div>

                <Input
                  label="Улица"
                  placeholder="Введите улицу"
                  disabled={!isEditing}
                  {...register('street', {
                    required: 'Улица обязательна для заполнения'
                  })}
                  error={errors.street?.message}
                  className="bg-white rounded-lg"
                  labelClassName="font-sf-pro-text text-[#000000]"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Дом"
                    placeholder="Дом"
                    disabled={!isEditing}
                    {...register('house', {
                      required: 'Дом обязателен для заполнения'
                    })}
                    error={errors.house?.message}
                    className="bg-white rounded-lg"
                    labelClassName="font-sf-pro-text text-[#000000]"
                  />
                  <Input
                    label="Корпус"
                    placeholder="Корпус"
                    disabled={!isEditing}
                    {...register('building')}
                    error={errors.building?.message}
                    className="bg-white rounded-lg"
                    labelClassName="font-sf-pro-text text-[#000000]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Офис"
                    placeholder="Офис"
                    disabled={!isEditing}
                    {...register('office')}
                    error={errors.office?.message}
                    className="bg-white rounded-lg"
                    labelClassName="font-sf-pro-text text-[#000000]"
                  />
                  <Input
                    label="Индекс"
                    placeholder="Индекс"
                    disabled={!isEditing}
                    {...register('postal_code', {
                      required: 'Индекс обязателен для заполнения',
                      pattern: {
                        value: /^\d{6}$/,
                        message: 'Индекс должен содержать 6 цифр'
                      }
                    })}
                    error={errors.postal_code?.message}
                    className="bg-white rounded-lg"
                    labelClassName="font-sf-pro-text text-[#000000]"
                  />
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            {isEditing ? (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={toggleEdit}
                  className="w-full sm:w-[120px] bg-[#C3C3C3] text-white hover:bg-[#A3A3A3] border-none rounded-md"
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  onClick={handleSubmit(onSubmit)}
                  disabled={saving || isSubmitting}
                  className="w-full sm:w-[120px] bg-[#1e2c4f] text-white hover:bg-[#1d2742] border-none rounded-md"
                >
                  {(saving || isSubmitting) ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Button
                  variant="secondary"
                  onClick={toggleEdit}
                  className="bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-[#D4FFFD] hover:from-[#2AC3BB] hover:to-[#115D5A] border-none rounded-md"
                >
                  Изменить
                </Button>
                {user?.auth_method !== 'oauth' && (
                  <Button
                    variant="outline"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="border-gray-300 !text-[#00A991] bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-medium"
                  >
                    <Lock className="w-4 h-4 mr-2 text-[#00A991]" />
                    Изменить пароль
                  </Button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Модалка изменения пароля */}
      {user?.auth_method !== 'oauth' && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          userEmail={user?.email}
        />
      )}

      {/* Модалка верификации телефона */}
      <Dialog open={isPhoneVerificationModalOpen} onOpenChange={setIsPhoneVerificationModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Верификация телефона</DialogTitle>
            <DialogDescription>
              Введите 6-значный код подтверждения, отправленный на номер {formatPhoneForDisplay(formValues.phone || user?.phone)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              label="Код подтверждения"
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationCode(value);
              }}
              maxLength={6}
              className="bg-white rounded-lg text-center text-2xl tracking-widest"
              labelClassName="font-sf-pro-text text-[#000000]"
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsPhoneVerificationModalOpen(false);
                setVerificationCode('');
              }}
              disabled={verifying}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleVerifyPhone}
              disabled={verifying || verificationCode.length !== 6}
              className="bg-[#1e2c4f] text-white hover:bg-[#1d2742]"
            >
              {verifying ? 'Проверка...' : 'Подтвердить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

PersonalDataLegal.displayName = 'PersonalDataLegal';

export default PersonalDataLegal;


