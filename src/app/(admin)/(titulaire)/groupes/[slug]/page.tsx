"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useGroupeStore } from '@/stores/groupeStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useCoursStore } from '@/stores/coursStore';
import { useEtudiantStore } from '@/stores/etudiantStore';
import { useClasseStore } from '@/stores/classeStore';
import { Groupe, GROUPE_STATUTS, ResolutionWithEtudiant } from '@/types/groupe';
import { Etudiant } from '@/types/student';
import MainNavigation from '@/components/navigation/MainNavigation';
import EtudiantSelectionModal from '@/components/groupes/EtudiantSelectionModal';
import ResultatsViewer from '@/components/groupes/ResultatsViewer';
import ExportPalmaresButton from '@/components/groupes/ExportPalmaresButton';
import GeneratePDFButton from '@/components/groupes/GeneratePDFButton';

const GroupeDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const {
    getGroupeBySlug,
    addEtudiantToGroupe,
    removeEtudiantFromGroupe,
    changeGroupeStatut,
    getResolutionStats,
    updateResolution,
    calculateResolutionNote,
    loading,
    error,
    clearError
  } = useGroupeStore();

  const { sessions } = useSessionStore();
  const { cours } = useCoursStore();
  const { etudiants } = useEtudiantStore();
  const { classes } = useClasseStore();

  const [groupe, setGroupe] = useState<Groupe | null>(null);
  const [showEtudiantModal, setShowEtudiantModal] = useState(false);
  const [showResultats, setShowResultats] = useState(false);
  const [selectedEtudiant, setSelectedEtudiant] = useState<string | null>(null);

  useEffect(() => {
    const foundGroupe = getGroupeBySlug(slug);
    if (foundGroupe) {
      setGroupe(foundGroupe);
    } else {
      router.push('/groupes');
    }
  }, [slug, getGroupeBySlug, router]);

  useEffect(() => {
    if (error) {
      console.error('Erreur groupe:', error);
      setTimeout(clearError, 5000);
    }
  }, [error, clearError]);

  if (!groupe) {
    return (
      <div className="p-6">
        <MainNavigation />
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400">Groupe non trouvé</p>
        </div>
      </div>
    );
  }

  // Récupérer les données enrichies
  const session = sessions.find(s => s._id === groupe.sessionId);
  const coursData = session ? cours.find(c => c._id === session.coursId) : null;
  const stats = getResolutionStats(groupe._id);

  // Enrichir les résolutions avec les données des étudiants
  const resolutionsWithEtudiants: ResolutionWithEtudiant[] = groupe.resolutions.map(resolution => {
    const etudiant = etudiants.find(e => e._id === resolution.etudiantId);
    const classe = etudiant ? classes.find(c => c._id === etudiant.classeId) : undefined;
    
    return {
      ...resolution,
      etudiant,
      classe
    };
  });

  // Étudiants disponibles (non encore dans le groupe)
  const etudiantsDisponibles = etudiants.filter(etudiant => 
    !groupe.resolutions.some(r => r.etudiantId === etudiant._id)
  );

  const handleAddEtudiant = async (etudiantId: string) => {
    try {
      await addEtudiantToGroupe(groupe._id, etudiantId);
      // Recharger le groupe
      const updatedGroupe = getGroupeBySlug(slug);
      if (updatedGroupe) setGroupe(updatedGroupe);
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
    }
  };

  const handleRemoveEtudiant = async (etudiantId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer cet étudiant du groupe ?')) {
      try {
        await removeEtudiantFromGroupe(groupe._id, etudiantId);
        // Recharger le groupe
        const updatedGroupe = getGroupeBySlug(slug);
        if (updatedGroupe) setGroupe(updatedGroupe);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleChangeStatut = async (statut: Groupe['statut']) => {
    try {
      await changeGroupeStatut(groupe._id, statut);
      // Recharger le groupe
      const updatedGroupe = getGroupeBySlug(slug);
      if (updatedGroupe) setGroupe(updatedGroupe);
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
    }
  };

  const getStatutColor = (statut: Groupe['statut']) => {
    switch (statut) {
      case 'brouillon': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'ouvert': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300';
      case 'ferme': return 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300';
      case 'archive': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getResolutionStatutColor = (statut: string) => {
    switch (statut) {
      case 'non_commence': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'en_cours': return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-300';
      case 'termine': return 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-300';
      case 'corrige': return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <MainNavigation />
      
      {/* En-tête */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => router.push('/groupes')}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {groupe.designation}
            </h1>
            <div className="flex items-center gap-4 mt-2">
              <span className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatutColor(groupe.statut)}`}>
                {GROUPE_STATUTS[groupe.statut]}
              </span>
              {session && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {session.designation} • {coursData?.designation}
                </span>
              )}
            </div>
          </div>
        </div>

        {groupe.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-4">{groupe.description}</p>
        )}

        {/* Actions principales */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setShowEtudiantModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter Étudiants
          </button>

          <button
            onClick={() => setShowResultats(!showResultats)}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {showResultats ? 'Masquer' : 'Voir'} Résultats
          </button>

          <ExportPalmaresButton 
            groupe={groupe}
            resolutions={resolutionsWithEtudiants}
            session={session}
            cours={coursData}
          />

          <GeneratePDFButton
            groupe={groupe}
            resolutions={resolutionsWithEtudiants}
            session={session}
            cours={coursData}
          />

          {/* Menu statut */}
          <div className="relative">
            <select
              value={groupe.statut}
              onChange={(e) => handleChangeStatut(e.target.value as Groupe['statut'])}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              {Object.entries(GROUPE_STATUTS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
              <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Participants</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalResolutions}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-green-100 p-2 dark:bg-green-900">
              <svg className="h-5 w-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Terminés</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.resolutionsTerminees}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900">
              <svg className="h-5 w-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Moyenne</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.moyenneGroupe}/20</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
              <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Temps Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tempsEcouleTotal}min</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visualisation des résultats */}
      {showResultats && (
        <ResultatsViewer
          groupe={groupe}
          resolutions={resolutionsWithEtudiants}
          session={session}
          onClose={() => setShowResultats(false)}
        />
      )}

      {/* Liste des participants */}
      <div className="rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Participants ({resolutionsWithEtudiants.length})
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Étudiant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Temps
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {resolutionsWithEtudiants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun participant dans ce groupe
                  </td>
                </tr>
              ) : (
                resolutionsWithEtudiants.map((resolution) => (
                  <tr key={resolution.etudiantId} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getResolutionStatutColor(resolution.statut)}`}>
                        {resolution.statut.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {resolution.note > 0 ? `${resolution.note}/20` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {resolution.tempsEcoule ? `${resolution.tempsEcoule}min` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedEtudiant(resolution.etudiantId)}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          title="Voir détails"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleRemoveEtudiant(resolution.etudiantId)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                          title="Retirer du groupe"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <EtudiantSelectionModal
        isOpen={showEtudiantModal}
        onClose={() => setShowEtudiantModal(false)}
        etudiants={etudiantsDisponibles}
        onSelect={handleAddEtudiant}
      />
    </div>
  );
};

export default GroupeDetailPage;