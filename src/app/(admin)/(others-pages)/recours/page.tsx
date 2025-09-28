"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import useRecoursStore from '@/stores/recoursStore';
import useAuthStore from '@/stores/authStore';
import { RecoursWithDetails } from '@/types/recours';

const RecoursPage = () => {
  const { recours, isLoading, error, fetchRecoursByAgent } = useRecoursStore();
  const { menuData, user } = useAuthStore();
  const [filteredRecours, setFilteredRecours] = useState<RecoursWithDetails[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    // Charger les recours basés sur les charges de l'agent
    if (menuData.courses?.charges && menuData.courses.charges.length > 0) {
      const chargesIds = menuData.courses.charges.map(charge => charge.chargeId || '');
      fetchRecoursByAgent(chargesIds.filter(id => id !== ''));
    }
  }, [menuData.courses, fetchRecoursByAgent]);

  useEffect(() => {
    // Filtrer les recours selon le statut sélectionné
    if (statusFilter === 'all') {
      setFilteredRecours(recours);
    } else {
      setFilteredRecours(recours.filter(r => r.status === statusFilter));
    }
  }, [recours, statusFilter]);

  const getStatusBadge = (status: string) => {
    const badges = {
      PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      PROCESSED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    };
    
    const labels = {
      PENDING: 'En attente',
      APPROVED: 'Approuvé',
      REJECTED: 'Rejeté',
      PROCESSED: 'Traité'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badges[status as keyof typeof badges]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };


  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!recours) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <p className="text-red-800 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Recours
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {recours.length} recours au total
            </p>
          </div>
          
          {/* Filtres */}
          <div className="flex items-center gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="APPROVED">Approuvés</option>
              <option value="REJECTED">Rejetés</option>
              <option value="PROCESSED">Traités</option>
            </select>
          </div>
        </div>
      </div>

      {/* Liste des recours */}
      {filteredRecours.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Aucun recours trouvé
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {statusFilter === 'all' 
              ? "Il n'y a actuellement aucun recours à traiter."
              : `Aucun recours avec le statut "${statusFilter}" trouvé.`
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecours.map((recours) => (
            <Link
              key={recours._id}
              href={`/recours/${recours._id}`}
              className="block bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200"
            >
              <div className="p-6">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {recours.object}
                    </h3>
                  </div>
                  {getStatusBadge(recours.status)}
                </div>

                {/* Informations étudiant */}
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    {recours.etudiant.photo ? (
                      <img
                        src={recours.etudiant.photo}
                        alt={`${recours.etudiant.prenom} ${recours.etudiant.nom}`}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 dark:text-gray-300 font-medium">
                          {recours.etudiant.prenom[0]}{recours.etudiant.nom[0]}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {recours.etudiant.prenom} {recours.etudiant.nom} {recours.etudiant.post_nom}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {recours.etudiant.matricule}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notes actuelles */}
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notes actuelles:
                  </h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                      <p className="text-blue-600 dark:text-blue-400 font-medium">
                        {recours.fiche.cmi ?? 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">CMI</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                      <p className="text-green-600 dark:text-green-400 font-medium">
                        {recours.fiche.examen ?? 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Examen</p>
                    </div>
                    <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                      <p className="text-orange-600 dark:text-orange-400 font-medium">
                        {recours.fiche.rattrapage ?? 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">Rattrapage</p>
                    </div>
                  </div>
                </div>

                {/* Date de création */}
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                  {/* <span>
                    Créé le {formatDate(recours.createdAt!)}
                  </span> */}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {recours.reference}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecoursPage;