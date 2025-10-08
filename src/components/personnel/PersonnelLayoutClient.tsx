"use client";

import React, { createContext, useContext, useEffect } from 'react';
import { usePersonnelStore } from '@/stores/personnelStore';
import { useProvinceStore } from '@/stores/provinceStore';
import { Personnel, PersonnelStats } from '@/types/personnel';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface PersonnelLayoutClientProps {
  children: React.ReactNode;
  initialPersonnels: Personnel[];
  initialStats: PersonnelStats | null;
  initialError: string | null;
}

interface PersonnelContextType {
  personnels: Personnel[];
  stats: PersonnelStats | null;
  isLoading: boolean;
  error: string | null;
  provinces: any[];
  refreshData: () => void;
}

export const PersonnelContext = createContext<PersonnelContextType | null>(null);

export const usePersonnelContext = () => {
  const context = useContext(PersonnelContext);
  if (!context) {
    throw new Error('usePersonnelContext must be used within PersonnelLayoutClient');
  }
  return context;
};

const PersonnelLayoutClient: React.FC<PersonnelLayoutClientProps> = ({ 
  children, 
  initialPersonnels, 
  initialStats, 
  initialError 
}) => {
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

  // Initialiser le store avec les données serveur
  useEffect(() => {
    const initializeStore = async () => {
      // Si on a des données initiales et que le store est vide, on les charge
      if (initialPersonnels.length > 0 && personnels.length === 0) {
        // On utilise directement set pour éviter un appel API supplémentaire
        usePersonnelStore.setState({
          personnels: initialPersonnels,
          filteredPersonnels: initialPersonnels,
          stats: initialStats,
          error: initialError,
          isLoading: false
        });
      }

      // Charger les provinces
      if (provinces.length === 0) {
        await fetchProvinces();
      }
    };

    initializeStore();
  }, [initialPersonnels, initialStats, initialError, personnels.length, provinces.length, fetchProvinces]);

  const refreshData = async () => {
    await loadPersonnels();
    await fetchProvinces();
  };

  const contextValue: PersonnelContextType = {
    personnels: filteredPersonnels.length > 0 ? filteredPersonnels : initialPersonnels,
    stats: stats || initialStats,
    isLoading,
    error: error || initialError,
    provinces,
    refreshData
  };

  // Affichage de chargement initial (seulement si pas de données initiales)
  if (isLoading && initialPersonnels.length === 0) {
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

  // Affichage d'erreur (seulement si erreur critique et pas de données)
  if ((error || initialError) && initialPersonnels.length === 0) {
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
              {error || initialError}
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

  const currentStats = stats || initialStats;

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
              {currentStats && (
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {currentStats.total}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Total Personnel
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {currentStats.actifs}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Actifs
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {currentStats.nouveaux}
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

        {/* Navigation par catégorie de personnel */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6">
            <nav className="flex space-x-8">
              <NavLink 
                href="/pacad" 
                label="Personnel Académique" 
                count={currentStats?.parCategorie.academique || 0}
                color="blue"
              />
              <NavLink 
                href="/pscien" 
                label="Personnel Scientifique" 
                count={currentStats?.parCategorie.scientifique || 0}
                color="purple"
              />
              <NavLink 
                href="/padmin" 
                label="Personnel Administratif" 
                count={currentStats?.parCategorie.administratif || 0}
                color="green"
              />
              <NavLink 
                href="/pouvrier" 
                label="Personnel Ouvrier" 
                count={currentStats?.parCategorie.ouvrier || 0}
                color="yellow"
              />
            </nav>
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

// Composant de navigation
interface NavLinkProps {
  href: string;
  label: string;
  count: number;
  color: 'blue' | 'purple' | 'green' | 'yellow';
}

const NavLink: React.FC<NavLinkProps> = ({ href, label, count, color }) => {
  const pathname = usePathname();
  
  const colorClasses = {
    blue: 'text-blue-600 border-blue-600 bg-blue-50 dark:bg-blue-900/20',
    purple: 'text-purple-600 border-purple-600 bg-purple-50 dark:bg-purple-900/20',
    green: 'text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20',
    yellow: 'text-yellow-600 border-yellow-600 bg-yellow-50 dark:bg-yellow-900/20'
  };

  const inactiveClasses = 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 border-transparent hover:border-gray-300';

  const isActive = pathname.includes(href);
  
  return (
    <Link
      href={href}
      className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
        isActive ? colorClasses[color] : inactiveClasses
      }`}
    >
      <span>{label}</span>
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? `${colorClasses[color]} text-white` 
          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
      }`}>
        {count}
      </span>
    </Link>
  );
};

export default PersonnelLayoutClient;
