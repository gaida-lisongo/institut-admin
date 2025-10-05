"use client";

import React from 'react';
import { useEtudiantStore } from '@/stores/etudiantStore';
import { useClasseStore } from '@/stores/classeStore';
import { sampleEtudiants } from '@/utils/testData';

const TestDataButton: React.FC = () => {
  const { etudiants, addEtudiant } = useEtudiantStore();
  const { classes } = useClasseStore();

  const handleLoadTestData = () => {
    if (etudiants.length > 0) {
      const confirm = window.confirm(
        'Des étudiants existent déjà. Voulez-vous ajouter les données de test ?'
      );
      if (!confirm) return;
    }

    if (classes.length === 0) {
      alert('Veuillez d\'abord créer des classes avant de charger les données de test.');
      return;
    }

    // Ajouter les étudiants de test
    sampleEtudiants.forEach(etudiant => {
      // Vérifier que la classe existe
      const classeExists = classes.some(c => c._id === etudiant.classeId);
      if (classeExists) {
        addEtudiant({
          nom: etudiant.nom,
          prenom: etudiant.prenom,
          email: etudiant.email,
          sexe: etudiant.sexe,
          classeId: etudiant.classeId,
        });
      }
    });

    alert(`${sampleEtudiants.length} étudiants de test ajoutés avec succès !`);
  };

  return (
    <button
      onClick={handleLoadTestData}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 7.172V5L8 4z" />
      </svg>
      Charger données test
    </button>
  );
};

export default TestDataButton;
