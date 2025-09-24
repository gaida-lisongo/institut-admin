"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useAuthStore from '@/stores/authStore';
import { useAnneeStore } from '@/stores/anneeStore';
import { ChargeWithDetails } from '@/services/ChargeService';
import FicheCotation from '@/components/charges/FicheCotation';

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCharges.map((charge) => (
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

                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Progression:</span>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ 
                          width: `${charge.fiches.length > 0 ? (charge.fiches.filter(f => f.status === 'OK').length / charge.fiches.length) * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {charge.fiches.length > 0 ? Math.round((charge.fiches.filter(f => f.status === 'OK').length / charge.fiches.length) * 100) : 0}%
                    </span>
                  </div>
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