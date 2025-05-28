import { useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { setAuthNavigator } from "../api/axios";
import { useQueryClient } from "@tanstack/react-query";
import { USER_QUERY_KEY } from "../lib/hooks/use-user-query";
import { useSessionStore } from "../../entities/session";

/**
 * Компонент для глобальной обработки 401 ошибок и автоматического перенаправления
 * на страницу входа при истечении сессии
 */
export const ResponseInterceptor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const sessionStore = useSessionStore();
  const isMountedRef = useRef(false);
  const redirectInProgressRef = useRef(false);

  // Мемоизированная функция для перенаправления
  const redirectToLogin = useCallback(() => {
    // Предотвращаем множественные редиректы
    if (redirectInProgressRef.current) return;
    if (location.pathname.includes('/login')) return;
    
    // Устанавливаем флаг перенаправления
    redirectInProgressRef.current = true;
    
    if (import.meta.env.DEV) {
      console.log("[Auth] ResponseInterceptor: Перенаправление на страницу входа");
    }
    
    // Сбрасываем данные пользователя в кеше React Query
    queryClient.setQueryData([USER_QUERY_KEY], null);
    
    // Сбрасываем данные пользователя в Zustand хранилище
    sessionStore.updateUserFromCache(null);
    
    // Перенаправляем на страницу входа с сохранением пути, откуда пришел пользователь
    navigate("/login", { 
      replace: true,
      state: { from: location.pathname !== '/login' ? location : '/' } 
    });
    
    // Сбрасываем флаг перенаправления через небольшую задержку
    setTimeout(() => {
      redirectInProgressRef.current = false;
    }, 300);
  }, [navigate, queryClient, sessionStore, location]);

  // При монтировании устанавливаем функцию перенаправления
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      
      // Устанавливаем нашу функцию редиректа в модуле axios
      setAuthNavigator(() => redirectToLogin);
      
      if (import.meta.env.DEV) {
        console.log("[Auth] ResponseInterceptor установлен");
      }
    }
    
    // При размонтировании компонента сбрасываем функцию
    return () => {
      if (import.meta.env.DEV) {
        console.log("[Auth] ResponseInterceptor удален");
      }
      setAuthNavigator(null);
    };
  }, [redirectToLogin]);

  // Компонент не рендерит ничего в DOM
  return null;
};

export default ResponseInterceptor; 