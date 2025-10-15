// Composants de paiement réutilisables
export { default as StudentPaymentCard } from './StudentPaymentCard';
export { default as StudentPaymentGrid } from './StudentPaymentGrid';
export { default as PaiementsListModern } from './PaiementsListModern';

// Composants existants
export { default as PaiementsList } from './PaiementsList';
export { default as ProductModal } from './ProductModal';
export { default as ProductDataTable } from './ProductDataTable';

// Types
export interface PaymentStatus {
    etudiantId: string;
    status: 'PAID' | 'PENDING' | 'UNPAID';
    amount?: number;
    date?: string;
}

export interface StudentPaymentCardProps {
    etudiant: any; // Etudiant type
    product: any; // Product type
    paymentStatus?: PaymentStatus;
    mode: 'commande' | 'paiement';
    onAction: (etudiant: any, action: 'commande' | 'paiement') => Promise<void>;
    onViewDetails?: (etudiant: any) => void;
    loading?: boolean;
    className?: string;
}

export interface StudentPaymentGridProps {
    etudiants: any[]; // Etudiant[] type
    product: any; // Product type
    paymentStatuses: PaymentStatus[];
    mode: 'commande' | 'paiement';
    onAction: (etudiant: any, action: 'commande' | 'paiement') => Promise<void>;
    onViewDetails?: (etudiant: any) => void;
    loading?: boolean;
    onRefresh?: () => void;
}
