import React, { memo } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import PendingChatsList from '../../../features/chat/ui/PendingChatsList';
import { usePendingChats } from '../../../shared/lib/hooks/use-pending-chats';

const ManagerDashboard = memo(() => {
  const { user } = useAuth();
  const { pendingChatsCount, hasNewChats } = usePendingChats();

  // Проверяем, является ли пользователь менеджером или админом
  if (!user || (user.role !== 'MANAGER' && user.role !== 'ADMIN')) {
    return (
      <div className="w-full max-w-4xl mx-auto p-8">
        <div className="bg-gray-50 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-600 mb-4">
            Доступ ограничен
          </h2>
          <p className="text-gray-500">
            Панель менеджера доступна только для менеджеров и администраторов
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#273655] mb-2">
          Панель менеджера
        </h1>
        <p className="text-gray-600">
          Управление чатами и поддержка клиентов
        </p>
      </div>

      {/* Статистика */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Новые обращения</p>
              <p className="text-2xl font-bold text-gray-900">
                {pendingChatsCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Статус</p>
              <p className="text-2xl font-bold text-green-600">
                Онлайн
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Роль</p>
              <p className="text-2xl font-bold text-gray-900">
                {user.role === 'MANAGER' ? 'Менеджер' : 'Администратор'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Список ожидающих чатов */}
      <div className="bg-gray-50 rounded-lg p-6">
        <PendingChatsList />
      </div>

      {/* Дополнительная информация */}
      {!hasNewChats && (
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Информация для менеджеров
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
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