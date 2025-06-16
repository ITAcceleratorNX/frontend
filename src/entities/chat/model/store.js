import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useChatStore = create(
  subscribeWithSelector((set, get) => ({
    // Состояние чатов
    chats: [],
    activeChat: null,
    
    // Состояние сообщений
    messages: [],
    hasMoreMessages: true,
    isLoadingMessages: false,
    
    // Состояние соединения
    chatStatus: 'idle', // 'idle', 'pending', 'active', 'closed'
    isConnected: false,
    managerId: null,
    
    // Уведомления для менеджеров
    newChatNotifications: [],
    
    // Действия для чатов
    setChats: (chats) => set({ chats }),
    setActiveChat: (chat) => set({ activeChat: chat }),
    
    // Действия для сообщений
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set(state => {
      // Проверяем, существует ли уже сообщение с таким ID
      const messageExists = state.messages.some(msg => msg.id === message.id);
      if (messageExists) {
        if (import.meta.env.DEV) {
          console.log('ChatStore: Сообщение уже существует, пропускаем дубликат:', message.id);
        }
        return state; // Возвращаем текущее состояние без изменений
      }
      
      return {
        messages: [...state.messages, message]
      };
    }),
    prependMessages: (messages) => set(state => {
      // Фильтруем новые сообщения, исключая уже существующие
      const existingIds = new Set(state.messages.map(msg => msg.id));
      const newMessages = messages.filter(msg => !existingIds.has(msg.id));
      
      if (newMessages.length === 0) {
        if (import.meta.env.DEV) {
          console.log('ChatStore: Все сообщения уже существуют, пропускаем');
        }
        return state;
      }
      
      return {
        messages: [...newMessages, ...state.messages]
      };
    }),
    setHasMoreMessages: (hasMore) => set({ hasMoreMessages: hasMore }),
    setIsLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),
    
    // Действия для состояния
    setChatStatus: (status) => set({ chatStatus: status }),
    setConnectionStatus: (isConnected) => set({ isConnected }),
    setManagerId: (managerId) => set({ managerId }),
    
    // Действия для уведомлений менеджеров
    addNewChatNotification: (notification) => set(state => ({
      newChatNotifications: [...state.newChatNotifications, notification]
    })),
    removeNewChatNotification: (chatId) => set(state => ({
      newChatNotifications: state.newChatNotifications.filter(n => n.chatId !== chatId)
    })),
    clearNewChatNotifications: () => set({ newChatNotifications: [] }),
    
    // Сброс состояния
    resetChat: () => set({
      activeChat: null,
      messages: [],
      chatStatus: 'idle',
      managerId: null,
      hasMoreMessages: true,
      isLoadingMessages: false
    }),
    
    resetAll: () => set({
      chats: [],
      activeChat: null,
      messages: [],
      hasMoreMessages: true,
      isLoadingMessages: false,
      chatStatus: 'idle',
      isConnected: false,
      managerId: null,
      newChatNotifications: []
    }),
    
    // Геттеры
    getChatById: (chatId) => {
      const state = get();
      return state.chats.find(chat => chat.id === chatId);
    },
    
    getUnreadMessagesCount: () => {
      const state = get();
      return state.messages.filter(msg => !msg.is_read).length;
    }
  }))
); 