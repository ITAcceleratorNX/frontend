import React, { useState, useEffect, memo, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Sidebar from './ui/Sidebar';
import PersonalData from './ui/PersonalData';
import PersonalDataLegal from './ui/PersonalDataLegal';
import Contracts from './ui/Contracts';
import ChatSection from './ui/ChatSection';
import AllUsers from './ui/AllUsers';
import InfoWarehouses from './ui/InfoWarehouses';
import CourierRequest from './ui/CourierRequest';
import CourierRequestOrder from './ui/CourierRequestOrder';
import UserPayments from './ui/UserPayments';
import StaffOrdersSection from './ui/StaffOrdersSection';
import UserDelivery from './ui/UserDelivery';
import UserOrdersPage from './ui/UserOrdersPage';
import ItemSearch from './ui/ItemSearch';
import Statistics from './ui/Statistics';
import PromoCodeManagement from './ui/PromoCodeManagement';
import { useDeviceType } from '../../shared/lib/hooks/useWindowWidth';
import MobileSidebar from './ui/MobileSidebar';
import MobileOrdersLayout from './ui/MobileOrdersLayout';
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

  // Последняя вкладка orders/payments/delivery для кнопки «Назад» на мобильных (Профиль / Уведомления)
  const [lastOrdersTab, setLastOrdersTab] = useState('orders');

  // Начальный фильтр в «Мои заказы» при редиректе после создания заказа (категория «Договор»)
  const [ordersInitialFilter, setOrdersInitialFilter] = useState(null);

  // Начальный режим в разделе «Заказы» для MANAGER/ADMIN (requests | payments | moving)
  const [ordersManagementInitialMode, setOrdersManagementInitialMode] = useState('requests');

  // Сбрасываем раздел чата для ролей USER и MANAGER
  useEffect(() => {
    if ((user?.role === 'USER' || user?.role === 'MANAGER') && activeNav === 'chat') {
      setActiveNav('personal');
    }
  }, [user?.role, activeNav]);


  // Проверяем состояние навигации при загрузке компонента
  useEffect(() => {
    if (location.state?.activeSection) {
      const section = location.state.activeSection;
      // Обратная совместимость: старые ключи request/adminpayments/managermoving/adminmoving → ordersManagement
      if (['request', 'adminpayments', 'managermoving', 'adminmoving'].includes(section)) {
        setActiveNav('ordersManagement');
        setOrdersManagementInitialMode(
          section === 'request' ? 'requests' : section === 'adminpayments' ? 'payments' : 'moving'
        );
      } else {
        setActiveNav(section);
      }
      if (section === 'orders' && location.state.ordersFilter) {
        setOrdersInitialFilter(location.state.ordersFilter);
      }
      // Очищаем state в URL после применения (откладываем, чтобы setState успел отрендериться)
      const path = location.pathname;
      const id = setTimeout(() => navigate(path, { replace: true }), 0);
      return () => clearTimeout(id);
    }
  }, [location.state, navigate, location.pathname]);

  // Сбрасываем начальный фильтр заказов после первого отображения (чтобы при следующем открытии «Мои заказы» была вкладка «Все»)
  useEffect(() => {
    if (activeNav === 'orders' && ordersInitialFilter != null) {
      const id = requestAnimationFrame(() => setOrdersInitialFilter(null));
      return () => cancelAnimationFrame(id);
    }
  }, [activeNav, ordersInitialFilter]);

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
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  // При переходе в Профиль/Уведомления с Брони/Платежи/Доставка — запоминаем вкладку для «Назад»
  const handleMobileNav = (newNav) => {
    if (['personal', 'notifications'].includes(newNav) && ['orders', 'payments', 'delivery'].includes(activeNav)) {
      setLastOrdersTab(activeNav);
    }
    setActiveNav(newNav);
  };

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

    // Мобильный layout для USER: Брони | Платежи | Доставка | Профиль | Уведомления (один хедер, для Профиля/Уведомлений — кнопка «Назад»)
  const useMobileOrdersLayout = isMobile && user?.role === 'USER' && ['orders', 'payments', 'delivery', 'personal', 'notifications'].includes(activeNav);

  if (useMobileOrdersLayout) {
    return (
      <MobileOrdersLayout
        activeNav={activeNav}
        setActiveNav={handleMobileNav}
        lastOrdersTab={lastOrdersTab}
        ordersInitialFilter={ordersInitialFilter}
      />
    );
  }

    // Если не загрузка и пользователь аутентифицирован, показываем контент
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1">
        {!isMobile && (
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
        )}
        <main className={`flex-1 px-4 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 max-w-full mx-auto bg-gray-50`}>
          {isMobile && (
            <MobileSidebar activeNav={activeNav} setActiveNav={setActiveNav} />
          )}


          {activeNav === 'orders' && <UserOrdersPage initialFilter={ordersInitialFilter} />}
          {activeNav === 'personal' && (user?.user_type === 'LEGAL' ? <PersonalDataLegal /> : <PersonalData />)}
          {activeNav === 'contracts' && <Contracts />}
          {activeNav === 'chat' && <ChatSection />}
          {activeNav === 'notifications' && getNotificationsComponent()}
          {activeNav === 'couriernotifications' && <CourierNotifications />}
          {activeNav === 'adminusers' && <AllUsers />}
          {activeNav === 'managerusers' && <AllUsers />}
          {activeNav === 'warehouses' && <InfoWarehouses />}
          {activeNav === 'ordersManagement' && (user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <StaffOrdersSection initialMode={ordersManagementInitialMode} />
          )}
          {activeNav === 'courierrequests' && <CourierRequest />}
          {activeNav === 'courierrequestorder' && <CourierRequestOrder />}
          {activeNav === 'payments' && <UserPayments />}
          {activeNav === 'delivery' && <UserDelivery />}
          {activeNav === 'itemsearch' && <ItemSearch />}
          {activeNav === 'statistics' && (user?.role === 'ADMIN' || user?.role === 'MANAGER') && <Statistics />}
          {activeNav === 'promocodes' && user?.role === 'ADMIN' && <PromoCodeManagement />}
        </main>
      </div>
    </div>
  );
  }, [activeNav, isLoading, isAuthenticated, user, isMobile, lastOrdersTab, ordersInitialFilter, ordersManagementInitialMode]);

  return pageContent;
});

PersonalAccountPage.displayName = 'PersonalAccountPage';

export default PersonalAccountPage; 