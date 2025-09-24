"use client";

import React, { useEffect, useState } from 'react';
import useAuthStore from '@/stores/authStore';
import { ChargeWithDetails } from '@/services/ChargeService';
import FicheCotation from '@/components/charges/FicheCotation';
import CoursCard from '@/components/cours';

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
            <CoursCard 
              key={charge.chargeId}
              charge={charge}
              handleCourseSelect={handleCourseSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}