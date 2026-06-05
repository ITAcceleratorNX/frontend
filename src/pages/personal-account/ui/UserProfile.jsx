import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Header } from '../../../widgets';
import Sidebar from './Sidebar';
import MobileSidebar from './MobileSidebar';
import { useDeviceType } from '../../../shared/lib/hooks/useWindowWidth';
import { usersApi } from '../../../shared/api/usersApi';
import { useAuth } from '../../../shared/context/AuthContext';
import { showInfoToast, showSuccessToast, showErrorToast } from '../../../shared/lib/toast';
import { formatCalendarDateLong } from '../../../shared/lib/utils/date';
import { formatPhoneNumber, RHF_PHONE_RULES } from '../../../shared/lib/phone';
import { FormSelect } from '@/shared/ui/FormSelect.jsx';
import { DateField } from '@/shared/ui/DateField.jsx';

const ROLE_OPTIONS = [
  { value: 'ADMIN', label: 'Администратор' },
  { value: 'MANAGER', label: 'Менеджер' },
  { value: 'USER', label: 'Пользователь' },
  { value: 'COURIER', label: 'Курьер' },
];

const REGIONS = [
  'Акмолинская область','Актюбинская область','Алматинская область','Атырауская область',
  'Восточно-Казахстанская область','Жамбылская область','Западно-Казахстанская область',
  'Карагандинская область','Костанайская область','Кызылординская область',
  'Мангистауская область','Павлодарская область','Северо-Казахстанская область',
  'Туркестанская область','Алматы','Астана','Шымкент',
];

const inputCls = (err) =>
  `w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors ${
    err ? 'border-red-400 bg-red-50' : 'border-gray-300 focus:border-[#00A991]'
  }`;

const Field = ({ label, name, type = 'text', rules, placeholder, maxLength, onChange, register, errors }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-gray-600">
      {label}{rules?.required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    <input
      type={type}
      placeholder={placeholder}
      maxLength={maxLength}
      className={inputCls(errors[name])}
      {...register(name, { ...rules, ...(onChange ? { onChange } : {}) })}
    />
    {errors[name] && <p className="text-xs text-red-500">{errors[name].message}</p>}
  </div>
);

const ProfileRow = ({ label, value }) => (
  <div className="flex flex-col py-1.5 border-b border-gray-100 last:border-0">
    <span className="text-xs text-gray-500">{label}</span>
    <span className="text-sm text-gray-900">{value || <span className="text-gray-400 italic">Не указано</span>}</span>
  </div>
);

// Парсинг строки адреса в части (улица, дом, этаж, квартира)
const parseAddress = (addressStr) => {
  if (!addressStr) return { street: '', house: '', floor: '', apartment: '' };
  const parts = addressStr.split(',').map(p => p.trim());
  let street = '', house = '', floor = '', apartment = '';
  for (const part of parts) {
    if (part.match(/^д\.?\s*/)) house = part.replace(/^д\.?\s*/, '').trim();
    else if (part.match(/^эт\.?\s*/)) floor = part.replace(/^эт\.?\s*/, '').trim();
    else if (part.match(/^кв\.?\s*/)) apartment = part.replace(/^кв\.?\s*/, '').trim();
    else if (!part.startsWith('г.') && !part.startsWith('г ')) street = part.replace(/^ул\.?\s*/, '').trim();
  }
  if (!house && parts.length >= 2) house = parts[parts.length - 1];
  if (!street && parts.length >= 1) street = parts[0].replace(/^ул\.?\s*/, '').trim();
  return { street, house, floor, apartment };
};

const EMAIL_PATTERN = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: 'Некорректный email адрес',
};

