"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { usePersonnelStore } from '@/stores/personnelStore';
import { useProvinceStore } from '@/stores/provinceStore';
import { Personnel, PersonnelStats } from '@/types/personnel';
import { Province } from '@/types/province';

interface PersonnelDataWrapperProps {
  children: React.ReactNode;
}

interface PersonnelContextType {
  personnels: Personnel[];
  stats: PersonnelStats | null;
  isLoading: boolean;
  error: string | null;
  provinces: Province[];
  refreshData: () => void;
}

export const PersonnelContext = createContext<PersonnelContextType | null>(null);

export const usePersonnelContext = () => {
  const context = useContext(PersonnelContext);
  if (!context) {
    throw new Error('usePersonnelContext must be used within PersonnelDataWrapper');
  }
  return context;
};

const PersonnelDataWrapper: React.FC<PersonnelDataWrapperProps> = ({ children }) => {
  const [hasInitialized, setHasInitialized] = useState(false);
  
  const { 
    personnels, 
    filteredPersonnels, 
    stats,
    isLoading, 
    error, 
    loadPersonnels,
    loadPersonnelStats
  } = usePersonnelStore();
  
  const { provinces, fetchProvinces } = useProvinceStore();

  // Charger les données UNE SEULE FOIS au montage
  useEffect(() => {
    if (!hasInitialized) {
      const initializeData = async () => {
        try {
          await Promise.all([
            loadPersonnels(),
            loadPersonnelStats(),
            fetchProvinces()
          ]);
        } catch (error) {
          console.error('Erreur lors de l\'initialisation:', error);
        } finally {
          setHasInitialized(true);
        }
      };

      initializeData();
    }
  }, []); // AUCUNE dépendance = exécuté UNE SEULE FOIS

  const refreshData = async () => {
    await Promise.all([
      loadPersonnels(),
      loadPersonnelStats(),
      fetchProvinces()
    ]);
  };

  const contextValue: PersonnelContextType = {
    personnels: filteredPersonnels.length > 0 ? filteredPersonnels : personnels,
    stats,
    isLoading,
    error,
    provinces,
    refreshData
  };

  // Affichage de chargement initial
  if (!hasInitialized || (isLoading && personnels.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Chargement des données du personnel...
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Veuillez patienter pendant que nous récupérons les informations.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage d'erreur
  if (error && personnels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="bg-red-100 dark:bg-red-900/20 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">
              Erreur de chargement
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 mb-4">
              {error}
            </p>
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PersonnelContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header avec statistiques globales */}
        <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Gestion du Personnel
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Administration et suivi des ressources humaines
                </p>
              </div>
              
              {/* Statistiques rapides */}
              {stats && (
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.total}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Total Personnel
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.actifs}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Actifs
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {stats.nouveaux}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Nouveaux
                    </div>
                  </div>
                  <button
                    onClick={refreshData}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Actualiser les données"
                    disabled={isLoading}
                  >
                    <svg className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* Contenu principal */}
        <div className="flex-1">
          {children}
        </div>
      </div>
    </PersonnelContext.Provider>
  );
};

export default PersonnelDataWrapper;
