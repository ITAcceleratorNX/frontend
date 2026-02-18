import api from './axios';

export const paymentsApi = {
  // Создание оплаты по заказу
  createPayment: async (orderId) => {
    try {
      const response = await api.post('/payments', { order_id: orderId });
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при создании оплаты:', error.response?.data || error.message);
      throw error;
    }
  },

  // Админ/менеджер: список order_payments с пагинацией и фильтрами
  getAdminPayments: (params) => api.get('/payments/admin', { params }),

  // Админ/менеджер: настройки оплаты (вкл/выкл онлайн-оплаты)
  getPaymentSettings: () => api.get('/payments/settings').then((r) => r.data),
  updatePaymentSettings: (data) => api.patch('/payments/settings', data).then((r) => r.data),

  // Подтверждение ручной оплаты (админ/менеджер)
  confirmManualPayment: (orderPaymentId, body = {}) =>
    api.post(`/payments/${orderPaymentId}/confirm-manual`, body),

  // Получение всех оплат текущего пользователя
  getUserPayments: async () => {
    try {
      const response = await api.get('/payments/me');
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при получении оплат пользователя:', error.response?.data || error.message);
      throw error;
    }
  },

  // Создание оплаты для дополнительной услуги (для активных заказов)
  createAdditionalServicePayment: async (orderId, serviceType) => {
    try {
      const response = await api.post('/payments/additional-service', { 
        order_id: orderId,
        service_type: serviceType
      });
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при создании оплаты дополнительной услуги:', error.response?.data || error.message);
      throw error;
    }
  },

  // Создание ручной оплаты
  createManualPayment: async (orderPaymentId) => {
    try {
      const response = await api.post('/payments/manual', { order_payment_id: orderPaymentId });
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при создании ручной оплаты:', error.response?.data || error.message);
      throw error;
    }
  },

  // Добавление услуги к заказу
  createOrderService: async (orderId, serviceId) => {
    try {
      const response = await api.post('/order-services', { 
        order_id: orderId, 
        service_id: serviceId 
      });
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при добавлении услуги к заказу:', error.response?.data || error.message);
      throw error;
    }
  },

  // Создание заявки на мувинг
  createMoving: async (orderId, movingDate, options = {}) => {
    try {
      const { status = "PENDING", direction = "TO_WAREHOUSE", address = null } = options;
      const response = await api.post('/moving', {
        order_id: orderId,
        moving_date: movingDate,
        vehicle_type: "LARGE",
        status: status,
        direction: direction,
        availability: "AVAILABLE",
        ...(address && { address })
      });
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при создании заявки на мувинг:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение тарифов (включая мувинг)
  getPrices: async () => {
    try {
      const response = await api.get('/prices');
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при получении тарифов:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение PDF-чека для оплаченного платежа
  getPaymentReceipt: async (orderPaymentId) => {
    try {
      const response = await api.get(`/payments/${orderPaymentId}/receipt`, {
        responseType: 'blob', // Важно для получения файла
      });
      return response.data;
    } catch (error) {
      console.error('PaymentsAPI: Ошибка при получении PDF-чека:', error.response?.data || error.message);
      throw error;
    }
  }
}; 