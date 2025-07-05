# Task 1: Создание API модулей для работы с заказами и платежами

## Описание
Создать API модули для работы с заказами и платежами, которые будут использоваться в компонентах оплаты.

## Что нужно реализовать

### 1. API модуль для заказов (`src/shared/api/ordersApi.js`)

**Методы:**
- `getAllOrders()` - получение всех заказов (для MANAGER и ADMIN)
- `getUserOrders()` - получение заказов текущего пользователя
- `updateOrderStatus(id, status)` - обновление статуса заказа
- `deleteOrder(id)` - удаление заказа

**API Эндпоинты:**
- **GET** `/orders` - получить все заказы
- **GET** `/orders/me` - получить заказы текущего пользователя
- **PUT** `/orders/{id}/status` - обновить статус заказа
  ```json
  {
    "status": "APPROVED"
  }
  ```
- **DELETE** `/orders/{id}` - удалить заказ

### 2. API модуль для платежей (`src/shared/api/paymentsApi.js`)

**Методы:**
- `createPayment(orderId)` - создание оплаты по заказу
- `getUserPayments()` - получение всех оплат пользователя
- `createManualPayment(orderPaymentId)` - создание ручной оплаты

**API Эндпоинты:**
- **POST** `/payments` - создать оплату по заказу
  ```json
  {
    "order_id": 1
  }
  ```
- **GET** `/payments/me` - получить все оплаты текущего пользователя
- **POST** `/payments/manual` - создать ручную оплату
  ```json
  {
    "order_payment_id": 1
  }
  ```

### 3. Структуры данных

**Статусы заказов:**
- `ACTIVE` - активный
- `INACTIVE` - неактивный (требует подтверждения)
- `APPROVED` - подтвержден (доступна оплата)
- `PROCESSING` - в обработке

**Статусы платежей:**
- `PAID` - оплачен
- `UNPAID` - не оплачен
- `MANUAL` - ручная оплата

**Статусы договоров:**
- `SIGNED` - подписан
- `UNSIGNED` - не подписан

## Файлы для создания
- `src/shared/api/ordersApi.js`
- `src/shared/api/paymentsApi.js`

## Технические требования
- Использовать существующий axios instance из `src/shared/api/axios.js`
- Включить `withCredentials: true` для всех запросов
- Добавить обработку ошибок
- Логирование в режиме разработки 