"use client";

import React, { useState, useEffect } from 'react';
import { useSessionStore } from '@/stores/sessionStore';
import { useCoursStore } from '@/stores/coursStore';
import { Groupe, CreateGroupeData, UpdateGroupeData, GROUPE_STATUTS } from '@/types/groupe';

interface GroupeModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupe?: Groupe | null;
  onSave: (data: CreateGroupeData | UpdateGroupeData) => Promise<void>;
}

const GroupeModal: React.FC<GroupeModalProps> = ({
  isOpen,
  onClose,
  groupe,
  onSave
}) => {
  const { sessions } = useSessionStore();
  const { cours } = useCoursStore();

  const [formData, setFormData] = useState({
    designation: '',
    sessionId: '',
    description: '',
    dureeMaximale: '',
    tentativesMax: '1',
    statut: 'brouillon' as Groupe['statut']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (groupe) {
      setFormData({
        designation: groupe.designation,
        sessionId: groupe.sessionId,
        description: groupe.description || '',
        dureeMaximale: groupe.dureeMaximale?.toString() || '',
        tentativesMax: groupe.tentativesMax?.toString() || '1',
        statut: groupe.statut
      });
    } else {
      setFormData({
        designation: '',
        sessionId: '',
        description: '',
        dureeMaximale: '',
        tentativesMax: '1',
        statut: 'brouillon'
      });
    }
    setErrors({});
  }, [groupe, isOpen]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.designation.trim()) {
      newErrors.designation = 'La désignation est obligatoire';
    }

    if (!formData.sessionId) {
      newErrors.sessionId = 'La session est obligatoire';
    }

    if (formData.dureeMaximale && (isNaN(Number(formData.dureeMaximale)) || Number(formData.dureeMaximale) <= 0)) {
      newErrors.dureeMaximale = 'La durée doit être un nombre positif';
    }

    if (isNaN(Number(formData.tentativesMax)) || Number(formData.tentativesMax) <= 0) {
      newErrors.tentativesMax = 'Le nombre de tentatives doit être un nombre positif';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data: CreateGroupeData | UpdateGroupeData = {
        designation: formData.designation.trim(),
        sessionId: formData.sessionId,
        description: formData.description.trim() || undefined,
        dureeMaximale: formData.dureeMaximale ? Number(formData.dureeMaximale) : undefined,
        tentativesMax: Number(formData.tentativesMax)
      };

      if (groupe) {
        (data as UpdateGroupeData).statut = formData.statut;
      }

      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const getSessionName = (sessionId: string) => {
    const session = sessions.find(s => s._id === sessionId);
    if (!session) return '';
    
    const coursData = cours.find(c => c._id === session.coursId);
    return `${session.designation} (${coursData?.designation || 'Cours inconnu'})`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={onClose}></div>
        
        <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {groupe ? 'Modifier le groupe' : 'Nouveau groupe'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Désignation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Désignation *
              </label>
              <input
                type="text"
                value={formData.designation}
                onChange={(e) => handleChange('designation', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.designation
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                placeholder="Ex: Groupe A - Contrôle Maths"
              />
              {errors.designation && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.designation}</p>
              )}
            </div>

            {/* Session */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Session d'interrogation *
              </label>
              <select
                value={formData.sessionId}
                onChange={(e) => handleChange('sessionId', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.sessionId
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
              >
                <option value="">Sélectionner une session</option>
                {sessions.map(session => (
                  <option key={session._id} value={session._id}>
                    {getSessionName(session._id)}
                  </option>
                ))}
              </select>
              {errors.sessionId && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.sessionId}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                placeholder="Description optionnelle du groupe..."
              />
            </div>

            {/* Durée maximale */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Durée maximale (minutes)
              </label>
              <input
                type="number"
                min="1"
                value={formData.dureeMaximale}
                onChange={(e) => handleChange('dureeMaximale', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.dureeMaximale
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
                placeholder="Ex: 60"
              />
              {errors.dureeMaximale && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.dureeMaximale}</p>
              )}
            </div>

            {/* Tentatives max */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre de tentatives maximum *
              </label>
              <input
                type="number"
                min="1"
                value={formData.tentativesMax}
                onChange={(e) => handleChange('tentativesMax', e.target.value)}
                className={`mt-1 block w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                  errors.tentativesMax
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                } dark:border-gray-600 dark:bg-gray-700 dark:text-white`}
              />
              {errors.tentativesMax && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.tentativesMax}</p>
              )}
            </div>

            {/* Statut (seulement en modification) */}
            {groupe && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Statut
                </label>
                <select
                  value={formData.statut}
                  onChange={(e) => handleChange('statut', e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {Object.entries(GROUPE_STATUTS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Boutons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sauvegarde...' : groupe ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupeModal;
