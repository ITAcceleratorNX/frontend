import React, { memo, useEffect, useRef, useMemo } from 'react';
import { X, Wifi, WifiOff, AlertTriangle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useChat } from '../../../shared/lib/hooks/use-chat';
import { useChatMessages } from '../../../shared/lib/hooks/use-chat-messages';
import { ChatStatus } from '../../../entities/chat/ui';
import { CHAT_STATUS, USER_ROLES } from '../../../entities/chat/model';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { QuickActions } from './QuickActions';
import { ManagerChatList } from './ManagerChatList';

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
    sendMessage,
    connectionError,
    forceReconnect
  } = useChat();
  
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

  // Определяем роль пользователя
  const isUser = user?.role === 'USER';

  // Мемоизируем статус соединения для оптимизации
  const connectionStatus = useMemo(() => {
    if (isConnected) return 'connected';
    if (isReconnecting) return 'reconnecting';
    if (connectionError) return 'error';
    return 'disconnected';
  }, [isConnected, isReconnecting, connectionError]);

  // Компонент статуса соединения
  const ConnectionStatus = memo(() => {
    const getStatusConfig = () => {
      switch (connectionStatus) {
        case 'connected':
          return {
            icon: Wifi,
            text: 'Подключено',
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
          };
        case 'reconnecting':
          return {
            icon: RefreshCw,
            text: 'Переподключение...',
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
            borderColor: 'border-yellow-200',
            animate: true
          };
        case 'error':
          return {
            icon: AlertTriangle,
            text: connectionError || 'Ошибка соединения',
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
          };
        default:
          return {
            icon: WifiOff,
            text: 'Нет соединения',
            color: 'text-gray-600',
            bgColor: 'bg-gray-50',
            borderColor: 'border-gray-200'
          };
      }
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
        <Icon 
          size={16} 
          className={`${config.color} ${config.animate ? 'animate-spin' : ''}`} 
        />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.text}
        </span>
        {connectionStatus === 'error' && (
          <button
            onClick={forceReconnect}
            className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
          >
            Повторить
          </button>
        )}
      </div>
    );
  });

  ConnectionStatus.displayName = 'ConnectionStatus';

  // Fallback режим для работы без WebSocket
  const OfflineMode = memo(() => (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
      <WifiOff size={48} className="text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-700 mb-2">
        Чат временно недоступен
      </h3>
      <p className="text-gray-500 mb-4 max-w-md">
        Сервер чата недоступен. Проверьте подключение к интернету или попробуйте позже.
      </p>
      <div className="space-y-3">
        <button
          onClick={forceReconnect}
          className="px-4 py-2 bg-[#273655] text-white rounded-lg hover:bg-[#1e2c4f] transition-colors flex items-center gap-2"
        >
          <RefreshCw size={16} />
          Попробовать снова
        </button>
        <p className="text-sm text-gray-400">
          Или свяжитесь с нами по телефону: +7 (XXX) XXX-XX-XX
        </p>
      </div>
    </div>
  ));

  OfflineMode.displayName = 'OfflineMode';

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

  // Если роль пользователя не поддерживается
  if (!isManager && !isUser) {
    return (
      <div className={`chat-widget w-[1015px] h-[840px] bg-white border border-[#b8b8b8] rounded-[14px] relative flex flex-col ${className}`}>
        <div className="h-full flex items-center justify-center bg-gray-50 rounded-[14px]">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              Доступ ограничен
            </h3>
            <p className="text-gray-500">
              Чат доступен только для пользователей и менеджеров
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
          <ChatStatus 
            status={chatStatus} 
            isConnected={isConnected} 
            isReconnecting={isReconnecting} 
          />
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
      </div>
    );
  }

  // Интерфейс для пользователей
  return (
    <div className={`chat-widget w-[1015px] h-[840px] bg-white border border-[#b8b8b8] rounded-[14px] relative flex flex-col ${className}`}>
      {/* Заголовок чата */}
      <div className="flex items-center justify-between p-4 border-b bg-[#273655] text-white rounded-t-lg">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">
            {isManager ? 'Управление чатами' : 'Чат поддержки'}
          </h2>
          <ChatStatus status={chatStatus} />
        </div>
        
        <div className="flex items-center gap-3">
          <ConnectionStatus />
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-white/10 rounded transition-colors"
              aria-label="Закрыть чат"
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Основной контент */}
      {connectionStatus === 'error' && !isConnected ? (
        <OfflineMode />
      ) : isManager ? (
        // Интерфейс для менеджера
        <ManagerChatList />
      ) : (
        // Интерфейс для пользователя
        <>
          {/* Быстрые действия (только если чат не активен) */}
          {chatStatus === 'idle' && (
            <div className="p-4 border-b bg-gray-50">
              <QuickActions onActionSelect={startChat} />
            </div>
          )}

          {/* Список сообщений */}
          <div className="flex-1 overflow-hidden">
            <MessageList 
              messages={groupedMessages}
              hasMoreMessages={hasMoreMessages}
              isLoadingMessages={isLoadingMessages}
              onLoadMore={loadMoreMessages}
              messagesEndRef={messagesEndRef}
            />
          </div>

          {/* Поле ввода сообщения */}
          <div className="border-t bg-white">
            <MessageInput 
              onSend={sendMessage} 
              disabled={!canSendMessage}
              placeholder={
                chatStatus === 'idle' 
                  ? 'Выберите тему для начала чата'
                  : chatStatus === 'pending'
                  ? 'Ожидание подключения менеджера...'
                  : !isConnected
                  ? 'Нет соединения с сервером'
                  : 'Введите сообщение...'
              }
            />
          </div>
        </>
      )}
    </div>
  );
});

ChatWindow.displayName = 'ChatWindow';

export { ChatWindow };