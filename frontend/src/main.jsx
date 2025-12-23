import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexto/AuthContext';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      {/* REMOVIDO O BASENAME="/portal". Agora roda na raiz! */}
      <BrowserRouter> 
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);