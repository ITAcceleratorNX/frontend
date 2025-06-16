import React, { memo, useState } from 'react';
import { Clock, MessageSquare, User, X, Trash2, Users, MoreVertical, Settings } from 'lucide-react';
import { useManagerChats } from '../../../shared/lib/hooks/use-manager-chats';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { useChatStore, CHAT_STATUS } from '../../../entities/chat/model';
import { ClearMessagesButton } from './ClearMessagesButton';
import { PendingChatsPanel } from './PendingChatsPanel';
import { ChangeManagerModal } from './ChangeManagerModal';

const ChatItem = memo(({ chat, isActive, onAccept, onSelect, onChangeManager }) => {
  const [showActions, setShowActions] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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

  // Форматирование имени пользователя
  const formatUserName = (chat) => {
    if (chat.user?.name) {
      return chat.user.name;
    }
    return `Пользователь #${chat.user_id}`;
  };

  return (
    <div 
      className={`
        p-4 border-b border-gray-100 cursor-pointer 
        transition-all duration-200 hover:bg-gray-50 relative
        ${isActive 
          ? 'bg-blue-50 border-l-4 border-l-blue-500 shadow-sm' 
          : 'border-l-4 border-l-transparent'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">
              {formatUserName(chat)}
            </h4>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(chat.createdAt || Date.now())}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className={`px-2 py-1 text-xs rounded-md border ${getStatusColor(chat.status)}`}>
            {getStatusText(chat.status)}
          </div>
          
          {/* Меню действий для активных чатов */}
          {chat.status === 'ACCEPTED' && (
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowActions(!showActions);
                }}
                className="p-1 rounded-full hover:bg-gray-200 transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeManager(chat);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Сменить менеджера</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {chat.status === 'PENDING' && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAccept(chat.id);
          }}
          className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-green-500 to-green-600 
                     text-white text-sm font-medium rounded-lg 
                     hover:from-green-600 hover:to-green-700 
                     transform hover:scale-105 transition-all duration-200"
        >
          Принять чат
        </button>
      )}
    </div>
  );
});

ChatItem.displayName = 'ChatItem';

const ManagerChatList = memo(() => {
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' или 'active'
  const [showChangeManagerModal, setShowChangeManagerModal] = useState(false);
  const [selectedChatForManager, setSelectedChatForManager] = useState(null);
  
  const { 
    chats, 
    newChatNotifications, 
    counts, 
    isLoadingChats, 
    acceptChat,
    clearNotifications,
    clearChatMessages,
    loadChats
  } = useManagerChats();
  
  const { activeChat, acceptChat: acceptChatFromWebSocket } = useChat();
  
  // Для очистки сообщений активного чата
  const { clearMessages } = useChatMessages(activeChat?.id);
  
  // Импортируем store напрямую для установки активного чата
  const { setActiveChat, setChatStatus } = useChatStore();

  // Обработка принятия чата
  const handleAcceptChat = async (chatId) => {
    const success = acceptChatFromWebSocket(chatId);
    if (success) {
      await acceptChat(chatId);
      // Переключаемся на вкладку активных чатов после принятия
      setActiveTab('active');
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

  // Обработка очистки сообщений активного чата
  const handleClearActiveChat = async () => {
    if (!activeChat?.id) return;
    return await clearMessages();
  };

  // Обработка открытия модала смены менеджера
  const handleChangeManager = (chat) => {
    setSelectedChatForManager(chat);
    setShowChangeManagerModal(true);
  };

  // Обработка смены менеджера
  const handleManagerChanged = async () => {
    setShowChangeManagerModal(false);
    setSelectedChatForManager(null);
    // Обновляем список чатов
    await loadChats(true);
  };

  // Фильтруем чаты по статусу
  const activeChats = chats.filter(chat => chat.status === 'ACCEPTED');
  const pendingChats = chats.filter(chat => chat.status === 'PENDING');

  if (isLoadingChats) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Заголовок с табами */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <Users className="w-6 h-6 mr-2 text-blue-600" />
            Управление чатами
          </h3>
          
          <div className="flex items-center gap-2">
            {/* Кнопка очистки сообщений активного чата */}
            {activeChat && (
              <ClearMessagesButton
                onClear={handleClearActiveChat}
                disabled={!activeChat}
                variant="icon"
                className="p-1"
              />
            )}
            
            {newChatNotifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Очистить уведомления"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
        
        {/* Табы */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('pending')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === 'pending' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
            <span>Ожидают ({counts.pending})</span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`
              flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all
              ${activeTab === 'active' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Активные ({counts.active})</span>
          </button>
        </div>
      </div>

      {/* Уведомления о новых чатах */}
      {newChatNotifications.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-3">
          {newChatNotifications.map((notification) => (
            <div key={notification.chatId} className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-900">
                  Новый чат от пользователя #{notification.userId}
                </span>
              </div>
              <button
                onClick={() => handleAcceptChat(notification.chatId)}
                className="px-3 py-1 bg-blue-500 text-white text-xs rounded-md hover:bg-blue-600 transition-colors"
              >
                Принять
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Содержимое */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'pending' ? (
          <div className="h-full overflow-y-auto p-4">
            <PendingChatsPanel 
              onAcceptChat={handleAcceptChat}
              className="h-full"
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto bg-white">
            {activeChats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-8">
                <div>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Нет активных чатов
                  </h3>
                  <p className="text-gray-500">
                    Принятые чаты будут отображаться здесь
                  </p>
                </div>
              </div>
            ) : (
              activeChats.map((chat) => (
                <ChatItem
                  key={chat.id}
                  chat={chat}
                  isActive={activeChat?.id === chat.id}
                  onAccept={handleAcceptChat}
                  onSelect={() => handleSelectChat(chat)}
                  onChangeManager={handleChangeManager}
                />
              ))
            )}
          </div>
        )}
      </div>

      {/* Подвал с статистикой */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center justify-between text-sm">
          <div className="text-gray-600">
            Всего чатов: <span className="font-medium">{counts.total}</span>
          </div>
          {activeChat && (
            <div className="text-blue-600 font-medium">
              Активный: #{activeChat.id}
            </div>
          )}
        </div>
      </div>

      {/* Модал смены менеджера */}
      <ChangeManagerModal
        isOpen={showChangeManagerModal}
        onClose={() => setShowChangeManagerModal(false)}
        chat={selectedChatForManager}
        currentManager={selectedChatForManager?.manager}
        onManagerChanged={handleManagerChanged}
      />
    </div>
  );
});

ManagerChatList.displayName = 'ManagerChatList';

export { ManagerChatList }; 