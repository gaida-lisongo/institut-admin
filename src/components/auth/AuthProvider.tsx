'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasToken } from '@/utils/auth';
import { useAuth } from '@/hooks/useUser';

interface AuthProviderProps {
  children: React.ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuth();

  // Pages qui ne nécessitent pas d'authentification
  const publicRoutes = ['/signin', '/signup', '/reset-password'];
  
  // Pages d'authentification (redirection si déjà connecté)
  const authRoutes = ['/signin', '/signup'];

  useEffect(() => {
    const checkAuth = () => {
      const tokenExists = hasToken();

      const isPublicRoute = publicRoutes.includes(pathname);
      const isAuthRoute = authRoutes.includes(pathname);

      if (tokenExists && isAuthRoute) {
        // Utilisateur connecté sur une page d'auth → rediriger vers home
        router.push('/');
      } else if (!tokenExists && !isPublicRoute) {
        // Utilisateur non connecté sur une page protégée → rediriger vers signin
        router.push('/signin');
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [pathname, router, isAuthenticated]);

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Afficher le contenu si l'utilisateur est sur une route publique ou authentifié
  const isPublicRoute = publicRoutes.includes(pathname);
  const tokenExists = hasToken();
  if (tokenExists || isPublicRoute) {
    return <>{children}</>;
  }

  // Fallback (ne devrait pas arriver avec la logique de redirection)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
          Redirection en cours...
        </h2>
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
      </div>
    </div>
  );
}
