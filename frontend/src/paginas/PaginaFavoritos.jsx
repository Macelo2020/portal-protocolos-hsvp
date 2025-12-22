// src/paginas/PaginaFavoritos.jsx
// VERSÃO 4.0 (FINAL): Seu código original + Correção de Imagens e Localhost

import { useState, useEffect } from 'react';
import { useAuth } from '../contexto/AuthContext';
import { useApiService } from '../services/apiService'; 
import { useNavigate } from 'react-router-dom';
import '../App.css';

function PaginaFavoritos() {
    
    // [CORREÇÃO 1] Usamos localhost para garantir que as imagens carreguem
    // Mude de localhost para o IP
const BACKEND_URL = 'http://192.168.0.201:3001';

    const { usuario } = useAuth();
    const navigate = useNavigate();
    const { favoritos } = useApiService(); 
    
    const [favoritosLista, setFavoritosLista] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [erro, setErro] = useState(null);

    // --- EFEITO PARA CARREGAR DADOS ---
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

    // --- FUNÇÃO AUXILIAR DE IMAGEM (A Mágica) ---
    const getImageUrl = (caminho) => {
        if (caminho && caminho !== '' && caminho !== 'null') {
            return `${BACKEND_URL}/images/${caminho}`;
        }
        // Se não tiver capa, usa a genérica da pasta images
        return `${BACKEND_URL}/images/capa_generica_protocolo.png`;
    };

    // --- FUNÇÃO DE REMOVER ---
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
    
    // --- RENDERIZAÇÃO (Telas de Carregamento/Erro/Vazio) ---
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

    // --- TELA PRINCIPAL DOS FAVORITOS ---
    return (
        <div className="conteudo-pagina" style={{padding: '20px 30px'}}>
            <h2 style={{marginTop:0, marginBottom:25}}>Meus Favoritos ⭐</h2>
            
            <div className="grid-container-protocolos">
                {favoritosLista.map((protocolo) => (
                  <div key={protocolo.favorito_id ? `fav-${protocolo.favorito_id}` : `proto-${protocolo.id}`} style={{position:'relative'}}>
                    <a 
                      href={`${BACKEND_URL}/pdfs/${protocolo.nome_arquivo_pdf}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="card-2d-link"
                    >
                      <div className="card-2d-container">
                          
                          {/* [CORREÇÃO 2] Bloco de Imagem Inteligente */}
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
                    
                    {/* Botão X Vermelho (Mantido do seu código original) */}
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