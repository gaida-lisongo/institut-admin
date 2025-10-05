# 📚 Documentation - Système de Gestion des Groupes

## 🎯 Vue d'Ensemble

Le système de gestion des groupes permet d'assigner des sessions d'interrogation à des groupes d'étudiants, de suivre leurs résolutions et de générer des rapports détaillés.

## 🏗️ Architecture

### Types TypeScript

```typescript
interface Groupe {
  _id: string;
  designation: string;
  sessionId: string;
  resolutions: Resolution[];
  dateCreation: Date;
  dateOuverture?: Date;
  dateFermeture?: Date;
  statut: 'brouillon' | 'ouvert' | 'ferme' | 'archive';
  description?: string;
  dureeMaximale?: number;
  tentativesMax?: number;
}

interface Resolution {
  etudiantId: string;
  reponses: Reponse[];
  note: number;
  statut: 'non_commence' | 'en_cours' | 'termine' | 'corrige';
  dateDebut?: Date;
  dateFin?: Date;
  tempsEcoule?: number;
}

interface Reponse {
  questionId: string;
  reponse: string;
  note: number;
  statut: 'non_repondu' | 'en_cours' | 'soumis' | 'corrige';
}
```

### Store Zustand

Le `groupeStore` gère :
- **CRUD des groupes** : Création, lecture, mise à jour, suppression
- **Gestion des étudiants** : Ajout/suppression d'étudiants dans les groupes
- **Gestion des résolutions** : Suivi des réponses et calcul des notes
- **Statistiques** : Calculs en temps réel des performances
- **Utilitaires** : Génération de slugs, gestion des erreurs

## 📱 Pages et Fonctionnalités

### 1. Page Principale (`/groupes`)

**Fonctionnalités :**
- ✅ DataTable avec recherche et filtrage
- ✅ Statistiques visuelles (groupes, participants, moyennes)
- ✅ CRUD complet des groupes
- ✅ Duplication de groupes
- ✅ Changement de statut en temps réel
- ✅ Filtrage par session et statut

**Composants :**
- `GroupeModal` - Modal CRUD avec validation
- `GroupeTestDataButton` - Données de test (dev)

### 2. Page Détail (`/groupes/[slug]`)

**Fonctionnalités :**
- ✅ Vue détaillée du groupe avec statistiques
- ✅ Gestion des participants (ajout/suppression)
- ✅ Visualisation des résultats avec classement
- ✅ Export Excel du palmarès
- ✅ Génération PDF avec QR codes
- ✅ Changement de statut du groupe

**Composants :**
- `EtudiantSelectionModal` - Sélection multiple d'étudiants
- `ResultatsViewer` - Visualisation détaillée des résultats
- `ExportPalmaresButton` - Export Excel avec ExcelJS
- `GeneratePDFButton` - Génération PDF avec PDFMake et QR codes

## 🔧 Fonctionnalités Avancées

### Export Excel (ExcelJS)

```typescript
// Fonctionnalités incluses :
- Palmarès trié par note
- Statistiques complètes
- Mise en forme conditionnelle
- Graphiques de performance
- Métadonnées du groupe
```

### Génération PDF (PDFMake + QRCode)

```typescript
// Chaque étudiant reçoit :
- Fiche personnalisée avec ses informations
- Détails du travail et instructions
- QR code unique pour accès direct
- Espace pour notes manuscrites
- Informations de traçabilité
```

### Système de QR Codes

```typescript
const qrCodeData = {
  groupeId: string,
  etudiantId: string,
  sessionId: string,
  timestamp: number
};
```

## 📊 Statistiques et Métriques

### Statistiques Globales
- **Total groupes** : Nombre total de groupes créés
- **Groupes actifs** : Groupes avec statut "ouvert"
- **Total participants** : Somme des étudiants dans tous les groupes
- **Moyenne générale** : Moyenne des notes de tous les groupes
- **Taux de réussite** : Pourcentage de participants ayant terminé

### Statistiques par Groupe
- **Participants** : Nombre d'étudiants assignés
- **Terminés** : Nombre de résolutions complétées
- **Moyenne groupe** : Moyenne des notes du groupe
- **Temps total** : Temps cumulé de tous les participants

