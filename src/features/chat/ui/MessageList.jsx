import React, { memo } from 'react';
import { ChatMessage } from '../../../entities/chat/ui';
import { USER_ROLES } from '../../../entities/chat/model';
import { useAuth } from '../../../shared/context/AuthContext';

const MessageList = memo(({ 
  messages = [], 
  hasMoreMessages, 
  isLoadingMessages, 
  onLoadMore, 
  messagesEndRef 
}) => {
  const { user } = useAuth();

  if (messages.length === 0 && !isLoadingMessages) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Сообщений пока нет</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Кнопка загрузки предыдущих сообщений */}
      {hasMoreMessages && messages.length > 0 && (
        <div className="text-center mb-4">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMessages}
            className="text-sm text-[#263554] hover:text-[#1e2a42] disabled:opacity-50 transition-colors px-4 py-2 rounded-md hover:bg-gray-50"
          >
            {isLoadingMessages ? 'Загрузка...' : 'Загрузить предыдущие сообщения'}
          </button>
        </div>
      )}

      {/* Отображение сообщений с разделителями дат */}
      <div className="space-y-4 flex-1">
        {messages.map((item, index) => {
          if (item.type === 'date') {
            return (
              <div key={item.id} className="text-center">
                <span className="text-[12px] font-normal leading-[17px] text-[#757575] bg-white px-3 py-1 rounded-full border border-gray-200">
                  {item.date}
                </span>
              </div>
            );
          }

          const message = item;
          const isFromUser = user?.role !== USER_ROLES.MANAGER ? message.is_from_user : !message.is_from_user;
          
          return (
            <div key={`${message.id}-${index}`} className="message-item animate-fadeInUp">
              <ChatMessage 
                message={message} 
                isFromUser={isFromUser}
                showAvatar={!isFromUser}
              />
            </div>
          );
        })}
      </div>
      
      {/* Элемент для автоскролла */}
      <div ref={messagesEndRef} />
    </div>
  );
});

MessageList.displayName = 'MessageList';

export { MessageList }; 