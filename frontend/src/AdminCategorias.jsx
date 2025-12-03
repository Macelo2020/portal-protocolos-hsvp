// src/AdminCategorias.jsx
// (VERSÃO FINAL COMPLETA: Create, Read, Update, Delete + Visual Novo)

import { useState } from 'react';
import { useApiService } from './services/apiService';

function AdminCategorias({ categorias, recarregarCategorias }) {

  // URL para carregar as imagens do servidor
  const BACKEND_URL = 'http://192.168.0.201:3001';
  
  const { apiFetch } = useApiService();

  // --- Estados do Formulário de CRIAR ---
  const [novoNome, setNovoNome] = useState('');
  const [novaImagem, setNovaImagem] = useState(null); 

  // --- Estados do Formulário de EDITAR ---
  const [idEditando, setIdEditando] = useState(null); 
  const [nomeEditando, setNomeEditando] = useState('');
  const [novaImagemEditando, setNovaImagemEditando] = useState(null);

  // --- Função (C)REATE ---
  const handleCriarCategoria = (evento) => {
    evento.preventDefault(); 
    if (!novoNome) return alert('Por favor, preencha o Nome da categoria.');

    const formData = new FormData();
    formData.append('nome', novoNome);
    if (novaImagem) formData.append('imagem', novaImagem); 

    apiFetch('categorias', { method: 'POST', body: formData }, true)
    .then(() => {
      setNovoNome(''); setNovaImagem(null);
      recarregarCategorias(); alert('Categoria criada com sucesso!');
    })
    .catch(error => alert(`Erro: ${error.message}`));
  };

  // --- Função (U)PDATE ---
  const handleSalvarEdicao = (evento, idDaCategoria) => {
    evento.preventDefault(); 
    
    const formData = new FormData();
    formData.append('nome', nomeEditando); 
    if (novaImagemEditando) formData.append('imagem', novaImagemEditando);
    
    apiFetch(`categorias/${idDaCategoria}`, { method: 'PUT', body: formData })
    .then(() => {
      setIdEditando(null); setNomeEditando(''); setNovaImagemEditando(null); 
      recarregarCategorias(); alert('Categoria atualizada com sucesso!');
    })
    .catch(error => alert(error.message));
  };

  const handleAbrirEdicao = (cat) => {
    setIdEditando(cat.id); setNomeEditando(cat.nome); setNovaImagemEditando(null); 
  };

  const handleCancelarEdicao = () => {
    setIdEditando(null); setNomeEditando(''); setNovaImagemEditando(null);
  };

  // --- Função (D)ELETE ---
  const handleDeletarCategoria = (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar a categoria "${nome}"?`)) return;

    apiFetch(`categorias/${id}`, { method: 'DELETE' })
    .then(() => { recarregarCategorias(); alert('Deletado com sucesso!'); })
    .catch(e => alert(e.message));
  };

  // --- O HTML (Visual) ---
  return (
    <div className="admin-painel">
      <h2>Gerenciar Categorias</h2>
      
      {/* Formulário Novo (Lado a Lado) */}
      <form onSubmit={handleCriarCategoria} className="admin-form">
        <h3>Adicionar Nova Categoria</h3>
        
        <label>Nome:</label>
        <input 
          type="text" 
          placeholder="Nome da categoria" 
          value={novoNome} 
          onChange={e => setNovoNome(e.target.value)}
        />
        
        <label>Imagem da Capa:</label>
        <input 
          type="file" 
          accept="image/*"
          onChange={e => setNovaImagem(e.target.files[0])}
          key={novaImagem ? 'img-ok' : 'img-no'}
        />

        <button type="submit" className="btn-salvar">Salvar Categoria</button>
      </form>

      <hr />

      <h3>Categorias Existentes</h3>
      <ul>
        {categorias.map(cat => (
          <li key={cat.id}>
            {idEditando === cat.id ? (
              // MODO EDIÇÃO
              <form onSubmit={(e) => handleSalvarEdicao(e, cat.id)} className="admin-form-editar-categoria">
                <input 
                  type="text" 
                  value={nomeEditando} 
                  onChange={e => setNomeEditando(e.target.value)} 
                  className="input-editar-nome"
                />
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setNovaImagemEditando(e.target.files[0])} 
                  className="input-editar-imagem"
                />
                <button type="submit" className="btn-salvar">Salvar</button>
                <button type="button" className="btn-cancelar" onClick={handleCancelarEdicao}>Cancelar</button>
              </form>
            ) : (
              // MODO VISUALIZAÇÃO
              <>
                <div style={{display:'flex', alignItems:'center'}}>
                   {cat.nome_imagem_capa ? (
                     // CORREÇÃO: Usa BACKEND_URL
                     <img 
                       src={`${BACKEND_URL}/images/${cat.nome_imagem_capa}`} 
                       alt={cat.nome} 
                       className="admin-capa-thumbnail"
                     />
                   ) : (
                     <div className="admin-capa-thumbnail placeholder">?</div>
                   )}
                   <span>{cat.nome}</span>
                </div>
                <div className="admin-botoes">
                  <button className="btn-editar" onClick={() => handleAbrirEdicao(cat)}>Editar</button>
                  <button className="btn-deletar" onClick={() => handleDeletarCategoria(cat.id, cat.nome)}>Deletar</button>
                </div>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminCategorias;