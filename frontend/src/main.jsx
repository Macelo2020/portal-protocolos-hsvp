import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthContext';
import App from './App.jsx';

// (REMOVI O INDEX.CSS QUE DAVA ERRO ANTES)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {/* AQUI ESTÁ A CORREÇÃO: basename="/portal" */}
      <BrowserRouter basename="/portal">
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);