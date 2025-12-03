// src/AdminProtocolos.jsx
// (VERSÃO FINAL COMPLETA: Create, Read, Update, Delete + Visual Novo)

import { useState } from 'react';
import { useApiService } from './services/apiService'; 

function AdminProtocolos({ categorias, listaAdminProtocolos, recarregarProtocolosAdmin }) {

  // URL para carregar as imagens
  const BACKEND_URL = 'http://192.168.0.201:3001';
  
  const { apiFetch } = useApiService(); 

  // --- Estados CRIAR ---
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState(''); 
  const [arquivoPdf, setArquivoPdf] = useState(null); 
  const [imagemCapa, setImagemCapa] = useState(null);

  // --- Estados EDITAR ---
  const [idEditando, setIdEditando] = useState(null);
  const [tituloEditando, setTituloEditando] = useState('');
  const [categoriaIdEditando, setCategoriaIdEditando] = useState('');
  const [imagemCapaEditando, setImagemCapaEditando] = useState(null);

  // --- (C)REATE ---
  const handleCriarProtocolo = (evento) => {
    evento.preventDefault(); 
    if (!titulo || !categoriaId || !arquivoPdf) {
      alert('Preencha os campos obrigatórios: Título, Categoria e PDF.');
      return;
    }

    const formData = new FormData();
    formData.append('titulo', titulo);
    formData.append('categoria_id', categoriaId);
    formData.append('pdf', arquivoPdf); 
    if (imagemCapa) formData.append('imagem_capa', imagemCapa); 

    apiFetch('protocolos', { method: 'POST', body: formData })
    .then(() => {
      setTitulo(''); setCategoriaId(''); setArquivoPdf(null); setImagemCapa(null); 
      recarregarProtocolosAdmin(); alert('Protocolo criado com sucesso!');
    })
    .catch(error => alert(error.message));
  };

  // --- (U)PDATE ---
  const handleSalvarEdicaoProtocolo = (e, id) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('titulo', tituloEditando);
    formData.append('categoria_id', categoriaIdEditando);
    if (imagemCapaEditando) formData.append('imagem_capa', imagemCapaEditando);

    apiFetch(`protocolos/${id}`, { method: 'PUT', body: formData })
    .then(() => {
      setIdEditando(null); setImagemCapaEditando(null); 
      recarregarProtocolosAdmin(); alert('Atualizado com sucesso!');
    })
    .catch(e => alert(e.message));
  };

  const handleAbrirEdicao = (p) => {
    setIdEditando(p.id); setTituloEditando(p.titulo); setCategoriaIdEditando(p.categoria_id); setImagemCapaEditando(null);
  };
  
  const handleCancelarEdicao = () => {
    setIdEditando(null); setImagemCapaEditando(null);
  };

  // --- (D)ELETE ---
  const handleDeletarProtocolo = (id, nome) => {
    if (!window.confirm(`Deletar "${nome}"?`)) return;
    apiFetch(`protocolos/${id}`, { method: 'DELETE' })
    .then(() => { recarregarProtocolosAdmin(); alert('Deletado com sucesso!'); })
    .catch(e => alert(e.message));
  };

  return (
    <div className="admin-painel">
      <h2>Gerenciar Protocolos</h2>
      
      {/* Formulário Novo (Lado a Lado) */}
      <form onSubmit={handleCriarProtocolo} className="admin-form">
        <h3>Adicionar Novo Protocolo</h3>
        
        <label>Título:</label>
        <input 
          type="text" 
          placeholder="Nome do protocolo" 
          value={titulo} 
          onChange={e => setTitulo(e.target.value)} 
        />
        
        <label>Categoria:</label>
        <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} >
          <option value="" disabled>Selecione...</option>
          {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
        </select>

        <label>Arquivo PDF (Obrigatório):</label>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={e => setArquivoPdf(e.target.files[0])} 
          key={arquivoPdf ? 'pdf-ok' : 'pdf-no'}
        />

        <label>Imagem da Capa (Opcional):</label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={e => setImagemCapa(e.target.files[0])} 
          key={imagemCapa ? 'img-ok' : 'img-no'}
        />
        
        <button type="submit" className="btn-salvar">Salvar Protocolo</button>
      </form>

      <hr />

      <h3>Protocolos Existentes</h3>
      <ul>
        {listaAdminProtocolos.map(proto => (
          <li key={proto.id}>
            {idEditando === proto.id ? (
              // MODO EDIÇÃO
              <form onSubmit={(e) => handleSalvarEdicaoProtocolo(e, proto.id)} className="admin-form-editar-protocolo">
                <input type="text" value={tituloEditando} onChange={e => setTituloEditando(e.target.value)} className="input-editar-titulo" />
                <select value={categoriaIdEditando} onChange={e => setCategoriaIdEditando(e.target.value)} className="input-editar-categoria">
                  {categorias.map(cat => <option key={cat.id} value={cat.id}>{cat.nome}</option>)}
                </select>
                <input type="file" accept="image/*" onChange={e => setImagemCapaEditando(e.target.files[0])} className="input-editar-imagem" />
                <button type="submit" className="btn-salvar">Salvar</button>
                <button type="button" className="btn-cancelar" onClick={handleCancelarEdicao}>Cancelar</button>
              </form>
            ) : (
              // MODO VISUALIZAÇÃO
              <>
                <div style={{display:'flex', alignItems:'center'}}>
                  {proto.caminho_imagem_capa ? (
                    // CORREÇÃO: Usa BACKEND_URL
                    <img src={`${BACKEND_URL}/images/${proto.caminho_imagem_capa}`} alt={proto.titulo} className="admin-capa-thumbnail" />
                  ) : (
                    <div className="admin-capa-thumbnail placeholder">?</div>
                  )}
                  <span>{proto.titulo}</span>
                </div>
                <div className="admin-botoes">
                  <button className="btn-editar" onClick={() => handleAbrirEdicao(proto)}>Editar</button>
                  <button className="btn-deletar" onClick={() => handleDeletarProtocolo(proto.id, proto.titulo)}>Deletar</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminProtocolos;