"use client";

import { useFraisStore } from "@/stores/fraisStore";
import { useEffect, useState } from "react";
import { Frais } from "@/types/frais";
import FraisTables from "./FraisTables";
import FraisModal from "./FraisModal";
import { Plus, Search, RefreshCw } from "lucide-react";

type Props = {
    categorie: string;
}

const FraisManager = ({ categorie }: Props) => {
    const { 
        frais, 
        isLoading, 
        error, 
        pagination, 
        loadFrais, 
        searchFrais,
        loadFraisByCategorie,
        clearError 
    } = useFraisStore();
    
    const [fraisFilter, setFraisFilter] = useState<Frais[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFrais, setSelectedFrais] = useState<Frais | null>(null);
    const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
    const [currentPage, setCurrentPage] = useState(1);

    // Chargement initial des frais par catégorie
    useEffect(() => {
        if (categorie) {
            loadFraisByCategorie(categorie, 1, 20);
        }
    }, [categorie, loadFraisByCategorie]);

    // Filtrage local des frais
    useEffect(() => {
        if (frais) {
            let filtered = frais.filter(f => f.categorie.toLowerCase() === categorie.toLowerCase());
            
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                filtered = filtered.filter(f => 
                    f.designation.toLowerCase().includes(searchLower) ||
                    f.description.toLowerCase().includes(searchLower) ||
                    f.montant.toString().includes(searchLower)
                );
            }
            
            setFraisFilter(filtered);
        }
    }, [frais, categorie, searchTerm]);

    // Gestion de la recherche
    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    // Actualisation des données
    const handleRefresh = () => {
        clearError();
        loadFraisByCategorie(categorie, currentPage, 20);
    };

    // Ouverture du modal pour création
    const handleCreate = () => {
        setSelectedFrais(null);
        setModalMode('create');
        setIsModalOpen(true);
    };

    // Ouverture du modal pour édition
    const handleEdit = (frais: Frais) => {
        setSelectedFrais(frais);
        setModalMode('edit');
        setIsModalOpen(true);
    };

    // Ouverture du modal pour visualisation
    const handleView = (frais: Frais) => {
        setSelectedFrais(frais);
        setModalMode('view');
        setIsModalOpen(true);
    };

    // Fermeture du modal et actualisation
    const handleModalClose = (shouldRefresh = false) => {
        setIsModalOpen(false);
        setSelectedFrais(null);
        if (shouldRefresh) {
            handleRefresh();
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex items-center space-x-2">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Chargement des frais...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="border border-red-200 bg-red-50 dark:bg-red-900/10 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">Erreur</h3>
                <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
                <button 
                    onClick={handleRefresh}
                    className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center"
                >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Réessayer
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header avec statistiques */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <h2 className="text-xl font-semibold">Frais de {categorie}</h2>
                        <button 
                            onClick={handleCreate}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Nouveau frais
                        </button>
                    </div>
                    <p className="text-gray-600">
                        Gestion des frais de catégorie "{categorie}"
                    </p>
                </div>
                <div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {fraisFilter.length}
                            </div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">
                                Frais trouvés
                            </div>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {pagination?.totalItems || 0}
                            </div>
                            <div className="text-sm text-green-600 dark:text-green-400">
                                Total général
                            </div>
                        </div>
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                {pagination?.totalPages || 0}
                            </div>
                            <div className="text-sm text-purple-600 dark:text-purple-400">
                                Pages
                            </div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {fraisFilter.reduce((sum, f) => sum + f.montant, 0).toLocaleString()} FC
                            </div>
                            <div className="text-sm text-orange-600 dark:text-orange-400">
                                Montant total
                            </div>
                        </div>
                    </div>

                    {/* Barre de recherche */}
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Rechercher par désignation, description ou montant..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button 
                            onClick={handleRefresh}
                            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Actualiser
                        </button>
                    </div>
                </div>
            </div>

            {/* Tableau des frais */}
            <FraisTables 
                frais={fraisFilter}
                onEdit={handleEdit}
                onView={handleView}
                isLoading={isLoading}
            />

            {/* Modal CRUD */}
            <FraisModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                frais={selectedFrais}
                mode={modalMode}
                defaultCategorie={categorie}
            />
        </div>
    );
};  

export default FraisManager;
