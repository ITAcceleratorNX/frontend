import React, { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, CreditCard, Truck, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import PersonalAccountMobileHeader from './PersonalAccountMobileHeader';
import UserOrdersPage from './UserOrdersPage';
import UserPayments from './UserPayments';
import UserDelivery from './UserDelivery';
import PersonalData from './PersonalData';
import PersonalDataLegal from './PersonalDataLegal';
import MobileNotificationsView from './MobileNotificationsView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import instImage from '../../../assets/inst.webp';
import clsx from 'clsx';

const TABS = [
  { key: 'orders', label: 'Брони', icon: FileText },
  { key: 'payments', label: 'Платежи', icon: CreditCard },
  { key: 'delivery', label: 'Доставка', icon: Truck },
];

const MobileOrdersLayout = memo(({ activeNav, setActiveNav, lastOrdersTab = 'orders' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isInstructionOpen, setIsInstructionOpen] = useState(false);

  const handleBookClick = () => navigate('/');
  const isOrdersSection = ['orders', 'payments', 'delivery'].includes(activeNav);
  const isPersonalOrNotifications = ['personal', 'notifications'].includes(activeNav);

  const renderContent = () => {
    switch (activeNav) {
      case 'orders':
        return <UserOrdersPage embeddedMobile onPayOrder={() => setActiveNav('payments')} />;
      case 'payments':
        return <UserPayments embeddedMobile />;
      case 'delivery':
        return <UserDelivery embeddedMobile />;
      case 'personal':
        return user?.user_type === 'LEGAL' ? (
          <PersonalDataLegal embeddedMobile />
        ) : (
          <PersonalData embeddedMobile />
        );
      case 'notifications':
        return <MobileNotificationsView />;
      default:
        return <UserOrdersPage embeddedMobile onPayOrder={() => setActiveNav('payments')} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] overflow-x-hidden">
      <PersonalAccountMobileHeader setActiveNav={setActiveNav} onInstructionClick={() => setIsInstructionOpen(true)} />
      <div className="pt-14 min-[360px]:pt-16" />

      <div className="flex-1 px-3 min-[400px]:px-4 py-3 min-[360px]:py-4 min-w-0">
        {isPersonalOrNotifications && (
          <>
            <button
              type="button"
              onClick={() => setActiveNav(lastOrdersTab)}
              className="flex items-center gap-1 min-[360px]:gap-1.5 text-[#374151] hover:text-[#1f2937] mb-3 min-[360px]:mb-4 -ml-0.5"
              aria-label="Назад"
            >
              <ChevronLeft className="w-5 h-5 min-[360px]:w-6 min-[360px]:h-6 flex-shrink-0" />
              <span className="text-sm min-[360px]:text-base font-medium">Назад</span>
            </button>
            <div className="min-h-[200px] min-w-0">{renderContent()}</div>
          </>
        )}

        {isOrdersSection && (
          <>
            <div className="mb-3 min-[360px]:mb-4">
              <h1 className="text-lg min-[360px]:text-xl sm:text-2xl font-bold text-gray-900 mb-1 break-words">
                Добро пожаловать в Extra Space!
              </h1>
              <p className="text-sm min-[360px]:text-base text-gray-600 break-words">
                Привет, {user?.name || 'Пользователь'}. Добро пожаловать.
              </p>
            </div>

            <button
              type="button"
              onClick={handleBookClick}
              className="w-full py-2.5 min-[360px]:py-3 px-3 min-[360px]:px-4 rounded-[25px] bg-[#00A991] hover:bg-[#00A991]/90 text-white font-medium text-sm min-[360px]:text-base shadow-md hover:shadow-lg transition-all mb-3 min-[360px]:mb-4"
            >
              Забронировать боксы
            </button>

            <div className="bg-white rounded-[25px] p-1 min-[360px]:p-1.5 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)] mb-3 min-[360px]:mb-4 overflow-hidden">
              <div className="flex gap-0.5 min-[360px]:gap-1">
                {TABS.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveNav(key)}
                    className={clsx(
                      'flex-1 min-w-0 flex items-center justify-center gap-1 min-[360px]:gap-2 py-2 min-[360px]:py-2.5 px-1.5 min-[360px]:px-3 rounded-[25px] text-xs min-[360px]:text-sm font-medium transition-colors overflow-hidden',
                      activeNav === key
                        ? 'bg-[#00A991]/20 text-[#00A991]'
                        : 'text-[#8B8B8B] hover:bg-gray-50'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5 min-[360px]:w-4 min-[360px]:h-4 flex-shrink-0" />
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="min-h-[200px] min-w-0">{renderContent()}</div>
          </>
        )}
      </div>
      
      {/* Модальное окно с инструкцией */}
      <Dialog open={isInstructionOpen} onOpenChange={setIsInstructionOpen}>
        <DialogContent className="max-w-[98vw] max-h-[90vh] overflow-y-auto p-4">
          <DialogHeader>
            <DialogTitle>Инструкция</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center w-full">
            <img src={instImage} alt="Инструкция" className="w-full h-auto" />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

MobileOrdersLayout.displayName = 'MobileOrdersLayout';

export default MobileOrdersLayout;
