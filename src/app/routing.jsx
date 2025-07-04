import { useCallback, useEffect, memo, useMemo } from 'react';
import { Navigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import UserOnlyRoute from '../shared/routes/UserOnlyRoute';

import HomePage from '../pages/home';
import EmailVerificationPage from '../pages/email-verification';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import RestorePasswordPage from '../pages/restore-password';
import MovingPage from '../pages/moving';
import TariffsPage from '../pages/tariffs';
import ChatPage from '../pages/chat';
import AboutWarehouseRentalPage from '../pages/about-warehouse-rental';
import CloudStoragePage from '../pages/CloudStorage';
import OnlinePaymentPage from '../pages/online-payment';
import OfferPage from '../pages/offer';
import PrivacyPolicyPage from '../pages/privacy-policy';

import PersonalAccountPage from '../pages/personal-account';
import WarehouseOrderPage from '../pages/warehouse-order';
import AdminUsersProfile from '../pages/personal-account/ui/AdminUsersProfile';
import ManagerUsersProfile from '../pages/personal-account/ui/ManagerUsersProfile';
import AdminWarehouseData from '../pages/personal-account/ui/AdminWarehouseData';
import ManagerWarehouseData from '../pages/personal-account/ui/ManagerWarehouseData';
import AdminMovingOrder from '../pages/personal-account/ui/AdminMovingOrder';
import ManagerMovingOrder from '../pages/personal-account/ui/ManagerMovingOrder';
import CourierRequest from '../pages/personal-account/ui/CourierRequest';
import CourierRequestOrder from '../pages/personal-account/ui/CourierRequestOrder';

// Мемоизированный компонент для логирования маршрутов - только в режиме разработки
const RouteLogger = memo(({ children }) => {
  const location = useLocation();
  
  useEffect(() => {
    if (import.meta.env.DEV) {
    console.log('Routing: Текущий маршрут:', location.pathname);
    }
  }, [location.pathname]);
  
  return children;
});

RouteLogger.displayName = 'RouteLogger';

// Мемоизированный компонент загрузки
const LoadingSpinner = memo(() => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#1e2c4f]"></div>
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Мемоизированный компонент для защищенных маршрутов с оптимизацией проверок
const ProtectedRoute = memo(({ children }) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  
  // Мемоизируем результат редиректа для предотвращения повторных вычислений
  const authResult = useMemo(() => {
    // Оптимизированная проверка авторизации - логирование только в режиме разработки
    if (import.meta.env.DEV) {
    console.log('ProtectedRoute: Проверка авторизации:', {
        path: location.pathname,
      isAuthenticated,
        isLoading,
        hasUser: !!user
    });
    }
  
  // Показываем загрузку, пока проверяем статус аутентификации
  if (isLoading) {
      return <LoadingSpinner />;
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
    // с сохранением информации о запрошенном маршруте
  if (!isAuthenticated) {
      if (import.meta.env.DEV) {
    console.log('ProtectedRoute: Пользователь не авторизован, перенаправляем на /login');
      }
      return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
    // Если авторизован, отображаем защищенный контент
    return children;
  }, [isAuthenticated, isLoading, location, user, children]);
  
  return authResult;
});

ProtectedRoute.displayName = 'ProtectedRoute';

// Мемоизированный компонент для публичных маршрутов
const PublicRoute = memo(({ children }) => {
  return useMemo(() => children, [children]);
});

PublicRoute.displayName = 'PublicRoute';

// Мемоизированный компонент маршрутизации
const Routing = memo(() => {
  if (import.meta.env.DEV) {
  console.log('Рендеринг компонента Routing');
  }
  
  // Мемоизируем роуты для предотвращения лишних перерисовок
  const publicRoutes = useMemo(() => [
    { path: "/", element: <HomePage /> },
    { path: "/email-verification", element: <EmailVerificationPage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/restore-password", element: <RestorePasswordPage /> },
    { path: "/moving", element: <MovingPage /> },
    { path: "/tariffs", element: <TariffsPage /> },
    { path: "/chat", element: <ChatPage /> },
    { path: "/about-warehouse-rental", element: <AboutWarehouseRentalPage /> },
    { path: "/cloud-storage", element: <CloudStoragePage /> },
    { path: "/online-payment", element: <OnlinePaymentPage /> },
    { path: "/offer", element: <OfferPage /> },
    { path: "/privacy-policy", element: <PrivacyPolicyPage /> }
  ], []);

  const protectedRoutes = useMemo(() => [
    { path: "/personal-account", element: <PersonalAccountPage /> },
    { path: "/admin/users/:userId/profile", element: <AdminUsersProfile /> },
    { path: "/personal-account/manager/users/:userId", element: <ManagerUsersProfile /> },
     { path: "/personal-account/admin/warehouses/:warehouseId", element: <AdminWarehouseData /> },
    { path: "/personal-account/manager/warehouses/:warehouseId", element: <ManagerWarehouseData /> },
    { path: "/admin/moving/order/:orderId", element: <AdminMovingOrder /> },
    { path: "/manager/moving/order/:orderId", element: <ManagerMovingOrder /> },
    { path: "/personal-account/courier/order/:orderId", element: <CourierRequestOrder /> },
  ], []);

  const userOnlyRoutes = useMemo(() => [
    { path: "/warehouse-order", element: <WarehouseOrderPage /> },
  ], []);
  // Мемоизируем маппинг маршрутов для предотвращения повторного создания элементов
  const publicRouteElements = useMemo(() => 
    publicRoutes.map(route => (
      <Route
        key={route.path}
        path={route.path}
        element={<PublicRoute>{route.element}</PublicRoute>}
      />
    )), [publicRoutes]);
    
  const protectedRouteElements = useMemo(() => 
    protectedRoutes.map(route => (
      <Route
        key={route.path}
        path={route.path}
        element={<ProtectedRoute>{route.element}</ProtectedRoute>}
      />
    )), [protectedRoutes]);

  const userOnlyRouteElements = useMemo(() => 
    userOnlyRoutes.map(route => (
      <Route
        key={route.path}
        path={route.path}
        element={<UserOnlyRoute>{route.element}</UserOnlyRoute>}
      />
    )), [userOnlyRoutes]);
  
  return (
    <RouteLogger>
      <Routes>
        {/* Публичные маршруты */}
        {publicRouteElements}
        
        {/* Защищенные маршруты */}
        {protectedRouteElements}
        
        {/* Маршруты только для USER роли */}
        {userOnlyRouteElements}
        
        {/* Редирект для несуществующих маршрутов */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouteLogger>
  );
});

Routing.displayName = 'Routing';

export default Routing; 