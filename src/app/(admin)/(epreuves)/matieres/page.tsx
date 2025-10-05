'use client';

import React, { useState, useMemo } from 'react';

// Interface pour les matières
interface Matiere {
  id: number;
  designation: string;
  unite: string;
  credit: number;
  semestre: string;
  annee: string;
  userId: number;
}

// Données factices
const fakeMatieresData: Matiere[] = [
  {
    id: 1,
    designation: "Mathématiques Générales",
    unite: "UE1 - Sciences Fondamentales",
    credit: 6,
    semestre: "S1",
    annee: "2024-2025",
    userId: 101
  },
  {
    id: 2,
    designation: "Physique Appliquée",
    unite: "UE1 - Sciences Fondamentales",
    credit: 5,
    semestre: "S1",
    annee: "2024-2025",
    userId: 102
  },
  {
    id: 3,
    designation: "Chimie Organique",
    unite: "UE2 - Sciences Expérimentales",
    credit: 4,
    semestre: "S2",
    annee: "2024-2025",
    userId: 103
  },
  {
    id: 4,
    designation: "Informatique de Base",
    unite: "UE3 - Technologies",
    credit: 3,
    semestre: "S1",
    annee: "2024-2025",
    userId: 104
  },
  {
    id: 5,
    designation: "Français Technique",
    unite: "UE4 - Langues et Communication",
    credit: 2,
    semestre: "S1",
    annee: "2024-2025",
    userId: 105
  },
  {
    id: 6,
    designation: "Anglais Scientifique",
    unite: "UE4 - Langues et Communication",
    credit: 2,
    semestre: "S2",
    annee: "2024-2025",
    userId: 105
  },
  {
    id: 7,
    designation: "Statistiques et Probabilités",
    unite: "UE1 - Sciences Fondamentales",
    credit: 4,
    semestre: "S2",
    annee: "2024-2025",
    userId: 101
  },
  {
    id: 8,
    designation: "Biologie Cellulaire",
    unite: "UE2 - Sciences Expérimentales",
    credit: 5,
    semestre: "S1",
    annee: "2024-2025",
    userId: 106
  }
];

const MatieresPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemestre, setSelectedSemestre] = useState('');
  const [selectedUnite, setSelectedUnite] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Filtrage des données
  const filteredData = useMemo(() => {
    return fakeMatieresData.filter(matiere => {
      const matchesSearch = matiere.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           matiere.unite.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSemestre = selectedSemestre === '' || matiere.semestre === selectedSemestre;
      const matchesUnite = selectedUnite === '' || matiere.unite === selectedUnite;
      
      return matchesSearch && matchesSemestre && matchesUnite;
    });
  }, [searchTerm, selectedSemestre, selectedUnite]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  // Options uniques pour les filtres
  const semestres = [...new Set(fakeMatieresData.map(m => m.semestre))];
  const unites = [...new Set(fakeMatieresData.map(m => m.unite))];

  return (
    <div className="p-6">
      {/* Header avec actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div className="mb-4 sm:mb-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Liste des Matières
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filteredData.length} matière(s) trouvée(s)
          </p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            + Nouvelle Matière
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Exporter
          </button>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Rechercher
          </label>
          <input
            type="text"
            placeholder="Nom de la matière ou unité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Semestre
          </label>
          <select
            value={selectedSemestre}
            onChange={(e) => setSelectedSemestre(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les semestres</option>
            {semestres.map(semestre => (
              <option key={semestre} value={semestre}>{semestre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Unité d'Enseignement
          </label>
          <select
            value={selectedUnite}
            onChange={(e) => setSelectedUnite(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="">Toutes les unités</option>
            {unites.map(unite => (
              <option key={unite} value={unite}>{unite}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Éléments par page
          </label>
          <select
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* DataTable */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Désignation
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Unité d'Enseignement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Crédits
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Semestre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Année
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {paginatedData.map((matiere) => (
              <tr key={matiere.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {matiere.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {matiere.designation}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {matiere.unite}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {matiere.credit} crédits
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {matiere.semestre}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {matiere.annee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                      Modifier
                    </button>
                    <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700 dark:text-gray-300">
            Affichage de {startIndex + 1} à {Math.min(startIndex + itemsPerPage, filteredData.length)} sur {filteredData.length} résultats
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Précédent
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                {page}
              </button>
            ))}
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Suivant
            </button>
          </div>
        </div>
      )}

      {/* Message si aucun résultat */}
      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">Aucune matière trouvée</h3>
            <p className="text-sm">Essayez de modifier vos critères de recherche ou ajoutez une nouvelle matière.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatieresPage;