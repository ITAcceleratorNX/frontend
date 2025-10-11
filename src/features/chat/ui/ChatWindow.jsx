import React, { memo, useEffect, useRef, useState } from 'react';
import { X, Menu, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { useWebSocket } from '../../../shared/lib/hooks/use-websocket';
import { useDeviceType } from '../../../shared/lib/hooks/useWindowWidth';
import { ChatStatus } from '../../../entities/chat/ui';
import { CHAT_STATUS, USER_ROLES } from '../../../entities/chat/model';
import { useChatStore } from '../../../entities/chat/model';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { QuickActions } from './QuickActions';
import { ManagerChatList } from './ManagerChatList';
import { ClearMessagesButton } from './ClearMessagesButton';
// import { ChatDebugInfo } from './ChatDebugInfo';

const ChatWindow = memo(({ isOpen = true, onClose, className = '' }) => {
  const { user, isAuthenticated } = useAuth();
  const { isMobile } = useDeviceType();
  const [showChatList, setShowChatList] = useState(!isMobile);
  
  const { 
    chatStatus, 
    isConnected, 
    isReconnecting, 
    activeChat, 
    canStartChat, 
    canSendMessage, 
    isManager,
    startChat,
    sendMessage,
    markMessagesAsRead
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

  // Управление отображением списка чатов при изменении размера экрана
  useEffect(() => {
    if (isMobile) {
      setShowChatList(false);
    } else {
      setShowChatList(true);
    }
  }, [isMobile]);

  // На мобиле скрываем список чатов при выборе активного чата
  useEffect(() => {
    if (isMobile && activeChat) {
      setShowChatList(false);
    }
  }, [isMobile, activeChat]);

  // Пометка сообщений как прочитанных при открытии чата
  useEffect(() => {
    if (isOpen && activeChat && markMessagesAsRead) {
      // Небольшая задержка, чтобы дать время загрузиться сообщениям
      const timer = setTimeout(() => {
        markMessagesAsRead(activeChat.id);
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeChat, markMessagesAsRead]);

  // Пометка новых сообщений как прочитанных при их получении
  useEffect(() => {
    if (isOpen && activeChat && groupedMessages.length > 0 && markMessagesAsRead) {
      // Помечаем сообщения как прочитанные при получении новых
      const timer = setTimeout(() => {
        markMessagesAsRead(activeChat.id);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeChat, groupedMessages.length, markMessagesAsRead]);

  // Обработка очистки сообщений
  const handleClearMessages = async () => {
    if (!activeChat?.id) return;
    return await clearMessages();
  };

  // Переключение списка чатов на мобиле
  const toggleChatList = () => {
    setShowChatList(!showChatList);
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
      <div className={`
        bg-white border border-gray-200 rounded-lg w-full flex flex-col 
        ${isMobile 
          ? 'h-[calc(100vh-120px)] max-w-full mx-2' 
          : 'max-w-6xl h-[700px]'
        } ${className}
      `}>
        {/* Заголовок для менеджера - адаптивный */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2">
            {/* Кнопка меню для мобиле */}
            {isMobile && (
              <button
                onClick={toggleChatList}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors mr-2"
              >
                {showChatList ? <ArrowLeft size={18} /> : <Menu size={18} />}
              </button>
            )}
            
            <ChatStatus 
              status={chatStatus} 
              isConnected={isConnected} 
              isReconnecting={isReconnecting} 
              managerName={managerName}
            />
            
          </div>
          
          <div className="flex items-center gap-2">
            {/* Кнопка очистки сообщений для менеджера */}
            {activeChat && !showChatList && (
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

        <div className="flex flex-1 overflow-hidden relative">
          {/* Список чатов для менеджера - адаптивный */}
          {showChatList && (
            <div className={`
              border-r border-gray-200 bg-gray-50 
              ${isMobile 
                ? 'absolute inset-0 z-10 w-full' 
                : 'w-80'
              }
            `}>
              <ManagerChatList onChatSelect={isMobile ? toggleChatList : undefined} />
            </div>
          )}
          
          {/* Область сообщений */}
          <div className={`
            flex flex-col 
            ${showChatList && isMobile ? 'hidden' : 'flex-1'}
          `}>
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
              <div className="flex-1 flex items-center justify-center text-gray-500 p-4">
                <div className="text-center">
                  <p className="text-sm mb-2">
                    {isMobile ? 'Выберите чат из списка' : 'Выберите чат для начала общения'}
                  </p>
                  {isMobile && !showChatList && (
                    <button
                      onClick={toggleChatList}
                      className="px-4 py-2 bg-[#1e2c4f] text-white rounded-lg text-sm"
                    >
                      Открыть список чатов
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Компонент отладки */}
        {/* <ChatDebugInfo /> */}
      </div>
    );
  }

  // Интерфейс для пользователей - адаптивный
  return (
    <div className={`
      bg-white border border-gray-200 rounded-lg w-full flex flex-col 
      ${isMobile 
        ? 'h-[calc(100vh-120px)] max-w-full mx-2' 
        : 'max-w-4xl h-[600px]'
      } ${className}
    `}>
      {/* Заголовок чата - адаптивный */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <ChatStatus 
            status={chatStatus} 
            isConnected={isConnected} 
            isReconnecting={isReconnecting} 
            managerName={managerName}
          />
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
              className="text-gray-400 hover:text-gray-600 transition-colors p-1 min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Область сообщений - адаптивная */}
      <div className={`messages-container flex-1 overflow-y-auto ${isMobile ? 'p-3' : 'p-4'}`}>
        {!activeChat && chatStatus === CHAT_STATUS.IDLE && (
          <div className="flex flex-col items-center justify-center h-full">
            {!isConnected ? (
              <div className="text-center px-4">
                <p className={`text-gray-600 mb-4 ${isMobile ? 'text-sm' : ''}`}>
                  Нет соединения с сервером
                </p>
                <p className={`text-gray-400 mb-6 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Проверьте подключение к интернету
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className={`
                    bg-[#263554] text-white rounded-lg hover:bg-[#1e2c4f] transition-colors
                    ${isMobile 
                      ? 'px-6 py-3 text-sm min-h-[44px] w-full max-w-xs' 
                      : 'px-4 py-2 text-sm'
                    }
                  `}
                >
                  Обновить страницу
                </button>
              </div>
            ) : (
              <>
                <p className={`text-gray-500 mb-6 text-center ${isMobile ? 'text-sm px-4' : ''}`}>
                  Начните общение с нашими специалистами
                </p>
                
                <QuickActions onStart={startChat} canStart={canStartChat} />
              </>
            )}
          </div>
        )}

        {chatStatus === CHAT_STATUS.PENDING && (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-6 h-6 border-2 border-[#263554] border-t-transparent rounded-full mb-4 animate-spin"></div>
            <p className={`text-gray-600 text-center ${isMobile ? 'text-sm' : ''}`}>
              Создаем чат...
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

      {/* Поле ввода - адаптивное */}
      {(chatStatus === CHAT_STATUS.ACTIVE || activeChat) && (
        <MessageInput 
          onSend={sendMessage}
          disabled={!canSendMessage}
          placeholder="Напишите сообщение..."
          isMobile={isMobile}
        />
      )}
      
      {/* Компонент отладки */}
      {/* <ChatDebugInfo /> */}
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export { ChatWindow };