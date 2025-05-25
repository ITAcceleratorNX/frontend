import React, { useEffect, memo, useCallback, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LoginForm } from '../../features/auth';
import { useAuth } from '../../shared/context/AuthContext';
import api from '../../shared/api/axios';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../shared/lib/hooks/use-user-query';

// Мемоизированный компонент страницы входа с улучшенной обработкой Google OAuth
const LoginPage = memo(() => {
  const location = useLocation();
  const navigate = useNavigate();
  const { refetchUser, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isOAuthProcessing, setIsOAuthProcessing] = useState(false);
  const [isLoginComplete, setIsLoginComplete] = useState(false);

  // Мемоизированная функция для обработки Google OAuth
  const completeGoogleAuth = useCallback(async (code) => {
    // Предотвращаем повторный запрос, если уже в процессе авторизации
    if (isOAuthProcessing) return;
    
    try {
      setIsOAuthProcessing(true);
      
      if (import.meta.env.DEV) {
        console.log('Вход через Google: обработка кода авторизации');
      }
      
      // Запрос к серверу для завершения аутентификации
      await api.get(`/auth/google/callback?code=${code}`);
      
      // Инвалидируем кеш пользователя и отмечаем логин как завершенный
      queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
      setIsLoginComplete(true);
      
      // Запрашиваем данные пользователя заново - но не сразу
      setTimeout(() => {
        refetchUser();
      }, 500);
      
      if (import.meta.env.DEV) {
        console.log('Успешная авторизация через Google');
      }
      
      // После успешного входа перенаправляем на главную страницу или на запрошенную страницу
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (error) {
      console.error('Ошибка при завершении авторизации через Google:', error);
    } finally {
      setIsOAuthProcessing(false);
    }
  }, [location.state, navigate, queryClient, refetchUser, isOAuthProcessing]);

  // Перенаправление если пользователь уже авторизован
  useEffect(() => {
    if (!isLoading && isAuthenticated && !isLoginComplete) {
      if (import.meta.env.DEV) {
        console.log('LoginPage: Пользователь уже авторизован, перенаправляем');
      }
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, isLoading, location.state, navigate, isLoginComplete]);
  
  // Обработка авторизации через Google и других данных в URL
  useEffect(() => {
    // Если идет загрузка или уже авторизованы или обрабатывается OAuth - пропускаем обработку URL
    if (isLoading || isAuthenticated || isOAuthProcessing) return;
    
    // Проверяем, есть ли код авторизации Google в URL
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    
    if (code) {
      completeGoogleAuth(code);
    }
  }, [location.search, isAuthenticated, isLoading, completeGoogleAuth, isOAuthProcessing]);
  
  // Функция для обработки успешного логина
  const handleLoginSuccess = useCallback(() => {
    setIsLoginComplete(true);
    // Инвалидируем кеш пользователя
    queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
    
    // Небольшая задержка перед редиректом, чтобы успел обновиться стейт авторизации
    setTimeout(() => {
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    }, 300);
  }, [location.state, navigate, queryClient]);
  
  // Не показываем форму пока идет проверка авторизации
  if (isLoading || isOAuthProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
      </div>
    );
  }
  
  return <LoginForm onLoginSuccess={handleLoginSuccess} />;
});

LoginPage.displayName = 'LoginPage';

export default LoginPage; 