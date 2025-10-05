"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Etudiant } from '@/types/student';
import { useClasseStore } from '@/stores/classeStore';
import { validateEtudiant, ValidationError } from '@/utils/validation';
import { SEXE_OPTIONS } from '@/config/education';

interface EtudiantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (etudiant: Omit<Etudiant, '_id'>) => void;
  etudiant?: Etudiant | null;
}

const EtudiantModal: React.FC<EtudiantModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  etudiant,
}) => {
  const { classes } = useClasseStore();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    sexe: '',
    classeId: '',
  });
  const [errors, setErrors] = useState<ValidationError[]>([]);

  useEffect(() => {
    if (etudiant) {
      setFormData({
        nom: etudiant.nom,
        prenom: etudiant.prenom,
        email: etudiant.email,
        sexe: etudiant.sexe,
        classeId: etudiant.classeId,
      });
    } else {
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        sexe: '',
        classeId: '',
      });
    }
  }, [etudiant, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const validationErrors = validateEtudiant(formData);
    setErrors(validationErrors);
    
    if (validationErrors.length > 0) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Effacer l'erreur pour ce champ
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const getFieldError = (field: string) => {
    return errors.find(error => error.field === field)?.message;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {etudiant ? 'Modifier l\'étudiant' : 'Ajouter un étudiant'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {etudiant 
              ? 'Modifiez les informations de l\'étudiant'
              : 'Ajoutez un nouvel étudiant à votre établissement'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nom
            </label>
            <input
              type="text"
              value={formData.nom}
              onChange={(e) => handleInputChange('nom', e.target.value)}
              className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 ${
                getFieldError('nom')
                  ? 'border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-700 dark:focus:border-red-800'
                  : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
              }`}
              placeholder="Nom de famille"
              required
            />
            {getFieldError('nom') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {getFieldError('nom')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Prénom
            </label>
            <input
              type="text"
              value={formData.prenom}
              onChange={(e) => handleInputChange('prenom', e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="Prénom"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="email@exemple.com"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Sexe
            </label>
            <select
              value={formData.sexe}
              onChange={(e) => handleInputChange('sexe', e.target.value)}
              className={`h-11 w-full rounded-lg border bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:outline-hidden focus:ring-3 dark:bg-gray-900 dark:text-white/90 ${
                getFieldError('sexe')
                  ? 'border-red-300 focus:border-red-300 focus:ring-red-500/10 dark:border-red-700 dark:focus:border-red-800'
                  : 'border-gray-300 focus:border-brand-300 focus:ring-brand-500/10 dark:border-gray-700 dark:focus:border-brand-800'
              }`}
              required
            >
              <option value="">Sélectionnez le sexe</option>
              {SEXE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {getFieldError('sexe') && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {getFieldError('sexe')}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Classe
            </label>
            <select
              value={formData.classeId}
              onChange={(e) => handleInputChange('classeId', e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
            >
              <option value="">Sélectionnez une classe</option>
              {classes.map((classe) => (
                <option key={classe._id} value={classe._id}>
                  {classe.nom} - {classe.niveau}
                </option>
              ))}
            </select>
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
            {etudiant ? 'Modifier' : 'Ajouter'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EtudiantModal;
