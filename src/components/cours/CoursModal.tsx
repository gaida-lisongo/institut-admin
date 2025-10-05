"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Cours } from '@/types/session';

interface CoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (cours: Omit<Cours, '_id'>) => void;
  cours?: Cours | null;
}

// Unités d'enseignement prédéfinies
const UNITES_ENSEIGNEMENT = [
  'Sciences',
  'Lettres',
  'Sciences Humaines',
  'Langues',
  'Sport',
  'Arts',
  'Technologie',
  'Économie',
  'Droit',
  'Médecine'
];

const CoursModal: React.FC<CoursModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  cours,
}) => {
  const [formData, setFormData] = useState({
    designation: '',
    credit: 1,
    unite: '',
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (cours) {
      setFormData({
        designation: cours.designation,
        credit: cours.credit,
        unite: cours.unite,
      });
    } else {
      setFormData({
        designation: '',
        credit: 1,
        unite: '',
      });
    }
    setErrors({});
  }, [cours, isOpen]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.designation.trim()) {
      newErrors.designation = 'Le nom du cours est obligatoire';
    } else if (formData.designation.length < 2) {
      newErrors.designation = 'Le nom du cours doit contenir au moins 2 caractères';
    } else if (formData.designation.length > 100) {
      newErrors.designation = 'Le nom du cours ne peut pas dépasser 100 caractères';
    }

    if (!formData.unite.trim()) {
      newErrors.unite = 'L\'unité d\'enseignement est obligatoire';
    }

    if (formData.credit < 0.5) {
      newErrors.credit = 'Le nombre de crédits doit être au moins 0.5';
    } else if (formData.credit > 20) {
      newErrors.credit = 'Le nombre de crédits ne peut pas dépasser 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      designation: formData.designation.trim(),
      credit: formData.credit,
      unite: formData.unite.trim(),
    });
    
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getFieldError = (field: string) => {
    return errors[field];
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {cours ? 'Modifier le cours' : 'Ajouter un cours'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {cours 
              ? 'Modifiez les informations du cours'
              : 'Créez un nouveau cours avec ses crédits et son unité'
            }
          </p>
        </div>

        <div className="space-y-4">
          {/* Nom du cours */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nom du cours
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                getFieldError('designation')
                  ? 'border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-700 dark:focus:border-red-800'
                  : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
              }`}
              placeholder="Ex: Mathématiques, Français, Histoire..."
              required
            />
            {getFieldError('designation') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {getFieldError('designation')}
              </p>
            )}
          </div>

          {/* Unité d'enseignement */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Unité d'enseignement
            </label>
            <select
              value={formData.unite}
              onChange={(e) => handleInputChange('unite', e.target.value)}
              className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
                getFieldError('unite')
                  ? 'border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-700 dark:focus:border-red-800'
                  : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
              }`}
              required
            >
              <option value="">Sélectionnez une unité</option>
              {UNITES_ENSEIGNEMENT.map((unite) => (
                <option key={unite} value={unite}>
                  {unite}
                </option>
              ))}
            </select>
            {getFieldError('unite') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {getFieldError('unite')}
              </p>
            )}
          </div>

          {/* Nombre de crédits */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nombre de crédits
            </label>
            <input
              type="number"
              min="0.5"
              max="20"
              step="0.5"
              value={formData.credit}
              onChange={(e) => handleInputChange('credit', parseFloat(e.target.value) || 1)}
              className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                getFieldError('credit')
                  ? 'border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-700 dark:focus:border-red-800'
                  : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
              }`}
              required
            />
            {getFieldError('credit') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {getFieldError('credit')}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Entre 0.5 et 20 crédits (par pas de 0.5)
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3 sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
          >
            {cours ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CoursModal;
