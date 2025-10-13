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
    managerName: null,

    // Уведомления для менеджеров
    newChatNotifications: [],

    // Оқылмаған хабарламалар (чат ID -> санағыш)
    unreadMessages: {}, // { chatId: count }

    // Действия для чатов
    setChats: (chats) => set({ chats }),
    setActiveChat: (chat) => set({ activeChat: chat }),

    // Действия для сообщений
    setMessages: (messages) => set({ messages }),
    addMessage: (message) => set(state => {
      if (import.meta.env.DEV) {
        console.log('Store addMessage: Добавление сообщения, текущее количество:', state.messages.length, 'новое:', message);
      }
      return {
        messages: [...state.messages, message]
      };
    }),
    prependMessages: (messages) => set(state => ({
      messages: [...messages, ...state.messages]
    })),
    removeMessage: (messageId) => set(state => {
      if (import.meta.env.DEV) {
        console.log('Store removeMessage: Удаление сообщения', messageId);
      }
      return {
        messages: state.messages.filter(msg => msg.id !== messageId)
      };
    }),
    setHasMoreMessages: (hasMore) => set({ hasMoreMessages: hasMore }),
    setIsLoadingMessages: (isLoading) => set({ isLoadingMessages: isLoading }),

    // Действия для состояния
    setChatStatus: (status) => set({ chatStatus: status }),
    setConnectionStatus: (isConnected) => set({ isConnected }),
    setManagerId: (managerId) => set({ managerId }),
    setManagerName: (managerName) => set({ managerName }),

    // Действия для уведомлений менеджеров
    addNewChatNotification: (notification) => set(state => ({
      newChatNotifications: [...state.newChatNotifications, notification]
    })),
    removeNewChatNotification: (chatId) => set(state => ({
      newChatNotifications: state.newChatNotifications.filter(n => n.chatId !== chatId)
    })),
    clearNewChatNotifications: () => set({ newChatNotifications: [] }),

    // Оқылмаған хабарламалар actions
    incrementUnreadMessages: (chatId) => set(state => ({
      unreadMessages: {
        ...state.unreadMessages,
        [chatId]: (state.unreadMessages[chatId] || 0) + 1
      }
    })),
    clearUnreadMessages: (chatId) => set(state => ({
      unreadMessages: {
        ...state.unreadMessages,
        [chatId]: 0
      }
    })),
    getUnreadCount: (chatId) => {
      const state = get();
      return state.unreadMessages[chatId] || 0;
    },

    // Сброс состояния
    resetChat: () => set({
      activeChat: null,
      messages: [],
      chatStatus: 'idle',
      managerId: null,
      managerName: null,
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
      managerName: null,
      newChatNotifications: [],
      unreadMessages: {}
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