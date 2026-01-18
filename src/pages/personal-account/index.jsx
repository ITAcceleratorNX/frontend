import React, { useState, useEffect, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './ui/Sidebar';
import PersonalData from './ui/PersonalData';
import PersonalDataLegal from './ui/PersonalDataLegal';
import Contracts from './ui/Contracts';
import ChatSection from './ui/ChatSection';
import AllUsers from './ui/AllUsers';
import AdminMoving from './ui/AdminMoving';
import ManagerMoving from './ui/ManagerMoving';
import InfoWarehouses from './ui/InfoWarehouses';
import CourierRequest from './ui/CourierRequest';
import CourierRequestOrder from './ui/CourierRequestOrder';
import OrderManagement from './ui/OrderManagement';
import UserPayments from './ui/UserPayments';
import UserDelivery from './ui/UserDelivery';
import UserOrdersPage from './ui/UserOrdersPage';
import ItemSearch from './ui/ItemSearch';
import Statistics from './ui/Statistics';
import { useDeviceType } from '../../shared/lib/hooks/useWindowWidth';
import MobileSidebar from './ui/MobileSidebar';
import '@szhsin/react-menu/dist/index.css';

import { 
  UserNotificationsPage, 
  AdminNotifications, 
  ManagerNotifications,
  CourierNotifications,
} from './ui/notifications';
import { useAuth } from '../../shared/context/AuthContext';
// ToastContainer уже подключен в главном приложении

// Мемоизированный компонент страницы личного кабинета
const PersonalAccountPage = memo(() => {
  const location = useLocation();
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const { isMobile } = useDeviceType();
  
  // Устанавливаем начальное состояние в зависимости от роли пользователя
  const [activeNav, setActiveNav] = useState(() => {
    // Для обычных пользователей по умолчанию показываем заказы
    if (user?.role === 'USER') {
      return 'orders';
    }
    return 'personal';
  });


  // Сбрасываем раздел чата для ролей USER и MANAGER
  useEffect(() => {
    if ((user?.role === 'USER' || user?.role === 'MANAGER') && activeNav === 'chat') {
      setActiveNav('personal');
    }
  }, [user?.role, activeNav]);


  // Проверяем состояние навигации при загрузке компонента
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveNav(location.state.activeSection);
      // Очищаем состояние после использования
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  // Проверяем URL для установки активного раздела
  useEffect(() => {
    const path = location.pathname;
    if (path === '/user/delivery') {
      setActiveNav('delivery');
    }
  }, [location.pathname]);

  // Обработка навигации браузера (назад/вперед)
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/user/delivery') {
        setActiveNav('delivery');
      } else if (path === '/personal-account') {
        // Если возвращаемся на основную страницу личного кабинета, сбрасываем на personal
        if (activeNav === 'delivery') {
          setActiveNav('personal');
        }
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeNav]);

  // Отслеживаем изменение статуса аутентификации для перенаправления
  useEffect(() => {
    // После завершения загрузки, проверяем аутентификацию
    if (!isLoading && !isAuthenticated) {
      if (import.meta.env.DEV) {
        console.log('PersonalAccountPage: Пользователь не аутентифицирован, перенаправление на /login');
      }
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Выбор компонента уведомлений в зависимости от роли
  const getNotificationsComponent = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'ADMIN':
        return <AdminNotifications />;
      case 'MANAGER':
        return <ManagerNotifications />;
      case 'COURIER':
        return <CourierNotifications />;
      default:
        return <UserNotificationsPage />;
    }
  };

  // Мемоизируем контент страницы для предотвращения ререндеров
  const pageContent = useMemo(() => {
  // Пока идет проверка аутентификации, показываем загрузку
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

    // Если не загрузка и пользователь аутентифицирован, показываем контент
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {!isMobile && (
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        )}
        <main className={`flex-1 ${activeNav === 'orders' ? 'px-0 py-0' : 'px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6'} max-w-full mx-auto bg-gray-50`}>
          {isMobile && (
            <MobileSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          )}


          {activeNav === 'orders' && <UserOrdersPage />}
          {activeNav === 'personal' && (user?.user_type === 'LEGAL' ? <PersonalDataLegal /> : <PersonalData />)}
          {activeNav === 'contracts' && <Contracts />}
          {activeNav === 'chat' && <ChatSection />}
          {activeNav === 'notifications' && getNotificationsComponent()}
          {activeNav === 'couriernotifications' && <CourierNotifications />}
          {activeNav === 'adminusers' && <AllUsers />}
          {activeNav === 'managerusers' && <AllUsers />}
          {activeNav === 'warehouses' && <InfoWarehouses />}
          {activeNav === 'adminmoving' && <AdminMoving />}
          {activeNav === 'managermoving' && <ManagerMoving />}
          {activeNav === 'request' && <OrderManagement />}
          {activeNav === 'courierrequests' && <CourierRequest />}
          {activeNav === 'courierrequestorder' && <CourierRequestOrder />}
          {activeNav === 'payments' && <UserPayments />}
          {activeNav === 'delivery' && <UserDelivery />}
          {activeNav === 'itemsearch' && <ItemSearch />}
          {activeNav === 'statistics' && (user?.role === 'ADMIN' || user?.role === 'MANAGER') && <Statistics />}
        </main>
      </div>
    </div>
  );
  }, [activeNav, isLoading, isAuthenticated, user, isMobile]);

  if (import.meta.env.DEV) {
    console.log('Рендеринг PersonalAccountPage, статус аутентификации:', 
      { isAuthenticated, isLoading, activeNav, userRole: user?.role });
  }

  return pageContent;
});

PersonalAccountPage.displayName = 'PersonalAccountPage';

export default PersonalAccountPage; 