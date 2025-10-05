# Documentation Technique - Système de Gestion des Étudiants

## Architecture

### Structure des Dossiers
```
src/
├── app/(admin)/(titulaire)/
│   ├── etudiants/
│   │   └── page.tsx           # Page principale des étudiants
│   └── classe/
│       └── page.tsx           # Page de gestion des classes
├── components/
│   ├── students/
│   │   ├── EtudiantModal.tsx  # Modal CRUD étudiant
│   │   ├── ImportExportButtons.tsx # Boutons import/export CSV
│   │   └── StudentStats.tsx   # Statistiques étudiants
│   └── navigation/
│       └── StudentNavigation.tsx # Navigation entre pages
├── stores/
│   ├── etudiantStore.ts       # Store Zustand étudiants
│   └── classeStore.ts         # Store Zustand classes
└── types/
    └── student.ts             # Types TypeScript
```

## Stores Zustand

### EtudiantStore
**Fichier**: `src/stores/etudiantStore.ts`

**État**:
- `etudiants: Etudiant[]` - Liste des étudiants
- `loading: boolean` - État de chargement
- `error: string | null` - Messages d'erreur

**Actions**:
- `addEtudiant(etudiant)` - Ajouter un étudiant
- `updateEtudiant(id, updates)` - Modifier un étudiant
- `deleteEtudiant(id)` - Supprimer un étudiant
- `getEtudiantById(id)` - Récupérer un étudiant par ID
- `getEtudiantsByClasse(classeId)` - Filtrer par classe
- `importFromCSV(csvData)` - Import CSV avec validation
- `exportToCSV()` - Export CSV

**Persistance**: Utilise `zustand/middleware/persist` avec localStorage

### ClasseStore
**Fichier**: `src/stores/classeStore.ts`

**État**:
- `classes: Classe[]` - Liste des classes
- `loading: boolean` - État de chargement
- `error: string | null` - Messages d'erreur

**Actions**:
- `addClasse(classe)` - Ajouter une classe
- `updateClasse(id, updates)` - Modifier une classe
- `deleteClasse(id)` - Supprimer une classe
- `getClasseById(id)` - Récupérer une classe par ID
- `initializeDefaultClasses()` - Initialiser classes par défaut

## Types TypeScript

### Etudiant
```typescript
interface Etudiant {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  sexe: string; // 'M' | 'F'
  classeId: string;
}
```

### Classe
```typescript
interface Classe {
  _id: string;
  nom: string;     // Ex: "6ème A"
  niveau: string;  // Ex: "6ème"
}
```

### EtudiantWithClasse
```typescript
interface EtudiantWithClasse extends Etudiant {
  classe?: Classe;
}
```

## Composants

### EtudiantModal
**Props**:
- `isOpen: boolean` - État d'ouverture
- `onClose: () => void` - Callback fermeture
- `onSubmit: (etudiant) => void` - Callback soumission
- `etudiant?: Etudiant | null` - Étudiant à modifier (optionnel)

**Fonctionnalités**:
- Formulaire de création/modification
- Validation côté client
- Sélection de classe dynamique
- Gestion des erreurs

### ImportExportButtons
**Fonctionnalités**:
- Import CSV avec validation format
- Export CSV avec nom automatique
- Gestion des erreurs utilisateur
- Feedback visuel

**Validation CSV**:
- Vérification extension .csv
- Validation colonnes requises
- Contrôle format données
- Messages d'erreur explicites

### StudentStats
**Métriques affichées**:
- Total étudiants
- Total classes
- Répartition par sexe
- Interface responsive

### StudentNavigation
**Fonctionnalités**:
- Navigation entre pages étudiants/classes
- État actif visuel
- Icônes SVG
- Responsive design

## Gestion des Données

### Persistance
- **LocalStorage**: Données persistées automatiquement
- **Clé étudiants**: `etudiant-storage`
- **Clé classes**: `classe-storage`
- **Sérialisation**: JSON automatique

### Validation
- **Côté client**: Validation formulaires React
- **Import CSV**: Validation format et données
- **Types TypeScript**: Validation compilation

### Gestion d'État
- **Zustand**: Store global réactif
- **Middleware persist**: Sauvegarde automatique
- **Actions synchrones**: Pas d'API calls

## Format CSV

### Structure Import
```csv
nom,prenom,email,sexe,classeId
Dupont,Jean,jean.dupont@email.com,M,1
Martin,Marie,marie.martin@email.com,F,2
```

### Validation
- **Colonnes requises**: nom, prenom, email, sexe, classeId
- **Format sexe**: M ou F uniquement
- **Email**: Validation HTML5
- **ClasseId**: Doit exister dans le store

### Export
- **Format**: CSV standard
- **Encodage**: UTF-8
- **Nom fichier**: `etudiants_YYYY-MM-DD.csv`

## Styling

### Framework
- **Tailwind CSS**: Classes utilitaires
- **Dark Mode**: Support automatique
- **Responsive**: Mobile-first design

### Thème
- **Couleurs primaires**: brand-* (configurables)
- **Grilles**: CSS Grid et Flexbox
- **Animations**: Transitions CSS

## Performance

### Optimisations
- **React.memo**: Composants purs
- **useCallback**: Callbacks stables
- **Lazy loading**: Import dynamique possible

### Limitations
- **LocalStorage**: 5-10MB max
- **Pas de pagination**: Toutes données en mémoire
- **Pas de virtualisation**: Tables simples

## Sécurité

### Validation
- **Input sanitization**: Validation formulaires
- **Type safety**: TypeScript strict
- **XSS prevention**: Pas d'innerHTML

### Limitations
- **Pas d'authentification**: Système local
- **Pas de chiffrement**: Données en clair
- **Pas d'audit**: Pas de logs

## Déploiement

### Prérequis
- Node.js 18+
- Next.js 15+
- TypeScript 5+

### Installation
```bash
npm install zustand
npm run dev
```

### Build
```bash
npm run build
npm start
```

## Tests

### Types de Tests Recommandés
- **Unit tests**: Stores Zustand
- **Component tests**: React Testing Library
- **Integration tests**: Import/Export CSV
- **E2E tests**: Cypress/Playwright

### Couverture Suggérée
- Actions stores: 100%
- Composants critiques: 80%
- Validation CSV: 100%

## Maintenance

### Monitoring
- **Erreurs**: Console browser
- **Performance**: React DevTools
- **État**: Zustand DevTools

### Évolutions Futures
- **API Backend**: Remplacement localStorage
- **Authentification**: Système utilisateurs
- **Pagination**: Grandes listes
- **Recherche avancée**: Filtres multiples
