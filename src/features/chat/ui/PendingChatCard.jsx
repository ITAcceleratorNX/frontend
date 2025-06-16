import React, { memo } from 'react';
import { User, Clock, MessageCircle, CheckCircle, AlertCircle } from 'lucide-react';

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
    
    if (diffMinutes < 1) return 'только что';
    if (diffMinutes < 60) return `${diffMinutes} мин назад`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} ч назад`;
    return chatTime.toLocaleDateString('ru-RU');
  };

  const getWaitingStatus = (timestamp) => {
    const minutes = Math.floor((new Date() - new Date(timestamp)) / (1000 * 60));
    if (minutes < 2) return { color: 'text-green-600', text: 'только что' };
    if (minutes < 5) return { color: 'text-yellow-600', text: 'ожидает' };
    return { color: 'text-red-600', text: 'долго ждет' };
  };

  const waitingStatus = getWaitingStatus(chat.createdAt || Date.now());

  return (
    <div className={`
      bg-white border-2 border-yellow-200 rounded-xl p-4 shadow-sm
      hover:shadow-md hover:border-yellow-300
      transition-all duration-200 transform hover:-translate-y-0.5
      ${className}
    `}>
      {/* Заголовок карточки */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              Пользователь #{chat.user_id}
            </h3>
            <div className="flex items-center space-x-2 text-sm">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">{formatTime(chat.createdAt || Date.now())}</span>
            </div>
          </div>
        </div>
        
        {/* Статус ожидания */}
        <div className="text-right">
          <div className={`flex items-center space-x-1 ${waitingStatus.color}`}>
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{waitingStatus.text}</span>
          </div>
        </div>
      </div>

      {/* Информация о чате */}
      <div className="bg-gray-50 rounded-lg p-3 mb-4">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">ID чата: {chat.id}</span>
          </div>
          <div className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
            ОЖИДАЕТ
          </div>
        </div>
      </div>

      {/* Кнопка принятия */}
      <button
        onClick={() => onAccept(chat.id)}
        disabled={isAccepting}
        className={`
          w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg
          font-medium text-white transition-all duration-200
          ${isAccepting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:shadow-lg transform hover:scale-105'
          }
        `}
      >
        {isAccepting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Принимаю...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-5 h-5" />
            <span>Принять чат</span>
          </>
        )}
      </button>

      {/* Дополнительная информация */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500 text-center">
          Клиент ожидает назначения менеджера
        </p>
      </div>
    </div>
  );
});

PendingChatCard.displayName = 'PendingChatCard';

export { PendingChatCard }; 