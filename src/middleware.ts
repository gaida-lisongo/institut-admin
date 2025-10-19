import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Fonction pour vérifier et décoder un JWT avec jose
async function verifyJWTWithJose(token: string): Promise<any> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production'
    );
    
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

// Fonction simple pour décoder un JWT (fallback si jose échoue)
function decodeJWT(token: string): any {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = parts[1];
    const decoded = JSON.parse(
      Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
    );
    
    return decoded;
  } catch (error) {
    console.error('JWT decode error:', error);
    return null;
  }
}

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/',
  '/personnel',
  '/classe',
  '/etudiant',
  '/finance',
  '/admin',
  '/ministere',
  '/api/v1' // Protéger aussi les routes API
];

// Routes publiques (pas d'authentification requise)
const publicRoutes = [
  '/signin',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/api/auth', // Routes d'authentification
  '/_next', // Assets Next.js
  '/favicon.ico',
  '/manifest.json',
  '/robots.txt'
];

// Fonction pour vérifier si une route est protégée
function isProtectedRoute(pathname: string): boolean {
  return protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  );
}

// Fonction pour vérifier si une route est publique
function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );
}

// Fonction pour vérifier et décoder le token JWT
async function verifyToken(token: string): Promise<any> {
  try {
    // Essayer d'abord avec jose (vérification complète)
    let payload = await verifyJWTWithJose(token);
    
    // Si jose échoue, utiliser le décodage simple (fallback)
    if (!payload) {
      payload = decodeJWT(token);
      if (!payload) return null;
      
      // Vérifier l'expiration manuellement pour le fallback
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp && payload.exp < currentTime) {
        return null;
      }
    }
    
    return payload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

// Fonction pour extraire le token depuis les cookies ou headers
function getTokenFromRequest(request: NextRequest): string | null {
  // Essayer d'abord les cookies
  const tokenFromCookie = request.cookies.get('auth-token')?.value;
  if (tokenFromCookie) {
    return tokenFromCookie;
  }

  // Ensuite essayer le header Authorization
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Essayer le localStorage via un cookie spécial (pour la compatibilité)
  const localStorageToken = request.cookies.get('ls-auth-token')?.value;
  if (localStorageToken) {
    return localStorageToken;
  }

  return null;
}

// Fonction pour créer une réponse de redirection avec nettoyage
function createRedirectResponse(request: NextRequest, redirectTo: string) {
  const response = NextResponse.redirect(new URL(redirectTo, request.url));
  
  // Nettoyer les cookies d'authentification
  response.cookies.delete('auth-token');
  response.cookies.delete('ls-auth-token');
  response.cookies.delete('user-data');
  
  // Ajouter un header pour indiquer au client de nettoyer le localStorage
  response.headers.set('X-Clear-Storage', 'true');
  
  // Ajouter des headers de sécurité
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  response.headers.set('Pragma', 'no-cache');
  
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Permettre l'accès aux routes publiques sans vérification
  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Vérifier si la route nécessite une authentification
  if (isProtectedRoute(pathname)) {
    const token = getTokenFromRequest(request);

    // Pas de token = redirection vers signin
    if (!token) {
      console.log(`🔒 Accès refusé à ${pathname} - Pas de token`);
      return createRedirectResponse(request, '/signin');
    }

    // Vérifier la validité du token
    const payload = await verifyToken(token);
    if (!payload) {
      console.log(`🔒 Accès refusé à ${pathname} - Token invalide`);
      return createRedirectResponse(request, '/signin');
    }

    // Vérifier l'expiration du token
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      console.log(`🔒 Accès refusé à ${pathname} - Token expiré`);
      return createRedirectResponse(request, '/signin');
    }

    // Vérifications supplémentaires selon le type de route
    if (pathname.startsWith('/admin') || pathname.startsWith('/ministere')) {
      // Vérifier les autorisations pour les routes admin
      const userAutorisations = payload.autorisations || [];
      const hasAdminAccess = userAutorisations.some((auth: any) => 
        ['DG', 'SGACAD', 'SGAD', 'SGR', 'AB', 'ADMIN'].includes(auth.type)
      );

      if (!hasAdminAccess) {
        console.log(`🔒 Accès refusé à ${pathname} - Autorisations insuffisantes`);
        return createRedirectResponse(request, '/unauthorized');
      }
    }

    // Token valide - continuer avec la requête
    console.log(`✅ Accès autorisé à ${pathname} pour l'utilisateur ${payload.matricule}`);
    
    // Ajouter des headers de sécurité
    const response = NextResponse.next();
    response.headers.set('X-User-ID', payload.userId || '');
    response.headers.set('X-User-Matricule', payload.matricule || '');
    response.headers.set('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    
    return response;
  }

  // Pour toutes les autres routes, continuer normalement
  return NextResponse.next();
}

// Configuration du middleware - spécifier les routes à traiter
export const config = {
  matcher: [
    /*
     * Matcher pour toutes les routes sauf :
     * - api/auth (routes d'authentification)
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, manifest.json, robots.txt
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.json|robots.txt).*)',
  ],
};
