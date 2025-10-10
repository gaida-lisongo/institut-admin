# 🔒 Guide de Sécurité - Institut Admin

## 🛡️ Middleware de Sécurité

### Fonctionnalités de Protection

#### 1. **Authentification JWT Robuste**
- **Vérification avec `jose`** : Validation cryptographique complète des tokens
- **Fallback sécurisé** : Décodage simple si `jose` échoue
- **Expiration automatique** : Vérification de la validité temporelle
- **Secret configurable** : Clé JWT via variables d'environnement

#### 2. **Protection des Routes**
```typescript
// Routes protégées (authentification requise)
const protectedRoutes = [
  '/', '/personnel', '/classe', '/etudiant', 
  '/finance', '/admin', '/ministere', '/api/v1'
];

// Routes publiques (accès libre)
const publicRoutes = [
  '/signin', '/signup', '/api/auth', 
  '/_next', '/favicon.ico', '/manifest.json'
];
```

#### 3. **Gestion des Autorisations**
- **Hiérarchie des rôles** : DG > SGACAD > SGAD > SGR > AB > ADMIN > DRH
- **Vérification par route** : Contrôle d'accès selon les autorisations
- **Redirection automatique** : `/unauthorized` pour accès refusé

### Configuration Sécurisée

#### Variables d'Environnement Requises
```bash
# .env.local (OBLIGATOIRE en production)
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NEXT_PUBLIC_APP_URL=https://votre-domaine.com
NEXT_PUBLIC_SERVER_API_URL=https://api.votre-domaine.com/api/v1
```

#### Génération de Clé JWT Sécurisée
```bash
# Générer une clé aléatoire de 64 caractères
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Ou utiliser OpenSSL
openssl rand -hex 32
```

## 🚨 Mesures de Sécurité Critiques

### 1. **Protection Anti-Indexation**
- **robots.txt** : Interdiction complète d'indexation
- **Meta robots** : `noindex, nofollow` sur toutes les pages
- **Headers sécurisés** : Cache-Control, Pragma no-cache

### 2. **Authentification Multi-Niveaux**
- **Middleware** : Vérification côté serveur avant rendu
- **Store Zustand** : Gestion d'état sécurisée côté client
- **Synchronisation** : Tokens localStorage ↔ cookies

### 3. **Nettoyage Automatique**
```typescript
// Déconnexion sécurisée
const clearAuthTokens = () => {
  localStorage.removeItem('auth-token');
  localStorage.removeItem('user-data');
  document.cookie = 'auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'ls-auth-token=; expires=Thu, 01 Jan 1970 00:00:00 GMT';
};
```

## ⚠️ Vulnérabilités à Éviter

### 1. **Exposition de Tokens**
❌ **À éviter** :
```typescript
console.log('Token:', token); // Logs en production
localStorage.setItem('token', token); // Nom prévisible
```

✅ **Recommandé** :
```typescript
// Pas de logs de tokens en production
if (process.env.NODE_ENV === 'development') {
  console.log('Auth success');
}
localStorage.setItem('auth-token', token); // Nom spécifique
```

### 2. **Validation Côté Client Uniquement**
❌ **Insuffisant** :
```typescript
// Seulement côté client
useEffect(() => {
  if (!currentUser) router.push('/signin');
}, [currentUser]);
```

✅ **Sécurisé** :
```typescript
// Middleware + validation client
export async function middleware(request: NextRequest) {
  // Vérification serveur AVANT rendu
  const token = getTokenFromRequest(request);
  if (!token) return redirect('/signin');
}
```

### 3. **Gestion d'Erreurs Exposées**
❌ **Dangereux** :
```typescript
catch (error) {
  console.error('JWT Secret:', process.env.JWT_SECRET);
  throw error; // Expose les détails
}
```

✅ **Sécurisé** :
```typescript
catch (error) {
  console.error('Authentication failed');
  return { success: false, message: 'Accès refusé' };
}
```

## 🔧 Configuration de Production

### 1. **Variables d'Environnement**
```bash
# Production - .env.local
JWT_SECRET=64-character-random-hex-string
NEXT_PUBLIC_APP_URL=https://admin.institut.edu
NODE_ENV=production
```

### 2. **Headers de Sécurité**
```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin'
  }
];
```

### 3. **HTTPS Obligatoire**
```typescript
// Redirection HTTPS automatique
if (process.env.NODE_ENV === 'production' && !request.url.startsWith('https://')) {
  return NextResponse.redirect(`https://${request.headers.get('host')}${request.nextUrl.pathname}`);
}
```

## 📊 Monitoring et Logs

### 1. **Logs de Sécurité**
```typescript
// Tentatives d'accès non autorisées
console.log(`🔒 Accès refusé à ${pathname} - IP: ${request.ip} - User-Agent: ${request.headers.get('user-agent')}`);

// Authentifications réussies
console.log(`✅ Connexion réussie - Utilisateur: ${payload.matricule} - IP: ${request.ip}`);
```

### 2. **Métriques de Sécurité**
- **Tentatives de connexion** : Succès/échecs par IP
- **Accès non autorisés** : Routes protégées sans token
- **Tokens expirés** : Fréquence de renouvellement
- **Erreurs d'authentification** : Patterns suspects

## 🚀 Checklist de Déploiement

### Avant la Mise en Production

- [ ] **JWT_SECRET** généré aléatoirement (64+ caractères)
- [ ] **HTTPS** configuré avec certificat valide
- [ ] **robots.txt** interdit l'indexation
- [ ] **Variables d'environnement** sécurisées
- [ ] **Logs de debug** désactivés
- [ ] **Headers de sécurité** configurés
- [ ] **Tests d'authentification** passés
- [ ] **Backup des données** configuré

### Maintenance Continue

- [ ] **Rotation des secrets** JWT (tous les 6 mois)
- [ ] **Monitoring des logs** de sécurité
- [ ] **Mise à jour des dépendances** (sécurité)
- [ ] **Tests de pénétration** réguliers
- [ ] **Audit des accès** utilisateurs
- [ ] **Sauvegarde des configurations** sécurisées

## 📞 Contact Sécurité

En cas de vulnérabilité découverte :
1. **Ne pas exposer publiquement** la faille
2. **Contacter l'équipe** de développement
3. **Fournir les détails** techniques
4. **Attendre la correction** avant divulgation

---

**⚠️ IMPORTANT** : Cette application contient des données sensibles d'étudiants et de personnel. La sécurité est CRITIQUE et doit être maintenue à tout moment.
