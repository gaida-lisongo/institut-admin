"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { X, Plus, Edit2, Trash2, Book, Users, GraduationCap, Award } from 'lucide-react';
import useSemestreStore from '@/stores/semestreStore';
import { useUniteStore } from '@/stores/uniteStore';
import { Classe } from '@/services/CycleService';
import { SemestreFormData } from '@/services/SemestreService';
import { useCycleStore } from '@/stores/cycleStore';

interface ClasseSemestresModalProps {
  isOpen: boolean;
  onClose: () => void;
  classe: Classe;
  cycleId: string;
  classeIndex: number;
  onClasseUpdated: () => void;
}

interface SemestreFormState {
  designation: string;
  description: string;
  unites: string[];
  insription: Array<{ anneeId: string; produitId: string }>;
}

const ClasseSemestresModal: React.FC<ClasseSemestresModalProps> = ({
  isOpen,
  onClose,
  classe,
  cycleId,
  classeIndex,
  onClasseUpdated
}) => {
  const {
    semestres,
    currentSemestre,
    loading: semestreLoading,
    error,
    fetchSemestres,
    fetchSemestre,
    createSemestre,
    updateSemestre,
    deleteSemestre,
    clearError,
    clearCurrentSemestre
  } = useSemestreStore();

  const { unites, fetchUnites } = useUniteStore();
  const { addSemestreToClasse, removeSemestreFromClasse } = useCycleStore();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<SemestreFormState>({
    designation: '',
    description: '',
    unites: [],
    insription: []
  });

  const [selectedUnites, setSelectedUnites] = useState<string[]>([]);

  // Charger les données au montage
  useEffect(() => {
    if (isOpen) {
      fetchSemestres();
      fetchUnites();
    }
  }, [isOpen, fetchSemestres, fetchUnites]);

  // Filtrer les semestres de cette classe
  const classeSemestres = semestres.filter(s => classe.semestres.includes(s._id || ''));

  // Calculer le total des crédits de la classe
  const totalCredits = useMemo(() => {
    let total = 0;
    classeSemestres.forEach(semestre => {
      semestre.unites.forEach(uniteId => {
        const unite = unites.find(u => u._id === uniteId);
        if (unite) {
          total += unite.descripteur?.credit || 0;
        }
      });
    });
    return total;
  }, [classeSemestres, unites]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const data: SemestreFormData = {
        ...formData,
        unites: selectedUnites
      };

      if (editingId) {
        // Mode édition : juste mettre à jour le semestre
        await updateSemestre(editingId, data);
      } else {
        // Mode création : créer le semestre puis l'ajouter à la classe
        const newSemestre = await createSemestre(data);
        
        // Ajouter le semestre à la classe via le store (mise à jour optimiste)
        await addSemestreToClasse(cycleId, classeIndex, newSemestre._id || '');
      }
      
      resetForm();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      designation: '',
      description: '',
      unites: [],
      insription: []
    });
    setSelectedUnites([]);
    setShowForm(false);
    setEditingId(null);
    clearCurrentSemestre();
  };

  const handleEdit = async (id: string) => {
    try {
      await fetchSemestre(id);
      if (currentSemestre) {
        setFormData({
          designation: currentSemestre.designation,
          description: currentSemestre.description,
          unites: Array.isArray(currentSemestre.unites) 
            ? currentSemestre.unites.map(u => typeof u === 'string' ? u : u._id)
            : [],
          insription: currentSemestre.insription || []
        });
        setSelectedUnites(
          Array.isArray(currentSemestre.unites) 
            ? currentSemestre.unites.map(u => typeof u === 'string' ? u : u._id)
            : []
        );
        setEditingId(id);
        setShowForm(true);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du semestre:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce semestre ? Il sera également retiré de la classe.')) {
      try {
        // Supprimer le semestre de la base de données
        await deleteSemestre(id);
        
        // Retirer le semestre de la classe dans le cycle
        await removeSemestreFromClasse(cycleId, classeIndex, id);
        
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const toggleUnite = (uniteId: string) => {
    setSelectedUnites(prev => 
      prev.includes(uniteId) 
        ? prev.filter(id => id !== uniteId)
        : [...prev, uniteId]
    );
  };

  // Calculer les crédits du semestre sélectionné
  const getSelectedCredits = () => {
    return selectedUnites.reduce((total, uniteId) => {
      const unite = unites.find(u => u._id === uniteId);
      return total + (unite?.descripteur?.credit || 0);
    }, 0);
  };

  if (!isOpen) return null;

  const isLoading = semestreLoading || submitting;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900">
              Semestres - {classe.designation}
            </h2>
            <p className="text-sm text-gray-600 mt-1">{classe.description}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm">
              <div className="flex items-center space-x-1 text-blue-600">
                <Award className="w-4 h-4" />
                <span className="font-medium">{totalCredits} crédits total</span>
              </div>
              <div className="flex items-center space-x-1 text-green-600">
                <GraduationCap className="w-4 h-4" />
                <span>{classeSemestres.length} semestre(s)</span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
            <button
              onClick={clearError}
              className="text-red-500 hover:text-red-700 text-xs mt-1"
            >
              Fermer
            </button>
          </div>
        )}

        <div className="p-6">
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              {classeSemestres.length} semestre(s) configuré(s)
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isLoading || showForm}
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau semestre</span>
            </button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">
                  {editingId ? 'Modifier le semestre' : 'Nouveau semestre'}
                </h3>
                {submitting && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    <span className="text-sm">Traitement en cours...</span>
                  </div>
                )}
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Désignation *
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={submitting}
                      placeholder="Ex: Semestre 1, Semestre 2..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={submitting}
                      placeholder="Description du semestre"
                    />
                  </div>
                </div>

                {/* Unités d'enseignement */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Unités d'enseignement
                    </label>
                    <span className="text-sm text-blue-600 font-medium">
                      {getSelectedCredits()} crédits sélectionnés
                    </span>
                  </div>
                  <div className="border border-gray-300 rounded-lg p-4 max-h-48 overflow-y-auto">
                    {unites.length === 0 ? (
                      <p className="text-gray-500 text-sm">Aucune unité d'enseignement disponible</p>
                    ) : (
                      <div className="space-y-2">
                        {unites.map((unite) => (
                          <label key={unite._id} className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={selectedUnites.includes(unite._id || '')}
                              onChange={() => toggleUnite(unite._id || '')}
                              disabled={submitting}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <Book className="w-4 h-4 text-gray-400" />
                                <span className="font-medium text-sm">{unite.descripteur?.designation}</span>
                                <span className="text-xs bg-gray-100 px-2 py-1 rounded">{unite.descripteur?.code}</span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                  {unite.descripteur?.credit} crédits
                                </span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {unite.descripteur?.type}
                              </div>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedUnites.length} unité(s) sélectionnée(s)
                  </p>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={submitting}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center space-x-2"
                  >
                    {submitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>
                      {submitting 
                        ? (editingId ? 'Modification...' : 'Création...') 
                        : (editingId ? 'Mettre à jour' : 'Créer')}
                    </span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Liste des semestres */}
          <div className="space-y-4">
            {semestreLoading && classeSemestres.length === 0 ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Chargement des semestres...</p>
              </div>
            ) : classeSemestres.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Aucun semestre configuré pour cette classe</p>
                <p className="text-sm text-gray-400 mt-1">Cliquez sur "Nouveau semestre" pour commencer</p>
              </div>
            ) : (
              classeSemestres.map((semestre) => {
                const semestreCredits = semestre.unites.reduce((total, uniteId) => {
                  const unite = unites.find(u => u._id === uniteId);
                  return total + (unite?.descripteur?.credit || 0);
                }, 0);

                return (
                  <div key={semestre._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <GraduationCap className="w-5 h-5 text-blue-600" />
                          <h4 className="font-medium text-gray-900">{semestre.designation}</h4>
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {semestreCredits} crédits
                          </span>
                        </div>
                        {semestre.description && (
                          <p className="text-sm text-gray-600 mb-3">{semestre.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Book className="w-3 h-3" />
                            <span>{Array.isArray(semestre.unites) ? semestre.unites.length : 0} unité(s)</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-3 h-3" />
                            <span>{Array.isArray(semestre.insription) ? semestre.insription.length : 0} inscription(s)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(semestre._id!)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Modifier"
                          disabled={isLoading}
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(semestre._id!)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                          disabled={isLoading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClasseSemestresModal;