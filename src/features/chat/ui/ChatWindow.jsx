import React, { memo, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { useWebSocket } from '../../../shared/lib/hooks/use-websocket';
import { ChatStatus } from '../../../entities/chat/ui';
import { CHAT_STATUS, USER_ROLES } from '../../../entities/chat/model';
import { useChatStore } from '../../../entities/chat/model';
import ServerStatus from '../../../shared/components/ServerStatus';
import WebSocketStatus from '../../../shared/components/WebSocketStatus';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { QuickActions } from './QuickActions';
import { ManagerChatList } from './ManagerChatList';
import { ChatDebugInfo } from './ChatDebugInfo';
import { ClearMessagesButton } from './ClearMessagesButton';

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
  
  const { managerName } = useChatStore();
  
  const { reconnect } = useWebSocket();
  
  const { 
    groupedMessages, 
    hasMoreMessages, 
    isLoadingMessages, 
    loadMoreMessages,
    clearMessages 
  } = useChatMessages(activeChat?.id);

  const messagesEndRef = useRef(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [groupedMessages]);

  // Обработка очистки сообщений
  const handleClearMessages = async () => {
    if (!activeChat?.id) return;
    return await clearMessages();
  };

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg w-full max-w-4xl h-[600px] flex flex-col ${className}`}>
        <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center p-6">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Требуется авторизация
            </h3>
            <p className="text-gray-500 text-sm">
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
      <div className={`bg-white border border-gray-200 rounded-lg w-full max-w-6xl h-[700px] flex flex-col ${className}`}>
        {/* Заголовок для менеджера - компактный */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-3">
            <ChatStatus 
              status={chatStatus} 
              isConnected={isConnected} 
              isReconnecting={isReconnecting} 
              managerName={managerName}
            />
            <div className="flex items-center gap-2">
            <WebSocketStatus 
              isConnected={isConnected} 
              isReconnecting={isReconnecting} 
            />
            <ServerStatus />
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Кнопка очистки сообщений для менеджера */}
            {activeChat && (
              <ClearMessagesButton
                onClear={handleClearMessages}
                disabled={!activeChat}
                variant="icon"
                className="mr-2"
              />
            )}
            
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Список чатов для менеджера - компактный */}
          <div className="w-80 border-r border-gray-200 bg-gray-50">
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
                <p className="text-sm">Выберите чат для начала общения</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Компонент отладки */}
        <ChatDebugInfo />
      </div>
    );
  }

  // Интерфейс для пользователей - компактный
  return (
    <div className={`bg-white border border-gray-200 rounded-lg w-full max-w-4xl h-[600px] flex flex-col ${className}`}>
      {/* Заголовок чата - компактный */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-3">
          <ChatStatus 
            status={chatStatus} 
            isConnected={isConnected} 
            isReconnecting={isReconnecting} 
            managerName={managerName}
          />
          <div className="flex items-center gap-2">
          <WebSocketStatus 
            isConnected={isConnected} 
            isReconnecting={isReconnecting} 
          />
          <ServerStatus />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Кнопка очистки сообщений для пользователя */}
          {(activeChat && (chatStatus === CHAT_STATUS.ACTIVE || groupedMessages.length > 0)) && (
            <ClearMessagesButton
              onClear={handleClearMessages}
              disabled={!activeChat}
              variant="icon"
              className="mr-2"
            />
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Область сообщений - оптимизированная высота */}
      <div className="messages-container flex-1 overflow-y-auto p-4">
        {!activeChat && chatStatus === CHAT_STATUS.IDLE && (
          <div className="flex flex-col items-center justify-center h-full">
            {!isConnected ? (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Нет соединения с сервером
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  Проверьте подключение к интернету
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-[#263554] text-white rounded-lg hover:bg-[#1e2c4f] transition-colors text-sm"
                >
                  Обновить страницу
                </button>
              </div>
            ) : (
              <>
                <p className="text-gray-500 mb-6 text-center">
                  Начните общение с нашими специалистами
                </p>
                
                <QuickActions onStart={startChat} canStart={canStartChat} />
              </>
            )}
          </div>
        )}

        {chatStatus === CHAT_STATUS.PENDING && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-[#263554] border-t-transparent rounded-full mb-4 animate-spin"></div>
            <p className="text-gray-600 text-center">
              Подключаем менеджера...
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

      {/* Поле ввода - компактное */}
      {(chatStatus === CHAT_STATUS.ACTIVE || activeChat) && (
        <MessageInput 
          onSend={sendMessage}
          disabled={!canSendMessage}
          placeholder="Напишите сообщение..."
        />
      )}
      
      {/* Компонент отладки */}
      <ChatDebugInfo />
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export { ChatWindow };