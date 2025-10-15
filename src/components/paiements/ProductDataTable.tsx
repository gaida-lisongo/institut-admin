"use client";

import { useState } from 'react';
import { Edit, Trash2, Eye, DollarSign, Users, FileDown, Loader2 } from 'lucide-react';
import { Product } from '@/app/(admin)/(coge)/paiements/[slug]/page';
import { generatePaymentPDF, convertUSDToCDF } from '@/utils/pdfGenerator';
import { usePaiementsContext } from '@/contexts/PaiementsContext';

interface ProductDataTableProps {
    products: Product[];
    loading: boolean;
    onEdit: (product: Product) => void;
    onView: (product: Product) => void;
    onDelete: (product: Product) => void;
    searchTerm: string;
    classe?: any;
}

const ProductDataTable = ({
    products,
    loading,
    onEdit,
    onView,
    onDelete,
    searchTerm,
    classe
}: ProductDataTableProps) => {
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [pdfLoading, setPdfLoading] = useState<string | null>(null);
    
    // Récupérer les données du contexte
    const { etablissement, selectedFrais, selectedAnnee } = usePaiementsContext();

    // Filtrer les produits selon le terme de recherche
    const filteredProducts = products.filter(product => {
        if (!product || typeof product !== 'object') return false;
        
        const tranche = product.tranche || '';
        const montant = product.montant || 0;
        const id = product._id || '';
        
        return tranche.toLowerCase().includes(searchTerm.toLowerCase()) ||
               montant.toString().includes(searchTerm) ||
               id.toLowerCase().includes(searchTerm.toLowerCase());
    });

    const handleDelete = async (product: Product) => {
        const tranche = product.tranche || 'ce produit';
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le produit "${tranche}" ?`)) {
            return;
        }

        setActionLoading(product._id);
        try {
            await onDelete(product);
        } finally {
            setActionLoading(null);
        }
    };

    const handleGeneratePDF = async (product: Product) => {
        console.log('Génération du PDF pour le produit:', product);
        console.log("Classe info : ", classe);
        if (!etablissement || !selectedFrais || !selectedAnnee || !classe) {
            alert("Impossible de générer le PDF. Veuillez sélectionner un frais et une année académique.");
            return;
        }

        setPdfLoading(product._id);
        try {
            await generatePaymentPDF({
                product,
                etablissement,
                frais: selectedFrais,
                annee: selectedAnnee,
                classe
            });
        } catch (error) {
            console.error('Erreur lors de la génération du PDF:', error);
            alert('Erreur lors de la génération du PDF. Veuillez réessayer.');
        } finally {
            setPdfLoading(null);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const getStatusColor = (totalPayments: number, totalPaymentsOk: number) => {
        if (totalPayments === 0) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        const percentage = (totalPaymentsOk / totalPayments) * 100;
        if (percentage >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
        if (percentage >= 50) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (filteredProducts.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="text-center py-8">
                    <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? 'Aucun produit trouvé' : 'Aucun produit'}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        {searchTerm 
                            ? 'Aucun produit ne correspond à votre recherche'
                            : 'Créez votre premier produit pour cette classe'
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        Produits ({filteredProducts.length})
                    </h3>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {searchTerm && `Filtré par: "${searchTerm}"`}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Produit
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Montant
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Paiements
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Collecté
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {filteredProducts.map((product) => {
                            const safeProduct = {
                                _id: product._id || '',
                                tranche: product.tranche || '',
                                montant: product.montant || 0,
                                totalPayments: product.totalPayments || 0,
                                totalPaymentsAmount: product.totalPaymentsAmount || 0,
                                totalPaymentsPending: product.totalPaymentsPending || 0,
                                totalPaymentsOk: product.totalPaymentsOk || 0,
                                totalPaymentsNo: product.totalPaymentsNo || 0,
                                ...product
                            };
                            
                            const montantCDF = convertUSDToCDF(safeProduct.montant);
                            const isDeleting = actionLoading === safeProduct._id;
                            const isGeneratingPDF = pdfLoading === safeProduct._id;
                            
                            return (
                                <tr key={safeProduct._id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                    {/* Produit */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {safeProduct.tranche}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                ID: {safeProduct._id.slice(-8)}
                                            </div>
                                        </div>
                                    </td>

                                    {/* Montant */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                {formatCurrency(safeProduct.montant)}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {montantCDF.toLocaleString('fr-CD')} CDF
                                            </div>
                                        </div>
                                    </td>

                                    {/* Paiements */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Users className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900 dark:text-white">
                                                {safeProduct.totalPayments}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Collecté */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-green-600 dark:text-green-400">                                            
                                            {
                                                product.payments.reduce((total, p) => total + (p.status == 'OK' ? p.amount : 0.0), 0)
                                            } CDF
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onView(safeProduct)}
                                                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
                                                title="Voir les détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            
                                            <button
                                                onClick={() => onEdit(safeProduct)}
                                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                title="Modifier"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            
                                            <button
                                                onClick={() => handleGeneratePDF(safeProduct)}
                                                disabled={isGeneratingPDF}
                                                className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                                                title="Générer PDF"
                                            >
                                                {isGeneratingPDF ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <FileDown className="w-4 h-4" />
                                                )}
                                            </button>
                                            
                                            <button
                                                onClick={() => handleDelete(safeProduct)}
                                                disabled={isDeleting}
                                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
                                                title="Supprimer"
                                            >
                                                {isDeleting ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Footer avec statistiques */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                    <div>
                        Total: {filteredProducts.length} produit(s)
                    </div>
                    <div className="flex items-center gap-4">
                        <span>
                            Montant total: {filteredProducts.reduce((sum, p) => sum + (p.montant || 0), 0)} CDF
                        </span>
                        <span>
                            Collecté: {filteredProducts.reduce((sum, p) => sum + (p.payments.reduce((t, pay) => t + (pay.status == 'OK' ? pay.amount : 0), 0) || 0), 0)} CDF
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDataTable;
