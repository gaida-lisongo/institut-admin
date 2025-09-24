"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
import { useAnneeStore } from '@/stores/anneeStore';
import { ChargeWithDetails } from '@/services/ChargeService';
import FicheCotation from '@/components/charges/FicheCotation';
import CoursCard from '@/components/cours';

export default function ChargesByYearPage() {
  const params = useParams();
  const router = useRouter();
  const { user, menuData, fetchMenuData, isLoading } = useAuthStore();
  const { annees, fetchAnnees } = useAnneeStore();
  const [selectedCourse, setSelectedCourse] = useState<ChargeWithDetails | null>(null);
  const [showFicheCotation, setShowFicheCotation] = useState(false);
  const [filteredCharges, setFilteredCharges] = useState<ChargeWithDetails[]>([]);

  const anneeId = params.slug as string;

  useEffect(() => {
    if (!menuData && user?._id) {
      fetchMenuData(user._id);
    }
    fetchAnnees();
  }, [user, fetchMenuData, fetchAnnees, menuData]);

  useEffect(() => {
    if (menuData?.courses?.charges && anneeId) {
      const filtered = menuData.courses.charges.filter(charge => charge.annee._id === anneeId);
      setFilteredCharges(filtered);
    }
  }, [menuData, anneeId]);

  const handleCourseSelect = (charge: ChargeWithDetails) => {
    setSelectedCourse(charge);
    setShowFicheCotation(true);
  };

  const handleBackToCourses = () => {
    setShowFicheCotation(false);
    setSelectedCourse(null);
  };

  const currentAnnee = annees.find(a => a._id === anneeId);

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Charges d'Enseignement
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {currentAnnee ? (
                <>Année académique {currentAnnee.debut} - {currentAnnee.fin}</>
              ) : (
                'Chargement de l\'année académique...'
              )}
            </p>
          </div>
          <button
            onClick={() => router.push('/charges')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Toutes les années
          </button>
        </div>
      </div>

      {/* Statistiques rapides pour l'année */}
      {filteredCharges.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="text-blue-600 dark:text-blue-400 text-sm font-medium">Total Cours</div>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {filteredCharges.length}
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="text-green-600 dark:text-green-400 text-sm font-medium">Terminés</div>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {filteredCharges.filter(c => c.status === 'OK').length}
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
            <div className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">En cours</div>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {filteredCharges.filter(c => c.status === 'PENDING').length}
            </div>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="text-purple-600 dark:text-purple-400 text-sm font-medium">Étudiants</div>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {filteredCharges.reduce((total, charge) => total + charge.fiches.length, 0)}
            </div>
          </div>
        </div>
      )}

      {filteredCharges.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucune charge pour cette année
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Vous n'avez aucune charge d'enseignement assignée pour l'année académique{' '}
            {currentAnnee ? `${currentAnnee.debut} - ${currentAnnee.fin}` : 'sélectionnée'}.
          </p>
          <button
            onClick={() => router.push('/charges')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Voir toutes les années
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCharges.map((charge) => (
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