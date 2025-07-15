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
  },

  // Добавление услуги к заказу
  createOrderService: async (orderId, serviceId) => {
    try {
      if (isDevelopment) {
        console.log(`PaymentsAPI: Добавление услуги ${serviceId} к заказу ${orderId}`);
      }
      const response = await api.post('/order-services', { 
        order_id: orderId, 
        service_id: serviceId 
      });
      if (isDevelopment) {
        console.log('PaymentsAPI: Услуга успешно добавлена к заказу:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при добавлении услуги к заказу:', error.response?.data || error.message);
      throw error;
    }
  },

  // Создание заявки на мувинг
  createMoving: async (orderId, movingDate) => {
    try {
      if (isDevelopment) {
        console.log(`PaymentsAPI: Создание заявки на мувинг для заказа ${orderId}`);
      }
      const response = await api.post('/moving', {
        order_id: orderId,
        moving_date: movingDate,
        vehicle_type: "LARGE",
        status: "PENDING_FROM",
        availability: "AVAILABLE"
      });
      if (isDevelopment) {
        console.log('PaymentsAPI: Заявка на мувинг успешно создана:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при создании заявки на мувинг:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение тарифов (включая мувинг)
  getPrices: async () => {
    try {
      if (isDevelopment) {
        console.log('PaymentsAPI: Получение тарифов');
      }
      const response = await api.get('/prices');
      if (isDevelopment) {
        console.log('PaymentsAPI: Тарифы получены:', response.data?.length || 0, 'записей');
      }
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при получении тарифов:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение PDF-чека для оплаченного платежа
  getPaymentReceipt: async (orderPaymentId) => {
    try {
      if (isDevelopment) {
        console.log(`PaymentsAPI: Получение PDF-чека для order_payment_id ${orderPaymentId}`);
      }
      const response = await api.get(`/payments/${orderPaymentId}/receipt`, {
        responseType: 'blob', // Важно для получения файла
      });
      if (isDevelopment) {
        console.log('PaymentsAPI: PDF-чек успешно получен');
      }
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при получении PDF-чека:', error.response?.data || error.message);
      throw error;
    }
  }
}; 