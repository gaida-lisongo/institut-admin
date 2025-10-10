'use client';

import { useState } from 'react';
import { Systeme } from '@/types/systemes';
import { useSystemeStore } from '@/stores/systemeStore';
import SystemeEditCard from './SystemeEditCard';
import SystemeDetailView from './SystemeDetailView';

interface SystemeCardProps {
    systeme: Systeme;
    onViewDetails?: () => void;
}

const SystemeCard: React.FC<SystemeCardProps> = ({ systeme, onViewDetails }) => {
    const { deleteSysteme } = useSystemeStore();
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDetailView, setShowDetailView] = useState(false);

    // Calculer les statistiques
    const totalCycles = systeme.cycles?.length || 0;
    const totalClasses = systeme.cycles?.reduce((acc, cycle) => acc + (cycle.classes?.length || 0), 0) || 0;

    const handleDelete = async () => {
        if (!systeme._id) return;
        
        setIsDeleting(true);
        try {
            await deleteSysteme(systeme._id);
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden group">
            {/* Image/Header */}
            <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                {systeme.photo ? (
                    <img 
                        src={systeme.photo} 
                        alt={systeme.designation}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                )}
                
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-1">
                        <button
                            onClick={() => setShowEditForm(true)}
                            className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors"
                            title="Modifier"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-colors"
                            title="Supprimer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenu */}
            <div className="p-6">
                {/* Titre */}
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-1">
                    {systeme.designation}
                </h3>

                {/* Description */}
                <div className="mb-4">
                    {systeme.description && systeme.description.length > 0 ? (
                        <div className="space-y-1">
                            {systeme.description.slice(0, 2).map((desc, index) => (
                                <p key={index} className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {desc}
                                </p>
                            ))}
                            {systeme.description.length > 2 && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    +{systeme.description.length - 2} autre{systeme.description.length - 2 > 1 ? 's' : ''}...
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                            Aucune description
                        </p>
                    )}
                </div>

                {/* Statistiques */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-4">
                        <div className="text-center">
                            <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                                {totalCycles}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Cycle{totalCycles > 1 ? 's' : ''}
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400">
                                {totalClasses}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Classe{totalClasses > 1 ? 's' : ''}
                            </div>
                        </div>
                    </div>
                    
                    {/* Date de création */}
                    {systeme.createdAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(systeme.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                    )}
                </div>

                {/* Actions principales */}
                <div className="flex space-x-2">
                    <button
                        onClick={onViewDetails || (() => setShowDetailView(true))}
                        className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Voir détails
                    </button>
                    <button
                        onClick={() => setShowEditForm(true)}
                        className="flex-1 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Modifier
                    </button>
                </div>
            </div>

            {/* Modal de confirmation de suppression */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mr-3">
                                <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Confirmer la suppression
                            </h3>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Êtes-vous sûr de vouloir supprimer le système "<strong>{systeme.designation}</strong>" ? 
                            Cette action est irréversible et supprimera tous les cycles et classes associés.
                        </p>
                        
                        <div className="flex space-x-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
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

            {/* Modal d'édition */}
            {showEditForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl">
                        <SystemeEditCard
                            systeme={systeme}
                            onSuccess={() => setShowEditForm(false)}
                            onCancel={() => setShowEditForm(false)}
                        />
                    </div>
                </div>
            )}

            {/* Modal de détails */}
            {showDetailView && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                    <div className="w-full max-w-4xl max-h-full overflow-y-auto">
                        <SystemeDetailView
                            systeme={systeme}
                            onEdit={() => {
                                setShowDetailView(false);
                                setShowEditForm(true);
                            }}
                            onClose={() => setShowDetailView(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemeCard;
