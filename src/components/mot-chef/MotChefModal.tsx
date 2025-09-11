"use client";
import React, { useState, useEffect } from "react";
import { type MotChef } from "@/stores/sectionStore";
import BlobManager from "@/services/BlobManager";

interface MotChefModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (motChef: MotChef) => Promise<void>;
  motChef?: MotChef | null;
  title: string;
}

export default function MotChefModal({
  isOpen,
  onClose,
  onSubmit,
  motChef,
  title
}: MotChefModalProps) {
  const [formData, setFormData] = useState<MotChef>({
    photo: '',
    description: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    if (motChef) {
      setFormData(motChef);
      setImagePreview(motChef.photo || '');
    } else {
      setFormData({
        photo: '',
        description: ''
      });
      setImagePreview('');
    }
    setImageFile(null);
  }, [motChef, isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      let photoUrl = formData.photo;

      // Upload de l'image si une nouvelle image a été sélectionnée
      if (imageFile) {
        try {
          const uploadResult = await BlobManager.createBlob(imageFile, { type: 'mot-chef' });
          if (uploadResult && uploadResult.url) {
            photoUrl = uploadResult.url;
          } else {
            alert('Erreur lors du téléchargement de l\'image');
            setIsLoading(false);
            return;
          }
        } catch (error) {
          console.error('Erreur upload:', error);
          alert('Erreur lors du téléchargement de l\'image');
          setIsLoading(false);
          return;
        }
      }

      const motChefData: MotChef = {
        photo: photoUrl,
        description: formData.description
      };

      await onSubmit(motChefData);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
      alert('Erreur lors de l\'enregistrement');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Photo du chef */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photo du chef de section
            </label>
            
            {/* Prévisualisation de l'image */}
            {imagePreview && (
              <div className="mb-4">
                <img
                  src={imagePreview}
                  alt="Prévisualisation"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Formats acceptés: JPG, PNG, GIF (max 5MB)
            </p>
          </div>

          {/* Message du chef */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Message du chef de section
            </label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={8}
              placeholder="Écrivez le message du chef de section..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ce message apparaîtra sur la page publique de la section
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
