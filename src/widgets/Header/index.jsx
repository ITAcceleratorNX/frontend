import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { User, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Menu, X } from 'lucide-react';
import { useUnreadNotificationsCount } from '../../shared/lib/hooks/use-notifications';
import { useChatStore } from '../../entities/chat/model';
import logo from '../../assets/novaloga.png';

// Константы для контактов
const PHONE_NUMBER = '+7 (778) 391 1425';
const PHONE_LINK = 'tel:+77783911425';
const WHATSAPP_MESSAGE = encodeURIComponent('Здравствуйте! Хочу забронировать бокс.');
const WHATSAPP_LINK = `https://api.whatsapp.com/send/?phone=77783911425&text=${WHATSAPP_MESSAGE}&type=phone_number&app_absent=0`;
const INSTAGRAM_LINK = 'https://www.instagram.com/extraspace.kz?igsh=b3JucXd4YjF3dmw0';

// Мемоизированный компонент Header
export const Header = memo(() => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const unreadCount = useUnreadNotificationsCount();
  const { unreadMessages } = useChatStore();
  
  // Подсчитываем общее количество непрочитанных сообщений в чате
  const totalUnreadChatCount = Object.values(unreadMessages).reduce((sum, count) => sum + count, 0);

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Обработчики контактов
  const handleWhatsAppClick = useCallback(() => {
    window.open(WHATSAPP_LINK, '_blank', 'noopener,noreferrer');
  }, []);

  const handleInstagramClick = useCallback(() => {
    window.open(INSTAGRAM_LINK, '_blank', 'noopener,noreferrer');
  }, []);

  // Остальные обработчики остаются без изменений...
  const handleStartAuth = useCallback(() => {
    setIsMobileMenuOpen(false);
    navigate('/login');
  }, [navigate]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleCabinetClick = useCallback(() => {
    navigate('/personal-account');
  }, [navigate]);

  const handleLogoClick = useCallback(() => navigate('/'), [navigate]);

  const authButtons = useMemo(() => {
    if (isAuthenticated) {
      return (
        <button
          onClick={handleCabinetClick}
          className="flex items-center gap-2 border-2 border-[#31876D] text-[#31876D] bg-white hover:bg-[#31876D]/10 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 relative"
        >
          <User size={16} />
          <span className="hidden sm:inline">ЛИЧНЫЙ КАБИНЕТ</span>
          <ArrowRight size={16} />
          {(unreadCount > 0 || totalUnreadChatCount > 0) && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
          )}
        </button>
      );
    } else {
      return (
        <button
          onClick={handleStartAuth}
          className="flex items-center gap-2 border-2 border-[#31876D] text-[#31876D] bg-white hover:bg-[#31876D]/10 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300"
        >
          <span>Войти</span>
          <ArrowRight size={16} />
        </button>
      );
    }
  }, [isAuthenticated, handleCabinetClick, handleStartAuth, unreadCount, totalUnreadChatCount]);

  const headerClass = useMemo(() =>
          clsx(
              "fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full",
              isScrolled
                  ? "bg-[#FFF] backdrop-blur-sm shadow-md"
                  : "bg-[#FFF] backdrop-blur-sm"
          )
      , [isScrolled]);

  const socialIcons = (
    <>
      <button
        onClick={handleWhatsAppClick}
        className="w-9 h-9 rounded-full border-2 border-[#374151] flex items-center justify-center text-[#374151] hover:bg-[#374151] hover:text-white transition-all duration-300"
        aria-label="WhatsApp"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </button>
      <button
        onClick={handleInstagramClick}
        className="w-9 h-9 rounded-full border-2 border-[#374151] flex items-center justify-center text-[#374151] hover:bg-[#374151] hover:text-white transition-all duration-300"
        aria-label="Instagram"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      </button>
    </>
  );

  return (
      <>
        <header className={clsx(headerClass, 'border-b border-gray-200')}>
          <div className="w-full max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 relative gap-2">
              {/* Левая часть: на мобилке — только телефон, на десктопе — соц. сети + телефон */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-start pl-0 sm:pl-10">
                <div className="hidden sm:flex items-center gap-2">
                  {socialIcons}
                </div>
                <a
                  href={PHONE_LINK}
                  className="text-[#374151] font-medium text-xs sm:text-sm hover:text-[#31876D] transition-colors whitespace-nowrap truncate max-w-[140px] sm:max-w-none"
                  title={PHONE_NUMBER}
                >
                  {PHONE_NUMBER}
                </a>
              </div>

              {/* Центр: лого + название */}
              <div
                className="flex items-center gap-1.5 sm:gap-2 cursor-pointer flex-shrink-0 absolute left-1/2 -translate-x-1/2 transition-transform duration-300 active:scale-95 sm:hover:scale-105"
                onClick={handleLogoClick}
              >
                <img
                  src={logo}
                  alt="ExtraSpace Logo"
                  className="h-7 sm:h-8 w-auto object-contain"
                />
                <span className="font-bold text-[#1F2937] text-xs sm:text-sm tracking-wide hidden min-[380px]:inline">EXTRA SPACE</span>
              </div>

              {/* Правая часть: кнопка Войти / гамбургер */}
              <div className="flex items-center min-w-0 flex-1 justify-end pr-0 sm:pr-10">
                <div className="hidden md:block">
                  {authButtons}
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="md:hidden p-3 -m-1 text-[#374151] touch-manipulation active:opacity-70"
                  aria-label="Меню"
                >
                  {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>

          {/* Мобильное меню */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white py-5 px-6 space-y-5">
              <div className="flex items-center gap-4 justify-center flex-wrap">
                {socialIcons}
                <a href={PHONE_LINK} className="text-[#374151] font-medium text-sm">
                  {PHONE_NUMBER}
                </a>
              </div>
              <div className="flex justify-center">
                {authButtons}
              </div>
            </div>
          )}
        </header>

        <div className="pt-14 sm:pt-16"></div>
      </>
  );
});

Header.displayName = 'Header';

export default Header;