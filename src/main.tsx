import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register Service Worker for offline capability & background sync at remote airport locations
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[SW] Service Worker registered with scope:', reg.scope);
      })
      .catch((err) => {
        console.warn('[SW] Service Worker registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
