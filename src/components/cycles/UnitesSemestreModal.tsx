"use client";

import React, { useState, useEffect } from 'react';
import { X, Book, Award, Plus, Minus } from 'lucide-react';
import { useUniteStore } from '@/stores/uniteStore';
import useSemestreStore from '@/stores/semestreStore';

interface UnitesSemestreModalProps {
  isOpen: boolean;
  onClose: () => void;
  semestre: any;
}

const UnitesSemestreModal: React.FC<UnitesSemestreModalProps> = ({
  isOpen,
  onClose,
  semestre
}) => {
  const { unites, fetchUnites } = useUniteStore();
  const { updateSemestre, loading } = useSemestreStore();
  
  const [selectedUnites, setSelectedUnites] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchUnites();
      setSelectedUnites(semestre?.unites || []);
    }
  }, [isOpen, semestre, fetchUnites]);

  const handleSave = async () => {
    try {
      await updateSemestre(semestre._id, {
        unites: selectedUnites
      });
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const toggleUnite = (uniteId: string) => {
    setSelectedUnites(prev => 
      prev.includes(uniteId)
        ? prev.filter(id => id !== uniteId)
        : [...prev, uniteId]
    );
  };

  const getSelectedCredits = () => {
    return selectedUnites.reduce((total, uniteId) => {
      const unite = unites.find(u => u._id === uniteId);
      return total + (unite?.descripteur?.credit || 0);
    }, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Unités d'enseignement - {semestre?.designation}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {selectedUnites.length} unité(s) sélectionnée(s) • {getSelectedCredits()} crédits
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Unités disponibles */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Unités disponibles
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {unites
                  .filter(unite => !selectedUnites.includes(unite._id || ''))
                  .map((unite) => (
                    <div
                      key={unite._id}
                      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer"
                      onClick={() => toggleUnite(unite._id || '')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {unite.descripteur?.designation}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {unite.descripteur?.credit}c
                          </span>
                          <Plus className="w-4 h-4 text-green-600" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{unite.descripteur?.code}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          unite.descripteur?.type === 'Obigatoire'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {unite.descripteur?.type}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Unités sélectionnées */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Unités du semestre
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedUnites.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Book className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>Aucune unité sélectionnée</p>
                  </div>
                ) : (
                  selectedUnites.map((uniteId) => {
                    const unite = unites.find(u => u._id === uniteId);
                    if (!unite) return null;

                    return (
                      <div
                        key={uniteId}
                        className="border border-green-200 bg-green-50 rounded-lg p-3 hover:bg-green-100 cursor-pointer"
                        onClick={() => toggleUnite(uniteId)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {unite.descripteur?.designation}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {unite.descripteur?.credit}c
                            </span>
                            <Minus className="w-4 h-4 text-red-600" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">{unite.descripteur?.code}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            unite.descripteur?.type === 'Obigatoire'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {unite.descripteur?.type}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Award className="w-4 h-4" />
                <span>Total: {getSelectedCredits()} crédits</span>
              </div>
              <div className="flex items-center space-x-1">
                <Book className="w-4 h-4" />
                <span>{selectedUnites.length} unité(s)</span>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitesSemestreModal;