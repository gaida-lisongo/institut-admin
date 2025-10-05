"use client";

import React from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { useCoursStore } from '@/stores/coursStore';
import { sampleSessions } from '@/utils/sessionTestData';

const SessionTestDataButton: React.FC = () => {
  const { sessions, addSession } = useSessionStore();
  const { cours } = useCoursStore();

  const handleLoadTestData = () => {
    if (sessions.length > 0) {
      const confirm = window.confirm(
        'Des sessions existent déjà. Voulez-vous ajouter les données de test ?'
      );
      if (!confirm) return;
    }

    if (cours.length === 0) {
      alert('Veuillez d\'abord initialiser les cours avant de charger les données de test.');
      return;
    }

    // Ajouter les sessions de test
    sampleSessions.forEach(session => {
      // Vérifier que le cours existe
      const coursExists = cours.some(c => c._id === session.coursId);
      if (coursExists) {
        addSession({
          designation: session.designation,
          statut: session.statut,
          coursId: session.coursId,
          questions: session.questions.map(q => ({
            enonce: q.enonce,
            choix: q.choix,
            reponse: q.reponse,
            pts: q.pts,
          })),
        });
      }
    });

    alert(`${sampleSessions.length} sessions de test ajoutées avec succès !`);
  };

  return (
    <button
      onClick={handleLoadTestData}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
      </svg>
      Charger sessions test
    </button>
  );
};

export default SessionTestDataButton;
