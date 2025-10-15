"use client";

import { useState } from "react";
import { EtudiantWithPayments } from "./PaiementsListModern";
import { 
    XCircle,
    User,
    CreditCard,
    CheckCircle,
    Clock,
    AlertTriangle,
    Calendar,
    Hash,
    DollarSign,
    ArrowLeft
} from "lucide-react";

const PaiementValidator = ({
    payment,
    onChange,
    onReturn
}: {
    payment: EtudiantWithPayments;
    onChange?: (paymentId: string, status: 'OK' | 'PENDING' | 'NO') => void;
    onReturn?: () => void;
}) => {
    const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CDF'
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusConfig = (status: 'OK' | 'PENDING' | 'NO') => {
        const configs = {
            OK: {
                bg: 'bg-emerald-50 dark:bg-emerald-900/20',
                text: 'text-emerald-700 dark:text-emerald-400',
                border: 'border-emerald-200 dark:border-emerald-800',
                label: 'Validé',
                icon: CheckCircle,
                color: 'emerald'
            },
            PENDING: {
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                text: 'text-amber-700 dark:text-amber-400',
                border: 'border-amber-200 dark:border-amber-800',
                label: 'En attente',
                icon: Clock,
                color: 'amber'
            },
            NO: {
                bg: 'bg-rose-50 dark:bg-rose-900/20',
                text: 'text-rose-700 dark:text-rose-400',
                border: 'border-rose-200 dark:border-rose-800',
                label: 'Rejeté',
                icon: XCircle,
                color: 'rose'
            }
        };
        return configs[status];
    };

    const handleStatusChange = async (paymentId: string, newStatus: 'OK' | 'PENDING' | 'NO') => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        setSelectedPaymentId(paymentId);
        
        try {
            await onChange?.(paymentId, newStatus);
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
        } finally {
            setIsProcessing(false);
            setSelectedPaymentId(null);
        }
    };

    return (
        <div className="min-h-full bg-gray-50 dark:bg-gray-900">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onReturn}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                    Validation des Paiements
                                </h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Vérifiez et validez les paiements de l'étudiant
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Informations Étudiant */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" />
                        Informations de l'Étudiant
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Avatar et nom */}
                        <div className="flex items-center gap-4 md:col-span-2">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl">
                                {payment.nomComplet?.charAt(0)?.toUpperCase() || 'E'}
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                                    {payment.nomComplet}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    {payment.matricule}
                                </p>
                            </div>
                        </div>

                        {/* Détails */}
                        <div className="space-y-2">
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Sexe</span>
                                <p className="font-medium text-gray-900 dark:text-white">{payment.sexe}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Nationalité</span>
                                <p className="font-medium text-gray-900 dark:text-white">{payment.nationalte}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Lieu de naissance</span>
                                <p className="font-medium text-gray-900 dark:text-white">{payment.lieu_naissance}</p>
                            </div>
                            <div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date de naissance</span>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {new Date(payment.date_naissance).toLocaleDateString('fr-FR')}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Liste des Paiements */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-green-600" />
                        Paiements à Valider ({payment.payments.length})
                    </h2>

                    {payment.payments.map((paiement) => {
                        const statusConfig = getStatusConfig(paiement.status);
                        const StatusIcon = statusConfig.icon;
                        const isCurrentlyProcessing = isProcessing && selectedPaymentId === paiement._id;

                        return (
                            <div key={paiement._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                {/* Header du paiement */}
                                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${statusConfig.bg}`}>
                                                <StatusIcon className={`w-5 h-5 ${statusConfig.text}`} />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    Paiement #{paiement.orderNumber}
                                                </h3>
                                                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border mt-1`}>
                                                    <div className={`w-2 h-2 rounded-full bg-${statusConfig.color}-500`}></div>
                                                    {statusConfig.label}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(paiement.amount)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Détails du paiement */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                        <div className="flex items-center gap-3">
                                            <Hash className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">N° Commande</span>
                                                <p className="font-mono font-medium text-gray-900 dark:text-white">{paiement.orderNumber}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Date création</span>
                                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(paiement.createdAt)}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            <div>
                                                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Dernière MAJ</span>
                                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(paiement.updatedAt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions de validation */}
                                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                                            Actions de Validation
                                        </h4>
                                        
                                        <div className="flex flex-col sm:flex-row gap-3">
                                            {/* Bouton Valider */}
                                            <button
                                                onClick={() => handleStatusChange(paiement._id, 'OK')}
                                                disabled={paiement.status === 'OK' || isCurrentlyProcessing}
                                                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                                    paiement.status === 'OK'
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                        : isCurrentlyProcessing
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-wait'
                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md hover:shadow-lg'
                                                }`}
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                {paiement.status === 'OK' ? 'Déjà Validé' : isCurrentlyProcessing ? 'Traitement...' : 'Valider'}
                                            </button>

                                            {/* Bouton Mettre en attente */}
                                            <button
                                                onClick={() => handleStatusChange(paiement._id, 'PENDING')}
                                                disabled={paiement.status === 'PENDING' || isCurrentlyProcessing}
                                                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                                    paiement.status === 'PENDING'
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                        : isCurrentlyProcessing
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-wait'
                                                        : 'bg-amber-600 hover:bg-amber-700 text-white shadow-md hover:shadow-lg'
                                                }`}
                                            >
                                                <Clock className="w-4 h-4" />
                                                {paiement.status === 'PENDING' ? 'En Attente' : isCurrentlyProcessing ? 'Traitement...' : 'Attente'}
                                            </button>

                                            {/* Bouton Rejeter */}
                                            <button
                                                onClick={() => handleStatusChange(paiement._id, 'NO')}
                                                disabled={paiement.status === 'NO' || isCurrentlyProcessing}
                                                className={`flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                                    paiement.status === 'NO'
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                                        : isCurrentlyProcessing
                                                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-wait'
                                                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg'
                                                }`}
                                            >
                                                <XCircle className="w-4 h-4" />
                                                {paiement.status === 'NO' ? 'Déjà Rejeté' : isCurrentlyProcessing ? 'Traitement...' : 'Rejeter'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Note d'information */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 p-6 mt-6">
                    <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <span className="text-white text-sm font-bold">i</span>
                        </div>
                        <div>
                            <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                                Instructions de Validation
                            </h4>
                            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                <li>• <strong>Valider</strong> : Confirme que le paiement a été reçu et vérifié</li>
                                <li>• <strong>Attente</strong> : Met le paiement en attente de vérification supplémentaire</li>
                                <li>• <strong>Rejeter</strong> : Refuse le paiement (problème détecté)</li>
                            </ul>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-3 font-medium">
                                ⚠️ Attention : La validation est définitive. Vérifiez bien avant de confirmer.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaiementValidator;
