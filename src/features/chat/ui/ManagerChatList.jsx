import React, { memo, useState, useMemo } from 'react';
import { Clock, MessageSquare, User, X, Trash2, Users, MoreVertical, Settings, Search } from 'lucide-react';
import { useManagerChats } from '../../../shared/lib/hooks/use-manager-chats';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { useChatStore, CHAT_STATUS } from '../../../entities/chat/model';
import { ClearMessagesButton } from './ClearMessagesButton';
import { PendingChatsPanel } from './PendingChatsPanel';
import { ChangeManagerModal } from './ChangeManagerModal';

const ChatItem = memo(({ chat, isActive, onAccept, onSelect, onChangeManager }) => {
  const [showActions, setShowActions] = useState(false);
  const { unreadMessages } = useChatStore();
  const unreadCount = unreadMessages[chat.id] || 0;

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'ACCEPTED':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CLOSED':
        return 'bg-gray-50 text-gray-600 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-600 border-gray-200';
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
        p-3 border-b border-gray-100 cursor-pointer 
        transition-all duration-200 hover:bg-gray-50 relative
        ${isActive 
          ? 'bg-blue-50 border-l-4 border-l-[#1e2c4f]' 
          : 'border-l-4 border-l-transparent'
        }
      `}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <div className="w-8 h-8 bg-[#1e2c4f] rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {formatUserName(chat)}
            </h4>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(chat.createdAt || Date.now())}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Unread messages санағышы */}
          {unreadCount > 0 && (
            <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
          
          <div className={`px-2 py-1 text-xs rounded border ${getStatusColor(chat.status)}`}>
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
                className="p-1 rounded hover:bg-gray-200 transition-colors"
              >
                <MoreVertical className="w-3 h-3 text-gray-500" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-6 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[120px]">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeManager(chat);
                      setShowActions(false);
                    }}
                    className="w-full px-3 py-1 text-left text-xs hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <Settings className="w-3 h-3" />
                    <span>Сменить</span>
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
          className="w-full mt-1 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded 
                     hover:bg-green-600 transition-colors"
        >
          Принять
        </button>
      )}
    </div>
  );
});

ChatItem.displayName = 'ChatItem';

const ManagerChatList = memo(() => {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
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

  // Фильтрация чатов по поиску
  const filteredActiveChats = useMemo(() => {
    const activeChats = chats.filter(chat => chat.status === 'ACCEPTED');
    
    if (!searchTerm) return activeChats;
    
    return activeChats.filter(chat => {
      const userName = chat.user?.name || `Пользователь #${chat.user_id}`;
      const chatId = chat.id.toString();
      const userId = chat.user_id.toString();
      
      return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             chatId.includes(searchTerm) ||
             userId.includes(searchTerm);
    });
  }, [chats, searchTerm]);

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
      
      // Чатты таңдағанда оқылмаған хабарламаларды тазалау
      const { clearUnreadMessages } = useChatStore.getState();
      clearUnreadMessages(chat.id);
      
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
  const pendingChats = chats.filter(chat => chat.status === 'PENDING');

  if (isLoadingChats) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1e2c4f] mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Заголовок с табами - компактный */}
      <div className="bg-white border-b border-gray-200 p-3">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Users className="w-5 h-5 mr-2 text-[#1e2c4f]" />
            Чаты
          </h3>
          
          <div className="flex items-center gap-1">
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
                <X size={14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Табы - компактные */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded">
          <button
            onClick={() => setActiveTab('pending')}
            className={`
              flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-all
              ${activeTab === 'pending' 
                ? 'bg-white text-amber-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
            <span>Ожидают</span>
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`
              flex items-center space-x-1 px-3 py-1 rounded text-xs font-medium transition-all
              ${activeTab === 'active' 
                ? 'bg-white text-green-600 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span>Активные ({counts.active})</span>
          </button>
        </div>

        {/* Поиск для активных чатов */}
        {activeTab === 'active' && (
          <div className="mt-3 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3 w-3 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Поиск по имени, ID чата или пользователя..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded text-xs placeholder-gray-400 
                         focus:outline-none focus:ring-1 focus:ring-[#1e2c4f] focus:border-[#1e2c4f]"
            />
          </div>
        )}
      </div>

      {/* Уведомления о новых чатах - современный дизайн */}
      {newChatNotifications.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 p-3">
          <div className="space-y-2">
          {newChatNotifications.map((notification) => (
              <div 
                key={notification.chatId} 
                className="group relative flex items-center justify-between bg-white rounded-xl p-3 shadow-sm border border-blue-200 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Индикатор нового уведомления */}
                <div className="absolute top-2 left-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                
                <div className="flex items-center space-x-3 pl-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#1e2c4f] to-[#2d3f5f] rounded-full flex items-center justify-center shadow-sm">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">
                      Новый чат #{notification.chatId}
                    </p>
                    <p className="text-xs text-gray-600">
                      Пользователь ожидает ответа
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleAcceptChat(notification.chatId)}
                  className="flex items-center space-x-1 px-3 py-2 bg-[#1e2c4f] text-white text-xs font-medium rounded-lg hover:bg-[#1e2c4f]/90 transition-all duration-200 hover:shadow-md"
                  title="Принять чат"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>Принять</span>
                </button>

                {/* Hover эффект */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e2c4f]/0 to-[#1e2c4f]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
          
          {/* Общая информация */}
          <div className="mt-3 pt-2 border-t border-blue-200/50">
            <div className="flex items-center justify-between text-xs">
              <span className="text-blue-700 font-medium">
                📢 {newChatNotifications.length} новых уведомлений
              </span>
              <button
                onClick={clearNotifications}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                title="Очистить все уведомления"
              >
                Очистить все
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Содержимое */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'pending' ? (
          <div className="h-full overflow-y-auto p-3">
            <PendingChatsPanel 
              onAcceptChat={handleAcceptChat}
              className="h-full"
            />
          </div>
        ) : (
          <div className="h-full overflow-y-auto bg-white">
            {filteredActiveChats.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center p-6">
                <div>
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-6 h-6 text-gray-400" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {searchTerm ? 'Чаты не найдены' : 'Нет активных чатов'}
                  </h3>
                  <p className="text-gray-500 text-xs">
                    {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Принятые чаты будут отображаться здесь'}
                  </p>
                </div>
              </div>
            ) : (
              filteredActiveChats.map((chat) => (
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

      {/* Подвал с статистикой - компактный */}
      <div className="bg-white border-t border-gray-200 px-3 py-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-600">
            Всего: <span className="font-medium">{counts.total}</span>
          </div>
          {activeChat && (
            <div className="text-[#1e2c4f] font-medium">
              #{activeChat.id}
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