import React, { useState, useCallback, memo } from 'react';
import { Play, Square, Send } from 'lucide-react';

const WebSocketTester = memo(({ userId }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [testMessage, setTestMessage] = useState('');

  const connect = useCallback(() => {
    if (socket) return;

    const ws = new WebSocket(`wss://extraspace-backend.onrender.com?userId=${userId}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      setMessages(prev => [...prev, { type: 'system', text: 'Подключено к WebSocket' }]);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, { type: 'received', text: JSON.stringify(data, null, 2) }]);
    };
    
    ws.onclose = () => {
      setIsConnected(false);
      setSocket(null);
      setMessages(prev => [...prev, { type: 'system', text: 'Соединение закрыто' }]);
    };
    
    ws.onerror = (error) => {
      setMessages(prev => [...prev, { type: 'error', text: `Ошибка: ${error.message || 'WebSocket error'}` }]);
    };
    
    setSocket(ws);
  }, [userId, socket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
    }
  }, [socket]);

  const sendTestMessage = useCallback(() => {
    if (socket && isConnected && testMessage.trim()) {
      try {
        const message = JSON.parse(testMessage);
        socket.send(JSON.stringify(message));
        setMessages(prev => [...prev, { type: 'sent', text: testMessage }]);
        setTestMessage('');
      } catch (error) {
        setMessages(prev => [...prev, { type: 'error', text: `Ошибка JSON: ${error.message}` }]);
      }
    }
  }, [socket, isConnected, testMessage]);

  // Показываем только в режиме разработки
  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 left-4 w-96 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">WebSocket Tester</h3>
        <div className="flex gap-2">
          <button
            onClick={connect}
            disabled={isConnected}
            className="p-1 bg-green-500 text-white rounded disabled:opacity-50"
          >
            <Play size={14} />
          </button>
          <button
            onClick={disconnect}
            disabled={!isConnected}
            className="p-1 bg-red-500 text-white rounded disabled:opacity-50"
          >
            <Square size={14} />
          </button>
        </div>
      </div>
      
      <div className="mb-3">
        <div className="text-xs text-gray-600 mb-1">
          Статус: {isConnected ? '🟢 Подключен' : '🔴 Отключен'}
        </div>
        <div className="text-xs text-gray-600">
          URL: wss://extraspace-backend.onrender.com?userId={userId}
        </div>
      </div>

      <div className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            placeholder='{"type": "START_CHAT", "userId": 4}'
            className="flex-1 text-xs border border-gray-300 rounded px-2 py-1"
          />
          <button
            onClick={sendTestMessage}
            disabled={!isConnected || !testMessage.trim()}
            className="p-1 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            <Send size={14} />
          </button>
        </div>
      </div>

      <div className="h-32 overflow-y-auto border border-gray-200 rounded p-2 text-xs">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-1 ${
            msg.type === 'error' ? 'text-red-600' :
            msg.type === 'sent' ? 'text-blue-600' :
            msg.type === 'received' ? 'text-green-600' :
            'text-gray-600'
          }`}>
            <span className="font-mono">{msg.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

WebSocketTester.displayName = 'WebSocketTester';

export default WebSocketTester; 