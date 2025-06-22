import React, { memo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Мемоизированный компонент загрузки
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Компонент для защиты маршрутов только для USER роли
const UserOnlyRoute = memo(({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();

  if (import.meta.env.DEV) {
    console.log('UserOnlyRoute: Проверка доступа для USER роли:', {
      path: location.pathname,
      isAuthenticated,
      isLoading,
      userRole: user?.role,
      hasUser: !!user
    });
  }

  // Показываем загрузку, пока проверяем статус аутентификации
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    if (import.meta.env.DEV) {
      console.log('UserOnlyRoute: Пользователь не авторизован, перенаправляем на /login');
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Если авторизован, но роль не USER, перенаправляем в личный кабинет
  if (user?.role && user.role !== 'USER') {
    if (import.meta.env.DEV) {
      console.log(`UserOnlyRoute: Доступ запрещен для роли ${user.role}, перенаправляем на /personal-account`);
    }
    return <Navigate to="/personal-account" replace />;
  }

  // Если пользователь авторизован и имеет роль USER, отображаем контент
  return children;
});

UserOnlyRoute.displayName = 'UserOnlyRoute';

export default UserOnlyRoute; 