// src/paginas/PaginaHome.jsx
// VERSÃO 3.0 FINAL: Original Restaurado + Correção de Imagens e Localhost

import { useState, useEffect } from 'react'; 
import { useAuth } from '../contexto/AuthContext'; 
import { useApiService } from '../services/apiService'; 
import BotaoFavoritar from '../components/BotaoFavoritar'; 
import '../App.css'; 

function PaginaHome() {
  
  // [CORREÇÃO] Usamos localhost para garantir que as imagens carreguem no servidor
  // Mude de localhost para o IP
const BACKEND_URL = 'http://192.168.0.201:3001';

  const [categorias, setCategorias] = useState([]);
  const [protocolos, setProtocolos] = useState([]); 
  const [todosProtocolos, setTodosProtocolos] = useState([]); // Lista Mestra para filtro rápido
  
  const [favoritosDoUsuario, setFavoritosDoUsuario] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [termoDeBusca, setTermoDeBusca] = useState(''); 
  const [termoBuscaCategoria, setTermoBuscaCategoria] = useState('');

  const { usuario } = useAuth();
  const { http, favoritos } = useApiService(); 

  // --- 1. CARREGAR DADOS ---
  useEffect(() => {
    http.getPublic('categorias')
        .then(d => setCategorias(d))
        .catch(e => console.error("Erro categorias:", e));

    http.getPublic('protocolos')
        .then(d => {
            setProtocolos(d);       
            setTodosProtocolos(d);  
        })
        .catch(e => console.error("Erro protocolos:", e));
  }, []); 

  // --- 2. CARREGAR FAVORITOS ---
  useEffect(() => {
    if (usuario) {
        favoritos.listarMeus()
            .then(dados => setFavoritosDoUsuario(dados))
            .catch(e => console.error("Erro favoritos:", e));
    } else {
        setFavoritosDoUsuario([]);
    }
  }, [usuario]); 

  // --- FUNÇÕES AUXILIARES ---
  
  // [NOVO] Função Inteligente de Imagem
  const getImageUrl = (caminho) => {
    if (caminho && caminho !== '' && caminho !== 'null') {
        return `${BACKEND_URL}/images/${caminho}`;
    }
    // Se for envio em massa (sem capa), usa a genérica
    return `${BACKEND_URL}/images/capa_generica_protocolo.png`;
  };

  const handleToggleFavoriteLocal = (protocoloId) => {
    if (favoritosDoUsuario.some(fav => fav.protocolo_id === protocoloId)) {
        setFavoritosDoUsuario(prev => prev.filter(fav => fav.protocolo_id !== protocoloId));
    } else {
        setFavoritosDoUsuario(prev => [...prev, { protocolo_id: protocoloId, id: Date.now(), usuario_id: usuario?.id }]);
    }
  };

  const buscarProtocolosPorCategoria = (idDaCategoria, nomeDaCategoria) => {
    setCategoriaSelecionada(nomeDaCategoria);
    if (idDaCategoria) {
        const filtrados = todosProtocolos.filter(p => p.categoria_id === idDaCategoria);
        setProtocolos(filtrados);
    } else {
        setProtocolos(todosProtocolos);
    }
  };

  const buscarTodosProtocolos = () => {
    setCategoriaSelecionada(null);
    setProtocolos(todosProtocolos); 
  };

  // --- FILTROS VISUAIS ---
  const protocolosFiltrados = () => {
      return (protocolos || []).filter(p => p.titulo.toLowerCase().includes(termoDeBusca.toLowerCase()));
  };
  
  const categoriasFiltradas = (categorias || []).filter(c => c.nome.toLowerCase().includes(termoBuscaCategoria.toLowerCase()));

  return (
    <main className="layout-principal">
        
        {/* --- LADO ESQUERDO: CATEGORIAS E DASHBOARD --- */}
        <aside className="painel-lateral">
            
            {/* CABEÇALHO DA LATERAL COM DASHBOARD */}
            <div className="header-lateral-dashboard">
                <div className="grupo-titulo-cat">
                    <h3>Categorias</h3>
                    <span className="badge-bolinha-azul">{categorias.length}</span>
                </div>

                <div className="grupo-total-geral">
                    <span className="label-total">Total</span>
                    <span className="badge-retangulo-azul">{todosProtocolos.length}</span>
                </div>
            </div>
            
            <input 
              type="text" 
              placeholder="Buscar categoria..." 
              className="barra-busca-pequena"
              value={termoBuscaCategoria}
              onChange={e => setTermoBuscaCategoria(e.target.value)}
              style={{marginBottom: '20px'}}
            />

            <div className="grid-categorias-lateral">
                {categoriasFiltradas.map(cat => {
                    const qtd = todosProtocolos.filter(p => p.categoria_id === cat.id).length;
                    return (
                        <div 
                            key={cat.id} 
                            className="card-2d-container"
                            onClick={() => buscarProtocolosPorCategoria(cat.id, cat.nome)}
                            role="button"
                        >
                            <div className="capa-wrapper-categoria" style={{ height: '120px' }}> 
                              {/* [CORREÇÃO] Imagem da Categoria também usa o localhost */}
                              {cat.nome_imagem_capa ? (
                                  <img src={`${BACKEND_URL}/images/${cat.nome_imagem_capa}`} alt={cat.nome} className="imagem-capa-2d" />
                              ) : (
                                  <div className="placeholder-capa-categoria">{cat.nome.charAt(0)}</div>
                              )}
                            </div>
                            <p className="legenda-2d" style={{fontSize: '12px', marginBottom: '2px'}}>{cat.nome}</p>
                            <span className="contador-categoria">
                                {qtd} {qtd === 1 ? 'item' : 'itens'}
                            </span>
                        </div>
                    );
                })}
            </div>
        </aside>

        {/* --- LADO DIREITO: PROTOCOLOS --- */}
        <section className="painel-principal">
            <div style={{marginBottom: '20px'}}>
                <h2 className="titulo-secao" style={{marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px'}}>
                    {categoriaSelecionada ? `Protocolos de: ${categoriaSelecionada}` : 'Todos os Protocolos'}
                </h2>
                
                <input 
                  type="text" 
                  placeholder={categoriaSelecionada ? `Buscar em ${categoriaSelecionada}...` : "Buscar protocolo..."}
                  value={termoDeBusca}
                  onChange={e => setTermoDeBusca(e.target.value)}
                  className="barra-busca"
                />
            </div>
            
            {categoriaSelecionada && (
                <button className="btn-mostrar-todos" onClick={buscarTodosProtocolos} style={{marginBottom: 15, padding: '8px 15px', cursor: 'pointer'}}>
                    ← Voltar para Todos
                </button>
            )}

            <div className="grid-container-protocolos">
                {protocolosFiltrados().map(protocolo => {
                    const isFavoritado = favoritosDoUsuario.some(fav => fav.protocolo_id === protocolo.id);
                    return (
                      <div key={protocolo.id} style={{position:'relative'}}>
                        <a 
                          href={`${BACKEND_URL}/pdfs/${protocolo.nome_arquivo_pdf}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="card-2d-link"
                        >
                          <div className="card-2d-container">
                            
                            {/* [CORREÇÃO] IMAGEM DO PROTOCOLO COM CAPA PADRÃO */}
                            <div className="capa-wrapper-protocolo">
                                <img 
                                    src={getImageUrl(protocolo.caminho_imagem_capa)} 
                                    alt={protocolo.titulo} 
                                    className="imagem-capa-2d"
                                    onError={(e) => {e.target.src = `${BACKEND_URL}/images/capa_generica_protocolo.png`}}
                                />
                            </div> 
                            
                            <p className="legenda-2d">{protocolo.titulo}</p>
                          </div>
                        </a>
                        
                        {/* BOTÃO DE FAVORITAR MANTIDO */}
                        <div style={{position:'absolute', top: 5, right: 15, zIndex: 10}}>
                            <BotaoFavoritar
                                protocoloId={protocolo.id}
                                isFavoritado={isFavoritado}
                                onToggleFavorite={handleToggleFavoriteLocal}
                            />
                        </div>
                      </div>
                    );
                })}
            </div>
        </section>

    </main>
  );
}

export default PaginaHome;