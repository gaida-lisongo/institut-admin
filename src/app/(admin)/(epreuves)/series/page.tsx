'use client';

import { useMatieres, type Matiere } from '@/stores/matiereStore';
import { useSeries, useSerieActions, useSerieStats, type Serie, type CreateSerieData } from '@/stores/serieStore';
import React, { useState, useEffect } from 'react';

const SeriesPage = () => {
  const { matieres, fetchMatieres } = useMatieres();
  const [selectedCours, setSelectedCours] = useState<Matiere | null>(null);

  // Charger les matières au montage
  useEffect(() => {
    fetchMatieres();
  }, [fetchMatieres]);

  const handleCoursSelect = (matiere: Matiere) => {
    setSelectedCours(matiere);
  };

  const handleBackToCours = () => {
    setSelectedCours(null);
  };

  // Si un cours est sélectionné, afficher le composant SeriesCard
  if (selectedCours) {
    return <SeriesCard cours={selectedCours} onBack={handleBackToCours} />;
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Sélectionnez une matière
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Choisissez une matière pour gérer ses séries de questions
        </p>
      </div>

      {/* Grille des cartes de cours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {matieres.map((matiere) => (
          <div
            key={matiere._id}
            onClick={() => handleCoursSelect(matiere)}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                    {matiere.credit} crédits
                  </span>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                {matiere.designation}
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  {matiere.unite}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {matiere.semestre} - {matiere.annee}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Cliquez pour voir les séries</span>
                  <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message si aucune matière */}
      {matieres.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Aucune matière disponible</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Vous devez d'abord créer des matières pour pouvoir gérer leurs séries.
          </p>
        </div>
      )}
    </div>
  );
};

// Composant pour afficher les séries d'un cours spécifique
interface SeriesCardProps {
  cours: Matiere;
  onBack: () => void;
}

const SeriesCard: React.FC<SeriesCardProps> = ({ cours, onBack }) => {
  const { series, isLoading, error } = useSeries();
  const { fetchSeriesByCours, createSerie, updateSerie, deleteSerie, clearError } = useSerieActions();
  const { totalSeries, totalQuestions, averageQuestionsPerSerie } = useSerieStats();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingSerie, setEditingSerie] = useState<Serie | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les séries pour ce cours
  useEffect(() => {
    fetchSeriesByCours(cours._id);
  }, [cours._id, fetchSeriesByCours]);

  // Filtrer les séries selon le terme de recherche
  const filteredSeries = series.filter(serie => 
    serie.coursId === cours._id && 
    (searchTerm === '' || serie._id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateSerie = async (newSerie: CreateSerieData) => {
    const success = await createSerie(newSerie);
    if (success) {
      setShowCreateModal(false);
    } else if (error) {
      alert(error);
      clearError();
    }
  };

  const handleUpdateSerie = async (updatedSerie: Serie) => {
    const success = await updateSerie(updatedSerie);
    if (success) {
      setEditingSerie(null);
    } else if (error) {
      alert(error);
      clearError();
    }
  };

  const handleSaveSerie = async (serieData: CreateSerieData | Serie) => {
    if ('_id' in serieData) {
      await handleUpdateSerie(serieData);
    } else {
      await handleCreateSerie(serieData);
    }
  };

  const handleDeleteSerie = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette série ?')) {
      const success = await deleteSerie(id);
      if (!success && error) {
        alert(error);
        clearError();
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="inline-flex items-center p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour
          </button>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Séries - {cours.designation}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {cours.unite} • {cours.semestre} • {cours.credit} crédits
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nouvelle Série
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Séries
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalSeries}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Questions
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {totalQuestions}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Moyenne Questions/Série
                  </dt>
                  <dd className="text-lg font-medium text-gray-900 dark:text-white">
                    {averageQuestionsPerSerie}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      {series.length > 0 && (
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Rechercher une série..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement des séries...</span>
        </div>
      )}

      {/* Liste des séries */}
      {!isLoading && filteredSeries.length > 0 && (
        <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredSeries.map((serie) => (
              <li key={serie._id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                        <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          Série #{serie._id.slice(-6)}
                        </p>
                        <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          {serie.questions.length} question{serie.questions.length > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {cours.designation}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingSerie(serie)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteSerie(serie._id)}
                      className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Message si aucune série */}
      {!isLoading && filteredSeries.length === 0 && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium mb-2">Aucune série disponible</h3>
          <p className="text-sm">
            {searchTerm 
              ? 'Aucune série ne correspond à votre recherche.' 
              : 'Commencez par ajouter une nouvelle série pour cette matière.'
            }
          </p>
        </div>
      )}

      {/* Modal de création/modification */}
      {(showCreateModal || editingSerie) && (
        <SerieModal
          serie={editingSerie}
          coursId={cours._id}
          onSave={handleSaveSerie}
          onClose={() => {
            setShowCreateModal(false);
            setEditingSerie(null);
          }}
        />
      )}
    </div>
  );
};

export default SeriesPage;

// Composant Modal pour créer/modifier une série (à implémenter)
interface SerieModalProps {
  serie?: Serie | null;
  coursId: string;
  onSave: (serie: CreateSerieData | Serie) => Promise<void>;
  onClose: () => void;
}

const SerieModal: React.FC<SerieModalProps> = ({ serie, coursId, onSave, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {serie ? 'Modifier la série' : 'Nouvelle série'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Modal à implémenter pour la gestion des séries
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};