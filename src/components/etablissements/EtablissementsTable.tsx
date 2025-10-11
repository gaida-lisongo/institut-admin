'use client';

import { Etablissement } from '@/types/etablissement';

interface EtablissementsTableProps {
    etablissements: Etablissement[];
    onSelectEtablissement: (etablissement: Etablissement) => void;
    searchTerm: string;
    provinceId: string;
}

const EtablissementsTable: React.FC<EtablissementsTableProps> = ({
    etablissements,
    onSelectEtablissement,
    searchTerm,
    provinceId
}) => {
    const getCategorieColor = (categorie: 'public' | 'prive') => {
        return categorie === 'public' 
            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200';
    };

    const getRoleColor = (role: string) => {
        const colors: Record<string, string> = {
            'DG': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200',
            'SGACAD': 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200',
            'SGAD': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
            'SGR': 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-200',
            'AB': 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200'
        };
        return colors[role] || 'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-200';
    };

    if (etablissements.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
                <div className="text-center py-12">
                    <div className="mx-auto h-24 w-24 text-gray-400 mb-4">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                        {searchTerm ? 'Aucun établissement trouvé' : 'Aucun établissement'}
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {searchTerm 
                            ? `Aucun établissement ne correspond à "${searchTerm}"`
                            : `Aucun établissement enregistré pour cette province`
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Établissements de la province
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {etablissements.length} établissement{etablissements.length > 1 ? 's' : ''} trouvé{etablissements.length > 1 ? 's' : ''}
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Établissement
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Catégorie
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                COGE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {etablissements.map((etablissement) => (
                            <tr 
                                key={etablissement._id} 
                                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                                onClick={() => onSelectEtablissement(etablissement)}
                            >
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12">
                                            {etablissement.logo ? (
                                                <img 
                                                    src={etablissement.logo} 
                                                    alt={etablissement.designation}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {etablissement.designation}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {etablissement.sigle}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategorieColor(etablissement.categorie)}`}>
                                        {etablissement.categorie === 'public' ? 'Public' : 'Privé'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {etablissement.coge.slice(0, 3).map((membre, index) => (
                                            <span 
                                                key={index}
                                                className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getRoleColor(membre.role)}`}
                                            >
                                                {membre.role}
                                            </span>
                                        ))}
                                        {etablissement.coge.length > 3 && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                                                +{etablissement.coge.length - 3}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="text-sm text-gray-900 dark:text-white line-clamp-2">
                                        {etablissement.description}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onSelectEtablissement(etablissement);
                                        }}
                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                                    >
                                        Voir détails
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default EtablissementsTable;
