# Système de Gestion des Étudiants

Ce système permet de gérer les étudiants et les classes de votre établissement avec des fonctionnalités complètes de CRUD (Create, Read, Update, Delete) et d'import/export CSV.

## Fonctionnalités

### Gestion des Classes
- **Page**: `/admin/titulaire/classe`
- Créer, modifier et supprimer des classes
- Classes organisées par niveau (6ème, 5ème, 4ème, 3ème, etc.)
- Données persistées en localStorage

### Gestion des Étudiants
- **Page**: `/admin/titulaire/etudiants`
- Créer, modifier et supprimer des étudiants
- Recherche par nom, prénom ou email
- Filtrage par classe
- Interface DataTable moderne et responsive
- Données persistées en localStorage

### Import/Export CSV

#### Format CSV pour l'import
Le fichier CSV doit contenir les colonnes suivantes :
```csv
nom,prenom,email,sexe,classeId
Dupont,Jean,jean.dupont@email.com,M,1
Martin,Marie,marie.martin@email.com,F,2
```

**Colonnes requises :**
- `nom` : Nom de famille de l'étudiant
- `prenom` : Prénom de l'étudiant
- `email` : Adresse email de l'étudiant
- `sexe` : M (Masculin) ou F (Féminin)
- `classeId` : ID de la classe (doit correspondre à une classe existante)

#### Export CSV
- Exporte tous les étudiants au format CSV
- Fichier nommé automatiquement avec la date : `etudiants_YYYY-MM-DD.csv`

## Structure des Données

### Étudiant
```typescript
interface Etudiant {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  sexe: string; // 'M' ou 'F'
  classeId: string;
}
```

### Classe
```typescript
interface Classe {
  _id: string;
  nom: string; // Ex: "6ème A"
  niveau: string; // Ex: "6ème"
}
```

## Technologies Utilisées

- **React 18** avec TypeScript
- **Zustand** pour la gestion d'état
- **Zustand Persist** pour la persistance en localStorage
- **Tailwind CSS** pour le styling
- **CSV Parser** intégré pour l'import/export

## Stores Zustand

### EtudiantStore (`/stores/etudiantStore.ts`)
- Gestion CRUD des étudiants
- Import/export CSV
- Recherche et filtrage
- Persistance automatique

### ClasseStore (`/stores/classeStore.ts`)
- Gestion CRUD des classes
- Initialisation avec des classes par défaut
- Persistance automatique

## Composants

### Pages
- `EtudiantsPage` : Page principale de gestion des étudiants
- `ClassePage` : Page de gestion des classes

### Composants
- `EtudiantModal` : Modal pour ajouter/modifier un étudiant
- `ImportExportButtons` : Boutons d'import/export CSV

## Installation et Utilisation

1. Les stores sont automatiquement initialisés au premier chargement
2. Les classes par défaut sont créées automatiquement
3. Toutes les données sont sauvegardées en localStorage
4. L'interface est entièrement responsive

## Exemple d'utilisation

1. **Créer des classes** : Allez sur `/admin/titulaire/classe` et ajoutez vos classes
2. **Ajouter des étudiants** : Allez sur `/admin/titulaire/etudiants` et ajoutez des étudiants un par un
3. **Import en masse** : Utilisez le bouton "Importer CSV" avec un fichier au bon format
4. **Export des données** : Utilisez le bouton "Exporter CSV" pour télécharger toutes les données

## Format CSV d'exemple

Un fichier d'exemple `exemple-etudiants.csv` est disponible dans le dossier `public/` pour vous aider à comprendre le format attendu.
