import React from 'react';
import { Menu as ReactMenu, MenuButton, MenuItem } from '@szhsin/react-menu';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../../shared/lib/hooks/use-user-query';
import { useUnreadNotificationsCount, useAwaitableDeliveriesCount, usePendingExtensionOrdersCount, NOTIFICATION_QUERY_KEYS } from '../../../shared/lib/hooks/use-notifications';
import { useEffect } from 'react';
import clsx from 'clsx';
import './mobile-menu.css';

// Import icons
import icon1 from '../../../assets/1.svg';
import icon2 from '../../../assets/2.svg';
import icon3 from '../../../assets/3.svg';
import icon4 from '../../../assets/4.svg';
import icon6 from '../../../assets/6.svg';
import icon8 from '../../../assets/8.svg';
import icon9 from '../../../assets/9.svg';
import icon10 from '../../../assets/10.svg';
import icon11 from '../../../assets/11.svg';
import icon12 from '../../../assets/12.svg';
import icon13 from '../../../assets/13.svg';

// Navigation items for different roles
const userNavItems = [
  { label: 'Личные данные', icon: icon1, key: 'personal' },
  { label: 'Договоры', icon: icon2, key: 'contracts' },
  { label: 'Чат', icon: icon3, key: 'chat' },
  { label: 'Уведомления', icon: icon10, key: 'notifications' },
  { label: 'Платежи', icon: icon4, key: 'payments' },
  { label: 'Доставка', icon: icon12, key: 'delivery' },
  { divider: true },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

const managerNavItems = [
  { label: 'Личные данные', icon: icon1, key: 'personal' },
  { label: 'Пользователи', icon: icon8, key: 'managerusers' },
  { label: 'Склады', icon: icon9, key: 'warehouses' },
  { label: 'Мувинг', icon: icon9, key: 'managermoving' },
  { label: 'Запрос', icon: icon11, key: 'request' },
  { label: 'Поиск вещи', icon: icon13, key: 'itemsearch' },
  { label: 'Чат', icon: icon3, key: 'chat' },
  { label: 'Уведомления', icon: icon10, key: 'notifications' },
  { divider: true },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

const adminNavItems = [
  { label: 'Личные данные', icon: icon1, key: 'personal' },
  { label: 'Пользователи', icon: icon8, key: 'adminusers' },
  { label: 'Склады', icon: icon9, key: 'warehouses' },
  { label: 'Мувинг', icon: icon9, key: 'adminmoving' },
  { label: 'Запрос', icon: icon11, key: 'request' },
  { label: 'Поиск вещи', icon: icon13, key: 'itemsearch' },
  { label: 'Уведомления', icon: icon10, key: 'notifications' },
  { divider: true },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

const courierNavItems = [
  { label: 'Личные данные', icon: icon1, key: 'personal' },
  { label: 'Запросы', icon: icon8, key: 'courierrequests' },
  { label: 'Уведомления', icon: icon10, key: 'couriernotifications' },
  { divider: true },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

const MobileSidebar = ({ activeNav, setActiveNav }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const unreadCount = useUnreadNotificationsCount();
  const awaitableDeliveriesCount = useAwaitableDeliveriesCount();
  const pendingExtensionCount = usePendingExtensionOrdersCount();

  // Принудительно загружаем данные при входе в личный кабинет
  useEffect(() => {
    if (user && (user.role === 'COURIER')) {
      // Принудительно обновляем данные при монтировании компонента
      queryClient.invalidateQueries({ queryKey: ['userDeliveries'] });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.user(user.id) });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    }
  }, [user, queryClient]);

  const getNavItemsByRole = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return adminNavItems;
      case 'MANAGER':
        return managerNavItems;
      case 'COURIER':
        return courierNavItems;
      default:
        return userNavItems;
    }
  };

  const navItems = getNavItemsByRole(user?.role);

  const handleNavClick = async (key) => {
    if (key === 'delivery') {
      setActiveNav('delivery');
      window.history.pushState(null, '', '/user/delivery');
      return;
    }

    if (key === 'logout') {
      try {
        const logoutToast = toast.loading("Выполняется выход из системы...");
        
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        queryClient.setQueryData([USER_QUERY_KEY], null);
        queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
        
        const isProd = !import.meta.env.DEV;
        
        if (isProd) {
          const logoutUrl = 'https://api.extraspace.kz/auth/logout?redirect=https://frontend-6j9m.onrender.com/';
          
          toast.update(logoutToast, {
            render: "Выход выполнен успешно!", 
            type: "success", 
            isLoading: false,
            autoClose: 2000
          });
          
          setTimeout(() => {
            window.location.href = logoutUrl;
          }, 300);
        } else {
          try {
            await fetch('/api/auth/logout', {
              method: 'GET',
              credentials: 'include'
            });
          } catch (error) {
            console.log('Ошибка при запросе на выход:', error);
          }
          
          toast.update(logoutToast, {
            render: "Выход выполнен успешно!", 
            type: "success", 
            isLoading: false,
            autoClose: 2000
          });
          
          setTimeout(() => {
            navigate('/');
          }, 300);
        }
      } catch (error) {
        console.error('Ошибка при выходе из системы:', error);
        
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        queryClient.setQueryData([USER_QUERY_KEY], null);
        queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
        
        toast.error("Произошла ошибка при выходе, но вы были успешно разлогинены");
        
        setTimeout(() => {
          navigate('/');
        }, 300);
      }
    } else {
      setActiveNav(key);
      
      const currentPath = window.location.pathname;
      const isOnWarehouseDataPage = currentPath.includes('/warehouses/') && !currentPath.endsWith('/warehouses');
      const isOnDetailPage = currentPath.includes('/users/') || currentPath.includes('/moving/order/');
      
      if (isOnWarehouseDataPage || isOnDetailPage) {
        navigate('/personal-account', { state: { activeSection: key } });
      } else {
        // Если мы были на странице доставки, обновляем URL обратно на личный кабинет
        if (window.location.pathname === '/user/delivery') {
          window.history.pushState(null, '', '/personal-account');
        }
      }
    }
  };

  return (
    <ReactMenu
      menuButton={
        <MenuButton className="mobile-menu-button fixed top-20 left-4 z-50 p-3 bg-white rounded-full shadow-lg hover:shadow-xl border border-gray-200">
          <Menu className="w-6 h-6 text-[#273655]" />
        </MenuButton>
      }
      direction="top"
      align="start"
      position="auto"
      viewScroll="auto"
      arrow={true}
      gap={10}
      shift={2}
      menuClassName="!bg-white !border !border-gray-200 !shadow-2xl !rounded-2xl !p-2 !min-w-[280px] !max-w-[320px]"
      arrowClassName="!fill-white !stroke-gray-200"
      transition={{
        open: true,
        close: true,
        item: true
      }}
    >
      <div className="py-2">
        <div className="px-4 py-3 border-b border-gray-100 mb-2">
          <h3 className="text-lg font-semibold text-[#273655]">Меню</h3>
          <p className="text-sm text-gray-500">
            {user?.role === 'USER' ? 'Пользователь' : 
             user?.role === 'ADMIN' ? 'Администратор' :
             user?.role === 'MANAGER' ? 'Менеджер' :
             user?.role === 'COURIER' ? 'Курьер' : 'Пользователь'}
          </p>
        </div>
        
        {navItems.map((item, idx) => {
          if (item.divider) {
            return <div key={idx} className="my-2 border-t border-gray-100" />;
          }
          
          return (
            <MenuItem
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={clsx(
                '!flex !items-center !gap-3 !px-4 !py-3 !rounded-xl !text-base !font-medium !transition-all !duration-200 !mx-1 !my-1',
                activeNav === item.key
                  ? '!bg-[#273655] !text-white !shadow-md'
                  : '!text-gray-700 hover:!bg-gray-50 hover:!text-[#273655]',
                item.key === 'logout' && '!text-red-600 hover:!bg-red-50 hover:!text-red-700'
              )}
            >
              <div className="relative">
                <img 
                  src={item.icon} 
                  alt="icon" 
                  className={clsx(
                    'w-5 h-5 flex-shrink-0 transition-all duration-200',
                    activeNav === item.key ? 'filter invert' : 
                    item.key === 'logout' ? 'filter brightness-0 saturate-100 hue-rotate-0' : 'filter brightness-0'
                  )} 
                />
                {/* Красная точка для непрочитанных уведомлений */}
                {item.key === 'notifications' && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {/* Красная точка для доставок со статусом AWAITABLE */}
                {item.key === 'delivery' && awaitableDeliveriesCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {/* Красная точка для платежей с pending статусом */}
                {item.key === 'payments' && pendingExtensionCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="flex-1">{item.label}</span>
              {activeNav === item.key && (
                <div className="w-2 h-2 bg-white rounded-full"></div>
              )}
            </MenuItem>
          );
        })}
      </div>
    </ReactMenu>
  );
};

export default MobileSidebar;