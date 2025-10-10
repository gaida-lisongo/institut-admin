'use client';

import { useState } from 'react';
import { Systeme } from '@/types/systemes';
import SystemeCard from './SystemeCard';
import SystemeCreateCard from './SystemeCreateCard';

interface SystemesManagerProps {
    systemes: Systeme[];
    searchTerm: string;
    onSearchChange: (term: string) => void;
}

const SystemesManager: React.FC<SystemesManagerProps> = ({
    systemes,
    searchTerm,
    onSearchChange
}) => {
    const [showCreateForm, setShowCreateForm] = useState(false);

    return (
        <div className="space-y-6">
            {/* Actions principales */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Tous les systèmes
                    </h2>
                    {systemes.length > 0 && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                            {systemes.length} résultat{systemes.length > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                
                <button
                    onClick={() => setShowCreateForm(!showCreateForm)}
                    className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        showCreateForm
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                >
                    {showCreateForm ? (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Annuler
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nouveau système
                        </>
                    )}
                </button>
            </div>

            {/* Formulaire de création */}
            {showCreateForm && (
                <div className="mb-8">
                    <SystemeCreateCard 
                        onSuccess={() => setShowCreateForm(false)}
                        onCancel={() => setShowCreateForm(false)}
                    />
                </div>
            )}

            {/* Grille des systèmes */}
            {systemes.length === 0 && !showCreateForm ? (
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? 'Aucun système trouvé' : 'Aucun système éducatif'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {searchTerm 
                            ? `Aucun système ne correspond à "${searchTerm}"`
                            : 'Commencez par créer votre premier système éducatif'
                        }
                    </p>
                    {!searchTerm && (
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Créer un système
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {systemes.map((systeme) => (
                        <SystemeCard
                            key={systeme._id}
                            systeme={systeme}
                        />
                    ))}
                </div>
            )}

            {/* Message de recherche */}
            {searchTerm && systemes.length > 0 && (
                <div className="text-center py-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Résultats pour "<span className="font-medium">{searchTerm}</span>"
                    </p>
                    <button
                        onClick={() => onSearchChange('')}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-1"
                    >
                        Effacer la recherche
                    </button>
                </div>
            )}
        </div>
    );
};

export default SystemesManager;
