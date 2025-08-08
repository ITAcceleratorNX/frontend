import React, { memo } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useDeviceType } from '../../../shared/lib/hooks/useWindowWidth';
import PendingChatsList from '../../../features/chat/ui/PendingChatsList';
import { usePendingChats } from '../../../shared/lib/hooks/use-pending-chats';

const ManagerDashboard = memo(() => {
  const { user } = useAuth();
  const { isMobile } = useDeviceType();
  const { pendingChatsCount, hasNewChats } = usePendingChats();

  // Проверяем, является ли пользователь менеджером или админом
  if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
    return (
      <div className={`w-full mx-auto ${isMobile ? 'p-4' : 'max-w-4xl p-8'}`}>
        <div className={`bg-gray-50 rounded-lg text-center ${isMobile ? 'p-8' : 'p-12'}`}>
          <h2 className={`font-bold text-gray-600 mb-4 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
            Доступ ограничен
          </h2>
          <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Панель менеджера доступна только для менеджеров и администраторов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
        <h1 className={`font-bold text-[#273655] mb-2 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
          Панель менеджера
        </h1>
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
          Управление чатами и поддержка клиентов
        </p>
      </div>

      {/* Статистика */}
      <div className={`grid grid-cols-1 md:grid-cols-3 ${isMobile ? 'gap-4 mb-6' : 'gap-6 mb-8'}`}>
        <div className={`bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center">
            <div className={`
              bg-blue-100 rounded-lg flex items-center justify-center
              ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}
            `}>
              <svg className={`text-blue-600 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className={`${isMobile ? 'ml-3' : 'ml-4'}`}>
              <p className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Новые обращения</p>
              <p className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {pendingChatsCount}
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center">
            <div className={`
              bg-green-100 rounded-lg flex items-center justify-center
              ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}
            `}>
              <svg className={`text-green-600 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={`${isMobile ? 'ml-3' : 'ml-4'}`}>
              <p className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Статус</p>
              <p className={`font-bold text-green-600 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                Онлайн
              </p>
            </div>
          </div>
        </div>

        <div className={`bg-white rounded-lg border border-gray-200 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex items-center">
            <div className={`
              bg-purple-100 rounded-lg flex items-center justify-center
              ${isMobile ? 'w-10 h-10' : 'w-12 h-12'}
            `}>
              <svg className={`text-purple-600 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className={`${isMobile ? 'ml-3' : 'ml-4'}`}>
              <p className={`font-medium text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>Роль</p>
              <p className={`font-bold text-gray-900 ${isMobile ? 'text-xl' : 'text-2xl'}`}>
                {user.role === 'MANAGER' ? 'Менеджер' : 'Администратор'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Список ожидающих чатов */}
      <div className={`bg-gray-50 rounded-lg ${isMobile ? 'p-4' : 'p-6'}`}>
        <PendingChatsList />
      </div>

      {/* Дополнительная информация */}
      {!hasNewChats && (
        <div className={`
          bg-blue-50 border border-blue-200 rounded-lg
          ${isMobile ? 'mt-6 p-4' : 'mt-8 p-6'}
        `}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className={`text-blue-600 ${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className={`${isMobile ? 'ml-2' : 'ml-3'}`}>
              <h3 className={`font-medium text-blue-800 ${isMobile ? 'text-sm' : 'text-sm'}`}>
                Информация для менеджеров
              </h3>
              <div className={`mt-2 text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                <ul className={`list-disc list-inside ${isMobile ? 'space-y-0.5' : 'space-y-1'}`}>
                  <li>Новые обращения клиентов будут отображаться автоматически</li>
                  <li>Система обновляет список каждые 5 секунд</li>
                  <li>Вы можете принять любой ожидающий чат</li>
                  <li>После принятия чата вы сможете общаться с клиентом в реальном времени</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

ManagerDashboard.displayName = 'ManagerDashboard';

export default ManagerDashboard; 