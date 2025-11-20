import api from './axios';

const isDevelopment = import.meta.env.DEV;

export const statisticsApi = {
  // Получение сводной статистики
  getSummary: async (filters = {}) => {
    try {
      if (isDevelopment) {
        console.log('StatisticsAPI: Отправка запроса на получение сводной статистики', filters);
        console.log('StatisticsAPI: warehouse value:', filters.warehouse, 'type:', typeof filters.warehouse);
      }
      const response = await api.get('/statistics/summary', { 
        params: filters,
        paramsSerializer: (params) => {
          // Явно сериализуем параметры для правильной обработки кириллицы
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
              searchParams.append(key, params[key]);
            }
          });
          return searchParams.toString();
        }
      });
      if (isDevelopment) {
        console.log('StatisticsAPI: Получена сводная статистика:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('StatisticsAPI: Ошибка при получении сводной статистики:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение данных для графика динамики
  getLineChartData: async (filters = {}) => {
    try {
      if (isDevelopment) {
        console.log('StatisticsAPI: Отправка запроса на получение данных графика', filters);
      }
      const response = await api.get('/statistics/line-chart', { 
        params: filters,
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
              searchParams.append(key, params[key]);
            }
          });
          return searchParams.toString();
        }
      });
      if (isDevelopment) {
        console.log('StatisticsAPI: Получены данные графика:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('StatisticsAPI: Ошибка при получении данных графика:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение источников лидов
  getLeadSources: async (filters = {}) => {
    try {
      if (isDevelopment) {
        console.log('StatisticsAPI: Отправка запроса на получение источников лидов', filters);
      }
      const response = await api.get('/statistics/lead-sources', { params: filters });
      if (isDevelopment) {
        console.log('StatisticsAPI: Получены источники лидов:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('StatisticsAPI: Ошибка при получении источников лидов:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение причин отмен
  getCancelReasons: async (filters = {}) => {
    try {
      if (isDevelopment) {
        console.log('StatisticsAPI: Отправка запроса на получение причин отмен', filters);
      }
      const response = await api.get('/statistics/cancel-reasons', {
        params: filters,
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach((key) => {
            if (params[key] !== undefined && params[key] !== null) {
              searchParams.append(key, params[key]);
            }
          });
          return searchParams.toString();
        },
      });
      if (isDevelopment) {
        console.log('StatisticsAPI: Получены причины отмен:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('StatisticsAPI: Ошибка при получении причин отмен:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение списка заявок
  getRequests: async (filters = {}, page = 1, limit = 50) => {
    try {
      if (isDevelopment) {
        console.log('StatisticsAPI: Отправка запроса на получение заявок', { filters, page, limit });
      }
      const response = await api.get('/statistics/requests', {
        params: { ...filters, page, limit },
        paramsSerializer: (params) => {
          const searchParams = new URLSearchParams();
          Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== null) {
              searchParams.append(key, params[key]);
            }
          });
          return searchParams.toString();
        }
      });
      if (isDevelopment) {
        console.log('StatisticsAPI: Получены заявки:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('StatisticsAPI: Ошибка при получении заявок:', error.response?.data || error.message);
      throw error;
    }
  },

  // Получение логов действий
  getActionLogs: async (filters = {}, page = 1, limit = 50) => {
    try {
      if (isDevelopment) {
        console.log('StatisticsAPI: Отправка запроса на получение логов действий', { filters, page, limit });
      }
      const response = await api.get('/statistics/action-logs', {
        params: { ...filters, page, limit },
      });
      if (isDevelopment) {
        console.log('StatisticsAPI: Получены логи действий:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('StatisticsAPI: Ошибка при получении логов действий:', error.response?.data || error.message);
      throw error;
    }
  },
};

