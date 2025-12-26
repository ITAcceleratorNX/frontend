import React, { useEffect, useState, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../../../shared/context/AuthContext';
import Input from '../../../shared/ui/Input';
import Button from '../../../shared/ui/Button';
import DatePicker from '../../../shared/ui/DatePicker';
import api from '../../../shared/api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../../shared/lib/hooks/use-user-query';
import ChangePasswordModal from './ChangePasswordModal';
import { Lock, User } from 'lucide-react';
import IinTooltip from '../../../shared/ui/IinTooltip';


// Мемоизированный компонент личных данных с дополнительной оптимизацией
const PersonalData = memo(() => {
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const { user, isAuthenticated, isLoading, refetchUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  // Используем мемоизацию для defaultValues, чтобы предотвратить повторное создание объекта
  const defaultValues = useMemo(() => ({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    iin: user?.iin || '',
    address: user?.address || '',
    bday: user?.bday || ''
  }), [user]);

  const { register, handleSubmit, setValue, watch, reset, control, formState: { errors, isSubmitting }, setError, clearErrors } = useForm({
    defaultValues
  });

  // Получаем текущие значения формы для валидации
  const formValues = watch();

  // Заполняем форму данными пользователя, когда они доступны, используя зависимость от объекта user
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        iin: user.iin || '',
        address: user.address || '',
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



  // Мемоизируем функцию обработки обновления данных пользователя
  const onSubmit = async (formData) => {
    // Проверяем, изменились ли данные, чтобы избежать ненужных запросов
    const hasChanges = Object.keys(formData).some(key => formData[key] !== defaultValues[key]);

    if (!hasChanges) {
      toast.info('Данные не изменились');
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      const response = await api.put('/users/me', formData);

      if (response.status === 200) {
        // Инвалидируем кеш пользователя, чтобы запросить свежие данные
        queryClient.invalidateQueries({ queryKey: [USER_QUERY_KEY] });

        // Обновляем локальные данные пользователя через кеш
        queryClient.setQueryData([USER_QUERY_KEY], {
          ...user,
          ...formData
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
      // При отмене сбрасываем значения на исходные
      reset(defaultValues);
    }
    clearErrors();
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
              Привет, {user?.name || 'Пользователь'}. Добро пожаловать.
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
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Профиль</h2>
            <p className="text-[#A2A2A2] mb-2">
              Просмотрите и обновите данные вашей учетной записи
            </p>
            <p className="text-[#A2A2A2]">
              Пожалуйста, убедитесь, что эти данные актуальны, так как они будут использоваться для вашего бронирования боксов.
            </p>
          </div>

          {/* Блок с информацией пользователя */}
          <div className="bg-gray-100 rounded-2xl p-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {user?.name || 'Пользователь'}
                </h3>
                <p className="text-sm text-[#A2A2A2]">
                  Пожалуйста, убедитесь, что эти данные актуальны, так как они будут использоваться для вашего бронирования боксов.
                </p>
              </div>
            </div>
          </div>

          {/* Форма личных данных */}
          <form className="w-full mb-8" onSubmit={handleSubmit(onSubmit)}>
            {/* Основные поля в 2 колонки */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Левая колонка */}
              <div className="space-y-4">
                <Input
                  label="Ваше имя"
                  placeholder="Иван Иванов"
                  disabled={!isEditing}
                  {...register('name', { required: 'Имя обязательно для заполнения' })}
                  error={errors.name?.message}
                  className="bg-white rounded-lg"
                  labelClassName="font-sf-pro-text text-[#000000]"
                />
                <Input
                  label="Телефон"
                  placeholder="+7 (XXX) XXX-XX-XX"
                  disabled={!isEditing}
                  {...register('phone', {
                    required: 'Телефон обязателен для заполнения',
                    pattern: {
                      value: /^\+?[0-9]{10,15}$/,
                      message: 'Некорректный номер телефона'
                    }
                  })}
                  error={errors.phone?.message}
                  className="bg-white rounded-lg"
                  labelClassName="font-sf-pro-text text-[#000000]"
                />
                <Input
                  label="Адрес"
                  placeholder="г. Алматы, ул. Примерная, д. 123"
                  disabled={!isEditing}
                  {...register('address', { required: 'Адрес обязателен для заполнения' })}
                  error={errors.address?.message}
                  className="bg-white rounded-lg"
                  labelClassName="font-sf-pro-text text-[#000000]"
                />
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
                <Input
                  id="iin"
                  label={
                    <span className="flex items-center gap-2 font-sf-pro-text text-[#000000]">
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
                  className="bg-white rounded-lg"
                />
                <div className="w-full space-y-2">
                  <label className="block text-sm font-medium font-sf-pro-text text-[#000000]">
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
                        className="w-full [&>div]:rounded-lg [&>div]:bg-white [&>div]:border-gray-300 [&>div]:min-h-[42px] [&>div]:p-0 [&>div]:px-4 [&>div]:py-2.5 [&>div]:min-h-[42px]"
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

      {/* Модалка изменения пароля - только для пользователей с паролем */}
      {user?.auth_method !== 'oauth' && (
        <ChangePasswordModal
          isOpen={isChangePasswordModalOpen}
          onClose={() => setIsChangePasswordModalOpen(false)}
          userEmail={user?.email}
        />
      )}
    </div>

  );
});

PersonalData.displayName = 'PersonalData';

export default PersonalData; 