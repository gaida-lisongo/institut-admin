"use client";

import React, { useState, useEffect } from 'react';
import { useEtudiantStore } from '@/stores/etudiantStore';
import { useClasseStore } from '@/stores/classeStore';
import { useModal } from '@/hooks/useModal';
import { Etudiant } from '@/types/student';
import EtudiantModal from '@/components/students/EtudiantModal';
import ImportExportButtons from '@/components/students/ImportExportButtons';
import StudentNavigation from '@/components/navigation/StudentNavigation';
import StudentStats from '@/components/students/StudentStats';
import TestDataButton from '@/components/students/TestDataButton';

const EtudiantsPage: React.FC = () => {
  const {
    etudiants,
    addEtudiant,
    updateEtudiant,
    deleteEtudiant,
    loading,
    error,
  } = useEtudiantStore();

  const { classes, initializeDefaultClasses } = useClasseStore();
  const { isOpen, openModal, closeModal } = useModal();
  
  const [selectedEtudiant, setSelectedEtudiant] = useState<Etudiant | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');

  useEffect(() => {
    initializeDefaultClasses();
  }, [initializeDefaultClasses]);

  const handleOpenModal = (etudiant?: Etudiant) => {
    setSelectedEtudiant(etudiant || null);
    openModal();
  };

  const handleSubmit = (etudiantData: Omit<Etudiant, '_id'>) => {
    if (selectedEtudiant) {
      updateEtudiant(selectedEtudiant._id, etudiantData);
    } else {
      addEtudiant(etudiantData);
    }
    setSelectedEtudiant(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet étudiant ?')) {
      deleteEtudiant(id);
    }
  };

  const getClasseName = (classeId: string) => {
    const classe = classes.find(c => c._id === classeId);
    return classe ? `${classe.nom} - ${classe.niveau}` : 'Classe inconnue';
  };

  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesSearch = 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClasse = selectedClasse === '' || etudiant.classeId === selectedClasse;
    
    return matchesSearch && matchesClasse;
  });

  return (
    <div className="p-6">
      <StudentNavigation />
      <StudentStats />
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Étudiants
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Gérez les étudiants de votre établissement
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <ImportExportButtons />
          {process.env.NODE_ENV === 'development' && <TestDataButton />}
          <button
            onClick={() => handleOpenModal()}
            className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
          >
            Ajouter un étudiant
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Rechercher par nom, prénom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
          />
        </div>
        <div className="sm:w-64">
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value="">Toutes les classes</option>
            {classes.map((classe) => (
              <option key={classe._id} value={classe._id}>
                {classe.nom} - {classe.niveau}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {loading ? (
          <div className="py-12 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">Chargement...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Nom complet
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Sexe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Classe
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-transparent">
                  {filteredEtudiants.map((etudiant) => (
                    <tr key={etudiant._id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600 dark:bg-brand-900/20 dark:text-brand-400">
                            {etudiant.prenom.charAt(0)}{etudiant.nom.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {etudiant.prenom} {etudiant.nom}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {etudiant.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {getClasseName(etudiant.classeId)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenModal(etudiant)}
                          className="mr-3 text-brand-600 hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-300"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(etudiant._id)}
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

            {filteredEtudiants.length === 0 && (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {searchTerm || selectedClasse 
                    ? 'Aucun étudiant trouvé avec ces critères de recherche.'
                    : 'Aucun étudiant trouvé. Cliquez sur "Ajouter un étudiant" pour commencer.'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      <EtudiantModal
        isOpen={isOpen}
        onClose={closeModal}
        onSubmit={handleSubmit}
        etudiant={selectedEtudiant}
      />
    </div>
  );
};

export default EtudiantsPage;
