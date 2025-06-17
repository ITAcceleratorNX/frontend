import React, { memo } from 'react';
import { User, Clock, CheckCircle } from 'lucide-react';

const PendingChatCard = memo(({ 
  chat, 
  onAccept, 
  isAccepting = false, 
  className = '' 
}) => {
  const formatTime = (timestamp) => {
    const now = new Date();
    const chatTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - chatTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'сейчас';
    if (diffMinutes < 60) return `${diffMinutes}м`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}ч`;
    return chatTime.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
  };

  const getWaitingStatus = (timestamp) => {
    const minutes = Math.floor((new Date() - new Date(timestamp)) / (1000 * 60));
    if (minutes < 2) return { color: 'text-green-600', priority: 'low' };
    if (minutes < 5) return { color: 'text-amber-600', priority: 'medium' };
    return { color: 'text-red-600', priority: 'high' };
  };

  const waitingStatus = getWaitingStatus(chat.createdAt || Date.now());

  // Форматирование имени пользователя
  const getUserDisplayName = () => {
    if (chat.user?.name) {
      return chat.user.name;
    }
    return `Пользователь #${chat.user_id}`;
  };

  return (
    <div className={`
      group bg-white border border-gray-200 rounded-lg p-3 shadow-sm
      hover:shadow-md hover:border-gray-300 transition-all duration-200
      ${className}
    `}>
      {/* Заголовок - компактный */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#1e2c4f] rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-sm text-gray-900 truncate">
              {getUserDisplayName()}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Clock className="w-3 h-3" />
              <span>{formatTime(chat.createdAt || Date.now())}</span>
              <span className={`w-1 h-1 rounded-full ${waitingStatus.color.replace('text-', 'bg-')}`}></span>
            </div>
          </div>
        </div>
        
        {/* Статус - минимальный */}
          <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-500">#{chat.id}</span>
        </div>
      </div>

      {/* Кнопка принятия - компактная */}
      <button
        onClick={() => onAccept(chat.id)}
        disabled={isAccepting}
        className={`
          w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-md
          text-sm font-medium transition-all duration-200
          ${isAccepting 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-md'
          }
        `}
      >
        {isAccepting ? (
          <>
            <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
            <span>Принимаю...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4" />
            <span>Принять</span>
          </>
        )}
      </button>
    </div>
  );
});

PendingChatCard.displayName = 'PendingChatCard';

export { PendingChatCard }; 