import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Épreuve en ligne - Institut Admin',
  description: 'Plateforme d\'évaluation en ligne pour les étudiants. Accédez à votre épreuve personnalisée via QR code.',
  keywords: ['épreuve', 'évaluation', 'examen', 'étudiant', 'institut', 'en ligne'],
  robots: 'noindex, nofollow', // Empêcher l'indexation des épreuves
  openGraph: {
    title: 'Épreuve en ligne - Institut Admin',
    description: 'Plateforme d\'évaluation en ligne pour les étudiants',
    type: 'website',
  },
};

export default function EpreuveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      {/* Header de l'épreuve */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Épreuve en ligne
                </h1>
              </div>
            </div>
            
            {/* Indicateurs de statut */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span id="timer">--:--</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span id="status">En attente</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* Footer avec informations */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <div>
              <span>Institut Admin - Système d'évaluation</span>
            </div>
            <div>
              <span>Sauvegarde automatique activée</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}