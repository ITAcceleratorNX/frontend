# 🚛 Функциональность мувинга в модальном окне оплаты

## Обзор

Добавлена возможность заказа услуги мувинга (переезда) прямо в модальном окне подтверждения оплаты. Пользователи могут:

- Включить/выключить услугу мувинга с помощью переключателя
- Выбрать один из трех тарифов: LIGHT, STANDARD, HARD
- Указать дату и время мувинга
- Увидеть обновленную стоимость с учетом мувинга
- Оплатить все услуги в одном платеже

## Технические детали

### API последовательность

При включенном мувинге выполняется 3 последовательных API запроса:

1. **POST /order-services** - добавление услуги к заказу
   ```json
   {
     "order_id": 55,
     "service_id": 6
   }
   ```

2. **POST /moving** - создание заявки на мувинг
   ```json
   {
     "order_id": 55,
     "moving_date": "2025-07-10T14:00:00Z",
     "vehicle_type": "LARGE",
     "status": "PENDING_FROM",
     "availability": "AVAILABLE"
   }
   ```

3. **POST /payments** - создание платежа
   ```json
   {
     "order_id": 55
   }
   ```

### Тарифы мувинга

| Тариф    | service_id | Цена     | Описание                    |
|----------|------------|----------|-----------------------------|
| LIGHT    | 5          | 15,000₸  | Light moving description    |
| STANDARD | 6          | 20,000₸  | Standard moving description |
| HARD     | 7          | 40,000₸  | Hard moving description     |

### Компоненты интерфейса

- **Toggle Switch** - переключатель "Добавить услугу мувинга"
- **Radio buttons** - выбор тарифа (только один вариант)
- **DateTime input** - выбор даты и времени
- **Динамический расчет** - обновление общей стоимости

## Файлы изменений

### API
- `src/shared/api/paymentsApi.js` - добавлены методы для мувинга
- `src/shared/lib/hooks/use-payments.js` - новые хуки для API

### UI
- `src/pages/personal-account/ui/PaymentModal.jsx` - основная логика

### Зависимости
- Требуется `react-toastify` для уведомлений
- Использует существующие shadcn/ui компоненты

## Состояние компонента

```javascript
const [movingEnabled, setMovingEnabled] = useState(false);
const [selectedTariff, setSelectedTariff] = useState(null);
const [movingDate, setMovingDate] = useState('');
const [movingTariffs, setMovingTariffs] = useState([]);
const [loadingTariffs, setLoadingTariffs] = useState(false);
```

## Валидация

Кнопка "Подтвердить оплату" активна только когда:
- Мувинг выключен, ИЛИ
- Мувинг включен И выбран тариф И указана дата

## Расчет стоимости

```javascript
const getTotalPrice = () => {
  const basePrice = parseFloat(order.total_price) || 0;
  const deposit = 15000;
  const movingPrice = movingEnabled && selectedTariff ? parseFloat(selectedTariff.price) : 0;
  return basePrice + deposit + movingPrice;
};
```

## Обработка ошибок

- Показ toast уведомлений для каждого этапа
- Откат к обычной оплате при ошибках мувинга
- Валидация формы перед отправкой

## Пример использования

```jsx
<PaymentModal
  isOpen={isModalOpen}
  order={selectedOrder}
  onSuccess={handlePaymentSuccess}
  onCancel={handlePaymentCancel}
/>
```

Модальное окно автоматически загружает тарифы мувинга при открытии и предоставляет полную функциональность выбора и оплаты. 