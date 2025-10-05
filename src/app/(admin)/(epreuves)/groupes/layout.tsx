'use client';

import { useEffect } from 'react';
import { useSerieActions } from '@/stores/serieStore';
import { useGroupeActions } from '@/stores/groupeStore';
import { useEtudiantActions } from '@/stores/etudiantStore';

interface GroupesLayoutProps {
  children: React.ReactNode;
}

export default function GroupesLayout({ children }: GroupesLayoutProps) {
  const { fetchSeries } = useSerieActions();
  const { fetchGroupes } = useGroupeActions();
  const { fetchEtudiants } = useEtudiantActions();

  // Précharger les données nécessaires
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les séries, groupes et étudiants en parallèle
        await Promise.all([
          fetchSeries(),
          fetchGroupes(),
          fetchEtudiants()
        ]);
      } catch (error) {
        console.error('Erreur lors du préchargement des données:', error);
      }
    };

    loadData();
  }, [fetchSeries, fetchGroupes, fetchEtudiants]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header de navigation */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <nav className="flex items-center space-x-4 text-sm">
            <a 
              href="/matieres" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Matières
            </a>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <a 
              href="/series" 
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Séries
            </a>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-purple-600 dark:text-purple-400 font-medium">
              Groupes
            </span>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer avec informations utiles */}
      <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>Données synchronisées</span>
              </div>
              <div className="flex items-center space-x-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Gérez vos groupes d'étudiants par série</span>
              </div>
            </div>
            <div className="text-xs">
              Gestion des Groupes - Institut Admin
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}