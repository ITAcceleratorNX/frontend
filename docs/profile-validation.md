# Валидация профиля пользователя

## Описание
Система валидации профиля пользователя предотвращает доступ к определённым страницам (например, заказ бокса) до тех пор, пока пользователь не заполнит все обязательные поля в своём профиле.

## Обязательные поля профиля
- `name` - Имя и фамилия
- `email` - Электронная почта
- `phone` - Номер телефона
- `iin` - ИИН (12 цифр)
- `address` - Адрес
- `bday` - Дата рождения

## Компоненты и утилиты

### ProfileValidationGuard
Компонент-обёртка для защиты страниц, требующих полный профиль.

```jsx
import ProfileValidationGuard from '../../shared/components/ProfileValidationGuard';

const ProtectedPage = () => {
  return (
    <ProfileValidationGuard redirectTo="/personal-account">
      <div>Контент страницы, доступный только с полным профилем</div>
    </ProfileValidationGuard>
  );
};
```

### useProfileValidation Hook
Хук для ручной валидации профиля в компонентах.

```jsx
import { useProfileValidation } from '../../shared/lib/hooks/useProfileValidation';

const MyComponent = () => {
  const { 
    isValidating, 
    isProfileValid, 
    validateProfile, 
    validateAndRedirect 
  } = useProfileValidation();

  const handleAction = () => {
    if (!validateAndRedirect()) {
      return; // Пользователь перенаправлен на заполнение профиля
    }
    
    // Продолжаем выполнение действия
    console.log('Профиль валиден, выполняем действие');
  };

  if (isValidating) {
    return <div>Проверка профиля...</div>;
  }

  return (
    <button onClick={handleAction}>
      Выполнить действие
    </button>
  );
};
```

### validateUserProfile Function
Функция для проверки полноты профиля пользователя.

```jsx
import { validateUserProfile } from '../../shared/lib/validation/profileValidation';

const validation = validateUserProfile(user);

if (!validation.isValid) {
  console.log('Отсутствующие поля:', validation.missingFields);
  console.log('Сообщение:', validation.message);
}
```

## Защищённые маршруты
Маршруты, требующие валидацию профиля, определены в `src/shared/lib/routes/protectedRoutes.js`:

```javascript
export const PROFILE_VALIDATION_REQUIRED_ROUTES = [
  '/warehouse-order'
];
```

## Поведение при неполном профиле

1. **Автоматическое перенаправление**: Пользователь перенаправляется на `/personal-account`
2. **Уведомление**: Показывается toast-сообщение с объяснением
3. **Автоматическое включение редактирования**: В личном кабинете автоматически включается режим редактирования
4. **Сохранение контекста**: Информация о том, откуда пришёл пользователь, сохраняется в state

## Интеграция с существующими страницами

### Для новых страниц
Оберните контент в `ProfileValidationGuard`:

```jsx
import ProfileValidationGuard from '../../shared/components/ProfileValidationGuard';

const NewProtectedPage = () => {
  return (
    <ProfileValidationGuard>
      {/* Ваш контент */}
    </ProfileValidationGuard>
  );
};
```

### Для существующих страниц
Добавьте маршрут в `PROFILE_VALIDATION_REQUIRED_ROUTES` и используйте хук:

```jsx
import { useProfileValidation } from '../../shared/lib/hooks/useProfileValidation';

const ExistingPage = () => {
  const { isValidating } = useProfileValidation();

  if (isValidating) {
    return <LoadingSpinner />;
  }

  // Остальной код компонента
};
```

## Тестирование
Тесты находятся в `src/shared/lib/validation/__tests__/profileValidation.test.js`.

Запуск тестов:
```bash
npm test profileValidation
```

## API Endpoint
Валидация использует существующий endpoint:
- `GET /users/me` - получение данных текущего пользователя

## Примеры использования

### Проверка перед выполнением действия
```jsx
const handleOrderSubmit = () => {
  const validation = validateUserProfile(user);
  
  if (!validation.isValid) {
    toast.error('Заполните профиль перед оформлением заказа');
    navigate('/personal-account');
    return;
  }
  
  // Продолжаем оформление заказа
  submitOrder();
};
```

### Условное отображение элементов
```jsx
const { isProfileValid } = useProfileValidation({ autoRedirect: false });

return (
  <div>
    {isProfileValid ? (
      <button onClick={handleAction}>Заказать бокс</button>
    ) : (
      <div className="alert">
        <p>Заполните профиль для доступа к заказам</p>
        <Link to="/personal-account">Перейти в профиль</Link>
      </div>
    )}
  </div>
);
```