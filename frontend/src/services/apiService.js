// src/services/apiService.js
// VERSÃO 1.9.1: Fusão do Antigo (Auth/Rotas) com Novo (Upload/Localhost)

// src/services/apiService.js
import { useAuth } from '../contexto/AuthContext'; 

// [CORREÇÃO] Usamos localhost para garantir que funciona no servidor
// Mude de localhost para o IP
const API_BASE_URL = 'http://192.168.0.201:3001/api'; 

export function useApiService() {
    // ... resto do código igual ...
    const { token, logout } = useAuth(); 

    // Função inteligente do teu arquivo antigo (detecta JSON vs FormData automaticamente)
    const apiFetch = async (endpoint, options = {}, isProtected = true) => {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

        if (isProtected && !token) {
            // Se precisar de login e não tiver, não faz nada (evita erros)
            // logout(); 
            // throw new Error('Sessão não autenticada.');
        }

        const headers = {
            // Se for arquivo (FormData), não define Content-Type (o navegador faz isso).
            // Se for texto normal, define JSON.
            ...options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' },
            ...options.headers, 
        };

        if (isProtected && token) {
            headers['Authorization'] = `Bearer ${token}`; 
        }
        
        const finalOptions = {
            ...options,
            headers,
            // Se for FormData passa direto, se não, converte pra JSON
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

            const text = await response.text();
            return text ? JSON.parse(text) : {}; 
        } catch (error) {
            console.error("Erro na requisição:", error);
            throw error;
        }
    };

    const http = {
        get: (url) => apiFetch(url, { method: 'GET' }),
        post: (url, data) => apiFetch(url, { method: 'POST', body: data }),
        put: (url, data) => apiFetch(url, { method: 'PUT', body: data }),
        delete: (url) => apiFetch(url, { method: 'DELETE' }),
        getPublic: (url) => apiFetch(url, { method: 'GET' }, false),
        
        // --- AQUI ESTÁ A MÁGICA PARA O ADMIN FUNCIONAR ---
        // Criamos o postMultiPart chamando a função original que já sabe lidar com FormData
        postMultiPart: (url, data) => apiFetch(url, { method: 'POST', body: data })
    };

    const favoritos = {
        adicionar: (protocolo_id) => http.post('favoritos', { protocolo_id }),
        remover: (protocolo_id) => http.delete(`favoritos/${protocolo_id}`),
        listarMeus: () => http.get('favoritos/meus'),
    };

    return { apiFetch, http, favoritos };
}