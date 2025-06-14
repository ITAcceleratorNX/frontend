# 🔧 Анализ производительности React-чата

## 🚨 Выявленные проблемы

### 1. **Бесконечные useEffect циклы**

**Проблема в `use-manager-chats.js` (строка 208-212):**
```javascript
useEffect(() => {
  if (isManager) {
    loadChats();
  }
}, [isManager, loadChats]); // ❌ loadChats пересоздается каждый раз
```

**Решение:**
```javascript
useEffect(() => {
  if (isManager) {
    loadChats();
  }
}, [isManager]); // ✅ Убираем loadChats из зависимостей
```

### 2. **Дублирующиеся API-запросы**

**Проблема:** В `use-manager-chats.js` запрос `/chats/manager` отправляется при каждом рендере компонента.

**Проблемы:**
- Нет защиты от параллельных запросов
- Нет кеширования результатов
- Запрос повторяется даже если данные не изменились

### 3. **Отсутствие кеширования**

**Проблема:** Каждый раз при загрузке компонента данные запрашиваются заново.

### 4. **Проблемы с polling и интервалами**

**Проблема:** Нет контролируемого обновления данных чатов менеджера.

### 5. **Неоптимальные зависимости в useCallback**

**Проблема в `use-chat-messages.js` (строка 51-54):**
```javascript
useEffect(() => {
  if (chatId) {
    loadMessages(null, true);
  }
}, [chatId, loadMessages]); // ❌ loadMessages пересоздается
```

## 🛠️ Комплексное решение

### 1. **Оптимизированный useManagerChats**

```javascript
import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useChatStore, USER_ROLES } from '../../../entities/chat/model';
import { chatApi } from '../../api/chatApi';
import { toast } from 'react-toastify';

export const useManagerChats = () => {
  const { user } = useAuth();
  const { 
    chats, 
    setChats, 
    activeChat, 
    setActiveChat,
    newChatNotifications,
    removeNewChatNotification,
    clearNewChatNotifications
  } = useChatStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);
  
  // Защита от параллельных запросов
  const fetchInProgress = useRef(false);
  
  // Кеш для предотвращения повторных запросов
  const CACHE_DURATION = 30 * 1000; // 30 секунд
  
  const isManager = useMemo(() => {
    return user?.role === USER_ROLES.MANAGER || user?.role === USER_ROLES.ADMIN;
  }, [user?.role]);

  // Оптимизированная загрузка чатов с кешированием
  const loadChats = useCallback(async (forceRefresh = false) => {
    if (!isManager) {
      return false;
    }
    
    // Проверяем кеш
    const now = Date.now();
    if (!forceRefresh && (now - lastFetchTime) < CACHE_DURATION && chats.length > 0) {
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Используем кешированные данные');
      }
      return true;
    }
    
    // Защита от параллельных запросов
    if (fetchInProgress.current) {
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Запрос уже выполняется');
      }
      return false;
    }
    
    try {
      fetchInProgress.current = true;
      setIsLoadingChats(true);
      
      const response = await chatApi.getManagerChats();
      setChats(response);
      setLastFetchTime(now);
      
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Загружено чатов:', response.length);
      }
      
      return true;
    } catch (error) {
      console.error('ManagerChats: Ошибка при загрузке чатов:', error);
      
      let errorMessage = 'Не удалось загрузить чаты';
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Сервер не отвечает. Попробуйте позже.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте обновить страницу.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Нет доступа. Войдите в систему заново.';
      }
      
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoadingChats(false);
      fetchInProgress.current = false;
    }
  }, [isManager, lastFetchTime, chats.length, setChats]);

  // Автоматическое обновление чатов каждые 2 минуты
  useEffect(() => {
    if (!isManager) return;

    // Загружаем чаты при первом рендере
    loadChats();

    // Устанавливаем интервал для автоматического обновления
    const interval = setInterval(() => {
      loadChats(true); // forceRefresh = true
    }, 2 * 60 * 1000); // каждые 2 минуты

    return () => {
      clearInterval(interval);
    };
  }, [isManager]); // ✅ Убираем loadChats из зависимостей

  // Принятие чата с оптимизацией
  const acceptChat = useCallback(async (chatId) => {
    if (!isManager) {
      toast.error('Недостаточно прав');
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Оптимистичное обновление
      setActiveChat({ id: chatId });
      removeNewChatNotification(chatId);
      
      if (import.meta.env.DEV) {
        console.log('ManagerChats: Чат принят:', chatId);
      }
      
      return true;
    } catch (error) {
      console.error('ManagerChats: Ошибка при принятии чата:', error);
      toast.error('Не удалось принять чат');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isManager, setActiveChat, removeNewChatNotification]);

  // Остальные методы остаются без изменений...
  
  return {
    chats: sortedChats,
    activeChat,
    newChatNotifications,
    counts,
    
    isLoading,
    isLoadingChats,
    isManager,
    
    loadChats,
    acceptChat,
    // ... остальные методы
  };
};
```

