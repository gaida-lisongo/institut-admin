"use client";

import React, { useEffect, useMemo } from 'react';
import { Edit2, Trash2, Settings, Calendar, Award, Book, Users } from 'lucide-react';
import { Classe } from '@/services/CycleService';
import useSemestreStore from '@/stores/semestreStore';
import { useUniteStore } from '@/stores/uniteStore';
import { useCycleStore } from '@/stores/cycleStore';

interface SemestreListProps {
  classe: Classe;
  cycleId: string;
  classeIndex: number;
  onEdit: (semestre: any) => void;
  onManageUnites: (semestre: any) => void;
}

const SemestreList: React.FC<SemestreListProps> = ({
  classe,
  cycleId,
  classeIndex,
  onEdit,
  onManageUnites
}) => {
  const { 
    semestres, 
    loading, 
    fetchSemestres, 
    deleteSemestre 
  } = useSemestreStore();
  
  const { unites, fetchUnites } = useUniteStore();
  const { removeSemestreFromClasse } = useCycleStore();

  useEffect(() => {
    fetchSemestres();
    fetchUnites();
  }, [fetchSemestres, fetchUnites]);

  // Filtrer les semestres de cette classe
  const classeSemestres = semestres.filter(s => classe.semestres.includes(s._id || ''));

  const handleDelete = async (semestre: any) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer le semestre "${semestre.designation}" ?`)) {
      try {
        await deleteSemestre(semestre._id);
        await removeSemestreFromClasse(cycleId, classeIndex, semestre._id);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading && classeSemestres.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2 flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
              <div className="flex space-x-2">
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
                <div className="h-8 w-8 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="h-16 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (classeSemestres.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Aucun semestre configuré
        </h3>
        <p className="text-gray-500">
          Commencez par créer un semestre pour cette classe.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {classeSemestres.map((semestre) => {
        // Calculer les statistiques du semestre
        const semestreUnites = unites.filter(u => semestre.unites.includes(u._id || ''));
        const totalCredits = semestreUnites.reduce((sum, unite) => sum + (unite.descripteur?.credit || 0), 0);
        const obligatoires = semestreUnites.filter(u => u.descripteur?.type === 'Obigatoire').length;
        const optionnelles = semestreUnites.filter(u => u.descripteur?.type === 'Optionnelle').length;

        return (
          <div key={semestre._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200">
            {/* En-tête du semestre */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-6 h-6 text-blue-600" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      {semestre.designation}
                    </h3>
                    <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                      {totalCredits} crédits
                    </span>
                  </div>
                  {semestre.description && (
                    <p className="text-gray-600 mb-3">{semestre.description}</p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => onManageUnites(semestre)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Gérer les unités"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onEdit(semestre)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier le semestre"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(semestre)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer le semestre"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Statistiques du semestre */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Book className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Total UE</span>
                  </div>
                  <p className="text-lg font-bold text-blue-700">{semestreUnites.length}</p>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Award className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Obligatoires</span>
                  </div>
                  <p className="text-lg font-bold text-green-700">{obligatoires}</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Book className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-900">Optionnelles</span>
                  </div>
                  <p className="text-lg font-bold text-yellow-700">{optionnelles}</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-1">
                    <Users className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Inscriptions</span>
                  </div>
                  <p className="text-lg font-bold text-purple-700">{semestre.insription?.length || 0}</p>
                </div>
              </div>
            </div>

            {/* Liste des unités (aperçu) */}
            {semestreUnites.length > 0 && (
              <div className="p-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Unités d'enseignement ({semestreUnites.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {semestreUnites.slice(0, 6).map((unite) => (
                    <div key={unite._id} className="bg-gray-50 rounded p-3 border">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {unite.descripteur?.designation}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {unite.descripteur?.credit}c
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">{unite.descripteur?.code}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          unite.descripteur?.type === 'Obigatoire' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {unite.descripteur?.type}
                        </span>
                      </div>
                    </div>
                  ))}
                  {semestreUnites.length > 6 && (
                    <div className="bg-gray-100 rounded p-3 border border-dashed border-gray-300 flex items-center justify-center">
                      <span className="text-sm text-gray-500">
                        +{semestreUnites.length - 6} autres...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SemestreList;