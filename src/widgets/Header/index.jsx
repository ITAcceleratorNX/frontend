import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { Phone, Mail, User } from 'lucide-react';
import { clsx } from 'clsx';
import ToggleableEmailForm from '../../features/auth/ui/ToggleableEmailForm';

// Мемоизированный компонент Header
export const Header = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false);

  // Логирование только в режиме разработки при изменении статуса авторизации
  useEffect(() => {
    if (import.meta.env.DEV) {
    console.log('Header: Состояние авторизации обновлено:', {
      isAuthenticated,
        user: user ? `${user.name} (${user.email})` : undefined
    });
    }
  }, [isAuthenticated, user]);
    
  // Обработчик прокрутки
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      if (scrolled !== isScrolled) {
        setIsScrolled(scrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  // Мемоизированные обработчики событий
  const handleStartAuth = useCallback(() => {
    if (import.meta.env.DEV) {
    console.log('Header: Открытие формы входа');
    }
    setIsEmailFormOpen(true);
  }, []);

  const handleCabinetClick = useCallback(() => {
    if (import.meta.env.DEV) {
    console.log('Header: Переход в личный кабинет');
    }
    navigate('/personal-account');
  }, [navigate]);

  // Мемоизированный переход на главную
  const handleLogoClick = useCallback(() => navigate('/'), [navigate]);

  // Мемоизированная функция для стилей NavLink
  const getNavLinkClass = useCallback(({ isActive }) =>
    clsx(
      "px-4 py-2 text-[13px] font-bold font-['Montserrat'] tracking-[0.05em] leading-[100%] transition-all duration-300 rounded-full whitespace-nowrap",
      isActive
        ? 'bg-white text-[#1A1F2C] border border-gray-200 shadow-sm'
        : 'text-[#1A1F2C] hover:bg-gray-50 hover:scale-105'
    ), []);

  // Мемоизируем компонент закрытия формы эл. почты
  const handleCloseEmailForm = useCallback(() => setIsEmailFormOpen(false), []);

  // Мемоизируем пользовательские кнопки
  const authButtons = useMemo(() => {
    if (isAuthenticated) {
      return (
        <button
          onClick={handleCabinetClick}
          className="flex items-center justify-center bg-[#273551] hover:bg-[#1e2c4f] text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <User size={16} className="mr-2" />
          <span className="hidden sm:inline">ЛИЧНЫЙ КАБИНЕТ</span>
        </button>
      );
    } else {
  return (
        <button
          onClick={handleStartAuth}
          className="flex items-center justify-center bg-[#C73636] hover:bg-red-600 text-white px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 hover:shadow-lg hover:scale-105"
        >
          <User size={16} className="mr-2" />
          <span className="hidden sm:inline">ВОЙТИ</span>
        </button>
      );
    }
  }, [isAuthenticated, handleCabinetClick, handleStartAuth]);

  // Класс для хедера, зависящий от прокрутки
  const headerClass = useMemo(() => 
    clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
          isScrolled 
            ? "bg-white shadow-md" 
            : "bg-white" 
    )
  , [isScrolled]);

  if (import.meta.env.DEV) {
    console.log('Рендеринг компонента Header');
  }

  return (
    <>
      <header className={headerClass}>
        <div className="w-full max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-16">
          {/* Логотип слева */}
          <div 
            className="flex-shrink-0 cursor-pointer transition-transform duration-300 hover:scale-105 mr-3 sm:mr-4 lg:mr-6" 
            onClick={handleLogoClick}
          >
            <div className="text-[#273551] font-['Orbitron'] text-[27px] leading-[100%] tracking-[0.05em] capitalize">
              ExtraSpace
            </div>
          </div>

          {/* Центральная навигация со скрытым скроллбаром */}
          <nav className="flex-1 overflow-x-auto hide-scrollbar">
            <div className="flex justify-center items-center gap-3 min-w-max">
              <NavLink to="/" end className={getNavLinkClass}>ГЛАВНАЯ</NavLink>
              <NavLink to="/about-warehouse-rental" className={getNavLinkClass}>ОБ АРЕНДЕ СКЛАДОВ</NavLink>
              <NavLink to="/cloud-storage" className={getNavLinkClass}>ОБЛАЧНОЕ ХРАНЕНИЕ</NavLink>
              <NavLink to="/moving" className={getNavLinkClass}>МУВИНГ</NavLink>
              <NavLink to="/tariffs" className={getNavLinkClass}>ТАРИФЫ</NavLink>
            </div>
          </nav>

          {/* Кнопки справа с интерактивными эффектами */}
          <div className="flex items-center ml-3 sm:ml-4 lg:ml-6 mr-0 space-x-2 flex-shrink-0">
            {authButtons}

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

      {/* Компонент проверки email */}
      <ToggleableEmailForm 
        isOpen={isEmailFormOpen} 
        onClose={handleCloseEmailForm} 
      />
    </>
  );
});

Header.displayName = 'Header';

export default Header; 