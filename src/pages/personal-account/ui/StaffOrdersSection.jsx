import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/tabs';
import { ClipboardList, CreditCard, Truck } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import OrderManagement from './OrderManagement';
import AdminPaymentsPage from './AdminPaymentsPage';
import ManagerMoving from './ManagerMoving';
import AdminMoving from './AdminMoving';

const MODES = {
  REQUESTS: 'requests',
  PAYMENTS: 'payments',
  MOVING: 'moving',
};

const StaffOrdersSection = ({ initialMode }) => {
  const { user } = useAuth();
  const [activeMode, setActiveMode] = useState(initialMode || MODES.REQUESTS);

  useEffect(() => {
    if (initialMode && Object.values(MODES).includes(initialMode)) {
      setActiveMode(initialMode);
    }
  }, [initialMode]);

  const MovingComponent = user?.role === 'ADMIN' ? AdminMoving : ManagerMoving;

  return (
    <div className="w-full min-w-0">
      <Tabs value={activeMode} onValueChange={setActiveMode}>
        <div
          className="overflow-x-auto pb-1 hide-scrollbar -mx-2 px-2 sm:mx-0 sm:px-0"
          role="tablist"
        >
          <TabsList
            className={`
              bg-white px-2 py-3 sm:py-4 rounded-[32px] shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]
              h-auto inline-flex w-max min-w-full sm:min-w-0 sm:w-full mb-4
              flex-wrap sm:flex-nowrap gap-1 sm:gap-0
            `}
          >
            <TabsTrigger
              value={MODES.REQUESTS}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-sm sm:text-base whitespace-nowrap data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
            >
              <ClipboardList className="w-4 h-4 flex-shrink-0" />
              <span>Запросы</span>
            </TabsTrigger>
            <TabsTrigger
              value={MODES.PAYMENTS}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-sm sm:text-base whitespace-nowrap data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
            >
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span>Оплаты</span>
            </TabsTrigger>
            <TabsTrigger
              value={MODES.MOVING}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-sm sm:text-base whitespace-nowrap data-[state=active]:bg-[#00A991]/20 data-[state=active]:text-[#00A991] data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] sm:min-h-0"
            >
              <Truck className="w-4 h-4 flex-shrink-0" />
              <span>Доставка</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={MODES.REQUESTS} className="mt-0">
          <OrderManagement />
        </TabsContent>
        <TabsContent value={MODES.PAYMENTS} className="mt-0">
          <AdminPaymentsPage />
        </TabsContent>
        <TabsContent value={MODES.MOVING} className="mt-0">
          <MovingComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StaffOrdersSection;
