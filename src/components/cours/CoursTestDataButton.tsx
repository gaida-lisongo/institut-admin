"use client";

import React from 'react';
import { useCoursStore } from '@/stores/coursStore';

const CoursTestDataButton: React.FC = () => {
  const { cours, initializeDefaultCours } = useCoursStore();

  const handleLoadTestData = () => {
    if (cours.length > 0) {
      const confirm = window.confirm(
        'Des cours existent déjà. Voulez-vous réinitialiser avec les cours par défaut ?'
      );
      if (!confirm) return;
    }

    initializeDefaultCours();
    alert('Cours par défaut chargés avec succès !');
  };

  return (
    <button
      onClick={handleLoadTestData}
      className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
      Charger cours par défaut
    </button>
  );
};

export default CoursTestDataButton;
