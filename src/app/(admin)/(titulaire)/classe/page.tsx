"use client";

import React, { useState, useEffect } from 'react';
import { useClasseStore } from '@/stores/classeStore';
import { useModal } from '@/hooks/useModal';
import { Modal } from '@/components/ui/modal';
import { Classe } from '@/types/student';
import StudentNavigation from '@/components/navigation/StudentNavigation';
import { NIVEAUX_SCOLAIRES } from '@/config/education';

const ClassePage: React.FC = () => {
  const {
    classes,
    addClasse,
    updateClasse,
    deleteClasse,
    initializeDefaultClasses,
  } = useClasseStore();

  const { isOpen, openModal, closeModal } = useModal();
  const [selectedClasse, setSelectedClasse] = useState<Classe | null>(null);
  const [formData, setFormData] = useState({
    nom: '',
    niveau: '',
  });

  useEffect(() => {
    initializeDefaultClasses();
  }, [initializeDefaultClasses]);

  const handleOpenModal = (classe?: Classe) => {
    if (classe) {
      setSelectedClasse(classe);
      setFormData({
        nom: classe.nom,
        niveau: classe.niveau,
      });
    } else {
      setSelectedClasse(null);
      setFormData({
        nom: '',
        niveau: '',
      });
    }
    openModal();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom.trim() || !formData.niveau.trim()) {
      return;
    }

    if (selectedClasse) {
      updateClasse(selectedClasse._id, formData);
    } else {
      addClasse(formData);
    }

    closeModal();
    setFormData({ nom: '', niveau: '' });
    setSelectedClasse(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette classe ?')) {
      deleteClasse(id);
    }
  };

  const niveaux = NIVEAUX_SCOLAIRES;

  return (
    <div className="p-6">
      <StudentNavigation />
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Classes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez les classes de votre établissement
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
        >
          Ajouter une classe
        </button>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Nom de la classe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Niveau
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
              {classes.map((classe) => (
                <tr key={classe._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {classe.nom}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {classe.niveau}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenModal(classe)}
                      className="mr-3 text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(classe._id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {classes.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Aucune classe trouvée. Cliquez sur "Ajouter une classe" pour commencer.
            </p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-md p-6"
      >
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {selectedClasse ? 'Modifier la classe' : 'Ajouter une classe'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {selectedClasse 
                ? 'Modifiez les informations de la classe'
                : 'Ajoutez une nouvelle classe à votre établissement'
              }
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Nom de la classe
              </label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                placeholder="Ex: 6ème A"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Niveau
              </label>
              <select
                value={formData.niveau}
                onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
                required
              >
                <option value="">Sélectionnez un niveau</option>
                {niveaux.map((niveau) => (
                  <option key={niveau} value={niveau}>
                    {niveau}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 sm:justify-end">
            <button
              type="button"
              onClick={closeModal}
              className="flex w-full justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] sm:w-auto"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex w-full justify-center rounded-lg bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 sm:w-auto"
            >
              {selectedClasse ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ClassePage;
