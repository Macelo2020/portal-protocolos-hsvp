// src/paginas/PaginaFavoritos.jsx
// VERSÃO FINAL CORRIGIDA: Sem loop infinito e com layout seguro.

import { useState, useEffect } from 'react'; // Removemos useCallback
import { useAuth } from '../contexto/AuthContext';
import { useApiService } from '../services/apiService'; 
import { useNavigate } from 'react-router-dom';
import '../App.css';

function PaginaFavoritos() {
    
    const BACKEND_URL = 'http://192.168.0.201:3001';

    const { usuario } = useAuth();
    const navigate = useNavigate();
    // IMPORTANTE: Desestruturamos apenas o que precisamos para evitar recriações
    const { favoritos } = useApiService(); 
    
    const [favoritosLista, setFavoritosLista] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);
    const [erro, setErro] = useState(null); // Estado para mostrar erros na tela

    // --- EFEITO PARA CARREGAR DADOS (Executa só quando 'usuario' muda) ---
    useEffect(() => {
        // Se não tiver usuário, nem tenta buscar e manda pro login
        if (!usuario) { 
            setIsLoading(false); 
            // navigate('/login'); // Opcional: redirecionar ou só mostrar msg
            return; 
        }

        setIsLoading(true);
        setErro(null);

        // Chama a API
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

    // AQUI ESTÁ A CORREÇÃO: Dependência apenas do [usuario].
    // Removemos 'favoritos' e 'navigate' daqui para não causar loop.
    }, [usuario]); 


    // --- FUNÇÃO DE REMOVER ---
    const handleRemoverFavorito = async (e, protocoloId, titulo) => {
        e.preventDefault(); e.stopPropagation(); // Impede que o clique abra o PDF
        
        // Usamos um confirm nativo do navegador
        if (!window.confirm(`Remover "${titulo}" dos favoritos?`)) return;

        try {
            await favoritos.remover(protocoloId);
            // Atualiza a lista na tela removendo o item instantaneamente
            setFavoritosLista(prevLista => prevLista.filter(item => item.id !== protocoloId));
        } catch (error) {
            alert(`Erro ao remover: ${error.message}`);
        }
    };
    
    // --- RENDERIZAÇÃO CONDICIONAL (Telas de Carregamento/Erro/Vazio) ---
    if (isLoading) {
        return <div className="conteudo-pagina" style={{padding:30, textAlign:'center'}}>Loading...</div>;
    }

    if (erro) {
        return <div className="conteudo-pagina" style={{padding:30, color:'red'}}>{erro}</div>;
    }

    if (!usuario) {
         return <div className="conteudo-pagina" style={{padding:30}}>Faça login para ver seus favoritos.</div>;
    }

    if (favoritosLista.length === 0) {
        return (
            <div className="conteudo-pagina" style={{padding:30, textAlign:'center'}}>
                <h2>Meus Favoritos</h2>
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
                          <div className="capa-wrapper-protocolo">
                              {protocolo.caminho_imagem_capa ? (
                                <img 
                                  src={`${BACKEND_URL}/images/${protocolo.caminho_imagem_capa}`} 
                                  alt={protocolo.titulo} 
                                  className="imagem-capa-2d" 
                                />
                              ) : (
                                <div className="placeholder-capa-protocolo"></div> 
                              )}
                          </div> 
                          <p className="legenda-2d">{protocolo.titulo}</p>
                      </div>
                    </a>
                    
                    {/* Botão X Vermelho para remover */}
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