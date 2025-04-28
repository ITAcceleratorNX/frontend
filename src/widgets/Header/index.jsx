import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/lib/hooks/use-auth';
import { Phone, Mail, Lock, User } from 'lucide-react';
import { clsx } from 'clsx';

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
      "px-3 py-2 text-sm font-medium transition-all duration-300 rounded-full whitespace-nowrap",
      isActive
        ? 'bg-white text-[#1A1F2C] border border-gray-200 shadow-sm font-semibold'
        : 'text-[#1A1F2C] hover:bg-gray-50 hover:scale-105'
    );

  return (
    <>
      <header
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full border-b",
          isScrolled 
            ? "bg-white shadow-md border-gray-200" 
            : "bg-white border-gray-100" 
        )}
      >
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          {/* Логотип слева */}
          <div 
            className="flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 mr-3 sm:mr-4 lg:mr-6" 
            onClick={() => navigate('/')}
          >
            <div className="bg-[#1A1F2C] text-white rounded-lg p-2 flex items-center justify-center shadow-md">
              <div className="flex items-center space-x-1.5">
                <Lock size={18} className="text-yellow-400" />
                <div className="font-bold text-xs leading-tight">
                  <div>EXTRA</div>
                  <div>SPACE</div>
                </div>
                <div className="bg-yellow-400 text-[#1A1F2C] text-xs px-1 rounded font-semibold">24</div>
              </div>
            </div>
          </div>

          {/* Центральная навигация со скрытым скроллбаром */}
          <nav className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex justify-center space-x-4 md:space-x-6 min-w-max px-2">
              <NavLink to="/" end className={navLinkClass}>ГЛАВНАЯ</NavLink>
              <NavLink to="/warehouses" className={navLinkClass}>ОБ АРЕНДЕ СКЛАДОВ</NavLink>
              <NavLink to="/cloud-storage" className={navLinkClass}>ОБЛАЧНОЕ ХРАНЕНИЕ</NavLink>
              <NavLink to="/moving" className={navLinkClass}>МУВИНГ</NavLink>
              <NavLink to="/tariffs" className={navLinkClass}>ТАРИФЫ</NavLink>
            </div>
          </nav>

          {/* Кнопки справа с интерактивными эффектами */}
          <div className="flex items-center ml-3 sm:ml-4 lg:ml-6 space-x-3 flex-shrink-0">
            {isAuthenticated ? (
              <button
                onClick={handleLogout}
                className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <User size={16} className="mr-2" />
                <span className="hidden sm:inline">ВЫЙТИ</span>
              </button>
            ) : (
              <button
                onClick={handleStartAuth}
                className="flex items-center justify-center bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                <User size={16} className="mr-2" />
                <span className="hidden sm:inline">ВОЙТИ</span>
              </button>
            )}

            {/* Круглые иконки контактов с интерактивными эффектами */}
            <button className="flex items-center justify-center w-10 h-10 bg-yellow-100 hover:bg-yellow-200 rounded-full text-gray-800 transition-all duration-300 hover:shadow-md hover:scale-110">
              <Phone size={18} />
            </button>
            <button className="flex items-center justify-center w-10 h-10 bg-yellow-100 hover:bg-yellow-200 rounded-full text-gray-800 transition-all duration-300 hover:shadow-md hover:scale-110">
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