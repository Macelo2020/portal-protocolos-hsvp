// src/paginas/PaginaAdmin.jsx
// ==================================================================
// MÓDULO: Página de Administração Colaborativa
// ARQUITETURA: React Hooks + UX de Divulgação Progressiva
// ==================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../contexto/AuthContext'; 
import { useApiService } from '../services/apiService'; 
import AdminCategorias from '../AdminCategorias'; 
import AdminProtocolos from '../AdminProtocolos';
import AdminConfiguracoes from '../AdminConfiguracoes'; 
import '../App.css';

function PaginaAdmin() {

  const { usuario } = useAuth();
  const { http } = useApiService(); 

  // Validação: Verifica quem é o admin_master para esconder APENAS as Capas
  const isMaster = usuario && usuario.funcao === 'admin_master';

  const [categorias, setCategorias] = useState([]);
  const [listaAdminProtocolos, setListaAdminProtocolos] = useState([]);

  const recarregarCategorias = () => {
    http.getPublic('categorias')
      .then(dados => setCategorias(dados))
      .catch(error => console.error("Erro categorias:", error));
  };

  const recarregarProtocolosAdmin = () => {
    http.getPublic('protocolos')
      .then(dados => setListaAdminProtocolos(dados))
      .catch(error => console.error("Erro protocolos:", error));
  };

  useEffect(() => {
    // Carrega os dados do servidor para TODOS os utilizadores autenticados
    recarregarCategorias();
    recarregarProtocolosAdmin(); 
  }, []); 

  // ==================================================================
  // SEÇÃO DE RENDERIZAÇÃO (Interface Liberada para Enfermagem)
  // ==================================================================
  return (
    <div className="conteudo-pagina" style={{padding: 30, overflowY: 'auto', height: 'calc(100vh - 85px)'}}>
      <h1 style={{marginTop: 0}}>Painel de Administração e Colaboração</h1>
      
      <p style={{background: '#dcfce7', padding: 10, borderRadius: 5, color: '#166534'}}>
          Logado como: <strong>{usuario?.username}</strong> ({usuario?.funcao || 'Colaborador'})
      </p>

      {/* UX/UI: Secção de Gestão Dinâmica das Capas Padrão - SÓ APARECE PARA ADMIN MASTER */}
      {isMaster && (
        <div style={{ background: '#ffffff', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0', marginBottom: '40px' }}>
          <h2 style={{ color: '#004a9f', marginTop: 0 }}>🖼️ Gestão de Capas Padrão (Globais)</h2>
          <AdminConfiguracoes />
        </div>
      )}
      
      <hr style={{ margin: '40px 0', border: '0', borderTop: '2px solid #cbd5e1' }} />

      {/* Gestão de Categorias (Liberado para a Enfermagem) */}
      <AdminCategorias 
        categorias={categorias} 
        recarregarCategorias={recarregarCategorias} 
      />
      
      <hr style={{ margin: '40px 0', border: '0', borderTop: '2px solid #cbd5e1' }} />

      {/* Gestão de Protocolos (Liberado para a Enfermagem) */}
      <AdminProtocolos 
        categorias={categorias} 
        listaAdminProtocolos={listaAdminProtocolos}
        recarregarProtocolosAdmin={recarregarProtocolosAdmin}
      />
    </div>
  );
}

export default PaginaAdmin;