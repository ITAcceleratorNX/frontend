import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss'
import autoprefixer from 'autoprefixer'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

// Определение порта с учетом переменной окружения
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5173;

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'generate-redirects',
      closeBundle() {
        // Создаем _redirects файл в dist директории после сборки
        writeFileSync('dist/_redirects', '/* /index.html 200\n');
        console.log('✓ _redirects file has been created');
      }
    }
  ],
  base: '/',
  server: {
    host: '0.0.0.0',
    port: PORT,
    proxy: {
      '/api': {
        target: 'https://extraspace-backend.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false
      }
    },
    allowedHosts: ['frontend-19x7.onrender.com', '.onrender.com', 'localhost']
  },
  preview: {
    host: '0.0.0.0',
    port: PORT,
    allowedHosts: ['frontend-19x7.onrender.com', '.onrender.com', 'localhost']
  },
  css: {
    postcss: {
      plugins: [
        tailwindcss,
        autoprefixer,
      ],
    },
  },
  build: {
    chunkSizeWarningLimit: 1500,
    outDir: 'dist',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('lucide-react') || id.includes('@radix-ui')) {
              return 'vendor-ui'
            }
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react'
            }
            if (id.includes('zustand') || id.includes('tanstack')) {
              return 'vendor-state'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('react-toastify') || id.includes('react-hot-toast')) {
              return 'vendor-notifications'
            }
            if (id.includes('leaflet') || id.includes('react-leaflet')) {
              return 'vendor-maps'
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
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
})