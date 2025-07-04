import React, { useState, useEffect, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Header } from '../../widgets';
import Sidebar from './ui/Sidebar';
import PersonalData from './ui/PersonalData';
import Contracts from './ui/Contracts';
import Settings from './ui/Settings';
import ChatSection from './ui/ChatSection';
import AdminUsers from './ui/AdminUsers';
import AdminMoving from './ui/AdminMoving';
import ManagerUsers from './ui/ManagerUsers';
import ManagerMoving from './ui/ManagerMoving';
import AdminWarehouses from './ui/AdminWarehouses';
import ManagerWarehouses from './ui/ManagerWarehouses';
import CourierRequest from './ui/CourierRequest';
import CourierRequestOrder from './ui/CourierRequestOrder';
import OrderManagement from './ui/OrderManagement';
import UserPayments from './ui/UserPayments';

import { 
  UserNotificationsPage, 
  AdminNotifications, 
  ManagerNotifications,
  CourierNotifications,
} from './ui/notifications';
import { useAuth } from '../../shared/context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Мемоизированный компонент страницы личного кабинета
const PersonalAccountPage = memo(() => {
  const location = useLocation();
  const [activeNav, setActiveNav] = useState('personal');
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();

  // Проверяем состояние навигации при загрузке компонента
  useEffect(() => {
    if (location.state?.activeSection) {
      setActiveNav(location.state.activeSection);
      // Очищаем состояние после использования
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

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
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

    // Если не загрузка и пользователь аутентифицирован, показываем контент
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="flex flex-1">
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        <main className="flex-1 flex flex-col items-start justify-center py-12 px-10 bg-white">


          {activeNav === 'personal' && <PersonalData />}
          {activeNav === 'contracts' && <Contracts />}
          {activeNav === 'chat' && <ChatSection />}
          {activeNav === 'notifications' && getNotificationsComponent()}
          {activeNav === 'adminusers' && <AdminUsers />}
          {activeNav === 'managerusers' && <ManagerUsers />}
          {activeNav === 'adminwarehouses' && <AdminWarehouses />}
          {activeNav === 'managerwarehouses' && <ManagerWarehouses />}
          {activeNav === 'adminmoving' && <AdminMoving />}
          {activeNav === 'managermoving' && <ManagerMoving />}
          {activeNav === 'request' && <OrderManagement />}
          {activeNav === 'courierrequests' && <CourierRequest />}
          {activeNav === 'courierrequestorder' && <CourierRequestOrder />}
          {activeNav === 'payments' && <UserPayments />}
          {activeNav === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  );
  }, [activeNav, isLoading, isAuthenticated, user]);

  if (import.meta.env.DEV) {
    console.log('Рендеринг PersonalAccountPage, статус аутентификации:', 
      { isAuthenticated, isLoading, activeNav, userRole: user?.role });
  }

  return pageContent;
});

PersonalAccountPage.displayName = 'PersonalAccountPage';

export default PersonalAccountPage; 