import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { StorageProvider } from './storage/StorageContext';
import App from './App';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <StorageProvider>
        <App />
      </StorageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
