import React from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';
import icon1 from '../../../assets/1.svg';
import icon2 from '../../../assets/2.svg';
import icon3 from '../../../assets/3.svg';
import icon4 from '../../../assets/4.svg';
import icon5 from '../../../assets/5.svg';
import icon6 from '../../../assets/6.svg';
import icon8 from '../../../assets/8.svg';
import icon9 from '../../../assets/9.svg';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { USER_QUERY_KEY } from '../../../shared/lib/hooks/use-user-query';
import { useAuth } from '../../../shared/context/AuthContext';

// Разделы для обычных пользователей
const userNavItems = [
  { label: 'Личные данные', icon: icon1, key: 'personal' },
  { label: 'Договоры', icon: icon2, key: 'contracts' },
  { label: 'Чат', icon: icon3, key: 'chat' },
  { label: 'Платежи', icon: icon4, key: 'payments' },
  { divider: true },
  { label: 'Настройки', icon: icon5, key: 'settings' },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

// Разделы для менеджеров
const managerNavItems = [
  { label: 'Личные данные', icon: icon1, key: 'personal' },
  { label: 'Чат', icon: icon3, key: 'chat' },
  { label: 'Настройки', icon: icon5, key: 'settings' },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

// Разделы для администраторов
const adminNavItems = [
  { label: 'Личные данные', icon: icon1, key: 'personal' },
  { label: 'Пользователи', icon: icon8, key: 'users' },
  { label: 'Склады', icon: icon9, key: 'warehouses' },
  { divider: true },
  { label: 'Настройки', icon: icon5, key: 'settings' },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Определяем, какие разделы показать в зависимости от роли
  const getNavItemsByRole = (role) => {
    switch (role) {
      case 'ADMIN':
        return adminNavItems;
      case 'MANAGER':
        return managerNavItems;
      default:
        return userNavItems;
    }
  };

  const navItems = getNavItemsByRole(user?.role);

  const handleNavClick = async (key) => {
    setActiveNav(key);
    if (key === 'logout') {
      try {
        // Показываем уведомление о начале процесса выхода
        const logoutToast = toast.loading("Выполняется выход из системы...");
        
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
          const logoutUrl = 'https://extraspace-backend.onrender.com/auth/logout?redirect=https://frontend-6j9m.onrender.com/';
          
          // Обновляем уведомление
          toast.update(logoutToast, {
            render: "Выход выполнен успешно!", 
            type: "success", 
            isLoading: false,
            autoClose: 2000
          });
          
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
            console.log('Ошибка при запросе на выход:', error);
            // Игнорируем ошибку, т.к. куки уже очищены на клиенте
          }
          
          // Обновляем уведомление
          toast.update(logoutToast, {
            render: "Выход выполнен успешно!", 
            type: "success", 
            isLoading: false,
            autoClose: 2000
          });
          
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
        toast.error("Произошла ошибка при выходе, но вы были успешно разлогинены");
        
        // При неожиданной ошибке также перенаправляем на главную
        setTimeout(() => {
        navigate('/');
        }, 300);
      }
    }
    // Здесь можно добавить переходы для других пунктов
  };

  return (
    <aside className="w-[220px] min-h-screen bg-white flex flex-col py-12 px-5 font-['Nunito Sans']">
      <nav className="flex flex-col gap-1 mb-2 font-['Nunito Sans']">
        {navItems.map((item, idx) => {
          if (item.divider) {
            return <hr key={idx} className="my-3 border-t border-[#F0F0F0]" />;
          }
          return (
            <button
              key={item.key}
              onClick={() => handleNavClick(item.key)}
              className={clsx(
                'flex items-center gap-3 px-4 py-2 rounded-sm font-normal text-[16px] transition-all relative',
                activeNav === item.key
                  ? 'bg-[#273655] text-white shadow-md'
                  : 'text-[#222] hover:bg-[#F5F5F5]',
                'group'
              )}
              style={{marginBottom: idx === navItems.length - 1 ? 0 : 4, fontFamily: 'Nunito Sans'}}
            >
              {activeNav === item.key && item.key !== 'logout' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-1 rounded-r-sm bg-[#273655]" style={{marginLeft: '-16px'}}></span>
              )}
              <img src={item.icon} alt="icon" className={clsx('w-5 h-5', activeNav === item.key ? 'filter invert' : 'filter brightness-0')} />
              <span className="font-['Nunito Sans'] font-normal">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar; 