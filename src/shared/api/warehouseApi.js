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

  // Получение конкретного склада по ID
  getWarehouseById: async (id) => {
    try {
      console.log('Отправка запроса на получение склада:', id);
      const response = await api.get(`/warehouses/${id}`);
      console.log('Склад загружен:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке склада:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление склада (для ADMIN и MANAGER)
  updateWarehouse: async (id, warehouseData) => {
    try {
      console.log('Отправка запроса на обновление склада:', id, warehouseData);
      const response = await api.put(`/warehouses/${id}`, warehouseData);
      console.log('Склад успешно обновлен:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении склада:', error.response?.data || error.message);
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