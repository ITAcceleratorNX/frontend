import React, { useState, useRef, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { useNavigate, useLocation } from 'react-router-dom';
import icon1 from '../../../assets/1.svg';
import icon2 from '../../../assets/2.svg';
import icon3 from '../../../assets/3.svg';
import icon4 from '../../../assets/4.svg';
import icon5 from '../../../assets/5.svg';
import icon6 from '../../../assets/6.svg';
import icon8 from '../../../assets/8.svg';
import icon9 from '../../../assets/9.svg';
import icon10 from '../../../assets/10.svg';
import icon11 from '../../../assets/11.svg';
import icon12 from '../../../assets/12.svg';
import icon13 from '../../../assets/13.svg';
import { showLoading, updateToast } from '../../../shared/lib/utils/notifications';
import { showErrorToast } from '../../../shared/lib/toast';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../../shared/lib/hooks/use-user-query';
import { useAuth } from '../../../shared/context/AuthContext';
import { useUnreadNotificationsCount, useAwaitableDeliveriesCount, usePendingExtensionOrdersCount, NOTIFICATION_QUERY_KEYS } from '../../../shared/lib/hooks/use-notifications';
import { useChatStore } from '../../../entities/chat/model';
import { Pencil, LogOut, Bell, Package, CreditCard, Truck, Tag, ClipboardList, Video } from 'lucide-react';
import lichkaLogo from '../../../assets/Lichka2.png';
import { useNotifications } from '../../../shared/lib/hooks/use-notifications';
import UserNotifications from './notifications/UserNotifications';
import { getNotificationTarget } from './notifications/NotificationCard';
import { Switch } from '../../../components/ui/switch';
import { useTheme } from '../../../shared/context/ThemeContext';
import ThemeToggle from './ThemeToggle';

// Разделы для обычных пользователей
const userNavItems = [
  { label: 'Мои заказы', icon: Package, key: 'orders' },
  // { label: 'Чат', icon: icon3, key: 'chat' },
  { label: 'Платежи', icon: CreditCard, key: 'payments' },
  { label: 'Доставка', icon: Truck, key: 'delivery' },
  { divider: true },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

// Разделы для менеджеров
const managerNavItems = [
  { label: 'Клиенты и заказы', icon: icon11, key: 'clientsAndOrders' },
  { label: 'Склады', icon: icon9, key: 'warehouses' },
  { label: 'Видеонаблюдение', icon: Video, key: 'cctv' },
  { label: 'Статистика', icon: icon5, key: 'statistics' },
  { label: 'Поиск вещи', icon: icon13, key: 'itemsearch' },
  { label: 'CRM', icon: ClipboardList, key: 'lpleads' },
  // { label: 'Чат', icon: icon3, key: 'chat' },
  { label: 'Уведомления', icon: icon10, key: 'notifications' },
  { divider: true },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

// Разделы для администраторов
const adminNavItems = [
  { label: 'Клиенты и заказы', icon: icon11, key: 'clientsAndOrders' },
  { label: 'Склады', icon: icon9, key: 'warehouses' },
  { label: 'Видеонаблюдение', icon: Video, key: 'cctv' },
  { label: 'Статистика', icon: icon5, key: 'statistics' },
  { label: 'Поиск вещи', icon: icon13, key: 'itemsearch' },
  { label: 'CRM', icon: ClipboardList, key: 'lpleads' },
  { label: 'Промокоды', icon: Tag, key: 'promocodes' },
  { label: 'Уведомления', icon: icon10, key: 'notifications' },
  { divider: true },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

// Разделы для грузчиков
const courierNavItems = [
  { label: 'Запросы', icon: icon8, key: 'courierrequests' },
  { label: 'Уведомления', icon: icon10, key: 'couriernotifications' },
  { divider: true },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const location = useLocation();
  const unreadCount = useUnreadNotificationsCount();
  const awaitableDeliveriesCount = useAwaitableDeliveriesCount();
  const pendingExtensionCount = usePendingExtensionOrdersCount();
  const { unreadMessages } = useChatStore();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const notificationsRef = useRef(null);
  const { notifications = [], markAsRead } = useNotifications();
  
  // Фильтрация уведомлений
  const filteredNotifications = showUnreadOnly 
    ? notifications.filter(n => !n.is_read)
    : notifications;

  const handleNotificationClick = useCallback(
    (notification) => {
      const target = getNotificationTarget(notification);
      if (target.activeSection === 'lpleads') {
        queryClient.invalidateQueries({ queryKey: ['lp-landing-leads'] });
      }
      const state = { activeSection: target.activeSection };
      if (target.ordersFilter) state.ordersFilter = target.ordersFilter;
      if (target.orderId) state.orderId = target.orderId;
      if (target.deliveryId) state.deliveryId = target.deliveryId;
      navigate('/personal-account', { state });
      setIsNotificationsOpen(false);
    },
    [navigate, queryClient],
  );
  
  // Подсчитываем общее количество непрочитанных сообщений в чате
  const totalUnreadChatCount = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);
  
  // Закрытие панели уведомлений при клике вне её
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  // Принудительно загружаем данные при входе в личный кабинет
  useEffect(() => {
    if (user && (user.role === 'USER' || user.role === 'COURIER')) {
      // Принудительно обновляем данные при монтировании компонента
      queryClient.invalidateQueries({ queryKey: ['userDeliveries'] });
      queryClient.invalidateQueries({ queryKey: NOTIFICATION_QUERY_KEYS.user(user.id) });
      queryClient.invalidateQueries({ queryKey: ['userOrders'] });
    }
  }, [user, queryClient]);

   // Определяем, какие разделы показать в зависимости от роли
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
  const { isDark } = useTheme();

  const handleNavClick = async (key) => {
    if (key === 'delivery') {
      // Устанавливаем активный раздел доставки
      setActiveNav('delivery');
      // Обновляем URL без перезагрузки страницы
      window.history.pushState(null, '', '/user/delivery');
      return;
    }
    
    if (key === 'logout') {
      try {
        // Показываем уведомление о начале процесса выхода
        const logoutToast = showLoading("Выполняется выход из системы...");
        
        // Очищаем куки и данные пользователя
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        // Инвалидируем кеш данных пользователя
        queryClient.setQueryData([USER_QUERY_KEY], null);
        queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
        
        // Определяем, находимся ли мы в production или dev режиме
        const isProd = !import.meta.env.DEV;
        
        if (isProd) {
          // В production используем подход с перенаправлением на страницу выхода
          // и сразу возвращаемся на главную страницу через параметр redirect
          const logoutUrl = 'https://api.extraspace.kz/auth/logout?redirect=https://frontend-6j9m.onrender.com/';
          
          // Обновляем уведомление
          updateToast(logoutToast, "Выход выполнен успешно!", "success");
          
          // Делаем небольшую задержку перед перенаправлением
          setTimeout(() => {
            // Перенаправляем на страницу выхода
            window.location.href = logoutUrl;
          }, 300);
        } else {
          // В режиме разработки используем API
          try {
            await fetch('/api/auth/logout', {
              method: 'GET',
              credentials: 'include' // Отправляем куки для аутентификации
            });
          } catch (error) {
            // Игнорируем ошибку, т.к. куки уже очищены на клиенте
          }
          
          // Обновляем уведомление
          updateToast(logoutToast, "Выход выполнен успешно!", "success");
          
          // Перенаправляем пользователя на главную страницу
          setTimeout(() => {
          navigate('/');
          }, 300);
        }
      } catch (error) {
        console.error('Ошибка при выходе из системы:', error);
        
        // Даже при ошибке очищаем куки и кеш
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        
        queryClient.setQueryData([USER_QUERY_KEY], null);
        queryClient.invalidateQueries({queryKey: [USER_QUERY_KEY]});
        
        // Показываем уведомление об ошибке
        showErrorToast("Произошла ошибка при выходе, но вы были успешно разлогинены");
        
        // При неожиданной ошибке также перенаправляем на главную
        setTimeout(() => {
        navigate('/');
        }, 300);
      }
    } else {
      // Для всех остальных разделов
      setActiveNav(key);
      
      // Проверяем, находимся ли мы на странице WarehouseData или других внешних страницах
      const currentPath = window.location.pathname;
      const isOnWarehouseDataPage = currentPath.includes('/warehouses/') && !currentPath.endsWith('/warehouses');
      const isOnDetailPage = currentPath.includes('/users/') || currentPath.includes('/moving/order/');
      
      // Если мы на странице деталей (не в основном личном кабинете), перенаправляем в личный кабинет
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

  const totalUnread = unreadCount + awaitableDeliveriesCount + pendingExtensionCount;

  return (
    <aside className={clsx(
      'w-[280px] min-h-screen flex flex-col py-6 px-6 flex-shrink-0 border-r',
      isDark ? 'staff-sidebar border-[var(--staff-border-light)] bg-[var(--staff-surface)]' : 'bg-white border-[#f5f5f5]'
    )}>
      {/* Logo */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-6">
          <img 
            src={lichkaLogo} 
            alt="Extra Space" 
            className="h-8 w-auto"
          />
          <span className={clsx(
            'text-xl font-bold',
            isDark ? 'text-[var(--staff-brand)]' : 'text-[#004743]'
          )}>EXTRA SPACE</span>
        </div>
        
        {/* Book Boxes Button */}
        <button
          onClick={() => navigate('/')}
          className="bg-[#00A991] text-white py-2.5 px-4 rounded-full font-medium hover:bg-[#009882] transition-colors mb-6 font-sf-pro-text text-sm"
        >
          Забронировать боксы
        </button>

        {/* Profile Section */}
        <div className="mb-6">
          <h3 className={clsx(
            'text-xs font-medium mb-3',
            isDark ? 'text-[var(--staff-text-muted)]' : 'text-[#737373]'
          )}>Профиль:</h3>
          <div className="flex items-start gap-3">
            {/* Avatar with gradient */}
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#004743] to-[#00A991] flex items-center justify-center text-white font-semibold text-xl flex-shrink-0">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            
            {/* Name and Edit Link */}
            <div className="flex-1 min-w-0">
              <div className="mb-1">
                {user?.name ? (
                  <div className={clsx(
                    'text-sm font-semibold leading-tight',
                    isDark ? 'text-[var(--staff-text)]' : 'text-gray-900'
                  )}>
                    {user.name.split(' ').map((part, idx) => (
                      <div key={idx}>{part}</div>
                    ))}
                  </div>
                ) : (
                  <div className={clsx(
                    'text-sm font-semibold',
                    isDark ? 'text-[var(--staff-text)]' : 'text-gray-900'
                  )}>Пользователь</div>
                )}
              </div>
              <button
                onClick={() => setActiveNav('personal')}
                className={clsx(
                  'staff-profile-link flex items-center gap-1 text-xs transition-colors focus:outline-none focus:ring-0 hover:shadow-none active:shadow-none',
                  isDark ? 'text-[#B0E4DD] hover:text-[#00A991]' : 'text-[#00A991] hover:text-[#009882]'
                )}
                style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
              >
                <Pencil className="w-3 h-3" />
                Изменить профиль
              </button>
            </div>
            
            {/* Notification Icon */}
            <div className="relative flex-shrink-0" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={clsx(
                  'staff-bell-btn flex items-center gap-1 focus:outline-none focus:ring-0 hover:shadow-none active:shadow-none hover:bg-transparent hover:scale-100 active:scale-100 hover:transform-none active:transform-none',
                  isDark ? 'text-[#B0E4DD] hover:text-[#00A991]' : 'text-[#00A991]'
                )}
                style={{ backgroundColor: 'transparent', boxShadow: 'none' }}
              >
                <Bell className="w-5 h-5" />
                {totalUnread > 0 && (
                  <span className="text-xs font-medium">+{totalUnread}</span>
                )}
              </button>
              
              {/* Notifications Panel */}
              {isNotificationsOpen && (
                <div className={clsx(
                  'fixed top-20 left-[280px] w-[420px] border rounded-lg shadow-lg z-50 max-h-[600px] overflow-y-auto',
                  isDark
                    ? 'staff-notifications-panel bg-[var(--staff-surface-raised)] border-[var(--staff-accent)]'
                    : 'bg-white border-[#00A991]'
                )}>
                  <div className={clsx(
                    'p-4 border-b',
                    isDark ? 'border-[var(--staff-border)]' : 'border-[#DFDFDF]'
                  )}>
                    <div className="flex items-center justify-between gap-4">
                      <h3 className={clsx(
                        'text-base font-semibold whitespace-nowrap',
                        isDark ? 'text-[var(--staff-text)]' : 'text-[#363636]'
                      )}>Уведомления</h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <label htmlFor="unread-only" className={clsx(
                          'text-xs cursor-pointer whitespace-nowrap',
                          isDark ? 'text-[var(--staff-text-secondary)]' : 'text-gray-600'
                        )}>
                          Показать только непрочитанные
                        </label>
                        <Switch
                          id="unread-only"
                          checked={showUnreadOnly}
                          onCheckedChange={setShowUnreadOnly}
                          className="scale-75 hover:scale-75 active:scale-75"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    {filteredNotifications.length === 0 ? (
                      <div className="text-center py-8 text-gray-500 text-sm">
                        Нет уведомлений
                      </div>
                    ) : (
                      <UserNotifications 
                        notifications={filteredNotifications} 
                        onMarkAsRead={markAsRead}
                        onNotificationClick={handleNotificationClick}
                        scale={1}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Theme toggle */}
      <div className={clsx(
        'mb-4 pb-4 border-b',
        isDark ? 'border-[var(--staff-border-light)]' : 'border-[#f5f5f5]'
      )}>
        <ThemeToggle />
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item, idx) => {
          if (item.divider) {
            return <hr key={idx} className={clsx(
              'my-3 border-t',
              isDark ? 'staff-divider border-[var(--staff-border-light)]' : 'border-[#f5f5f5]'
            )} />;
          }
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={clsx(
                'staff-nav-item flex items-center gap-3 px-4 py-2.5 text-[16px] font-normal leading-normal relative whitespace-nowrap',
                activeNav === item.key
                  ? 'staff-nav-item--active bg-[#00A991]/20 rounded-full text-[#00A991]'
                  : isDark
                    ? 'text-[var(--staff-text-secondary)] hover:bg-[var(--staff-surface-hover)] rounded-md'
                    : 'text-gray-700 hover:bg-[#f5f5f5] rounded-md',
                'group'
              )}
              style={{marginBottom: idx === navItems.length - 1 ? 0 : 4}}
            >
              <div className="relative">
                {typeof item.icon === 'string' ? (
                  <img 
                    src={item.icon} 
                    alt="icon" 
                    className={clsx(
                      'w-5 h-5 flex-shrink-0',
                      activeNav !== item.key && !isDark && 'filter brightness-0 opacity-60',
                      activeNav !== item.key && isDark && 'staff-nav-icon-inactive',
                    )}
                    style={activeNav === item.key ? { 
                      filter: 'brightness(0) saturate(100%) invert(45%) sepia(95%) saturate(1200%) hue-rotate(140deg) brightness(0.9) contrast(1.1)',
                      opacity: 1
                    } : {}}
                  />
                ) : item.icon ? (
                  <item.icon className={clsx(
                    'w-5 h-5 flex-shrink-0',
                    activeNav === item.key
                      ? 'text-[#00A991]'
                      : isDark ? 'text-[var(--staff-text-muted)]' : 'text-gray-600'
                  )} />
                ) : null}
                {/* Badge для непрочитанных уведомлений */}
                {item.key === 'notifications' && unreadCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {/* Badge для непрочитанных сообщений в чате */}
                {item.key === 'chat' && totalUnreadChatCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {/* Badge для доставок со статусом AWAITABLE */}
                {item.key === 'delivery' && awaitableDeliveriesCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {/* Badge для платежей с pending статусом */}
                {(item.key === 'payments' || item.key === 'clientsAndOrders') && pendingExtensionCount > 0 && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </div>
              <span className="text-[16px] font-normal leading-normal">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;