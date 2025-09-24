"use client";

import React, { useEffect, useState } from 'react';
import useAuthStore from '@/stores/authStore';
import { ChargeWithDetails } from '@/services/ChargeService';
import FicheCotation from '@/components/charges/FicheCotation';

export default function ChargesPage() {
  const [ charges, setCharges ] = useState<ChargeWithDetails[]>([]);
  const { user, menuData, fetchMenuData, isLoading } = useAuthStore();
  const [selectedCourse, setSelectedCourse] = useState<ChargeWithDetails | null>(null);
  const [showFicheCotation, setShowFicheCotation] = useState(false);

  useEffect(() => {
    if (!menuData && user?._id) {
      fetchMenuData(user._id)
        .then(data => {
            const {
              courses
            } = data;
            setCharges(courses.charges);
        })
        .catch(error => console.error(error));
    }
    console.log("menuData", menuData);
    const {
        courses
    } = menuData || {};
    console.log("courses", courses);
    setCharges(courses.charges);
  }, [user]);

  const handleCourseSelect = (charge: ChargeWithDetails) => {
    setSelectedCourse(charge);
    setShowFicheCotation(true);
  };

  const handleBackToCourses = () => {
    setShowFicheCotation(false);
    setSelectedCourse(null);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-400">Chargement de vos charges...</span>
        </div>
      </div>
    );
  }

  // Rendu conditionnel : soit la liste des cours, soit la fiche de cotation
  if (showFicheCotation && selectedCourse) {
    return (
      <FicheCotation 
        charge={selectedCourse}
        onBack={handleBackToCourses}
      />
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Mes Charges d'Enseignement
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Toutes vos charges d'enseignement - Cliquez sur un cours pour coter les étudiants
        </p>
      </div>

      {charges.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📚</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune charge d'enseignement
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez actuellement aucune charge d'enseignement assignée.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {charges.map((charge) => (
            <div
              key={charge.chargeId}
              className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCourseSelect(charge)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    {charge.cours.titre}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {charge.cours.description}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  charge.status === 'OK' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                    : charge.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                }`}>
                  {charge.status}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Année académique:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {charge.annee.debut} - {charge.annee.fin}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Étudiants:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {charge.fiches.length} inscrit(s)
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Cotations complètes:</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {charge.fiches.filter(f => f.status === 'OK').length} / {charge.fiches.length}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center text-sm text-blue-600 dark:text-blue-400">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  Cliquer pour coter les étudiants
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}