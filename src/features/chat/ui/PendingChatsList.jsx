import React, { memo, useCallback } from 'react';
import { Clock, User, MessageCircle } from 'lucide-react';
import { usePendingChats } from '../../../shared/lib/hooks/use-pending-chats';
import { useWebSocket } from '../../../shared/lib/hooks/use-websocket';
import { useAuth } from '../../../shared/context/AuthContext';

// Компонент отдельного ожидающего чата
const PendingChatItem = memo(({ chat, onAccept }) => {
  const handleAccept = useCallback(() => {
    onAccept(chat.id, chat.user_id);
  }, [chat.id, chat.user_id, onAccept]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">
              Пользователь #{chat.user_id}
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock size={14} />
              <span>Ожидает ответа</span>
            </div>
          </div>
        </div>
        
        <button
          onClick={handleAccept}
          className="bg-[#273655] hover:bg-[#1e2c4f] text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
        >
          <MessageCircle size={16} />
          <span>Принять</span>
        </button>
      </div>
    </div>
  );
});

PendingChatItem.displayName = 'PendingChatItem';

// Основной компонент списка ожидающих чатов
const PendingChatsList = memo(({ className = '' }) => {
  const { user } = useAuth();
  const {
    pendingChats,
    pendingChatsCount,
    hasNewChats,
    isLoading,
    isError,
    error,
    refetchPendingChats,
    isManagerOrAdmin
  } = usePendingChats();

  // WebSocket для принятия чатов
  const { sendMessage } = useWebSocket(
    `wss://api.extraspace.kz?userId=${user?.id}`,
    {
      enabled: isManagerOrAdmin,
      reconnectAttempts: 5,
      reconnectInterval: 3000
    }
  );

  // Функция принятия чата
  const handleAcceptChat = useCallback((chatId, userId) => {
    if (!sendMessage || !user) return;

    try {
      sendMessage({
        type: 'ACCEPT_CHAT',
        chatId,
        managerId: user.id
      });

      if (import.meta.env.DEV) {
        console.log('PendingChatsList: Принимаем чат:', { chatId, userId, managerId: user.id });
      }

      // Обновляем список через небольшую задержку
      setTimeout(() => {
        refetchPendingChats();
      }, 1000);

    } catch (error) {
      console.error('Ошибка при принятии чата:', error);
    }
  }, [sendMessage, user, refetchPendingChats]);

  // Если пользователь не менеджер/админ
  if (!isManagerOrAdmin) {
    return null;
  }

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-lg p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#273655]"></div>
            <span className="ml-3 text-gray-600">Загрузка чатов...</span>
          </div>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (isError) {
    return (
      <div className={`${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="text-center">
            <p className="text-red-600 font-medium mb-2">Ошибка загрузки чатов</p>
            <p className="text-red-500 text-sm mb-4">
              {error?.message || 'Не удалось загрузить список ожидающих чатов'}
            </p>
            <button
              onClick={refetchPendingChats}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Попробовать снова
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Если нет ожидающих чатов
  if (!hasNewChats) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-lg p-8">
          <div className="text-center">
            <MessageCircle size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Нет ожидающих чатов
            </h3>
            <p className="text-gray-500">
              Все новые обращения будут отображаться здесь
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#273655]">
            Новые обращения
          </h2>
          <div className="flex items-center space-x-2">
            <span className="bg-red-100 text-red-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
              {pendingChatsCount}
            </span>
            <button
              onClick={refetchPendingChats}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Обновить список"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>
        <p className="text-gray-600 mt-1">
          Клиенты ожидают ответа от менеджера
        </p>
      </div>

      <div className="space-y-4">
        {pendingChats.map((chat) => (
          <PendingChatItem
            key={chat.id}
            chat={chat}
            onAccept={handleAcceptChat}
          />
        ))}
      </div>
    </div>
  );
});

PendingChatsList.displayName = 'PendingChatsList';

export default PendingChatsList; 