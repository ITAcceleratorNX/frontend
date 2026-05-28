import { useCallback, useEffect, memo, useMemo, lazy, Suspense } from 'react';
import { Navigate, useLocation, Routes, Route } from 'react-router-dom';
import { useAuth } from '../shared/context/AuthContext';
import UserOnlyRoute from '../shared/routes/UserOnlyRoute';

import HomePage from '../pages/home';
import LoginPage from '../pages/login';
import RegisterPage from '../pages/register';
import RestorePasswordPage from '../pages/restore-password';
import ChatPage from '../pages/chat';
import AboutWarehouseRentalPage from '../pages/about-warehouse-rental';
import OnlinePaymentPage from '../pages/online-payment';
import PrivacyPolicyPage from '../pages/privacy-policy';
import PrivacyPolicy2Page from '../pages/privacy-policy2';
import PublicOfferPage from '../pages/public-offer';
import MovingPage from '../pages/moving';
import ThankYouPage from '../pages/thank-you';

// LP-* pages are isolated and lazy-loaded to keep the main bundle small.
// They are also intentionally NOT in the main menu and NOT in sitemap.xml.
const LpArendaBoksaPage = lazy(() => import('../pages/lp/ArendaBoksaAlmaty'));
const LpKameraHraneniyaPage = lazy(() => import('../pages/lp/KameraHraneniyaAlmaty'));
const LpOblachnoeHraneniePage = lazy(() => import('../pages/lp/OblachnoeHranenieAlmaty'));

// Product pages for storage formats on the main site (lazy to keep main bundle small).
const IndividualStoragePage = lazy(() => import('../pages/services/IndividualStoragePage'));
const CloudStoragePage = lazy(() => import('../pages/services/CloudStoragePage'));
const StorageRoomPage = lazy(() => import('../pages/services/StorageRoomPage'));

import PersonalAccountPage from '../pages/personal-account';
import UserProfile from '../pages/personal-account/ui/UserProfile';
import WarehouseData from '../pages/personal-account/ui/WarehouseData';
import AdminMovingOrder from '../pages/personal-account/ui/AdminMovingOrder';
import ManagerMovingOrder from '../pages/personal-account/ui/ManagerMovingOrder';
import CourierRequest from '../pages/personal-account/ui/CourierRequest';
import CourierRequestOrder from '../pages/personal-account/ui/CourierRequestOrder';

const RouteLogger = memo(({ children }) => children);

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
  // Показываем загрузку, пока проверяем статус аутентификации
  if (isLoading) {
      return <LoadingSpinner />;
  }
  
  // Если пользователь не авторизован, перенаправляем на страницу входа
    // с сохранением информации о запрошенном маршруте
  if (!isAuthenticated) {
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
  // Мемоизируем роуты для предотвращения лишних перерисовок
  const publicRoutes = useMemo(() => [
    { path: "/", element: <HomePage /> },
    { path: "/login", element: <LoginPage /> },
    { path: "/register", element: <RegisterPage /> },
    { path: "/restore-password", element: <RestorePasswordPage /> },
    { path: "/chat", element: <ChatPage /> },
    { path: "/about-warehouse-rental", element: <AboutWarehouseRentalPage /> },
    { path: "/online-payment", element: <OnlinePaymentPage /> },
    { path: "/privacy-policy", element: <PrivacyPolicyPage /> },
    { path: "/privacy-policy2", element: <PrivacyPolicy2Page /> },
    { path: "/public-offer", element: <PublicOfferPage /> },
    { path: "/moving", element: <MovingPage /> },
    { path: "/thank-you", element: <ThankYouPage /> },
    {
      path: "/lp/arenda-boksa-almaty",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <LpArendaBoksaPage />
        </Suspense>
      ),
    },
    {
      path: "/lp/kamera-hraneniya-almaty",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <LpKameraHraneniyaPage />
        </Suspense>
      ),
    },
    {
      path: "/lp/oblachnoe-hranenie-almaty",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <LpOblachnoeHraneniePage />
        </Suspense>
      ),
    },
    {
      path: "/individual-storage",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <IndividualStoragePage />
        </Suspense>
      ),
    },
    {
      path: "/cloud-storage",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <CloudStoragePage />
        </Suspense>
      ),
    },
    {
      path: "/storage-room",
      element: (
        <Suspense fallback={<LoadingSpinner />}>
          <StorageRoomPage />
        </Suspense>
      ),
    },
  ], []);

  const protectedRoutes = useMemo(() => [
    { path: "/personal-account", element: <PersonalAccountPage /> },
    { path: "/admin/users/:userId/profile", element: <UserProfile /> },
    { path: "/personal-account/manager/users/:userId", element: <UserProfile /> },
    { path: "/personal-account/admin/warehouses/:warehouseId", element: <WarehouseData /> },
    { path: "/personal-account/manager/warehouses/:warehouseId", element: <WarehouseData /> },
    { path: "/personal-account/admin/warehouses", element: <WarehouseData /> },
    { path: "/personal-account/manager/warehouses", element: <WarehouseData /> },
    { path: "/admin/moving/order/:orderId", element: <AdminMovingOrder /> },
    { path: "/manager/moving/order/:orderId", element: <ManagerMovingOrder /> },
    { path: "/personal-account/courier/order/:orderId", element: <CourierRequestOrder /> },
  ], []);

  const userOnlyRoutes = useMemo(() => [
    { 
      path: "/user/delivery", 
      element: <Navigate to="/personal-account" state={{ activeSection: 'delivery' }} replace />
    },
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