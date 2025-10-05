# Système de Gestion des Sessions d'Interrogation

## 🎯 Vue d'ensemble

Le système de gestion des sessions permet de créer, gérer et administrer des sessions d'interrogation avec des questions à choix multiples. Chaque session est liée à un cours et contient plusieurs questions avec leurs réponses et barèmes de points.

## 📊 Structure des Données

### Session
```typescript
interface Session {
  _id: string;
  designation: string;           // Nom de la session
  statut: string;               // 'brouillon' | 'active' | 'terminee' | 'archivee'
  questions: Question[];        // Liste des questions
  coursId: string;             // ID du cours associé
  maximum: number;             // Score maximum possible
}
```

### Question
```typescript
interface Question {
  _id: string;
  enonce: string[];            // Énoncé sur plusieurs lignes
  reponse: number;            // Index de la bonne réponse (0-based)
  choix: string[];            // Choix de réponses possibles
  pts: number;                // Points attribués à la question
}
```

### Cours
```typescript
interface Cours {
  _id: string;
  designation: string;         // Nom du cours
  credit: number;             // Nombre de crédits
  unite: string;              // Unité d'enseignement
}
```

## 🏗️ Architecture

### Stores Zustand

#### SessionStore (`/stores/sessionStore.ts`)
**État global :**
- `sessions: Session[]` - Liste de toutes les sessions
- `loading: boolean` - État de chargement
- `error: string | null` - Messages d'erreur

**Actions CRUD Sessions :**
- `addSession(session)` - Créer une nouvelle session
- `updateSession(id, updates)` - Modifier une session
- `deleteSession(id)` - Supprimer une session
- `getSessionById(id)` - Récupérer une session par ID
- `duplicateSession(id)` - Dupliquer une session

**Actions CRUD Questions :**
- `addQuestionToSession(sessionId, question)` - Ajouter une question
- `updateQuestionInSession(sessionId, questionId, updates)` - Modifier une question
- `deleteQuestionFromSession(sessionId, questionId)` - Supprimer une question
- `calculateSessionMaximum(sessionId)` - Recalculer le score maximum

#### CoursStore (`/stores/coursStore.ts`)
**Actions principales :**
- `addCours(cours)` - Ajouter un cours
- `updateCours(id, updates)` - Modifier un cours
- `deleteCours(id)` - Supprimer un cours
- `initializeDefaultCours()` - Initialiser avec des cours par défaut

### Persistance
- **LocalStorage** avec middleware Zustand persist
- **Clé sessions** : `session-storage`
- **Clé cours** : `cours-storage`
- **Sauvegarde automatique** à chaque modification

## 📱 Pages et Composants

### Pages Principales

#### 1. Page Sessions (`/sessions/page.tsx`)
**Fonctionnalités :**
- Liste de toutes les sessions avec DataTable
- Filtrage par cours, statut, recherche textuelle
- Statistiques par statut (brouillon, active, terminée)
- Actions : Créer, Modifier, Dupliquer, Supprimer
- Bouton de données de test (développement)

**Colonnes du tableau :**
- Nom de la session
- Cours associé
- Statut avec badge coloré
- Nombre de questions
- Score maximum
- Actions (Détails, Modifier, Dupliquer, Supprimer)

#### 2. Page Détail Session (`/sessions/[slug]/page.tsx`)
**Fonctionnalités :**
- Vue détaillée d'une session spécifique
- DataTable des questions avec CRUD complet
- Statistiques de la session (nb questions, score total, moyenne)
- Changement de statut en temps réel
- Recherche dans les questions

**Colonnes du tableau questions :**
- Énoncé de la question (tronqué)
- Nombre de choix
- Bonne réponse
- Points attribués
- Actions (Modifier, Supprimer)

### Composants

#### SessionModal (`/components/sessions/SessionModal.tsx`)
**Props :**
- `isOpen: boolean` - État d'ouverture
- `onClose: () => void` - Callback fermeture
- `onSubmit: (session) => void` - Callback soumission
- `session?: Session | null` - Session à modifier (optionnel)

**Champs du formulaire :**
- Nom de la session (requis)
- Cours (sélection dropdown, requis)
- Statut (sélection dropdown)

#### QuestionModal (`/components/sessions/QuestionModal.tsx`)
**Fonctionnalités avancées :**
- Énoncé multi-lignes (ajout/suppression dynamique)
- Choix multiples (minimum 2, ajout/suppression dynamique)
- Sélection de la bonne réponse par radio button
- Validation des points (nombre décimal)
- Validation complète avant soumission

**Validation :**
- Au moins une ligne d'énoncé non vide
- Au moins 2 choix de réponse
- Index de bonne réponse valide
- Points > 0

## 🎨 Interface Utilisateur

