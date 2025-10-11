import React, { memo, useState, useMemo } from 'react';
import { MessageSquare, User, X, Trash2, Users, MoreVertical, Settings, Search } from 'lucide-react';
import { useManagerChats } from '../../../shared/lib/hooks/use-manager-chats';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { useChatStore, CHAT_STATUS } from '../../../entities/chat/model';
import { useDeviceType } from '../../../shared/lib/hooks/useWindowWidth';
import { ClearMessagesButton } from './ClearMessagesButton';
import { PendingChatsPanel } from './PendingChatsPanel';
import { ChangeManagerModal } from './ChangeManagerModal';

const ChatItem = memo(({ chat, isActive, onAccept, onSelect, onChangeManager }) => {
  const [showActions, setShowActions] = useState(false);
  const { unreadMessages } = useChatStore();
  const { isMobile } = useDeviceType();
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
        ${isMobile ? 'p-4' : 'p-3'} border-b border-gray-100 cursor-pointer 
        transition-all duration-200 hover:bg-gray-50 relative
        ${isMobile ? 'min-h-[72px]' : ''}
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
          </div>
        </div>
        
        <div className="flex items-center space-x-1">
          {/* Unread messages индикатор */}
          {unreadCount > 0 && (
            <div className={`
              bg-red-500 text-white rounded-full text-center font-medium
              ${isMobile 
                ? 'text-xs px-2 py-1 min-w-[24px] min-h-[24px] flex items-center justify-center' 
                : 'text-xs px-2 py-1 min-w-[20px]'
              }
            `}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
          
          <div className={`
            rounded border text-center
            ${isMobile 
              ? 'px-3 py-2 text-xs' 
              : 'px-2 py-1 text-xs'
            } ${getStatusColor(chat.status)}
          `}>
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
                className={`
                  rounded hover:bg-gray-200 transition-colors
                  ${isMobile 
                    ? 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center' 
                    : 'p-1'
                  }
                `}
              >
                <MoreVertical className={`text-gray-500 ${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />
              </button>
              
              {showActions && (
                <div className={`
                  absolute right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg
                  ${isMobile 
                    ? 'top-12 py-2 min-w-[140px]' 
                    : 'top-6 py-1 min-w-[120px]'
                  }
                `}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onChangeManager(chat);
                      setShowActions(false);
                    }}
                    className={`
                      w-full text-left hover:bg-gray-50 flex items-center space-x-2
                      ${isMobile 
                        ? 'px-4 py-3 text-sm' 
                        : 'px-3 py-1 text-xs'
                      }
                    `}
                  >
                    <Settings className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />
                    <span>Сменить</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
});

ChatItem.displayName = 'ChatItem';

const ManagerChatList = memo(({ onChatSelect }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChangeManagerModal, setShowChangeManagerModal] = useState(false);
  const [selectedChatForManager, setSelectedChatForManager] = useState(null);
  const { isMobile } = useDeviceType();
  
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
  
  const { getUnreadCount } = useChatStore();
  
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
      
      // На мобиле вызываем onChatSelect для скрытия списка чатов
      if (isMobile && onChatSelect) {
        onChatSelect();
      }
      
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
          <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-sm'}`}>Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Заголовок с табами - адаптивный */}
      <div className={`bg-white border-b border-gray-200 ${isMobile ? 'p-4' : 'p-3'}`}>
        <div className={`flex items-center justify-between ${isMobile ? 'mb-4' : 'mb-3'}`}>
          <h3 className={`font-semibold text-gray-900 flex items-center ${isMobile ? 'text-base' : 'text-lg'}`}>
            <Users className={`mr-2 text-[#1e2c4f] ${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
            Чаты
          </h3>
          
          <div className="flex items-center gap-1">
            {/* Кнопка очистки сообщений активного чата */}
            {activeChat && (
              <ClearMessagesButton
                onClear={handleClearActiveChat}
                disabled={!activeChat}
                variant="icon"
                className={isMobile ? 'p-2 min-w-[44px] min-h-[44px]' : 'p-1'}
              />
            )}
            
            {newChatNotifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className={`
                  text-gray-400 hover:text-gray-600 transition-colors
                  ${isMobile 
                    ? 'p-2 min-w-[44px] min-h-[44px] flex items-center justify-center' 
                    : 'p-1'
                  }
                `}
                title="Очистить уведомления"
              >
                <X size={isMobile ? 16 : 14} />
              </button>
            )}
          </div>
        </div>
        
        {/* Заголовок активных чатов */}
        <div className="flex items-center space-x-2 text-gray-600">
          <div className={`bg-green-400 rounded-full ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`}></div>
          <span className={`font-medium ${isMobile ? 'text-sm' : 'text-xs'}`}>
            Активные чаты ({counts.active})
          </span>
        </div>

        {/* Поиск */}
        {(
          <div className={`relative ${isMobile ? 'mt-4' : 'mt-3'}`}>
            <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none ${isMobile ? 'pl-4' : 'pl-3'}`}>
              <Search className={`text-gray-400 ${isMobile ? 'h-4 w-4' : 'h-3 w-3'}`} />
            </div>
            <input
              type="text"
              placeholder={isMobile ? "Поиск чатов..." : "Поиск по имени, ID чата или пользователя..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`
                w-full border border-gray-200 rounded placeholder-gray-400 
                focus:outline-none focus:ring-1 focus:ring-[#1e2c4f] focus:border-[#1e2c4f]
                ${isMobile 
                  ? 'pl-12 pr-4 py-3 text-sm min-h-[44px]' 
                  : 'pl-8 pr-3 py-2 text-xs'
                }
              `}
            />
          </div>
        )}
      </div>

      {/* Уведомления о новых чатах - адаптивный дизайн */}
      {newChatNotifications.length > 0 && (
        <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 ${isMobile ? 'p-4' : 'p-3'}`}>
          <div className={`${isMobile ? 'space-y-3' : 'space-y-2'}`}>
          {newChatNotifications.map((notification) => (
              <div 
                key={notification.chatId} 
                className={`
                  group relative flex items-center justify-between bg-white rounded-xl shadow-sm border border-blue-200 
                  hover:shadow-md transition-all duration-300 hover:scale-[1.02]
                  ${isMobile ? 'p-4' : 'p-3'}
                `}
              >
                {/* Индикатор нового уведомления */}
                <div className={`absolute top-2 left-2 bg-blue-500 rounded-full animate-pulse ${isMobile ? 'w-3 h-3' : 'w-2 h-2'}`}></div>
                
                <div className={`flex items-center pl-2 ${isMobile ? 'space-x-4' : 'space-x-3'}`}>
                  <div className={`
                    bg-gradient-to-r from-[#1e2c4f] to-[#2d3f5f] rounded-full flex items-center justify-center shadow-sm
                    ${isMobile ? 'w-10 h-10' : 'w-8 h-8'}
                  `}>
                    <MessageSquare className={`text-white ${isMobile ? 'w-5 h-5' : 'w-4 h-4'}`} />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold text-gray-900 ${isMobile ? 'text-base' : 'text-sm'}`}>
                      Новый чат #{notification.chatId}
                    </p>
                    <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                      Пользователь ожидает ответа
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={() => handleAcceptChat(notification.chatId)}
                  className={`
                    flex items-center space-x-1 bg-[#1e2c4f] text-white font-medium rounded-lg 
                    hover:bg-[#1e2c4f]/90 transition-all duration-200 hover:shadow-md
                    ${isMobile 
                      ? 'px-4 py-3 text-sm min-h-[44px]' 
                      : 'px-3 py-2 text-xs'
                    }
                  `}
                  title="Принять чат"
                >
                  <MessageSquare className={`${isMobile ? 'w-4 h-4' : 'w-3 h-3'}`} />
                  <span>Принять</span>
                </button>

                {/* Hover эффект */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#1e2c4f]/0 to-[#1e2c4f]/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            ))}
          </div>
          
          {/* Общая информация */}
          <div className={`pt-2 border-t border-blue-200/50 ${isMobile ? 'mt-4' : 'mt-3'}`}>
            <div className={`flex items-center justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
              <span className="text-blue-700 font-medium">
                📢 {newChatNotifications.length} новых уведомлений
              </span>
              <button
                onClick={clearNotifications}
                className={`
                  text-blue-600 hover:text-blue-800 font-medium transition-colors
                  ${isMobile ? 'py-2 px-1 min-h-[44px]' : ''}
                `}
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
        <div className="h-full overflow-y-auto bg-white">
          {filteredActiveChats.length === 0 ? (
            <div className={`h-full flex items-center justify-center text-center ${isMobile ? 'p-8' : 'p-6'}`}>
              <div>
                <div className={`
                  bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3
                  ${isMobile ? 'w-16 h-16' : 'w-12 h-12'}
                `}>
                  <MessageSquare className={`text-gray-400 ${isMobile ? 'w-8 h-8' : 'w-6 h-6'}`} />
                </div>
                <h3 className={`font-medium text-gray-900 mb-2 ${isMobile ? 'text-base' : 'text-sm'}`}>
                  {searchTerm ? 'Чаты не найдены' : 'Нет активных чатов'}
                </h3>
                <p className={`text-gray-500 ${isMobile ? 'text-sm' : 'text-xs'}`}>
                  {searchTerm ? 'Попробуйте изменить поисковый запрос' : 'Назначенные чаты будут отображаться здесь'}
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
      </div>

      {/* Подвал с статистикой - адаптивный */}
      <div className={`bg-white border-t border-gray-200 ${isMobile ? 'px-4 py-3' : 'px-3 py-2'}`}>
        <div className={`flex items-center justify-between ${isMobile ? 'text-sm' : 'text-xs'}`}>
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