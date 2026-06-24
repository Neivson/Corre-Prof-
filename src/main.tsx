import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register Service Worker only in Production to prevent local development/preview caching issues
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      const basePath = window.location.pathname.endsWith('/') 
        ? window.location.pathname 
        : window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);

      navigator.serviceWorker.register(basePath + 'sw.js', { scope: basePath })
        .then((reg) => {
          console.log('PWA Service Worker registered successfully with scope:', reg.scope);
        })
        .catch((err) => {
          console.warn('PWA Service Worker registration failed:', err);
        });
    });
  } else {
    // In development mode, unregister any existing service worker to prevent cached script/image conflicts
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let unregistered = false;
      for (const registration of registrations) {
        registration.unregister();
        unregistered = true;
      }
      if (unregistered) {
        console.log('Dev Mode: Unregistered active service worker to prevent script/cache conflicts. Reloading...');
        window.location.reload();
      }
    });
  }
}
