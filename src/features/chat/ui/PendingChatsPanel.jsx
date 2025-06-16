import React, { memo } from 'react';
import { AlertCircle, RefreshCw, Users } from 'lucide-react';
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
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Заголовок панели */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-orange-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Ожидающие чаты</h2>
              <p className="text-sm text-gray-600">
                {pendingChatsCount > 0 ? `${pendingChatsCount} клиентов ожидают` : 'Нет ожидающих'}
              </p>
            </div>
          </div>
          
          {/* Кнопка обновления */}
          <button
            onClick={refetchPendingChats}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white rounded-lg transition-colors"
            title="Обновить список"
          >
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Содержимое панели */}
      <div className="p-4">
        {/* Состояние загрузки */}
        {isLoading && pendingChatsCount === 0 && (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-yellow-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p className="text-gray-600">Загрузка ожидающих чатов...</p>
          </div>
        )}

        {/* Ошибка загрузки */}
        {isError && (
          <div className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
            <p className="text-red-600 text-center mb-4">
              Ошибка загрузки: {error?.message || 'Неизвестная ошибка'}
            </p>
            <button
              onClick={refetchPendingChats}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Повторить попытку
            </button>
          </div>
        )}

        {/* Список ожидающих чатов */}
        {!isLoading && !isError && (
          <>
            {pendingChatsCount === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Нет ожидающих чатов
                </h3>
                <p className="text-gray-500">
                  Все клиенты обслужены или нет новых обращений
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingChats.map((chat) => (
                  <PendingChatCard
                    key={chat.id}
                    chat={chat}
                    onAccept={onAcceptChat}
                    isAccepting={false} // TODO: добавить состояние загрузки для конкретного чата
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Подвал с статистикой */}
      {pendingChatsCount > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 rounded-b-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">
              Обновлено: {new Date().toLocaleTimeString('ru-RU')}
            </span>
            <span className="text-yellow-600 font-medium">
              {pendingChatsCount} {pendingChatsCount === 1 ? 'чат ожидает' : 'чатов ожидают'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

PendingChatsPanel.displayName = 'PendingChatsPanel';

export { PendingChatsPanel }; 