## 🎨 Interface Utilisateur

### Design System
- **Couleurs** : Palette cohérente avec le système existant
- **Icons** : SVG optimisés pour chaque action
- **Responsive** : Interface adaptative mobile-first
- **Mode sombre** : Support complet du thème sombre

### Navigation
- **MainNavigation** : Onglet "Groupes" intégré
- **Breadcrumbs** : Navigation contextuelle
- **Actions rapides** : Boutons d'action visibles

## 🔄 Workflow Utilisateur

### Création d'un Groupe
1. **Créer le groupe** → Assigner une session
2. **Ajouter des étudiants** → Sélection multiple
3. **Configurer les paramètres** → Durée, tentatives
4. **Ouvrir le groupe** → Changement de statut
5. **Générer les documents** → PDF avec QR codes

### Suivi des Résultats
1. **Visualiser les résultats** → Tableau de bord en temps réel
2. **Analyser les performances** → Statistiques détaillées
3. **Exporter le palmarès** → Fichier Excel formaté
4. **Archiver le groupe** → Changement de statut final

## 📋 Validation et Sécurité

### Validation Côté Client
- **Champs obligatoires** : Désignation, session
- **Contraintes métier** : Durée positive, tentatives ≥ 1
- **Unicité** : Pas de doublon d'étudiant dans un groupe
- **Cohérence** : Vérification des relations entre entités

### Gestion d'Erreurs
- **Messages contextuels** : Erreurs spécifiques par champ
- **Rollback automatique** : Annulation en cas d'échec
- **Logs détaillés** : Traçabilité des opérations

## 🚀 Installation et Configuration

### Dépendances Requises
```json
{
  "exceljs": "^4.4.0",
  "pdfmake": "^0.2.10", 
  "qrcode": "^1.5.3",
  "@types/qrcode": "^1.5.5"
}
```

### Installation
```bash
npm install exceljs pdfmake qrcode @types/qrcode
```

### Configuration
Les groupes utilisent la même configuration que les autres modules :
- **LocalStorage** : Persistance automatique
- **Zustand** : État global réactif
- **TypeScript** : Typage strict

## 🔮 Évolutions Futures

### Fonctionnalités Prévues
- **Notifications temps réel** : WebSocket pour le suivi live
- **Correction automatique** : IA pour les questions ouvertes
- **Analytics avancés** : Graphiques de progression
- **Intégration calendrier** : Planification des sessions
- **API REST** : Backend pour synchronisation multi-utilisateurs

### Améliorations Techniques
- **Optimisation performances** : Pagination des gros groupes
- **Cache intelligent** : Mise en cache des calculs lourds
- **Compression** : Optimisation des exports volumineux
- **Accessibilité** : Support complet WCAG 2.1

## 📁 Structure des Fichiers

```
src/
├── types/groupe.ts              # Types TypeScript
├── stores/groupeStore.ts        # Store Zustand
├── app/(admin)/(titulaire)/
│   └── groupes/
│       ├── page.tsx            # Page principale
│       └── [slug]/page.tsx     # Page détail
└── components/groupes/
    ├── GroupeModal.tsx         # Modal CRUD
    ├── GroupeTestDataButton.tsx # Données test
    ├── EtudiantSelectionModal.tsx # Sélection étudiants
    ├── ResultatsViewer.tsx     # Visualisation résultats
    ├── ExportPalmaresButton.tsx # Export Excel
    └── GeneratePDFButton.tsx   # Génération PDF
```

## 🎉 Système Opérationnel

Le système de gestion des groupes est **entièrement fonctionnel** avec :

✅ **CRUD complet** des groupes avec validation  
✅ **Gestion avancée** des étudiants et résolutions  
✅ **Exports professionnels** Excel et PDF  
✅ **QR codes** pour accès direct des étudiants  
✅ **Statistiques temps réel** et tableaux de bord  
✅ **Interface moderne** et responsive  
✅ **Intégration parfaite** avec le système existant  

Le module est prêt pour la production et peut être étendu selon les besoins pédagogiques spécifiques ! 🚀
