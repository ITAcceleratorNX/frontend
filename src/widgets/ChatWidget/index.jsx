import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useWebSocket } from '../../shared/lib/hooks/use-websocket';
import api from '../../shared/api/axios';
import { Send, Paperclip, Mic, Smile, MoreHorizontal } from 'lucide-react';
import { toast } from 'react-toastify';
import './styles.css';

const ChatWidget = memo(() => {
  const { user, isAuthenticated } = useAuth();
  const { socket, isConnected, isReconnecting, sendMessage: sendWebSocketMessage, addMessageHandler, removeMessageHandler } = useWebSocket();
  
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [chatId, setChatId] = useState(null);
  const [chatStatus, setChatStatus] = useState(null);
  const [managerId, setManagerId] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  
  // Прокрутка к последнему сообщению
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Загрузка истории сообщений
  const loadMessages = useCallback(async (beforeId = null) => {
    if (!chatId || isLoadingMessages) return;
    
    try {
      setIsLoadingMessages(true);
      const params = new URLSearchParams();
      if (beforeId) params.append('beforeId', beforeId);
      params.append('limit', '50');
      
      const response = await api.get(`/chats/${chatId}/messages?${params}`);
      const { messages: newMessages, hasMore: moreAvailable } = response.data;
      
      if (beforeId) {
        // Загружаем более старые сообщения
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        // Первоначальная загрузка
        setMessages(newMessages);
        setTimeout(scrollToBottom, 100);
      }
      
      setHasMore(moreAvailable);
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
      toast.error('Не удалось загрузить сообщения');
    } finally {
      setIsLoadingMessages(false);
    }
  }, [chatId, isLoadingMessages, scrollToBottom]);

  // Обработка WebSocket сообщений
  const handleWebSocketMessage = useCallback((data) => {
    switch (data.type) {
      case 'WAITING_FOR_MANAGER':
        setChatStatus('PENDING');
        toast.info(data.message);
        break;
        
      case 'CHAT_ACCEPTED':
        setChatId(data.chatId);
        setManagerId(data.managerId);
        setChatStatus('ACCEPTED');
        toast.success('Менеджер присоединился к чату');
        loadMessages();
        break;
        
      case 'NEW_MESSAGE':
        const newMessage = data.message;
        setMessages(prev => [...prev, newMessage]);
        setTimeout(scrollToBottom, 100);
        break;
        
      case 'NEW_CHAT':
        if (user?.role === 'MANAGER') {
          // Уведомление для менеджеров о новом чате
          toast.info(`Новый чат от пользователя ${data.userId}`);
        }
        break;
        
      default:
        console.log('Неизвестный тип WebSocket сообщения:', data.type);
    }
  }, [loadMessages, scrollToBottom, user?.role]);

  // Подключение обработчика сообщений
  useEffect(() => {
    if (socket) {
      addMessageHandler(handleWebSocketMessage);
      
      return () => {
        removeMessageHandler(handleWebSocketMessage);
      };
    }
  }, [socket, addMessageHandler, removeMessageHandler, handleWebSocketMessage]);

  // Начать новый чат
  const startChat = useCallback(() => {
    if (!socket || !isConnected) {
      toast.error('Нет соединения с сервером');
      return;
    }
    
    const success = sendWebSocketMessage({
      type: 'START_CHAT',
      userId: user.id
    });
    
    if (success) {
      setChatStatus('PENDING');
    }
  }, [socket, isConnected, sendWebSocketMessage, user?.id]);

  // Отправка сообщения
  const sendChatMessage = useCallback(() => {
    if (!message.trim() || !socket || !isConnected || !chatId) return;
    
    const success = sendWebSocketMessage({
      type: 'SEND_MESSAGE',
      chatId,
      senderId: user.id,
      message: message.trim(),
      isFromUser: user.role !== 'MANAGER'
    });
    
    if (success) {
      setMessage('');
    }
  }, [message, socket, isConnected, chatId, sendWebSocketMessage, user?.id, user?.role]);

  // Принять чат (для менеджеров)
  const acceptChat = useCallback((incomingChatId) => {
    if (!socket || !isConnected || user?.role !== 'MANAGER') return;
    
    const success = sendWebSocketMessage({
      type: 'ACCEPT_CHAT',
      chatId: incomingChatId,
      managerId: user.id
    });
    
    if (success) {
      setChatId(incomingChatId);
      setChatStatus('ACCEPTED');
      loadMessages();
    }
  }, [socket, isConnected, sendWebSocketMessage, user?.id, user?.role, loadMessages]);

  // Быстрые действия
  const handleQuickAction = useCallback((action) => {
    const quickMessages = {
      consultation: 'Мне нужна консультация',
      booking: 'Ошибка в бронировании'
    };
    
    setMessage(quickMessages[action] || '');
  }, []);

  // Обработка нажатия Enter
  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
    }
  }, [sendChatMessage]);

  // Обработка выбора файла
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Файл выбран:', file.name);
      // Здесь можно добавить логику загрузки файла
      toast.info(`Файл ${file.name} выбран (функция загрузки будет добавлена позже)`);
    }
  }, []);

  // Функция для группировки сообщений по дням
  const groupMessagesByDate = useCallback((messages) => {
    const grouped = [];
    let currentDate = null;
    
    messages.forEach((msg) => {
      const msgDate = new Date(msg.createdAt || Date.now());
      const dateStr = msgDate.toLocaleDateString('ru-RU', { 
        day: 'numeric',
        month: 'long'
      });
      
      if (dateStr !== currentDate) {
        grouped.push({ type: 'date', date: dateStr });
        currentDate = dateStr;
      }
      
      grouped.push({ type: 'message', ...msg });
    });
    
    return grouped;
  }, []);

  // Проверка авторизации
  if (!isAuthenticated) {
    return (
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
    );
  }

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="chat-widget w-[1015px] h-[840px] bg-white border border-[#b8b8b8] rounded-[14px] relative flex flex-col">
      {/* Заголовок чата */}
      <div className="flex items-center p-4 border-b border-[#e0e0e0]">
        <div className="w-[24px] h-[24px] bg-[#273655] rounded-[12px] flex items-center justify-center mr-3 status-indicator">
          <span className="text-white text-xs font-bold">ES</span>
        </div>
        <div>
          <h3 className="header-title text-[20px] font-normal leading-[26px] tracking-[1px] text-[#273655] capitalize">
            ExtraSpace
          </h3>
          <p className="text-[8px] font-normal leading-[10px] text-[#979797]">
            {isConnected ? (isReconnecting ? 'переподключение...' : 'менеджер') : 'не в сети'}
          </p>
        </div>
      </div>

      {/* Область сообщений */}
      <div className="messages-container h-[600px] overflow-y-auto p-4 flex-1">
        {!chatId && chatStatus !== 'PENDING' && (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-[16px] font-normal leading-[22px] text-[#757575] mb-8">
              Чат пустой
            </p>
            
            {/* Быстрые действия в стиле designchat */}
            <div className="flex space-x-4 mb-8">
              <button
                onClick={() => handleQuickAction('consultation')}
                className="quick-action-btn w-[225px] h-[69px] border border-[#263554] rounded-[10px] flex flex-col items-start justify-center px-5 hover-effect"
              >
                <span className="text-[14px] font-semibold leading-[18px] text-[#263554]">
                  Мне нужна консультация
                </span>
                <span className="text-[12px] font-normal leading-[16px] text-[#263554]">
                  Получить помощь специалиста
                </span>
              </button>
              
              <button
                onClick={() => handleQuickAction('booking')}
                className="quick-action-btn w-[208px] h-[69px] border border-[#263554] rounded-[10px] flex flex-col items-start justify-center px-5 hover-effect"
              >
                <span className="text-[14px] font-semibold leading-[18px] text-[#263554]">
                  Ошибка в бронировании
                </span>
                <span className="text-[12px] font-normal leading-[16px] text-[#263554]">
                  Решить проблему с заказом
                </span>
              </button>
            </div>
            
            <button
              onClick={startChat}
              disabled={!isConnected}
              className="bg-[#263554] text-white px-6 py-2 rounded-[6px] flex items-center space-x-2 hover:bg-[#1e2a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[12px] font-semibold leading-[17px]">
                Начать чат
              </span>
            </button>
          </div>
        )}

        {chatStatus === 'PENDING' && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="loading-spinner w-8 h-8 border-2 border-[#263554] border-t-transparent rounded-full mb-4"></div>
            <p className="text-[16px] font-normal leading-[22px] text-[#757575]">
              Ожидание подключения менеджера...
            </p>
          </div>
        )}

        {hasMore && messages.length > 0 && (
          <div className="text-center mb-4">
            <button
              onClick={() => loadMessages(messages[0]?.id)}
              disabled={isLoadingMessages}
              className="text-sm text-[#263554] hover:text-[#1e2a42] disabled:opacity-50"
            >
              {isLoadingMessages ? 'Загрузка...' : 'Загрузить предыдущие сообщения'}
            </button>
          </div>
        )}

        {/* Отображение сообщений с разделителями дат */}
        <div className="space-y-4">
          {groupedMessages.map((item, index) => {
            if (item.type === 'date') {
              return (
                <div key={`date-${index}`} className="text-center">
                  <span className="text-[12px] font-normal leading-[17px] text-[#757575]">
                    {item.date}
                  </span>
                </div>
              );
            }

                         const msg = item;
             return (
               <div key={index} className={`message-item flex ${msg.is_from_user ? 'justify-end' : 'justify-start'}`}>
                {!msg.is_from_user && (
                  <div className="flex items-start space-x-3">
                    <div className="w-[40px] h-[40px] bg-[#273655] rounded-[15px] flex items-center justify-center mt-2">
                      <span className="text-white text-sm font-bold">ES</span>
                    </div>
                    <div className="max-w-[720px] bg-[#f5f5f5] rounded-[16px_16px_16px_0] p-4">
                      <p className="text-[14px] font-normal leading-[26px] text-[#202224] whitespace-pre-line">
                        {msg.text}
                      </p>
                      <div className="text-right mt-2">
                        <span className="text-[12px] font-normal leading-[17px] text-[#757575]">
                          {new Date(msg.createdAt || Date.now()).toLocaleTimeString('ru-RU', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                {msg.is_from_user && (
                  <div className="max-w-[370px] bg-[#fee2b2] rounded-[16px_16px_16px_0] p-4">
                    <p className="text-[14px] font-normal leading-[20px] text-[#333131]">
                      {msg.text}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[12px] font-normal leading-[17px] text-[#202224]">
                        {new Date(msg.createdAt || Date.now()).toLocaleTimeString('ru-RU', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <MoreHorizontal className="w-[15px] h-[3px] text-[#757575]" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      {(chatStatus === 'ACCEPTED' || chatId) && (
        <div className="border-t border-[#e0e0e0] p-4">
          <div className="flex items-center space-x-3">
            {/* Кнопка прикрепления файла */}
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="icon-btn text-[#757575]"
            >
              <Paperclip className="w-[21px] h-[13px]" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,application/pdf,.doc,.docx"
            />
            
            {/* Поле ввода сообщения */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Write message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                className="w-full border-none focus:ring-0 text-[16px] font-normal leading-[22px] text-[#9d9d9d] placeholder-[#9d9d9d] outline-none"
              />
            </div>
            
            {/* Кнопка записи голоса */}
            <button className="icon-btn text-[#757575]">
              <Mic className="w-[21px] h-[17px]" />
            </button>
            
            {/* Кнопка эмодзи */}
            <button className="icon-btn text-[#757575]">
              <Smile className="w-[21px] h-[14px]" />
            </button>
            
            {/* Кнопка отправки */}
            <button
              onClick={sendChatMessage}
              disabled={!message.trim() || !isConnected}
              className="send-btn bg-[#263554] text-white px-6 py-2 rounded-[6px] flex items-center space-x-2 hover:bg-[#1e2a42] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-[12px] font-semibold leading-[17px]">
                Отправить
              </span>
              <Send className="w-[14px] h-[12px]" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

ChatWidget.displayName = 'ChatWidget';

export default ChatWidget;