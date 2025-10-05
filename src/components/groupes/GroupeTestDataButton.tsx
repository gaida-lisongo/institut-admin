"use client";

import React, { useState } from 'react';
import { useGroupeStore } from '@/stores/groupeStore';
import { useSessionStore } from '@/stores/sessionStore';
import { useEtudiantStore } from '@/stores/etudiantStore';

const GroupeTestDataButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { addGroupe, addEtudiantToGroupe } = useGroupeStore();
  const { sessions } = useSessionStore();
  const { etudiants } = useEtudiantStore();

  const loadTestData = async () => {
    if (sessions.length === 0) {
      alert('Veuillez d\'abord charger des sessions de test');
      return;
    }

    setLoading(true);
    try {
      // Créer des groupes de test
      const testGroupes = [
        {
          designation: 'Groupe A - Contrôle Mathématiques',
          sessionId: sessions[0]._id,
          description: 'Premier groupe pour le contrôle de mathématiques',
          dureeMaximale: 60,
          tentativesMax: 1
        },
        {
          designation: 'Groupe B - Évaluation Français',
          sessionId: sessions[1] ? sessions[1]._id : sessions[0]._id,
          description: 'Groupe d\'évaluation en français',
          dureeMaximale: 90,
          tentativesMax: 2
        },
        {
          designation: 'Groupe C - Test Histoire',
          sessionId: sessions[2] ? sessions[2]._id : sessions[0]._id,
          description: 'Test de connaissances en histoire',
          dureeMaximale: 45,
          tentativesMax: 1
        }
      ];

      // Créer les groupes
      const groupeIds: string[] = [];
      for (const groupeData of testGroupes) {
        const groupeId = await addGroupe(groupeData);
        groupeIds.push(groupeId);
      }

      // Ajouter quelques étudiants aux groupes si disponibles
      if (etudiants.length > 0) {
        // Répartir les étudiants dans les groupes
        const etudiantsParGroupe = Math.ceil(etudiants.length / groupeIds.length);
        
        for (let i = 0; i < groupeIds.length; i++) {
          const startIndex = i * etudiantsParGroupe;
          const endIndex = Math.min(startIndex + etudiantsParGroupe, etudiants.length);
          
          for (let j = startIndex; j < endIndex; j++) {
            if (etudiants[j]) {
              try {
                await addEtudiantToGroupe(groupeIds[i], etudiants[j]._id);
              } catch (error) {
                console.warn(`Erreur lors de l'ajout de l'étudiant ${etudiants[j].nom}:`, error);
              }
            }
          }
        }
      }

      alert(`${testGroupes.length} groupes de test créés avec succès !`);
    } catch (error) {
      console.error('Erreur lors du chargement des données de test:', error);
      alert('Erreur lors du chargement des données de test');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={loadTestData}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
    >
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      {loading ? 'Chargement...' : 'Données de test'}
    </button>
  );
};

export default GroupeTestDataButton;
