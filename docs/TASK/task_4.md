# Task 4: React Query хуки и интеграции

## Описание
Создать кастомные React Query хуки для работы с заказами и платежами, а также интегрировать систему в существующие компоненты.

## Что нужно реализовать

### 1. Хуки для работы с заказами (`src/shared/lib/hooks/use-orders.js`)

**Функционал:**
```javascript
// Хук для получения всех заказов (MANAGER, ADMIN)
export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: ordersApi.getAllOrders,
    staleTime: 5 * 60 * 1000, // 5 минут
  });
};

// Хук для получения заказов текущего пользователя
export const useUserOrders = () => {
  return useQuery({
    queryKey: ['user-orders'],
    queryFn: ordersApi.getUserOrders,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

// Хук для обновления статуса заказа
export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }) => ordersApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['user-orders']);
    },
  });
};

// Хук для удаления заказа
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => ordersApi.deleteOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['orders']);
      queryClient.invalidateQueries(['user-orders']);
    },
  });
};
```

### 2. Хуки для работы с платежами (`src/shared/lib/hooks/use-payments.js`)

**Функционал:**
```javascript
// Хук для получения платежей пользователя
export const useUserPayments = () => {
  return useQuery({
    queryKey: ['user-payments'],
    queryFn: paymentsApi.getUserPayments,
    staleTime: 2 * 60 * 1000, // 2 минуты
  });
};

// Хук для создания платежа
export const useCreatePayment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (paymentData) => paymentsApi.createPayment(paymentData),
    onSuccess: () => {
      queryClient.invalidateQueries(['user-payments']);
      queryClient.invalidateQueries(['user-orders']);
    },
  });
};

// Хук для получения статуса платежа
export const usePaymentStatus = (paymentId) => {
  return useQuery({
    queryKey: ['payment-status', paymentId],
    queryFn: () => paymentsApi.getPaymentStatus(paymentId),
    enabled: !!paymentId,
    refetchInterval: 3000, // Проверять каждые 3 секунды
    staleTime: 0,
  });
};
```



### 4. Интеграция в Personal Account Page

**Обновить файл:** `src/pages/personal-account/index.jsx`

**Изменения:**
1. Добавить импорты новых компонентов
2. Добавить обработку навигации для новых разделов

```javascript
// Добавить импорты
import { OrderManagement } from './ui/OrderManagement';
import { UserPayments } from './ui/UserPayments';

// В рендере добавить обработку новых разделов
{activeNav === 'request' && user?.role !== 'USER' && <OrderManagement />}
{activeNav === 'payments' && user?.role === 'USER' && <UserPayments />}
```

### 5. Обновление index.js файлов для экспортов

**Обновить файл:** `src/shared/lib/hooks/index.js`

```javascript
// Добавить экспорты новых хуков
export * from './use-orders';
export * from './use-payments';
```

**Обновить файл:** `src/pages/personal-account/ui/index.js`

```javascript
// Добавить экспорты новых компонентов
export { OrderManagement } from './OrderManagement';
export { OrderCard } from './OrderCard';
export { OrderConfirmModal } from './OrderConfirmModal';
export { UserPayments } from './UserPayments';
export { UserOrderCard } from './UserOrderCard';
export { PaymentModal } from './PaymentModal';
export { PaymentHistory } from './PaymentHistory';
```

### 6. Создание типов данных

**Создать файл:** `src/shared/types/orders.js`

```javascript
/**
 * @typedef {Object} Order
 * @property {number} id
 * @property {number} storage_id
 * @property {number} user_id
 * @property {string} total_volume
 * @property {string} total_price
 * @property {string} start_date
 * @property {string} end_date
 * @property {'SIGNED'|'UNSIGNED'} contract_status
 * @property {'PAID'|'UNPAID'} payment_status
 * @property {'ACTIVE'|'INACTIVE'|'APPROVED'|'PROCESSING'} status
 * @property {string} created_at
 * @property {Storage} storage
 * @property {OrderItem[]} items
 * @property {User} user
 */

/**
 * @typedef {Object} Payment
 * @property {number} id
 * @property {number} order_id
 * @property {number} user_id
 * @property {string} amount
 * @property {string} payment_method
 * @property {'COMPLETED'|'PENDING'|'FAILED'} status
 * @property {string} transaction_id
 * @property {string} created_at
 * @property {string} updated_at
 * @property {Order} order
 */
```

### 7. Обработка ошибок и уведомлений

**Создать файл:** `src/shared/lib/utils/notifications.js`

```javascript
import { toast } from 'react-toastify';

export const showPaymentSuccess = (amount) => {
  toast.success(`Платеж на сумму ${amount}₸ успешно проведен!`);
};

export const showPaymentError = (error) => {
  toast.error(`Ошибка при проведении платежа: ${error.message}`);
};

export const showOrderStatusUpdate = (status) => {
  const statusTexts = {
    APPROVED: 'подтвержден',
    PROCESSING: 'в обработке',
    ACTIVE: 'активирован',
    INACTIVE: 'деактивирован',
  };
  
  toast.success(`Статус заказа изменен на "${statusTexts[status]}"`);
};

export const showOrderDeleteSuccess = () => {
  toast.success('Заказ успешно удален');
};
```

## Файлы для создания/изменения
- `src/shared/lib/hooks/use-orders.js` (новый)
- `src/shared/lib/hooks/use-payments.js` (новый)
- `src/shared/lib/hooks/index.js` (изменение)
- `src/shared/types/orders.js` (новый)
- `src/shared/lib/utils/notifications.js` (новый)
- `src/pages/personal-account/ui/Sidebar.jsx` (изменение)
- `src/pages/personal-account/index.jsx` (изменение)
- `src/pages/personal-account/ui/index.js` (изменение)

## Технические требования
- Использовать REACT для всех данных
- Настроить правильное кеширование в React Query
- Обработать все состояния loading/error
- Настроить автоматическое обновление данных
- Интегрировать toast уведомления для всех действий 