"use client";
import { useEffect } from 'react';
import SessionManager from '@/components/auth/SessionManager';
import { setupFetchInterceptor } from '@/utils/fetchInterceptor';

/**
 * Exemple d'intégration du SessionManager dans le layout principal
 * Copiez ce code dans votre layout.tsx existant
 */
export default function RootLayoutExample({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Configurer l'intercepteur fetch au démarrage de l'application
    const cleanup = setupFetchInterceptor();
    
    // Nettoyer lors du démontage du composant
    return cleanup;
  }, []);

  return (
    <html lang="fr">
      <body>
        {/* Gestionnaire de session - doit être placé au niveau racine */}
        <SessionManager />
        
        {/* Votre contenu existant */}
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {children}
        </div>
      </body>
    </html>
  );
}

/**
 * Exemple d'utilisation du bouton de déconnexion dans une navbar
 */
import LogoutButton from '@/components/auth/LogoutButton';

export function NavbarExample() {
  return (
    <nav className="bg-white shadow-sm dark:bg-gray-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <h1 className="text-xl font-semibold">Institut Admin</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Autres éléments de navigation */}
            
            {/* Bouton de déconnexion */}
            <LogoutButton 
              variant="button"
              onLogout={async () => {
                // Actions personnalisées avant déconnexion (optionnel)
                console.log('Déconnexion en cours...');
                
                // Appeler une API de logout si nécessaire
                // await fetch('/api/auth/logout', { method: 'POST' });
              }}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
