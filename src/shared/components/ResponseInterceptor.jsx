import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const queryClient = useQueryClient();
  const sessionStore = useSessionStore();
  const isMountedRef = useRef(false);

  // Создаем функцию для перенаправления
  const redirectToLogin = () => {
    // Сбрасываем данные пользователя в кеше React Query
    queryClient.setQueryData([USER_QUERY_KEY], null);
    
    // Сбрасываем данные пользователя в Zustand хранилище
    sessionStore.updateUserFromCache(null);
    
    // Перенаправляем на страницу входа
    navigate("/login", { replace: true });
  };

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
  }, [navigate, queryClient, sessionStore]);

  // Компонент не рендерит ничего в DOM
  return null;
};

export default ResponseInterceptor; 