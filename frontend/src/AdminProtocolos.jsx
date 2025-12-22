// src/AdminProtocolos.jsx
// VERSÃO 2.0: Com Correção de Imagens e Capa Padrão

import { useState, useEffect } from 'react';
import { useApiService } from './services/apiService';

// --- CONFIGURAÇÃO DO ENDEREÇO DAS IMAGENS ---
// Se estiver no servidor, use 'http://localhost:3001'
// Se precisar acessar de outros PCs, use 'http://192.168.0.201:3001'
// Mude de localhost para o IP
const API_URL = 'http://192.168.0.201:3001'; 

function AdminProtocolos() {
  const [protocolos, setProtocolos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  
  // Formulário
  const [titulo, setTitulo] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [arquivosPdf, setArquivosPdf] = useState([]); 
  const [imagemCapa, setImagemCapa] = useState(null);
  
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

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!categoriaId || arquivosPdf.length === 0) {
      alert("Selecione a Categoria e os arquivos.");
      return;
    }

    const formData = new FormData();
    formData.append('categoria_id', categoriaId);

    // --- MODO ENVIO EM MASSA ---
    if (arquivosPdf.length > 1) {
        arquivosPdf.forEach(file => {
            formData.append('arquivos_pdf', file);
        });
        try {
            await http.postMultiPart('protocolos/massa', formData); // Rota corrigida
            alert("Envio em massa concluído!");
            limparFormulario();
            carregarTudo();
        } catch (error) {
            console.error(error);
            alert("Erro no envio em massa. Verifique o console.");
        }
    } 
    // --- MODO INDIVIDUAL ---
    else {
        formData.append('arquivo_pdf', arquivosPdf[0]); // Nome corrigido para casar com backend
        const tituloFinal = titulo || arquivosPdf[0].name.replace('.pdf','');
        formData.append('titulo', tituloFinal);
        if (imagemCapa) {
            formData.append('imagem_capa', imagemCapa);
        }

        try {
            await http.postMultiPart('protocolos', formData);
            alert("Salvo com sucesso!");
            limparFormulario();
            carregarTudo();
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar. Verifique se o backend está ligado.");
        }
    }
  };

  const handleDelete = (id) => {
    if (window.confirm("Excluir este protocolo?")) {
      // CORREÇÃO AQUI: mudamos de .del para .delete
      http.delete(`protocolos/${id}`) 
          .then(() => {
              alert("Excluído com sucesso!"); // Adicionei um aviso visual
              carregarTudo();
          })
          .catch(err => alert("Erro ao excluir."));
    }
  };

  const limparFormulario = () => {
      setTitulo('');
      setArquivosPdf([]);
      setImagemCapa(null);
      document.getElementById('input-pdf').value = "";
      // document.getElementById('input-capa').value = ""; // Pode dar erro se não existir, removi
  };

  // --- FUNÇÃO PARA GERAR URL DA IMAGEM ---
  const getImageUrl = (caminho) => {
      if (caminho && caminho !== '' && caminho !== 'null') {
          return `${API_URL}/images/${caminho}`;
      }
      // SE NÃO TIVER CAPA, USA A GENÉRICA QUE VI NA TUA PASTA
      return `${API_URL}/images/capa_generica_protocolo.png`;
  };

  return (
    <div className="admin-painel">
      <h2>Gerenciar Protocolos (v2.0)</h2>

      <form className="admin-form-protocolo" onSubmit={handleSalvar}>
        <h3>Adicionar</h3>
        
        <label>Categoria:</label>
        <select value={categoriaId} onChange={e => setCategoriaId(e.target.value)} required>
          <option value="">Selecione...</option>
          {categorias.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
        </select>

        <label>Arquivos PDF (Max 5):</label>
        <input type="file" accept="application/pdf" multiple onChange={handleFileChange} id="input-pdf" required />
        
        {arquivosPdf.length === 1 && (
            <>
                <label>Título (Opcional):</label>
                <input type="text" value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Automático se vazio" />
                <label>Capa (Opcional):</label>
                <input type="file" accept="image/*" onChange={e => setImagemCapa(e.target.files[0])} />
            </>
        )}

        {arquivosPdf.length > 1 && (
            <div style={{padding:10, background:'#e0f2fe', color:'#0284c7', borderRadius:4, margin:'10px 0'}}>
                <strong>Modo Massa:</strong> {arquivosPdf.length} arquivos selecionados. Capa padrão será usada.
            </div>
        )}

        <button type="submit" className="btn-salvar">
            {arquivosPdf.length > 1 ? 'Enviar Todos' : 'Salvar Protocolo'}
        </button>
      </form>

      <h3>Lista de Protocolos</h3>
      <ul>
        {protocolos.map(p => (
          <li key={p.id}>
            <div style={{display:'flex', alignItems:'center'}}>
                {/* AQUI ESTÁ A CORREÇÃO DA IMAGEM */}
                <img 
                    src={getImageUrl(p.caminho_imagem_capa)} 
                    className="admin-capa-thumbnail" 
                    onError={(e) => {e.target.src = `${API_URL}/images/capa_generica_protocolo.png`}} // Fallback extra
                    alt="Capa"
                    style={{width:40, height:50, objectFit:'cover', marginRight:10, border:'1px solid #ddd'}}
                />
                
                <div>
                    <strong>{p.titulo}</strong> <br/>
                    <small style={{color:'#666'}}>{p.nome_categoria}</small>
                </div>
            </div>
            <button type="button" className="btn-deletar" onClick={() => handleDelete(p.id)}>X</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default AdminProtocolos;