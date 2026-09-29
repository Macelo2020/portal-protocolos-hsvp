// src/AdminProtocolos.jsx
// ==================================================================
// PROJETO: Portal de Protocolos HSVP (Frontend v4.1 - Reativo)
// ARQUITETURA: React Hooks + Sincronização Unificada de Estado
// ==================================================================

import { useState, useEffect } from 'react';
import { useApiService, IMAGES_URL } from './services/apiService';

// 🛠️ CORREÇÃO CRUCIAL: Recebe as props 'categorias' e 'recarregarProtocolosAdmin' do componente Pai (PaginaAdmin)
function AdminProtocolos({ categorias = [], listaAdminProtocolos = [], recarregarProtocolosAdmin }) {
  // Lista local de protocolos para permitir recarregamento após inserção ou exclusão
  const [protocolos, setProtocolos] = useState([]);
  
  // Estado para busca dinâmica em tempo real
  const [termoBusca, setTermoBusca] = useState('');

  // Estados dos campos do formulário
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [arquivosPdf, setArquivosPdf] = useState([]); 
  const [imagemCapa, setImagemCapa] = useState(null);

  const [editandoId, setEditandoId] = useState(null); 
  
  const { http } = useApiService();

  // Sincroniza a lista com as props recebidas do componente pai
  useEffect(() => {
    if (listaAdminProtocolos && listaAdminProtocolos.length > 0) {
      setProtocolos(listaAdminProtocolos);
    } else {
      carregarProtocolos();
    }
  }, [listaAdminProtocolos]);

  // Função exclusiva para buscar protocolos (categorias agora vêm reativamente do pai)
  const carregarProtocolos = () => {
    if (typeof recarregarProtocolosAdmin === 'function') {
      recarregarProtocolosAdmin();
    } else {
      http.getPublic('protocolos').then(setProtocolos).catch(console.error);
    }
  };

  const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      if (files.length > 5) {
          alert("Máximo de 5 arquivos por vez!");
          e.target.value = ""; 
          setArquivosPdf([]);
          return;
      }
      setArquivosPdf(files);
  };

  const handleEditar = (protocolo) => {
      setEditandoId(protocolo.id);
      setTitulo(protocolo.titulo);
      setCategoriaId(protocolo.categoria_id);
      setArquivosPdf([]); 
      setImagemCapa(null);
      // UX: Desloca o ecrã suavemente até ao formulário
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelarEdicao = () => {
      setEditandoId(null);
      limparFormulario();
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!categoriaId) {
      alert("Selecione a Categoria.");
      return;
    }

    const formData = new FormData();
    formData.append('categoria_id', categoriaId);

    // 1. Fluxo de Edição de Protocolo Existente
    if (editandoId) {
        formData.append('titulo', titulo);
        if (arquivosPdf.length > 0) formData.append('arquivo_pdf', arquivosPdf[0]);
        if (imagemCapa) formData.append('imagem_capa', imagemCapa);

        try {
            await http.put(`protocolos/${editandoId}`, formData); 
            alert("Protocolo atualizado com sucesso!");
            handleCancelarEdicao();
            carregarProtocolos();
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar.");
        }
        return;
    }

    // 2. Fluxo de Criação (Novo Protocolo)
    if (arquivosPdf.length === 0) {
        alert("Selecione pelo menos um arquivo PDF.");
        return;
    }

    if (arquivosPdf.length > 1) {
        // Envio em Lote (Massa)
        arquivosPdf.forEach(file => formData.append('arquivos_pdf', file));
        try {
            await http.postMultiPart('protocolos/massa', formData);
            alert("Envio em massa concluído com sucesso!");
            limparFormulario();
            carregarProtocolos();
        } catch (error) {
            alert("Erro no envio em massa.");
        }
    } else {
        // Envio Individual
        formData.append('arquivo_pdf', arquivosPdf[0]);
        const tituloFinal = titulo || arquivosPdf[0].name.replace('.pdf','');
        formData.append('titulo', tituloFinal);
        if (imagemCapa) formData.append('imagem_capa', imagemCapa);

        try {
            await http.postMultiPart('protocolos', formData);
            alert("Protocolo salvo com sucesso!");
            limparFormulario();
            carregarProtocolos();
        } catch (error) {
            alert("Erro ao salvar.");
        }
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Excluir este protocolo?")) {
      http.delete(`protocolos/${id}`)
        .then(() => {
            alert("Excluído com sucesso!");
            carregarProtocolos();
        })
        .catch(() => alert("Erro ao excluir."));
    }
  };

  const limparFormulario = () => {
      setTitulo('');
      setCategoriaId('');
      setArquivosPdf([]);
      setImagemCapa(null);
      setEditandoId(null);
      const inputPdf = document.getElementById('input-pdf');
      const inputCapa = document.getElementById('input-capa');
      if (inputPdf) inputPdf.value = "";
      if (inputCapa) inputCapa.value = "";
  };

  const getImageUrl = (caminho) => {
      if (caminho && caminho !== '' && caminho !== 'null') {
          return `${IMAGES_URL}/${caminho}`;
      }
      return `${IMAGES_URL}/capa_generica_protocolo.png`;
  };

  // Filtragem dinâmica para pesquisa sem chamadas extras ao servidor
  const protocolosFiltrados = protocolos.filter(p => 
      p.titulo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="admin-painel">
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom: 20}}>
          <h2 style={{margin:0}}>{editandoId ? '✏️ Editando Protocolo' : 'Gerenciar Protocolos'}</h2>
          {editandoId && (
              <button onClick={handleCancelarEdicao} className="btn-cancelar">
                  Cancelar Edição
              </button>
          )}
      </div>

      {/* --- FORMULÁRIO DE GESTÃO --- */}
      <form className="admin-form-protocolo" onSubmit={handleSalvar} style={{border: editandoId ? '2px solid #3b82f6' : '1px solid #ddd'}}>
        
        {/* Linha 1: Seleção de Categoria e Título */}
        <div className="form-linha">
            <div className="form-coluna">
                <label>Categoria:</label>
                {/* O <select> agora consome diretamente a lista atualizada em tempo real */}
                <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required style={{padding: 10}}>
                  <option value="">Selecione...</option>
                  {categorias.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </select>
            </div>
            
            {(editandoId || arquivosPdf.length === 1) && (
                <div className="form-coluna">
                    <label>Título do Protocolo:</label>
                    <input 
                      type="text" 
                      value={titulo} 
                      onChange={e => setTitulo(e.target.value)} 
                      placeholder="Ex: Protocolo de AVC" 
                      style={{padding: 10}} 
                    />
                </div>
            )}
        </div>

        {/* Linha 2: Uploads (PDF e Imagem de Capa) */}
        <div className="form-linha">
            <div className="form-coluna">
                <label>
                    {editandoId ? 'Substituir PDF (Opcional):' : 'Arquivos PDF (Max 5):'}
                </label>
                <input 
                    type="file" 
                    accept="application/pdf" 
                    multiple={!editandoId} 
                    onChange={handleFileChange} 
                    id="input-pdf" 
                    required={!editandoId} 
                />
            </div>

            {(editandoId || arquivosPdf.length === 1) && (
                <div className="form-coluna">
                    <label>{editandoId ? 'Nova Capa (Opcional):' : 'Imagem de Capa (Opcional):'}</label>
                    <input 
                        type="file" 
                        accept="image/*" 
                        onChange={e => setImagemCapa(e.target.files[0])} 
                        id="input-capa"
                    />
                </div>
            )}
        </div>

        {!editandoId && arquivosPdf.length > 1 && (
            <div style={{padding:15, background:'#e0f2fe', color:'#0284c7', borderRadius:6, margin:'10px 0', textAlign:'center'}}>
                <strong>Modo Envio em Massa Ativado:</strong> {arquivosPdf.length} arquivos serão enviados para a categoria selecionada.
            </div>
        )}

        <button type="submit" className="btn-salvar" style={{width:'100%', marginTop: 10, backgroundColor: editandoId ? '#3b82f6' : '#10b981'}}>
            {editandoId ? 'Atualizar Protocolo' : (arquivosPdf.length > 1 ? 'Enviar Todos Agora' : 'Salvar Protocolo')}
        </button>
      </form>

      <hr style={{margin: '30px 0', borderTop:'1px solid #eee'}}/>

      {/* --- LISTA DE PROTOCOLOS --- */}
      <h3>Lista de Protocolos Cadastrados ({protocolosFiltrados.length})</h3>
      
      <input 
          type="text" 
          placeholder="🔍 Buscar protocolo para editar ou excluir..." 
          className="barra-busca-admin"
          value={termoBusca}
          onChange={e => setTermoBusca(e.target.value)}
      />

      <ul className="lista-admin">
        {protocolosFiltrados.map(p => (
          <li key={p.id} style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding: '10px', borderBottom: '1px solid #eee'}}>
            <div style={{display:'flex', alignItems:'center'}}>
                <img 
                    src={getImageUrl(p.caminho_imagem_capa)} 
                    onError={(e) => {e.target.src = `${IMAGES_URL}/capa_generica_protocolo.png`}} 
                    alt="Capa"
                    style={{width:40, height:50, objectFit:'cover', marginRight:15, borderRadius: 4, border:'1px solid #ddd'}}
                />
                <div>
                    <strong style={{fontSize:'1.1em'}}>{p.titulo}</strong> <br/>
                    <span style={{color:'#64748b', fontSize:'0.9em', background:'#f1f5f9', padding:'2px 6px', borderRadius:4}}>{p.nome_categoria}</span>
                </div>
            </div>
            
            <div style={{display:'flex', gap:'10px'}}>
                <button 
                    type="button" 
                    onClick={() => handleEditar(p)}
                    title="Editar"
                    style={{backgroundColor: '#3b82f6', color:'white', border:'none', padding:'8px 12px', borderRadius:6, cursor:'pointer'}}
                >
                    ✏️
                </button>

                <button 
                    type="button" 
                    className="btn-deletar" 
                    onClick={() => handleDelete(p.id)}
                    title="Excluir"
                    style={{padding:'8px 12px', borderRadius:6}}
                >
                    🗑️
                </button>
            </div>
          </li>
        ))}
        {protocolosFiltrados.length === 0 && (
            <p style={{textAlign:'center', color:'#999', padding:20}}>Nenhum protocolo encontrado com este nome.</p>
        )}
      </ul>
    </div>
  );
}

export default AdminProtocolos;