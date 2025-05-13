import { defineConfig } from 'vite';

export default defineConfig({
  // Базовая конфигурация Vite
  build: {
    outDir: 'dist',
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 5173,
    strictPort: true,
    allowedHosts: [
      'localhost', 
      '127.0.0.1',
      'frontend-19x7.onrender.com',
      '.onrender.com'
    ]
  }
}); 