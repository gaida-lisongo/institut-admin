"use client";

import React from 'react';
import { Edit2, Trash2, Book, Users, GraduationCap, ExternalLink } from 'lucide-react';
import { Cycle } from '@/services/CycleService';
import { useCycleStore } from '@/stores/cycleStore';
import { useRouter } from 'next/navigation';

interface CycleListProps {
  cycles: Cycle[];
  loading: boolean;
  onEdit: (cycle: Cycle) => void;
  sectionId: string;
}

const CycleList: React.FC<CycleListProps> = ({ cycles, loading, onEdit, sectionId }) => {
  const { deleteCycle } = useCycleStore();
  const router = useRouter();

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cycle ?')) {
      try {
        await deleteCycle(id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleClasseClick = (cycleId: string, classeIndex: number) => {
    // Nouvelle route avec le format cycleId-classeIndex
    router.push(`/cycles/${sectionId}/classe/${cycleId}-${classeIndex}`);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="space-y-2 flex-1">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded"></div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map((j) => (
                  <div key={j} className="h-24 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (cycles.length === 0) {
    return (
      <div className="text-center py-12">
        <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          Aucun cycle trouvé
        </h3>
        <p className="text-gray-500 dark:text-gray-400">
          Commencez par créer un cycle de formation pour cette section.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {cycles.map((cycle) => (
        <div key={cycle._id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          {/* En-tête du cycle */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <Book className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {cycle.designation}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    {cycle.systeme}
                  </span>
                </div>
                {cycle.description && (
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {cycle.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{cycle.classes.length} classe(s)</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <GraduationCap className="w-4 h-4" />
                    <span>
                      {cycle.classes.reduce((total, classe) => total + classe.semestres.length, 0)} semestre(s)
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => onEdit(cycle)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  title="Modifier le cycle"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(cycle._id!)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  title="Supprimer le cycle"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Classes du cycle */}
          <div className="p-6">
            {cycle.classes.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500 dark:text-gray-400">
                  Aucune classe configurée pour ce cycle
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cycle.classes.map((classe, classeIndex) => (
                  <div
                    key={classeIndex}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:border-blue-300 group"
                    onClick={() => handleClasseClick(cycle._id!, classeIndex)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-1 group-hover:text-blue-600">
                          {classe.designation}
                        </h4>
                        {classe.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                            {classe.description}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                        <GraduationCap className="w-3 h-3" />
                        <span>{classe.semestres.length} semestre(s)</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 group-hover:text-blue-700">
                        <span>Gérer →</span>
                      </div>
                    </div>

                    {/* Indicateur de semestres */}
                    {classe.semestres.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {classe.semestres.slice(0, 4).map((_, index) => (
                          <div
                            key={index}
                            className="w-2 h-2 bg-green-400 rounded-full group-hover:bg-green-500 transition-colors"
                          />
                        ))}
                        {classe.semestres.length > 4 && (
                          <span className="text-xs text-gray-500 ml-1">
                            +{classe.semestres.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Info de navigation au survol */}
                    <div className="mt-2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Cliquez pour gérer les semestres
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CycleList;