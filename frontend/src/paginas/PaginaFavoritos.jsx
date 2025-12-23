// src/paginas/PaginaFavoritos.jsx
// VERSÃO 4.1: IP Fixo Removido

import { useState, useEffect } from 'react';
import { useAuth } from '../contexto/AuthContext';
// 1. IMPORTAMOS AS CONSTANTES
import { useApiService, IMAGES_URL, PDFS_URL } from '../services/apiService'; 
import { useNavigate } from 'react-router-dom';
import '../App.css';

function PaginaFavoritos() {
    
    // 2. REMOVIDO: const BACKEND_URL = ...

    const { usuario } = useAuth();
    const navigate = useNavigate();
    const { favoritos } = useApiService(); 
    
    const [favoritosLista, setFavoritosLista] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [erro, setErro] = useState(null);

    useEffect(() => {
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

    }, [usuario]); 

    // 3. FUNÇÃO ATUALIZADA
    const getImageUrl = (caminho) => {
        if (caminho && caminho !== '' && caminho !== 'null') {
            return `${IMAGES_URL}/${caminho}`;
        }
        return `${IMAGES_URL}/capa_generica_protocolo.png`;
    };

    const handleRemoverFavorito = async (e, protocoloId, titulo) => {
        e.preventDefault(); e.stopPropagation();
        
        if (!window.confirm(`Remover "${titulo}" dos favoritos?`)) return;

        try {
            await favoritos.remover(protocoloId);
            setFavoritosLista(prevLista => prevLista.filter(item => item.id !== protocoloId));
        } catch (error) {
            alert(`Erro ao remover: ${error.message}`);
        }
    };
    
    if (isLoading) return <div className="conteudo-pagina" style={{padding:30, textAlign:'center'}}>Carregando favoritos...</div>;
    if (erro) return <div className="conteudo-pagina" style={{padding:30, color:'red'}}>{erro}</div>;
    if (!usuario) return <div className="conteudo-pagina" style={{padding:30}}>Faça login para ver seus favoritos.</div>;

    if (favoritosLista.length === 0) {
        return (
            <div className="conteudo-pagina" style={{padding:30, textAlign:'center'}}>
                <h2>Meus Favoritos ⭐</h2>
                <p style={{color:'#666', marginTop:20}}>Você ainda não favoritou nenhum protocolo.</p>
                <p>Vá para a página inicial e clique no coração ❤️ nos protocolos que mais usa.</p>
            </div>
        );
    }

    return (
        <div className="conteudo-pagina" style={{padding: '20px 30px'}}>
            <h2 style={{marginTop:0, marginBottom:25}}>Meus Favoritos ⭐</h2>
            
            <div className="grid-container-protocolos">
                {favoritosLista.map((protocolo) => (
                  <div key={protocolo.favorito_id ? `fav-${protocolo.favorito_id}` : `proto-${protocolo.id}`} style={{position:'relative'}}>
                    {/* 4. USO DE PDFS_URL */}
                    <a 
                      href={`${PDFS_URL}/${protocolo.nome_arquivo_pdf}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="card-2d-link"
                    >
                      <div className="card-2d-container">
                          
                          <div className="capa-wrapper-protocolo">
                              {/* 5. USO DE IMAGES_URL (via getImageUrl e onError) */}
                              <img 
                                src={getImageUrl(protocolo.caminho_imagem_capa)} 
                                alt={protocolo.titulo} 
                                className="imagem-capa-2d" 
                                onError={(e) => {e.target.src = `${IMAGES_URL}/capa_generica_protocolo.png`}}
                              />
                          </div> 
                          
                          <p className="legenda-2d">{protocolo.titulo}</p>
                      </div>
                    </a>
                    
                    <button 
                        className="btn-remover-favorito"
                        title="Remover dos favoritos"
                        onClick={(e) => handleRemoverFavorito(e, protocolo.id, protocolo.titulo)}
                    >
                        ✕
                    </button>
                  </div>
                ))}
            </div>
        </div>
    );
}

export default PaginaFavoritos;