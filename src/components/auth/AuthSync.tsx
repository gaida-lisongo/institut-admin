'use client';

import { useEffect } from 'react';
import { useAuthSync } from '@/utils/auth';

/**
 * Composant pour synchroniser les tokens d'authentification
 * entre localStorage et les cookies pour le middleware
 */
export default function AuthSync() {
  useEffect(() => {
    // Initialiser la synchronisation des tokens
    const cleanup = useAuthSync();
    
    return cleanup;
  }, []);

  // Ce composant ne rend rien
  return null;
}
