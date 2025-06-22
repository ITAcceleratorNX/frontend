import api from './axios';

export const warehouseApi = {
  // Получение всех складов с боксами
  getAllWarehouses: async () => {
    try {
      console.log('Отправка запроса на получение всех складов');
      const response = await api.get('/warehouses');
      console.log('Склады загружены:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке складов:', error.response?.data || error.message);
      throw error;
    }
  },

  // Создание нового заказа
  createOrder: async (orderData) => {
    try {
      console.log('Отправка запроса на создание заказа:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('Заказ успешно создан:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании заказа:', error.response?.data || error.message);
      throw error;
    }
  }
}; 