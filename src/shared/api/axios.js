import axios from 'axios';
import { API_BASE_URL } from '../config/api.js';

const isDevelopment = import.meta.env.DEV;

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // CORS настройки - включаем передачу cookies
  withCredentials: true,
  // Увеличиваем таймаут для медленного сервера на Render
  timeout: 45000, // 45 секунд для холодного старта
});

// Глобальная переменная для хранения ссылки на функцию перенаправления
// Будет инициализирована в ResponseInterceptor компоненте
let navigateToLogin = null;

// Флаг для отслеживания текущего состояния перенаправления
let redirectInProgress = false;

// Метод для установки функции перенаправления
export const setAuthNavigator = (navigateFunction) => {
  navigateToLogin = navigateFunction;
};

// Логирование запросов
api.interceptors.request.use(
  (config) => {
    // Логируем только в режиме разработки
    if (isDevelopment) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    // Ошибки запросов логируем всегда
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Логирование и обработка ответов
api.interceptors.response.use(
  (response) => {
    // Логируем только в режиме разработки
    if (isDevelopment) {
      console.log(`[API Response] ${response.status} от ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    // Критичные ошибки логируем всегда
    console.error('[API Response Error]', error.response?.status, error.response?.data || error.message);

    const status = error.response?.status;
    const isAuthEndpoint = error.config?.url && (
      error.config.url.includes('/auth/login') ||
      error.config.url.includes('/auth/register') ||
      error.config.url.includes('/auth/google')
    );

    // Обработка 401 (Unauthorized) и 403 (Forbidden) — сессия истекла или нет доступа
    if (error.response && (status === 401 || status === 403) && !isAuthEndpoint && !redirectInProgress) {
      const isLoginPage = window.location.pathname.includes('/login');

      if (navigateToLogin && !isLoginPage) {
        if (isDevelopment) {
          console.log(`[Auth] Перенаправление на страницу входа из-за ${status} ошибки`);
        }

        redirectInProgress = true;

        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        navigateToLogin();

        setTimeout(() => {
          redirectInProgress = false;
        }, 500);

        const message = status === 401 ? 'Сессия истекла. Войдите снова.' : 'Нет доступа. Войдите снова.';
        return Promise.reject(new Error(message));
      }
    }

    // Добавляем понятное сообщение для отображения в UI
    if (error.response && !error.userMessage) {
      if (status === 401) {
        error.userMessage = 'Сессия истекла. Войдите снова.';
      } else if (status === 403) {
        error.userMessage = 'Недостаточно прав для этого действия.';
      } else if (status >= 500) {
        error.userMessage = 'Ошибка сервера. Попробуйте позже.';
      }
    }
    
    if (error.response) {
      // Детали других ошибок логируем только в режиме разработки
      if (isDevelopment) {
      console.log(`[API Error] Статус ${error.response.status}:`, {
        data: error.response.data,
        headers: error.response.headers,
      });
      }
    } else if (error.request) {
      // Сетевые ошибки логируем всегда
      console.log('[API Error] Нет ответа:', error.request);
    } else {
      // Другие ошибки логируем всегда
      console.log('[API Error] Ошибка запроса:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Функция для создания прямого запроса для отладки проблем с axios
export const makeDirectRequest = async (url, method = 'GET', data) => {
  const baseUrl = isDevelopment ? window.location.origin + '/api' : API_BASE_URL;
  
  try {
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      // Включаем передачу cookies
      credentials: 'include',
      mode: 'cors',
      body: data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseData = await response.json();
    if (isDevelopment) {
    console.log(`[Direct Fetch] ${response.status} от ${url}:`, responseData);
    }
    return { status: response.status, data: responseData };
  } catch (error) {
    console.error('[Direct Fetch Error]', error);
    throw error;
  }
};

// API для получения завершённых заказов с пагинацией
export const getDeliveredOrdersPaginated = async (page = 1, limit = 10) => {
  try {
    if (isDevelopment) {
      console.log(`[API] Запрос завершённых заказов: page=${page}, limit=${limit}`);
    }
    const response = await api.get(`/moving/orders/delivered?page=${page}&limit=${limit}`);
    if (isDevelopment) {
      console.log('[API] Завершённые заказы получены:', response.data);
    }
    return response.data;
  } catch (error) {
    console.error('[API] Ошибка при получении завершённых заказов:', error);
    throw error;
  }
};

export default api; 