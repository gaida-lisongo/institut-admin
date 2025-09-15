"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAnneeStore } from "@/stores/anneeStore";
import { useChargeStore } from "@/stores/chargeStore";

export default function ChargesIndexPage() {
  const router = useRouter();
  const { annees, loading: anneesLoading, fetchAnnees } = useAnneeStore();
  const { fetchCharges } = useChargeStore();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [chargesCount, setChargesCount] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchAnnees();
    loadChargesCount();
  }, [fetchAnnees]);

  const loadChargesCount = async () => {
    try {
      // Charger toutes les charges pour compter par année
      await fetchCharges();
      // Note: Vous pourriez vouloir ajouter une méthode spécifique pour récupérer juste les statistiques
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error);
    }
  };

  const filteredAnnees = annees.filter(annee =>
    annee.annee.toString().includes(searchTerm) ||
    annee.designation.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNavigateToCharges = (anneeId: string) => {
    router.push(`/charges/${anneeId}`);
  };

  if (anneesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Charges Horaires
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sélectionnez une année académique pour gérer les charges horaires
          </p>
        </div>

        {/* Barre de recherche */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
          <div className="relative max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <span className="text-gray-400">🔍</span>
            </span>
            <input
              type="text"
              placeholder="Rechercher une année..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Liste des années */}
        {filteredAnnees.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune année académique trouvée
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              {annees.length === 0 
                ? "Aucune année académique n'est configurée."
                : "Aucune année ne correspond à votre recherche."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnees.map((annee) => (
              <div
                key={annee._id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleNavigateToCharges(annee._id)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 text-xl">
                        📚
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Année {annee.annee}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {annee.designation}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Gérer
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Début:</span>
                    <span className="text-gray-900 dark:text-white">{annee.debut}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Fin:</span>
                    <span className="text-gray-900 dark:text-white">{annee.fin}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Statut:</span>
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                      annee.statut === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {annee.statut === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigateToCharges(annee._id);
                  }}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <span>⚡</span>
                  <span>Gérer les charges</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}