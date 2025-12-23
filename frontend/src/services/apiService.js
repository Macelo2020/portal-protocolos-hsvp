import { useAuth } from '../contexto/AuthContext'; 

// --- MÁGICA DE DETECÇÃO AUTOMÁTICA ---
// Se estivermos rodando localmente (Vite na porta 5173), usa o IP fixo para testes.
// Se estivermos em produção (Node servindo o site), usa o caminho relativo "/api".
const isDevelopment = window.location.hostname === 'localhost' || window.location.port === '5173';
const BASE_URL = isDevelopment ? 'http://192.168.0.201:3001' : ''; // Vazio = mesmo domínio

export const API_BASE_URL = `${BASE_URL}/api`;
export const IMAGES_URL = `${BASE_URL}/images`;
export const PDFS_URL = `${BASE_URL}/pdfs`;

export function useApiService() {
    const { token, logout } = useAuth(); 

    const apiFetch = async (endpoint, options = {}, isProtected = true) => {
        // Remove a barra inicial se houver, para evitar //api
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

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
            // Usa a constante inteligente criada acima
            const response = await fetch(`${API_BASE_URL}/${cleanEndpoint}`, finalOptions);

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({}));
                if (response.status === 403 || response.status === 401) {
                    logout();
                    throw new Error('Sessão expirada. Faça login novamente.');
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

    // Mantive suas funções originais
    const http = {
        get: (url) => apiFetch(url, { method: 'GET' }),
        post: (url, data) => apiFetch(url, { method: 'POST', body: data }),
        put: (url, data) => apiFetch(url, { method: 'PUT', body: data }),
        delete: (url) => apiFetch(url, { method: 'DELETE' }),
        getPublic: (url) => apiFetch(url, { method: 'GET' }, false),
        postMultiPart: (url, data) => apiFetch(url, { method: 'POST', body: data })
    };

    const favoritos = {
        adicionar: (protocolo_id) => http.post('favoritos', { protocolo_id }),
        remover: (protocolo_id) => http.delete(`favoritos/${protocolo_id}`),
        listarMeus: () => http.get('favoritos/meus'),
    };

    return { apiFetch, http, favoritos };
}