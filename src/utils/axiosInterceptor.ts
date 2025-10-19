import { clearUserSession } from '@/hooks/useSessionCleanup';

/**
 * Configuration du fetch interceptor pour gérer l'authentification
 */
export function setupFetchInterceptor() {
  // Sauvegarder le fetch original
  const originalFetch = window.fetch;

  // Remplacer fetch par notre version interceptée
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    try {
      // Préparer les headers avec le token d'authentification
      const headers = new Headers(init?.headers);
      
      // Ajouter le token Bearer automatiquement
      try {
        const token = localStorage.getItem('auth-token');
        if (token && !headers.has('Authorization')) {
          headers.set('Authorization', `Bearer ${token}`);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération du token:', error);
      }

      // Faire la requête avec les headers modifiés
      const response = await originalFetch(input, {
        ...init,
        headers,
      });

      // Vérifier si le serveur demande un nettoyage du storage
      if (response.headers.get('X-Clear-Storage') === 'true') {
        console.log('🔒 Session expirée détectée via header X-Clear-Storage');
        clearUserSession();
        
        // Rediriger vers la page de connexion
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/signin', '/signup', '/forgot-password', '/reset-password'];
          
          if (!publicPaths.includes(currentPath)) {
            window.location.href = '/signin';
          }
        }
      }

      // Gérer les erreurs d'authentification
      if (response.status === 401 || response.status === 403) {
        console.log(`🔒 Session expirée détectée via status ${response.status}`);
        clearUserSession();
        
        // Rediriger vers la page de connexion
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          const publicPaths = ['/signin', '/signup', '/forgot-password', '/reset-password'];
          
          if (!publicPaths.includes(currentPath)) {
            window.location.href = '/signin';
          }
        }
      }

      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la requête fetch:', error);
      throw error;
    }
  };

  // Retourner une fonction de nettoyage pour restaurer le fetch original
  return () => {
    window.fetch = originalFetch;
  };
}

/**
 * Fonction utilitaire pour faire des requêtes API avec gestion automatique de l'authentification
 */
export async function apiRequest(
  url: string, 
  options: RequestInit = {}
): Promise<Response> {
  const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
  const fullUrl = url.startsWith('http') ? url : `${baseURL}${url}`;
  
  // Préparer les headers par défaut
  const headers = new Headers(options.headers);
  
  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Ajouter le token d'authentification
  try {
    const token = localStorage.getItem('auth-token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du token:', error);
  }

  // Faire la requête
  const response = await fetch(fullUrl, {
    ...options,
    headers,
  });

  // Vérifier les erreurs d'authentification
  if (response.status === 401 || response.status === 403) {
    console.log(`🔒 Session expirée détectée via status ${response.status} (API Request)`);
    clearUserSession();
    
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const publicPaths = ['/signin', '/signup', '/forgot-password', '/reset-password'];
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/signin';
      }
    }
  }

  // Vérifier le header de nettoyage
  if (response.headers.get('X-Clear-Storage') === 'true') {
    console.log('🔒 Session expirée détectée via header X-Clear-Storage (API Request)');
    clearUserSession();
    
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname;
      const publicPaths = ['/signin', '/signup', '/forgot-password', '/reset-password'];
      
      if (!publicPaths.includes(currentPath)) {
        window.location.href = '/signin';
      }
    }
  }

  return response;
}

/**
 * Fonctions utilitaires pour les requêtes API courantes
 */
export const api = {
  get: (url: string, options?: RequestInit) => 
    apiRequest(url, { ...options, method: 'GET' }),
    
  post: (url: string, data?: any, options?: RequestInit) => 
    apiRequest(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  put: (url: string, data?: any, options?: RequestInit) => 
    apiRequest(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
    
  delete: (url: string, options?: RequestInit) => 
    apiRequest(url, { ...options, method: 'DELETE' }),
    
  patch: (url: string, data?: any, options?: RequestInit) => 
    apiRequest(url, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),
};

export default api;
