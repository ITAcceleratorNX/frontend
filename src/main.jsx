import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './app/index'
import './app/styles/global.css'
import './app/styles/staff-dark.css'
import { initAttribution } from './shared/lib/attribution.js'

// LP attribution: capture gclid/utm_* synchronously at script load, BEFORE
// any React effect strips utm_* from the URL bar (см. ТЗ §3.6). Idempotent —
// safe to call again from LP page mount.
try {
  initAttribution();
} catch (e) {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn('[main] initAttribution failed', e);
  }
}

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