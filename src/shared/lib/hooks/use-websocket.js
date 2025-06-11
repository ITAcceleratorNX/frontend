import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Функция подключения к WebSocket
  const connectWebSocket = useCallback(() => {
    if (!isAuthenticated || !user?.id) {
      if (import.meta.env.DEV) {
        console.log('WebSocket: Нет авторизации или ID пользователя');
      }
      return;
    }

    // Предотвращаем множественные подключения
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      if (import.meta.env.DEV) {
        console.log('WebSocket: Соединение уже установлено');
      }
      return;
    }

    try {
      const socketUrl = `wss://extraspace-backend.onrender.com?userId=${user.id}`;
      if (import.meta.env.DEV) {
        console.log('WebSocket: Подключение к', socketUrl);
      }
      
      // Создаем новое WebSocket соединение
      const newSocket = new WebSocket(socketUrl);
      
      newSocket.onopen = () => {
        if (import.meta.env.DEV) {
          console.log('WebSocket: Соединение установлено');
        }
        setIsConnected(true);
        setIsReconnecting(false);
        reconnectAttempts.current = 0;
        socketRef.current = newSocket;
        setSocket(newSocket);
        
        if (reconnectAttempts.current > 0) {
          toast.success('Подключение к чату восстановлено');
        }
      };
      
      newSocket.onclose = (event) => {
        if (import.meta.env.DEV) {
          console.log('WebSocket: Соединение закрыто', event.code, event.reason);
        }
        setIsConnected(false);
        socketRef.current = null;
        setSocket(null);
        
        // Автоматическое переподключение, если не было ручного закрытия
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          
          if (import.meta.env.DEV) {
            console.log(`WebSocket: Переподключение через ${delay}ms (попытка ${reconnectAttempts.current})`);
          }
          
          setIsReconnecting(true);
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          toast.error('Не удалось восстановить соединение с чатом');
          setIsReconnecting(false);
        }
      };
      
      newSocket.onerror = (error) => {
        console.error('WebSocket: Ошибка соединения', error);
        if (reconnectAttempts.current === 0) {
          toast.error('Ошибка подключения к чату');
        }
      };
      
    } catch (error) {
      console.error('WebSocket: Ошибка создания соединения', error);
      toast.error('Не удалось создать соединение с чатом');
    }
  }, [isAuthenticated, user?.id]);

  // Отправка сообщения через WebSocket
  const sendWebSocketMessage = useCallback((messageData) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      try {
        // Отправляем сообщение как JSON
        socketRef.current.send(JSON.stringify(messageData));
        if (import.meta.env.DEV) {
          console.log('WebSocket: Сообщение отправлено', messageData.type);
        }
        return true;
      } catch (error) {
        console.error('WebSocket: Ошибка отправки сообщения', error);
        toast.error('Не удалось отправить сообщение');
        return false;
      }
    } else {
      if (import.meta.env.DEV) {
        console.log('WebSocket: Соединение не готово для отправки сообщений');
      }
      toast.error('Нет соединения с сервером');
      return false;
    }
  }, []);

  // Закрытие соединения
  const disconnectWebSocket = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (socketRef.current) {
      socketRef.current.close(1000, 'Manual disconnect');
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      setIsReconnecting(false);
    }
  }, []);

  // Добавление обработчика сообщений
  const addMessageHandler = useCallback((handler) => {
    if (socketRef.current) {
      // Добавляем обработчик для входящих сообщений
      socketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (import.meta.env.DEV) {
            console.log('WebSocket: Получено сообщение', data);
          }
          handler(data);
        } catch (error) {
          console.error('WebSocket: Ошибка парсинга сообщения', error);
        }
      };
    }
  }, []);

  // Удаление обработчика сообщений
  const removeMessageHandler = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.onmessage = null;
    }
  }, []);

  // Подключение при монтировании и изменении аутентификации
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      connectWebSocket();
    } else {
      disconnectWebSocket();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [isAuthenticated, user?.id, connectWebSocket, disconnectWebSocket]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    isReconnecting,
    sendMessage: sendWebSocketMessage,
    disconnect: disconnectWebSocket,
    reconnect: connectWebSocket,
    addMessageHandler,
    removeMessageHandler
  };
}; 