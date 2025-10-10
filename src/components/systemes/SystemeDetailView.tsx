'use client';

import { Systeme } from '@/types/systemes';

interface SystemeDetailViewProps {
    systeme: Systeme;
    onEdit: () => void;
    onClose: () => void;
}

const SystemeDetailView: React.FC<SystemeDetailViewProps> = ({ systeme, onEdit, onClose }) => {
    // Calculer les statistiques
    const totalCycles = systeme.cycles?.length || 0;
    const totalClasses = systeme.cycles?.reduce((acc, cycle) => acc + (cycle.classes?.length || 0), 0) || 0;
    const totalCredits = systeme.cycles?.reduce((acc, cycle) => 
        acc + cycle.classes.reduce((classAcc, classe) => classAcc + classe.credit, 0), 0
    ) || 0;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="relative">
                {/* Image de fond */}
                <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative">
                    {systeme.photo ? (
                        <img 
                            src={systeme.photo} 
                            alt={systeme.designation}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <svg className="w-16 h-16 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    )}
                    
                    {/* Overlay avec actions */}
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="absolute top-4 right-4 flex space-x-2">
                        <button
                            onClick={onEdit}
                            className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors"
                            title="Modifier"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors"
                            title="Fermer"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Titre principal */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6">
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {systeme.designation}
                    </h1>
                    {systeme.createdAt && (
                        <p className="text-white/80 text-sm">
                            Créé le {new Date(systeme.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    )}
                </div>
            </div>

            {/* Contenu principal */}
            <div className="p-6">
                {/* Statistiques */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                            {totalCycles}
                        </div>
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                            Cycle{totalCycles > 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                            {totalClasses}
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                            Classe{totalClasses > 1 ? 's' : ''}
                        </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                            {totalCredits}
                        </div>
                        <div className="text-sm text-purple-700 dark:text-purple-300">
                            Crédit{totalCredits > 1 ? 's' : ''}
                        </div>
                    </div>
                </div>

                {/* Description */}
                {systeme.description && systeme.description.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                            Description
                        </h2>
                        <div className="space-y-2">
                            {systeme.description.map((desc, index) => (
                                <p key={index} className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {desc}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {/* Cycles et Classes */}
                <div className="space-y-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Structure du système
                    </h2>
                    
                    {systeme.cycles.map((cycle, cycleIndex) => (
                        <div key={cycleIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            {/* En-tête du cycle */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {cycle.designation}
                                    </h3>
                                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                                        <span>{cycle.classes.length} classe{cycle.classes.length > 1 ? 's' : ''}</span>
                                        <span>
                                            {cycle.classes.reduce((acc, classe) => acc + classe.credit, 0)} crédits
                                        </span>
                                    </div>
                                </div>
                                
                                {/* Description du cycle */}
                                {cycle.description && cycle.description.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {cycle.description.map((desc, descIndex) => (
                                            <p key={descIndex} className="text-sm text-gray-600 dark:text-gray-400">
                                                {desc}
                                            </p>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Classes du cycle */}
                            <div className="p-4">
                                {cycle.classes.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {cycle.classes.map((classe, classeIndex) => (
                                            <div key={classeIndex} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-3">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="font-medium text-gray-900 dark:text-white">
                                                        {classe.niveau}
                                                    </h4>
                                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                                                        {classe.credit} crédits
                                                    </span>
                                                </div>
                                                
                                                {/* Descriptions de la classe */}
                                                {classe.description && classe.description.length > 0 && (
                                                    <div className="space-y-1">
                                                        {classe.description.map((desc, descIndex) => (
                                                            <p key={descIndex} className="text-xs text-gray-600 dark:text-gray-400">
                                                                {desc}
                                                            </p>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Semestres */}
                                                {classe.semestres && classe.semestres.length > 0 && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-600">
                                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                            Semestres:
                                                        </p>
                                                        <div className="flex flex-wrap gap-1">
                                                            {classe.semestres.map((semestre, semestreIndex) => (
                                                                <span key={semestreIndex} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                                                    {semestre.designation}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                        <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                        </svg>
                                        <p className="text-sm">Aucune classe définie pour ce cycle</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="mt-8 flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                        Fermer
                    </button>
                    <button
                        onClick={onEdit}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Modifier
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SystemeDetailView;
