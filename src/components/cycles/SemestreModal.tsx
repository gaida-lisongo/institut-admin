"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import useSemestreStore from '@/stores/semestreStore';
import { useCycleStore } from '@/stores/cycleStore';
import { SemestreFormData } from '@/services/SemestreService';

interface SemestreModalProps {
  isOpen: boolean;
  onClose: () => void;
  semestre?: any;
  cycleId: string;
  classeIndex: number;
}

const SemestreModal: React.FC<SemestreModalProps> = ({
  isOpen,
  onClose,
  semestre,
  cycleId,
  classeIndex
}) => {
  const { 
    createSemestre, 
    updateSemestre, 
    loading 
  } = useSemestreStore();
  
  const { addSemestreToClasse } = useCycleStore();

  const [formData, setFormData] = useState({
    designation: '',
    description: ''
  });

  useEffect(() => {
    if (semestre) {
      setFormData({
        designation: semestre.designation || '',
        description: semestre.description || ''
      });
    } else {
      setFormData({
        designation: '',
        description: ''
      });
    }
  }, [semestre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const data: SemestreFormData = {
        ...formData,
        unites: semestre?.unites || [],
        insription: semestre?.insription || []
      };

      if (semestre) {
        // Mode édition
        await updateSemestre(semestre._id, data);
      } else {
        // Mode création
        const newSemestre = await createSemestre(data);
        await addSemestreToClasse(cycleId, classeIndex, newSemestre._id || '');
      }
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {semestre ? 'Modifier le semestre' : 'Nouveau semestre'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              placeholder="Ex: Semestre 1, Semestre 2..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Description du semestre"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Enregistrement...' : semestre ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SemestreModal;