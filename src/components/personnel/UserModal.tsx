"use client";

import React, { useState, useEffect } from 'react';
import { Personnel, CreatePersonnelData } from '@/types/personnel';
import { usePersonnelStore } from '@/stores/personnelStore';
import { useProvinceStore } from '@/stores/provinceStore';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  user?: Personnel;
  categorie: Personnel['categorie'];
  provinceId: string;
}

const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  mode,
  user,
  categorie,
  provinceId
}) => {
  const { addPersonnel, updatePersonnel, isLoading } = usePersonnelStore();
  const { provinces } = useProvinceStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatePersonnelData>({
    matricule: '',
    nom: '',
    post_nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sexe: 'M',
    adresse: '',
    nationalite: 'Congolaise',
    lieu_naissance: '',
    date_naissance: '',
    categorie: categorie,
    province: provinceId,
    grade: '',
    niveau: '',
    password: ''
  });

  useEffect(() => {
    if (user && (mode === 'edit' || mode === 'view')) {
      setFormData({
        matricule: user.matricule || '',
        nom: user.nom || '',
        post_nom: user.post_nom || '',
        prenom: user.prenom || '',
        email: user.email || '',
        telephone: user.telephone || '',
        sexe: user.sexe || 'M',
        adresse: user.adresse || '',
        nationalite: user.nationalite || 'Congolaise',
        lieu_naissance: user.lieu_naissance || '',
        date_naissance: user.date_naissance ? new Date(user.date_naissance).toISOString().split('T')[0] : '',
        categorie: user.categorie || categorie,
        province: typeof user.province === 'string' ? user.province : user.province?._id || provinceId,
        grade: user.grade || '',
        niveau: user.niveau || '',
        password: ''
      });
    } else if (mode === 'create') {
      setFormData({
        matricule: '',
        nom: '',
        post_nom: '',
        prenom: '',
        email: '',
        telephone: '',
        sexe: 'M',
        adresse: '',
        nationalite: 'Congolaise',
        lieu_naissance: '',
        date_naissance: '',
        categorie: categorie,
        province: provinceId,
        grade: '',
        niveau: '',
        password: ''
      });
    }
  }, [user, mode, categorie, provinceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      if (mode === 'create') {
        await addPersonnel(formData);
        setSuccess('Personnel créé avec succès !');
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      } else if (mode === 'edit' && user) {
        await updatePersonnel(user._id, formData);
        setSuccess('Personnel modifié avec succès !');
        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {mode === 'create' && 'Créer un nouveau personnel'}
            {mode === 'edit' && 'Modifier le personnel'}
            {mode === 'view' && 'Détails du personnel'}
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

        {/* Messages */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-md dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-md dark:bg-green-900/20 dark:border-green-800 dark:text-green-400">
            {success}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matricule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Matricule *
              </label>
              <input
                type="text"
                name="matricule"
                value={formData.matricule}
                onChange={handleInputChange}
                required
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom *
              </label>
              <input
                type="text"
                name="nom"
                value={formData.nom}
                onChange={handleInputChange}
                required
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Post-nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Post-nom
              </label>
              <input
                type="text"
                name="post_nom"
                value={formData.post_nom}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleInputChange}
                required
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Téléphone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                name="telephone"
                value={formData.telephone}
                onChange={handleInputChange}
                required
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Sexe */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sexe *
              </label>
              <select
                name="sexe"
                value={formData.sexe}
                onChange={handleInputChange}
                required
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              >
                <option value="M">Masculin</option>
                <option value="F">Féminin</option>
              </select>
            </div>

            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Province *
              </label>
              <select
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                required
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              >
                <option value="">Sélectionner une province</option>
                {provinces.map((province) => (
                  <option key={province._id} value={province._id}>
                    {province.designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Date de naissance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date de naissance *
              </label>
              <input
                type="date"
                name="date_naissance"
                value={formData.date_naissance}
                onChange={handleInputChange}
                required
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Lieu de naissance */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Lieu de naissance
              </label>
              <input
                type="text"
                name="lieu_naissance"
                value={formData.lieu_naissance}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Grade
              </label>
              <input
                type="text"
                name="grade"
                value={formData.grade}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Niveau */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Niveau
              </label>
              <input
                type="text"
                name="niveau"
                value={formData.niveau}
                onChange={handleInputChange}
                disabled={mode === 'view'}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
              />
            </div>

            {/* Mot de passe (seulement en création) */}
            {mode === 'create' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Adresse
            </label>
            <textarea
              name="adresse"
              value={formData.adresse}
              onChange={handleInputChange}
              rows={3}
              disabled={mode === 'view'}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white disabled:opacity-50"
            />
          </div>

          {/* Buttons */}
          {mode !== 'view' && (
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{mode === 'create' ? 'Créer' : 'Modifier'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default UserModal;
