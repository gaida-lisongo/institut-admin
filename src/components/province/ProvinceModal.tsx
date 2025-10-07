'use client';

import React, { useState, useEffect } from 'react';
import { X, MapPin, FileText, Loader2, Image } from 'lucide-react';
import { Province, ProvinceFormData } from '@/types/province';
import { useProvinceStore } from '@/stores/provinceStore';

interface ProvinceModalProps {
  isOpen: boolean;
  onClose: () => void;
  province?: Province | null;
  mode: 'create' | 'edit' | 'view';
}

export default function ProvinceModal({ isOpen, onClose, province, mode }: ProvinceModalProps) {
  const [formData, setFormData] = useState<ProvinceFormData>({
    designation: '',
    code: '',
    description: '',
    photo: ''
  });

  const { createProvince, updateProvince, loading } = useProvinceStore();

  // Initialiser le formulaire avec les données de la province si en mode édition
  useEffect(() => {
    if (province && (mode === 'edit' || mode === 'view')) {
      setFormData({
        designation: province.designation,
        code: province.code,
        description: province.description,
        photo: province.photo || ''
      });
    } else if (mode === 'create') {
      // Réinitialiser pour une nouvelle province
      setFormData({
        designation: '',
        code: '',
        description: '',
        photo: ''
      });
    }
  }, [province, mode, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.designation.trim()) {
      alert('Veuillez saisir une désignation pour la province.');
      return;
    }

    if (!formData.code.trim()) {
      alert('Veuillez saisir un code pour la province.');
      return;
    }

    if (!formData.description.trim()) {
      alert('Veuillez saisir une description pour la province.');
      return;
    }

    try {
      if (mode === 'create') {
        const newProvince = await createProvince(formData);
        if (newProvince) {
          onClose();
        }
      } else if (mode === 'edit' && province) {
        const updatedProvince = await updateProvince(province._id, formData);
        if (updatedProvince) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleInputChange = (field: keyof ProvinceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'code' ? value.toUpperCase() : value
    }));
  };

  const generateCode = () => {
    if (formData.designation.trim()) {
      const code = formData.designation
        .trim()
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .substring(0, 10);
      handleInputChange('code', code);
    }
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nouvelle Province' : 
                mode === 'edit' ? 'Modifier la Province' : 
                'Détails de la Province';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Désignation et Code */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Désignation *
                </label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => handleInputChange('designation', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Ex: Kinshasa"
                  maxLength={100}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Code *
                  </label>
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={generateCode}
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Générer automatiquement
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="Ex: KIN"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 uppercase"
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={isReadOnly}
                placeholder="Description de la province..."
                maxLength={500}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50 resize-none"
                required
              />
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.description.length}/500 caractères
              </div>
            </div>

            {/* Photo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Photo (URL)
              </label>
              <div className="flex items-center space-x-2">
                <Image className="w-5 h-5 text-gray-400" />
                <input
                  type="url"
                  value={formData.photo}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                  disabled={isReadOnly}
                  placeholder="https://exemple.com/photo.jpg"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>
              {formData.photo && (
                <div className="mt-2">
                  <img
                    src={formData.photo}
                    alt="Aperçu"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Informations supplémentaires */}
            {mode !== 'create' && province && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Informations supplémentaires
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Créé le:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {new Date(province.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">Modifié le:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {new Date(province.updatedAt).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                {isReadOnly ? 'Fermer' : 'Annuler'}
              </button>
              
              {!isReadOnly && (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {mode === 'create' ? 'Créer' : 'Modifier'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