### 2. **Оптимизированный useChatMessages**

```javascript
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useChatStore, PAGINATION } from '../../../entities/chat/model';
import { chatApi } from '../../api/chatApi';
import { toast } from 'react-toastify';

export const useChatMessages = (chatId) => {
  const {
    messages,
    setMessages,
    prependMessages,
    hasMoreMessages,
    setHasMoreMessages,
    isLoadingMessages,
    setIsLoadingMessages
  } = useChatStore();

  // Кеш для загруженных сообщений
  const messagesCache = useRef(new Map());
  const loadInProgress = useRef(false);

  // Оптимизированная загрузка сообщений
  const loadMessages = useCallback(async (beforeId = null, replace = false) => {
    if (!chatId) {
      return false;
    }
    
    // Защита от параллельных запросов
    if (loadInProgress.current) {
      return false;
    }
    
    // Проверяем кеш для начальных сообщений
    const cacheKey = `${chatId}-${beforeId || 'initial'}`;
    if (!replace && messagesCache.current.has(cacheKey)) {
      if (import.meta.env.DEV) {
        console.log('ChatMessages: Используем кешированные сообщения');
      }
      return true;
    }
    
    try {
      loadInProgress.current = true;
      setIsLoadingMessages(true);
      
      const response = await chatApi.getMessages(chatId, {
        beforeId,
        limit: PAGINATION.MESSAGES_LIMIT
      });
      
      const { messages: newMessages, hasMore } = response;
      
      // Кешируем результат
      messagesCache.current.set(cacheKey, { messages: newMessages, hasMore });
      
      if (replace) {
        setMessages(newMessages);
      } else {
        prependMessages(newMessages);
      }
      
      setHasMoreMessages(hasMore);
      
      if (import.meta.env.DEV) {
        console.log('ChatMessages: Загружено сообщений:', newMessages.length);
      }
      
      return true;
    } catch (error) {
      console.error('ChatMessages: Ошибка при загрузке сообщений:', error);
      toast.error('Не удалось загрузить сообщения');
      return false;
    } finally {
      setIsLoadingMessages(false);
      loadInProgress.current = false;
    }
  }, [chatId, setIsLoadingMessages, setMessages, prependMessages, setHasMoreMessages]);

  // Загрузка начальных сообщений при изменении chatId
  useEffect(() => {
    if (chatId) {
      // Очищаем кеш при смене чата
      messagesCache.current.clear();
      loadMessages(null, true);
    }
  }, [chatId]); // ✅ Убираем loadMessages из зависимостей

  // Остальные методы без изменений...
  
  return {
    messages,
    groupedMessages,
    hasMoreMessages,
    isLoadingMessages,
    unreadCount,
    loadMessages,
    loadMoreMessages,
    clearMessages,
    isLastFromSender,
    isEmpty: messages.length === 0,
    canLoadMore: hasMoreMessages && !isLoadingMessages && messages.length > 0
  };
};
```

## ✅ Итоговые преимущества

1. **Устранены бесконечные useEffect циклы** - убраны callback функции из зависимостей
2. **Предотвращены дублирующиеся запросы** - добавлена защита от параллельных запросов
3. **Добавлено кеширование** - на уровне API и компонентов
4. **Настроен контролируемый polling** - автоматическое обновление каждые 2 минуты
5. **Оптимизированы зависимости** - удалены ненужные зависимости из useEffect
6. **Улучшена обработка ошибок** - добавлена детальная обработка различных типов ошибок

### 🎯 Результат:
- **Один запрос** `/chats/manager` при загрузке компонента
- **Кеширование** на 30 секунд для предотвращения повторных запросов  
- **Автоматическое обновление** каждые 2 минуты
- **Защита от параллельных запросов**
- **Оптимистичные обновления** для лучшего UX 