'use client';

import React from 'react';
import Link from 'next/link';

interface MatieresLayoutProps {
  children: React.ReactNode;
}

const MatieresLayout: React.FC<MatieresLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen">
      {/* Bannière de la section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Titre et navigation */}
            <div className="flex items-center space-x-4">
              {/* Bouton retour à l'accueil */}
              <Link 
                href="/"
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Accueil
              </Link>

              {/* Titre de la section */}
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    Gestion des Matières
                  </h1>
                  <p className="text-blue-100 text-sm">
                    Administration des matières et unités d'enseignement
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main>
        {children}
      </main>
    </div>
  );
};

export default MatieresLayout;