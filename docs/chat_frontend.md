# ExtraSpace – Модуль чата (Frontend и Backend логика)

## 📌 Цель

Реализация полнофункционального чат-модуля для платформы **ExtraSpace**, обеспечивающего взаимодействие между **клиентами** и **менеджерами** в режиме реального времени. Система базируется на WebSocket соединении и REST API для управления чатами.

## 🧠 Логика backend

### 🗄️ Структура базы данных

```sql
-- Таблица чатов
CREATE TABLE chats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,     -- ID клиента (уникальный)
    manager_id INTEGER,         -- ID менеджера
    status VARCHAR(255)         -- 'PENDING', 'ACCEPTED', 'CLOSED'
);

-- Таблица сообщений
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chat_id INTEGER,           -- ID чата
    sender_id INTEGER,         -- ID отправителя
    text VARCHAR(255),         -- Текст сообщения
    is_from_user BOOLEAN       -- true = от клиента, false = от менеджера
);
```

### 🔌 WebSocket сервер: 

**Подключение:** `wss://extraspace-backend.onrender.com?userId={userId}`

**Типы сообщений:**
- `START_CHAT` - Инициация чата клиентом
- `SEND_MESSAGE` - Отправка сообщения
- `ACCEPT_CHAT` - Принятие чата менеджером
- `NEW_CHAT` - Уведомление менеджерам о новом чате
- `CHAT_ACCEPTED` - Уведомление клиенту о принятии чата
- `NEW_MESSAGE` - Получение нового сообщения
- `WAITING_FOR_MANAGER` - Уведомление клиенту об ожидании

### 🛠️ REST API Endpoints

```
GET    /chats/manager              # Получить чаты менеджера
GET    /chats/pending-chats        # Получить все ожидающие чаты (PENDING)
GET    /chats/:chatId/messages     # Получить сообщения чата (с пагинацией)
DELETE /chats/:chatId/messages     # Очистить сообщения чата
PUT    /chats/:chatId/manager      # Сменить менеджера чата
```

## 👥 Роли и сценарии использования

### 👤 Пользователь (Клиент):

**Инициация чата:**
1. Клиент отправляет `START_CHAT` с `userId`
2. Создается чат со статусом `PENDING`
3. Клиент получает сообщение `WAITING_FOR_MANAGER`
4. Все онлайн менеджеры получают уведомление `NEW_CHAT`

**Общение:**
1. После принятия чата менеджером клиент получает `CHAT_ACCEPTED`
2. Клиент может отправлять сообщения через `SEND_MESSAGE`
3. Получает ответы через `NEW_MESSAGE`

### 🧑‍💼 Менеджер:

**Управление чатами:**
1. Получает уведомления о новых чатах (`NEW_CHAT`)
2. Может принять чат отправив `ACCEPT_CHAT`
3. Получает список своих чатов через API `/chats/manager`

**Общение:**
1. Отправляет сообщения через `SEND_MESSAGE` 
2. Получает сообщения от клиентов через `NEW_MESSAGE`
3. Может очистить историю чата или сменить менеджера

## 🧩 Требования к frontend (React)

### 📁 Рекомендуемая структура:Feature-Sliced Design!

```
src/
├── features/chat/
│   ├── components/
│   │   ├── ChatWindow.jsx          # Основное окно чата
│   │   ├── ChatButton.jsx          # Кнопка открытия чата (уже есть)
│   │   ├── MessageList.jsx         # Список сообщений
│   │   ├── MessageInput.jsx        # Поле ввода сообщения
│   │   ├── MessageItem.jsx         # Отдельное сообщение
│   │   ├── ChatStatus.jsx          # Статус чата (ожидание/активный)
│   │   └── ManagerChatList.jsx     # Список чатов для менеджера
│   ├── hooks/
│   │   ├── use-websocket.js        # WebSocket хук (уже есть)
│   │   ├── use-chat.js             # Основной хук чата
│   │   └── use-chat-messages.js    # Хук для сообщений
│   ├── api/
│   │   └── chatApi.js              # API функции для чата
│   └── store/
│       └── chatStore.js            # Zustand store для чата
```

### 🔧 Ключевые компоненты

