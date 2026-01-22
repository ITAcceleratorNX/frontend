import React, { useEffect, useState, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import Input from '../../../shared/ui/Input';
import DatePicker from '../../../shared/ui/DatePicker';
import api from '../../../shared/api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../../shared/lib/hooks/use-user-query';
import ChangePasswordModal from './ChangePasswordModal';
import { Lock, User, CheckCircle2, LogOut } from 'lucide-react';
import IinTooltip from '../../../shared/ui/IinTooltip';
import { usersApi } from '../../../shared/api/usersApi';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '../../../components/ui/dialog';


// Мемоизированный компонент личных данных с дополнительной оптимизацией
const PersonalData = memo(({ embeddedMobile = false }) => {
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isPhoneVerificationModalOpen, setIsPhoneVerificationModalOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const { user, isAuthenticated, isLoading, refetchUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Функция форматирования номера телефона
  const formatPhoneNumber = (value) => {
    // Удаляем все символы кроме цифр
    const numbers = value.replace(/\D/g, '');
    
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
      if (cleaned.length > 4 && cleaned.length <= 7) {
        formatted += ')';
      }
    }
    
    return formatted;
  };

  // Функция для преобразования телефона в формат для отображения
  const formatPhoneForDisplay = (phone) => {
    if (!phone) return '';
    // Удаляем все символы кроме цифр
    const numbers = phone.replace(/\D/g, '');
    // Если номер начинается с 8, заменяем на 7
    let cleaned = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers;
    // Если не начинается с 7, добавляем 7
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    // Форматируем
    return formatPhoneNumber(cleaned);
  };

  // Функция для парсинга адреса из строки в отдельные компоненты
  const parseAddress = (addressStr) => {
    if (!addressStr) return { street: '', house: '', floor: '', apartment: '' };
    
    // Пытаемся распарсить адрес формата "г. Алматы, ул. Примерная, д. 123, эт. 5, кв. 456"
    const parts = addressStr.split(',').map(p => p.trim());
    let street = '';
    let house = '';
    let floor = '';
    let apartment = '';
    
    for (const part of parts) {
      if (part.startsWith('д.') || part.match(/^д\.?\s*/)) {
        house = part.replace(/^д\.?\s*/, '').trim();
      } else if (part.startsWith('эт.') || part.match(/^эт\.?\s*/)) {
        floor = part.replace(/^эт\.?\s*/, '').trim();
      } else if (part.startsWith('кв.') || part.match(/^кв\.?\s*/)) {
        apartment = part.replace(/^кв\.?\s*/, '').trim();
      } else if (!part.startsWith('г.') && !part.startsWith('г ')) {
        // Улица - это все, что не город, дом, этаж или квартира
        street = part.replace(/^ул\.?\s*/, '').trim();
      }
    }
    
    // Если парсинг не удался, пытаемся использовать весь адрес как улицу
    if (!street && !house && !floor && !apartment) {
      // Убираем "г. Алматы," если есть
      street = addressStr.replace(/^г\.?\s*Алматы,?\s*/i, '').trim();
    }
    
    return { street, house, floor, apartment };
  };

  // Функция для объединения адреса из компонентов в строку
  const combineAddress = (street, house, floor, apartment) => {
    const parts = [];
    if (street.trim()) parts.push(street.trim());
    if (house.trim()) parts.push(`д. ${house.trim()}`);
    if (floor.trim()) parts.push(`эт. ${floor.trim()}`);
    if (apartment.trim()) parts.push(`кв. ${apartment.trim()}`);
    return parts.length > 0 ? parts.join(', ') : '';
  };

  // Используем мемоизацию для defaultValues, чтобы предотвратить повторное создание объекта
  const defaultValues = useMemo(() => {
    const parsedAddress = parseAddress(user?.address || '');
    return {
      name: user?.name || '',
      email: user?.email || '',
      phone: formatPhoneForDisplay(user?.phone || ''),
      iin: user?.iin || '',
      addressStreet: parsedAddress.street,
      addressHouse: parsedAddress.house,
      addressFloor: parsedAddress.floor,
      addressApartment: parsedAddress.apartment,
      bday: user?.bday || ''
    };
  }, [user]);

  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors, isSubmitting }, setError, clearErrors } = useForm({
    defaultValues
  });

  // Получаем текущие значения формы для валидации
  const formValues = watch();

  // Заполняем форму данными пользователя, когда они доступны, используя зависимость от объекта user
  useEffect(() => {
    if (user) {
      const parsedAddress = parseAddress(user.address || '');
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: formatPhoneForDisplay(user.phone || ''),
        iin: user.iin || '',
        addressStreet: parsedAddress.street,
        addressHouse: parsedAddress.house,
        addressFloor: parsedAddress.floor,
        addressApartment: parsedAddress.apartment,
        bday: user.bday || ''
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

      // Автоматически включаем режим редактирования
      setIsEditing(true);

      // Очищаем state, чтобы сообщение не показывалось повторно
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);



  // Функция для преобразования отформатированного телефона в формат для отправки на сервер
  const normalizePhoneForSubmit = (phone) => {
    if (!phone) return '';
    // Удаляем все символы кроме цифр
    const numbers = phone.replace(/\D/g, '');
    // Если начинается с 8, заменяем на 7
    let cleaned = numbers.startsWith('8') ? '7' + numbers.slice(1) : numbers;
    // Если не начинается с 7, добавляем 7
    if (cleaned && !cleaned.startsWith('7')) {
      cleaned = '7' + cleaned;
    }
    // Возвращаем в формате +7XXXXXXXXXX
    return cleaned.startsWith('7') ? '+7' + cleaned.slice(1) : cleaned;
  };

  // Мемоизируем функцию обработки обновления данных пользователя
  const onSubmit = async (formData) => {
    // Объединяем адрес из отдельных полей
    const combinedAddress = combineAddress(
      formData.addressStreet || '',
      formData.addressHouse || '',
      formData.addressFloor || '',
      formData.addressApartment || ''
    );

    // Нормализуем телефон перед отправкой
    const normalizedData = {
      name: formData.name,
      email: formData.email,
      phone: normalizePhoneForSubmit(formData.phone),
      iin: formData.iin,
      address: combinedAddress,
      bday: formData.bday
    };

    // Проверяем, изменились ли данные, чтобы избежать ненужных запросов
    const currentAddress = combineAddress(
      formData.addressStreet || '',
      formData.addressHouse || '',
      formData.addressFloor || '',
      formData.addressApartment || ''
    );
    const defaultAddress = combineAddress(
      defaultValues.addressStreet || '',
      defaultValues.addressHouse || '',
      defaultValues.addressFloor || '',
      defaultValues.addressApartment || ''
    );
    
    const hasChanges = 
      normalizedData.name !== defaultValues.name ||
      normalizedData.email !== defaultValues.email ||
      normalizedData.phone !== normalizePhoneForSubmit(defaultValues.phone) ||
      normalizedData.iin !== defaultValues.iin ||
      currentAddress !== defaultAddress ||
      normalizedData.bday !== defaultValues.bday;

    if (!hasChanges) {
      toast.info('Данные не изменились');
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/users/me', normalizedData);

      if (response.status === 200) {
        // Инвалидируем кеш пользователя, чтобы запросить свежие данные
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });

        // Обновляем локальные данные пользователя через кеш
        queryClient.setQueryData([USER_QUERY_KEY], {
          ...user,
          ...normalizedData
        });

        // Сбрасываем форму с новыми данными
        const parsedAddress = parseAddress(combinedAddress);
        reset({
          ...formData,
          addressStreet: parsedAddress.street,
          addressHouse: parsedAddress.house,
          addressApartment: parsedAddress.apartment
        });

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
      // При отмене сбрасываем значения на исходные
      reset(defaultValues);
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

    // Нормализуем телефон перед отправкой (убираем форматирование)
    const phone = normalizePhoneForSubmit(phoneFormatted);

    try {
      setSendingCode(true);
      await usersApi.sendPhoneVerificationCode(phone);
      toast.success('Код подтверждения отправлен на ваш телефон');
      setIsPhoneVerificationModalOpen(true);
    } catch (error) {
      const errorData = error.response?.data;
      const errorMessage = errorData?.error || 'Не удалось отправить код подтверждения';
      
      // Обработка ограничения частоты запросов
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
      
      // Обновляем данные пользователя
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
    return (
      <div className={`w-full text-center ${embeddedMobile ? 'py-6 text-sm' : 'py-10'}`}>
        Загрузка данных...
      </div>
    );
  }

  // Если нет пользователя и загрузка завершена, показываем сообщение об ошибке
  if (!user && !isLoading) {
    return (
      <div className={`w-full text-center ${embeddedMobile ? 'py-6 text-sm' : 'py-10'}`}>
        Не удалось загрузить данные пользователя
      </div>
    );
  }

  const desc1 = 'Просмотрите и обновите данные вашей учетной записи.';
  const desc2 = 'Пожалуйста, убедитесь, что эти данные актуальны, так как они будут использоваться для вашего бронирования боксов.';
  const description = `${desc1} ${desc2}`;

  const profileBlock = (
    <>
      {/* Заголовок секции */}
      <div className={embeddedMobile ? 'mb-3 min-[360px]:mb-4' : 'mb-6'}>
        <h2 className={embeddedMobile ? 'text-base min-[360px]:text-2xl sm:text-3xl font-semibold text-[#363636] mb-1 break-words' : 'text-2xl font-bold text-gray-900 mb-2'}>
          Профиль
        </h2>
        {embeddedMobile ? (
          <p className="text-xs min-[360px]:text-xs text-[#A2A2A2] break-words leading-snug">{description}</p>
        ) : (
          <>
            <p className="text-[#A2A2A2] mb-2">{desc1}</p>
            <p className="text-[#A2A2A2]">{desc2}</p>
          </>
        )}
      </div>

      {/* Блок с информацией пользователя */}
      <div className={`bg-white rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] ${embeddedMobile ? 'p-3 min-[360px]:p-4 mb-3 min-[360px]:mb-4' : 'bg-gray-100 rounded-2xl p-6 mb-6'}`}>
        <div className="flex items-start gap-3 min-[360px]:gap-4">
          <div className={`rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 ${embeddedMobile ? 'w-10 h-10 min-[360px]:w-12 min-[360px]:h-12' : 'w-12 h-12'}`}>
            <User className={`text-gray-600 ${embeddedMobile ? 'w-5 h-5 min-[360px]:w-6 min-[360px]:h-6' : 'w-6 h-6'}`} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-[#363636] break-words ${embeddedMobile ? 'text-sm min-[360px]:text-base' : 'text-lg mb-2'}`}>
              {user?.name || 'Пользователь'}
            </h3>
            <p className={`text-[#999] break-words ${embeddedMobile ? 'text-xs min-[360px]:text-xs leading-snug' : 'text-sm'}`}>
              {desc2}
            </p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className={embeddedMobile ? 'min-w-0' : 'min-h-screen bg-gray-50'}>
      {!embeddedMobile && (
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Добро пожаловать в Extra Space!</h1>
              <p className="text-lg text-gray-600">Привет, {user?.name || 'Пользователь'}. Добро пожаловать.</p>
            </div>
            <button
              onClick={() => navigate('/personal-account', { state: { activeSection: 'personal' } })}
              className="px-6 py-2 bg-gradient-to-r from-[#26B3AB] to-[#104D4A] text-[#D4FFFD] rounded-full shadow-md hover:shadow-lg transition-shadow font-sf-pro-text"
            >
              Личный кабинет
            </button>
          </div>
        </div>
      )}

      <div className={embeddedMobile ? '' : 'px-6 py-6'}>
        <div className={embeddedMobile ? '' : 'max-w-5xl mx-auto'}>
          {profileBlock}

          {/* Форма личных данных */}
          <form className={`w-full ${embeddedMobile ? 'mb-4' : 'mb-8'}`} onSubmit={handleSubmit(onSubmit)}>
            {/* Стили по макету Figma (86-3512) для мобилки: лейблы #363636 semibold, инпуты без границы, rounded-[25px], тень */}
            <div className={`grid gap-3 min-[360px]:gap-4 mb-4 min-[360px]:mb-6 ${embeddedMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
              {/* Левая колонка */}
              <div className="space-y-4">
                <Input
                  label="Ваше имя"
                  placeholder="Иван Иванов"
                  disabled={!isEditing}
                  {...register('name', { required: 'Имя обязательно для заполнения' })}
                  error={errors.name?.message}
                  className={embeddedMobile ? 'bg-white border-0 rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] px-4 py-3 min-[360px]:py-3.5 focus:border-0 focus:ring-2 focus:ring-[#00A991] focus:ring-offset-0' : 'bg-white rounded-lg'}
                  labelClassName={embeddedMobile ? 'font-sf-pro-text text-[#363636] font-semibold' : 'font-sf-pro-text text-[#000000]'}
                />
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
                      className={embeddedMobile ? 'bg-white border-0 rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] px-4 py-3 min-[360px]:py-3.5 focus:border-0 focus:ring-2 focus:ring-[#00A991] focus:ring-offset-0 flex-1' : 'bg-white rounded-lg flex-1'}
                      labelClassName={embeddedMobile ? 'font-sf-pro-text text-[#363636] font-semibold' : 'font-sf-pro-text text-[#000000]'}
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
                <div className="space-y-2">
                  <label className={`block text-sm font-medium font-sf-pro-text ${embeddedMobile ? 'text-[#363636] font-semibold' : 'text-[#000000]'}`}>
                    Адрес
                  </label>
                  <Input
                    label="Микрорайон или улица"
                    placeholder="Микрорайон или улица"
                    disabled={!isEditing}
                    {...register('addressStreet', { required: 'Улица обязательна для заполнения' })}
                    error={errors.addressStreet?.message}
                    className={embeddedMobile ? 'bg-white border-0 rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] px-4 py-3 min-[360px]:py-3.5 focus:border-0 focus:ring-2 focus:ring-[#00A991] focus:ring-offset-0' : 'bg-white rounded-lg'}
                    labelClassName={embeddedMobile ? 'font-sf-pro-text text-[#363636] font-semibold' : 'font-sf-pro-text text-[#000000]'}
                  />
                  <div className="flex gap-2">
                    <Input
                      label="Дом"
                      placeholder="Дом"
                      disabled={!isEditing}
                      {...register('addressHouse', { required: 'Дом обязателен для заполнения' })}
                      error={errors.addressHouse?.message}
                      className={embeddedMobile ? 'bg-white border-0 rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] px-4 py-3 min-[360px]:py-3.5 focus:border-0 focus:ring-2 focus:ring-[#00A991] focus:ring-offset-0 flex-1' : 'bg-white rounded-lg flex-1'}
                      labelClassName={embeddedMobile ? 'font-sf-pro-text text-[#363636] font-semibold' : 'font-sf-pro-text text-[#000000]'}
                    />
                      <Input
                          label="Этаж"
                          placeholder="Этаж"
                          disabled={!isEditing}
                          {...register('addressFloor')}
                          error={errors.addressFloor?.message}
                          className="bg-white rounded-lg flex-1"
                          labelClassName="font-sf-pro-text text-[#000000]"
                      />
                    <Input
                      label="Квартира"
                      placeholder="Квартира"
                      disabled={!isEditing}
                      {...register('addressApartment')}
                      error={errors.addressApartment?.message}
                      className={embeddedMobile ? 'bg-white border-0 rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] px-4 py-3 min-[360px]:py-3.5 focus:border-0 focus:ring-2 focus:ring-[#00A991] focus:ring-offset-0 flex-1' : 'bg-white rounded-lg flex-1'}
                      labelClassName={embeddedMobile ? 'font-sf-pro-text text-[#363636] font-semibold' : 'font-sf-pro-text text-[#000000]'}
                    />
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
                  className={embeddedMobile ? 'bg-white border-0 rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] px-4 py-3 min-[360px]:py-3.5 focus:border-0 focus:ring-2 focus:ring-[#00A991] focus:ring-offset-0' : 'bg-white rounded-lg'}
                  labelClassName={embeddedMobile ? 'font-sf-pro-text text-[#363636] font-semibold' : 'font-sf-pro-text text-[#000000]'}
                />
                <Input
                  id="iin"
                  label={
                    <span className={`flex items-center gap-2 font-sf-pro-text ${embeddedMobile ? 'text-[#363636] font-semibold' : 'text-[#000000]'}`}>
                      ИИН
                      <IinTooltip />
                    </span>
                  }
                  placeholder="XXXXXXXXXXXX"
                  disabled={!isEditing}
                  {...register('iin', {
                    required: 'ИИН обязателен для заполнения',
                    pattern: {
                      value: /^[0-9]{12}$/,
                      message: 'ИИН должен содержать 12 цифр'
                    }
                  })}
                  error={errors.iin?.message}
                  className={embeddedMobile ? 'bg-white border-0 rounded-[25px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] px-4 py-3 min-[360px]:py-3.5 focus:border-0 focus:ring-2 focus:ring-[#00A991] focus:ring-offset-0' : 'bg-white rounded-lg'}
                />
                <div className="w-full space-y-2">
                  <label className={`block text-sm font-medium font-sf-pro-text ${embeddedMobile ? 'text-[#363636] font-semibold' : 'text-[#000000]'}`}>
                    Дата рождения
                  </label>
                  <Controller
                    name="bday"
                    control={control}
                    rules={{
                      required: 'Дата рождения обязательна для заполнения',
                      validate: (value) => {
                        if (!value || (typeof value === 'string' && !value.trim())) {
                          return 'Дата рождения обязательна для заполнения';
                        }

                        const birthDate = new Date(value);
                        const today = new Date();

                        if (isNaN(birthDate.getTime()) || birthDate > today) {
                          return 'Некорректная дата рождения';
                        }

                        const age = today.getFullYear() - birthDate.getFullYear();
                        const monthDiff = today.getMonth() - birthDate.getMonth();
                        const dayDiff = today.getDate() - birthDate.getDate();

                        if (age < 18 || (age === 18 && (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)))) {
                          return 'Возраст должен быть не менее 18 лет';
                        }

                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <DatePicker
                        placeholder=""
                        disabled={!isEditing}
                        value={field.value || ''}
                        onChange={(value) => {
                          field.onChange(value);
                        }}
                        onBlur={field.onBlur}
                        error={errors.bday?.message}
                        captionLayout="dropdown"
                        className={embeddedMobile
                          ? 'w-full [&>div]:border-0 [&>div]:rounded-[25px] [&>div]:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.08)] [&>div]:bg-white [&>div]:min-h-[42px] [&>div]:p-0 [&>div]:px-4 [&>div]:py-2.5'
                          : 'w-full [&>div]:rounded-lg [&>div]:bg-white [&>div]:border-gray-300 [&>div]:min-h-[42px] [&>div]:p-0 [&>div]:px-4 [&>div]:py-2.5 [&>div]:min-h-[42px]'}
                      />
                    )}
                  />
                  {/* Подсказка под полем даты рождения */}
                  {isEditing && !errors.bday && (
                    <p className="text-xs text-gray-500 mt-1 ml-1">
                      Возраст должен быть не менее 18 лет
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            {isEditing ? (
              <div className={`flex flex-col gap-3 min-[360px]:gap-4 ${embeddedMobile ? 'mb-4' : ''}`}>
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="w-full px-5 py-2.5 rounded-[25px] bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium text-sm min-[360px]:text-base transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving || isSubmitting}
                  className="w-full px-5 py-2.5 rounded-[25px] bg-[#00A991] text-white hover:bg-[#00A991]/90 font-medium text-sm min-[360px]:text-base transition-colors disabled:opacity-60"
                >
                  {(saving || isSubmitting) ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            ) : (
              <div className={`flex flex-col gap-3 min-[360px]:gap-4 ${embeddedMobile ? 'mb-4' : ''}`}>
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="w-full px-5 py-2.5 rounded-[25px] bg-[#00A991] text-white hover:bg-[#00A991]/90 font-medium text-sm min-[360px]:text-base transition-colors"
                >
                  Изменить
                </button>
                {user?.auth_method !== 'oauth' && (
                  <button
                    type="button"
                    onClick={() => setIsChangePasswordModalOpen(true)}
                    className="w-full px-5 py-2.5 rounded-[25px] border-2 border-[#00A991] text-[#00A991] bg-white hover:bg-[#00A991]/5 font-medium text-sm min-[360px]:text-base transition-colors"
                  >
                    <Lock className="w-4 h-4 mr-2 inline-block align-middle" />
                    Изменить пароль
                  </button>
                )}
              </div>
            )}
          </form>

          {/* Кнопка Выйти */}
          <div className={embeddedMobile ? 'mt-4 pt-4 border-t border-gray-200' : 'mt-6 pt-6 border-t border-gray-200'}>
            <button
              type="button"
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-[25px] border-2 border-red-500 text-red-600 bg-white hover:bg-red-50 font-medium text-sm min-[360px]:text-base transition-colors"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Выйти
            </button>
          </div>
        </div>
      </div>

      {/* Модалка изменения пароля - только для пользователей с паролем */}
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
          <DialogFooter className="gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => {
                setIsPhoneVerificationModalOpen(false);
                setVerificationCode('');
              }}
              disabled={verifying}
              className="px-5 py-2.5 rounded-[25px] bg-gray-200 text-gray-700 hover:bg-gray-300 font-medium transition-colors disabled:opacity-60"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleVerifyPhone}
              disabled={verifying || verificationCode.length !== 6}
              className="px-5 py-2.5 rounded-[25px] bg-[#00A991] text-white hover:bg-[#00A991]/90 font-medium transition-colors disabled:opacity-60"
            >
              {verifying ? 'Проверка...' : 'Подтвердить'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

  );
});

PersonalData.displayName = 'PersonalData';

export default PersonalData; 