import api from './axios';

export const warehouseApi = {
  // Получение всех складов с боксами
  getAllWarehouses: async () => {
    try {
      const response = await api.get('/warehouses');
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке складов:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение конкретного склада по ID
  getWarehouseById: async (id) => {
    try {
      const response = await api.get(`/warehouses/${id}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке склада:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление склада (для ADMIN и MANAGER)
  updateWarehouse: async (id, warehouseData) => {
    try {
      const response = await api.put(`/warehouses/${id}`, warehouseData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении склада:', error.response?.data || error.message);
      throw error;
    }
  },

  // Создание нового заказа
  createOrder: async (orderData) => {
    try {
      const response = await api.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании заказа:', error.response?.data || error.message);
      throw error;
    }
  },

  // Массовый расчет стоимости для множества сервисов
  calculateBulkPrice: async (data) => {
    try {
      const response = await api.post('/prices/calculate-bulk', data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при массовом расчете цены:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение цен услуг для склада (только для INDIVIDUAL складов)
  getWarehouseServicePrices: async (warehouseId) => {
    try {
      const response = await api.get(`/warehouse-service-prices/warehouse/${warehouseId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке цен склада:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение всех цен услуг из /prices (для CLOUD складов)
  getAllServicePrices: async () => {
    try {
      const response = await api.get('/prices');
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке цен услуг:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление склада (для ADMIN и MANAGER)
  resetStorageInfo: async (storageId) => {
    try {
      const response = await api.patch(`/storages/${storageId}`);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении склада:', error.response?.data || error.message);
      throw error;
    }
  },

  // Массовое обновление цены боксов (INDIVIDUAL) по фильтрам
  bulkUpdateStoragePricePerM2: async (payload) => {
    try {
      const response = await api.post('/storages/bulk/update-price', payload);
      return response.data;
    } catch (error) {
      console.error('Ошибка при массовом обновлении цены боксов:', error.response?.data || error.message);
      throw error;
    }
  },

  getStoragePrices: async (warehouseId) => {
    try {
      const { data } = await api.get("/storages/prices", {
        params: { warehouse_id: warehouseId }
      });
      return data;
    } catch (error) {
      console.error(
          "Ошибка при получении цен для складов:",
          error.response?.data || error.message
      );
      throw error;
    }
  }
}; 