#### 1. **ChatWindow.jsx**
```jsx
// Основное окно чата
const ChatWindow = ({ isOpen, onClose, userRole }) => {
  const { 
    messages, 
    sendMessage, 
    chatStatus, 
    isConnected 
  } = useChat();
  
  return (
    <div className={`chat-window ${isOpen ? 'open' : 'closed'}`}>
      <ChatHeader onClose={onClose} status={chatStatus} />
      <MessageList messages={messages} />
      <MessageInput onSend={sendMessage} disabled={!isConnected} />
    </div>
  );
};
```

#### 2. **MessageList.jsx**
```jsx
// Список сообщений с автоскроллом и ленивой загрузкой
const MessageList = ({ messages }) => {
  const { loadMoreMessages, hasMoreMessages } = useChatMessages();
  
  return (
    <div className="message-list" ref={messagesRef}>
      {hasMoreMessages && (
        <button onClick={loadMoreMessages}>Загрузить ранние сообщения</button>
      )}
      {messages.map(message => (
        <MessageItem key={message.id} message={message} />
      ))}
    </div>
  );
};
```

#### 3. **ManagerChatList.jsx**
```jsx
// Список чатов для менеджера
const ManagerChatList = () => {
  const { chats, acceptChat, activeChat } = useManagerChats();
  
  return (
    <div className="manager-chat-list">
      {chats.map(chat => (
        <ChatItem 
          key={chat.id} 
          chat={chat} 
          onAccept={() => acceptChat(chat.id)}
          isActive={activeChat?.id === chat.id}
        />
      ))}
    </div>
  );
};
```

### 🪝 Пользовательские хуки

