'use client';

import React from 'react';
import { AlertTriangle, X, Loader2 } from 'lucide-react';
import { Province } from '@/types/province';

interface DeleteProvinceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  province: Province | null;
  loading?: boolean;
}

export default function DeleteProvinceModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  province, 
  loading = false 
}: DeleteProvinceModalProps) {
  if (!isOpen || !province) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
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
              Êtes-vous sûr de vouloir supprimer la province suivante ?
            </p>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                {province.photo && (
                  <img
                    src={province.photo}
                    alt={province.designation}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white mb-1">
                    {province.designation}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Code: {province.code}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {province.description.length > 100 
                      ? `${province.description.substring(0, 100)}...`
                      : province.description
                    }
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Attention :</strong> Cette action est irréversible. Toutes les données associées à cette province seront définitivement supprimées.
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
