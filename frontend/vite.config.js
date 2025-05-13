import { defineConfig } from 'vite';

// Определение порта с учетом переменной окружения
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5173;

export default defineConfig({
  // Базовая конфигурация Vite
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
    port: PORT,
    strictPort: true,
    allowedHosts: [
      'localhost', 
      '127.0.0.1',
      'frontend-19x7.onrender.com',
      '.onrender.com'
    ]
  }
}); 