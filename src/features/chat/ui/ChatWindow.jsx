import React, { memo, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { useWebSocket } from '../../../shared/lib/hooks/use-websocket';
import { ChatStatus } from '../../../entities/chat/ui';
import { CHAT_STATUS, USER_ROLES } from '../../../entities/chat/model';
import ServerStatus from '../../../shared/components/ServerStatus';
import WebSocketStatus from '../../../shared/components/WebSocketStatus';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { QuickActions } from './QuickActions';
import { ManagerChatList } from './ManagerChatList';
import { ConnectionError } from './ConnectionError';
import { ChatDebugInfo } from './ChatDebugInfo';

const ChatWindow = memo(({ isOpen, onClose, className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const { 
    chatStatus, 
    isConnected, 
    isReconnecting, 
    activeChat, 
    canStartChat, 
    canSendMessage, 
    isManager,
    startChat,
    sendMessage 
  } = useChat();
  
  const { reconnect } = useWebSocket();
  
  const { 
    groupedMessages, 
    hasMoreMessages, 
    isLoadingMessages, 
    loadMoreMessages 
  } = useChatMessages(activeChat?.id);

  const messagesEndRef = useRef(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [groupedMessages]);

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
      <div className={`chat-widget w-[1015px] h-[840px] bg-white border border-[#b8b8b8] rounded-[14px] relative flex flex-col ${className}`}>
        <div className="h-full flex items-center justify-center bg-gray-50 rounded-[14px]">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Требуется авторизация
            </h3>
            <p className="text-gray-500">
              Войдите в систему для использования чата
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Интерфейс для менеджеров
  if (isManager) {
    return (
      <div className={`chat-widget w-[1015px] h-[840px] bg-white border border-[#b8b8b8] rounded-[14px] relative flex flex-col ${className}`}>
        {/* Заголовок для менеджера */}
        <div className="flex items-center justify-between p-4 border-b border-[#e0e0e0]">
          <div className="flex items-center gap-3">
            <ChatStatus 
              status={chatStatus} 
              isConnected={isConnected} 
              isReconnecting={isReconnecting} 
            />
            <WebSocketStatus 
              isConnected={isConnected} 
              isReconnecting={isReconnecting} 
            />
            <ServerStatus />
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Список чатов для менеджера */}
          <div className="w-80 border-r border-[#e0e0e0]">
            <ManagerChatList />
          </div>
          
          {/* Область сообщений */}
          <div className="flex-1 flex flex-col">
            {activeChat ? (
              <>
                <MessageList 
                  messages={groupedMessages}
                  hasMoreMessages={hasMoreMessages}
                  isLoadingMessages={isLoadingMessages}
                  onLoadMore={loadMoreMessages}
                  messagesEndRef={messagesEndRef}
                />
                <MessageInput 
                  onSend={sendMessage}
                  disabled={!canSendMessage}
                  placeholder="Написать сообщение..."
                />
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <p>Выберите чат для начала общения</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Компонент отладки */}
        <ChatDebugInfo />
      </div>
    );
  }

  // Интерфейс для пользователей
  return (
    <div className={`chat-widget w-[1015px] h-[840px] bg-white border border-[#b8b8b8] rounded-[14px] relative flex flex-col ${className}`}>
      {/* Заголовок чата */}
      <div className="flex items-center justify-between p-4 border-b border-[#e0e0e0]">
        <div className="flex items-center gap-3">
          <ChatStatus 
            status={chatStatus} 
            isConnected={isConnected} 
            isReconnecting={isReconnecting} 
          />
          <WebSocketStatus 
            isConnected={isConnected} 
            isReconnecting={isReconnecting} 
          />
          <ServerStatus />
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Область сообщений */}
      <div className="messages-container h-[600px] overflow-y-auto p-4 flex-1">
        {/* Ошибка подключения */}
        <ConnectionError 
          isConnected={isConnected}
          isReconnecting={isReconnecting}
          onRetry={reconnect}
          onRefresh={() => window.location.reload()}
          className="mb-4"
        />
        
        {!activeChat && chatStatus === CHAT_STATUS.IDLE && (
          <div className="flex flex-col items-center justify-center h-full">
            {!isConnected ? (
              <div className="text-center">
                <p className="text-[16px] font-normal leading-[22px] text-[#757575] mb-4">
                  Нет соединения с сервером
                </p>
                <p className="text-sm text-gray-400 mb-8">
                  Проверьте подключение к интернету или попробуйте позже
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#263554] text-white rounded-lg hover:bg-[#1e2c4f] transition-colors"
                >
                  Обновить страницу
                </button>
              </div>
            ) : (
              <>
                <p className="text-[16px] font-normal leading-[22px] text-[#757575] mb-8">
                  Чат пустой
                </p>
                
                <QuickActions onStart={startChat} canStart={canStartChat} />
              </>
            )}
          </div>
        )}

        {chatStatus === CHAT_STATUS.PENDING && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="loading-spinner w-8 h-8 border-2 border-[#263554] border-t-transparent rounded-full mb-4 animate-spin"></div>
            <p className="text-[16px] font-normal leading-[22px] text-[#757575]">
              Ожидание подключения менеджера...
            </p>
          </div>
        )}

        {(chatStatus === CHAT_STATUS.ACTIVE || activeChat) && (
          <MessageList 
            messages={groupedMessages}
            hasMoreMessages={hasMoreMessages}
            isLoadingMessages={isLoadingMessages}
            onLoadMore={loadMoreMessages}
            messagesEndRef={messagesEndRef}
          />
        )}
      </div>

      {/* Поле ввода */}
      {(chatStatus === CHAT_STATUS.ACTIVE || activeChat) && (
        <MessageInput 
          onSend={sendMessage}
          disabled={!canSendMessage}
          placeholder="Write message"
        />
      )}
      
      {/* Компонент отладки */}
      <ChatDebugInfo />
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export { ChatWindow };