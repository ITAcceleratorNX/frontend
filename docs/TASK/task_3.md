# Task 3: Система платежей для обычных пользователей

## Описание
Реализовать полную систему управления платежами для обычных пользователей (роль USER) в разделе "Платежи" личного кабинета.

## Что нужно реализовать

### 1. Основной компонент платежей (`src/pages/personal-account/ui/UserPayments.jsx`)

**Функционал:**
- Отображение активных заказов пользователя
- Информация о статусе оплаты каждого заказа
- Кнопка "Оплатить" для неоплаченных заказов
- История платежей
- Детальная информация о каждом заказе

**API использование:**
- **GET** `/orders/me` - получение заказов текущего пользователя

### 2. Компонент карточки заказа пользователя (`src/pages/personal-account/ui/UserOrderCard.jsx`)

**Функционал:**
- Отображение информации о заказе пользователя
- Статус оплаты (`PAID`/`UNPAID`)
- Статус договора (`SIGNED`/`UNSIGNED`)
- Статус заказа (`ACTIVE`, `INACTIVE`, `APPROVED`, `PROCESSING`)
- Информация о хранилище и предметах
- Сумма к оплате
- Кнопка "Оплатить" (только для `UNPAID`)

**Структура данных заказа пользователя:**
```json
{
  "id": 39,
  "storage_id": 28,
  "user_id": 9,
  "total_volume": "2",
  "total_price": "60.00",
  "start_date": "2025-06-21T17:10:53.857Z",
  "end_date": "2025-07-21T17:10:53.857Z",
  "contract_status": "UNSIGNED",
  "payment_status": "UNPAID",
  "status": "INACTIVE",
  "created_at": "2025-06-21",
  "storage": {
    "id": 28,
    "warehouse_id": 2,
    "name": "0C",
    "storage_type": "INDIVIDUAL",
    "description": "individual storage",
    "image_url": "https://",  
    "height": "3",
    "total_volume": "2.00",
    "available_volume": "0.00",
    "status": "PENDING"
  },
  "items": [
    {
      "id": 9,
      "order_id": 39,
      "name": "Wooden Crate",
      "volume": "1.00",
      "cargo_mark": "HEAVY"
    }
  ]
}
```

### 3. Модальное окно оплаты (`src/pages/personal-account/ui/PaymentModal.jsx`)

**Функционал:**
- Подтверждение платежа
- Отображение деталей заказа
- Сумма к оплате
- Кнопка "Подтвердить оплату"

**API использование:**"payment_page_url": "https://payment-page", // Используйте только это поле: откройте страницу оплаты 
- **POST** `/payments` - создание платежа
  ```json
  {
    "order_id": 39,
  }
  ```

**Ответ от API:**
```json
{
  "id": 15,
  "order_id": 39,
  "user_id": 9,
  "amount": "60.00",
  "payment_method": "card",
  "status": "COMPLETED",
  "transaction_id": "txn_67891234567890",
  "created_at": "2025-06-21T17:15:33.123Z",
  "updated_at": "2025-06-21T17:15:35.456Z"
   "payment_page_url": "https://payment-page", // Используйте только это поле: откройте страницу оплаты 
}
```

### 4. Компонент истории платежей (`src/pages/personal-account/ui/PaymentHistory.jsx`)

**Функционал:**
- Список всех платежей пользователя
- Информация о транзакциях
- Статусы платежей
- Даты проведения платежей

**API использование:**
- **GET** `/payments/me` - получение платежей пользователя

**Структура данных платежа:**
```json
{
  "id": 15,
  "order_id": 39,
  "user_id": 9,
  "amount": "60.00",
  "payment_method": "card",
  "status": "COMPLETED", // ['COMPLETED', 'PENDING', 'FAILED']
  "transaction_id": "txn_67891234567890",
  "created_at": "2025-06-21T17:15:33.123Z",
  "updated_at": "2025-06-21T17:15:35.456Z",
  "order": {
    "id": 39,
    "total_price": "60.00",
    "storage": {
      "name": "0C",
      "warehouse_id": 2
    }
  }
}
```

### 5. Интеграция в навигацию

**Обновить файлы:**
- `src/pages/personal-account/ui/Sidebar.jsx` - добавить раздел "Платежи" для роли USER
- `src/pages/personal-account/index.jsx` - добавить обработку `activeNav === 'payments'`

## UI/UX требования

### Дизайн с Tailwind CSS:
- Использовать цветовую схему проекта (`#1e2c4f`)
- Карточечная система отображения заказов
- Responsive дизайн
- Компоненты Shadcn/UI для модальных окон

### Статусы платежей - цветовое кодирование:
- `PAID` - зеленый (оплачено)
- `UNPAID` - красный (не оплачено)
- `COMPLETED` - зеленый (завершено)
- `PENDING` - желтый (ожидает)
- `FAILED` - красный (ошибка)

### Статусы договоров:
- `SIGNED` - зеленый (подписан)
- `UNSIGNED` - серый (не подписан)

### Кнопки:
- "Оплатить" - синяя кнопка (только для `UNPAID`)
- "Подтвердить оплату" - зеленая кнопка в модальном окне

## Файлы для создания/изменения
- `src/pages/personal-account/ui/UserPayments.jsx` (новый)
- `src/pages/personal-account/ui/UserOrderCard.jsx` (новый)
- `src/pages/personal-account/ui/PaymentModal.jsx` (новый)
- `src/pages/personal-account/ui/PaymentHistory.jsx` (новый)
- `src/pages/personal-account/ui/Sidebar.jsx` (изменение - добавить раздел "Платежи")
- `src/pages/personal-account/index.jsx` (изменение - добавить обработку платежей)

## Технические требования
- Использовать React Query для кеширования данных
- Обработка состояний loading/error
- Toast уведомления для успешных/неуспешных платежей
- Валидация прав доступа (только USER)
- Автоматическое обновление данных после оплаты 