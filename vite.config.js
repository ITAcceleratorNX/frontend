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
    react({
      jsxRuntime: 'automatic', 
      fastRefresh: true,
      include: ['**/*.jsx', '**/*.js']
    }),
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
      target: 'https://backend.shakyrty.kz',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, ''),
      secure: false,
      configure: (proxy, _options) => {
        proxy.on('error', (err, _req, _res) => {
          console.log('proxy error', err);
        });
        proxy.on('proxyReq', (proxyReq, req, _res) => {
          console.log('Sending Request to the Target:', req.method, req.url);
        });
        proxy.on('proxyRes', (proxyRes, req, _res) => {
          console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
        });
      },
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE,PATCH,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true'
      }
    }
  }
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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'scheduler'],
          'vendor-router': ['react-router-dom'],
          'vendor-state': ['zustand', '@tanstack/react-query'],
          'vendor-ui': ['lucide-react', '@radix-ui/react-accordion', '@radix-ui/react-dialog', '@radix-ui/react-label', '@radix-ui/react-slot'],
          'vendor-notifications': ['react-toastify', 'react-hot-toast'],
          'vendor-maps': ['leaflet', 'react-leaflet']
        }
      }
    }
  },
  define: {
    'process.env': {}
  },
  resolve: {
    extensions: ['.js', '.jsx', '.json'],
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', '@tanstack/react-query', 'zustand']
  }
})