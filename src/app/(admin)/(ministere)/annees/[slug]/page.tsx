'use client';

import React, { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, DollarSign, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Annee } from '@/types/annee';
import AnneeCalendar from '@/components/calendar/AnneeCalendar';
import { useAnneeStore } from '@/stores/anneeStore';

export default function AnneeDetailPage() {
  const params = useParams();
  const anneeId = params.slug as string;

  // Utilisation du store Zustand
  const { 
    currentAnnee, 
    loading, 
    error, 
    getAnneeById, 
    clearError 
  } = useAnneeStore();

  // Charger l'année spécifique au montage du composant
  useEffect(() => {
    if (anneeId) {
      getAnneeById(anneeId);
    }
  }, [anneeId, getAnneeById]);

  const annee = currentAnnee;

  // Gestion des erreurs
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Erreur de chargement
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error}
          </p>
          <div className="space-x-4">
            <button
              onClick={() => {
                clearError();
                getAnneeById(anneeId);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Réessayer
            </button>
            <Link
              href="/annees"
              className="inline-flex items-center px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux années
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Gestion du chargement
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Chargement de l'année académique...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Veuillez patienter pendant le chargement des données.
          </p>
        </div>
      </div>
    );
  }

  // Gestion de l'année introuvable
  if (!annee) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Année académique introuvable
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            L'année académique demandée n'existe pas ou a été supprimée.
          </p>
          <Link
            href="/annees"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour aux années
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (statut: Annee['statut']) => {
    const configs = {
      active: { 
        bg: 'bg-green-100 dark:bg-green-900/20', 
        text: 'text-green-800 dark:text-green-300',
        icon: CheckCircle,
        label: 'Active'
      },
      terminee: { 
        bg: 'bg-gray-100 dark:bg-gray-900/20', 
        text: 'text-gray-800 dark:text-gray-300',
        icon: XCircle,
        label: 'Terminée'
      },
      planifiee: { 
        bg: 'bg-blue-100 dark:bg-blue-900/20', 
        text: 'text-blue-800 dark:text-blue-300',
        icon: Clock,
        label: 'Planifiée'
      }
    };

    const config = configs[statut];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <IconComponent className="w-4 h-4 mr-2" />
        {config.label}
      </span>
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-CD', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/annees"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour aux années
            </Link>
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Année Académique {annee.debut} - {annee.fin}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {annee.description}
              </p>
            </div>
          </div>
          {getStatusBadge(annee.statut)}
        </div>

        {/* Informations générales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Événements</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                  {annee.calendrier?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <DollarSign className="w-8 h-8 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Frais Académiques</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                  {annee.fraisAcademiques?.length || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Dernière Modification</p>
                <p className="text-sm font-bold text-purple-900 dark:text-purple-100">
                  {formatDate(annee.dateModification)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendrier des événements */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Calendrier Académique
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Planification et gestion des événements de l'année académique {annee.debut}-{annee.fin}
          </p>
        </div>
        
        <AnneeCalendar annee={annee} />
      </div>

      {/* Frais académiques */}
      {annee.fraisAcademiques && annee.fraisAcademiques.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Frais Académiques
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Structure des frais pour l'année académique {annee.debut}-{annee.fin}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {annee.fraisAcademiques.map((frais, index) => (
              <div
                key={index}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Frais #{frais.fraisId}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    frais.obligatoire 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300'
                      : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                  }`}>
                    {frais.obligatoire ? 'Obligatoire' : 'Optionnel'}
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Montant:</span>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(frais.montant)}
                    </p>
                  </div>
                  
                  {frais.dateEcheance && (
                    <div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">Échéance:</span>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDate(frais.dateEcheance)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}