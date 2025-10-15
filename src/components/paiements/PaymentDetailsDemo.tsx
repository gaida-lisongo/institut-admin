"use client";

import { useState } from "react";
import { 
    User,
    CreditCard,
    CheckCircle,
    Clock,
    XCircle
} from "lucide-react";

// Données de démonstration
const mockPaymentData = {
    etudiant: {
        _id: "1",
        nomComplet: "Jean Dupont",
        matricule: "ETU001",
        nationalte: "Française",
        lieu_naissance: "Paris",
        sexe: "M",
        date_naissance: "1995-05-15",
        payments: [{
            _id: "payment1",
            status: 'PENDING' as const,
            amount: 150000,
            orderNumber: "INV-123456789",
            produitId: "prod1",
            createdAt: "2024-10-15T08:00:00Z",
            updatedAt: "2024-10-15T10:30:00Z"
        }]
    }
};

const PaymentDetailsDemo = () => {
    const [paymentData, setPaymentData] = useState(mockPaymentData);

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
                color: 'emerald'
            },
            PENDING: {
                bg: 'bg-amber-50 dark:bg-amber-900/20',
                text: 'text-amber-700 dark:text-amber-400',
                border: 'border-amber-200 dark:border-amber-800',
                label: 'En attente',
                color: 'amber'
            },
            NO: {
                bg: 'bg-rose-50 dark:bg-rose-900/20',
                text: 'text-rose-700 dark:text-rose-400',
                border: 'border-rose-200 dark:border-rose-800',
                label: 'Rejeté',
                color: 'rose'
            }
        };
        return configs[status];
    };

    const updatePaymentStatus = (status: 'OK' | 'PENDING' | 'NO') => {
        setPaymentData(prev => ({
            ...prev,
            etudiant: {
                ...prev.etudiant,
                payments: [{
                    ...prev.etudiant.payments[0],
                    status,
                    updatedAt: new Date().toISOString()
                }]
            }
        }));
        alert(`Statut mis à jour vers: ${status}`);
    };

    const { etudiant } = paymentData;
    const payment = etudiant.payments[0];
    const statusConfig = getStatusConfig(payment.status);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Détails du Paiement - Démo
                        </h2>
                    </div>

                    {/* Statut actuel */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} border`}>
                        <div className={`w-2 h-2 rounded-full bg-${statusConfig.color}-500`}></div>
                        {statusConfig.label}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Informations Étudiant */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Informations Étudiant
                        </h3>
                        
                        <div className="space-y-4">
                            {/* Avatar et nom */}
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                                    {etudiant.nomComplet?.charAt(0)?.toUpperCase() || 'E'}
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-900 dark:text-white">
                                        {etudiant.nomComplet}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                                        {etudiant.matricule}
                                    </p>
                                </div>
                            </div>

                            {/* Détails */}
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Sexe:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{etudiant.sexe}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">Nationalité:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{etudiant.nationalte}</p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-600 dark:text-gray-400">Lieu de naissance:</span>
                                    <p className="font-medium text-gray-900 dark:text-white">{etudiant.lieu_naissance}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Informations Paiement */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            Détails du Paiement
                        </h3>
                        
                        <div className="space-y-4">
                            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Montant</span>
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(payment.amount)}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">N° Commande:</span>
                                    <span className="font-mono font-medium text-gray-900 dark:text-white">
                                        {payment.orderNumber}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Date création:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(payment.createdAt)}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Dernière MAJ:</span>
                                    <span className="font-medium text-gray-900 dark:text-white">
                                        {formatDate(payment.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions de validation */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-purple-600" />
                        Validation du Paiement
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Bouton Valider */}
                        <button
                            onClick={() => updatePaymentStatus('OK')}
                            disabled={payment.status === 'OK'}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                payment.status === 'OK'
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl'
                            }`}
                        >
                            <CheckCircle className="w-5 h-5" />
                            {payment.status === 'OK' ? 'Déjà Validé' : 'Valider le Paiement'}
                        </button>

                        {/* Bouton Mettre en attente */}
                        <button
                            onClick={() => updatePaymentStatus('PENDING')}
                            disabled={payment.status === 'PENDING'}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                payment.status === 'PENDING'
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white shadow-lg hover:shadow-xl'
                            }`}
                        >
                            <Clock className="w-5 h-5" />
                            {payment.status === 'PENDING' ? 'En Attente' : 'Mettre en Attente'}
                        </button>

                        {/* Bouton Rejeter */}
                        <button
                            onClick={() => updatePaymentStatus('NO')}
                            disabled={payment.status === 'NO'}
                            className={`flex-1 py-3 px-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                payment.status === 'NO'
                                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-lg hover:shadow-xl'
                            }`}
                        >
                            <XCircle className="w-5 h-5" />
                            {payment.status === 'NO' ? 'Déjà Rejeté' : 'Rejeter le Paiement'}
                        </button>
                    </div>

                    {/* Note d'information */}
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-400 flex items-start gap-2">
                            <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center mt-0.5">
                                <span className="text-white text-xs font-bold">i</span>
                            </div>
                            <span>
                                <strong>Note:</strong> La validation d'un paiement est définitive. 
                                Assurez-vous que toutes les vérifications ont été effectuées avant de valider.
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDetailsDemo;
