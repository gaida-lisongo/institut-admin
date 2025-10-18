"use client";
import React, { useState } from "react";
import MonthlyTarget from "@/components/ecommerce/MonthlyTarget";
import MonthlySalesChart from "@/components/ecommerce/MonthlySalesChart";
import StatisticsChart from "@/components/ecommerce/StatisticsChart";
import EtablissementsList from "@/components/etablissement/EtablissementsList";
import DemographicCard from "@/components/ecommerce/DemographicCard";
import { EcommerceMetricsEnhanced } from "@/components/ecommerce/EcommerceMetricsEnhanced";
import EtablissementTabsNavBar from "@/components/etablissement/EtablissementTabsNavBar";
import { EtablissementPopulated } from "@/types/etablissement";


export default function DashboardWithTabs() {
  const [etablissement, setEtablissement] = useState<EtablissementPopulated | null>(null);
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Barre de navigation avec onglets */}
      <EtablissementTabsNavBar 
        etablissement={etablissement} 
        setEtablissement={setEtablissement}
      />
      
      {/* Contenu principal du dashboard */}
      <div className="p-6">
        {etablissement ? (
          <div className="space-y-6">
            {/* Message de contexte */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-8 h-8 bg-blue-500 rounded-lg text-white font-bold text-sm">
                  {etablissement.sigle?.charAt(0) || 'E'}
                </div>
                <div>
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Données pour {etablissement.designation}
                  </h3>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Toutes les métriques ci-dessous sont filtrées pour cet établissement
                  </p>
                </div>
              </div>
            </div>

            {/* Grille du dashboard */}
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              <div className="col-span-12 space-y-6 xl:col-span-7">
                <EcommerceMetricsEnhanced />
                <MonthlySalesChart />
              </div>

              <div className="col-span-12 xl:col-span-5">
                <MonthlyTarget />
              </div>

              <div className="col-span-12">
                <EtablissementsList />
              </div>
            </div>
          </div>
        ) : (
          /* État de chargement ou aucun établissement sélectionné */
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Chargement des établissements...
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Veuillez patienter pendant que nous chargeons vos données.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
