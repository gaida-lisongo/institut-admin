"use client";

import { useState, useEffect } from "react";
import { useCommandeStore } from "../../stores/commandeStore";

export default function CommandeStatistics() {
  const { commandes, isLoading, error } = useCommandeStore();

  // Regroupement par mois
  const commandesParMois: { [key: string]: number } = {};
  commandes.forEach((commande) => {
    if (commande.createdAt) {
      const date = new Date(commande.createdAt);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // ex: 2025-09
      commandesParMois[key] = (commandesParMois[key] || 0) + 1;
    }
  });

  // Générer un tableau trié
  const chartData = Object.entries(commandesParMois)
    .map(([key, total]) => ({ key, total }))
    .sort((a, b) => a.key.localeCompare(b.key));

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
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-4">
          Statistiques des Commandes par Mois
        </h3>
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
        {chartData.length > 0 ? (
          <div className="space-y-3">
            {chartData.map((monthData, index) => (
              <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {monthData.key}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {monthData.total} commandes
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Aucune donnée disponible
          </div>
        )}
      </div>
    </div>
  );
}