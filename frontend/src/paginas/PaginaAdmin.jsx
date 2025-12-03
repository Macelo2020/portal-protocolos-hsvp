// src/paginas/PaginaAdmin.jsx
// VERSÃO FINAL: Compatível com o novo apiService (http.getPublic)

import { useState, useEffect } from 'react';
import { useAuth } from '../contexto/AuthContext'; 
import { useApiService } from '../services/apiService'; 
import AdminCategorias from '../AdminCategorias'; 
import AdminProtocolos from '../AdminProtocolos';
import '../App.css';

function PaginaAdmin() {

  const { usuario } = useAuth();
  
  // CORREÇÃO: Usamos 'http' em vez de 'publicData'
  const { http } = useApiService(); 

  const isMaster = usuario && usuario.funcao === 'admin_master';

  const [categorias, setCategorias] = useState([]);
  const [listaAdminProtocolos, setListaAdminProtocolos] = useState([]);

  // --- Funções de Dados ---
  const recarregarCategorias = () => {
    // CORREÇÃO: http.getPublic('categorias')
    http.getPublic('categorias')
      .then(dados => setCategorias(dados))
      .catch(error => console.error("Erro categorias:", error));
  };

  const recarregarProtocolosAdmin = () => {
    // CORREÇÃO: http.getPublic('protocolos')
    http.getPublic('protocolos')
      .then(dados => setListaAdminProtocolos(dados))
      .catch(error => console.error("Erro protocolos:", error));
  };

  useEffect(() => {
    recarregarCategorias();
    recarregarProtocolosAdmin(); 
  }, []); 

  return (
    <div className="conteudo-pagina" style={{padding: 30, overflowY: 'auto', height: 'calc(100vh - 85px)'}}>
      <h1 style={{marginTop: 0}}>Painel de Administração</h1>
      
      {usuario && isMaster ? (
        <p style={{background: '#dcfce7', padding: 10, borderRadius: 5, color: '#166534'}}>
            Logado como: <strong>{usuario.username}</strong> (Acesso Total)
        </p>
      ) : (
        <p style={{background: '#e0f2fe', padding: 10, borderRadius: 5, color: '#075985'}}>
            Logado como: <strong>{usuario ? usuario.username : 'Convidado'}</strong> (Gerente)
        </p>
      )}
      
      {isMaster && (
        <AdminCategorias 
          categorias={categorias} 
          recarregarCategorias={recarregarCategorias} 
        />
      )}
      
      <AdminProtocolos 
        categorias={categorias} 
        listaAdminProtocolos={listaAdminProtocolos}
        recarregarProtocolosAdmin={recarregarProtocolosAdmin}
      />
    </div>
  );
}

export default PaginaAdmin;