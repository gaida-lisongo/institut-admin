"use client";

import { useState, useEffect } from "react";
import { useCommandeStore } from "../../stores/commandeStore";

export default function CommandeStatistics() {
  const {
    stats,
    annees,
    selectedAnnee,
    isLoading,
    error,
    fetchStats,
    fetchAnnees,
    setSelectedAnnee,
    clearError
  } = useCommandeStore();

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetchAnnees();
    fetchStats();
  }, [fetchAnnees, fetchStats]);

  useEffect(() => {
    if (stats?.commandesParMois) {
      const formattedData = stats.commandesParMois.map((monthData, index) => ({
        name: monthData.mois,
        total: monthData.total,
        approuvees: monthData.approuvees,
        enAttente: monthData.enAttente,
        rejetees: monthData.rejetees
      }));
      setChartData(formattedData);
    }
  }, [stats]);

  const handleAnneeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const anneeId = e.target.value;
    setSelectedAnnee(anneeId || null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-gray-500">Chargement des statistiques...</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-6 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6">
      <div className="flex flex-col gap-4">
        {/* Header avec sélecteur d'année */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Statistiques des Commandes
            </h3>
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedAnnee || ''}
              onChange={handleAnneeChange}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm"
            >
              <option value="">Toutes les années</option>
              {annees.map((annee) => (
                <option key={annee._id} value={annee._id}>
                  {annee.debut} - {annee.fin}
                </option>
              ))}
            </select>

            <button
              onClick={() => fetchStats(selectedAnnee || undefined)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {/* Métriques générales */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {stats.totalCommandes}
              </div>
              <div className="text-sm text-blue-700 dark:text-blue-300">Total</div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.commandesApprouvees}
              </div>
              <div className="text-sm text-green-700 dark:text-green-300">Approuvées</div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.commandesEnAttente}
              </div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300">En attente</div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.commandesRejetees}
              </div>
              <div className="text-sm text-red-700 dark:text-red-300">Rejetées</div>
            </div>
          </div>
        )}

        {/* Graphique simplifié - Barres horizontales */}
        {chartData.length > 0 && (
          <div className="space-y-4">
            <h4 className="text-md font-medium text-gray-800 dark:text-white/90 mb-4">
              Évolution mensuelle
            </h4>
            
            <div className="space-y-3">
              {chartData.map((monthData, index) => {
                const maxValue = Math.max(...chartData.map(d => d.total));
                const percentage = (monthData.total / maxValue) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {monthData.name}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {monthData.total} commandes
                      </span>
                    </div>
                    
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    
                    {/* Détail par statut */}
                    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Approuvées: {monthData.approuvees}
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        En attente: {monthData.enAttente}
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        Rejetées: {monthData.rejetees}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Message si pas de données */}
        {!stats && !isLoading && (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucune donnée disponible pour cette période
          </div>
        )}
      </div>
    </div>
  );
}