import api from './axios';
import axios from 'axios';

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
  },

  // Получение контрактов пользователя
  getContracts: async () => {
    try {
      if (isDevelopment) {
        console.log('OrdersAPI: Отправка запроса на получение договоров');
      }
      const response = await api.get('/orders/contracts');
      if (isDevelopment) {
        console.log('OrdersAPI: Получены договоры:', response.data?.length || 0, 'договоров');
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении договоров:', error.response?.data || error.message);
      throw error;
    }
  },

  // Отмена договора
  cancelContract: async (orderId, documentId) => {
    try {
      if (isDevelopment) {
        console.log(`OrdersAPI: Отмена договора для заказа ${orderId} с документом ${documentId}`);
      }
      const response = await api.put(`/orders/${orderId}/cancel`, { document_id: documentId });
      if (isDevelopment) {
        console.log('OrdersAPI: Договор успешно отменен:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при отмене договора:', error.response?.data || error.message);
      throw error;
    }
  },

  // Скачивание файла договора
  downloadContractFile: async (documentId) => {
    try {
      if (isDevelopment) {
        console.log(`OrdersAPI: Запрос на скачивание договора ${documentId}`);
      }
      // Используем axios напрямую, чтобы избежать interceptors и withCredentials из нашего 'api' инстанса
      const response = await axios.get(`https://test.trustme.kz/trust_contract_public_apis/doc/DownloadContractFile/${documentId}`, {
        responseType: 'blob', // Важно для получения файла
      });
      if (isDevelopment) {
        console.log('OrdersAPI: Файл договора успешно получен');
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при скачивании файла договора:', error);
      throw error;
    }
  },
  
  // Продление заказа или отмена продления
  extendOrder: async (data) => {
    try {
      if (isDevelopment) {
        console.log('OrdersAPI: Отправка запроса на продление заказа:', data);
      }
      const response = await api.post('/orders/extend', data);
      if (isDevelopment) {
        console.log('OrdersAPI: Продление заказа успешно обработано:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при обработке продления заказа:', error.response?.data || error.message);
      throw error;
    }
  },

  // Скачивание файла предмета заказа
  downloadItemFile: async (itemId) => {
    try {
      if (isDevelopment) {
        console.log(`OrdersAPI: Запрос на скачивание документа для предмета ${itemId}`);
      }
      // Используем axios напрямую для получения файла
      const response = await axios.get(`https://api.extraspace.kz/moving/download/item/${itemId}`, {
        responseType: 'blob', // Важно для получения файла
      });
      if (isDevelopment) {
        console.log('OrdersAPI: Файл предмета успешно получен');
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при скачивании файла предмета:', error);
      throw error;
    }
  },

  // Получение деталей договора по order_id
  getContractDetails: async (orderId) => {
    try {
      if (isDevelopment) {
        console.log(`OrdersAPI: Запрос деталей договора для заказа ${orderId}`);
      }
      const response = await api.get(`/orders/items/${orderId}`);
      if (isDevelopment) {
        console.log('OrdersAPI: Получены детали договора:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('OrdersAPI: Ошибка при получении деталей договора:', error.response?.data || error.message);
      throw error;
    }
  },
}; 