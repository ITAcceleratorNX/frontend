// Этот файл гарантирует, что React всегда доступен глобально
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as ReactDOMClient from 'react-dom/client';

// Делаем React доступным глобально, чтобы contextAPI работал корректно
window.React = React;
window.ReactDOM = ReactDOM;
window.ReactDOMClient = ReactDOMClient;

// Экспортируем для возможности импорта
export { React, ReactDOM, ReactDOMClient }; 