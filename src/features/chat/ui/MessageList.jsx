import React, { memo, useEffect, useRef } from 'react';
import { ChatMessage } from '../../../entities/chat/ui';
import { USER_ROLES } from '../../../entities/chat/model';
import { useAuth } from '../../../shared/context/AuthContext';

const MessageList = memo(({ 
  messages = [], 
  hasMoreMessages = false, 
  isLoadingMessages = false, 
  onLoadMore, 
  messagesEndRef,
  className = '' 
}) => {
  const { user } = useAuth();
  const messagesContainerRef = useRef(null);
  const lastMessageCount = useRef(messages.length);
  
  // Автоскролл при добавлении новых сообщений (только если пользователь внизу)
  useEffect(() => {
    if (messages.length > lastMessageCount.current && messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
      
      if (isAtBottom && messagesEndRef?.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
    lastMessageCount.current = messages.length;
  }, [messages.length, messagesEndRef]);

  // Обработка скролла для загрузки предыдущих сообщений
  const handleScroll = (e) => {
    const { scrollTop } = e.target;
    
    // Если пользователь почти докрутил до верха и есть еще сообщения
    if (scrollTop < 100 && hasMoreMessages && !isLoadingMessages && onLoadMore) {
      onLoadMore();
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long'
    });
  };

  const renderDateSeparator = (date, key) => (
    <div key={key} className="flex justify-center my-4">
      <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
        {date}
      </span>
    </div>
  );

  const renderMessage = (messageData, index) => {
    const isFromUser = user?.role !== USER_ROLES.MANAGER ? messageData.is_from_user : !messageData.is_from_user;
    const showAvatar = index === 0 || messages[index - 1]?.is_from_user !== messageData.is_from_user;
    
    return (
      <div key={messageData.id} className="message-item animate-fadeInUp mb-4">
        <ChatMessage 
          message={messageData}
          isFromUser={isFromUser}
          showAvatar={showAvatar}
        />
      </div>
    );
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Индикатор загрузки предыдущих сообщений */}
      {hasMoreMessages && (
        <div className="flex justify-center py-2">
          {isLoadingMessages ? (
            <div className="flex items-center text-gray-500 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-gray-400 mr-2"></div>
              Загрузка сообщений...
            </div>
          ) : (
            <button
              onClick={onLoadMore}
              className="text-blue-500 hover:text-blue-600 text-sm px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Загрузить предыдущие сообщения
            </button>
          )}
        </div>
      )}

      {/* Контейнер сообщений */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 space-y-1"
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Пока нет сообщений</p>
          </div>
        ) : (
          messages.map((item, index) => {
            // Обработка элементов группированных сообщений
            if (item.type === 'date') {
              return renderDateSeparator(item.date, item.id);
            } else if (item.type === 'message') {
              return renderMessage(item, index);
            } else {
              // Обычное сообщение (без группировки)
              return renderMessage(item, index);
            }
          })
        )}
        
        {/* Якорь для автоскролла */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});

MessageList.displayName = 'MessageList';

export { MessageList }; 