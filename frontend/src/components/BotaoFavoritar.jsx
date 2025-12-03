// src/components/BotaoFavoritar.jsx
// Gerencia a ação de favoritar (coração) em cada protocolo.

import { useState } from 'react';
import { useAuth } from '../contexto/AuthContext';
import { useApiService } from '../services/apiService';

/**
 * @param {number} protocoloId - O ID do protocolo a ser favoritado/desfavoritado.
 * @param {boolean} isFavoritado - O estado atual do protocolo (true se já for favorito).
 * @param {function} onToggleFavorite - Callback para atualizar a lista no componente pai.
 */
function BotaoFavoritar({ protocoloId, isFavoritado, onToggleFavorite }) {
  
  // Verifica se o usuário está logado (para habilitar o botão)
  const { usuario } = useAuth(); 
  
  // Obtém as funções de favoritos que já injetam o token
  const { favoritos } = useApiService(); 
  
  const [loading, setLoading] = useState(false);
  
  // Se o usuário não estiver logado, mostra o botão desabilitado
  if (!usuario) {
    return (
      <button className="btn-favoritar" disabled title="Faça login para favoritar">
        🤍
      </button>
    );
  }

  // --- Função de Ação do Botão (Toggle) ---
  const handleToggleFavorito = async () => {
    setLoading(true);
    try {
      if (isFavoritado) {
        // Tenta REMOVER
        await favoritos.remover(protocoloId);
      } else {
        // Tenta ADICIONAR
        await favoritos.adicionar(protocoloId);
      }
      
      // Chama o callback para atualizar o estado no componente pai
      onToggleFavorite(protocoloId); 
      
    } catch (error) {
      console.error('Erro ao processar favorito:', error.message);
      // O apiService já tratou o erro de token, aqui apenas alertamos
      alert(`Erro ao favoritar: ${error.message}`); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggleFavorito} 
      className="btn-favoritar" 
      disabled={loading}
      title={isFavoritado ? "Remover dos Favoritos" : "Adicionar aos Favoritos"}
    >
      {loading ? '⏳' : isFavoritado ? '❤️' : '🤍'}
    </button>
  );
}

export default BotaoFavoritar;