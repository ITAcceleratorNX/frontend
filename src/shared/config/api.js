/**
 * Централизованная конфигурация API
 * 
 * ВАЖНО: Измените URL здесь, чтобы обновить URL бэкенда во всём приложении
 * 
 * Также обновите vite.config.js -> API_PROXY_TARGET (или используйте переменную VITE_API_URL)
 */

const isDevelopment = import.meta.env.DEV;

// ============================================
// ИЗМЕНИТЕ ЭТИ URL ДЛЯ СМЕНЫ БЭКЕНДА
// ============================================

// URL бэкенда для production
const PRODUCTION_API_URL = 'https://api.extraspace.kz';

// URL бэкенда для development (localhost)
// ВАЖНО: Должен совпадать с API_PROXY_TARGET в vite.config.js
const DEVELOPMENT_API_URL = 'https://api.extraspace.kz';

// ============================================

// Используем прокси в development, прямой URL в production
export const API_BASE_URL = "https://api.extraspace.kz";

// Прямой URL для случаев, когда прокси не используется (SSE, WebSocket и т.д.)
export const API_DIRECT_URL = isDevelopment ? DEVELOPMENT_API_URL : PRODUCTION_API_URL;

// WebSocket URL (wss для production, ws для development)
export const WS_URL = isDevelopment 
  ? `ws://${DEVELOPMENT_API_URL.replace(/^https?:\/\//, '')}` 
  : `wss://${PRODUCTION_API_URL.replace(/^https?:\/\//, '')}`;
