// src/paginas/PaginaLogin.jsx
// VERSÃO FINAL: Com IP Fixo e Layout Centralizado.

import { useState } from 'react';
import '../App.css';
import { useAuth } from '../contexto/AuthContext';
import { useNavigate } from 'react-router-dom';

function PaginaLogin() {
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth(); 
  const navigate = useNavigate();

  const API_URL = 'http://192.168.0.201:3001/api/login';

  const handleLogin = (evento) => {
    evento.preventDefault(); 
    if (!username || !password) return alert('Preencha todos os campos.');

    fetch(API_URL, { 
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
        if (erro.json) {
            const body = await erro.json();
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