// src/AdminProtocolos.jsx
// VERSÃO 4.0: Com Barra de Pesquisa e Alinhamento Visual Melhorado

import { useState, useEffect } from 'react';
import { useApiService, IMAGES_URL } from './services/apiService';

function AdminProtocolos() {
  const [protocolos, setProtocolos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  // Novo Estado para a Busca
  const [termoBusca, setTermoBusca] = useState('');

  // Estados do Formulário
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [arquivosPdf, setArquivosPdf] = useState([]); 
  const [imagemCapa, setImagemCapa] = useState(null);

  const [editandoId, setEditandoId] = useState(null); 
  
  const { http } = useApiService();

  useEffect(() => {
    carregarTudo();
  }, []);

  const carregarTudo = () => {
    http.getPublic('protocolos').then(setProtocolos);
    http.getPublic('categorias').then(setCategorias);
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
      // Rola a tela para cima suavemente para o usuário editar
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

    // Lógica de Edição
    if (editandoId) {
        formData.append('titulo', titulo);
        if (arquivosPdf.length > 0) formData.append('arquivo_pdf', arquivosPdf[0]);
        if (imagemCapa) formData.append('imagem_capa', imagemCapa);

        try {
            await http.put(`protocolos/${editandoId}`, formData); 
            alert("Protocolo atualizado com sucesso!");
            handleCancelarEdicao();
            carregarTudo();
        } catch (error) {
            console.error(error);
            alert("Erro ao atualizar.");
        }
        return;
    }

    // Lógica de Criação (Novo)
    if (arquivosPdf.length === 0) {
        alert("Selecione pelo menos um arquivo PDF.");
        return;
    }

    if (arquivosPdf.length > 1) {
        // Envio em Massa
        arquivosPdf.forEach(file => formData.append('arquivos_pdf', file));
        try {
            await http.postMultiPart('protocolos/massa', formData);
            alert("Envio em massa concluído!");
            limparFormulario();
            carregarTudo();
        } catch (error) {
            alert("Erro no envio em massa.");
        }
    } else {
        // Envio Único
        formData.append('arquivo_pdf', arquivosPdf[0]);
        const tituloFinal = titulo || arquivosPdf[0].name.replace('.pdf','');
        formData.append('titulo', tituloFinal);
        if (imagemCapa) formData.append('imagem_capa', imagemCapa);

        try {
            await http.postMultiPart('protocolos', formData);
            alert("Salvo com sucesso!");
            limparFormulario();
            carregarTudo();
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
            carregarTudo();
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

  // --- LÓGICA DE FILTRO (BUSCA) ---
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

      {/* --- FORMULÁRIO --- */}
      <form className="admin-form-protocolo" onSubmit={handleSalvar} style={{border: editandoId ? '2px solid #3b82f6' : '1px solid #ddd'}}>
        
        {/* Linha 1: Categoria e Título */}
        <div className="form-linha">
            <div className="form-coluna">
                <label>Categoria:</label>
                <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required style={{padding: 10}}>
                  <option value="">Selecione...</option>
                  {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
            </div>
            
            {(editandoId || arquivosPdf.length === 1) && (
                <div className="form-coluna">
                    <label>Título do Protocolo:</label>
                    <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Protocolo de AVC" style={{padding: 10}} />
                </div>
            )}
        </div>

        {/* Linha 2: Arquivos (PDF e Imagem Lado a Lado) */}
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

      {/* --- LISTA COM BUSCA --- */}
      <h3>Lista de Protocolos Cadastrados ({protocolosFiltrados.length})</h3>
      
      {/* BARRA DE PESQUISA NOVA */}
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