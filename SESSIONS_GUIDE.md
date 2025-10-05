# Guide de Démarrage - Système de Sessions

## 🚀 Démarrage Rapide

### 1. Accéder aux Sessions
- **Page principale** : `/sessions`
- **Détail session** : `/sessions/[id]`

### 2. Première utilisation
1. Les **cours par défaut** sont créés automatiquement
2. Cliquez sur **"Charger sessions test"** (mode dev) pour des exemples
3. Ou créez votre première session avec **"Créer une session"**

## 📝 Créer une Session

### Étapes
1. **Cliquer** sur "Créer une session"
2. **Remplir** le formulaire :
   - Nom de la session (ex: "Interrogation Chapitre 1")
   - Sélectionner un cours
   - Choisir le statut (brouillon par défaut)
3. **Valider** pour créer la session vide

### Ajouter des Questions
1. **Cliquer** sur "Détails" de la session
2. **Cliquer** sur "Ajouter une question"
3. **Remplir** le formulaire question :
   - Énoncé (multi-lignes possible)
   - Choix de réponses (minimum 2)
   - Cocher la bonne réponse
   - Attribuer des points

## 🎯 Fonctionnalités Clés

### Gestion des Sessions
- ✅ **Créer** une nouvelle session
- ✅ **Modifier** les détails d'une session
- ✅ **Dupliquer** une session complète
- ✅ **Supprimer** une session
- ✅ **Changer le statut** (brouillon → active → terminée)

### Gestion des Questions
- ✅ **Ajouter** des questions à une session
- ✅ **Modifier** les questions existantes
- ✅ **Supprimer** des questions
- ✅ **Énoncé multi-lignes** pour questions complexes
- ✅ **Choix multiples** avec validation
- ✅ **Points décimaux** (0.5, 1, 1.5, etc.)

### Recherche et Filtrage
- 🔍 **Recherche textuelle** dans les sessions
- 📚 **Filtrage par cours**
- 🏷️ **Filtrage par statut**
- 🔎 **Recherche dans les questions** (page détail)

## 📊 Interface

### Page Sessions
```
┌─────────────────────────────────────────────────────────┐
│ Gestion des Sessions                    [Créer session] │
├─────────────────────────────────────────────────────────┤
│ [Recherche...] [Cours ▼] [Statut ▼]                    │
├─────────────────────────────────────────────────────────┤
│ 📊 Total: 5  📝 Brouillon: 2  ✅ Active: 1  📋 Term: 2  │
├─────────────────────────────────────────────────────────┤
│ Session              │ Cours      │ Statut │ Questions  │
│ Interro Chapitre 1   │ Maths      │ Active │ 3 (20pts) │
│ Quiz Grammaire       │ Français   │ Brouil │ 2 (15pts) │
└─────────────────────────────────────────────────────────┘
```

### Page Détail Session
```
┌─────────────────────────────────────────────────────────┐
│ Sessions > Interrogation Chapitre 1                    │
├─────────────────────────────────────────────────────────┤
│ Interrogation Chapitre 1        [Ajouter une question] │
│ Cours: Mathématiques  Statut: [Active ▼]  Max: 20 pts  │
├─────────────────────────────────────────────────────────┤
│ 📊 Questions: 3  📈 Score: 20pts  📊 Moyenne: 6.7pts    │
├─────────────────────────────────────────────────────────┤
│ Question              │ Choix │ Réponse    │ Points     │
│ Question 1: Définir.. │ 4     │ Choix B    │ 5 pts     │
│ Question 2: Calculer..│ 4     │ Choix B    │ 3 pts     │
└─────────────────────────────────────────────────────────┘
```

## 🎨 Statuts des Sessions

| Statut | Couleur | Description |
|--------|---------|-------------|
| 🔘 **Brouillon** | Gris | Session en cours de création |
| ✅ **Active** | Vert | Session disponible pour les étudiants |
| 📋 **Terminée** | Bleu | Session fermée, résultats disponibles |
| 📦 **Archivée** | Rouge | Session archivée |

## 💡 Conseils d'Utilisation

### Bonnes Pratiques
1. **Nommage** : Utilisez des noms descriptifs
   - ✅ "Interrogation Chapitre 3 - Les fonctions"
   - ❌ "Test 1"

2. **Points** : Équilibrez les points entre questions
   - Questions faciles : 1-2 points
   - Questions moyennes : 3-5 points
   - Questions difficiles : 5-10 points

3. **Workflow** :
   - Créer en "brouillon"
   - Ajouter toutes les questions
   - Tester et réviser
   - Passer en "active"
   - Marquer "terminée" après usage

### Validation Automatique
- ✅ Minimum 2 choix par question
- ✅ Une seule bonne réponse
- ✅ Points > 0
- ✅ Énoncé non vide
- ✅ Recalcul automatique du score maximum

## 🔧 Données de Test

### Sessions Incluses
1. **Mathématiques** - Interrogation sur les fonctions
   - 3 questions, 20 points total
   - Statut : Active

2. **Français** - Quiz grammaire
   - 2 questions, 15 points total
   - Statut : Brouillon

3. **Histoire** - Contrôle Révolution française
   - 3 questions, 25 points total
   - Statut : Terminée

### Cours Disponibles
- Mathématiques (Sciences, 4 crédits)
- Français (Lettres, 4 crédits)
- Histoire-Géographie (Sciences Humaines, 3 crédits)
- Anglais (Langues, 3 crédits)
- Physique-Chimie (Sciences, 4 crédits)
- SVT (Sciences, 3 crédits)
- Philosophie (Lettres, 2 crédits)
- EPS (Sport, 2 crédits)

## 🚨 Dépannage

### Problèmes Courants

**"Aucune session trouvée"**
- Vérifiez les filtres actifs
- Cliquez sur "Charger sessions test" (mode dev)
- Créez votre première session

**"Cours inconnu"**
- Les cours sont initialisés automatiquement
- Vérifiez dans la console s'il y a des erreurs
- Rechargez la page

**"Erreur lors de l'ajout de question"**
- Vérifiez que tous les champs sont remplis
- Au moins 2 choix de réponse requis
- Points > 0 requis

## 📱 Navigation

### Raccourcis Clavier
- `Ctrl + N` : Nouvelle session (si focus sur la page)
- `Escape` : Fermer les modals
- `Enter` : Valider les formulaires

### Liens Rapides
- **Sessions** : `/sessions`
- **Étudiants** : `/etudiants`
- **Classes** : `/classe`

---

## ✅ Système Prêt !

Le système de sessions est maintenant opérationnel avec :
- Interface intuitive et moderne
- Validation complète des données
- Persistance automatique
- Données de test pour démarrage rapide

**Commencez dès maintenant** en créant votre première session ! 🎉
