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
  // Устанавливаем таймаут для запросов
  timeout: 15000, // Увеличиваем таймаут для более надежной работы
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
    // В продакшене логируем только ошибки
    if (isDevelopment) {
      console.log(`[API Response] ${response.status} от ${response.config.url}:`, response.data);
    }
    return response;
  },
  (error) => {
    // Всегда логируем ошибки
    console.error('[API Response Error]', error);
    
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
    else if (error.response) {
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