import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/lib/hooks/use-auth';
import { Phone, Mail, Lock, User } from 'lucide-react';
import { clsx } from 'clsx';
import personalImg from '../../assets/personal_account_image.png';
import shadowImg from '../../assets/personal_account_shadow.png';
import cameraIcon from '../../assets/personal_camera.svg';

export const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/email-verification');
  };

  const handleStartAuth = () => {
    navigate('/email-verification');
  };

  // Стили для NavLink с использованием относительных единиц для лучшей адаптивности
  const navLinkClass = ({ isActive }) =>
    clsx(
      "px-4 py-2 text-[13px] font-bold font-['Montserrat'] tracking-[0.05em] leading-[100%] transition-all duration-300 rounded-full whitespace-nowrap",
      isActive
        ? 'bg-white text-[#1A1F2C] border border-gray-200 shadow-sm'
        : 'text-[#1A1F2C] hover:bg-gray-50 hover:scale-105'
    );

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
          isScrolled 
            ? "bg-white shadow-md" 
            : "bg-white" 
        )}
      >
        <div className="w-full max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          {/* Логотип слева */}
          <div 
            className="flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 mr-3 sm:mr-4 lg:mr-6" 
            onClick={() => navigate('/')}
          >
            <div className="text-[#273551] font-['Audiowide'] text-[27px] leading-[100%] tracking-[0.05em] capitalize">
              ExtraSpace
            </div>
          </div>

          {/* Центральная навигация со скрытым скроллбаром */}
          <nav className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex justify-center items-center gap-3 min-w-max">
              <NavLink to="/" end className={navLinkClass}>ГЛАВНАЯ</NavLink>
              <NavLink to="/warehouses" className={navLinkClass}>ОБ АРЕНДЕ СКЛАДОВ</NavLink>
              <NavLink to="/cloud-storage" className={navLinkClass}>ОБЛАЧНОЕ ХРАНЕНИЕ</NavLink>
              <NavLink to="/moving" className={navLinkClass}>МУВИНГ</NavLink>
              <NavLink to="/tariffs" className={navLinkClass}>ТАРИФЫ</NavLink>
            </div>
          </nav>

          {/* Кнопки справа с интерактивными эффектами */}
          <div className="flex items-center ml-3 sm:ml-4 lg:ml-6 mr-0 space-x-2 flex-shrink-0">
            {isAuthenticated ? (
              <button
                onClick={() => navigate('/personal-account')}
                className="relative w-[44px] h-[44px] rounded-full overflow-hidden border-2 border-[#E6E9F5] shadow-md hover:scale-105 transition-all bg-white flex items-center justify-center"
                style={{padding:0}}
              >
                <img
                  src={personalImg}
                  alt="Аватар"
                  className="w-[40px] h-[40px] rounded-full object-cover scale-125"
                />
              </button>
            ) : (
              <button
                onClick={handleStartAuth}
                className="flex items-center justify-center bg-[#C73636] hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <User size={16} className="mr-2" />
                <span className="hidden sm:inline">ВОЙТИ</span>
              </button>
            )}

            {/* Круглые иконки контактов с интерактивными эффектами */}
            <button className="flex items-center justify-center w-10 h-10 bg-[#FEE2B2] hover:bg-yellow-200 rounded-full text-gray-800 transition-all duration-300 hover:shadow-md hover:scale-110">
              <Phone size={18} />
            </button>
            <button className="flex items-center justify-center w-10 h-10 bg-[#FEE2B2] hover:bg-yellow-200 rounded-full text-gray-800 transition-all duration-300 hover:shadow-md hover:scale-110">
              <Mail size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Отступ для контента под фиксированным хедером */}
      <div className="pt-16"></div>

      {/* Стили для скрытия скроллбара и общих эффектов */}
      <style jsx global>{`
        /* Скрыть скроллбар для Chrome, Safari и Opera */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        
        /* Скрыть скроллбар для IE, Edge и Firefox */
        .hide-scrollbar {
          -ms-overflow-style: none;  /* IE и Edge */
          scrollbar-width: none;  /* Firefox */
        }
        
        /* Плавные переходы для всех интерактивных элементов */
        button, a {
          transition: all 0.3s ease;
        }
      `}</style>
    </>
  );
};

export default Header; 