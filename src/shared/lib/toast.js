import React from 'react';
import { toast } from 'react-toastify';
import ToastMessage from '../components/ToastMessage';

const DEFAULT_OPTIONS = {
  position: 'top-right',
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  pauseOnFocusLoss: true,
};

export const showSuccessToast = (message, options = {}) =>
  toast.success(
    ({ closeToast }) =>
      React.createElement(ToastMessage, {
        type: 'success',
        message,
        onClose: closeToast,
      }),
    {
      ...DEFAULT_OPTIONS,
      ...options,
    }
  );

export const showErrorToast = (message, options = {}) =>
  toast.error(
    ({ closeToast }) =>
      React.createElement(ToastMessage, {
        type: 'error',
        message,
        onClose: closeToast,
      }),
    {
      ...DEFAULT_OPTIONS,
      ...options,
    }
  );

export const showInfoToast = (message, options = {}) =>
  toast.info(
    ({ closeToast }) =>
      React.createElement(ToastMessage, {
        type: 'info',
        message,
        onClose: closeToast,
        ...(options.title !== undefined && { title: options.title }),
      }),
    {
      ...DEFAULT_OPTIONS,
      ...options,
    }
  );

// Семантические хелперы под ваши сценарии

// Зелёная галочка:
export const toastAuthSuccess = (message = 'Вход выполнен успешно') =>
  showSuccessToast(message);

export const toastContractSuccess = (message = 'Договор успешно оформлен') =>
  showSuccessToast(message);

export const toastPaymentSuccess = (message = 'Оплата прошла успешно') =>
  showSuccessToast(message);

export const toastOrderConfirmed = (message = 'Заказ подтверждён менеджером') =>
  showSuccessToast(message);

// Красный крестик:
export const toastValidationError = (message = 'Пожалуйста, заполните все обязательные поля') =>
  showErrorToast(message);

export const toastTechnicalError = (message = 'Произошла ошибка. Попробуйте позже') =>
  showErrorToast(message);

export const toastOrderDeclined = (message = 'Заказ отклонён') =>
  showErrorToast(message);

// Синяя иконка “i”:
export const toastCourierStatus = (message = 'Курьер в пути') =>
  showInfoToast(message);

export const toastNeedDeliveryTime = (message = 'Пожалуйста, выберите удобное время доставки', options = {}) =>
  showInfoToast(message, { autoClose: 6000, ...options });

export const toastWaitManager = (message = 'Ожидайте подтверждение менеджера') =>
  showInfoToast(message);

export const toastNeedPayment = (message = 'Пожалуйста, завершите оплату на сайте или по СМС') =>
  showInfoToast(message);

// Специальный тост: заявка отправлена, ждите TrustMe и оплату после подписания
export const toastOrderRequestSent = () =>
  showSuccessToast(
    'Готово! 🎉 Заказ успешно создано.\nПодпишите договор в СМС от TrustMe.',
    { autoClose: 4000 }
  );

