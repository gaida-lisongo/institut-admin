"use client";

import React, { useEffect } from "react";
import { ArrowDownIcon, ArrowUpIcon, BoxIconLine, GroupIcon } from "@/icons";
import { Book, GraduationCap, FileText, Calendar } from "lucide-react";
import { useProduitStore } from "../../stores/produitStore";
import { useUniteStore } from "../../stores/uniteStore";
import { useCoursStore } from "../../stores/coursStore";

export const EcommerceMetrics = () => {
  const { produits, fetchProduits } = useProduitStore();
  const { unites, fetchUnites } = useUniteStore();
  const { cours, fetchCours } = useCoursStore();

  // Charger les données au montage
  useEffect(() => {
    fetchProduits();
    fetchUnites();
    fetchCours();
  }, [fetchProduits, fetchUnites, fetchCours]);

  // Filtrer les produits par catégorie
  const sujets = produits.filter(p => p.categorie.includes('sujet'));
  const stages = produits.filter(p => p.categorie.includes('stage'));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">
      {/* Sujets */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl dark:bg-blue-800/20">
          <FileText className="text-blue-600 size-6 dark:text-blue-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Sujets de recherche</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {sujets.length}
            </h4>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowUpIcon className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500 font-medium">+12%</span>
          </div>
        </div>
      </div>

      {/* Stages */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl dark:bg-green-800/20">
          <Calendar className="text-green-600 size-6 dark:text-green-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Stages disponibles</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {stages.length}
            </h4>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowUpIcon className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500 font-medium">+8%</span>
          </div>
        </div>
      </div>

      {/* Unités d'enseignement */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl dark:bg-purple-800/20">
          <Book className="text-purple-600 size-6 dark:text-purple-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Unités d'enseignement</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {unites.length}
            </h4>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowDownIcon className="w-3 h-3 text-red-500" />
            <span className="text-xs text-red-500 font-medium">-3%</span>
          </div>
        </div>
      </div>

      {/* Cours */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl dark:bg-orange-800/20">
          <GraduationCap className="text-orange-600 size-6 dark:text-orange-400" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">Cours disponibles</span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {cours.length}
            </h4>
          </div>
          <div className="flex items-center space-x-1">
            <ArrowUpIcon className="w-3 h-3 text-green-500" />
            <span className="text-xs text-green-500 font-medium">+15%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
