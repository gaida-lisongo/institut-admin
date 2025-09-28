"use client";
import React, { useState } from "react";
import { RecoursWithDetails } from "@/types/recours";
import useRecoursStore from "@/stores/recoursStore";
import Image from "next/image";

interface RecoursModalProps {
  recours: RecoursWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function RecoursModal({ recours, isOpen, onClose }: RecoursModalProps) {
  const { processRecours, deleteRecours, isLoading } = useRecoursStore();
  const [grades, setGrades] = useState({
    cmi: recours?.fiche.cmi || 0,
    examen: recours?.fiche.examen || 0,
    rattrapage: recours?.fiche.rattrapage || 0,
  });

  const handleGradeChange = (field: keyof typeof grades, value: number) => {
    setGrades(prev => ({ ...prev, [field]: value }));
  };

  const handleProcess = async () => {
    if (!recours) return;
    
    try {
      await processRecours(recours._id, grades);
      onClose();
    } catch (error) {
      console.error("Erreur lors du traitement du recours:", error);
    }
  };

  const handleDelete = async () => {
    if (!recours) return;
    
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce recours ?")) {
      try {
        await deleteRecours(recours._id);
        onClose();
      } catch (error) {
        console.error("Erreur lors de la suppression du recours:", error);
      }
    }
  };

  if (!isOpen || !recours) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Traitement du Recours
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Étudiant Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="relative w-12 h-12">
              {recours.etudiant.photo ? (
                <Image
                  src={recours.etudiant.photo}
                  alt={`${recours.etudiant.prenom} ${recours.etudiant.nom}`}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 dark:text-gray-300 font-semibold">
                    {recours.etudiant.prenom.charAt(0)}{recours.etudiant.nom.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {recours.etudiant.prenom} {recours.etudiant.post_nom} {recours.etudiant.nom}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Matricule: {recours.etudiant.matricule}
              </p>
            </div>
          </div>

          {/* Recours Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Référence
              </label>
              <p className="text-gray-900 dark:text-white">{recours.reference}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Objet
              </label>
              <p className="text-gray-900 dark:text-white">{recours.object}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contenu
              </label>
              <p className="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700 p-3 rounded">
                {recours.contenu}
              </p>
            </div>

            {recours.preuve && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Preuve
                </label>
                <a 
                  href={recours.preuve} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Voir la preuve
                </a>
              </div>
            )}
          </div>

          {/* Current Grades */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white">Notes Actuelles</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CMI
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={grades.cmi}
                  onChange={(e) => handleGradeChange('cmi', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Examen
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={grades.examen}
                  onChange={(e) => handleGradeChange('examen', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Rattrapage
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  value={grades.rattrapage}
                  onChange={(e) => handleGradeChange('rattrapage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 rounded-md transition-colors"
            disabled={isLoading}
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Suppression..." : "Supprimer"}
          </button>
          <button
            onClick={handleProcess}
            className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Traitement..." : "Traiter"}
          </button>
        </div>
      </div>
    </div>
  );
}
