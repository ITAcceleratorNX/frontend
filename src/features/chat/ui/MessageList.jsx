import React, { memo, useEffect, useRef } from 'react';
import { ChevronUp } from 'lucide-react';
import { ChatMessage } from '../../../entities/chat/ui';

const MessageList = memo(({ 
  messages = [], 
  hasMoreMessages = false, 
  isLoadingMessages = false, 
  onLoadMore, 
  messagesEndRef,
  className = '' 
}) => {
  const containerRef = useRef(null);
  
  // Скролл к последнему сообщению при добавлении новых
  useEffect(() => {
    if (messagesEndRef?.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, messagesEndRef]);

  // Обработка скролла для загрузки истории
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    
    // Если прокрутили в самый верх и есть еще сообщения
    if (scrollTop === 0 && hasMoreMessages && !isLoadingMessages && onLoadMore) {
      onLoadMore();
    }
  };

  // Форматирование даты для разделителей DD.MM
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    
    // Проверяем валидность даты
    if (isNaN(date.getTime())) {
      if (import.meta.env.DEV) {
        console.error('MessageList: Invalid date for formatDate:', timestamp);
      }
      return 'Неверная дата';
    }
    
    return date.toLocaleDateString('ru-RU', { 
      day: '2-digit', 
      month: '2-digit' 
    });
  };

  // Получить дату без времени для сравнения
  const getDateOnly = (timestamp) => {
    if (!timestamp) {
      if (import.meta.env.DEV) {
        console.warn('MessageList: Empty timestamp for getDateOnly');
      }
      return new Date().setHours(0, 0, 0, 0);
    }
    
    const date = new Date(timestamp);
    
    // Проверяем валидность даты
    if (isNaN(date.getTime())) {
      if (import.meta.env.DEV) {
        console.error('MessageList: Invalid timestamp for getDateOnly:', timestamp);
      }
      return new Date().setHours(0, 0, 0, 0);
    }
    
    // Возвращаем дату без времени для корректного сравнения
    return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  };

  // Группировка сообщений с разделителями дат
  const processMessages = () => {
    if (!messages.length) return [];
    
    const processed = [];
    let lastDate = null;
    
    messages.forEach((message, index) => {
      // Приоритет created_at из API (ISO формат)
      const messageTimestamp = message.created_at;
      
      // Проверяем наличие временной метки
      if (!messageTimestamp) {
        if (import.meta.env.DEV) {
          console.warn('MessageList: Сообщение без created_at:', message);
        }
        return; // Пропускаем сообщение без даты
      }
      
      const messageDate = getDateOnly(messageTimestamp);
      
      // Если дата изменилась, добавляем разделитель
      if (lastDate !== messageDate) {
        processed.push({
          type: 'date',
          date: messageTimestamp,
          id: `date-${messageDate}`
        });
        lastDate = messageDate;
      }
      
      // Добавляем сообщение
      processed.push({
        type: 'message',
        ...message
      });
    });
    
    return processed;
  };

  // Компонент разделителя даты
  const renderDateSeparator = (timestamp, key) => (
    <div key={key} className="flex items-center justify-center my-4">
      <div className="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-medium">
        {formatDate(timestamp)}
      </div>
    </div>
  );

  // Рендер сообщения или разделителя
  const renderMessage = (messageData, index) => {
    if (messageData.type === 'date') {
      return renderDateSeparator(messageData.date, messageData.id);
    }

    const isFromUser = messageData.is_from_user;
    const showAvatar = !isFromUser;
    
    return (
      <div key={messageData.id} className="mb-3">
        <ChatMessage 
          message={messageData}
          isFromUser={isFromUser}
          showAvatar={showAvatar}
        />
      </div>
    );
  };

  const processedMessages = processMessages();

  return (
    <div 
      ref={containerRef}
      className={`flex-1 overflow-y-auto p-4 space-y-2 ${className}`}
      onScroll={handleScroll}
    >
      {/* Кнопка "Загрузить еще" */}
      {hasMoreMessages && (
        <div className="flex justify-center mb-4">
            <button
              onClick={onLoadMore}
            disabled={isLoadingMessages}
            className={`
              flex items-center space-x-2 px-3 py-2 rounded-lg text-xs transition-colors
              ${isLoadingMessages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }
            `}
          >
            {isLoadingMessages ? (
              <>
                <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
                <span>Загрузка...</span>
              </>
            ) : (
              <>
                <ChevronUp className="w-3 h-3" />
                <span>Загрузить ранние сообщения</span>
              </>
            )}
            </button>
        </div>
      )}

      {/* Сообщения */}
      {processedMessages.length > 0 ? (
        processedMessages.map((messageData, index) => renderMessage(messageData, index))
      ) : (
        <div className="flex items-center justify-center h-32 text-gray-400">
          <p className="text-sm">Сообщений пока нет</p>
          </div>
        )}
        
        {/* Якорь для автоскролла */}
        <div ref={messagesEndRef} />
    </div>
  );
});

MessageList.displayName = 'MessageList';

export { MessageList }; 