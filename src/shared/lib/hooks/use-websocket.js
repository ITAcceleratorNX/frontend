import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

export const useWebSocket = () => {
  const { user, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  
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
        console.log('WebSocket: Попытка подключения к', socketUrl);
      }
      
      // Создаем новое WebSocket соединение
      const newSocket = new WebSocket(socketUrl);
      
      // Устанавливаем таймаут для подключения
      const connectionTimeout = setTimeout(() => {
        if (newSocket.readyState === WebSocket.CONNECTING) {
          newSocket.close();
          console.error('WebSocket: Таймаут подключения');
          setConnectionError('Таймаут подключения к серверу');
        }
      }, 10000); // 10 секунд на подключение
      
      newSocket.onopen = () => {
        clearTimeout(connectionTimeout);
        if (import.meta.env.DEV) {
          console.log('WebSocket: Соединение установлено');
        }
        setIsConnected(true);
        setIsReconnecting(false);
        setConnectionError(null);
        reconnectAttempts.current = 0;
        socketRef.current = newSocket;
        setSocket(newSocket);
        
        if (reconnectAttempts.current > 0) {
          toast.success('Подключение к чату восстановлено');
        }
      };
      
      newSocket.onclose = (event) => {
        clearTimeout(connectionTimeout);
        if (import.meta.env.DEV) {
          console.log('WebSocket: Соединение закрыто', {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });
        }
        setIsConnected(false);
        socketRef.current = null;
        setSocket(null);
        
        // Определяем причину закрытия
        let errorMessage = 'Соединение с чатом потеряно';
        if (event.code === 1006) {
          errorMessage = 'Сервер чата недоступен';
          setConnectionError('Сервер недоступен');
        } else if (event.code === 1011) {
          errorMessage = 'Ошибка сервера чата';
          setConnectionError('Ошибка сервера');
        } else if (event.code === 1012) {
          errorMessage = 'Сервер чата перезагружается';
          setConnectionError('Сервер перезагружается');
        }
        
        // Автоматическое переподключение, если не было ручного закрытия
        if (event.code !== 1000 && reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;
          
          if (import.meta.env.DEV) {
            console.log(`WebSocket: Переподключение через ${delay}ms (попытка ${reconnectAttempts.current})`);
          }
          
          setIsReconnecting(true);
          setConnectionError(`Переподключение... (попытка ${reconnectAttempts.current})`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, delay);
        } else if (reconnectAttempts.current >= maxReconnectAttempts) {
          toast.error('Не удалось восстановить соединение с чатом. Проверьте подключение к интернету.');
          setIsReconnecting(false);
          setConnectionError('Не удалось подключиться к серверу');
        }
      };
      
      newSocket.onerror = (error) => {
        clearTimeout(connectionTimeout);
        console.error('WebSocket: Ошибка соединения', error);
        
        // Более детальная обработка ошибок
        if (reconnectAttempts.current === 0) {
          // Первая попытка подключения
          toast.error('Не удалось подключиться к чату. Сервер может быть недоступен.');
          setConnectionError('Сервер чата недоступен');
        } else {
          // Повторные попытки
          setConnectionError(`Ошибка подключения (попытка ${reconnectAttempts.current})`);
        }
      };
      
    } catch (error) {
      console.error('WebSocket: Ошибка создания соединения', error);
      toast.error('Не удалось создать соединение с чатом');
      setConnectionError('Ошибка создания соединения');
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
      
      // Показываем разные сообщения в зависимости от состояния
      if (isReconnecting) {
        toast.warning('Переподключение к серверу...');
      } else if (connectionError) {
        toast.error(`Нет соединения: ${connectionError}`);
      } else {
        toast.error('Нет соединения с сервером');
      }
      return false;
    }
  }, [isReconnecting, connectionError]);

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
      setConnectionError(null);
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

  // Принудительное переподключение
  const forceReconnect = useCallback(() => {
    if (import.meta.env.DEV) {
      console.log('WebSocket: Принудительное переподключение');
    }
    disconnectWebSocket();
    reconnectAttempts.current = 0;
    setConnectionError(null);
    setTimeout(() => {
      connectWebSocket();
    }, 1000);
  }, [disconnectWebSocket, connectWebSocket]);

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
    connectionError,
    sendMessage: sendWebSocketMessage,
    disconnect: disconnectWebSocket,
    reconnect: connectWebSocket,
    forceReconnect,
    addMessageHandler,
    removeMessageHandler
  };
}; 