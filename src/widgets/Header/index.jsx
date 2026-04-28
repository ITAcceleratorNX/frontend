import React, { useEffect, useState, memo, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../shared/context/AuthContext';
import { User, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';
import { Menu, X } from 'lucide-react';
import { useUnreadNotificationsCount } from '../../shared/lib/hooks/use-notifications';
import { useChatStore } from '../../entities/chat/model';
import logo from '../../assets/novaloga.png';
import { WHATSAPP_LINK, TELEGRAM_LINK } from '../../shared/components/CallbackRequestModal.jsx';

// Константы для контактов
const PHONE_NUMBER = '+7 (778) 391 1425';
const PHONE_LINK = 'tel:+77783911425';

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
                  ? "bg-[#FFF] backdrop-blur-sm shadow-md translate-y-0"
                  : "bg-[#FFF] backdrop-blur-sm -translate-y-full"
          )
      , [isScrolled]);

  const messengerIcons = useMemo(
    () => (
      <>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full border-2 border-[#374151] flex items-center justify-center text-[#374151] hover:bg-[#374151] hover:text-white transition-all duration-300"
          aria-label="WhatsApp"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
          </svg>
        </a>
        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="w-9 h-9 rounded-full border-2 border-[#374151] flex items-center justify-center text-[#374151] hover:bg-[#374151] hover:text-white transition-all duration-300"
          aria-label="Telegram"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 1.332-.39 1.9-.559 1.9-.56z" />
          </svg>
        </a>
      </>
    ),
    [],
  );

  return (
      <>
        <header className={clsx(headerClass, 'border-b border-gray-200')}>
          <div className="w-full max-w-[100%] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16 relative gap-2">
              {/* Левая часть: мессенджеры + телефон */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 justify-start pl-0 sm:pl-10">
                <div className="hidden sm:flex items-center gap-2">{messengerIcons}</div>
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
                {messengerIcons}
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