import React from 'react';
import { toast } from 'react-toastify';
import ToastMessage from '../../components/ToastMessage';
import {
  showErrorToast,
  showInfoToast,
  showSuccessToast,
} from '../toast';

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
  
  if (type === 'success') {
    showSuccessToast(message, options);
  } else if (type === 'info') {
    showInfoToast(message, options);
  } else {
    showErrorToast(message, options);
  }
};

// Специальные функции для ошибок чата
export const showChatConnectionError = () => {
  showToastWithCache('Ошибка подключения к чату. Проверьте соединение с интернетом.', 'error');
};

export const showChatServerError = () => {
  showToastWithCache('Сервер чата временно недоступен. Попробуйте позже.', 'error');
};

export const showPaymentSuccess = (amount) => {
  showSuccessToast(`Платеж на сумму ${amount}₸ успешно проведен!`);
};

export const showPaymentError = (error) => {
  showErrorToast(`Ошибка при проведении платежа: ${error.message}`);
};

export const showOrderStatusUpdate = (status) => {
  const statusTexts = {
    APPROVED: 'подтвержден',
    PROCESSING: 'в обработке',
    ACTIVE: 'активирован',
    INACTIVE: 'деактивирован',
  };
  
  showSuccessToast(`Статус заказа изменен на "${statusTexts[status]}"`);
};

export const showOrderDeleteSuccess = () => {
  showSuccessToast('Заказ успешно удален');
};

export const showPaymentCreated = () => {
  showSuccessToast('Ссылка для оплаты создана! Переходим к оплате...');
};

export const showPaymentCanceled = () => {
  showInfoToast('Оплата отменена');
};

export const showOrderLoadError = () => {
  showErrorToast('Ошибка при загрузке заказов');
};

export const showPaymentLoadError = () => {
  showErrorToast('Ошибка при загрузке платежей');
};

export const showGenericError = (message = 'Произошла ошибка') => {
  showErrorToast(message);
};

export const showGenericSuccess = (message = 'Операция выполнена успешно') => {
  showSuccessToast(message);
};

export const showLoading = (message = 'Загрузка...') => {
  return toast.loading(
    ({ closeToast }) =>
      React.createElement(ToastMessage, {
        type: 'loading',
        title: 'Загрузка',
        message,
        onClose: closeToast,
      }),
    {
      position: 'top-right',
      hideProgressBar: true,
      closeButton: false,
      autoClose: false,
    }
  );
};

export const updateToast = (toastId, message, type = 'success') => {
  toast.update(toastId, {
    render: ({ closeToast }) =>
      React.createElement(ToastMessage, {
        type,
        message,
        onClose: closeToast,
      }),
    type,
    isLoading: false,
    autoClose: 5000,
  });
}; 

export const showExtendOrderSuccess = () => {
  showSuccessToast('Заказ успешно продлен', { autoClose: 3000 });
};

export const showCancelExtensionSuccess = () => {
  showSuccessToast('Продление заказа отменено', { autoClose: 3000 });
};

export const showExtendOrderError = () => {
  showErrorToast('Ошибка при обработке продления заказа', { autoClose: 3000 });
}; 