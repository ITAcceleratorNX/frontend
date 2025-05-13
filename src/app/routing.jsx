import { useEffect } from 'react';
import { Navigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';

import HomePage from '../pages/home';
import EmailVerificationPage from '../pages/email-verification';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import MovingPage from '../pages/moving';
import TariffsPage from '../pages/tariffs';

import PersonalAccountPage from '../pages/personal-account';


// Компонент для логирования изменений маршрута (для отладки)
const RouteLogger = ({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    console.log('Routing: Текущий маршрут:', location.pathname);
    console.log('Routing: State данные:', location.state);
    console.log('Routing: Query параметры:', new URLSearchParams(location.search).toString());
  }, [location]);
  
  return <>{children}</>;
};

// Компонент для защищенных маршрутов
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  useEffect(() => {
    console.log('ProtectedRoute: Проверка авторизации:', {
      isAuthenticated,
      isLoading
    });
  }, [isAuthenticated, isLoading]);
  
  // Показываем загрузку, пока проверяем статус аутентификации
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
    </div>;
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
  if (!isAuthenticated) {
    console.log('ProtectedRoute: Пользователь не авторизован, перенаправляем на /login');
    return <Navigate to="/login" replace />;
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
        <Route path="/tariffs" element={<PublicRoute><TariffsPage /></PublicRoute>} />
        {/* Защищенные маршруты */}
      
        <Route path="/personal-account" element={<ProtectedRoute><PersonalAccountPage /></ProtectedRoute>} />
        
        
        {/* Редирект для несуществующих маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouteLogger>
  );
};

export default Routing; 