import React from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './contexts/AppContext';
import App from './App';
import './styles/globals.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
