import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/index'
import './app/styles/global.css'

// Находим корневой элемент
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Не найден корневой элемент с id "root"');
}

// Создаем корень React и рендерим приложение
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
) 