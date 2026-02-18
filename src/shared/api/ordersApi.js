import api from './axios';
import axios from 'axios';

export const ordersApi = {
  // Получение всех заказов (для MANAGER и ADMIN)
  getAllOrders: async (page = 1) => {
    try {
      const response = await api.get('/orders', { params: { page } });
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении всех заказов:', error.response?.data || error.message);
      throw error;
    }
  },

  // Поиск вещей по фильтрам (ID вещи, имя/фамилия клиента, номер бокса, ID заказа, телефон, email, ИИН)
  searchItems: async (filters = {}, page = 1, pageSize = 50) => {
    try {
      const params = { page, pageSize };
      if (filters.itemId != null && String(filters.itemId).trim() !== '') params.itemId = filters.itemId;
      if (filters.clientName != null && String(filters.clientName).trim() !== '') params.clientName = filters.clientName;
      if (filters.boxNumber != null && String(filters.boxNumber).trim() !== '') params.boxNumber = filters.boxNumber;
      if (filters.orderId != null && String(filters.orderId).trim() !== '') params.orderId = filters.orderId;
      if (filters.phone != null && String(filters.phone).trim() !== '') params.phone = filters.phone;
      if (filters.email != null && String(filters.email).trim() !== '') params.email = filters.email;
      if (filters.iin != null && String(filters.iin).trim() !== '') params.iin = filters.iin;
      const response = await api.get('/order-items/search', { params });
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при поиске вещей:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение статистики заказов (для MANAGER и ADMIN)
  getOrdersStats: async () => {
    try {
      const response = await api.get('/orders/status-counts');
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении статистики заказов:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение заказов текущего пользователя
  getUserOrders: async () => {
    try {
      const response = await api.get('/orders/me');
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении заказов пользователя:', error.response?.data || error.message);
      throw error;
    }
  },

  searchOrders: async (query) => {
    if (!query || query.length < 2) return [];

    try {
      const response = await api.get('/orders/search', { params: { query } });
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error("Ошибка при поиске заказов:", error);
      return [];
    }
  },


  // Удаление заказа (для MANAGER и ADMIN и Пользователей)
  deleteOrder: async (orderId) => {
    try {
      const response = await api.delete(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при удалении заказа:', error.response?.data || error.message);
      throw error;
    }
  },

  // Подтверждение заказа пользователем
  approveOrder: async (orderId) => {
    try {
      const response = await api.patch(`/orders/${orderId}/approve`);
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при подтверждении заказа:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение контрактов пользователя
  getContracts: async () => {
    try {
      const response = await api.get('/orders/contracts');
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении договоров:', error.response?.data || error.message);
      throw error;
    }
  },

  // Отмена договора (для USER с document_id и reason)
  cancelContract: async ({ orderId, documentId, cancelReason, cancelComment, selfPickupDate }) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, {
        document_id: documentId,
        cancel_reason: cancelReason,
        cancel_comment: cancelComment,
        self_pickup_date: selfPickupDate,
      });
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при отмене договора:', error.response?.data || error.message);
      throw error;
    }
  },

  // Расторжение заказа (для USER без document_id, только с reason)
  cancelOrder: async ({ orderId, cancelReason, cancelComment, selfPickupDate }) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, {
        cancel_reason: cancelReason,
        cancel_comment: cancelComment,
        self_pickup_date: selfPickupDate,
      });
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при расторжении заказа:', error.response?.data || error.message);
      throw error;
    }
  },

  // Подтверждение возврата (для ADMIN/MANAGER без параметров)
  approveCancelOrder: async (orderId) => {
    try {
      const response = await api.put(`/orders/${orderId}/cancel`, {});
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при подтверждении возврата:', error.response?.data || error.message);
      throw error;
    }
  },

  // Разблокировка бокса (для ADMIN/MANAGER)
  unlockStorage: async (orderId) => {
    try {
      const response = await api.patch(`/orders/${orderId}/unlock-storage`);
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при разблокировке бокса:', error.response?.data || error.message);
      throw error;
    }
  },

  // Скачивание файла договора
  downloadContractFile: async (documentId) => {
    try {
      // Используем axios напрямую, чтобы избежать interceptors и withCredentials из нашего 'api' инстанса
      const response = await axios.get(`https://test.trustme.kz/trust_contract_public_apis/doc/DownloadContractFile/${documentId}`, {
        responseType: 'blob', // Важно для получения файла
      });
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при скачивании файла договора:', error);
      throw error;
    }
  },
  
  // Продление заказа или отмена продления
  extendOrder: async (data) => {
    try {
      const response = await api.post('/orders/extend', data);
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при обработке продления заказа:', error.response?.data || error.message);
      throw error;
    }
  },

  // Скачивание файла предмета заказа
  downloadItemFile: async (itemId) => {
    try {
      // Используем axios напрямую для получения файла
      const response = await axios.get(`https://api.extraspace.kz/moving/download/item/${itemId}`, {
        responseType: 'blob', // Важно для получения файла
      });
      return {
        blob: response.data,
        contentType: response.headers['content-type'] || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        contentDisposition: response.headers['content-disposition'] || null,
      };
    } catch (error) {
      console.error('OrdersAPI: Ошибка при скачивании файла предмета:', error);
      throw error;
    }
  },

  // Получение деталей договора по order_id
  getContractDetails: async (orderId) => {
    try {
      const response = await api.get(`/orders/items/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении деталей договора:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение всех доставок пользователя
  getUserDeliveries: async () => {
    try {
      const response = await api.get('/moving/me/all');
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении доставок пользователя:', error.response?.data || error.message);
      throw error;
    }
  },

  // Обновление доставки
  updateDelivery: async (movingOrderId, data) => {
    try {
      const response = await api.put(`/moving/${movingOrderId}`, data);
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при обновлении доставки:', error.response?.data || error.message);
      throw error;
    }
  },

  // Подтверждение доставки
  confirmDelivery: async (deliveryId) => {
    try {
      const response = await api.patch(`/moving/confirm/${deliveryId}`);
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при подтверждении доставки:', error.response?.data || error.message);
      throw error;
    }
  },

  // Поиск вещи по ID (для MANAGER и ADMIN)
  searchItemById: async (itemId) => {
    try {
      const response = await api.get(`/orders/item/${itemId}`);
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при поиске вещи:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение заказа со статусом PENDING по storage_id (для MANAGER и ADMIN)
  getPendingOrderByStorageId: async (storageId) => {
    try {
      const response = await api.get(`/orders/storage/${storageId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // Заказ не найден - это нормально
      }
      console.error('OrdersAPI: Ошибка при получении заказа PENDING:', error.response?.data || error.message);
      throw error;
    }
  },
}; 