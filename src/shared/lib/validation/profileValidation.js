// Константы для валидации
export const REQUIRED_PROFILE_FIELDS = [
  { key: 'name', label: 'Имя и фамилия', validator: 'text' },
  { key: 'email', label: 'Электронная почта', validator: 'email' },
  { key: 'phone', label: 'Номер телефона', validator: 'phone' },
  { key: 'iin', label: 'ИИН', validator: 'iin' },
  { key: 'address', label: 'Адрес', validator: 'text' },
  { key: 'bday', label: 'Дата рождения', validator: 'date' }
];

// Валидаторы для конкретных типов полей
const validators = {
  text: (value) => value && value.trim().length >= 2,
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return value && emailRegex.test(value.trim());
  },
  phone: (value) => {
    // Казахстанские номера: +7 или 8, затем 10 цифр
    const phoneRegex = /^(\+7|8|7)\d{10}$/;
    return value && phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
  },
  iin: (value) => {
    // ИИН: 12 цифр
    const iinRegex = /^\d{12}$/;
    return value && iinRegex.test(value.replace(/\s/g, ''));
  },
  date: (value) => {
    if (!value) return false;
    const date = new Date(value);
    const now = new Date();
    const minAge = new Date(now.getFullYear() - 100, now.getMonth(), now.getDate());
    const maxAge = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
    return date >= minAge && date <= maxAge;
  }
};

// Валидация профиля пользователя для заказа бокса
export const validateUserProfile = (user) => {
  if (!user) {
    return {
      isValid: false,
      missingFields: ['Все поля профиля'],
      invalidFields: [],
      message: 'Данные пользователя не найдены'
    };
  }

  const missingFields = [];
  const invalidFields = [];

  REQUIRED_PROFILE_FIELDS.forEach(field => {
    const value = user[field.key];
    const validator = validators[field.validator];
    
    // Проверяем наличие поля
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      missingFields.push(field.label);
    } 
    // Проверяем корректность заполнения
    else if (!validator(value)) {
      invalidFields.push(field.label);
    }
  });

  const isValid = missingFields.length === 0 && invalidFields.length === 0;
  
  let message = 'Профиль заполнен полностью';
  if (!isValid) {
    const errors = [];
    if (missingFields.length > 0) {
      errors.push(`Не заполнены: ${missingFields.join(', ')}`);
    }
    if (invalidFields.length > 0) {
      errors.push(`Некорректно заполнены: ${invalidFields.join(', ')}`);
    }
    message = errors.join('. ');
  }

  return {
    isValid,
    missingFields,
    invalidFields,
    message
  };
};

// Утилита для проверки профиля с редиректом (используется в хуке)
export const createProfileValidator = () => {
  const validateAndRedirect = (user, navigate, toast) => {
    const validation = validateUserProfile(user);
    
    if (!validation.isValid) {
      // Показываем сообщение пользователю
      toast.error(
        'Пожалуйста, заполните все данные в личном кабинете перед оформлением заказа бокса.',
        {
          duration: 4000,
          position: 'top-center'
        }
      );
      
      // Перенаправляем в личный кабинет
      navigate('/personal-account');
      return false;
    }
    
    return true;
  };

  return { validateAndRedirect };
};