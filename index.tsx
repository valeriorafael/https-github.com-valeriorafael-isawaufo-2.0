
import React from 'react';
import { createRoot } from 'react-dom/client';
import AppModule from './App.tsx';

// Registro do Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW Registered!', reg))
      .catch(err => console.log('SW registration failed: ', err));
  });
}

// Extrai o componente real caso o import retorne um objeto de módulo
const App = (AppModule as any).default || AppModule;

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
