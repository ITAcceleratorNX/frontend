import { useEffect } from 'react';
import { Navigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../shared/lib/hooks/use-auth';

import HomePage from '../pages/home';
import EmailVerificationPage from '../pages/email-verification';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import MovingPage from '../pages/moving';

// Компонент для логирования изменений маршрута (для отладки)
const RouteLogger = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Текущий маршрут:', location.pathname);
    console.log('State данные:', location.state);
    console.log('Query параметры:', new URLSearchParams(location.search).toString());
  }, [location]);
  
  return <>{children}</>;
};

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Показываем загрузку, пока проверяем статус аутентификации
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
    </div>;
  }
  
  // Если пользователь не авторизован, перенаправляем на проверку email
  if (!isAuthenticated) {
    console.log('Пользователь не авторизован, перенаправляем на /email-verification');
    return <Navigate to="/email-verification" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для публичных маршрутов (гарантирует, что публичные маршруты всегда доступны)
const PublicRoute = ({ children }) => {
  return <>{children}</>;
};

const Routing = () => {
  console.log('Рендеринг компонента Routing');
  
  return (
    <RouteLogger>
      <Routes>
        {/* Публичные маршруты */}
        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
        <Route path="/email-verification" element={<PublicRoute><EmailVerificationPage /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
        <Route path="/moving" element={<PublicRoute><MovingPage /></PublicRoute>} />
        
        {/* Защищенные маршруты (могут быть добавлены позже) */}
        <Route path="/profile" element={<ProtectedRoute><div>Профиль пользователя</div></ProtectedRoute>} />
        <Route path="/my-storage" element={<ProtectedRoute><div>Мои хранилища</div></ProtectedRoute>} />
        
        {/* Редирект для несуществующих маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouteLogger>
  );
};

export default Routing; 