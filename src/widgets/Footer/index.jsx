// frontend/src/components/Footer.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserLock, BookText } from 'lucide-react';
import {DISPLAY_PHONE, TEL_LINK} from "/src/shared/components/CallbackRequestModal.jsx";

const Footer = () => {
  const navigate = useNavigate();

  return (
      <>
        <footer className="bg-[#0A142F] w-full text-white font-['SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif] mt-16 pt-10 pb-6" style={{ fontFamily: "'SF Pro Text', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
          <div className="max-w-[1240px] mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start gap-10">
              {/* Логотип и описание */}
              <div className="flex-1">
                <h2 className="text-4xl font-bold font-['Audiowide'] mb-4">ExtraSpace</h2>
                <p className="text-sm text-[#A6A6A6] max-w-sm leading-relaxed">
                  ExtraSpace — надёжное решение для хранения. Мы предлагаем аренду складов в Алматы с круглосуточной охраной, удобным доступом и комфортными условиями хранения.
                </p>
              </div>
            </div>

            {/* Нижняя линия и копирайт */}
            <hr className="my-8 border-white opacity-30" />
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-[#A6A6A6] gap-2">
              <p>Все права защищены. © 2025 extraspace.kz</p>
              <a
                  href={TEL_LINK}
                  className="text-[#B0B0B0]"
              >
                Контакты: {DISPLAY_PHONE}
              </a>
              <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
                <button
                  onClick={() => navigate("/online-payment")}
                  className="text-[#B0B0B0] hover:text-white hover:underline transition-colors duration-200 flex items-center gap-1"
                >
                  <svg width="22" height="22" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0.5" y="1.5" width="15" height="9" rx="1.5" stroke="currentColor" strokeWidth="1"/>
                    <line x1="0.5" y1="4" x2="15.5" y2="4" stroke="currentColor" strokeWidth="1"/>
                    <line x1="3" y1="7.5" x2="5" y2="7.5" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="12" cy="7.5" r="1" stroke="currentColor" strokeWidth="1"/>
                    <circle cx="14" cy="7.5" r="1" stroke="currentColor" strokeWidth="1"/>
                  </svg>
                  Информация об оплате
                </button>
                <Link 
                  to="/offer" 
                  className="text-[#B0B0B0] hover:text-white hover:underline transition-colors duration-200 flex items-center gap-1"
                >
                  <span><BookText /></span>
                  Публичная оферта
                </Link>
                <Link 
                  to="/privacy-policy2" 
                  className="text-[#B0B0B0] hover:text-white hover:underline transition-colors duration-200 flex items-center gap-1"
                >
                  <span>
                  <UserLock />
                  </span>
                  Политика конфиденциальности
                </Link>
          
              </div>
            </div>
          </div>
        </footer>
      </>
  );
};

export default Footer;