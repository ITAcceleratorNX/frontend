import { toast } from 'react-toastify';

// Кеш для предотвращения дублирования toast уведомлений
const toastCache = new Set();
const CACHE_DURATION = 3000; // 3 секунды

// Функция для показа toast с защитой от дублирования
const showToastWithCache = (message, type = 'error', options = {}) => {
  const cacheKey = `${type}-${message}`;
  
  if (toastCache.has(cacheKey)) {
    return;
  }
  
  toastCache.add(cacheKey);
  
  // Удаляем из кеша через указанное время
  setTimeout(() => {
    toastCache.delete(cacheKey);
  }, CACHE_DURATION);
  
  toast[type](message, options);
};

// Специальные функции для ошибок чата
export const showChatConnectionError = () => {
  showToastWithCache('Ошибка подключения к чату. Проверьте соединение с интернетом.', 'error');
};

export const showChatServerError = () => {
  showToastWithCache('Сервер чата временно недоступен. Попробуйте позже.', 'error');
};

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

export const showPaymentCreated = () => {
  toast.success('Ссылка для оплаты создана! Переходим к оплате...');
};

export const showPaymentCanceled = () => {
  toast.info('Оплата отменена');
};

export const showOrderLoadError = () => {
  toast.error('Ошибка при загрузке заказов');
};

export const showPaymentLoadError = () => {
  toast.error('Ошибка при загрузке платежей');
};

export const showGenericError = (message = 'Произошла ошибка') => {
  toast.error(message);
};

export const showGenericSuccess = (message = 'Операция выполнена успешно') => {
  toast.success(message);
};

export const showLoading = (message = 'Загрузка...') => {
  return toast.loading(message);
};

export const updateToast = (toastId, message, type = 'success') => {
  toast.update(toastId, {
    render: message,
    type,
    isLoading: false,
    autoClose: 3000
  });
}; 

export const showExtendOrderSuccess = () => {
  toast.success('Заказ успешно продлен', { autoClose: 3000 });
};

export const showCancelExtensionSuccess = () => {
  toast.success('Продление заказа отменено', { autoClose: 3000 });
};

export const showExtendOrderError = () => {
  toast.error('Ошибка при обработке продления заказа', { autoClose: 3000 });
}; 