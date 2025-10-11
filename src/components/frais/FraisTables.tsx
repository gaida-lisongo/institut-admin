"use client";

import { useState } from "react";
import { Frais } from "@/types/frais";
import { useFraisStore } from "@/stores/fraisStore";
import { 
    Eye, 
    Edit, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    Settings,
    Loader2,
    PieChart
} from "lucide-react";
import { useRouter } from "next/navigation";

interface FraisTablesProps {
    frais: Frais[];
    onEdit: (frais: Frais) => void;
    onView: (frais: Frais) => void;
    isLoading?: boolean;
}

const FraisTables = ({ frais, onEdit, onView, isLoading }: FraisTablesProps) => {
    const { deleteFrais } = useFraisStore();
    const router = useRouter();

    const [currentPage, setCurrentPage] = useState(1);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [fraisToDelete, setFraisToDelete] = useState<Frais | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(frais.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFrais = frais.slice(startIndex, endIndex);

    // Navigation pagination
    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    // Gestion de la suppression
    const handleDeleteClick = (frais: Frais) => {
        setFraisToDelete(frais);
        setDeleteDialogOpen(true);
    };

    // Navigation vers les répartitions
    const handleRepartitionsClick = (frais: Frais) => {
        if (frais._id) {
            router.push(`/f-inscriptions/${frais._id}`);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!fraisToDelete?._id) return;

        setIsDeleting(true);
        try {
            const success = await deleteFrais(fraisToDelete._id);
            if (success) {
                alert("Frais supprimé avec succès");
                setDeleteDialogOpen(false);
                setFraisToDelete(null);
                
                // Ajuster la page si nécessaire
                const newTotalPages = Math.ceil((frais.length - 1) / itemsPerPage);
                if (currentPage > newTotalPages && newTotalPages > 0) {
                    setCurrentPage(newTotalPages);
                }
            }
        } catch (error) {
            alert("Erreur lors de la suppression du frais");
        } finally {
            setIsDeleting(false);
        }
    };

    // Formatage du montant
    const formatMontant = (montant: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CDF',
            minimumFractionDigits: 0,
        }).format(montant);
    };

    // Couleurs des badges établissements
    const getEtabBadgeVariant = (etab: string) => {
        switch (etab) {
            case 'public': return 'default';
            case 'prive': return 'secondary';
            case 'tous': return 'outline';
            default: return 'default';
        }
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-center py-12">
                    <div className="flex items-center space-x-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Chargement des données...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (frais.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="text-center space-y-2">
                        <div className="text-gray-400 mb-4">
                            <Settings className="h-12 w-12 mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium">Aucun frais trouvé</h3>
                        <p className="text-gray-500">
                            Aucun frais ne correspond aux critères de recherche.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Désignation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Établissements</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Répartitions</th>
                                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {currentFrais.map((frais) => (
                                <tr key={frais._id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div>
                                            <div className="font-semibold">{frais.designation}</div>
                                            <div className="text-sm text-gray-500">{frais.categorie}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="max-w-xs">
                                            <p className="text-sm text-gray-600 line-clamp-2">
                                                {frais.description}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                                        {formatMontant(frais.montant)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-wrap gap-1">
                                            {frais.etabs.map((etab) => (
                                                <span 
                                                    key={etab} 
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                                                >
                                                    {etab === 'public' ? 'Public' : 
                                                     etab === 'prive' ? 'Privé' : 
                                                     'Tous'}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {frais.repartitions && frais.repartitions.length > 0 ? (
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {frais.repartitions.length} répartition(s)
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Aucune</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center justify-center space-x-1">
                                            <button
                                                onClick={() => onView(frais)}
                                                title="Voir les détails"
                                                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(frais)}
                                                title="Modifier"
                                                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleRepartitionsClick(frais)}
                                                title="Gérer les répartitions"
                                                className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
                                            >
                                                <PieChart className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(frais)}
                                                title="Supprimer"
                                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="bg-white rounded-lg shadow p-4">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Affichage de {startIndex + 1} à {Math.min(endIndex, frais.length)} sur {frais.length} frais
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => goToPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Précédent
                            </button>
                            
                            <div className="flex items-center space-x-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    
                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => goToPage(pageNum)}
                                            className={`w-8 h-8 rounded-md ${
                                                currentPage === pageNum 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'border hover:bg-gray-50'
                                            }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>
                            
                            <button
                                onClick={() => goToPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                Suivant
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </button>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                            Page {currentPage} / {totalPages}
                        </div>
                    </div>
                </div>
            )}

            {/* Dialog de confirmation de suppression */}
            {deleteDialogOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
                        <h3 className="text-lg font-semibold mb-2">Confirmer la suppression</h3>
                        <p className="text-gray-600 mb-6">
                            Êtes-vous sûr de vouloir supprimer le frais "{fraisToDelete?.designation}" ?
                            Cette action est irréversible.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setDeleteDialogOpen(false)}
                                disabled={isDeleting}
                                className="px-4 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDeleteConfirm}
                                disabled={isDeleting}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Suppression...
                                    </>
                                ) : (
                                    'Supprimer'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FraisTables;