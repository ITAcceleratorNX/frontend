import React, { memo } from 'react';
import { Clock, RefreshCw, Users, MessageCircle } from 'lucide-react';
import { usePendingChats } from '../../../shared/lib/hooks/use-pending-chats';
import { PendingChatCard } from './PendingChatCard';

const PendingChatsPanel = memo(({ onAcceptChat, className = '' }) => {
  const {
    pendingChats,
    pendingChatsCount,
    isLoading,
    isError,
    error,
    refetchPendingChats,
    isManagerOrAdmin
  } = usePendingChats();

  // Если пользователь не менеджер
  if (!isManagerOrAdmin) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Заголовок - компактный */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
            <Clock className="w-4 h-4 text-white" />
            </div>
            <div>
            <h3 className="font-semibold text-gray-900">Новые обращения</h3>
            <p className="text-xs text-gray-500">Ожидают назначения</p>
            </div>
          </div>
          
        <div className="flex items-center space-x-2">
          {pendingChatsCount > 0 && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
              {pendingChatsCount}
            </span>
          )}
          <button
            onClick={refetchPendingChats}
            disabled={isLoading}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
            title="Обновить"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Контент */}
      <div className="p-4">
        {isLoading && (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center space-x-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-sm">Загрузка...</span>
            </div>
          </div>
        )}

        {isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700 mb-2">
              <MessageCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Ошибка загрузки</span>
            </div>
            <p className="text-xs text-red-600 mb-3">
              {error?.message || 'Не удалось загрузить чаты'}
            </p>
            <button
              onClick={refetchPendingChats}
              className="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition-colors"
            >
              Повторить
            </button>
          </div>
        )}

        {!isLoading && !isError && pendingChatsCount === 0 && (
          <div className="py-8 text-center">
            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-600 mb-1">
              Нет новых обращений
            </h4>
            <p className="text-xs text-gray-400">
              Все чаты обработаны
                </p>
              </div>
        )}

        {!isLoading && !isError && pendingChatsCount > 0 && (
          <div className="space-y-3">
                {pendingChats.map((chat) => (
                  <PendingChatCard
                    key={chat.id}
                    chat={chat}
                    onAccept={onAcceptChat}
                  />
                ))}
              </div>
        )}
      </div>
    </div>
  );
});

PendingChatsPanel.displayName = 'PendingChatsPanel';

export { PendingChatsPanel }; 