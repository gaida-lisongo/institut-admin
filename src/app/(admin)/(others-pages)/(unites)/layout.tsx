"use client";

import React from 'react';

interface UnitesLayoutProps {
  children: React.ReactNode;
}

const UnitesLayout: React.FC<UnitesLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="md:flex md:items-center md:justify-between">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                  Gestion des Unités d'Enseignement
                </h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Gérez le contenu pédagogique de vos unités d'enseignement et des cours associés
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                À propos de cette section
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <p>
                  Cette section vous permet de gérer le branding et le contenu pédagogique de vos unités d'enseignement. 
                  En tant que responsable, vous pouvez :
                </p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Éditer les informations descriptives des unités d'enseignement</li>
                  <li>Gérer les objectifs, compétences et approches pédagogiques</li>
                  <li>Organiser les ressources bibliographiques et vidéographiques</li>
                  <li>Superviser les cours associés à chaque unité</li>
                  <li>Définir les modalités d'évaluation et les prérequis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Accueil
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2 dark:text-gray-400">
                  Unités d'Enseignement
                </span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UnitesLayout;