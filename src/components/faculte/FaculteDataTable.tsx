"use client";

import { useState, useMemo } from "react";
import { Faculte } from "@/types/etablissement";
import { 
    Search, 
    Eye, 
    Edit, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    GraduationCap,
    Users
} from "lucide-react";
import Image from "next/image";

interface FaculteDataTableProps {
    facultes: Faculte[];
    onView: (faculte: Faculte) => void;
    onEdit: (faculte: Faculte) => void;
    onDelete: (faculteId: string) => void;
    isDeleting?: string | null;
}

const FaculteDataTable = ({ 
    facultes, 
    onView, 
    onEdit, 
    onDelete,
    isDeleting 
}: FaculteDataTableProps) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Filtrer les facultés
    const filteredFacultes = useMemo(() => {
        return facultes.filter(f => 
            f.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
            f.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [facultes, searchQuery]);
    
    // Pagination
    const totalPages = Math.ceil(filteredFacultes.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentFacultes = filteredFacultes.slice(startIndex, endIndex);
    
    // Réinitialiser la page lors du changement de recherche
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {/* Header avec recherche */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Rechercher une faculté..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                        {filteredFacultes.length} faculté{filteredFacultes.length > 1 ? 's' : ''}
                    </div>
                </div>
            </div>
            
            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Faculté
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Description
                            </th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Équipe
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {currentFacultes.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center">
                                    <GraduationCap className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {searchQuery ? 'Aucune faculté trouvée' : 'Aucune faculté enregistrée'}
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            currentFacultes.map((faculte) => (
                                <tr 
                                    key={faculte._id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                                >
                                    {/* Faculté */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {faculte.logo ? (
                                                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 border border-gray-200 dark:border-gray-700">
                                                    <Image
                                                        src={faculte.logo}
                                                        alt={faculte.nom}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                                                    <GraduationCap className="w-5 h-5 text-white" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {faculte.nom}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* Description */}
                                    <td className="px-6 py-4">
                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 max-w-md">
                                            {faculte.description}
                                        </p>
                                    </td>
                                    
                                    {/* Équipe */}
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                            <Users className="w-4 h-4" />
                                            <span>{faculte.equipe?.length || 0}</span>
                                        </div>
                                    </td>
                                    
                                    {/* Actions */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => onView(faculte)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                title="Voir les détails"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => onEdit(faculte)}
                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                                                title="Modifier"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => faculte._id && onDelete(faculte._id)}
                                                disabled={isDeleting === faculte._id}
                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                                                title="Supprimer"
                                            >
                                                {isDeleting === faculte._id ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Affichage de {startIndex + 1} à {Math.min(endIndex, filteredFacultes.length)} sur {filteredFacultes.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                Page {currentPage} sur {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FaculteDataTable;
