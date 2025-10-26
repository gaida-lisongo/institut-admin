'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, FileText, Loader2 } from 'lucide-react';
import { Annee, AnneeFormData } from '@/types/annee';
import { useAnneeStore } from '@/stores/anneeStore';

interface AnneeModalProps {
  isOpen: boolean;
  onClose: () => void;
  annee?: Annee | null;
  mode: 'create' | 'edit' | 'view';
}

export default function AnneeModal({ isOpen, onClose, annee, mode }: AnneeModalProps) {
  const [formData, setFormData] = useState<AnneeFormData>({
    debut: new Date().getFullYear(),
    fin: new Date().getFullYear() + 1,
    description: '',
    statut: 'planifiee',
    calendrier: [],
    fraisAcademiques: []
  });

  const { createAnnee, updateAnnee, loading } = useAnneeStore();

  // Initialiser le formulaire avec les données de l'année si en mode édition
  useEffect(() => {
    if (annee && (mode === 'edit' || mode === 'view')) {
      setFormData({
        debut: annee.debut,
        fin: annee.fin,
        description: annee.description,
        statut: annee.statut,
        calendrier: annee.calendrier || [],
        fraisAcademiques: annee.fraisAcademiques || []
      });
    } else if (mode === 'create') {
      // Réinitialiser pour une nouvelle année
      const currentYear = new Date().getFullYear();
      setFormData({
        debut: currentYear,
        fin: currentYear + 1,
        description: `Année académique ${currentYear}-${currentYear + 1}`,
        statut: 'planifiee',
        calendrier: [],
        fraisAcademiques: []
      });
    }
  }, [annee, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description.trim()) {
      alert('Veuillez saisir une description pour l\'année académique.');
      return;
    }

    if (formData.debut >= formData.fin) {
      alert('L\'année de fin doit être supérieure à l\'année de début.');
      return;
    }

    try {
      if (mode === 'create') {
        const newAnnee = await createAnnee(formData);
        if (newAnnee) {
          onClose();
        }
      } else if (mode === 'edit' && annee) {
        const updatedAnnee = await updateAnnee(annee._id, formData);
        if (updatedAnnee) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleInputChange = (field: keyof AnneeFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateDescription = () => {
    if (formData.debut && formData.fin) {
      const description = `Année académique ${formData.debut}-${formData.fin}`;
      handleInputChange('description', description);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nouvelle Année Académique' : 
                mode === 'edit' ? 'Modifier l\'Année Académique' : 
                'Détails de l\'Année Académique';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 1000 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
          style={{ zIndex: 1001 }}
        />

        {/* Modal Container */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal */}
        <div 
          className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
          style={{ zIndex: 1002 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Période académique */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Année de début *
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2050"
                  value={formData.debut}
                  onChange={(e) => handleInputChange('debut', parseInt(e.target.value))}
                  onBlur={generateDescription}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Année de fin *
                </label>
                <input
                  type="number"
                  min="2020"
                  max="2050"
                  value={formData.fin}
                  onChange={(e) => handleInputChange('fin', parseInt(e.target.value))}
                  onBlur={generateDescription}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description *
                </label>
                {!isReadOnly && (
                  <button
                    type="button"
                    onClick={generateDescription}
                    className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Générer automatiquement
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder="Ex: Année académique 2024-2025"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                required
              />
            </div>

            {/* Statut */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Statut *
              </label>
              <select
                value={formData.statut}
                onChange={(e) => handleInputChange('statut', e.target.value as Annee['statut'])}
                disabled={isReadOnly}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                required
              >
                <option value="planifiee">Planifiée</option>
                <option value="active">Active</option>
                <option value="terminee">Terminée</option>
              </select>
            </div>

            {/* Informations supplémentaires */}
            {mode !== 'create' && annee && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Informations supplémentaires
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Événements:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {annee.calendrier?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Frais académiques:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {annee.fraisAcademiques?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Créé le:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {new Date(annee.dateCreation).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Modifié le:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {new Date(annee.dateModification).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {isReadOnly ? 'Fermer' : 'Annuler'}
              </button>
              
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {mode === 'create' ? 'Créer' : 'Modifier'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
