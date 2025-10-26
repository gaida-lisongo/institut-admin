'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, FileText, Loader2, Image, Upload, Trash2 } from 'lucide-react';
import { Province, ProvinceFormData } from '@/types/province';
import { useProvinceStore } from '@/stores/provinceStore';
import BlobManager from '@/services/BlobManager';

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

  // États pour la gestion de l'upload d'image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setImagePreview(province.photo || '');
    } else if (mode === 'create') {
      // Réinitialiser pour une nouvelle province
      setFormData({
        designation: '',
        code: '',
        description: '',
        photo: ''
      });
      setImagePreview('');
    }
    
    // Réinitialiser les états d'upload
    setImageFile(null);
    setUploadingImage(false);
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
      let finalFormData = { ...formData };

      // Si une nouvelle image a été sélectionnée, l'uploader d'abord
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadResult = await BlobManager.createBlob(imageFile, {
            type: 'province-photo',
            provinceCode: formData.code
          });
          finalFormData.photo = uploadResult.url;
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload de l\'image:', uploadError);
          alert('Erreur lors de l\'upload de l\'image. Veuillez réessayer.');
          setUploadingImage(false);
          return;
        }
        setUploadingImage(false);
      }

      if (mode === 'create') {
        const newProvince = await createProvince(finalFormData);
        if (newProvince) {
          onClose();
        }
      } else if (mode === 'edit' && province) {
        const updatedProvince = await updateProvince(province._id, finalFormData);
        if (updatedProvince) {
          onClose();
        }
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      setUploadingImage(false);
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

  // Fonctions pour la gestion de l'upload d'image
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validation du type de fichier
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Type de fichier non supporté. Veuillez sélectionner une image (JPEG, PNG, WebP, GIF).');
        return;
      }

      // Validation de la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('La taille du fichier ne doit pas dépasser 5MB.');
        return;
      }

      setImageFile(file);
      
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, photo: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Nouvelle Province' : 
                mode === 'edit' ? 'Modifier la Province' : 
                'Détails de la Province';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" style={{ zIndex: 1000 }}>
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
          onClick={onClose}
          style={{ zIndex: 1001 }}
        />

        {/* Modal Container */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        {/* Modal */}
        <div 
          className="relative inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl"
          style={{ zIndex: 1002 }}
        >
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
                Photo de la province
              </label>
              
              {/* Zone d'upload et prévisualisation */}
              <div className="space-y-4">
                {/* Input file caché */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={isReadOnly}
                />

                {/* Zone de prévisualisation */}
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Aperçu de la province"
                      className="w-full h-48 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    {!isReadOnly && (
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    {imageFile && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded">
                        Nouvelle image sélectionnée
                      </div>
                    )}
                  </div>
                ) : (
                  <div 
                    onClick={!isReadOnly ? triggerFileInput : undefined}
                    className={`w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center ${
                      !isReadOnly ? 'cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10' : ''
                    } transition-colors duration-200`}
                  >
                    <div className="text-center">
                      <Image className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {isReadOnly ? 'Aucune photo disponible' : 'Cliquez pour sélectionner une image'}
                      </p>
                      {!isReadOnly && (
                        <p className="text-xs text-gray-400 mt-1">
                          JPEG, PNG, WebP, GIF - Max 5MB
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Boutons d'action pour l'image */}
                {!isReadOnly && (
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={triggerFileInput}
                      disabled={uploadingImage}
                      className="inline-flex items-center px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {imagePreview ? 'Changer l\'image' : 'Sélectionner une image'}
                    </button>
                    
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={handleImageRemove}
                        disabled={uploadingImage}
                        className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Supprimer
                      </button>
                    )}
                  </div>
                )}

                {/* URL manuelle (optionnel) */}
                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Ou saisir une URL d'image
                  </label>
                  <div className="flex items-center space-x-2">
                    <Image className="w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.photo}
                      onChange={(e) => {
                        handleInputChange('photo', e.target.value);
                        if (e.target.value) {
                          setImagePreview(e.target.value);
                          setImageFile(null);
                        }
                      }}
                      disabled={isReadOnly}
                      placeholder="https://exemple.com/photo.jpg"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                    />
                  </div>
                </div>
              </div>
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
                  disabled={loading || uploadingImage}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
                >
                  {(loading || uploadingImage) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                  {uploadingImage ? 'Upload en cours...' : 
                   loading ? 'Sauvegarde...' :
                   mode === 'create' ? 'Créer' : 'Modifier'}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
