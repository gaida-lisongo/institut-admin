"use client";

import React from 'react';
import { usePersonnelContext } from '@/components/personnel/PersonnelDataWrapper';
import { usePersonnelsByCategorie } from '@/stores/personnelStore';

const PersonnelTestPage: React.FC = () => {
  const { personnels, stats, provinces, refreshData } = usePersonnelContext();
  const { personnels: personnelsAcademiques } = usePersonnelsByCategorie('ACADEMIQUE');
  const { personnels: personnelsScientifiques } = usePersonnelsByCategorie('SCIENTIFIQUE');
  const { personnels: personnelsAdministratifs } = usePersonnelsByCategorie('ADMINISTRATIF');
  
  return (
    <div className="p-6 space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Test du Système de Personnel
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Démonstration des données du système de personnel
            </p>
          </div>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Actualiser les données
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      {stats && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Statistiques Globales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.total}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Personnel
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.actifs}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Personnel Actif
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.avecAutorisations}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avec Autorisations
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.nouveaux}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Nouveaux
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Répartition par catégorie */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-blue-600 dark:text-blue-400 mb-4">
            Personnel Académique
          </h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {personnelsAcademiques.length}
          </div>
          <div className="space-y-2">
            {personnelsAcademiques.slice(0, 3).map((personnel) => (
              <div key={personnel._id} className="text-sm text-gray-600 dark:text-gray-400">
                • {personnel.prenom} {personnel.nom} - {personnel.grade || 'Non spécifié'}
              </div>
            ))}
            {personnelsAcademiques.length > 3 && (
              <div className="text-sm text-blue-600 dark:text-blue-400">
                +{personnelsAcademiques.length - 3} autres...
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-purple-600 dark:text-purple-400 mb-4">
            Personnel Scientifique
          </h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {personnelsScientifiques.length}
          </div>
          <div className="space-y-2">
            {personnelsScientifiques.slice(0, 3).map((personnel) => (
              <div key={personnel._id} className="text-sm text-gray-600 dark:text-gray-400">
                • {personnel.prenom} {personnel.nom} - {personnel.grade || 'Non spécifié'}
              </div>
            ))}
            {personnelsScientifiques.length > 3 && (
              <div className="text-sm text-purple-600 dark:text-purple-400">
                +{personnelsScientifiques.length - 3} autres...
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-green-600 dark:text-green-400 mb-4">
            Personnel Administratif
          </h3>
          <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {personnelsAdministratifs.length}
          </div>
          <div className="space-y-2">
            {personnelsAdministratifs.slice(0, 3).map((personnel) => (
              <div key={personnel._id} className="text-sm text-gray-600 dark:text-gray-400">
                • {personnel.prenom} {personnel.nom} - {personnel.grade || 'Non spécifié'}
              </div>
            ))}
            {personnelsAdministratifs.length > 3 && (
              <div className="text-sm text-green-600 dark:text-green-400">
                +{personnelsAdministratifs.length - 3} autres...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Répartition par provinces */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Répartition par Provinces
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {provinces.map((province) => {
            const count = personnels.filter(p => 
              (typeof p.province === 'string' ? p.province : p.province?._id) === province._id
            ).length;
            
            if (count === 0) return null;
            
            return (
              <div key={province._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {province.designation}
                </span>
                <span className="text-sm text-blue-600 dark:text-blue-400 font-semibold">
                  {count} personnel{count > 1 ? 's' : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste complète du personnel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Liste Complète du Personnel ({personnels.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Personnel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Province
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {personnels.map((personnel) => {
                  const province = provinces.find(p => p._id === (typeof personnel.province === 'string' ? personnel.province : personnel.province?._id));
                  return (
                    <tr key={personnel._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {personnel.prenom.charAt(0)}{personnel.nom.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {personnel.prenom} {personnel.nom}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {personnel.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          personnel.categorie === 'ACADEMIQUE' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400' :
                          personnel.categorie === 'SCIENTIFIQUE' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400' :
                          'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        }`}>
                          {personnel.categorie}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {personnel.grade || 'Non spécifié'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {province?.designation || 'Inconnue'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Actif
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonnelTestPage;
