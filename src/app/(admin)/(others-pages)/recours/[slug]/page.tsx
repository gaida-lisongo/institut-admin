"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useRecoursStore from '@/stores/recoursStore';
import useAuthStore from '@/stores/authStore';
import { RecoursWithDetails } from '@/types/recours';

const RecoursDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { recours, isLoading, processRecours, fetchRecoursByAgent } = useRecoursStore();
  const { menuData } = useAuthStore();
  
  const [selectedRecours, setSelectedRecours] = useState<RecoursWithDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [newGrades, setNewGrades] = useState({
    cmi: 0,
    examen: 0,
    rattrapage: 0
  });

  // Charger les recours si pas encore chargés
  useEffect(() => {
    if (menuData.courses?.charges && menuData.courses.charges.length > 0 && recours.length === 0) {
      const chargesIds = menuData.courses.charges.map(charge => charge.chargeId || '');
      fetchRecoursByAgent(chargesIds.filter(id => id !== ''));
    }
  }, [menuData.courses, fetchRecoursByAgent, recours.length]);

  useEffect(() => {
    // Trouver le recours dans le store basé sur l'ID de l'URL
    const recoursId = params.slug as string;
    const foundRecours = recours.find(r => r._id === recoursId);
    
    if (foundRecours) {
      setSelectedRecours(foundRecours);
      // Initialiser les nouvelles notes avec les notes actuelles
      setNewGrades({
        cmi: foundRecours.fiche.cmi || 0,
        examen: foundRecours.fiche.examen || 0,
        rattrapage: foundRecours.fiche.rattrapage || 0
      });
    }
  }, [params.slug, recours]);

  const handleGradeChange = (field: keyof typeof newGrades, value: string) => {
    console.log("field : ", field);
    console.log("value : ", value);
    console.log("Fiche : ", selectedRecours?.fiche);
    const numValue = parseFloat(value) || 0;
    setNewGrades(prev => ({
      ...prev,
      [field]: numValue
    }));
  };

  const handleProcessRecours = async () => {
    if (!selectedRecours) return;
    
    setIsProcessing(true);
    try {
      await processRecours(selectedRecours._id, newGrades);
      // Rediriger vers la liste des recours après traitement
      router.push('/recours');
    } catch (error) {
      console.error('Erreur lors du traitement:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      PROCESSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    } as const;
    
    const labels = {
      PENDING: 'En attente',
      APPROVED: 'Approuvé',
      REJECTED: 'Rejeté',
      PROCESSED: 'Traité'
    } as const;

    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    const formatted = new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(d);
    return formatted.replace(',', ' à');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!selectedRecours) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">
          Recours introuvable
        </h3>
        <p className="text-red-600 dark:text-red-300">
          Le recours demandé n'existe pas ou n'a pas pu être chargé.
        </p>
        <button
          onClick={() => router.push('/recours')}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push('/recours')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour à la liste
        </button>
        {getStatusBadge(selectedRecours.status)}
      </div>

      {/* Informations principales */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {selectedRecours.object}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Référence: {selectedRecours.reference}
            </p>
            {selectedRecours.createdAt && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Créé le {formatDate(selectedRecours.createdAt)}
              </p>
            )}
          </div>
        </div>

        {/* Informations étudiant */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Informations de l'étudiant
          </h3>
          <div className="flex items-center gap-4">
            {selectedRecours.etudiant.photo ? (
              <img
                src={selectedRecours.etudiant.photo}
                alt={`${selectedRecours.etudiant.prenom} ${selectedRecours.etudiant.nom}`}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                <span className="text-gray-600 dark:text-gray-300 font-medium text-lg">
                  {selectedRecours.etudiant.prenom[0]}{selectedRecours.etudiant.nom[0]}
                </span>
              </div>
            )}
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-lg">
                {selectedRecours.etudiant.prenom} {selectedRecours.etudiant.nom} {selectedRecours.etudiant.post_nom}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Matricule: {selectedRecours.etudiant.matricule}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Nationalité: {selectedRecours.etudiant.nationalite}
              </p>
            </div>
          </div>
        </div>

        {/* Contenu du recours */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Contenu du recours
          </h3>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            {selectedRecours.contenu.map((paragraph, index) => (
              <p key={index} className="text-gray-700 dark:text-gray-300 mb-2 last:mb-0">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Preuve */}
        {selectedRecours.preuve && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Pièce justificative
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <a
                href={selectedRecours.preuve}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline"
              >
                Voir la pièce justificative
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Notes actuelles et modification */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Notes de l'étudiant
          </h2>
          {selectedRecours.status === 'PENDING' && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEditing ? 'Annuler' : 'Modifier les notes'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* CMI */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
              Note CMI
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={newGrades.cmi}
                onChange={(e) => handleGradeChange('cmi', e.target.value)}
                className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {selectedRecours.fiche.cmi ?? 'N/A'}
              </p>
            )}
          </div>

          {/* Examen */}
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
              Note Examen
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={newGrades.examen}
                onChange={(e) => handleGradeChange('examen', e.target.value)}
                className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
              />
            ) : (
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {selectedRecours.fiche.examen ?? 'N/A'}
              </p>
            )}
          </div>

          {/* Rattrapage */}
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
            <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
              Note Rattrapage
            </label>
            {isEditing ? (
              <input
                type="number"
                min="0"
                max="20"
                step="0.1"
                value={newGrades.rattrapage}
                onChange={(e) => handleGradeChange('rattrapage', e.target.value)}
                className="w-full px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500"
              />
            ) : (
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {selectedRecours.fiche.rattrapage ?? 'N/A'}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {selectedRecours.status === 'PENDING' && isEditing && (
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleProcessRecours}
              disabled={isProcessing}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Traitement en cours...
                </>
              ) : (
                'Traiter le recours'
              )}
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Cette action mettra à jour les notes de l'étudiant et marquera le recours comme traité.
            </p>
          </div>
        )}

        {selectedRecours.status !== 'PENDING' && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400">
              Ce recours a déjà été traité et ne peut plus être modifié.
            </p>
          </div>
        )}
      </div>

      {/* {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )} */}
    </div>
  );
};

export default RecoursDetailPage;