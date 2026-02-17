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
  },

  // Массовый расчет стоимости для множества сервисов
  calculateBulkPrice: async (data) => {
    try {
      console.log('Отправка запроса на массовый расчет цены:', data);
      const response = await api.post('/prices/calculate-bulk', data);
      console.log('Массовая цена рассчитана:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при массовом расчете цены:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение цен услуг для склада (только для INDIVIDUAL складов)
  getWarehouseServicePrices: async (warehouseId) => {
    try {
      console.log('Отправка запроса на получение цен склада:', warehouseId);
      const response = await api.get(`/warehouse-service-prices/warehouse/${warehouseId}`);
      console.log('Цены склада загружены:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке цен склада:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение всех цен услуг из /prices (для CLOUD складов)
  getAllServicePrices: async () => {
    try {
      console.log('Отправка запроса на получение всех цен услуг');
      const response = await api.get('/prices');
      console.log('Все цены услуг загружены:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке цен услуг:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление склада (для ADMIN и MANAGER)
  resetStorageInfo: async (storageId) => {
    try {
      console.log('Отправка запроса на восстановления склада:', storageId);
      const response = await api.patch(`/storages/${storageId}`);
      console.log('Склад успешно обновлен:', response.data);
      return response.data;
    } catch (error) {
      console.error('Ошибка при обновлении склада:', error.response?.data || error.message);
      throw error;
    }
  },

  // Массовое обновление цены боксов (INDIVIDUAL) по фильтрам
  bulkUpdateStoragePricePerM2: async (payload) => {
    try {
      console.log('Отправка запроса на массовое обновление цены боксов:', payload);
      const response = await api.post('/storages/bulk/update-price', payload);
      console.log('Цены боксов успешно обновлены:', response.data);
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