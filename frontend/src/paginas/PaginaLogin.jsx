// src/paginas/PaginaLogin.jsx
// VERSÃO FINAL: IP Fixo Removido (Usa API_BASE_URL)

import { useState } from 'react';
import '../App.css';
import { useAuth } from '../contexto/AuthContext';
import { useNavigate } from 'react-router-dom';
// 1. IMPORTAMOS A URL BASE DINÂMICA
import { API_BASE_URL } from '../services/apiService';

function PaginaLogin() {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); 
  const navigate = useNavigate();

  // 2. REMOVIDO: const API_URL = ... (Não usamos mais fixo)

  const handleLogin = (evento) => {
    evento.preventDefault(); 
    if (!username || !password) return alert('Preencha todos os campos.');

    // 3. USAMOS A URL DINÂMICA
    fetch(`${API_BASE_URL}/login`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(r => r.ok ? r.json() : Promise.reject(r)) // Se der erro, rejeita
    .then(dados => {
      login(dados.token); 
      navigate('/admin'); 
    })
    .catch(async (erro) => {
        let msg = "Erro ao conectar.";
        // Proteção extra caso o erro não seja JSON (ex: servidor desligado)
        if (erro.json) {
            const body = await erro.json().catch(() => ({}));
            msg = body.error || msg;
        }
        alert(msg);
    });
  };

  return (
    <div className="conteudo-pagina" style={{ display: 'flex', justifyContent: 'center', marginTop: 50 }}>
        <div className="pagina-login" style={{ maxWidth: 400, width: '100%', textAlign: 'center' }}>
          <h2>Login Administrativo</h2>
          <p>Acesso exclusivo para colaboradores.</p>
          
          <form onSubmit={handleLogin} className="form-login">
            <label>Usuário:</label>
            <input 
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="Ex: admin"
            />
            <label>Senha:</label>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Sua senha"
            />
            <button type="submit" style={{marginTop: 15, cursor:'pointer', backgroundColor:'#2563eb', color:'white', border:'none', borderRadius:5}}>
                Entrar
            </button>
          </form>
        </div>
    </div>
  );
}

export default PaginaLogin;