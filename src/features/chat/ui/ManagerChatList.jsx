import React, { memo, useMemo } from 'react';
import { useManagerChats } from '../../../shared/lib/hooks/use-manager-chats';
import { useAuth } from '../../../shared/context/AuthContext';
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  User, 
  AlertTriangle,
  RefreshCw,
  WifiOff
} from 'lucide-react';

const ManagerChatList = memo(() => {
  const { user } = useAuth();
  const { 
    chats, 
    isLoading, 
    error, 
    acceptChat, 
    activeChat, 
    setActiveChat,
    refetch
  } = useManagerChats();

  // Проверяем права доступа
  if (user?.role !== 'MANAGER' && user?.role !== 'ADMIN') {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Доступ запрещен
          </h3>
          <p className="text-gray-500">
            Только менеджеры могут управлять чатами
          </p>
        </div>
      </div>
    );
  }

  // Обработка ошибок сети
  if (error) {
    const isNetworkError = error.code === 'TIMEOUT' || 
                          error.code === 'NETWORK_ERROR' || 
                          error.code === 'NO_RESPONSE';
    
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          {isNetworkError ? (
            <>
              <WifiOff size={48} className="text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Нет подключения к серверу
              </h3>
              <p className="text-gray-500 mb-4">
                Проверьте подключение к интернету и попробуйте снова
              </p>
            </>
          ) : (
            <>
              <AlertTriangle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Ошибка загрузки чатов
              </h3>
              <p className="text-gray-500 mb-4">
                {error.message || 'Произошла ошибка при загрузке данных'}
              </p>
            </>
          )}
          
          <button
            onClick={refetch}
            className="px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2c4f] transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // Состояние загрузки
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#273655] mx-auto mb-4"></div>
          <p className="text-gray-500">Загрузка чатов...</p>
        </div>
      </div>
    );
  }

  // Группировка чатов по статусу
  const groupedChats = useMemo(() => {
    if (!chats || chats.length === 0) return { pending: [], active: [], closed: [] };
    
    return chats.reduce((acc, chat) => {
      switch (chat.status) {
        case 'PENDING':
          acc.pending.push(chat);
          break;
        case 'ACCEPTED':
        case 'ACTIVE':
          acc.active.push(chat);
          break;
        case 'CLOSED':
          acc.closed.push(chat);
          break;
        default:
          acc.pending.push(chat);
      }
      return acc;
    }, { pending: [], active: [], closed: [] });
  }, [chats]);

  // Компонент элемента чата
  const ChatItem = memo(({ chat, onAccept, onSelect, isActive }) => {
    const getStatusConfig = () => {
      switch (chat.status) {
        case 'PENDING':
          return {
            icon: Clock,
            text: 'Ожидает',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200'
          };
        case 'ACCEPTED':
        case 'ACTIVE':
          return {
            icon: CheckCircle,
            text: 'Активный',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
          };
        case 'CLOSED':
          return {
            icon: MessageCircle,
            text: 'Закрыт',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
          };
        default:
          return {
            icon: Clock,
            text: 'Неизвестно',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
          };
      }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <div 
        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
          isActive 
            ? 'border-[#273655] bg-blue-50' 
            : `${config.borderColor} ${config.bgColor}`
        }`}
        onClick={() => onSelect(chat)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <User size={16} className="text-gray-600" />
            <span className="font-medium text-gray-800">
              Пользователь #{chat.user_id}
            </span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${config.bgColor} ${config.color}`}>
            <Icon size={12} />
            <span>{config.text}</span>
          </div>
        </div>
        
        {chat.last_message && (
          <p className="text-sm text-gray-600 mb-2 truncate">
            {chat.last_message}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {chat.created_at ? new Date(chat.created_at).toLocaleString('ru-RU') : 'Недавно'}
          </span>
          
          {chat.status === 'PENDING' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAccept(chat.id);
              }}
              className="px-3 py-1 bg-[#273655] text-white text-xs rounded hover:bg-[#1e2c4f] transition-colors"
            >
              Принять
            </button>
          )}
        </div>
      </div>
    );
  });

  ChatItem.displayName = 'ChatItem';

  // Компонент секции чатов
  const ChatSection = memo(({ title, chats, onAccept, onSelect, activeChat }) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
          {title} ({chats.length})
        </h3>
        <div className="space-y-3">
          {chats.map(chat => (
            <ChatItem
              key={chat.id}
              chat={chat}
              onAccept={onAccept}
              onSelect={onSelect}
              isActive={activeChat?.id === chat.id}
            />
          ))}
        </div>
      </div>
    );
  });

  ChatSection.displayName = 'ChatSection';

  // Если нет чатов
  if (!chats || chats.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <MessageCircle size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Нет активных чатов
          </h3>
          <p className="text-gray-500 mb-4">
            Новые чаты появятся здесь автоматически
          </p>
          <button
            onClick={refetch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={16} />
            Обновить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-2xl mx-auto">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Управление чатами
          </h2>
          <button
            onClick={refetch}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Обновить список чатов"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {groupedChats.pending.length}
            </div>
            <div className="text-sm text-yellow-700">Ожидают</div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">
              {groupedChats.active.length}
            </div>
            <div className="text-sm text-green-700">Активные</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-600">
              {groupedChats.closed.length}
            </div>
            <div className="text-sm text-gray-700">Закрытые</div>
          </div>
        </div>

        {/* Списки чатов */}
        <ChatSection
          title="Ожидающие чаты"
          chats={groupedChats.pending}
          onAccept={acceptChat}
          onSelect={setActiveChat}
          activeChat={activeChat}
        />
        
        <ChatSection
          title="Активные чаты"
          chats={groupedChats.active}
          onAccept={acceptChat}
          onSelect={setActiveChat}
          activeChat={activeChat}
        />
        
        <ChatSection
          title="Закрытые чаты"
          chats={groupedChats.closed}
          onAccept={acceptChat}
          onSelect={setActiveChat}
          activeChat={activeChat}
        />
      </div>
    </div>
  );
});

ManagerChatList.displayName = 'ManagerChatList';

export { ManagerChatList }; 