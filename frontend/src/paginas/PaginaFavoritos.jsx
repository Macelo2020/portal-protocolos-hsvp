// src/paginas/PaginaFavoritos.jsx
// ==================================================================
// MÓDULO: Gestão de Favoritos do Utilizador (Com Botão Contextual v3.6.0)
// ==================================================================

import { useState, useEffect } from 'react';
import { useAuth } from '../contexto/AuthContext';
import { useApiService, IMAGES_URL, PDFS_URL } from '../services/apiService'; 
import { useNavigate } from 'react-router-dom';
import BotaoFavoritar from '../components/BotaoFavoritar';
import '../App.css';

function PaginaFavoritos() {
    
    const { usuario } = useAuth();
    const navigate = useNavigate();
    const { favoritos } = useApiService(); 
    
    const [favoritosLista, setFavoritosLista] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [erro, setErro] = useState(null);

    const carregarFavoritos = () => {
        if (!usuario) { 
            setIsLoading(false); 
            return; 
        }

        setIsLoading(true);
        setErro(null);

        favoritos.listarMeus()
            .then(dados => {
                setFavoritosLista(dados);
                setIsLoading(false);
            })
            .catch(error => {
                console.error("Erro ao buscar favoritos:", error);
                setErro("Não foi possível carregar os favoritos.");
                setIsLoading(false);
            });
    };

    useEffect(() => {
        carregarFavoritos();
    }, [usuario]); 

    // Função de Fallback Inteligente para a Capa Padrão Global de Protocolos
    const getImageUrl = (caminho) => {
        if (caminho && caminho !== '' && caminho !== 'null') {
            return `${IMAGES_URL}/${caminho}`;
        }
        return `${IMAGES_URL}/default_protocolo.png`;
    };

    // Callback executado ao alterar o estado do favorito pelo botão
    const handleToggleFavoriteLocal = (protocoloId) => {
        // Remove da lista visualmente de imediato
        setFavoritosLista(prevLista => prevLista.filter(item => (item.protocolo_id || item.id) !== protocoloId));
    };
    
    if (isLoading) return <div className="conteudo-pagina" style={{padding:30, textAlign:'center'}}>Carregando favoritos...</div>;
    if (erro) return <div className="conteudo-pagina" style={{padding:30, color:'red'}}>{erro}</div>;
    if (!usuario) return <div className="conteudo-pagina" style={{padding:30}}>Faça login para ver seus favoritos.</div>;

    if (favoritosLista.length === 0) {
        return (
            <div className="conteudo-pagina" style={{padding:30, textAlign:'center'}}>
                <h2>Meus Favoritos ⭐</h2>
                <p style={{color:'#666', marginTop:20}}>Você ainda não favoritou nenhum protocolo.</p>
                <p>Vá para a página inicial e clique no coração nos protocolos que mais usa.</p>
            </div>
        );
    }

    return (
        <div className="conteudo-pagina" style={{padding: '20px 30px'}}>
            <h2 style={{marginTop:0, marginBottom:25}}>Meus Favoritos ⭐</h2>
            
            <div className="grid-container-protocolos">
                {favoritosLista.map((item) => {
                    const protocolo = item.Protocolo || item;
                    const protocoloId = protocolo.protocolo_id || protocolo.id;
                    
                    return (
                      <div key={item.favorito_id ? `fav-${item.favorito_id}` : `proto-${protocoloId}`} style={{position:'relative'}}>
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
                        
                        {/* Botão de Favorito com contexto 'favoritos' (Exibe em Vermelho ❤️) */}
                        <div style={{position:'absolute', top: 5, right: 15, zIndex: 10}}>
    <BotaoFavoritar
        protocoloId={protocoloId}
        isFavoritado={true}
        onToggleFavorite={() => handleToggleFavoriteLocal(protocoloId)}
        contexto="favoritos"
    />
</div>
                      </div>
                    );
                })}
            </div>
        </div>
    );
}

export default PaginaFavoritos;