### Statuts des Sessions
- **Brouillon** (gris) - Session en cours de création
- **Active** (vert) - Session disponible pour les étudiants
- **Terminée** (bleu) - Session fermée, résultats disponibles
- **Archivée** (rouge) - Session archivée

### Statistiques Visuelles
- Cartes avec icônes et couleurs distinctives
- Compteurs en temps réel
- Calculs automatiques (moyenne par question, etc.)

### Navigation
- Breadcrumb sur la page de détail
- Liens contextuels entre pages
- Boutons d'action cohérents

## 🔧 Fonctionnalités Avancées

### Duplication de Session
- Copie complète avec toutes les questions
- Nouveau nom automatique "(Copie)"
- Statut remis à "brouillon"
- Nouveaux IDs générés

### Calcul Automatique du Score
- Recalcul automatique à chaque modification de question
- Mise à jour en temps réel du maximum
- Affichage de la moyenne par question

### Recherche et Filtrage
- Recherche textuelle dans les noms de sessions
- Filtrage par cours et statut
- Recherche dans les énoncés et choix de questions

## 📊 Données de Test

### Sessions d'Exemple
1. **Mathématiques** - Interrogation sur les fonctions (3 questions, 20 pts)
2. **Français** - Quiz grammaire (2 questions, 15 pts)
3. **Histoire** - Contrôle Révolution française (3 questions, 25 pts)

### Cours par Défaut
- Mathématiques (Sciences, 4 crédits)
- Français (Lettres, 4 crédits)
- Histoire-Géographie (Sciences Humaines, 3 crédits)
- Anglais (Langues, 3 crédits)
- Physique-Chimie (Sciences, 4 crédits)
- SVT (Sciences, 3 crédits)
- Philosophie (Lettres, 2 crédits)
- EPS (Sport, 2 crédits)

## 🚀 Utilisation

### Workflow Typique
1. **Créer un cours** (si nécessaire)
2. **Créer une session** et l'associer au cours
3. **Ajouter des questions** avec leurs choix et points
4. **Passer en statut "active"** quand prêt
5. **Gérer les questions** via le DataTable de détail
6. **Marquer "terminée"** après utilisation

### Bonnes Pratiques
- Utiliser des noms de sessions descriptifs
- Équilibrer les points entre questions
- Tester les questions avant activation
- Archiver les anciennes sessions

## 🔒 Sécurité et Validation

### Validation Côté Client
- Champs obligatoires vérifiés
- Format des données contrôlé
- Cohérence des choix de réponses
- Points numériques positifs

### Gestion d'Erreurs
- Messages d'erreur explicites
- Confirmation pour suppressions
- Validation avant soumission
- États de chargement affichés

## 📈 Performance

### Optimisations
- Persistance localStorage pour rapidité
- Recalculs automatiques optimisés
- Composants React mémorisés
- Filtrage côté client efficace

### Limitations Actuelles
- Pas de pagination (toutes données en mémoire)
- Stockage local limité (5-10MB)
- Pas de synchronisation multi-utilisateurs

## 🔮 Évolutions Futures

### Fonctionnalités Prévues
- **Import/Export** des sessions en JSON/CSV
- **Templates** de questions réutilisables
- **Catégories** de questions par difficulté
- **Timer** pour les sessions chronométrées
- **Randomisation** de l'ordre des questions
- **Statistiques** détaillées des résultats

### Migration API
- Remplacement du localStorage par API REST
- Authentification et autorisation
- Synchronisation temps réel
- Sauvegarde cloud

## 📝 Types et Interfaces

### Énumérations
```typescript
export const SESSION_STATUTS = [
  { value: 'brouillon', label: 'Brouillon', color: 'gray' },
  { value: 'active', label: 'Active', color: 'green' },
  { value: 'terminee', label: 'Terminée', color: 'blue' },
  { value: 'archivee', label: 'Archivée', color: 'red' }
] as const;
```

### Types Utilitaires
```typescript
export interface SessionWithCours extends Session {
  cours?: Cours;
}

export interface CreateSessionData extends Omit<Session, '_id' | 'questions' | 'maximum'> {
  questions?: Omit<Question, '_id'>[];
}

export interface CreateQuestionData extends Omit<Question, '_id'> {}
```

---

## 🎉 Résumé

Le système de gestion des sessions est maintenant **entièrement fonctionnel** avec :

✅ **CRUD complet** pour sessions et questions  
✅ **Interface moderne** avec DataTables et modals  
✅ **Validation robuste** côté client  
✅ **Persistance automatique** en localStorage  
✅ **Données de test** pour démarrage rapide  
✅ **Architecture extensible** pour futures évolutions  

Le système est prêt pour la production et peut être facilement étendu avec de nouvelles fonctionnalités selon les besoins pédagogiques.
