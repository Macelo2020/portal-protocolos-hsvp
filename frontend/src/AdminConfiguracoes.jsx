// src/AdminConfiguracoes.jsx
// ==================================================================
// MÓDULO: Configurações Globais e Gestão Dinâmica de Capas Padrão
// ARQUITETURA: React Hooks + FormData + UX/UI Institucional
// ==================================================================

import { useState } from 'react';
import { useApiService, IMAGES_URL } from './services/apiService';

function AdminConfiguracoes() {
  const { apiFetch } = useApiService();

  // Estados locais para controlo de carregamento e refresh visual (Cache Busting)
  const [carregandoCat, setCarregandoCat] = useState(false);
  const [carregandoProt, setCarregandoProt] = useState(false);
  const [timestamp, setTimestamp] = useState(Date.now()); // Força a recarga da imagem no navegador

  // =========================================================
  // FUNÇÃO: Enviar Nova Capa Padrão (Categoria ou Protocolo)
  // =========================================================
  const handleAtualizarCapaPadrao = async (tipo, ficheiro) => {
    if (!ficheiro) {
      return alert('Por favor, selecione um ficheiro de imagem válido.');
    }

    const formData = new FormData();
    formData.append('nova_imagem', ficheiro);

    // Direciona para a rota dedicada correspondente no backend
    const endpoint = tipo === 'categoria' 
      ? 'configuracoes/capa-padrao-categoria' 
      : 'configuracoes/capa-padrao-protocolo';

    try {
      if (tipo === 'categoria') setCarregandoCat(true);
      if (tipo === 'protocolo') setCarregandoProt(true);

      // Chamada à API protegida por token JWT (admin_master)
      const resposta = await apiFetch(endpoint, {
        method: 'POST',
        body: formData
      }, true); // O 'true' indica envio de multipart/form-data

      // Atualiza o timestamp para forçar o navegador a atualizar a pré-visualização da imagem
      setTimestamp(Date.now());
      alert(resposta.message || 'Capa padrão atualizada com sucesso!');
    } catch (error) {
      console.error(`Falha ao atualizar capa padrão de ${tipo}:`, error);
      alert(`Erro: ${error.message || 'Falha ao comunicar com o servidor.'}`);
    } finally {
      setCarregandoCat(false);
      setCarregandoProt(false);
    }
  };

  return (
    <div className="admin-painel" style={{ maxWidth: '900px', margin: '20px auto' }}>
      <h2>Painel de Identidade Visual e Capas Padrão</h2>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px' }}>
        Aqui você define a <strong>Capa Padrão Global</strong>. Sempre que um novo protocolo ou categoria for cadastrado sem uma imagem própria, esta será a imagem aplicada automaticamente a eles.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
        
        {/* --- BLOCO 1: CAPA PADRÃO DE CATEGORIAS --- */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#004a9f', marginTop: '0' }}>📁 Capa Padrão de Categorias</h3>
          <p style={{ fontSize: '13px', color: '#475569' }}>
            Usada em todas as categorias que não possuem capa personalizada.
          </p>

          {/* Pré-visualização da capa atual com Cache Busting */}
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <img 
              src={`${IMAGES_URL}/default_categoria.png?t=${timestamp}`} 
              alt="Capa Padrão de Categorias Atual" 
              style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              onError={(e) => { e.target.style.display = 'none'; }} 
            />
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const input = e.target.elements.fileCategoria;
            handleAtualizarCapaPadrao('categoria', input.files[0]);
          }}>
            <div className="form-coluna" style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', marginBottom: '5px' }}>Nova Imagem Padrão (Categorias):</label>
              <input type="file" name="fileCategoria" accept="image/*" disabled={carregandoCat} required />
            </div>
            <button type="submit" className="btn-salvar" disabled={carregandoCat}>
              {carregandoCat ? 'A atualizar...' : 'Atualizar Capa Padrão de Categorias'}
            </button>
          </form>
        </div>

        {/* --- BLOCO 2: CAPA PADRÃO DE PROTOCOLOS --- */}
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ color: '#004a9f', marginTop: '0' }}>📄 Capa Padrão de Protocolos</h3>
          <p style={{ fontSize: '13px', color: '#475569' }}>
            Usada em <strong>todos os protocolos</strong> que não tenham uma capa individual definida.
          </p>

          {/* Pré-visualização da capa atual com Cache Busting */}
          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <img 
              src={`${IMAGES_URL}/default_protocolo.png?t=${timestamp}`} 
              alt="Capa Padrão de Protocolos Atual" 
              style={{ width: '120px', height: '160px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          <form onSubmit={(e) => {
            e.preventDefault();
            const input = e.target.elements.fileProtocolo;
            handleAtualizarCapaPadrao('protocolo', input.files[0]);
          }}>
            <div className="form-coluna" style={{ marginBottom: '15px' }}>
              <label style={{ fontWeight: '600', fontSize: '13px', marginBottom: '5px' }}>Nova Imagem Padrão (Protocolos):</label>
              <input type="file" name="fileProtocolo" accept="image/*" disabled={carregandoProt} required />
            </div>
            <button type="submit" className="btn-salvar" disabled={carregandoProt}>
              {carregandoProt ? 'A atualizar...' : 'Atualizar Capa Padrão de Protocolos'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}

export default AdminConfiguracoes;