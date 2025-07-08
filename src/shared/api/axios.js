import axios from 'axios';

// Используем прокси URL для локальной разработки
const isDevelopment = import.meta.env.DEV;
const API_URL = isDevelopment ? '/api' : 'https://extraspace-backend.onrender.com';

export const api = axios.create({
  baseURL: API_URL,
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
    
    // Обработка 401 ошибки (Unauthorized)
    if (error.response && error.response.status === 401) {
      // Проверяем, не связан ли запрос с авторизацией
      const isAuthEndpoint = error.config.url && (
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register') ||
        error.config.url.includes('/auth/google')
      );
      
      // Не перенаправляем, если это запрос на авторизацию
      if (!isAuthEndpoint && !redirectInProgress) {
        // Проверяем, находимся ли мы уже на странице логина
        const isLoginPage = window.location.pathname.includes('/login');
        
        // Если у нас есть функция перенаправления и мы не на странице входа
        if (navigateToLogin && !isLoginPage) {
          if (isDevelopment) {
          console.log('[Auth] Перенаправление на страницу входа из-за 401 ошибки');
          }
          
          // Устанавливаем флаг, чтобы избежать множественных перенаправлений
          redirectInProgress = true;
          
          // Очистка куки и состояния авторизации
          document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          
          // Перенаправление на страницу входа
          navigateToLogin();
          
          // Сбрасываем флаг перенаправления через задержку
          setTimeout(() => {
            redirectInProgress = false;
          }, 500);
          
          // Возвращаем новый rejected promise для предотвращения дальнейшего выполнения
          return Promise.reject(new Error('Session expired'));
        }
      }
    } 
    else if (error.response) {
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
  const baseUrl = isDevelopment ? window.location.origin + '/api' : API_URL;
  
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