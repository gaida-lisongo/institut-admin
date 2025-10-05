'use client';

import { useRequireAuth } from '@/hooks/useAuthRedirect';
import { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to protect routes that require authentication
 * Automatically redirects to signin if no token is found
 */
export default function ProtectedRoute({ 
  children, 
  fallback = <div>Loading...</div> 
}: ProtectedRouteProps) {
  const { hasToken } = useRequireAuth();

  // Show fallback while checking authentication or redirecting
  if (!hasToken) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
