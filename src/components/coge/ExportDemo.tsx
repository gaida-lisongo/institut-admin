"use client";

import React from 'react';
import { Download } from 'lucide-react';
import AgentsExcelExport from '@/utils/AgentsExcelExport';
import { Personnel } from '@/types/personnel';

const ExportDemo = () => {
  // Données de test
  const sampleAgents: Personnel[] = [
    {
      _id: '1',
      matricule: 'ADM001',
      nom: 'MUKENDI',
      post_nom: 'KALALA',
      prenom: 'Jean',
      email: 'jean.mukendi@institut.cd',
      telephone: '+243123456789',
      sexe: 'M',
      nationalite: 'Congolaise',
      lieu_naissance: 'Kinshasa',
      date_naissance: '1985-03-15',
      province: 'Kinshasa',
      categorie: 'ADMINISTRATIF',
      grade: 'ATA1',
      niveau: 'Licence',
      photo: 'https://example.com/photo1.jpg',
      autorisations: [
        { type: 'DG', password: 'hashed', action: true, dateCreation: '2024-01-01' }
      ]
    },
    {
      _id: '2',
      matricule: 'SCI002',
      nom: 'KABAMBA',
      post_nom: 'MWANZA',
      prenom: 'Marie',
      email: 'marie.kabamba@institut.cd',
      telephone: '+243987654321',
      sexe: 'F',
      nationalite: 'Congolaise',
      lieu_naissance: 'Lubumbashi',
      date_naissance: '1990-07-22',
      province: 'Haut-Katanga',
      categorie: 'SCIENTIFIQUE',
      grade: 'ASS',
      niveau: 'Master',
      autorisations: []
    },
    {
      _id: '3',
      matricule: 'ACA003',
      nom: 'TSHILANDA',
      post_nom: 'NGOY',
      prenom: 'Pierre',
      email: 'pierre.tshilanda@institut.cd',
      telephone: '+243456789123',
      sexe: 'M',
      nationalite: 'Congolaise',
      lieu_naissance: 'Mbuji-Mayi',
      date_naissance: '1978-11-08',
      province: 'Kasaï-Oriental',
      categorie: 'ACADÉMIQUE',
      grade: 'P',
      niveau: 'Doctorat',
      autorisations: [
        { type: 'SGACAD', password: 'hashed', action: true, dateCreation: '2024-01-15' }
      ]
    }
  ];

  const handleTestExport = async () => {
    try {
      await AgentsExcelExport.downloadAgentsExport(
        sampleAgents,
        'Personnel Test',
        'Démonstration Export',
        'Demo_Export_Agents.xlsx'
      );
    } catch (error) {
      console.error('Erreur lors du test d\'export:', error);
      alert('Erreur lors du test d\'export');
    }
  };

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Test Export Excel des Agents
      </h2>
      
      <div className="space-y-4">
        <p className="text-gray-600 dark:text-gray-400">
          Cliquez sur le bouton ci-dessous pour tester l'export Excel avec des données d'exemple.
        </p>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-medium mb-2 text-gray-900 dark:text-white">
            Fonctionnalités de l'export :
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li>Feuille de résumé avec statistiques complètes</li>
            <li>Répartition par sexe, grade et nationalité</li>
            <li>Calcul de l'âge moyen</li>
            <li>Statistiques sur les photos et autorisations</li>
            <li>Liste détaillée de tous les agents</li>
            <li>Formatage professionnel avec couleurs et bordures</li>
          </ul>
        </div>
        
        <button
          onClick={handleTestExport}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          Tester l'Export Excel
        </button>
      </div>
    </div>
  );
};

export default ExportDemo;
