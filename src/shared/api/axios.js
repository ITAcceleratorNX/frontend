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
  // Увеличиваем таймаут для более надежной работы с медленными серверами
  timeout: 30000, // 30 секунд для медленных серверов
});

// Глобальная переменная для хранения ссылки на функцию перенаправления
// Будет инициализирована в ResponseInterceptor компоненте
let navigateToLogin = null;

// Флаг для отслеживания текущего состояния перенаправления
let redirectInProgress = false;

// Флаг для отслеживания состояния сервера
let serverUnavailable = false;

// Метод для установки функции перенаправления
export const setAuthNavigator = (navigateFunction) => {
  navigateToLogin = navigateFunction;
};

// Функция для проверки доступности сервера
const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_URL}/health`, {
      method: 'GET',
      timeout: 5000,
    });
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Логирование запросов
api.interceptors.request.use(
  (config) => {
    // В продакшене логируем только ошибки
    if (isDevelopment) {
      console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, config.data);
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
    // Сервер отвечает - сбрасываем флаг недоступности
    if (serverUnavailable) {
      serverUnavailable = false;
      console.log('[API] Сервер снова доступен');
    }
    
    // В продакшене логируем только ошибки
    if (isDevelopment) {
      console.log(`[API Response] ${response.status} от ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Всегда логируем ошибки
    console.error('[API Response Error]', error);
    
    // Обработка различных типов ошибок
    if (error.code === 'ECONNABORTED') {
      // Таймаут
      console.error('[API] Таймаут запроса:', error.config?.url);
      serverUnavailable = true;
      
      // Создаем более информативную ошибку
      const timeoutError = new Error('Сервер не отвечает. Проверьте подключение к интернету.');
      timeoutError.code = 'TIMEOUT';
      timeoutError.originalError = error;
      return Promise.reject(timeoutError);
    }
    
    if (error.code === 'ERR_NETWORK') {
      // Сетевая ошибка
      console.error('[API] Сетевая ошибка:', error.config?.url);
      serverUnavailable = true;
      
      const networkError = new Error('Нет подключения к серверу. Проверьте интернет-соединение.');
      networkError.code = 'NETWORK_ERROR';
      networkError.originalError = error;
      return Promise.reject(networkError);
    }
    
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
          console.log('[Auth] Перенаправление на страницу входа из-за 401 ошибки');
          
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
    else if (error.response && error.response.status >= 500) {
      // Ошибки сервера (5xx)
      console.error(`[API] Ошибка сервера ${error.response.status}:`, error.response.data);
      serverUnavailable = true;
      
      const serverError = new Error(`Ошибка сервера (${error.response.status}). Попробуйте позже.`);
      serverError.code = 'SERVER_ERROR';
      serverError.status = error.response.status;
      serverError.originalError = error;
      return Promise.reject(serverError);
    }
    else if (error.response && error.response.status === 404) {
      // Ресурс не найден
      console.error('[API] Ресурс не найден:', error.config?.url);
      
      const notFoundError = new Error('Запрашиваемый ресурс не найден.');
      notFoundError.code = 'NOT_FOUND';
      notFoundError.originalError = error;
      return Promise.reject(notFoundError);
    }
    else if (error.response) {
      // Сервер вернул ответ со статус-кодом, отличным от 2xx
      console.log(`[API Error] Статус ${error.response.status}:`, {
        data: error.response.data,
        headers: error.response.headers,
      });
    } else if (error.request) {
      // Запрос был сделан, но ответ не получен
      console.log('[API Error] Нет ответа:', error.request);
      serverUnavailable = true;
      
      const noResponseError = new Error('Сервер не отвечает. Проверьте подключение к интернету.');
      noResponseError.code = 'NO_RESPONSE';
      noResponseError.originalError = error;
      return Promise.reject(noResponseError);
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
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    const response = await fetch(`${baseUrl}${url}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Включаем передачу cookies
      credentials: 'include',
      body: data ? JSON.stringify(data) : undefined,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    const responseData = await response.json();
    console.log(`[Direct Fetch] ${response.status} от ${url}:`, responseData);
    return { status: response.status, data: responseData };
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[Direct Fetch] Таймаут запроса');
      throw new Error('Таймаут запроса');
    }
    console.error('[Direct Fetch Error]', error);
    throw error;
  }
};

// Функция для проверки состояния сервера
export const getServerStatus = () => ({
  isUnavailable: serverUnavailable,
  lastCheck: new Date().toISOString()
});

// Функция для сброса состояния сервера
export const resetServerStatus = () => {
  serverUnavailable = false;
};

export default api; 