#### 1. **use-chat.js**
```jsx
export const useChat = () => {
  const { user } = useAuth();
  const [chatState, setChatState] = useState({
    messages: [],
    chatStatus: 'idle', // 'idle', 'pending', 'active', 'closed'
    isConnected: false
  });
  
  const { sendMessage: wsSendMessage } = useWebSocket(
    `wss://extraspace-backend.onrender.com?userId=${user?.id}`,
    {
      onMessage: handleWebSocketMessage,
      onOpen: () => setChatState(prev => ({ ...prev, isConnected: true })),
      onClose: () => setChatState(prev => ({ ...prev, isConnected: false }))
    }
  );
  
  const startChat = useCallback(() => {
    wsSendMessage({
      type: 'START_CHAT',
      userId: user.id
    });
    setChatState(prev => ({ ...prev, chatStatus: 'pending' }));
  }, [user.id, wsSendMessage]);
  
  const sendMessage = useCallback((message) => {
    wsSendMessage({
      type: 'SEND_MESSAGE',
      chatId: chatState.chatId,
      senderId: user.id,
      message,
      isFromUser: user.role !== 'MANAGER'
    });
  }, [chatState.chatId, user, wsSendMessage]);
  
  return {
    ...chatState,
    startChat,
    sendMessage
  };
};
```

#### 2. **use-chat-messages.js**
```jsx
export const useChatMessages = (chatId) => {
  const [messages, setMessages] = useState([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  const loadMoreMessages = useCallback(async () => {
    if (!hasMoreMessages || isLoading) return;
    
    setIsLoading(true);
    try {
      const oldestMessageId = messages[0]?.id;
      const response = await chatApi.getMessages(chatId, {
        beforeId: oldestMessageId,
        limit: 20
      });
      
      setMessages(prev => [...response.messages, ...prev]);
      setHasMoreMessages(response.hasMore);
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    } finally {
      setIsLoading(false);
    }
  }, [chatId, messages, hasMoreMessages, isLoading]);
  
  return {
    messages,
    loadMoreMessages,
    hasMoreMessages,
    isLoading
  };
};
```

### 📡 WebSocket интеграция

#### Обработка сообщений в useWebSocket:
```jsx
const handleWebSocketMessage = useCallback((event) => {
  const data = JSON.parse(event.data);
  
  switch (data.type) {
    case 'WAITING_FOR_MANAGER':
      setChatStatus('pending');
      showNotification('Ожидаем менеджера...');
      break;
      
    case 'CHAT_ACCEPTED':
      setChatStatus('active');
      setChatId(data.chatId);
      showNotification('Менеджер принял чат');
      break;
      
    case 'NEW_MESSAGE':
      addMessage(data.message);
      break;
      
    case 'NEW_CHAT':
      // Для менеджеров - уведомление о новом чате
      if (userRole === 'MANAGER') {
        addNewChatNotification(data);
      }
      break;
  }
}, [setChatStatus, setChatId, addMessage, userRole]);
```

### 🎨 API функции

#### **chatApi.js**
```jsx
import api from '../../shared/api/axios';

export const chatApi = {
  // Получить сообщения чата с пагинацией
  getMessages: async (chatId, { beforeId, limit = 20 } = {}) => {
    const params = new URLSearchParams({ limit: limit.toString() });
    if (beforeId) params.append('beforeId', beforeId.toString());
    
    const response = await api.get(`/chats/${chatId}/messages?${params}`);
    return response.data;
  },
  
  // Получить чаты менеджера
  getManagerChats: async () => {
    const response = await api.get('/chats/manager');
    return response.data;
  },
  
  // Получить все ожидающие чаты (только для MANAGER/ADMIN)
  getPendingChats: async () => {
    const response = await api.get('/chats/pending-chats');
    return response.data;
  },
  
  // Очистить сообщения чата
  clearMessages: async (chatId) => {
    const response = await api.delete(`/chats/${chatId}/messages`);
    return response.data;
  },
  
  // Сменить менеджера чата
  changeManager: async (chatId, newManagerId) => {
    const response = await api.put(`/chats/${chatId}/manager`, { newManagerId });
    return response.data;
  }
};
```

### 🗃️ Zustand Store

#### **chatStore.js**
```jsx
import { create } from 'zustand';

export const useChatStore = create((set, get) => ({
  // Состояние
  chats: [],
  activeChat: null,
  messages: [],
  chatStatus: 'idle',
  isConnected: false,
  
  // Действия
  setChats: (chats) => set({ chats }),
  setActiveChat: (chat) => set({ activeChat: chat }),
  addMessage: (message) => set(state => ({
    messages: [...state.messages, message]
  })),
  setChatStatus: (status) => set({ chatStatus: status }),
  setConnectionStatus: (isConnected) => set({ isConnected }),
  
  // Сброс состояния
  resetChat: () => set({
    activeChat: null,
    messages: [],
    chatStatus: 'idle'
  })
}));
```

## 🎯 План реализации

### Этап 1: Базовая структура
1. ✅ Создать компоненты чата
2. ✅ Настроить WebSocket соединение
3. ✅ Реализовать базовую отправку/получение сообщений

### Этап 2: Роли и авторизация
1. ✅ Добавить проверки роли пользователя
2. ✅ Реализовать интерфейс для менеджеров
3. ✅ Настроить уведомления

### Этап 3: Продвинутые функции
1. ✅ Пагинация сообщений
2. ✅ Очистка чатов
3. ✅ Смена менеджера
4. ✅ Статусы доставки сообщений

### Этап 4: UX/UI улучшения
1. ✅ Анимации и переходы
2. ✅ Звуковые уведомления
3. ✅ Оптимизация для мобильных устройств
4. ✅ Темная тема

## 🔐 Безопасность и авторизация

- Все WebSocket соединения требуют `userId` в query параметрах
- API эндпоинты защищены middleware `authenticateJWT`
- Менеджерские функции требуют роль `MANAGER` или `ADMIN`
- Валидация всех входящих сообщений

## 📱 Мобильная адаптация

- Используйте `position: fixed` для мобильного чата
- Реализуйте свайп-жесты для закрытия
- Адаптируйте размеры под различные экраны
- Учитывайте виртуальную клавиатуру

## 🎨 Дизайн рекомендации

```scss
.chat-window {
  position: fixed;
  bottom: 100px;
  right: 20px;
  width: 350px;
  height: 500px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  
  &.mobile {
    bottom: 0;
    right: 0;
    width: 100vw;
    height: 100vh;
    border-radius: 0;
  }
}

.message-item {
  &.from-user {
    align-self: flex-end;
    background: #273655;
    color: white;
  }
  
  &.from-manager {
    align-self: flex-start;
    background: #f1f1f1;
    color: #333;
  }
}
```

## 📘 Заключение

Модуль чата ExtraSpace представляет собой полнофункциональную систему реального времени с поддержкой ролей, WebSocket соединений и REST API. 

**Ключевые особенности:**
- ✅ Реальное время через WebSocket
- ✅ Роли: клиент и менеджер
- ✅ Пагинация сообщений
- ✅ Управление чатами
- ✅ Безопасность и авторизация

**Следующие шаги:**
1. Реализовать базовые компоненты
2. Настроить WebSocket интеграцию  
3. Добавить роль-ориентированную логику
4. Протестировать все сценарии использования

**Время разработки:** ~2-3 недели для полной реализации
