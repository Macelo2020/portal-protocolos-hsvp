import { useAuth } from '../contexto/AuthContext'; 

/* ==========================================================
   CONFIGURAÇÃO AUTOMÁTICA DE IP (Blue Frog Smart Solution)
   Versão: 3.1.2 (Auto-Detect)
   ========================================================== */

// Detecta o IP atual do navegador (localhost ou 192.168.x.x)
const HOST = window.location.hostname;
const PORT_BACKEND = '3001';

// Se estiver rodando pelo Vite (porta 5173), precisa apontar para a porta 3001.
// Se estiver em produção (porta 3001), usa caminho relativo vazio.
const isVite = window.location.port === '5173';
const BASE = isVite ? `http://${HOST}:${PORT_BACKEND}` : '';

export const IMAGES_URL = `${BASE}/images`;
export const PDFS_URL   = `${BASE}/pdfs`;

// --- ADICIONE ESTA LINHA AQUI ---
export const API_BASE_URL = `${BASE}/api`;

export function useApiService() {
    const { token, logout } = useAuth(); 

    const apiFetch = async (endpoint, options = {}, isProtected = true) => {
        // Garante que não tenha barra dupla //api
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
        const fullUrl = `${BASE}/api/${cleanEndpoint}`;

        const headers = {
            // Se for FormData (arquivo), não define Content-Type (o navegador faz sozinho)
            ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
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
            const response = await fetch(fullUrl, finalOptions);

            if (!response.ok) {
                // Tenta ler o erro em JSON, se falhar, retorna objeto vazio
                const errorBody = await response.json().catch(() => ({}));
                
                if (response.status === 403 || response.status === 401) {
                    // logout(); // Opcional: Descomente se quiser forçar logout ao expirar
                    throw new Error('Sessão expirada ou não autorizada.');
                }
                throw new Error(errorBody.error || `Erro HTTP ${response.status}`);
            }

            // Retorna JSON se houver conteúdo, senão retorna vazio
            const text = await response.text();
            return text ? JSON.parse(text) : {}; 
        } catch (error) {
            console.error("Erro na requisição:", error);
            throw error;
        }
    };

    // Atalhos HTTP (Shortcuts)
    const http = {
        get: (url) => apiFetch(url, { method: 'GET' }),
        post: (url, data) => apiFetch(url, { method: 'POST', body: data }),
        put: (url, data) => apiFetch(url, { method: 'PUT', body: data }),
        delete: (url) => apiFetch(url, { method: 'DELETE' }),
        getPublic: (url) => apiFetch(url, { method: 'GET' }, false),
        postMultiPart: (url, data) => apiFetch(url, { method: 'POST', body: data }) // Para Uploads
    };

    // Atalhos de Favoritos
    const favoritos = {
        adicionar: (protocolo_id) => http.post('favoritos', { protocolo_id }),
        remover: (protocolo_id) => http.delete(`favoritos/${protocolo_id}`),
        listarMeus: () => http.get('favoritos/meus'),
    };

    return { apiFetch, http, favoritos };
}