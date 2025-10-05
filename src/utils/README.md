# Authentication Utils

Ce module fournit des utilitaires pour la gestion de l'authentification basée sur les tokens stockés dans le localStorage.

## Fonctions disponibles

### `hasToken(): boolean`
Vérifie si un token existe dans le localStorage.

```typescript
import { hasToken } from '@/utils/auth';

if (hasToken()) {
  console.log('Utilisateur authentifié');
} else {
  console.log('Utilisateur non authentifié');
}
```

### `getToken(): string | null`
Récupère le token depuis le localStorage.

```typescript
import { getToken } from '@/utils/auth';

const token = getToken();
if (token) {
  // Utiliser le token pour les requêtes API
}
```

### `setToken(token: string): void`
Stocke un token dans le localStorage.

```typescript
import { setToken } from '@/utils/auth';

setToken('your-jwt-token');
```

### `removeToken(): void`
Supprime le token du localStorage.

```typescript
import { removeToken } from '@/utils/auth';

removeToken(); // Déconnexion
```

## Hooks disponibles

### `useRedirectIfAuthenticated()`
Hook pour les pages d'authentification (signin, signup) qui redirige vers la home si l'utilisateur est déjà connecté.

```typescript
import { useRedirectIfAuthenticated } from '@/hooks/useAuthRedirect';

export default function SignInPage() {
  useRedirectIfAuthenticated(); // Redirige vers "/" si token existe
  
  return <SignInForm />;
}
```

### `useRequireAuth()`
Hook pour les pages protégées qui redirige vers signin si l'utilisateur n'est pas connecté.

```typescript
import { useRequireAuth } from '@/hooks/useAuthRedirect';

export default function DashboardPage() {
  useRequireAuth(); // Redirige vers "/signin" si pas de token
  
  return <Dashboard />;
}
```

## Composants disponibles

### `ProtectedRoute`
Composant wrapper pour protéger des routes entières.

```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute fallback={<div>Chargement...</div>}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

## Exemples d'utilisation

### Page de connexion
```typescript
// pages/signin.tsx
'use client';
import { useRedirectIfAuthenticated } from '@/hooks/useAuthRedirect';

export default function SignIn() {
  useRedirectIfAuthenticated(); // Auto-redirect si déjà connecté
  
  return <SignInForm />;
}
```

### Page protégée
```typescript
// pages/dashboard.tsx
'use client';
import { useRequireAuth } from '@/hooks/useAuthRedirect';

export default function Dashboard() {
  useRequireAuth(); // Auto-redirect si pas connecté
  
  return <DashboardContent />;
}
```

### Gestion manuelle
```typescript
import { hasToken, redirectBasedOnToken } from '@/utils/auth';
import { useRouter } from 'next/navigation';

const router = useRouter();

// Redirection manuelle
redirectBasedOnToken(
  () => router.push('/'),      // Si token existe
  () => router.push('/signin') // Si pas de token
);
```