const EditProfileForm = ({ user, onSaved, onCancel }) => {
  const isLegal = user?.user_type === 'LEGAL';
  const addr = user?.legal_address || {};
  const parsedAddr = parseAddress(user?.address || '');

  const { register, handleSubmit, setValue, control, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isLegal ? {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      company_name: user.company_name || '',
      bin_iin: user.bin_iin || '',
      bik: user.bik || '',
      iik: user.iik || '',
      region: addr.region || '',
      city: addr.city || '',
      street: addr.street || '',
      house: addr.house || '',
      building: addr.building || '',
      office: addr.office || '',
      postal_code: addr.postal_code || '',
    } : {
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      iin: user.iin || '',
      addressStreet: parsedAddr.street,
      addressHouse: parsedAddr.house,
      addressFloor: parsedAddr.floor,
      addressApartment: parsedAddr.apartment,
      bday: user.bday ? user.bday.slice(0, 10) : '',
    },
  });

  const handlePhoneChange = (e) => {
    setValue('phone', formatPhoneNumber(e.target.value), { shouldValidate: true });
  };

  const handleBinIinChange = (e) => {
    setValue('bin_iin', e.target.value.replace(/\D/g, '').slice(0, 12), { shouldValidate: true });
  };

  const handleBikChange = (e) => {
    setValue('bik', e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 11), { shouldValidate: true });
  };

  const handleIikChange = (e) => {
    setValue('iik', e.target.value.replace(/[^A-Za-z0-9]/g, '').slice(0, 20), { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    try {
      const payload = isLegal ? {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        company_name: data.company_name,
        bin_iin: data.bin_iin,
        bik: data.bik || null,
        iik: data.iik || null,
        legal_address: {
          region: data.region,
          city: data.city,
          street: data.street,
          house: data.house,
          building: data.building || '',
          office: data.office || '',
          postal_code: data.postal_code,
        },
      } : {
        name: data.name,
        email: data.email || null,
        phone: data.phone,
        iin: data.iin || null,
        address: [data.addressStreet, data.addressHouse && `д. ${data.addressHouse}`, data.addressFloor && `эт. ${data.addressFloor}`, data.addressApartment && `кв. ${data.addressApartment}`].filter(Boolean).join(', ') || null,
        bday: data.bday || null,
      };

      await usersApi.updateUserById(user.id, payload);
      showSuccessToast('Данные клиента успешно обновлены');
      onSaved({ ...user, ...payload });
    } catch (err) {
      showErrorToast(err.response?.data?.message || 'Ошибка при сохранении данных');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Общие поля */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field
          register={register} errors={errors}
          label={isLegal ? 'ФИО представителя' : 'Имя и фамилия'}
          name="name"
          rules={{ required: isLegal ? 'ФИО обязательно для заполнения' : 'Имя обязательно для заполнения', minLength: { value: 2, message: 'Минимум 2 символа' } }}
          placeholder="Иванов Иван Иванович"
        />
        <Field
          register={register} errors={errors}
          label="Email"
          name="email"
          type="email"
          rules={{ required: 'Email обязателен для заполнения', pattern: EMAIL_PATTERN }}
          placeholder="example@mail.com"
        />
        <Field
          register={register} errors={errors}
          label="Телефон"
          name="phone"
          type="tel"
          rules={RHF_PHONE_RULES}
          placeholder="+7 (XXX) XXX-XX-XX"
          onChange={handlePhoneChange}
        />
      </div>

      {isLegal ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              register={register} errors={errors}
              label="Наименование организации"
              name="company_name"
              rules={{ required: 'Наименование обязательно для заполнения' }}
              placeholder="ООО Компания"
            />
            <Field
              register={register} errors={errors}
              label="БИН/ИИН"
              name="bin_iin"
              maxLength={12}
              rules={{ required: 'БИН/ИИН обязателен для заполнения', pattern: { value: /^\d{12}$/, message: 'БИН/ИИН должен содержать ровно 12 цифр' } }}
              placeholder="123456789012"
              onChange={handleBinIinChange}
            />
            <Field
              register={register} errors={errors}
              label="БИК"
              name="bik"
              maxLength={11}
              rules={{ required: 'БИК обязателен для заполнения', pattern: { value: /^[A-Za-z0-9]{8}$|^[A-Za-z0-9]{11}$/, message: 'БИК должен содержать 8 или 11 символов (латинские буквы и цифры)' } }}
              placeholder="KCJBKZKX"
              onChange={handleBikChange}
            />
            <Field
              register={register} errors={errors}
              label="ИИК"
              name="iik"
              maxLength={20}
              rules={{ required: 'ИИК обязателен для заполнения', pattern: { value: /^[A-Za-z0-9]{20}$/, message: 'ИИК должен содержать ровно 20 символов (латинские буквы и цифры)' } }}
              placeholder="KZ00000000000000000000"
              onChange={handleIikChange}
            />
          </div>

          <p className="text-xs font-semibold text-gray-700 pt-1">Юридический адрес</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <Controller
                name="region"
                control={control}
                rules={{ required: 'Регион обязателен для заполнения' }}
                render={({ field }) => (
                  <FormSelect
                    label={
                      <>
                        Регион <span className="text-red-500">*</span>
                      </>
                    }
                    labelVariant="compact"
                    value={field.value}
                    onChange={field.onChange}
                    options={REGIONS.map((r) => ({ value: r, label: r }))}
                    placeholder="Выберите регион"
                    triggerClassName={inputCls(errors.region)}
                  />
                )}
              />
              {errors.region && <p className="text-xs text-red-500">{errors.region.message}</p>}
            </div>
            <Field register={register} errors={errors} label="Город" name="city" rules={{ required: 'Город обязателен для заполнения' }} placeholder="Алматы" />
            <Field register={register} errors={errors} label="Улица" name="street" rules={{ required: 'Улица обязательна для заполнения' }} placeholder="ул. Абая" />
            <Field register={register} errors={errors} label="Дом" name="house" rules={{ required: 'Дом обязателен для заполнения' }} placeholder="1" />
            <Field register={register} errors={errors} label="Корпус" name="building" placeholder="А" />
            <Field register={register} errors={errors} label="Офис" name="office" placeholder="101" />
            <Field
              register={register} errors={errors}
              label="Почтовый индекс"
              name="postal_code"
              rules={{ required: 'Индекс обязателен для заполнения', pattern: { value: /^\d{6}$/, message: 'Индекс должен содержать 6 цифр' } }}
              placeholder="050000"
              maxLength={6}
            />
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              register={register} errors={errors}
              label="ИИН"
              name="iin"
              maxLength={12}
              rules={{ required: 'ИИН обязателен для заполнения', pattern: { value: /^[0-9]{12}$/, message: 'ИИН должен содержать 12 цифр' } }}
              placeholder="XXXXXXXXXXXX"
            />
            <Controller
              name="bday"
              control={control}
              rules={{
                required: 'Дата рождения обязательна для заполнения',
                validate: (value) => {
                  if (!value) return 'Дата рождения обязательна для заполнения';
                  const birth = new Date(value);
                  const today = new Date();
                  if (isNaN(birth.getTime()) || birth > today) return 'Некорректная дата рождения';
                  const age = today.getFullYear() - birth.getFullYear() - (today < new Date(today.getFullYear(), birth.getMonth(), birth.getDate()) ? 1 : 0);
                  if (age < 18) return 'Возраст должен быть не менее 18 лет';
                  if (age > 100) return 'Некорректная дата рождения';
                  return true;
                },
              }}
              render={({ field }) => (
                <DateField
                  label="Дата рождения"
                  value={field.value || ''}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.bday?.message}
                  variant="account"
                  captionLayout="dropdown"
                  allowFutureDates={false}
                  required
                />
              )}
            />
          </div>
          <p className="text-xs font-semibold text-gray-700 pt-1">Адрес</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field register={register} errors={errors} label="Улица / микрорайон" name="addressStreet" rules={{ required: 'Улица обязательна для заполнения' }} placeholder="ул. Абая" />
            <Field register={register} errors={errors} label="Дом" name="addressHouse" rules={{ required: 'Дом обязателен для заполнения' }} placeholder="1" />
            <Field register={register} errors={errors} label="Этаж" name="addressFloor" placeholder="5" />
            <Field register={register} errors={errors} label="Квартира" name="addressApartment" placeholder="101" />
          </div>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-[#00A991] hover:bg-[#00937d] rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
          {isSubmitting ? 'Сохранение...' : 'Сохранить'}
        </button>
        <button type="button" onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">
          Отмена
        </button>
      </div>
    </form>
  );
};

// Компонент модального окна подтверждения удаления
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, userName, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-2 sm:mx-4 transform transition-all max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6">
          {/* Иконка предупреждения */}
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          {/* Заголовок */}
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 text-center mb-2">
            Подтвердите удаление
          </h3>
          
          {/* Описание */}
          <p className="text-sm text-gray-600 text-center mb-6">
            Вы уверены, что хотите удалить пользователя{' '}
            <span className="font-semibold text-gray-900">"{userName}"</span>?{' '}
            <br />
            <span className="text-red-600 font-medium">Это действие нельзя отменить.</span>
          </p>
          
          {/* Кнопки */}
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:space-x-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {isDeleting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { isMobile } = useDeviceType();
  
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [isUpdatingOrderLimit, setIsUpdatingOrderLimit] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Функция для обработки навигации в сайдбаре
  const handleNavClick = (navKey) => {
    navigate('/personal-account', { state: { activeSection: navKey } });
  };
  
  // Состояния для модального окна удаления
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    isDeleting: false
  });

  // Проверяем роль текущего пользователя
  const isAdmin = currentUser?.role === 'ADMIN';
  const isManager = currentUser?.role === 'MANAGER';
  const isAdminOrManager = isAdmin || isManager;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const user = await usersApi.getUserById(userId);
        setSelectedUser(user);
      } catch (error) {
        console.error('Ошибка при загрузке пользователя:', error);
        if (error.response?.status === 404) {
          showErrorToast('Пользователь не найден');
        } else {
          showErrorToast('Не удалось загрузить данные пользователя');
        }
        setSelectedUser(null);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Обновление роли пользователя (только для ADMIN)
  const handleRoleUpdate = async (newRole) => {
    if (!isAdmin || !selectedUser) {
      showErrorToast('Только администратор может изменять роли пользователей');
      return;
    }

    try {
      setIsUpdatingRole(true);
      await usersApi.updateUserRole(selectedUser.id, newRole);
      
      // Обновляем локальное состояние
      setSelectedUser(prev => ({ ...prev, role: newRole }));
      
      showSuccessToast('Роль пользователя успешно обновлена');
    } catch (error) {
      console.error('Ошибка при обновлении роли:', error);
      showErrorToast('Не удалось обновить роль пользователя');
    } finally {
      setIsUpdatingRole(false);
    }
  };

  // Обновление разрешения на превышение лимита заказов (для MANAGER и ADMIN)
  const handleOrderLimitPermissionUpdate = async (canExceed) => {
    if (!isAdminOrManager || !selectedUser) {
      showErrorToast('Только менеджер или администратор может изменять разрешения');
      return;
    }

    if (selectedUser.role !== 'USER') {
      showErrorToast('Разрешение может быть установлено только для пользователей с ролью USER');
      return;
    }

    try {
      setIsUpdatingOrderLimit(true);
      const updatedUser = await usersApi.updateOrderLimitPermission(selectedUser.id, canExceed);
      
      // Обновляем локальное состояние
      setSelectedUser(prev => ({ ...prev, can_exceed_order_limit: canExceed }));
      
      showSuccessToast(
        canExceed 
          ? 'Разрешение на аренду более 2 боксов предоставлено' 
          : 'Разрешение на аренду более 2 боксов отозвано'
      );
    } catch (error) {
      console.error('Ошибка при обновлении разрешения:', error);
      showErrorToast('Не удалось обновить разрешение');
    } finally {
      setIsUpdatingOrderLimit(false);
    }
  };

  // Возврат к списку пользователей
  const handleBackToUsers = () => {
    const isAdminUser = currentUser?.role === 'ADMIN';
    navigate('/personal-account', { state: { activeSection: isAdminUser ? 'adminusers' : 'managerusers' } });
  };

  // Получение отображаемого имени роли
  const getRoleDisplayName = (role) => {
    const roleMap = {
      'ADMIN': 'Администратор',
      'MANAGER': 'Менеджер', 
      'USER': 'Пользователь',
      'COURIER': 'Курьер'
    };
    return roleMap[role] || role;
  };

  // Получение CSS класса для роли
  const getRoleClass = (role) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'COURIER':
        return 'bg-yellow-100 text-yellow-800 border border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border border-green-200';
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    return formatCalendarDateLong(dateString);
  };

  // Открытие модального окна удаления
  const openDeleteModal = () => {
    setDeleteModal({
      isOpen: true,
      isDeleting: false
    });
  };

  // Закрытие модального окна удаления
  const closeDeleteModal = () => {
    if (!deleteModal.isDeleting) {
      setDeleteModal({
        isOpen: false,
        isDeleting: false
      });
    }
  };

  // Подтверждение удаления пользователя
  const confirmDeleteUser = async () => {
    if (!isAdmin || !selectedUser) {
      showErrorToast('Только администратор может удалять пользователей');
      return;
    }

    try {
      setDeleteModal(prev => ({ ...prev, isDeleting: true }));
      
      await usersApi.deleteUser(selectedUser.id);
      
      showSuccessToast('Пользователь успешно удален');
      closeDeleteModal();
      
      // Перенаправляем обратно к списку пользователей
      setTimeout(() => {
        handleBackToUsers();
      }, 1000);
    } catch (error) {
      console.error('Ошибка при удалении пользователя:', error);
      showErrorToast('Не удалось удалить пользователя');
      setDeleteModal(prev => ({ ...prev, isDeleting: false }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 min-w-0">
          {!isMobile && <Sidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />}
          <main className={`flex-1 min-w-0 ${isMobile ? 'mr-0 px-4' : 'mr-[110px]'}`}>
            {isMobile && <MobileSidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />}
            <div className="flex items-center justify-center py-12 sm:py-20">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-2 border-gray-200 border-t-[#00A991]"></div>
                <p className="text-sm sm:text-lg font-medium text-gray-600">Загрузка профиля...</p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 min-w-0">
          {!isMobile && <Sidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />}
          <main className={`flex-1 min-w-0 ${isMobile ? 'mr-0 px-4' : 'mr-[110px]'}`}>
            {isMobile && <MobileSidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />}
            <div className="text-center py-8 sm:py-20 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Пользователь не найден</h3>
              <p className="text-sm sm:text-base text-gray-500 mb-4">Запрашиваемый пользователь не существует или был удален</p>
              <button
                onClick={handleBackToUsers}
                className="inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[#00A991] bg-[#00A991]/10 hover:bg-[#00A991]/20 rounded-lg transition-colors"
              >
                Вернуться к списку
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Модальное окно подтверждения удаления */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={closeDeleteModal}
        onConfirm={confirmDeleteUser}
        userName={selectedUser.name || selectedUser.email}
        isDeleting={deleteModal.isDeleting}
      />
      
      <div className="flex flex-1 min-w-0">
        {!isMobile && <Sidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />}
        <main className={`flex-1 min-w-0 overflow-x-hidden ${isMobile ? 'mr-0 px-3 sm:px-4' : 'mr-[110px]'}`}>
          {isMobile && <MobileSidebar activeNav={isAdmin ? 'adminusers' : 'managerusers'} setActiveNav={handleNavClick} />}
          <div className="max-w-4xl mx-auto py-4 sm:py-6 lg:py-8 px-3 sm:px-6">
            {/* Навигация назад */}
            <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
              <button
                onClick={handleBackToUsers}
                className="inline-flex items-center px-2.5 sm:px-3 py-2 text-xs sm:text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Назад к списку
              </button>
            </div>

            {/* Карточка профиля пользователя */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Заголовок карточки */}
              <div className="bg-gradient-to-r from-[#00A991] to-[#31876D] px-4 sm:px-6 py-4 sm:py-6">
                <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                  <div className="flex-shrink-0 h-14 w-14 sm:h-20 sm:w-20">
                    <div className="h-14 w-14 sm:h-20 sm:w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-xl sm:text-2xl">
                      {(selectedUser.name || selectedUser.email || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold text-white truncate">
                      {selectedUser.name || 'Имя не указано'}
                    </h1>
                    <p className="text-white/80 text-sm sm:text-lg truncate">{selectedUser.email}</p>
                    <div className="mt-1 sm:mt-2">
                      <span className={`inline-flex px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-semibold rounded-lg ${getRoleClass(selectedUser.role).replace('text-', 'text-white ').replace('bg-', 'bg-white/20 ').replace('border-', 'border-white/30 ')}`}>
                        {getRoleDisplayName(selectedUser.role)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Редактирование профиля клиента */}
              {isAdminOrManager && selectedUser?.role === 'USER' && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Данные профиля
                      <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {selectedUser.user_type === 'LEGAL' ? 'Юр. лицо' : 'Физ. лицо'}
                      </span>
                    </h3>
                    {!isEditingProfile && (
                      <button
                        onClick={() => setIsEditingProfile(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-[#00A991] bg-[#00A991]/10 hover:bg-[#00A991]/20 rounded-lg transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Редактировать
                      </button>
                    )}
                  </div>

                  {isEditingProfile ? (
                    <EditProfileForm
                      user={selectedUser}
                      onSaved={(updated) => {
                        setSelectedUser(updated);
                        setIsEditingProfile(false);
                      }}
                      onCancel={() => setIsEditingProfile(false)}
                    />
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                      {selectedUser.user_type === 'LEGAL' ? (
                        <>
                          <ProfileRow label="Наименование" value={selectedUser.company_name} />
                          <ProfileRow label="БИН/ИИН" value={selectedUser.bin_iin} />
                          <ProfileRow label="БИК" value={selectedUser.bik} />
                          <ProfileRow label="ИИК" value={selectedUser.iik} />
                          {selectedUser.legal_address && (
                            <div className="sm:col-span-2">
                              <ProfileRow label="Юр. адрес" value={[
                                selectedUser.legal_address.region,
                                selectedUser.legal_address.city,
                                selectedUser.legal_address.street,
                                selectedUser.legal_address.house,
                                selectedUser.legal_address.postal_code,
                              ].filter(Boolean).join(', ')} />
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <ProfileRow label="ИИН" value={selectedUser.iin} />
                          <ProfileRow label="Дата рождения" value={selectedUser.bday ? formatDate(selectedUser.bday) : null} />
                          <div className="sm:col-span-2">
                            <ProfileRow label="Адрес" value={selectedUser.address} />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Основная информация */}
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {/* Левая колонка */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Личная информация
                      </h3>
                      <div className="space-y-2 sm:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-gray-100">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">ID пользователя:</span>
                          <span className="text-xs sm:text-base text-gray-900">#{selectedUser.public_id}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-gray-100">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">Имя:</span>
                          <span className="text-xs sm:text-base text-gray-900 truncate">{selectedUser.name || 'Не указано'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-gray-100">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">Email:</span>
                          <span className="text-xs sm:text-base text-gray-900 truncate">{selectedUser.email}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3 border-b border-gray-100">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">Телефон:</span>
                          <span className="text-xs sm:text-base text-gray-900">{selectedUser.phone || 'Не указан'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 py-2 sm:py-3">
                          <span className="text-xs sm:text-sm font-medium text-gray-600">Дата регистрации:</span>
                          <span className="text-xs sm:text-base text-gray-900">{formatDate(selectedUser.registration_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Правая колонка */}
                  <div className="space-y-4 sm:space-y-6">
                    <div>
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Управление ролью
                      </h3>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Текущая роль:
                          </label>
                          {isAdmin ? (
                            <FormSelect
                              value={selectedUser.role}
                              onChange={handleRoleUpdate}
                              options={ROLE_OPTIONS}
                              disabled={isUpdatingRole}
                              triggerClassName={`w-full h-auto px-3 py-2 text-sm font-semibold rounded-lg transition-all ${getRoleClass(selectedUser.role)} ${
                                isUpdatingRole ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'
                              }`}
                            />
                          ) : (
                            <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg ${getRoleClass(selectedUser.role)}`}>
                              {getRoleDisplayName(selectedUser.role)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Управление разрешением на превышение лимита заказов (для MANAGER и ADMIN, только для USER) */}
                    {isAdminOrManager && selectedUser?.role === 'USER' && (
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          Разрешение на заказы
                        </h3>
                        <div className="space-y-3 sm:space-y-4">
                          <div className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
                              <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-900 mb-1">
                                  Разрешить аренду более 2 боксов
                                </label>
                                <p className="text-xs text-gray-600">
                                  При включении клиент сможет заказывать более 2 активных боксов одновременно
                                </p>
                              </div>
                              <div className="sm:ml-4 flex-shrink-0">
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={selectedUser.can_exceed_order_limit || false}
                                    onChange={(e) => handleOrderLimitPermissionUpdate(e.target.checked)}
                                    disabled={isUpdatingOrderLimit}
                                    className="sr-only peer"
                                  />
                                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                            </div>
                            {isUpdatingOrderLimit && (
                              <div className="flex items-center text-sm text-gray-600 mt-2">
                                <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Обновление...
                              </div>
                            )}
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <p className="text-xs text-blue-800">
                                {selectedUser.can_exceed_order_limit 
                                  ? '✓ Клиент может заказывать более 2 боксов' 
                                  : '✗ Клиент ограничен 2 активными боксами'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Дополнительные действия для администратора */}
                    {isAdmin && (
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 flex items-center">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Действия администратора
                        </h3>
                        <div className="space-y-2 sm:space-y-3">
                          {/* <button
                            className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-[#00A991] bg-[#00A991]/10 hover:bg-[#00A991]/20 rounded-lg transition-colors"
                            onClick={() => {
                              // TODO: Добавить функционал просмотра заказов пользователя
                              showInfoToast('Функция в разработке');
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            Просмотреть заказы
                          </button>
                          
                          <button
                            className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-[#00A991] bg-[#00A991]/10 hover:bg-[#00A991]/20 rounded-lg transition-colors"
                            onClick={() => {
                              // TODO: Добавить функционал просмотра платежей пользователя
                              showInfoToast('Функция в разработке');
                            }}
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                            </svg>
                            Просмотреть платежи
                          </button> */}

                          <div className="border-t border-gray-200 pt-3 mt-4 sm:mt-6">
                            <button
                              onClick={openDeleteModal}
                              className="w-full inline-flex items-center justify-center px-3 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                            >
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Удалить пользователя
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserProfile; 