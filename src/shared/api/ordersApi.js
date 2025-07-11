import api from './axios';

const isDevelopment = import.meta.env.DEV;

export const ordersApi = {
  // Получение всех заказов (для MANAGER и ADMIN)
  getAllOrders: async () => {
    try {
      if (isDevelopment) {
        console.log('OrdersAPI: Отправка запроса на получение всех заказов');
      }
      const response = await api.get('/orders');
      if (isDevelopment) {
        console.log('OrdersAPI: Получены все заказы:', response.data?.length || 0, 'заказов');
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении всех заказов:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение заказов текущего пользователя
  getUserOrders: async () => {
    try {
      if (isDevelopment) {
        console.log('OrdersAPI: Отправка запроса на получение заказов пользователя');
      }
      const response = await api.get('/orders/me');
      if (isDevelopment) {
        console.log('OrdersAPI: Получены заказы пользователя:', response.data?.length || 0, 'заказов');
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении заказов пользователя:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление статуса заказа (для MANAGER и ADMIN)
  updateOrderStatus: async (orderId, status) => {
    try {
      if (isDevelopment) {
        console.log(`OrdersAPI: Обновление статуса заказа ${orderId} на ${status}`);
      }
      const response = await api.put(`/orders/${orderId}/status`, { status });
      if (isDevelopment) {
        console.log('OrdersAPI: Статус заказа успешно обновлен:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при обновлении статуса заказа:', error.response?.data || error.message);
      throw error;
    }
  },

  // Расширенное обновление заказа с услугами и moving_orders (для MANAGER и ADMIN)
  updateOrderWithServices: async (orderId, orderData) => {
    try {
      if (isDevelopment) {
        console.log(`OrdersAPI: Расширенное обновление заказа ${orderId}:`, orderData);
      }
      const response = await api.put(`/orders/${orderId}/status`, orderData);
      if (isDevelopment) {
        console.log('OrdersAPI: Заказ успешно обновлен с услугами:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при расширенном обновлении заказа:', error.response?.data || error.message);
      throw error;
    }
  },

  // Удаление заказа (для MANAGER и ADMIN)
  deleteOrder: async (orderId) => {
    try {
      if (isDevelopment) {
        console.log(`OrdersAPI: Удаление заказа ${orderId}`);
      }
      const response = await api.delete(`/orders/${orderId}`);
      if (isDevelopment) {
        console.log('OrdersAPI: Заказ успешно удален');
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при удалении заказа:', error.response?.data || error.message);
      throw error;
    }
  }
}; 