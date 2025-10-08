"use client";

import React, { useState } from 'react';
import { Personnel } from '@/types/personnel';
import { getGradesByCategorie, getGradeLabel, getGradeDescription, getGradeNiveauFormation } from '@/utils/gradeUtils';

const GradeDemo: React.FC = () => {
  const [selectedCategorie, setSelectedCategorie] = useState<Personnel['categorie']>('ADMINISTRATIF');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const categories: Array<{ value: Personnel['categorie']; label: string }> = [
    { value: 'ADMINISTRATIF', label: 'Personnel Administratif' },
    { value: 'OUVRIER', label: 'Personnel Ouvrier' },
    { value: 'SCIENTIFIQUE', label: 'Personnel Scientifique' },
    { value: 'ACADEMIQUE', label: 'Personnel Académique' }
  ];

  const grades = getGradesByCategorie(selectedCategorie);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Démonstration du Système de Grades
        </h2>

        {/* Sélection de catégorie */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Catégorie de Personnel
          </label>
          <select
            value={selectedCategorie}
            onChange={(e) => {
              setSelectedCategorie(e.target.value as Personnel['categorie']);
              setSelectedGrade('');
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sélection de grade */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Grade (optionnel)
          </label>
          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">Sélectionner un grade</option>
            {grades.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </div>

        {/* Informations sur le grade sélectionné */}
        {selectedGrade && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-2">
              Informations sur le Grade
            </h3>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Label:</span> {getGradeLabel(selectedGrade as any, selectedCategorie)}</p>
              <p><span className="font-medium">Description:</span> {getGradeDescription(selectedGrade as any, selectedCategorie)}</p>
              <p><span className="font-medium">Niveau de formation requis:</span> {getGradeNiveauFormation(selectedGrade as any, selectedCategorie)}</p>
            </div>
          </div>
        )}

        {/* Liste de tous les grades disponibles */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tous les Grades Disponibles pour {categories.find(c => c.value === selectedCategorie)?.label}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {grades.map((grade, index) => (
              <div
                key={grade.value}
                className={`border rounded-lg p-4 ${
                  selectedGrade === grade.value
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {grade.label}
                  </h4>
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    Ordre: {grade.ordre}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {grade.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500">
                  <span className="font-medium">Formation requise:</span> {grade.niveauFormation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Statistiques */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Statistiques
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {grades.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Grades disponibles
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {grades.filter(g => g.ordre <= 3).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Grades débutants
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {grades.filter(g => g.ordre > 3 && g.ordre <= 6).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Grades intermédiaires
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {grades.filter(g => g.ordre > 6).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Grades supérieurs
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradeDemo;
