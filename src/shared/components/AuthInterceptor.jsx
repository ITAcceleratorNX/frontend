import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useSessionStore } from '../../entities/session';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../lib/hooks/use-user-query';

/**
 * Компонент для перехвата и обработки ошибок авторизации (401)
 * Устанавливает глобальный обработчик для перенаправления на страницу логина при истечении сессии
 */
export const AuthInterceptor = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const sessionStore = useSessionStore();
  
  // Используем useRef для хранения id интерцептора, чтобы потом его удалить
  const interceptorId = useRef(null);
  
  useEffect(() => {
    // Добавляем интерцептор ответов для обработки 401 ошибок
    interceptorId.current = api.interceptors.response.use(
      (response) => response, // Успешные ответы просто пропускаем
      (error) => {
        // Проверяем, что это ошибка 401 (Unauthorized)
        if (error?.response?.status === 401) {
          if (import.meta.env.DEV) {
            console.log('AuthInterceptor: Перехвачена 401 ошибка, сессия истекла');
          }
          
          // Очищаем данные пользователя в хранилище
          sessionStore.updateUserFromCache(null);
          
          // Инвалидируем кеш пользователя
          queryClient.setQueryData([USER_QUERY_KEY], null);
          
          // Перенаправляем на страницу логина, если пользователь не на ней
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register') {
            navigate('/login', { 
              replace: true,
              state: { from: { pathname: currentPath } } 
            });
          }
        }
        
        // Возвращаем ошибку для дальнейшей обработки
        return Promise.reject(error);
      }
    );
    
    // При размонтировании компонента удаляем интерцептор
    return () => {
      if (interceptorId.current !== null) {
        api.interceptors.response.eject(interceptorId.current);
      }
    };
  }, [navigate, queryClient, sessionStore]);
  
  // Компонент не рендерит UI
  return null;
};

export default AuthInterceptor; 