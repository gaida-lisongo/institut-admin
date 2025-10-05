"use client";

import React, { useState } from 'react';
import { Etudiant } from '@/types/student';
import { useClasseStore } from '@/stores/classeStore';

interface EtudiantSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  etudiants: Etudiant[];
  onSelect: (etudiantId: string) => Promise<void>;
}

const EtudiantSelectionModal: React.FC<EtudiantSelectionModalProps> = ({
  isOpen,
  onClose,
  etudiants,
  onSelect
}) => {
  const { classes } = useClasseStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClasse, setSelectedClasse] = useState('');
  const [selectedEtudiants, setSelectedEtudiants] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtrage des étudiants
  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesSearch = 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClasse = selectedClasse === '' || etudiant.classeId === selectedClasse;
    
    return matchesSearch && matchesClasse;
  });

  const getClasseName = (classeId: string) => {
    const classe = classes.find(c => c._id === classeId);
    return classe ? `${classe.nom} (${classe.niveau})` : 'Classe inconnue';
  };

  const handleToggleEtudiant = (etudiantId: string) => {
    setSelectedEtudiants(prev => 
      prev.includes(etudiantId)
        ? prev.filter(id => id !== etudiantId)
        : [...prev, etudiantId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEtudiants.length === filteredEtudiants.length) {
      setSelectedEtudiants([]);
    } else {
      setSelectedEtudiants(filteredEtudiants.map(e => e._id));
    }
  };

  const handleAddSelected = async () => {
    if (selectedEtudiants.length === 0) return;

    setLoading(true);
    try {
      for (const etudiantId of selectedEtudiants) {
        await onSelect(etudiantId);
      }
      setSelectedEtudiants([]);
      onClose();
    } catch (error) {
      console.error('Erreur lors de l\'ajout des étudiants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedEtudiants([]);
    setSearchTerm('');
    setSelectedClasse('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-25" onClick={handleClose}></div>
        
        <div className="relative w-full max-w-4xl rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Ajouter des étudiants au groupe
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filtres */}
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher un étudiant..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <select
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Toutes les classes</option>
                {classes.map(classe => (
                  <option key={classe._id} value={classe._id}>
                    {classe.nom} ({classe.niveau})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Actions de sélection */}
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
            >
              {selectedEtudiants.length === filteredEtudiants.length ? 'Désélectionner tout' : 'Sélectionner tout'}
            </button>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedEtudiants.length} étudiant(s) sélectionné(s)
            </span>
          </div>

          {/* Liste des étudiants */}
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-700">
            {filteredEtudiants.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Aucun étudiant disponible
              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredEtudiants.map((etudiant) => (
                  <div
                    key={etudiant._id}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedEtudiants.includes(etudiant._id)}
                      onChange={() => handleToggleEtudiant(etudiant._id)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {etudiant.nom} {etudiant.prenom}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {etudiant.email}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-900 dark:text-white">
                            {getClasseName(etudiant.classeId)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {etudiant.sexe === 'M' ? 'Masculin' : 'Féminin'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedEtudiants.length === 0 || loading}
              className="flex-1 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Ajout en cours...' : `Ajouter ${selectedEtudiants.length} étudiant(s)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EtudiantSelectionModal;
