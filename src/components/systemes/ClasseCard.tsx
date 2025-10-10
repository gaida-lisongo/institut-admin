'use client';

import { Classe } from '@/types/systemes';

interface ClasseCardProps {
    classe: Classe;
    onEdit: () => void;
    onDelete: () => void;
}

const ClasseCard: React.FC<ClasseCardProps> = ({ classe, onEdit, onDelete }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden group">
            {/* Image de la classe */}
            <div className="h-32 bg-gradient-to-br from-green-500 to-blue-600 relative">
                {classe.photo ? (
                    <img 
                        src={classe.photo} 
                        alt={classe.niveau}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <svg className="w-12 h-12 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        </svg>
                    </div>
                )}
                
                {/* Actions overlay */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <div className="flex space-x-1">
                        <button
                            onClick={onEdit}
                            className="p-1.5 bg-white/90 hover:bg-white text-gray-700 rounded-lg transition-colors"
                            title="Modifier"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={onDelete}
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
            <div className="p-4">
                {/* Titre et crédits */}
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {classe.niveau || 'Niveau non défini'}
                    </h3>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200">
                        {classe.credit} crédit{classe.credit > 1 ? 's' : ''}
                    </span>
                </div>

                {/* Description */}
                <div className="mb-4">
                    {classe.description && classe.description.length > 0 ? (
                        <div className="space-y-1">
                            {classe.description.slice(0, 2).map((desc, index) => (
                                <p key={index} className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                    {desc}
                                </p>
                            ))}
                            {classe.description.length > 2 && (
                                <p className="text-xs text-gray-500 dark:text-gray-500">
                                    +{classe.description.length - 2} autre{classe.description.length - 2 > 1 ? 's' : ''}...
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                            Aucune description
                        </p>
                    )}
                </div>

                {/* Semestres */}
                <div className="mb-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Semestres
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {classe.semestres?.length || 0} semestre{(classe.semestres?.length || 0) > 1 ? 's' : ''}
                        </span>
                    </div>
                    
                    {classe.semestres && classe.semestres.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                            {classe.semestres.slice(0, 3).map((semestre, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                    {semestre.designation}
                                </span>
                            ))}
                            {classe.semestres.length > 3 && (
                                <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                    +{classe.semestres.length - 3}
                                </span>
                            )}
                        </div>
                    ) : (
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 italic">
                            Aucun semestre défini
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                    <button
                        onClick={onEdit}
                        className="flex-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        Modifier
                    </button>
                    <button
                        onClick={onDelete}
                        className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg text-sm font-medium transition-colors"
                    >
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClasseCard;
