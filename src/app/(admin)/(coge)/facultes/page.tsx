'use client';

import { useState, useEffect } from 'react';
import { useSystemeStore } from '@/stores/systemeStore';
import SystemesManager from '@/components/systemes/SystemesManager';
import { Systeme } from '@/types/systemes';

const PageSystemes = () => {
    const { systemes, loading, error, fetchSystemes } = useSystemeStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredSystemes, setFilteredSystemes] = useState<Systeme[]>([]);

    // Charger les systèmes au montage
    useEffect(() => {
        fetchSystemes();
    }, [fetchSystemes]);

    // Filtrer les systèmes selon la recherche
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredSystemes(systemes);
        } else {
            const filtered = systemes.filter(systeme =>
                systeme.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                systeme.description.some(desc => 
                    desc.toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
            setFilteredSystemes(filtered);
        }
    }, [systemes, searchTerm]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* En-tête */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                Systèmes Éducatifs
                            </h1>
                            <p className="mt-2 text-gray-600 dark:text-gray-400">
                                Gérez les systèmes, cycles et classes de votre établissement
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                                {systemes.length} système{systemes.length > 1 ? 's' : ''}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Barre de recherche */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Rechercher un système..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Gestion des états */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-2">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="text-gray-600 dark:text-gray-400">Chargement des systèmes...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-red-700 dark:text-red-300">{error}</span>
                        </div>
                    </div>
                )}

                {/* Composant principal de gestion */}
                {!loading && !error && (
                    <SystemesManager 
                        systemes={filteredSystemes}
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                    />
                )}
            </div>
        </div>
    );
};

export default PageSystemes;