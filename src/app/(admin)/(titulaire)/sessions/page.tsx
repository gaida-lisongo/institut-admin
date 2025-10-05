"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSessionStore } from '@/stores/sessionStore';
import { useCoursStore } from '@/stores/coursStore';
import { useModal } from '@/hooks/useModal';
import { Session, SESSION_STATUTS } from '@/types/session';
import SessionModal from '@/components/sessions/SessionModal';
import SessionTestDataButton from '@/components/sessions/SessionTestDataButton';
import MainNavigation from '@/components/navigation/MainNavigation';

const SessionsPage: React.FC = () => {
  const {
    sessions,
    fetchSessions,
    addSession,
    updateSession,
    deleteSession,
    duplicateSession,
    loading,
    error,
  } = useSessionStore();

  const { cours, initializeDefaultCours } = useCoursStore();
  const { isOpen, openModal, closeModal } = useModal();
  
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCours, setSelectedCours] = useState('');
  const [selectedStatut, setSelectedStatut] = useState('');

  useEffect(() => {
    fetchSessions();
    initializeDefaultCours();
  }, [fetchSessions, initializeDefaultCours]);

  const handleOpenModal = (session?: Session) => {
    setSelectedSession(session || null);
    openModal();
  };

  const handleSubmit = (sessionData: any) => {
    if (selectedSession) {
      updateSession(selectedSession._id, sessionData);
    } else {
      addSession(sessionData);
    }
    setSelectedSession(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      deleteSession(id);
    }
  };

  const handleDuplicate = (id: string) => {
    duplicateSession(id);
  };

  const getCoursName = (coursId: string) => {
    const coursItem = cours.find(c => c._id === coursId);
    return coursItem ? coursItem.designation : 'Cours inconnu';
  };

  const getStatutInfo = (statut: string) => {
    return SESSION_STATUTS.find(s => s.value === statut) || SESSION_STATUTS[0];
  };

  const filteredSessions = sessions.filter(session => {
    const matchesSearch = 
      session.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCoursName(session.coursId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCours = selectedCours === '' || session.coursId === selectedCours;
    const matchesStatut = selectedStatut === '' || session.statut === selectedStatut;
    return matchesSearch && matchesCours && matchesStatut;
  });

  return (
    <div className="p-6">
      <MainNavigation />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Interrogations
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez vos séries d'interrogation et leurs questions
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {process.env.NODE_ENV === 'development' && <SessionTestDataButton />}
          <button
            onClick={() => handleOpenModal()}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Créer une session
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Filtres */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <input
            type="text"
            placeholder="Rechercher par nom ou cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
        <div>
          <select
            value={selectedCours}
            onChange={(e) => setSelectedCours(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">Tous les cours</option>
            {cours.map((coursItem) => (
              <option key={coursItem._id} value={coursItem._id}>
                {coursItem.designation}
              </option>
            ))}
          </select>
        </div>
        <div>
          <select
            value={selectedStatut}
            onChange={(e) => setSelectedStatut(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">Tous les statuts</option>
            {SESSION_STATUTS.map((statut) => (
              <option key={statut.value} value={statut.value}>
                {statut.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Statistiques */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Sessions</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{sessions.length}</p>
            </div>
          </div>
        </div>
        
        {SESSION_STATUTS.slice(0, 3).map((statut) => (
          <div key={statut.value} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="flex items-center">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-${statut.color}-100 dark:bg-${statut.color}-900/20`}>
                <svg className={`h-6 w-6 text-${statut.color}-600 dark:text-${statut.color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{statut.label}</p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {sessions.filter(s => s.statut === statut.value).length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table des sessions */}
      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Session
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Cours
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Questions
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Score Max
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
                  {filteredSessions.map((session) => {
                    const statutInfo = getStatutInfo(session.statut);
                    return (
                      <tr key={session._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {session.designation}
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {getCoursName(session.coursId)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold text-${statutInfo.color}-800 bg-${statutInfo.color}-100 dark:text-${statutInfo.color}-200 dark:bg-${statutInfo.color}-900/20`}>
                            {statutInfo.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {session.questions.length} question(s)
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {session.maximum} pts
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                          <Link
                            href={`/sessions/${session._id}`}
                            className="mr-3 text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                          >
                            Détails
                          </Link>
                          <button
                            onClick={() => handleOpenModal(session)}
                            className="mr-3 text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDuplicate(session._id)}
                            className="mr-3 text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            Dupliquer
                          </button>
                          <button
                            onClick={() => handleDelete(session._id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredSessions.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedCours || selectedStatut
                    ? 'Aucune session trouvée avec ces critères de recherche.'
                    : 'Aucune session trouvée. Cliquez sur "Créer une session" pour commencer.'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <SessionModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        session={selectedSession}
      />
    </div>
  );
};

export default SessionsPage;