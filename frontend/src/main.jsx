import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// ✅ FIX: Clean up any old service workers and caches
// This fixes the "works in incognito but not regular browser" issue
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister();
      console.log('Unregistered old service worker');
    });
  });
}

// Clear old caches
if ('caches' in window) {
  caches.keys().then(keys => {
    keys.forEach(key => {
      caches.delete(key);
      console.log('Cleared old cache:', key);
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
