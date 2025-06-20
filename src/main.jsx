import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/index'
import './app/styles/global.css'
import { AuthProvider } from './shared/context/AuthContext'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Находим корневой элемент
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден корневой элемент с id "root"');
}

// Создаём экземпляр QueryClient
const queryClient = new QueryClient();

// Создаем корень React и рендерим приложение
createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
) 