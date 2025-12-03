// src/services/apiService.js
// VERSÃO ATUALIZADA: Com IP fixo e atalhos HTTP

import { useAuth } from '../contexto/AuthContext'; 

// [MUDANÇA CRÍTICA] Usamos o IP fixo da tua máquina.
// Isso garante que o telemóvel consiga chegar ao Backend.
const API_BASE_URL = 'http://192.168.0.201:3001/api'; 

export function useApiService() {
    const { token, logout } = useAuth(); 

    // Função genérica (mantida do teu código original)
    const apiFetch = async (endpoint, options = {}, isProtected = true) => {
        // Remove a barra inicial se houver, para evitar duplicação (ex: //api)
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

        if (isProtected && !token) {
            logout(); 
            throw new Error('Sessão não autenticada.');
        }

        const headers = {
            ...options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
            ...options.headers, 
        };

        if (isProtected && token) {
            headers['Authorization'] = `Bearer ${token}`; 
        }
        
        const finalOptions = {
            ...options,
            headers,
            body: options.body instanceof FormData ? options.body : (options.body ? JSON.stringify(options.body) : undefined)
        };

        try {
            const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, finalOptions);

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                if (response.status === 403 || response.status === 401) {
                    logout();
                    throw new Error(errorBody.error || 'Sessão expirada.');
                }
                throw new Error(errorBody.error || `Erro HTTP ${response.status}`);
            }

            // Verifica se há conteúdo para converter para JSON
            const text = await response.text();
            return text ? JSON.parse(text) : {}; 
        } catch (error) {
            console.error("Erro na requisição:", error);
            throw error;
        }
    };

    // [NOVO] Atalhos para facilitar o código nas páginas (Admin, Home, etc)
    const http = {
        get: (url) => apiFetch(url, { method: 'GET' }),
        post: (url, data) => apiFetch(url, { method: 'POST', body: data }),
        put: (url, data) => apiFetch(url, { method: 'PUT', body: data }),
        delete: (url) => apiFetch(url, { method: 'DELETE' }),
        // Atalho para rotas públicas (sem token)
        getPublic: (url) => apiFetch(url, { method: 'GET' }, false) 
    };

    // Mantemos os teus auxiliares específicos também
    const favoritos = {
        adicionar: (protocolo_id) => http.post('favoritos', { protocolo_id }),
        remover: (protocolo_id) => http.delete(`favoritos/${protocolo_id}`),
        listarMeus: () => http.get('favoritos/meus'),
    };

    return { apiFetch, http, favoritos };
}