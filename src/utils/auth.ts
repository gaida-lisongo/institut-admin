// Utilitaires pour la gestion de l'authentification

/**
 * Synchronise le token d'authentification entre localStorage et les cookies
 * pour que le middleware puisse y accéder
 */
export function syncAuthToken() {
  if (typeof window === 'undefined') return;

  try {
    const token = localStorage.getItem('auth-token');
    
    if (token) {
      // Créer un cookie accessible au middleware
      document.cookie = `ls-auth-token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
    } else {
      // Supprimer le cookie si pas de token
      document.cookie = 'ls-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    }
  } catch (error) {
    console.error('Erreur lors de la synchronisation du token:', error);
  }
}

/**
 * Nettoie tous les tokens d'authentification
 */
export function clearAuthTokens() {
  if (typeof window === 'undefined') return;

  try {
    // Nettoyer localStorage
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user-data');
    
    // Nettoyer les cookies
    document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'ls-auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'user-data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  } catch (error) {
    console.error('Erreur lors du nettoyage des tokens:', error);
  }
}

/**
 * Vérifie si l'utilisateur est authentifié côté client
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const token = localStorage.getItem('auth-token');
    if (!token) return false;

    // Décoder le token pour vérifier l'expiration
    const payload = decodeJWT(token);
    if (!payload) return false;

    const currentTime = Math.floor(Date.now() / 1000);
    return !payload.exp || payload.exp > currentTime;
  } catch (error) {
    console.error('Erreur lors de la vérification d\'authentification:', error);
    return false;
  }
}

/**
 * Décoder un JWT côté client
 */
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(
      atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    );
    
    return decoded;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

/**
 * Hook pour initialiser la synchronisation des tokens
 * À utiliser dans les composants racine
 */
export function useAuthSync() {
  if (typeof window === 'undefined') return;

  // Synchroniser au chargement
  syncAuthToken();

  // Écouter les changements dans localStorage
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'auth-token') {
      syncAuthToken();
    }
  };

  window.addEventListener('storage', handleStorageChange);
  
  // Synchroniser périodiquement (toutes les 5 minutes)
  const interval = setInterval(syncAuthToken, 5 * 60 * 1000);

  return () => {
    window.removeEventListener('storage', handleStorageChange);
    clearInterval(interval);
  };
}
