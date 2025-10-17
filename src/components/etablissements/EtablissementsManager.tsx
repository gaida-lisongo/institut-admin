'use client';

import { useState, useEffect } from 'react';
import { Etablissement } from '@/types/etablissement';
import { useEtablissementStore } from '@/stores/etablissementStore';
import EtablissementsTable from './EtablissementsTable';
import EtablissementDetail from './EtablissementDetail';
import EtablissementModal from './EtablissementModal';

interface EtablissementsManagerProps {
    provinceId: string;
}

const EtablissementsManager: React.FC<EtablissementsManagerProps> = ({
    provinceId
}) => {
    const { 
        etablissements,
        selectedEtablissement,
        setSelectedEtablissement,
        searchTerm,
        setSearchTerm,
        fetchEtablissements
    } = useEtablissementStore();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [viewMode, setViewMode] = useState<'table' | 'detail'>('table');

    // Charger les établissements au montage
    useEffect(() => {
        fetchEtablissements();
    }, [fetchEtablissements]);

    // Filtrer les établissements pour cette province uniquement
    const etablissementsProvince = etablissements.filter(etablissement => {
        // Gérer le cas où provinceId peut être un string (ID) ou un objet (données populées)
        if (typeof etablissement.provinceId === 'string') {
            return etablissement.provinceId === provinceId;
        } else if (typeof etablissement.provinceId === 'object' && etablissement.provinceId) {
            return (etablissement.provinceId as any)._id === provinceId;
        }
        return false;
    });

    // Debug : Afficher les données récupérées
    useEffect(() => {
        
    }, [etablissements, provinceId, etablissementsProvince]);

    // Filtrer par terme de recherche
    const filteredEtablissements = etablissementsProvince.filter(etablissement =>
        !searchTerm || 
        etablissement.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etablissement.sigle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        etablissement.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectEtablissement = (etablissement: Etablissement) => {
        setSelectedEtablissement(etablissement);
        setViewMode('detail');
    };

    const handleBackToTable = () => {
        setSelectedEtablissement(null);
        setViewMode('table');
    };

    const handleCreateSuccess = (newEtablissement: Etablissement) => {
        setShowCreateModal(false);
        // L'établissement sera automatiquement ajouté au store par le modal
    };

    return (
        <div className="space-y-6">
            {/* Barre de recherche et actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Rechercher un établissement..."
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    
                    {filteredEtablissements.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            {filteredEtablissements.length} résultat{filteredEtablissements.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nouvel établissement
                </button>
            </div>

            {/* Contenu principal */}
            {viewMode === 'table' ? (
                filteredEtablissements.length > 0 ? (
                    <EtablissementsTable
                        etablissements={filteredEtablissements}
                        onSelectEtablissement={handleSelectEtablissement}
                        searchTerm={searchTerm}
                        provinceId={provinceId}
                    />
                ) : (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H9m0 0H5m0 0h2M7 7h10M7 11h10M7 15h10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                            Aucun établissement trouvé
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4">
                            {etablissements.length === 0 
                                ? "Aucun établissement n'a été créé pour le moment."
                                : searchTerm 
                                    ? `Aucun établissement ne correspond à "${searchTerm}".`
                                    : "Aucun établissement trouvé pour cette province."
                            }
                        </p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Créer le premier établissement
                        </button>
                    </div>
                )
            ) : (
                selectedEtablissement && (
                    <EtablissementDetail
                        etablissement={selectedEtablissement}
                        onBack={handleBackToTable}
                    />
                )
            )}

            {/* Modal de création */}
            <EtablissementModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
                provinceId={provinceId}
            />
        </div>
    );
};

export default EtablissementsManager;
