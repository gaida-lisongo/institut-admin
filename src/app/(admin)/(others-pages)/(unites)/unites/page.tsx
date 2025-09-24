"use client";

import React, { useState, useEffect } from 'react';
import UniteCard from '@/components/unites/UniteCard';
import CoursManagement from '@/components/unites/CoursManagement';
import { Unite } from '@/services/UniteService';
import useAuthStore from '@/stores/authStore';
import UniteEditModal from '@/components/unites/UniteEditModal';

const UnitesPage: React.FC = () => {
  const { menuData, user } = useAuthStore();
  const [unites, setUnites] = useState<Unite[]>([]);
  const [filteredUnites, setFilteredUnites] = useState<Unite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedUnite, setSelectedUnite] = useState<Unite | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showCoursManagement, setShowCoursManagement] = useState(false);

  useEffect(() => {
    // Récupérer toutes les unités depuis menuData
    if (menuData && menuData.unites) {
      setUnites(menuData.unites);
      setFilteredUnites(menuData.unites);
      setLoading(false);
    }
  }, [menuData]);

  useEffect(() => {
    // Filtrer les unités selon les critères
    let filtered = unites;

    // Filtrer par terme de recherche
    if (searchTerm) {
      filtered = filtered.filter(unite =>
        unite.descripteur.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unite.descripteur.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        unite.descripteur.mention.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par type
    if (selectedType !== 'all') {
      filtered = filtered.filter(unite => unite.descripteur.type === selectedType);
    }

    setFilteredUnites(filtered);
  }, [unites, searchTerm, selectedType]);

  const handleEditUnite = (unite: Unite) => {
    setSelectedUnite(unite);
    setShowModal(true);
  };

  const handleViewCours = (unite: Unite) => {
    setSelectedUnite(unite);
    setShowCoursManagement(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedUnite(null);
  };

  const handleUniteUpdated = (updatedUnite: Unite) => {
    // Mettre à jour l'unité dans la liste
    setUnites(prev => prev.map(u => u._id === updatedUnite._id ? updatedUnite : u));
    setFilteredUnites(prev => prev.map(u => u._id === updatedUnite._id ? updatedUnite : u));
  };


  const handleCloseCoursManagement = () => {
    setShowCoursManagement(false);
    setSelectedUnite(null);
  };


  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header avec statistiques */}
      <div className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Unités</p>
                <p className="text-2xl font-semibold text-blue-900 dark:text-blue-100">{unites.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Obligatoires</p>
                <p className="text-2xl font-semibold text-green-900 dark:text-green-100">
                  {unites.filter(u => u.descripteur.type === 'Obigatoire').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">Optionnelles</p>
                <p className="text-2xl font-semibold text-yellow-900 dark:text-yellow-100">
                  {unites.filter(u => u.descripteur.type === 'Optionnelle').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Total Crédits</p>
                <p className="text-2xl font-semibold text-purple-900 dark:text-purple-100">
                  {unites.reduce((sum, u) => sum + u.descripteur.credit, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom, code ou mention..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="sm:w-48">
          <select
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="all">Tous les types</option>
            <option value="Obigatoire">Obligatoires</option>
            <option value="Optionnelle">Optionnelles</option>
          </select>
        </div>
      </div>

      {/* Liste des unités */}
      {filteredUnites.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">Aucune unité trouvée</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || selectedType !== 'all' 
              ? 'Essayez de modifier vos critères de recherche.'
              : 'Vous n\'avez pas encore d\'unités d\'enseignement assignées.'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUnites.map((unite) => (
            <UniteCard
              key={unite._id}
              unite={unite}
              onEdit={handleEditUnite}
              onViewCours={handleViewCours}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showModal && selectedUnite && (
        <UniteEditModal
          unite={selectedUnite}
          isOpen={showModal}
          onClose={handleCloseModal}
          onUniteUpdated={handleUniteUpdated}
        />
      )}

      {showCoursManagement && selectedUnite && (
        <CoursManagement
          uniteId={selectedUnite._id || ''}
          sectionId={selectedUnite.semestreId}
        />
      )}
    </div>
  );
};

export default UnitesPage;