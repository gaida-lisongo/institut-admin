# Composants de Paiement Réutilisables

Ce dossier contient une suite de composants modernes et réutilisables pour la gestion des paiements et commandes étudiants.

## Composants

### 1. StudentPaymentCard
Carte individuelle moderne pour afficher un étudiant avec ses informations de paiement.

**Fonctionnalités :**
- Design moderne avec dégradés et animations
- Badge de statut coloré (Payé/En attente/Non payé)
- Avatar avec initiales
- Informations détaillées de l'étudiant
- Section paiement avec montant formaté
- Boutons d'action adaptatifs selon le mode
- États de chargement
- Support du mode sombre

**Props :**
```typescript
interface StudentPaymentCardProps {
    etudiant: Etudiant;
    product: Product;
    paymentStatus?: PaymentStatus;
    mode: 'commande' | 'paiement';
    onAction: (etudiant: Etudiant, action: 'commande' | 'paiement') => Promise<void>;
    onViewDetails?: (etudiant: Etudiant) => void;
    loading?: boolean;
    className?: string;
}
```

### 2. StudentPaymentGrid
Composant de grille avec fonctionnalités avancées de recherche, filtrage et tri.

**Fonctionnalités :**
- Recherche en temps réel
- Filtrage par statut de paiement
- Tri par nom, matricule, statut, date
- Deux modes d'affichage (grille/liste)
- Statistiques rapides
- Bouton d'actualisation
- Reset des filtres
- État vide avec message informatif

**Props :**
```typescript
interface StudentPaymentGridProps {
    etudiants: Etudiant[];
    product: Product;
    paymentStatuses: PaymentStatus[];
    mode: 'commande' | 'paiement';
    onAction: (etudiant: Etudiant, action: 'commande' | 'paiement') => Promise<void>;
    onViewDetails?: (etudiant: Etudiant) => void;
    loading?: boolean;
    onRefresh?: () => void;
}
```

### 3. PaiementsListModern
Composant complet intégrant la grille avec la logique métier.

**Fonctionnalités :**
- Gestion complète des commandes et paiements
- Intégration avec l'API
- Génération de PDF de factures
- Gestion des états de chargement
- Actualisation des données
- Gestion d'erreurs

## Utilisation

### Exemple basique
```tsx
import StudentPaymentCard from '@/components/paiements/StudentPaymentCard';

const handleAction = async (etudiant: Etudiant, action: 'commande' | 'paiement') => {
    // Logique de traitement
};

<StudentPaymentCard
    etudiant={etudiant}
    product={product}
    paymentStatus={paymentStatus}
    mode="commande"
    onAction={handleAction}
/>
```

### Exemple avec grille complète
```tsx
import StudentPaymentGrid from '@/components/paiements/StudentPaymentGrid';

<StudentPaymentGrid
    etudiants={etudiants}
    product={product}
    paymentStatuses={paymentStatuses}
    mode="paiement"
    onAction={handleAction}
    onViewDetails={handleViewDetails}
    onRefresh={handleRefresh}
/>
```

### Exemple d'intégration complète
```tsx
import PaiementsListModern from '@/components/paiements/PaiementsListModern';

<PaiementsListModern
    product={product}
    view="commande"
/>
```

## Personnalisation

### Thèmes
Tous les composants supportent le mode sombre automatiquement via les classes Tailwind `dark:`.

### Couleurs de statut
- **Payé** : Vert (emerald)
- **En attente** : Ambre (amber)
- **Non payé** : Rose (rose)

### Icônes
Les composants utilisent Lucide React pour les icônes :
- `CreditCard` : Paiement
- `ShoppingCart` : Commande
- `CheckCircle` : Payé
- `Clock` : En attente
- `XCircle` : Non payé

## Responsive Design

Les composants sont entièrement responsives :
- **Mobile** : 1 colonne
- **Tablet** : 2 colonnes
- **Desktop** : 3 colonnes
- **Large Desktop** : 4 colonnes

## États de chargement

Tous les composants gèrent les états de chargement avec :
- Spinners animés
- Désactivation des boutons
- Messages informatifs

## Accessibilité

- Navigation clavier supportée
- Contrastes appropriés
- Labels descriptifs
- États focus visibles

## Performance

- Mémorisation des calculs avec `useMemo`
- Tri et filtrage optimisés
- Lazy loading des images
- Animations CSS performantes
