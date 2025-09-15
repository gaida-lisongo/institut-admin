"use client";
import React, { use, useEffect, useState } from "react";
import { useUniteStore } from "@/stores/uniteStore";
import { Unite } from "@/services/UniteService";
import UniteDetails from "@/components/unites/UniteDetails";

interface PageProps {
  params: Promise<{
    slug: string;
    unite: string;
  }>;
}

export default function UnitePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { unites, loadUnites, loading } = useUniteStore();
  const [unite, setUnite] = useState<Unite | null>(null);

  useEffect(() => {
    loadUnites();
  }, [loadUnites]);

  useEffect(() => {
    if (unites.length > 0) {
      const foundUnite = unites.find((u) => u._id === resolvedParams.unite);
      setUnite(foundUnite || null);
    }
  }, [unites, resolvedParams.unite]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!unite) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Unité non trouvée
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          L'unité d'enseignement demandée n'existe pas ou n'est plus disponible.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {unite.descripteur.designation}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
              <span className="flex items-center">
                📚{" "}
                <span className="ml-1 font-mono">{unite.descripteur.code}</span>
              </span>
              <span className="flex items-center">
                🎓{" "}
                <span className="ml-1">{unite.descripteur.mention}</span>
              </span>
              <span className="flex items-center">
                ⭐{" "}
                <span className="ml-1">{unite.descripteur.credit} crédits</span>
              </span>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  unite.descripteur.type === "Obigatoire"
                    ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {unite.descripteur.type}
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {unite.cours.length} cours assigné
              {unite.cours.length > 1 ? "s" : ""}
            </div>
            {unite.createdAt && (
              <div className="text-xs text-gray-500 dark:text-gray-500">
                Créé le{" "}
                {new Date(unite.createdAt).toLocaleDateString("fr-FR")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <UniteDetails unite={unite} sectionId={resolvedParams.slug} />
    </div>
  );
}