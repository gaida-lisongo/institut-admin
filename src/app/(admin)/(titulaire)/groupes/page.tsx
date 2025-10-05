"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useGroupeStore } from '@/stores/groupeStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useCoursStore } from '@/stores/coursStore';
import { useModal } from '@/hooks/useModal';
import { Groupe, GROUPE_STATUTS } from '@/types/groupe';
import GroupeModal from '@/components/groupes/GroupeModal';
import GroupeTestDataButton from '@/components/groupes/GroupeTestDataButton';
import MainNavigation from '@/components/navigation/MainNavigation';

const GroupesPage: React.FC = () => {
  const {
    groupes,
    fetchGroupes,
    addGroupe,
    updateGroupe,
    deleteGroupe,
    duplicateGroupe,
    changeGroupeStatut,
    getGroupeStats,
    generateSlug,
    loading,
    error,
    clearError
  } = useGroupeStore();

  const { sessions, fetchSessions } = useSessionStore();
  const { cours, fetchCours } = useCoursStore();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSession, setSelectedSession] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');
  const [editingGroupe, setEditingGroupe] = useState<Groupe | null>(null);

  const { isOpen, openModal, closeModal } = useModal();

  useEffect(() => {
    fetchGroupes();
    fetchSessions();
    fetchCours();
  }, [fetchGroupes, fetchSessions, fetchCours]);

  useEffect(() => {
    if (error) {
      console.error('Erreur groupes:', error);
      setTimeout(clearError, 5000);
    }
  }, [error, clearError]);

  // Fonction pour obtenir le nom de la session
  const getSessionName = (sessionId: string) => {
    const session = sessions.find(s => s._id === sessionId);
    return session ? session.designation : 'Session inconnue';
  };

  // Fonction pour obtenir le nom du cours via la session
  const getCoursName = (sessionId: string) => {
    const session = sessions.find(s => s._id === sessionId);
    if (!session) return 'Cours inconnu';
    
    const coursData = cours.find(c => c._id === session.coursId);
    return coursData ? coursData.designation : 'Cours inconnu';
  };

  // Filtrage des groupes
  const filteredGroupes = groupes.filter(groupe => {
    const matchesSearch = 
      groupe.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSessionName(groupe.sessionId).toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCoursName(groupe.sessionId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSession = selectedSession === '' || groupe.sessionId === selectedSession;
    const matchesStatut = selectedStatut === '' || groupe.statut === selectedStatut;
    
    return matchesSearch && matchesSession && matchesStatut;
  });

  // Statistiques
  const stats = getGroupeStats();

  const handleCreateGroupe = () => {
    setEditingGroupe(null);
    openModal();
  };

  const handleEditGroupe = (groupe: Groupe) => {
    setEditingGroupe(groupe);
    openModal();
  };

  const handleDeleteGroupe = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce groupe ?')) {
      try {
        await deleteGroupe(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleDuplicateGroupe = async (id: string) => {
    try {
      await duplicateGroupe(id);
    } catch (error) {
      console.error('Erreur lors de la duplication:', error);
    }
  };

  const handleChangeStatut = async (id: string, statut: Groupe['statut']) => {
    try {
      await changeGroupeStatut(id, statut);
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

  return (
    <div className="p-6">
      <MainNavigation />
      
      {/* En-tête avec statistiques */}
      <div className="mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Groupes
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Gérez les groupes d'étudiants et leurs travaux
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {process.env.NODE_ENV === 'development' && <GroupeTestDataButton />}
            <button
              onClick={handleCreateGroupe}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nouveau Groupe
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900">
                <svg className="h-5 w-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Groupes</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalGroupes}</p>
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
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Groupes Actifs</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.groupesActifs}</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-100 p-2 dark:bg-purple-900">
                <svg className="h-5 w-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Participants</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalParticipants}</p>
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
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.moyenneGenerale}/20</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-100 p-2 dark:bg-indigo-900">
                <svg className="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Taux Réussite</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.tauxReussite}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow dark:bg-gray-800 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher un groupe, session ou cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div className="flex gap-4">
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Toutes les sessions</option>
            {sessions.map(session => (
              <option key={session._id} value={session._id}>{session.designation}</option>
            ))}
          </select>
          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            <option value="">Tous les statuts</option>
            {Object.entries(GROUPE_STATUTS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages d'erreur */}
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900 dark:text-red-200">
          {error}
        </div>
      )}

      {/* DataTable */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Groupe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Session / Cours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Participants
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Date création
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Chargement...
                  </td>
                </tr>
              ) : filteredGroupes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    Aucun groupe trouvé
                  </td>
                </tr>
              ) : (
                filteredGroupes.map((groupe) => (
                  <tr key={groupe._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <Link
                          href={`/groupes/${generateSlug(groupe.designation)}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {groupe.designation}
                        </Link>
                        {groupe.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {groupe.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {getSessionName(groupe.sessionId)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getCoursName(groupe.sessionId)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {groupe.resolutions.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatutColor(groupe.statut)}`}>
                        {GROUPE_STATUTS[groupe.statut]}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(groupe.dateCreation).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/groupes/${generateSlug(groupe.designation)}`}
                          className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                          title="Voir détails"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleEditGroupe(groupe)}
                          className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400"
                          title="Modifier"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDuplicateGroupe(groupe._id)}
                          className="text-green-600 hover:text-green-800 dark:text-green-400"
                          title="Dupliquer"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteGroupe(groupe._id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400"
                          title="Supprimer"
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

      {/* Modal */}
      <GroupeModal
        isOpen={isOpen}
        onClose={closeModal}
        groupe={editingGroupe}
        onSave={async (data) => {
          try {
            if (editingGroupe) {
              await updateGroupe(editingGroupe._id, data);
            } else {
              await addGroupe(data);
            }
            closeModal();
          } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
          }
        }}
      />
    </div>
  );
};

export default GroupesPage;