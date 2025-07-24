// Статусы чата
export const CHAT_STATUS = {
  IDLE: 'idle',
  PENDING: 'pending', 
  ACTIVE: 'active',
  CLOSED: 'closed'
};

// Типы WebSocket сообщений
export const WS_MESSAGE_TYPES = {
  START_CHAT: 'START_CHAT',
  SEND_MESSAGE: 'SEND_MESSAGE',
  ACCEPT_CHAT: 'ACCEPT_CHAT',
  NEW_CHAT: 'NEW_CHAT',
  CHAT_ACCEPTED: 'CHAT_ACCEPTED',
  CHAT_ASSIGNED: 'CHAT_ASSIGNED',
  NEW_MESSAGE: 'NEW_MESSAGE',
  WAITING_FOR_MANAGER: 'WAITING_FOR_MANAGER',
  CHAT_CLOSED: 'CHAT_CLOSED'
};

// Роли пользователей
export const USER_ROLES = {
  USER: 'USER',
  MANAGER: 'MANAGER',
  ADMIN: 'ADMIN'
};

// Настройки пагинации
export const PAGINATION = {
  MESSAGES_LIMIT: 20,
  CHATS_LIMIT: 10
};

// WebSocket URL
export const WS_URL = 'wss://api.extraspace.kz'; 