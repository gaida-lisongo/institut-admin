import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Hook pour nettoyer le localStorage quand l'utilisateur perd sa session
 */
export function useSessionCleanup() {
  const router = useRouter();

  useEffect(() => {
    // Fonction pour nettoyer tout le localStorage
    const clearAllStorage = () => {
      try {
        // Lister toutes les clés avant de les supprimer
        const keys = Object.keys(localStorage);
        console.log('🧹 Nettoyage du localStorage - Clés trouvées:', keys);
        
        // Nettoyer le localStorage
        localStorage.clear();
        
        // Nettoyer aussi le sessionStorage
        sessionStorage.clear();
        
        console.log('✅ localStorage et sessionStorage nettoyés');
      } catch (error) {
        console.error('❌ Erreur lors du nettoyage du storage:', error);
      }
    };

    // Intercepter les réponses fetch pour détecter les sessions expirées
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        // Vérifier si le serveur demande un nettoyage du storage
        if (response.headers.get('X-Clear-Storage') === 'true') {
          console.log('🔒 Session expirée détectée via header X-Clear-Storage');
          clearAllStorage();
        }
        
        // Vérifier les codes de statut d'authentification
        if (response.status === 401 || response.status === 403) {
          console.log(`🔒 Session expirée détectée via status ${response.status}`);
          clearAllStorage();
          
          // Rediriger vers la page de connexion si pas déjà sur une page publique
          const currentPath = window.location.pathname;
          const publicPaths = ['/signin', '/signup', '/forgot-password', '/reset-password'];
          
          if (!publicPaths.includes(currentPath)) {
            router.push('/signin');
          }
        }
        
        return response;
      } catch (error) {
        console.error('❌ Erreur lors de la requête fetch:', error);
        throw error;
      }
    };

    // Écouter les événements de storage pour synchroniser entre onglets
    const handleStorageChange = (event: StorageEvent) => {
      // Si la clé auth-token est supprimée dans un autre onglet
      if (event.key === 'auth-token' && event.newValue === null) {
        console.log('🔒 Token supprimé dans un autre onglet');
        clearAllStorage();
        router.push('/signin');
      }
    };

    // Écouter les événements de visibilité pour vérifier la session
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Vérifier si le token existe encore
        const token = localStorage.getItem('auth-token');
        if (!token) {
          console.log('🔒 Token manquant lors du retour sur l\'onglet');
          clearAllStorage();
          
          const currentPath = window.location.pathname;
          const publicPaths = ['/signin', '/signup', '/forgot-password', '/reset-password'];
          
          if (!publicPaths.includes(currentPath)) {
            router.push('/signin');
          }
        }
      }
    };

    // Ajouter les event listeners
    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Nettoyage lors du démontage du composant
    return () => {
      // Restaurer le fetch original
      window.fetch = originalFetch;
      
      // Supprimer les event listeners
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  // Fonction utilitaire pour forcer le nettoyage (peut être appelée manuellement)
  const forceCleanup = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      console.log('🧹 Nettoyage forcé du storage effectué');
      router.push('/signin');
    } catch (error) {
      console.error('❌ Erreur lors du nettoyage forcé:', error);
    }
  };

  return { forceCleanup };
}

/**
 * Fonction utilitaire pour nettoyer le storage de manière synchrone
 */
export function clearUserSession() {
  try {
    // Lister les clés liées à l'authentification
    const authKeys = [
      'auth-token',
      'user-data',
      'user-profile',
      'permissions',
      'etablissement-data',
      'current-etablissement'
    ];
    
    console.log('🧹 Nettoyage des clés d\'authentification...');
    
    // Supprimer les clés spécifiques
    authKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`   ✅ ${key} supprimé`);
      }
    });
    
    // Nettoyer aussi le sessionStorage
    sessionStorage.clear();
    
    console.log('✅ Session utilisateur nettoyée');
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage de la session:', error);
  }
}
