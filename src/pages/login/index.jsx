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
  const [authInProgress, setAuthInProgress] = useState(false);

  // Мемоизированная функция для обработки Google OAuth
  const completeGoogleAuth = useCallback(async (code) => {
    // Предотвращаем повторный запрос, если уже в процессе авторизации
    if (isOAuthProcessing || authInProgress) return;
    
    try {
      setIsOAuthProcessing(true);
      
      if (import.meta.env.DEV) {
        console.log('Вход через Google: обработка кода авторизации');
      }
      
      // Запрос к серверу для завершения аутентификации
      await api.get(`/auth/google/callback?code=${code}`);
      
      // Инвалидируем кеш пользователя и принудительно запрашиваем его заново
      await queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
      
      // Запрашиваем данные пользователя заново
      const userData = await refetchUser();
      
      if (import.meta.env.DEV) {
        console.log('Успешная авторизация через Google, получены данные:', userData?.data ? 'Да' : 'Нет');
      }
      
      // Небольшая задержка перед перенаправлением
      setTimeout(() => {
        // После успешного входа перенаправляем на главную страницу или на запрошенную страницу
        const from = location.state?.from;
        
        // Учитываем потенциальную вложенность объекта from
        const redirectPath = from?.pathname || 
                           (typeof from === 'string' ? from : '/');
        
        // Предотвращаем перенаправление на некорректный URL
        const targetPath = redirectPath.startsWith('http') || redirectPath === '/login' 
                         ? '/' 
                         : redirectPath;
        
        navigate(targetPath, { replace: true });
      }, 300);
    } catch (error) {
      console.error('Ошибка при завершении авторизации через Google:', error);
    } finally {
      setIsOAuthProcessing(false);
    }
  }, [location.state, navigate, queryClient, refetchUser, isOAuthProcessing, authInProgress]);

  // Перенаправление если пользователь уже авторизован
  useEffect(() => {
    if (authInProgress) return;
    
    if (!isLoading && isAuthenticated) {
      setAuthInProgress(true);
      
      if (import.meta.env.DEV) {
        console.log('LoginPage: Пользователь уже авторизован, перенаправляем');
      }
      
      // Получаем целевой маршрут для перенаправления
      const from = location.state?.from;
      
      // Учитываем потенциальную вложенность объекта from
      const redirectPath = from?.pathname || 
                         (typeof from === 'string' ? from : '/');
      
      // Предотвращаем перенаправление на некорректный URL
      const targetPath = redirectPath.startsWith('http') || redirectPath === '/login' 
                       ? '/' 
                       : redirectPath;
      
      setTimeout(() => {
        navigate(targetPath, { replace: true });
        setAuthInProgress(false);
      }, 100);
    }
  }, [isAuthenticated, isLoading, location.state, navigate, authInProgress]);
  
  // Обработка авторизации через Google и других данных в URL
  useEffect(() => {
    // Если идет загрузка или уже авторизованы или обрабатывается OAuth - пропускаем обработку URL
    if (isLoading || isAuthenticated || isOAuthProcessing || authInProgress) return;
    
    // Проверяем, есть ли код авторизации Google в URL
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    
    if (code) {
      completeGoogleAuth(code);
    }
  }, [location.search, isAuthenticated, isLoading, completeGoogleAuth, isOAuthProcessing, authInProgress]);
  
  // Не показываем форму пока идет проверка авторизации
  if (isLoading || isOAuthProcessing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
      </div>
    );
  }
  
  return <LoginForm />;
});

LoginPage.displayName = 'LoginPage';

export default LoginPage; 