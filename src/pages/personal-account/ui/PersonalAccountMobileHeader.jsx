import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUnreadNotificationsCount } from '../../../shared/lib/hooks/use-notifications';
import extraspaceLogo from '../../../assets/photo_2025-10-08_12-29-41-removebg-preview.png';
import NotificationIcon from './icons/NotificationIcon';
import PersonAccountIcon from './icons/PersonAccountIcon';

const PersonalAccountMobileHeader = memo(({ setActiveNav }) => {
  const navigate = useNavigate();
  const unreadCount = useUnreadNotificationsCount();

  const handleLogoClick = () => navigate('/');
  const handleBellClick = () => setActiveNav('notifications');
  const handlePersonClick = () => setActiveNav('personal');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-[#f5f5f5] overflow-hidden">
      <div className="w-full max-w-[100%] mx-auto px-3 min-[400px]:px-4 flex items-center h-14 min-[360px]:h-16 justify-between gap-2">
        <button
          type="button"
          onClick={handleLogoClick}
          className="flex-shrink min-w-0 flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
          aria-label="На главную"
        >
          <img
            src={extraspaceLogo}
            alt=""
            className="h-8 min-[360px]:h-9 w-auto max-w-[90px] min-[360px]:max-w-[100px] object-contain object-left brightness-0 opacity-80"
          />
          <span className="text-sm min-[360px]:text-base font-semibold text-[#374151] uppercase tracking-tight truncate">
            EXTRA SPACE
          </span>
        </button>

        <div className="flex items-center gap-2 min-[360px]:gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleBellClick}
            className="relative p-1.5 min-[360px]:p-2 rounded-full text-[#374151] hover:bg-black/5 transition-colors"
            aria-label="Уведомления"
          >
            <NotificationIcon className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 flex-shrink-0" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full" />
            )}
          </button>
          <button
            type="button"
            onClick={handlePersonClick}
            className="p-1.5 min-[360px]:p-2 rounded-full text-[#374151] hover:bg-black/5 transition-colors"
            aria-label="Личные данные"
          >
            <PersonAccountIcon className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 flex-shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
});

PersonalAccountMobileHeader.displayName = 'PersonalAccountMobileHeader';

export default PersonalAccountMobileHeader;
