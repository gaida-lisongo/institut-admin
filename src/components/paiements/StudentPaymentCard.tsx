"use client";

import { useState } from "react";
import { 
    CreditCard, 
    Download, 
    User, 
    Mail, 
    Phone, 
    MapPin, 
    Calendar,
    DollarSign,
    CheckCircle,
    Clock,
    XCircle,
    Loader2,
    ShoppingCart,
    Receipt,
    Eye,
    FileText
} from "lucide-react";
import { Etudiant } from "@/types/etudiant";
import { Product } from "@/app/(admin)/(coge)/paiements/[slug]/page";

interface PaymentStatus {
    etudiantId: string;
    status: 'PAID' | 'PENDING' | 'UNPAID';
    amount?: number;
    date?: string;
}

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

const StudentPaymentCard = ({
    etudiant,
    product,
    paymentStatus,
    mode,
    onAction,
    onViewDetails,
    loading = false,
    className = ""
}: StudentPaymentCardProps) => {
    const [isProcessing, setIsProcessing] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CDF'
        }).format(amount);
    };

    const getStatusConfig = (status?: 'PAID' | 'PENDING' | 'UNPAID') => {
        if (!status) return null;
        
        const configs = {
            PAID: {
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                text: 'text-emerald-700 dark:text-emerald-400',
                border: 'border-emerald-200 dark:border-emerald-800',
                icon: CheckCircle,
                label: 'Payé',
                iconColor: 'text-emerald-500'
            },
            PENDING: {
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                text: 'text-amber-700 dark:text-amber-400',
                border: 'border-amber-200 dark:border-amber-800',
                icon: Clock,
                label: 'En attente',
                iconColor: 'text-amber-500'
            },
            UNPAID: {
                bg: 'bg-rose-50 dark:bg-rose-900/20',
                text: 'text-rose-700 dark:text-rose-400',
                border: 'border-rose-200 dark:border-rose-800',
                icon: XCircle,
                label: 'Non payé',
                iconColor: 'text-rose-500'
            }
        };

        return configs[status];
    };

    const handleAction = async () => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        try {
            await onAction(etudiant, mode);
        } catch (error) {
            console.error('Erreur lors de l\'action:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const statusConfig = getStatusConfig(paymentStatus?.status);
    const StatusIcon = statusConfig?.icon;

    return (
        <div className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 ${className}`}>
            {/* Status Badge */}
            {/* {statusConfig && (
                <div className={`absolute top-4 right-4 z-10 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                    {StatusIcon && <StatusIcon className={`w-3.5 h-3.5 ${statusConfig.iconColor}`} />}
                    {statusConfig.label}
                </div>
            )} */}

            {/* Header avec photo et infos principales */}
            <div className="relative p-6 pb-4">
                <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {etudiant.prenom?.charAt(0)?.toUpperCase()}{etudiant.nom?.charAt(0)?.toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    {/* Infos principales */}
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1 truncate">
                            {etudiant.nomComplet || `${etudiant.prenom} ${etudiant.nom}`}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <FileText className="w-4 h-4" />
                            <span className="font-mono">{etudiant.matricule}</span>
                        </div>
                        {(etudiant as any).id && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                <span>ID: {(etudiant as any).id}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Détails étudiant */}
            <div className="px-6 pb-4 space-y-3">
                {etudiant.nationalite && (
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                            <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                            <span className="text-gray-600 dark:text-gray-400">Nationalité</span>
                            <p className="font-medium text-gray-900 dark:text-white">{etudiant.nationalite}</p>
                        </div>
                    </div>
                )}

                {etudiant.lieu_naissance && (
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                            <MapPin className="w-4 h-4 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="flex-1">
                            <span className="text-gray-600 dark:text-gray-400">Lieu de naissance</span>
                            <p className="font-medium text-gray-900 dark:text-white">{etudiant.lieu_naissance}</p>
                        </div>
                    </div>
                )}

                {etudiant.sexe && (
                    <div className="flex items-center gap-3 text-sm">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                            <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                            <span className="text-gray-600 dark:text-gray-400">Sexe</span>
                            <p className="font-medium text-gray-900 dark:text-white">{etudiant.sexe}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Section paiement */}
            <div className="px-6 pb-4">
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Montant à payer
                            </span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">
                            {formatCurrency(product.montant)}
                        </span>
                    </div>

                    {paymentStatus?.date && (
                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                <span className="text-gray-600 dark:text-gray-400">Date de paiement</span>
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">
                                {new Date(paymentStatus.date).toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="px-6 pb-6">
                <div className="flex gap-3">
                    {/* Action principale */}
                    <button
                        onClick={handleAction}
                        disabled={isProcessing || loading}
                        className={`flex-1 py-3 px-4 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                            mode === 'commande'
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-xl'
                                : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl'
                        } disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-[1.02]`}
                    >
                        {isProcessing || loading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : mode === 'commande' ? (
                            <>
                                <ShoppingCart className="w-4 h-4" />
                                Bon de commande
                            </>
                        ) : (
                            <>
                                <CreditCard className="w-4 h-4" />
                                Effectuer paiement
                            </>
                        )}
                    </button>

                    {/* Action secondaire */}
                    {/* {onViewDetails && (
                        <button
                            onClick={() => onViewDetails(etudiant)}
                            className="px-4 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl transition-colors duration-200 flex items-center justify-center"
                        >
                            <Eye className="w-4 h-4" />
                        </button>
                    )} */}
                </div>
            </div>

            {/* Effet de hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl" />
        </div>
    );
};

export default StudentPaymentCard;
