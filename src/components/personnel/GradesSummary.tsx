"use client";

import React from 'react';
import { GRADES_ADMINISTRATIF_OUVRIER, GRADES_SCIENTIFIQUE, GRADES_ACADEMIQUE } from '@/utils/gradeUtils';

const GradesSummary: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Système de Grades du Personnel
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Grades officiels selon les critères de recrutement
        </p>
      </div>

      {/* Personnel Administratif et Ouvrier */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Personnel Administratif et Ouvrier ({Object.keys(GRADES_ADMINISTRATIF_OUVRIER).length} grades)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(GRADES_ADMINISTRATIF_OUVRIER)
            .sort(([,a], [,b]) => a.ordre - b.ordre)
            .map(([code, info]) => (
            <div key={code} className="border border-blue-200 dark:border-blue-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                  {code}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ordre: {info.ordre}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {info.label}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {info.niveauFormation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Personnel Scientifique */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-purple-600 dark:text-purple-400 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Personnel Scientifique ({Object.keys(GRADES_SCIENTIFIQUE).length} grades)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(GRADES_SCIENTIFIQUE)
            .sort(([,a], [,b]) => a.ordre - b.ordre)
            .map(([code, info]) => (
            <div key={code} className="border border-purple-200 dark:border-purple-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded text-purple-800 dark:text-purple-200">
                  {code}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ordre: {info.ordre}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {info.label}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {info.niveauFormation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Personnel Académique */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
          </svg>
          Personnel Académique ({Object.keys(GRADES_ACADEMIQUE).length} grades)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(GRADES_ACADEMIQUE)
            .sort(([,a], [,b]) => a.ordre - b.ordre)
            .map(([code, info]) => (
            <div key={code} className="border border-green-200 dark:border-green-700 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm bg-green-100 dark:bg-green-900 px-2 py-1 rounded text-green-800 dark:text-green-200">
                  {code}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Ordre: {info.ordre}
                </span>
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                {info.label}
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {info.niveauFormation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4 text-center">
          Statistiques Globales
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {Object.keys(GRADES_ADMINISTRATIF_OUVRIER).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Grades Admin/Ouvrier
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {Object.keys(GRADES_SCIENTIFIQUE).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Grades Scientifiques
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {Object.keys(GRADES_ACADEMIQUE).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Grades Académiques
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
            <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
              {Object.keys(GRADES_ADMINISTRATIF_OUVRIER).length + 
               Object.keys(GRADES_SCIENTIFIQUE).length + 
               Object.keys(GRADES_ACADEMIQUE).length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Grades
            </div>
          </div>
        </div>
      </div>

      {/* Légende des codes */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Légende des Codes de Grades
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Administratif/Ouvrier</h3>
            <ul className="text-sm space-y-1">
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">AGA</span> = Agent d'Administration</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">ATA</span> = Attaché d'Administration</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">AA</span> = Agent Auxiliaire</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">CB</span> = Chef de Bureau</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">CDS</span> = Chef de Service</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Scientifique</h3>
            <ul className="text-sm space-y-1">
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">CPP</span> = Chargé des Pratiques Professionnelles</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">ASS</span> = Assistant</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">CT</span> = Chef de Travaux</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">Académique</h3>
            <ul className="text-sm space-y-1">
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">P</span> = Professeur</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">PO</span> = Professeur Ordinaire</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">PA</span> = Professeur Associé</li>
              <li><span className="font-mono bg-gray-100 dark:bg-gray-700 px-1 rounded">PE</span> = Professeur Émérite</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradesSummary;
