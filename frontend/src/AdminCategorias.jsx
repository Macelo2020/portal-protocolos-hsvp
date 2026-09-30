// src/AdminCategorias.jsx
// ==================================================================
// MÓDULO: Gerenciamento Administrativo de Categorias
// ARQUITETURA: React Hooks (useState) + Exclusão Inteligente + Edição de Capa
// ==================================================================

import { useState, useRef } from 'react';
import { useApiService, IMAGES_URL } from './services/apiService';

function AdminCategorias({ categorias, recarregarCategorias }) {
  const { apiFetch } = useApiService();

  // Estados locais para criação de nova categoria
  const [novoNome, setNovoNome] = useState('');
  const [novaImagem, setNovaImagem] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const inputArquivoRef = useRef(null);

  // Estados locais para controle de edição em linha
  const [idEditando, setIdEditando] = useState(null); 
  const [nomeEditando, setNomeEditando] = useState('');
  const [novaImagemEditando, setNovaImagemEditando] = useState(null);

  // =========================================================
  // CRIAÇÃO DE NOVA CATEGORIA (POST)
  // =========================================================
  const handleCriarCategoria = async (evento) => {
    evento.preventDefault(); 
    
    if (!novoNome.trim()) {
      return alert('Por favor, informe o nome da categoria.');
    }

    try {
      setCarregando(true);
      const formData = new FormData();
      formData.append('nome', novoNome.trim());
      if (novaImagem) {
        formData.append('imagem', novaImagem);
      }

      await apiFetch('categorias', { method: 'POST', body: formData }, true);

      setNovoNome('');
      setNovaImagem(null);
      if (inputArquivoRef.current) {
        inputArquivoRef.current.value = '';
      }

      if (typeof recarregarCategorias === 'function') {
        await recarregarCategorias();
      }

      alert('Categoria criada com sucesso!');
    } catch (error) {
      console.error('Falha ao criar categoria:', error);
      alert(`Erro: ${error.message || 'Falha ao salvar a categoria.'}`);
    } finally {
      setCarregando(false);
    }
  };

  // =========================================================
  // EDIÇÃO DE CATEGORIA (PUT - Nome + Capa Opcional)
  // =========================================================
  const handleSalvarEdicao = async (evento, idDaCategoria) => {
    evento.preventDefault(); 
    
    if (!nomeEditando.trim()) {
      return alert('O nome da categoria não pode ficar vazio.');
    }

    try {
      const formData = new FormData();
      formData.append('nome', nomeEditando.trim()); 
      
      // Anexa a nova imagem de capa caso o administrador tenha selecionado uma
      if (novaImagemEditando) {
        formData.append('imagem', novaImagemEditando);
      }
      
      await apiFetch(`categorias/${idDaCategoria}`, { method: 'PUT', body: formData });
      
      setIdEditando(null); 
      setNomeEditando(''); 
      setNovaImagemEditando(null); 
      
      if (typeof recarregarCategorias === 'function') {
        await recarregarCategorias();
      }
      
      alert('Categoria atualizada com sucesso!');
    } catch (error) {
      console.error('Falha ao atualizar categoria:', error);
      alert(`Erro: ${error.message || 'Falha ao atualizar.'}`);
    }
  };

  const handleAbrirEdicao = (cat) => {
    setIdEditando(cat.id); 
    setNomeEditando(cat.nome); 
    setNovaImagemEditando(null); 
  };

  const handleCancelarEdicao = () => {
    setIdEditando(null); 
    setNomeEditando(''); 
    setNovaImagemEditando(null);
  };

  // =========================================================
  // EXCLUSÃO INTELIGENTE DE CATEGORIA (DELETE)
  // =========================================================
  const handleDeletarCategoria = async (id, nome) => {
    if (!window.confirm(`Tem certeza que deseja deletar a categoria "${nome}"?`)) return;

    try {
      await apiFetch(`categorias/${id}`, { method: 'DELETE' });
      
      if (typeof recarregarCategorias === 'function') {
        await recarregarCategorias();
      }
      
      alert('Categoria deletada com sucesso!');
    } catch (error) {
      if (error.message && error.message.includes('protocolo(s) vinculado(s)')) {
        const confirmarMassa = window.confirm(
          `${error.message}\n\nDeseja apagar esta categoria e TODOS os protocolos contidos nela de uma só vez?`
        );

        if (confirmarMassa) {
          try {
            await apiFetch(`categorias/${id}?forcar=true`, { method: 'DELETE' });
            
            if (typeof recarregarCategorias === 'function') {
              await recarregarCategorias();
            }
            
            alert('Categoria e todos os seus protocolos foram excluídos com sucesso!');
          } catch (errMassa) {
            console.error('Falha na exclusão em massa:', errMassa);
            alert(`Erro na exclusão em massa: ${errMassa.message}`);
          }
        }
      } else {
        console.error('Falha ao deletar categoria:', error);
        alert(`Erro: ${error.message || 'Falha ao deletar.'}`);
      }
    }
  };

  return (
    <div className="admin-painel">
      <h2>Gerenciar Categorias</h2>
      
      {/* Formulário de Inclusão */}
      <form onSubmit={handleCriarCategoria} className="admin-form">
        <h3>Adicionar Nova Categoria</h3>
        
        <label>Nome:</label>
        <input 
          type="text" 
          placeholder="Ex: NIR - Núcleo Interno de Regulação" 
          value={novoNome} 
          onChange={e => setNovoNome(e.target.value)}
          disabled={carregando}
        />
        
        <label>Imagem da Capa:</label>
        <input 
          ref={inputArquivoRef}
          type="file" 
          accept="image/*"
          onChange={e => setNovaImagem(e.target.files[0])}
          disabled={carregando}
        />

        <button type="submit" className="btn-salvar" disabled={carregando}>
          {carregando ? 'Salvando...' : 'Salvar Categoria'}
        </button>
      </form>

      <hr />

      {/* Listagem com Opções de Edição/Exclusão */}
      <h3>Categorias Existentes</h3>
      <ul>
        {categorias.map(cat => (
          <li key={cat.id}>
            {idEditando === cat.id ? (
              <form onSubmit={(e) => handleSalvarEdicao(e, cat.id)} className="admin-form-editar-categoria">
                <input 
                  type="text" 
                  value={nomeEditando} 
                  onChange={e => setNomeEditando(e.target.value)} 
                  className="input-editar-nome"
                />
                {/* Correção aplicada aqui: Chamada correta para setNovaImagemEditando */}
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
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                   {cat.nome_imagem_capa ? (
                     <img 
                       src={`${IMAGES_URL}/${cat.nome_imagem_capa}`} 
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