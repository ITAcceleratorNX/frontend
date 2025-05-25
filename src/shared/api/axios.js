import axios from 'axios';
import Cookies from 'js-cookie';

// Используем прокси URL для локальной разработки
const isDevelopment = import.meta.env.DEV;
const API_URL = isDevelopment ? '/api' : 'https://extraspace-backend.onrender.com';

// Флаг для отслеживания запроса на обновление токена
let isRefreshing = false;
// Очередь запросов, ожидающих обновления токена
let failedQueue = [];

// Функция для обработки очереди запросов
const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // CORS настройки - включаем передачу cookies
  withCredentials: true,
  // Устанавливаем таймаут для запросов
  timeout: 15000,
});

// Логирование запросов
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
    
    // Добавляем XSRF-TOKEN если он есть в cookies
    const xsrfToken = Cookies.get('XSRF-TOKEN');
    if (xsrfToken) {
      config.headers['X-XSRF-TOKEN'] = xsrfToken;
    }
    
    return config;
  },
  (error) => {
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Логирование и обработка ответов
api.interceptors.response.use(
  (response) => {
    console.log(`[API Response] ${response.status} от ${response.config.url}:`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    console.error('[API Response Error]', error);
    
    // Проверяем, является ли ошибка 401 (Unauthorized)
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      console.log(`[API Error] Статус ${error.response.status}:`, {
        data: error.response.data,
        headers: error.response.headers,
      });
      
      // Если уже идет запрос на обновление токена, добавляем текущий запрос в очередь
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      // Если пользователь не авторизован для API с 401, логируем это
      if (error.response?.status === 401) {
        console.log('Пользователь не авторизован:', error.response.status);
        
        try {
          // Попытка получить новый токен или выполнить повторную авторизацию
          // Например, можно попробовать запрос на refresh token
          // const response = await api.post('/auth/refresh-token');
          
          // Если нет механизма обновления токена - не делаем ничего,
          // AuthInterceptor компонент уже обработает 401 ошибку
          
          // Обработка очереди запросов
          processQueue(null, null);
          return Promise.reject(error);
        } catch (refreshError) {
          // В случае ошибки при обновлении токена
          // AuthInterceptor компонент обработает 401 ошибку
          
          // Обработка очереди запросов с ошибкой
          processQueue(refreshError, null);
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }
    } else if (error.response) {
      // Сервер вернул ответ со статус-кодом, отличным от 2xx
      console.log(`[API Error] Статус ${error.response.status}:`, {
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.log('[API Error] Нет ответа:', error.request);
    } else {
      // Что-то пошло не так при настройке запроса
      console.log('[API Error] Ошибка запроса:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Функция для создания прямого запроса для отладки проблем с axios
export const makeDirectRequest = async (url, method = 'GET', data) => {
  const baseUrl = isDevelopment ? window.location.origin + '/api' : API_URL;
  
  try {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Включаем передачу cookies
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    const responseData = await response.json();
    console.log(`[Direct Fetch] ${response.status} от ${url}:`, responseData);
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error('[Direct Fetch Error]', error);
    throw error;
  }
};

export default api; 