"use client";
import { useEffect } from 'react';
import { useSessionCleanup } from '@/hooks/useSessionCleanup';

/**
 * Composant pour gérer la session utilisateur et le nettoyage automatique
 * Doit être placé dans le layout principal de l'application
 */
export default function SessionManager() {
  const { forceCleanup } = useSessionCleanup();

  useEffect(() => {
    // Vérifier la validité du token au montage du composant
    const checkTokenValidity = () => {
      try {
        const token = localStorage.getItem('auth-token');
        
        if (token) {
          // Décoder le token pour vérifier l'expiration
          const payload = JSON.parse(atob(token.split('.')[1]));
          const currentTime = Math.floor(Date.now() / 1000);
          
          if (payload.exp && payload.exp < currentTime) {
            console.log('🔒 Token expiré détecté au démarrage');
            forceCleanup();
          }
        }
      } catch (error) {
        console.error('❌ Erreur lors de la vérification du token:', error);
        // En cas d'erreur de décodage, nettoyer par sécurité
        forceCleanup();
      }
    };

    // Vérifier immédiatement
    checkTokenValidity();

    // Vérifier périodiquement (toutes les 5 minutes)
    const interval = setInterval(checkTokenValidity, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [forceCleanup]);

  // Ce composant ne rend rien visuellement
  return null;
}

/**
 * Hook pour accéder aux fonctions de gestion de session depuis n'importe quel composant
 */
export function useSessionManager() {
  const { forceCleanup } = useSessionCleanup();
  
  return {
    logout: forceCleanup,
    clearSession: forceCleanup
  };
}
