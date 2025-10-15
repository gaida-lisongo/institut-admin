"use client";

import { useState, useMemo } from "react";
import { 
    Search, 
    Filter, 
    Users, 
    RefreshCw,
    SortAsc,
    SortDesc,
    ChevronDown
} from "lucide-react";
import { Etudiant } from "@/types/etudiant";
import { Product } from "@/app/(admin)/(coge)/paiements/[slug]/page";
import StudentPaymentCard from "./StudentPaymentCard";

interface PaymentStatus {
    etudiantId: string;
    status: 'PAID' | 'PENDING' | 'UNPAID';
    amount?: number;
    date?: string;
}

interface StudentPaymentGridProps {
    etudiants: Etudiant[];
    product: Product;
    paymentStatuses: PaymentStatus[];
    mode: 'commande' | 'paiement';
    onAction: (etudiant: Etudiant, action: 'commande' | 'paiement') => Promise<void>;
    onViewDetails?: (etudiant: Etudiant) => void;
    loading?: boolean;
    onRefresh?: () => void;
    stats?: {
        totalPayments: number;
        totalPaymentsAmount: number;
        totalPaymentsOk: number;
        totalPaymentsPending: number;
        totalPaymentsNo: number;
    };
    onCheck?: (etudiant: Etudiant) => void;
}

type SortField = 'nom' | 'matricule' | 'status' | 'date';
type SortOrder = 'asc' | 'desc';

const StudentPaymentGrid = ({
    etudiants,
    product,
    paymentStatuses,
    mode,
    onAction,
    onViewDetails,
    loading = false,
    onRefresh,
    stats,
    onCheck
}: StudentPaymentGridProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'PAID' | 'PENDING' | 'UNPAID'>('ALL');
    const [sortField, setSortField] = useState<SortField>('nom');
    const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
    const [showFilters, setShowFilters] = useState(false);

    const getPaymentStatus = (etudiantId: string) => {
        return paymentStatuses.find(ps => ps.etudiantId === etudiantId);
    };

    const filteredAndSortedEtudiants = useMemo(() => {
        let filtered = etudiants.filter((etudiant: any) => {
            const matchesSearch = 
                etudiant.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                etudiant.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                etudiant.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                etudiant.nomComplet?.toLowerCase().includes(searchTerm.toLowerCase());

            if (filterStatus === 'ALL') return matchesSearch;

            const status = getPaymentStatus(etudiant._id);
            return matchesSearch && status?.status === filterStatus;
        });

        // Tri
        filtered.sort((a: any, b: any) => {
            let aValue, bValue;

            switch (sortField) {
                case 'nom':
                    aValue = (a.nomComplet || `${a.prenom} ${a.nom}`).toLowerCase();
                    bValue = (b.nomComplet || `${b.prenom} ${b.nom}`).toLowerCase();
                    break;
                case 'matricule':
                    aValue = a.matricule?.toLowerCase() || '';
                    bValue = b.matricule?.toLowerCase() || '';
                    break;
                case 'status':
                    aValue = getPaymentStatus(a._id)?.status || 'UNPAID';
                    bValue = getPaymentStatus(b._id)?.status || 'UNPAID';
                    break;
                case 'date':
                    aValue = getPaymentStatus(a._id)?.date || '';
                    bValue = getPaymentStatus(b._id)?.date || '';
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });

        return filtered;
    }, [etudiants, searchTerm, filterStatus, sortField, sortOrder, paymentStatuses]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('asc');
        }
    };

    const resetFilters = () => {
        setSearchTerm("");
        setFilterStatus("ALL");
        setSortField('nom');
        setSortOrder('asc');
    };

    const getStatusCount = (status: 'PAID' | 'PENDING' | 'UNPAID') => {
        return paymentStatuses.filter(ps => ps.status === status).length;
    };

    return (
        <div className="space-y-6">
            {/* Header avec statistiques */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Gestion des {mode === 'commande' ? 'commandes' : 'paiements'}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            {filteredAndSortedEtudiants.length} étudiant{filteredAndSortedEtudiants.length > 1 ? 's' : ''} 
                            {searchTerm || filterStatus !== 'ALL' ? ` (filtré${filteredAndSortedEtudiants.length > 1 ? 's' : ''})` : ''}
                        </p>
                    </div>

                    {/* Statistiques rapides */}
                    <div className="flex gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                {stats?.totalPaymentsOk}
                            </div>
                            <div className="text-xs text-gray-500">Payés</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                                {stats?.totalPaymentsPending}
                            </div>
                            <div className="text-xs text-gray-500">En attente</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                                {stats?.totalPaymentsNo}
                            </div>
                            <div className="text-xs text-gray-500">Non payés</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Barre de recherche et filtres */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Recherche */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un étudiant (nom, prénom, matricule)..."
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Contrôles */}
                    <div className="flex gap-2">
                        {/* Filtre par statut */}
                        <select
                            className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                        >
                            <option value="ALL">Tous les statuts</option>
                            <option value="PAID">Payés</option>
                            <option value="PENDING">En attente</option>
                            <option value="UNPAID">Non payés</option>
                        </select>

                        {/* Tri */}
                        <div className="relative">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                            >
                                <Filter className="w-4 h-4" />
                                Trier
                                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                            </button>

                            {showFilters && (
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-10">
                                    <div className="p-2 space-y-1">
                                        {[
                                            { field: 'nom' as SortField, label: 'Nom' },
                                            { field: 'matricule' as SortField, label: 'Matricule' },
                                            { field: 'status' as SortField, label: 'Statut' },
                                            { field: 'date' as SortField, label: 'Date' }
                                        ].map(({ field, label }) => (
                                            <button
                                                key={field}
                                                onClick={() => handleSort(field)}
                                                className={`w-full px-3 py-2 text-left rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors flex items-center justify-between ${
                                                    sortField === field ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                            >
                                                {label}
                                                {sortField === field && (
                                                    sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                        {/* Actualiser */}
                        {onRefresh && (
                            <button
                                onClick={onRefresh}
                                disabled={loading}
                                className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                            </button>
                        )}

                        {/* Reset */}
                        {(searchTerm || filterStatus !== 'ALL' || sortField !== 'nom' || sortOrder !== 'asc') && (
                            <button
                                onClick={resetFilters}
                                className="px-4 py-2.5 bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg transition-colors"
                            >
                                Reset
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Liste des étudiants - Pleine largeur */}
            {filteredAndSortedEtudiants.length > 0 ? (
                <div className="space-y-4">
                    {filteredAndSortedEtudiants.map((etudiant: any) => (
                        <StudentPaymentCard
                            key={etudiant._id}
                            etudiant={etudiant}
                            product={product}
                            paymentStatus={getPaymentStatus(etudiant._id)}
                            mode={mode}
                            onAction={onAction}
                            onViewDetails={onViewDetails}
                            loading={loading}
                            className="w-full"
                        />
                    ))}
                </div>
            ) : (
                /* État vide */
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        Aucun étudiant trouvé
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {searchTerm || filterStatus !== 'ALL' 
                            ? "Aucun étudiant ne correspond à vos critères de recherche."
                            : "Aucun étudiant inscrit pour ce produit."
                        }
                    </p>
                    {(searchTerm || filterStatus !== 'ALL') && (
                        <button
                            onClick={resetFilters}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            Réinitialiser les filtres
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentPaymentGrid;
