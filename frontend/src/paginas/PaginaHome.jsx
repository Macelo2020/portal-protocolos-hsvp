// src/paginas/PaginaHome.jsx
// ==================================================================
// PROJETO: Portal de Protocolos HSVP (Frontend v13.6 - Capas Padrão Globais)
// ARQUITETURA: React Hooks + Fallback Dinâmico de Identidade Visual
// ==================================================================

import { useState, useEffect } from 'react'; 
import { useAuth } from '../contexto/AuthContext'; 
import { useApiService, IMAGES_URL, PDFS_URL } from '../services/apiService'; 
import BotaoFavoritar from '../components/BotaoFavoritar'; 
import '../App.css'; 

function PaginaHome() {
  
  const [categorias, setCategorias] = useState([]);
  const [protocolos, setProtocolos] = useState([]); 
  const [todosProtocolos, setTodosProtocolos] = useState([]); 
  
  const [favoritosDoUsuario, setFavoritosDoUsuario] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [termoDeBusca, setTermoDeBusca] = useState(''); 
  const [termoBuscaCategoria, setTermoBuscaCategoria] = useState('');

  const { usuario } = useAuth();
  const { http, favoritos } = useApiService(); 

  // --- 1. CARREGAR DADOS DA API ---
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

  // --- 2. CARREGAR FAVORITOS DO UTILIZADOR ---
  useEffect(() => {
    if (usuario) {
        favoritos.listarMeus()
            .then(dados => setFavoritosDoUsuario(dados))
            .catch(e => console.error("Erro favoritos:", e));
    } else {
        setFavoritosDoUsuario([]);
    }
  }, [usuario]); 

  // --- 3. FUNÇÕES AUXILIARES DE IMAGEM (FALLBACK GLOBAL) ---

  // Fallback para Capa de Protocolos
  const getImageUrl = (caminho) => {
    if (caminho && caminho !== '' && caminho !== 'null') {
        return `${IMAGES_URL}/${caminho}`;
    }
    // Assume a Capa Padrão Global de Protocolos
    return `${IMAGES_URL}/default_protocolo.png`;
  };

  // Fallback Inteligente para Capa de Categorias
  const getCategoriaImageUrl = (caminho) => {
    if (caminho && caminho !== '' && caminho !== 'null') {
        return `${IMAGES_URL}/${caminho}`;
    }
    // Assume a Capa Padrão Global de Categorias em vez da letra azul inicial!
    return `${IMAGES_URL}/default_categoria.png`;
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

  // --- 4. FILTROS VISUAIS DINÂMICOS ---
  const protocolosFiltrados = () => {
      return (protocolos || []).filter(p => p.titulo.toLowerCase().includes(termoDeBusca.toLowerCase()));
  };
  
  const categoriasFiltradas = (categorias || []).filter(c => c.nome.toLowerCase().includes(termoBuscaCategoria.toLowerCase()));

  return (
    <main className="layout-principal">
        
        {/* --- LADO ESQUERDO: CATEGORIAS E DASHBOARD --- */}
        <aside className="painel-lateral">
            
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
                            {/* EXIBIÇÃO DA CAPA DE CATEGORIA CORRIGIDA (SEM O QUADRADO AZUL COM LETRA) */}
                            <div className="capa-wrapper-categoria" style={{ height: '120px' }}> 
                                <img 
                                    src={getCategoriaImageUrl(cat.nome_imagem_capa)} 
                                    alt={cat.nome} 
                                    className="imagem-capa-2d" 
                                    onError={(e) => { e.target.src = `${IMAGES_URL}/default_categoria.png`; }}
                                />
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
            
            {/* --- BOTÃO VOLTAR (MODERNO) --- */}
            {categoriaSelecionada && (
                <button className="btn-voltar-todos" onClick={buscarTodosProtocolos}>
                    ← Voltar para Todos
                </button>
            )}

            <div className="grid-container-protocolos">
                {protocolosFiltrados().map(protocolo => {
                    const isFavoritado = favoritosDoUsuario.some(fav => fav.protocolo_id === protocolo.id);
                    return (
                      <div key={protocolo.id} style={{position:'relative'}}>
                        <a 
                          href={`${PDFS_URL}/${protocolo.nome_arquivo_pdf}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="card-2d-link"
                        >
                          <div className="card-2d-container">
                            
                            <div className="capa-wrapper-protocolo">
                                <img 
                                    src={getImageUrl(protocolo.caminho_imagem_capa)} 
                                    alt={protocolo.titulo} 
                                    className="imagem-capa-2d"
                                    onError={(e) => {e.target.src = `${IMAGES_URL}/default_protocolo.png`}}
                                />
                            </div> 
                            
                            <p className="legenda-2d">{protocolo.titulo}</p>
                          </div>
                        </a>
                        
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