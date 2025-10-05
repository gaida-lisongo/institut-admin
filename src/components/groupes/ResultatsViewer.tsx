"use client";

import React, { useState } from 'react';
import { Groupe, ResolutionWithEtudiant } from '@/types/groupe';
import { Session } from '@/types/session';

interface ResultatsViewerProps {
  groupe: Groupe;
  resolutions: ResolutionWithEtudiant[];
  session?: Session;
  onClose: () => void;
}

const ResultatsViewer: React.FC<ResultatsViewerProps> = ({
  groupe,
  resolutions,
  session,
  onClose
}) => {
  const [sortBy, setSortBy] = useState<'nom' | 'note' | 'temps'>('note');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Trier les résolutions
  const sortedResolutions = [...resolutions].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'nom':
        const nameA = a.etudiant ? `${a.etudiant.nom} ${a.etudiant.prenom}` : '';
        const nameB = b.etudiant ? `${b.etudiant.nom} ${b.etudiant.prenom}` : '';
        comparison = nameA.localeCompare(nameB);
        break;
      case 'note':
        comparison = a.note - b.note;
        break;
      case 'temps':
        comparison = (a.tempsEcoule || 0) - (b.tempsEcoule || 0);
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Calculer les statistiques
  const completedResolutions = resolutions.filter(r => r.statut === 'termine' || r.statut === 'corrige');
  const notes = completedResolutions.map(r => r.note);
  const moyenne = notes.length > 0 ? notes.reduce((sum, note) => sum + note, 0) / notes.length : 0;
  const meilleureNote = notes.length > 0 ? Math.max(...notes) : 0;
  const plusMauvaiseNote = notes.length > 0 ? Math.min(...notes) : 0;
  const noteMaximale = session?.maximum || 20;

  const handleSort = (field: 'nom' | 'note' | 'temps') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'non_commence': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'en_cours': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300';
      case 'termine': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300';
      case 'corrige': return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getNoteColor = (note: number, max: number) => {
    const percentage = (note / max) * 100;
    if (percentage >= 80) return 'text-green-600 dark:text-green-400';
    if (percentage >= 60) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 40) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRank = (note: number) => {
    const sortedNotes = [...notes].sort((a, b) => b - a);
    return sortedNotes.indexOf(note) + 1;
  };

  return (
    <div className="mb-6 rounded-lg bg-white shadow dark:bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Résultats détaillés - {groupe.designation}
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Statistiques globales */}
      <div className="border-b border-gray-200 px-6 py-4 dark:border-gray-700">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {moyenne.toFixed(2)}/{noteMaximale}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Moyenne générale</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
              {meilleureNote}/{noteMaximale}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Meilleure note</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
              {plusMauvaiseNote}/{noteMaximale}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Plus mauvaise note</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {completedResolutions.length}/{resolutions.length}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Terminés</p>
          </div>
        </div>
      </div>

      {/* Tableau des résultats */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Rang
              </th>
              <th 
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => handleSort('nom')}
              >
                <div className="flex items-center gap-1">
                  Étudiant
                  {sortBy === 'nom' && (
                    <svg className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Classe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Statut
              </th>
              <th 
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => handleSort('note')}
              >
                <div className="flex items-center gap-1">
                  Note
                  {sortBy === 'note' && (
                    <svg className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pourcentage
              </th>
              <th 
                className="cursor-pointer px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => handleSort('temps')}
              >
                <div className="flex items-center gap-1">
                  Temps
                  {sortBy === 'temps' && (
                    <svg className={`h-4 w-4 ${sortOrder === 'asc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
            {sortedResolutions.map((resolution, index) => {
              const percentage = noteMaximale > 0 ? (resolution.note / noteMaximale) * 100 : 0;
              const rank = resolution.note > 0 ? getRank(resolution.note) : '-';
              
              return (
                <tr key={resolution.etudiantId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {rank !== '-' && rank <= 3 && (
                        <div className="mr-2">
                          {rank === 1 && <span className="text-yellow-500">🥇</span>}
                          {rank === 2 && <span className="text-gray-400">🥈</span>}
                          {rank === 3 && <span className="text-orange-600">🥉</span>}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {resolution.etudiant ? `${resolution.etudiant.nom} ${resolution.etudiant.prenom}` : 'Étudiant inconnu'}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {resolution.etudiant?.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {resolution.classe ? `${resolution.classe.nom} (${resolution.classe.niveau})` : 'Classe inconnue'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatutColor(resolution.statut)}`}>
                      {resolution.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-bold ${getNoteColor(resolution.note, noteMaximale)}`}>
                      {resolution.note > 0 ? `${resolution.note}/${noteMaximale}` : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 dark:bg-gray-700 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            percentage >= 80 ? 'bg-green-600' :
                            percentage >= 60 ? 'bg-blue-600' :
                            percentage >= 40 ? 'bg-orange-600' : 'bg-red-600'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {resolution.tempsEcoule ? `${resolution.tempsEcoule}min` : '-'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {resolutions.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          Aucun résultat disponible
        </div>
      )}
    </div>
  );
};

export default ResultatsViewer;
