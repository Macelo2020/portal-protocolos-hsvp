// src/paginas/PaginaHome.jsx
// VERSÃO FINAL ESTÁVEL: Sem Loop Infinito e com Layout Correto.

import { useState, useEffect } from 'react'; // Removemos useCallback para simplificar
import { useAuth } from '../contexto/AuthContext'; 
import { useApiService } from '../services/apiService'; 
import BotaoFavoritar from '../components/BotaoFavoritar'; 
import '../App.css'; 

function PaginaHome() {
  
  const BACKEND_URL = 'http://192.168.0.201:3001';

  const [categorias, setCategorias] = useState([]);
  const [protocolos, setProtocolos] = useState([]); 
  const [favoritosDoUsuario, setFavoritosDoUsuario] = useState([]);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(null);
  const [termoDeBusca, setTermoDeBusca] = useState(''); 
  const [termoBuscaCategoria, setTermoBuscaCategoria] = useState('');

  const { usuario } = useAuth();
  const { http, favoritos } = useApiService(); 

  // --- 1. CARREGAR CATEGORIAS E PROTOCOLOS (Executa apenas 1 vez) ---
  useEffect(() => {
    // Carrega Categorias
    http.getPublic('categorias')
        .then(d => setCategorias(d))
        .catch(e => console.error("Erro categorias:", e));

    // Carrega Protocolos
    http.getPublic('protocolos')
        .then(d => setProtocolos(d))
        .catch(e => console.error("Erro protocolos:", e));
  }, []); // Array vazio = roda só no início


  // --- 2. CARREGAR FAVORITOS (Executa quando o usuário muda) ---
  useEffect(() => {
    if (usuario) {
        favoritos.listarMeus()
            .then(dados => setFavoritosDoUsuario(dados))
            .catch(e => console.error("Erro favoritos:", e));
    } else {
        setFavoritosDoUsuario([]);
    }
    // IMPORTANTE: Removemos 'favoritos' das dependências para evitar o loop
  }, [usuario]); 


  // --- FUNÇÕES DE INTERAÇÃO ---
  const handleToggleFavoriteLocal = (protocoloId) => {
    if (favoritosDoUsuario.some(fav => fav.protocolo_id === protocoloId)) {
        setFavoritosDoUsuario(prev => prev.filter(fav => fav.protocolo_id !== protocoloId));
    } else {
        setFavoritosDoUsuario(prev => [...prev, { protocolo_id: protocoloId, id: Date.now(), usuario_id: usuario?.id }]);
    }
  };

  const buscarProtocolosPorCategoria = (idDaCategoria, nomeDaCategoria) => {
    setCategoriaSelecionada(nomeDaCategoria);
    // Filtramos localmente se já temos todos os protocolos, ou buscamos de novo
    // Para simplificar e garantir, buscamos de novo filtrado:
    http.getPublic('protocolos').then(dados => {
        const filtrados = idDaCategoria ? dados.filter(p => p.categoria_id === idDaCategoria) : dados;
        setProtocolos(filtrados);
    });
  };

  const buscarTodosProtocolos = () => {
    setCategoriaSelecionada(null);
    http.getPublic('protocolos').then(d => setProtocolos(d));
  };


  // --- FILTROS VISUAIS ---
  const protocolosFiltrados = protocols => {
      // Pequena proteção caso protocolos seja null
      return (protocolos || []).filter(p => p.titulo.toLowerCase().includes(termoDeBusca.toLowerCase()));
  };
  
  const categoriasFiltradas = (categorias || []).filter(c => c.nome.toLowerCase().includes(termoBuscaCategoria.toLowerCase()));


  return (
    <main className="layout-principal">
        
        {/* --- LADO ESQUERDO: CATEGORIAS --- */}
        <aside className="painel-lateral">
            <h3 style={{marginTop: 0}}>Categorias</h3>
            
            <input 
              type="text" 
              placeholder="Buscar categoria..." 
              className="barra-busca-pequena"
              value={termoBuscaCategoria}
              onChange={e => setTermoBuscaCategoria(e.target.value)}
              style={{marginBottom: '20px'}}
            />

            <div className="grid-categorias-lateral">
                {categoriasFiltradas.map(cat => (
                    <div 
                        key={cat.id} 
                        className="card-2d-container"
                        onClick={() => buscarProtocolosPorCategoria(cat.id, cat.nome)}
                        role="button"
                    >
                        <div className="capa-wrapper-categoria" style={{ height: '120px' }}> 
                          {cat.nome_imagem_capa ? (
                              <img src={`${BACKEND_URL}/images/${cat.nome_imagem_capa}`} alt={cat.nome} className="imagem-capa-2d" />
                          ) : (
                              <div className="placeholder-capa-categoria">{cat.nome.charAt(0)}</div>
                          )}
                        </div>
                        <p className="legenda-2d" style={{fontSize: '12px'}}>{cat.nome}</p>
                    </div>
                ))}
            </div>
        </aside>

        {/* --- LADO DIREITO: PROTOCOLOS --- */}
        <section className="painel-principal">
            <div style={{marginBottom: '20px'}}>
                <h2 className="titulo-secao" style={{marginTop: 0}}>
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
                <button className="btn-mostrar-todos" onClick={buscarTodosProtocolos} style={{marginBottom: 15}}>
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
                            <div className="capa-wrapper-protocolo">
                                {protocolo.caminho_imagem_capa ? (
                                  <img src={`${BACKEND_URL}/images/${protocolo.caminho_imagem_capa}`} alt={protocolo.titulo} className="imagem-capa-2d" />
                                ) : (
                                  <div className="placeholder-capa-protocolo"></div> 
                                )}
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