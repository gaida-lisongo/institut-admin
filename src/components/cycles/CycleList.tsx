"use client";
import React from "react";
import { Cycle } from "@/services/CycleService";
import { useCycleStore } from "@/stores/cycleStore";

interface CycleListProps {
  cycles: Cycle[];
  loading: boolean;
  onEdit: (cycle: Cycle) => void;
  sectionId: string;
}

export default function CycleList({ cycles, loading, onEdit, sectionId }: CycleListProps) {
  const { deleteCycle } = useCycleStore();

  const handleDelete = async (cycle: Cycle) => {
    if (!cycle._id) return;
    
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le cycle "${cycle.designation}" ?`)) {
      try {
        await deleteCycle(cycle._id);
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Chargement des cycles...</span>
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
          Aucun cycle trouvé
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
          Cette section n'a encore aucun cycle de formation. Commencez par en créer un.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cycles.map((cycle) => (
        <div
          key={cycle._id}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                {cycle.designation}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                {cycle.description}
              </p>
              <div className="flex items-center space-x-2 mb-3">
                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                  {cycle.systeme}
                </span>
                <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                  {cycle.classes.length} classe(s)
                </span>
              </div>
            </div>
          </div>

          {/* Liste des classes */}
          {cycle.classes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Classes :
              </h4>
              <div className="space-y-1">
                {cycle.classes.map((classe, index) => (
                  <div key={index} className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded px-2 py-1">
                    <span className="font-medium">{classe.designation}</span>
                    {classe.semestres.length > 0 && (
                      <span className="ml-2 text-xs">({classe.semestres.length} semestre(s))</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => onEdit(cycle)}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Modifier
            </button>
            <button
              onClick={() => handleDelete(cycle)}
              className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Supprimer
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}