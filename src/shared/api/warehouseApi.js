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

  // Получение склада по ID с боксами
  getWarehouseById: async (warehouseId) => {
    try {
      console.log(`Отправка запроса на получение склада ${warehouseId}`);
      const response = await api.get(`/warehouses/${warehouseId}`);
      console.log('Склад загружен:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке склада:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление данных склада
  updateWarehouse: async (warehouseId, warehouseData) => {
    try {
      console.log(`Отправка запроса на обновление склада ${warehouseId}:`, warehouseData);
      const response = await api.put(`/warehouses/${warehouseId}`, warehouseData);
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