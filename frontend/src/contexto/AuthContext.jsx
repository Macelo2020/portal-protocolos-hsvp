// src/contexto/AuthContext.jsx
// VERSÃO FINAL: Inclui o estado do TOKEN para o uso seguro da API.

import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode'; 

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  
  // 1. Estado para o TOKEN (a string JWT completa) - NOVO E ESSENCIAL
  const [token, setToken] = useState(null); 
  
  // 2. Estado para o Objeto do Usuário (dados decodificados)
  const [usuario, setUsuario] = useState(null); 

  // Efeito para carregar a sessão do LocalStorage ao iniciar
  useEffect(() => {
    // Ao carregar, tenta ler o token do localStorage
    const storedToken = localStorage.getItem('token'); 
    
    if (storedToken) {
      try {
        const decodedUser = jwtDecode(storedToken);

        // Verifica se o token não expirou (boa prática)
        if (decodedUser.exp * 1000 > Date.now()) { 
          setToken(storedToken); // <--- Guarda o token na memória
          setUsuario(decodedUser); 
        } else {
          localStorage.removeItem('token');
        }
      } catch (e) {
        console.error("Erro ao carregar/decodificar token:", e);
        localStorage.removeItem('token');
      }
    }
  }, []); 

  const login = (novoToken) => {
    try {
      const dadosUsuario = jwtDecode(novoToken);
      
      // Guarda o TOKEN e os dados decodificados na memória
      setToken(novoToken); // <--- ATUALIZA o token
      setUsuario(dadosUsuario); 
      
      // Guarda o crachá no disco (LocalStorage)
      localStorage.setItem('token', novoToken); 
      
    } catch (e) {
      console.error("Erro ao decodificar token:", e);
    }
  };

  const logout = () => {
    setUsuario(null); // Limpa os dados da memória
    setToken(null); // <--- Limpa o token da memória
    localStorage.removeItem('token'); // Limpa o crachá do disco
  };
  
  // Funções de verificação de permissão (Melhoria de UX/UI)
  const isAdmin = usuario && (usuario.funcao === 'admin_master' || usuario.funcao === 'admin_editor');
  const isMaster = usuario && usuario.funcao === 'admin_master';

  // (MUDANÇA CRÍTICA) O valor que compartilhamos AGORA INCLUI o TOKEN
  const valor = { 
    usuario, 
    token, // <--- EXPOSTO para ser usado pelo useApiService
    login, 
    logout,
    isAdmin,
    isMaster
  }; 

  return (
    <AuthContext.Provider value={valor}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  // Agora ele retorna { usuario, token, login, logout, isAdmin, isMaster }
  return useContext(AuthContext);
};