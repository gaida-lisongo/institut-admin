"use client";
import React, { use, useEffect, useState } from "react";
import { useUniteStore } from "@/stores/uniteStore";
import { Unite } from "@/services/UniteService";
import UniteModal from "@/components/unites/UniteModal";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function UnitesPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { unites, fetchUnites, deleteUnite, loading } = useUniteStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "Obigatoire" | "Optionnelle">("all");

  useEffect(() => {
    fetchUnites();
  }, [fetchUnites]);

  // Filtrer les unités pour cette section/semestre
  const sectionUnites = unites.filter(unite => unite.semestreId === resolvedParams.slug);

  // Appliquer les filtres de recherche
  const filteredUnites = sectionUnites.filter(unite => {
    const matchesSearch = unite.descripteur.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unite.descripteur.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unite.descripteur.mention.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || unite.descripteur.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleDeleteUnite = async (uniteId: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette unité d'enseignement ?")) {
      try {
        await deleteUnite(uniteId);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  const getTotalCredits = () => {
    return filteredUnites.reduce((total, unite) => total + unite.descripteur.credit, 0);
  };

  const getUniteCountByType = () => {
    const counts = { Obigatoire: 0, Optionnelle: 0 };
    filteredUnites.forEach(unite => {
      counts[unite.descripteur.type]++;
    });
    return counts;
  };

  const uniteCounts = getUniteCountByType();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Unités d'Enseignement
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gestion des unités d'enseignement pour cette section
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Créer une unité
          </button>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {filteredUnites.length}
            </div>
            <div className="text-sm text-blue-600 dark:text-blue-400">
              Total unités
            </div>
          </div>
          
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {getTotalCredits()}
            </div>
            <div className="text-sm text-green-600 dark:text-green-400">
              Total crédits
            </div>
          </div>
          
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {uniteCounts.Obigatoire}
            </div>
            <div className="text-sm text-red-600 dark:text-red-400">
              Obligatoires
            </div>
          </div>
          
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {uniteCounts.Optionnelle}
            </div>
            <div className="text-sm text-purple-600 dark:text-purple-400">
              Optionnelles
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechercher par nom, code ou mention..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div className="md:w-48">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as typeof filterType)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tous les types</option>
              <option value="Obigatoire">Obligatoires</option>
              <option value="Optionnelle">Optionnelles</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des unités */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredUnites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune unité trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchTerm || filterType !== "all" 
                ? "Aucune unité ne correspond à vos critères de recherche."
                : "Commencez par créer votre première unité d'enseignement."
              }
            </p>
            {!searchTerm && filterType === "all" && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                ➕ Créer la première unité
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unité
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Crédits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Cours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUnites.map((unite) => (
                  <tr key={unite._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {unite.descripteur.designation}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {unite.descripteur.mention}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-mono text-sm text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                        {unite.descripteur.code}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {unite.descripteur.credit}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        unite.descripteur.type === 'Obigatoire' 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      }`}>
                        {unite.descripteur.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {unite.cours.length} cours
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <Link
                        href={`/unites/${resolvedParams.slug}/${unite._id}`}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        👁️ Voir
                      </Link>
                      <button
                        onClick={() => handleDeleteUnite(unite._id!)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        🗑️ Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de création */}
      <UniteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        sectionId={resolvedParams.slug}
      />
    </div>
  );
}