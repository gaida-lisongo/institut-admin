# User Store avec Zustand

Ce document décrit l'implémentation du système de gestion des utilisateurs avec Zustand.

## Architecture

### Store Principal (`userStore.ts`)
```typescript
interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  signup: (data: SignupData) => Promise<AuthResponse>;
  login: (data: LoginData) => Promise<AuthResponse>;
  logout: () => void;
  updateUser: (id: string, data: UpdateUserData) => Promise<UserResponse>;
  deleteUser: (id: string) => Promise<UserResponse>;
}
```

### Configuration API (`config/api.ts`)
- Base URL configurable via `NEXT_PUBLIC_API_BASE_URL`
- Endpoints centralisés pour toutes les routes user
- Headers d'authentification automatiques

### Types TypeScript (`types/user.ts`)
- `User`: Interface utilisateur complète
- `SignupData`: Données d'inscription
- `LoginData`: Données de connexion
- `AuthResponse`: Réponse d'authentification
- `UserResponse`: Réponse API standard

## Routes API Supportées

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/user/signup` | Inscription utilisateur |
| POST | `/user/login` | Connexion utilisateur |
| PUT | `/user/:id` | Mise à jour utilisateur |
| DELETE | `/user/:id` | Suppression utilisateur |

## Hooks Disponibles

### `useUser()`
Hook principal pour toutes les opérations utilisateur.

```typescript
const { user, isAuthenticated, login, signup, logout, error } = useUser();
```

### `useCurrentUser()`
Hook optimisé pour obtenir uniquement l'utilisateur courant.

```typescript
const user = useCurrentUser();
```

### `useAuth()`
Hook pour les opérations d'authentification basiques.

```typescript
const { isAuthenticated, isLoading, logout } = useAuth();
```

### `useAuthActions()`
Hook pour les actions d'authentification (login/signup).

```typescript
const { login, signup, error, isLoading } = useAuthActions();
```

### `useProfile()`
Hook pour la gestion du profil utilisateur.

```typescript
const { user, updateProfile, deleteProfile } = useProfile();
```

## Persistance

Le store utilise la persistance Zustand avec localStorage :
- Clé : `user-store`
- Données persistées : `currentUser`, `isAuthenticated`
- Les états temporaires (`isLoading`, `error`) ne sont pas persistés

## Intégration avec AuthProvider

Le store s'intègre parfaitement avec l'AuthProvider global :
- Synchronisation automatique des états
- Redirections basées sur `isAuthenticated`
- Gestion des tokens via les utilitaires auth

## Exemples d'utilisation

### Connexion
```typescript
const LoginComponent = () => {
  const { login, error, isLoading } = useAuthActions();
  
  const handleLogin = async (credentials) => {
    const result = await login(credentials);
    if (result.success) {
      // Redirection automatique via AuthProvider
    }
  };
};
```

### Inscription
```typescript
const SignupComponent = () => {
  const { signup, error, isLoading } = useAuthActions();
  
  const handleSignup = async (data) => {
    const result = await signup(data);
    if (result.success) {
      // Utilisateur connecté automatiquement
    }
  };
};
```

### Mise à jour du profil
```typescript
const ProfileComponent = () => {
  const { user, updateProfile, error } = useProfile();
  
  const handleUpdate = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      // Profil mis à jour dans le store
    }
  };
};
```

## Configuration Environnement

Créer un fichier `.env.local` :
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

## Gestion d'erreurs

Le store gère automatiquement :
- Erreurs réseau
- Erreurs API
- Messages d'erreur utilisateur
- États de chargement

Les erreurs sont exposées via le hook `error` et peuvent être effacées avec `clearError()`.
