import React from 'react';
import clsx from 'clsx';
import { useAuth } from '../../../shared/lib/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import icon1 from '../../../assets/1.svg';
import icon2 from '../../../assets/2.svg';
import icon3 from '../../../assets/3.svg';
import icon4 from '../../../assets/4.svg';
import icon5 from '../../../assets/5.svg';
import icon6 from '../../../assets/6.svg';

const navItems = [
  { label: 'Личные данные', icon: icon1, key: 'personal' },
  { label: 'Договоры', icon: icon2, key: 'contracts' },
  { label: 'Чат', icon: icon3, key: 'chat' },
  { label: 'Платежи', icon: icon4, key: 'payments' },
  { divider: true },
  { label: 'Настройки', icon: icon5, key: 'settings' },
  { label: 'Выйти', icon: icon6, key: 'logout' },
];

const Sidebar = ({ activeNav, setActiveNav }) => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleNavClick = async (key) => {
    setActiveNav(key);
    if (key === 'logout') {
      try {
        // Вызываем асинхронный метод logout
        const result = await logout();
        
        if (result.success) {
          // Перенаправляем пользователя на главную страницу
          navigate('/');
        } else {
          console.error('Ошибка при выходе:', result.error);
          // Всё равно перенаправляем пользователя, даже если был сбой на сервере
          navigate('/');
        }
      } catch (error) {
        console.error('Ошибка при выходе из системы:', error);
        // При неожиданной ошибке также перенаправляем на главную
        navigate('/');
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