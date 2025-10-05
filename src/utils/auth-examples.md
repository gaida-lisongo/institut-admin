# Exemples d'utilisation du système d'authentification

## Configuration globale dans layout.tsx

Le contrôle d'authentification est maintenant géré au niveau global via l'`AuthProvider` dans le layout.tsx :

```typescript
// src/app/layout.tsx
import AuthProvider from '@/components/auth/AuthProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

## Logique de redirection automatique

L'`AuthProvider` gère automatiquement :

1. **Pages publiques** (`/signin`, `/signup`, `/reset-password`) : Accessibles sans token
2. **Pages d'authentification** (`/signin`, `/signup`) : Redirection vers `/` si token existe
3. **Pages protégées** (toutes les autres) : Redirection vers `/signin` si pas de token

## Gestion des tokens

```typescript
import { setToken, removeToken, hasToken } from '@/utils/auth';

// Lors de la connexion
const handleLogin = async (credentials) => {
  const response = await loginAPI(credentials);
  if (response.token) {
    setToken(response.token);
    // L'AuthProvider détectera le changement et redirigera automatiquement
  }
};

// Lors de la déconnexion
const handleLogout = () => {
  removeToken();
  // L'AuthProvider détectera le changement et redirigera vers /signin
};

// Vérification du statut
if (hasToken()) {
  console.log('Utilisateur connecté');
}
```

## États de chargement

L'`AuthProvider` affiche automatiquement un loader pendant :
- La vérification initiale du token
- Les redirections

## Personnalisation des routes

Pour modifier les routes publiques ou d'authentification, éditer l'`AuthProvider` :

```typescript
// Dans AuthProvider.tsx
const publicRoutes = ['/signin', '/signup', '/reset-password', '/about'];
const authRoutes = ['/signin', '/signup'];
```

## Avantages de cette approche

- ✅ **Contrôle centralisé** : Une seule source de vérité pour l'authentification
- ✅ **Automatique** : Pas besoin d'ajouter des hooks dans chaque page
- ✅ **Performance** : Vérification une seule fois au niveau layout
- ✅ **UX fluide** : Loaders et redirections transparentes
- ✅ **SSR-safe** : Gestion correcte du rendu côté serveur
