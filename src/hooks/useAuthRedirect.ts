'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { hasToken } from '@/utils/auth';

/**
 * Hook to handle authentication-based redirects
 * @param {boolean} requireAuth - If true, redirects to signin when no token. If false, redirects to home when token exists
 */
export const useAuthRedirect = (requireAuth: boolean = true) => {
  const router = useRouter();

  useEffect(() => {
    const tokenExists = hasToken();

    if (requireAuth && !tokenExists) {
      // User needs to be authenticated but no token exists
      router.push('/signin');
    } else if (!requireAuth && tokenExists) {
      // User is on auth page but already has token
      router.push('/');
    }
  }, [router, requireAuth]);

  return { hasToken: hasToken() };
};

/**
 * Hook specifically for protected pages that require authentication
 */
export const useRequireAuth = () => {
  return useAuthRedirect(true);
};

/**
 * Hook specifically for auth pages (signin, signup) that should redirect if already authenticated
 */
export const useRedirectIfAuthenticated = () => {
  return useAuthRedirect(false);
};
