import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://backend-8jwk.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    }
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react')) {
              return 'icons'
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            if (id.includes('zustand') || id.includes('tanstack')) {
              return 'vendor-state'
            }
            return 'vendor'
          }
        }
      }
    }
  },
  define: {
    // Для улучшения совместимости с кодом (имитация наличия process.env)
    'process.env': {}
  },
  // Определяем поддерживаемые расширения файлов
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  }
}) 