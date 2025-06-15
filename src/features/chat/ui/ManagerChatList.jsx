import React, { memo } from 'react';
import { Clock, MessageSquare, User, X } from 'lucide-react';
import { useManagerChats } from '../../../shared/lib/hooks/use-manager-chats';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatStore, CHAT_STATUS } from '../../../entities/chat/model';

const ChatItem = memo(({ chat, isActive, onAccept, onSelect }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Ожидает';
      case 'ACCEPTED':
        return 'Активный';
      case 'CLOSED':
        return 'Закрыт';
      default:
        return status;
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className={`p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-blue-50 border-blue-200' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <User size={16} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-900">
            Пользователь {chat.user_id}
          </span>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(chat.status)}`}>
          {getStatusText(chat.status)}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center space-x-1">
          <Clock size={12} />
          <span>{formatTime(chat.createdAt || Date.now())}</span>
        </div>
        
        {chat.status === 'PENDING' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAccept(chat.id);
            }}
            className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
          >
            Принять
          </button>
        )}
      </div>
    </div>
  );
});

ChatItem.displayName = 'ChatItem';

const ManagerChatList = memo(() => {
  const { 
    chats, 
    newChatNotifications, 
    counts, 
    isLoadingChats, 
    acceptChat,
    clearNotifications
  } = useManagerChats();
  
  const { activeChat, acceptChat: acceptChatFromWebSocket } = useChat();
  
  // Импортируем store напрямую для установки активного чата
  const { setActiveChat, setChatStatus } = useChatStore();

  // Обработка принятия чата
  const handleAcceptChat = async (chatId) => {
    const success = acceptChatFromWebSocket(chatId);
    if (success) {
      await acceptChat(chatId);
    }
  };

  // Обработка выбора чата
  const handleSelectChat = (chat) => {
    if (chat.status === 'ACCEPTED') {
      // Устанавливаем активный чат
      setActiveChat({ id: chat.id, user_id: chat.user_id, manager_id: chat.manager_id });
      setChatStatus(CHAT_STATUS.ACTIVE);
      
      if (import.meta.env.DEV) {
        console.log('ManagerChatList: Активирован чат:', chat.id, 'статус:', CHAT_STATUS.ACTIVE);
      }
    } else if (chat.status === 'PENDING') {
      // Для ожидающих чатов предлагаем принять
      handleAcceptChat(chat.id);
    }
  };

  if (isLoadingChats) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Заголовок с счетчиками */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">Чаты</h3>
          {newChatNotifications.length > 0 && (
            <button
              onClick={clearNotifications}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Ожидают: {counts.pending}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Активные: {counts.active}</span>
          </div>
        </div>
      </div>

      {/* Уведомления о новых чатах */}
      {newChatNotifications.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200">
          {newChatNotifications.map((notification) => (
            <div key={notification.chatId} className="p-3 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare size={16} className="text-blue-500" />
                <span className="text-sm text-blue-800">
                  Новый чат от пользователя {notification.userId}
                </span>
              </div>
              <button
                onClick={() => handleAcceptChat(notification.chatId)}
                className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
              >
                Принять
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Список чатов */}
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <MessageSquare size={48} className="mx-auto mb-2 text-gray-300" />
            <p>Нет активных чатов</p>
          </div>
        ) : (
          chats.map((chat) => (
            <ChatItem
              key={chat.id}
              chat={chat}
              isActive={activeChat?.id === chat.id}
              onAccept={handleAcceptChat}
              onSelect={() => handleSelectChat(chat)}
            />
          ))
        )}
      </div>

      {/* Статистика */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="text-xs text-gray-600">
          Всего чатов: {counts.total}
        </div>
      </div>
    </div>
  );
});

ManagerChatList.displayName = 'ManagerChatList';

export { ManagerChatList }; 