// Первым делом импортируем React глобально
import './app/lib/ensure-react';

import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/index'
import './app/styles/global.css'

// Обеспечиваем доступность React глобально
window.React = React;

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