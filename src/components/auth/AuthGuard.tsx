"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
import { useAuthHydrated } from '@/hooks/useAuthHydrated';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const router = useRouter();
  const { isAuthenticated, token, setLoading } = useAuthStore();
  const isHydrated = useAuthHydrated();

  useEffect(() => {
    // Ne vérifier l'authentification qu'après la réhydratation
    if (!isHydrated) return;

    const checkAuth = () => {
      console.log('AuthGuard: Vérification de l\'authentification');
      console.log('isAuthenticated:', isAuthenticated);
      console.log('token:', token);
      console.log('isHydrated:', isHydrated);
      
      setLoading(true);
      
      // Vérifier si l'utilisateur est authentifié
      if (!isAuthenticated || !token) {
        console.log('Utilisateur non authentifié, redirection vers signin');
        router.push('/signin');
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, token, router, setLoading, isHydrated]);

  // Afficher un loader pendant la réhydratation
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  // Si pas authentifié après réhydratation, ne rien afficher (la redirection va se faire)
  if (!isAuthenticated || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;