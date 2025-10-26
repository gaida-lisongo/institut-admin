'use client';

import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Annee } from '@/types/annee';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  annee: Annee | null;
  loading?: boolean;
}

export default function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  annee, 
  loading = false 
}: DeleteConfirmModalProps) {
  if (!isOpen || !annee) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 1100 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
          style={{ zIndex: 1101 }}
        />

        {/* Modal Container */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal */}
        <div 
          className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
          style={{ zIndex: 1102 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full mr-3">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Confirmer la suppression
              </h3>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Êtes-vous sûr de vouloir supprimer l'année académique suivante ?
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="text-sm">
                <div className="font-medium text-gray-900 dark:text-white mb-1">
                  {annee.description}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Période: {annee.debut} - {annee.fin}
                </div>
                <div className="text-gray-500 dark:text-gray-400">
                  Statut: {annee.statut}
                </div>
                {annee.calendrier && annee.calendrier.length > 0 && (
                  <div className="text-gray-500 dark:text-gray-400">
                    Événements: {annee.calendrier.length}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées à cette année académique seront définitivement supprimées.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200 disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              onClick={onConfirm}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Supprimer définitivement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
