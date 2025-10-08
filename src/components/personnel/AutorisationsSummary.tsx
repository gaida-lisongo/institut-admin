"use client";

import React from 'react';

const AutorisationsSummary: React.FC = () => {
  const autorisations = [
    {
      code: 'DG',
      label: 'Directeur Général',
      description: 'Direction générale de l\'institution',
      niveau: 'Direction Exécutive',
      couleur: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    },
    {
      code: 'SGACAD',
      label: 'Secrétaire Général Académique',
      description: 'Gestion des affaires académiques et pédagogiques',
      niveau: 'Direction Académique',
      couleur: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
    },
    {
      code: 'SGAD',
      label: 'Secrétaire Général Administratif',
      description: 'Gestion administrative et opérationnelle',
      niveau: 'Direction Administrative',
      couleur: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
    },
    {
      code: 'SGR',
      label: 'Secrétaire Général à la Recherche',
      description: 'Coordination des activités de recherche',
      niveau: 'Direction Recherche',
      couleur: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    },
    {
      code: 'AB',
      label: 'Administrateur du Budget',
      description: 'Gestion budgétaire et financière',
      niveau: 'Direction Financière',
      couleur: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Système d'Autorisations du Personnel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Types d'autorisations officiels pour la gestion du personnel
        </p>
      </div>

      {/* Vue d'ensemble */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Types d'Autorisations ({autorisations.length} niveaux)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {autorisations.map((autorisation) => (
            <div
              key={autorisation.code}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <span className={`font-mono text-sm px-3 py-1 rounded-full ${autorisation.couleur}`}>
                  {autorisation.code}
                </span>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {autorisation.niveau}
                </div>
              </div>
              
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {autorisation.label}
              </h3>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {autorisation.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Hiérarchie des autorisations */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Hiérarchie des Autorisations
        </h2>
        
        <div className="space-y-4">
          {/* Niveau 1 - Direction Exécutive */}
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-red-600 dark:text-red-400 mb-2">
              Niveau 1 - Direction Exécutive
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400 px-3 py-1 rounded-full text-sm font-mono">
                DG - Directeur Général
              </span>
            </div>
          </div>

          {/* Niveau 2 - Secrétaires Généraux */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">
              Niveau 2 - Secrétaires Généraux
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-mono">
                SGACAD - SG Académique
              </span>
              <span className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 px-3 py-1 rounded-full text-sm font-mono">
                SGAD - SG Administratif
              </span>
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400 px-3 py-1 rounded-full text-sm font-mono">
                SGR - SG Recherche
              </span>
            </div>
          </div>

          {/* Niveau 3 - Administration Spécialisée */}
          <div className="border-l-4 border-yellow-500 pl-4">
            <h3 className="font-semibold text-yellow-600 dark:text-yellow-400 mb-2">
              Niveau 3 - Administration Spécialisée
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400 px-3 py-1 rounded-full text-sm font-mono">
                AB - Administrateur Budget
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fonctionnalités du système */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Fonctionnalités du Système d'Autorisations
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Gestion des Autorisations
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Ajout d'autorisations avec mot de passe
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Activation/désactivation des autorisations
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Gestion des dates d'expiration
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Suppression d'autorisations
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Sécurité et Validation
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Mots de passe hashés côté serveur
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Authentification Token Bearer
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Validation des champs obligatoires
              </li>
              <li className="flex items-center">
                <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Gestion des expirations automatiques
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Statistiques du Système
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-red-600 dark:text-red-400">
              1
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Direction Exécutive
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              3
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Secrétaires Généraux
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              1
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Admin Spécialisée
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              5
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Autorisations
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutorisationsSummary;
