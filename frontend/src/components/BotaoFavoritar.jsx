// src/components/BotaoFavoritar.jsx
// ==================================================================
// MÓDULO: Botão de Favoritar com Cores Dinâmicas por Contexto (UX/UI)
// ==================================================================

import { useState } from 'react';
import { useAuth } from '../contexto/AuthContext';
import { useApiService } from '../services/apiService';
import '../App.css';

/**
 * @param {number} protocoloId - O ID do protocolo a ser favoritado/desfavoritado.
 * @param {boolean} isFavoritado - O estado atual do protocolo (true se já for favorito).
 * @param {function} onToggleFavorite - Callback para atualizar a lista no componente pai.
 * @param {string} contexto - Define a origem ('home' para amarelo, 'favoritos' para vermelho).
 */
function BotaoFavoritar({ protocoloId, isFavoritado, onToggleFavorite, contexto = 'home' }) {
  
  const { usuario } = useAuth(); 
  const { favoritos } = useApiService(); 
  const [loading, setLoading] = useState(false);
  
  // Se o utilizador não estiver logado, mostra o botão desabilitado
  if (!usuario) {
    return (
      <button className="btn-favoritar" disabled title="Faça login para favoritar" style={{ opacity: 0.6, cursor: 'not-allowed' }}>
        🤍
      </button>
    );
  }

  // --- Função de Ação do Botão (Toggle) ---
  const handleToggleFavorito = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;

    setLoading(true);
    try {
      if (isFavoritado) {
        await favoritos.remover(protocoloId);
      } else {
        await favoritos.adicionar(protocoloId);
      }
      
      if (onToggleFavorite) {
        onToggleFavorite(protocoloId);
      }
      
    } catch (error) {
      console.error('Erro ao processar favorito:', error.message);
      alert(`Erro ao atualizar favoritos: ${error.message}`); 
    } finally {
      setLoading(false);
    }
  };

  // Define a cor de destaque com base no contexto solicitado
  // Home = Amarelo Dourado (#f59e0b) | Favoritos = Vermelho Intenso (#ef4444)
  const corAtiva = contexto === 'favoritos' ? '#ef4444' : '#f59e0b';
  const sombraAtiva = contexto === 'favoritos' ? '0 4px 12px rgba(239, 68, 68, 0.35)' : '0 4px 12px rgba(245, 158, 11, 0.35)';

  return (
    <button 
      type="button"
      onClick={handleToggleFavorito} 
      disabled={loading}
      title={isFavoritado ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
      style={{
        background: isFavoritado ? '#ffffff' : 'rgba(0, 0, 0, 0.4)',
        border: isFavoritado ? `2px solid ${corAtiva}` : '1px solid rgba(255, 255, 255, 0.3)',
        borderRadius: '50%',
        width: '38px',
        height: '38px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: isFavoritado ? sombraAtiva : 'none',
        transition: 'all 0.2s ease',
        outline: 'none'
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1, color: isFavoritado ? corAtiva : '#ffffff' }}>
        {loading ? '⏳' : isFavoritado ? (contexto === 'favoritos' ? '❤️' : '⭐') : '🤍'}
      </span>
    </button>
  );
}

export default BotaoFavoritar;