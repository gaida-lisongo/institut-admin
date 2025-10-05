"use client";

import React, { useState, useEffect } from 'react';
import { useCoursStore } from '@/stores/coursStore';
import { useModal } from '@/hooks/useModal';
import { Cours } from '@/types/session';
import CoursModal from '@/components/cours/CoursModal';
import CoursTestDataButton from '@/components/cours/CoursTestDataButton';
import MainNavigation from '@/components/navigation/MainNavigation';

const CoursPage: React.FC = () => {
  const {
    cours,
    addCours,
    updateCours,
    deleteCours,
    initializeDefaultCours,
    loading,
    error,
  } = useCoursStore();

  const { isOpen, openModal, closeModal } = useModal();
  
  const [selectedCours, setSelectedCours] = useState<Cours | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUnite, setSelectedUnite] = useState('');

  useEffect(() => {
    initializeDefaultCours();
  }, [initializeDefaultCours]);

  const handleOpenModal = (coursItem?: Cours) => {
    setSelectedCours(coursItem || null);
    openModal();
  };

  const handleSubmit = (coursData: any) => {
    if (selectedCours) {
      updateCours(selectedCours._id, coursData);
    } else {
      addCours(coursData);
    }
    setSelectedCours(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      deleteCours(id);
    }
  };

  // Obtenir les unités uniques pour le filtre
  const unites = Array.from(new Set(cours.map(c => c.unite))).sort();

  const filteredCours = cours.filter(coursItem => {
    const matchesSearch = 
      coursItem.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coursItem.unite.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesUnite = selectedUnite === '' || coursItem.unite === selectedUnite;
    
    return matchesSearch && matchesUnite;
  });

  // Statistiques
  const totalCredits = cours.reduce((sum, c) => sum + c.credit, 0);
  const avgCredits = cours.length > 0 ? (totalCredits / cours.length).toFixed(1) : '0';

  return (
    <div className="p-6">
      <MainNavigation />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Cours
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez les cours et leurs unités d'enseignement
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {process.env.NODE_ENV === 'development' && <CoursTestDataButton />}
          <button
            onClick={() => handleOpenModal()}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Ajouter un cours
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <input
            type="text"
            placeholder="Rechercher par nom ou unité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
        <div>
          <select
            value={selectedUnite}
            onChange={(e) => setSelectedUnite(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">Toutes les unités</option>
            {unites.map((unite) => (
              <option key={unite} value={unite}>
                {unite}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Cours</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{cours.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/20">
              <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Unités</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{unites.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Crédits</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{totalCredits}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/20">
              <svg className="h-6 w-6 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Moy. Crédits</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{avgCredits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Table des cours */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Cours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Unité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Crédits
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
                  {filteredCours.map((coursItem) => (
                    <tr key={coursItem._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {coursItem.designation}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
                          {coursItem.unite}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800 dark:bg-green-900/20 dark:text-green-200">
                          {coursItem.credit} crédit{coursItem.credit > 1 ? 's' : ''}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(coursItem)}
                          className="mr-3 text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(coursItem._id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCours.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedUnite
                    ? 'Aucun cours trouvé avec ces critères de recherche.'
                    : 'Aucun cours trouvé. Cliquez sur "Ajouter un cours" pour commencer.'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <CoursModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        cours={selectedCours}
      />
    </div>
  );
};

export default CoursPage;
