"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Session, SESSION_STATUTS, CreateSessionData } from '@/types/session';
import { useCoursStore } from '@/stores/coursStore';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (session: CreateSessionData) => void;
  session?: Session | null;
}

const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  session,
}) => {
  const { cours } = useCoursStore();
  const [formData, setFormData] = useState({
    designation: '',
    statut: 'brouillon',
    coursId: '',
  });

  useEffect(() => {
    if (session) {
      setFormData({
        designation: session.designation,
        statut: session.statut,
        coursId: session.coursId,
      });
    } else {
      setFormData({
        designation: '',
        statut: 'brouillon',
        coursId: '',
      });
    }
  }, [session, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.designation.trim() || !formData.coursId) {
      return;
    }

    onSubmit(formData);
    onClose();
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-md p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            {session ? 'Modifier la session' : 'Créer une session'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {session 
              ? 'Modifiez les informations de la session'
              : 'Créez une nouvelle session d\'interrogation'
            }
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Nom de la session
            </label>
            <input
              type="text"
              value={formData.designation}
              onChange={(e) => handleInputChange('designation', e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
              placeholder="Ex: Interrogation Chapitre 1"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Cours
            </label>
            <select
              value={formData.coursId}
              onChange={(e) => handleInputChange('coursId', e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
            >
              <option value="">Sélectionnez un cours</option>
              {cours.map((coursItem) => (
                <option key={coursItem._id} value={coursItem._id}>
                  {coursItem.designation} ({coursItem.unite})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Statut
            </label>
            <select
              value={formData.statut}
              onChange={(e) => handleInputChange('statut', e.target.value)}
              className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
              required
            >
              {SESSION_STATUTS.map((statut) => (
                <option key={statut.value} value={statut.value}>
                  {statut.label}
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
            {session ? 'Modifier' : 'Créer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SessionModal;
