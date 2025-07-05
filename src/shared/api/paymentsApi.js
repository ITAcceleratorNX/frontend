import api from './axios';

const isDevelopment = import.meta.env.DEV;

export const paymentsApi = {
  // Создание оплаты по заказу
  createPayment: async (orderId) => {
    try {
      if (isDevelopment) {
        console.log(`PaymentsAPI: Создание оплаты для заказа ${orderId}`);
      }
      const response = await api.post('/payments', { order_id: orderId });
      if (isDevelopment) {
        console.log('PaymentsAPI: Оплата успешно создана:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при создании оплаты:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение всех оплат текущего пользователя
  getUserPayments: async () => {
    try {
      if (isDevelopment) {
        console.log('PaymentsAPI: Отправка запроса на получение оплат пользователя');
      }
      const response = await api.get('/payments/me');
      if (isDevelopment) {
        console.log('PaymentsAPI: Получены оплаты пользователя:', response.data?.length || 0, 'записей');
      }
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при получении оплат пользователя:', error.response?.data || error.message);
      throw error;
    }
  },

  // Создание ручной оплаты
  createManualPayment: async (orderPaymentId) => {
    try {
      if (isDevelopment) {
        console.log(`PaymentsAPI: Создание ручной оплаты для order_payment_id ${orderPaymentId}`);
      }
      const response = await api.post('/payments/manual', { order_payment_id: orderPaymentId });
      if (isDevelopment) {
        console.log('PaymentsAPI: Ручная оплата успешно создана:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при создании ручной оплаты:', error.response?.data || error.message);
      throw error;
    }
  }
}; 