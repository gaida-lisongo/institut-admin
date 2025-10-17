"use client";

import React, { useState, useEffect } from 'react';
import { Personnel, CreatePersonnelData, UpdatePersonnelData } from '@/types/personnel';
import { usePersonnelStore } from '@/stores/personnelStore';
import { getGradesByCategorie, getGradeLabel } from '@/utils/gradeUtils';
import { X, User, Mail, Phone, MapPin, Calendar, Building, Award } from 'lucide-react';

interface PersonnelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: CreatePersonnelData | UpdatePersonnelData) => void;
  editingPersonnel?: Personnel | null;
  defaultCategorie?: Personnel['categorie'];
}

// Provinces par défaut (à adapter selon vos besoins)
const DEFAULT_PROVINCES = [
  { _id: '1', designation: 'Kinshasa' },
  { _id: '2', designation: 'Kongo Central' },
  { _id: '3', designation: 'Kwilu' },
  { _id: '4', designation: 'Kwango' },
  { _id: '5', designation: 'Mai-Ndombe' },
  { _id: '6', designation: 'Kasaï' },
  { _id: '7', designation: 'Kasaï Central' },
  { _id: '8', designation: 'Kasaï Oriental' },
  { _id: '9', designation: 'Sankuru' },
  { _id: '10', designation: 'Maniema' },
  { _id: '11', designation: 'Sud-Kivu' },
  { _id: '12', designation: 'Nord-Kivu' },
  { _id: '13', designation: 'Ituri' },
  { _id: '14', designation: 'Haut-Uele' },
  { _id: '15', designation: 'Bas-Uele' },
  { _id: '16', designation: 'Tshopo' },
  { _id: '17', designation: 'Mongala' },
  { _id: '18', designation: 'Nord-Ubangi' },
  { _id: '19', designation: 'Sud-Ubangi' },
  { _id: '20', designation: 'Équateur' },
  { _id: '21', designation: 'Tshuapa' },
  { _id: '22', designation: 'Lomami' },
  { _id: '23', designation: 'Haut-Lomami' },
  { _id: '24', designation: 'Lualaba' },
  { _id: '25', designation: 'Haut-Katanga' },
  { _id: '26', designation: 'Tanganyika' }
];

const PersonnelModal: React.FC<PersonnelModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  editingPersonnel,
  defaultCategorie
}) => {
  const { addPersonnel, updatePersonnel, isLoading } = usePersonnelStore();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreatePersonnelData & { password?: string }>({
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
    categorie: defaultCategorie || 'ADMINISTRATIF',
    province: '',
    grade: '',
    niveau: '',
    password: '' // Requis pour la création
  });

  useEffect(() => {
    if (editingPersonnel) {
      setFormData({
        matricule: editingPersonnel.matricule || '',
        nom: editingPersonnel.nom || '',
        post_nom: editingPersonnel.post_nom || '',
        prenom: editingPersonnel.prenom || '',
        email: editingPersonnel.email || '',
        telephone: editingPersonnel.telephone || '',
        sexe: editingPersonnel.sexe || 'M',
        adresse: editingPersonnel.adresse || '',
        nationalite: editingPersonnel.nationalite || 'Congolaise',
        lieu_naissance: editingPersonnel.lieu_naissance || '',
        date_naissance: editingPersonnel.date_naissance ? new Date(editingPersonnel.date_naissance).toISOString().split('T')[0] : '',
        categorie: editingPersonnel.categorie || defaultCategorie || 'ADMINISTRATIF',
        province: typeof editingPersonnel.province === 'string' ? editingPersonnel.province : editingPersonnel.province?._id || '',
        grade: editingPersonnel.grade || '',
        niveau: editingPersonnel.niveau || '',
        password: '' // Pas requis pour la modification
      });
    } else {
      // Réinitialiser pour création
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
        categorie: defaultCategorie || 'ADMINISTRATIF',
        province: '',
        grade: '',
        niveau: '',
        password: ''
      });
    }
  }, [editingPersonnel, defaultCategorie, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    console.log('Soumission du formulaire:', { editingPersonnel: !!editingPersonnel, formData });

    // Validation des champs requis
    if (!formData.matricule || !formData.nom || !formData.prenom || !formData.email || 
        !formData.telephone || !formData.date_naissance || !formData.province) {
      setError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Validation du mot de passe pour la création
    if (!editingPersonnel && !formData.password) {
      setError('Le mot de passe est requis pour créer un nouvel agent');
      return;
    }

    try {
      const dataToSubmit = { ...formData };
      
      // Supprimer le mot de passe s'il est vide en modification
      if (editingPersonnel && !dataToSubmit.password) {
        delete (dataToSubmit as any).password;
      }

      if (editingPersonnel) {
        // await updatePersonnel(editingPersonnel._id!, dataToSubmit);
        onSuccess(dataToSubmit as UpdatePersonnelData);
        setSuccess('Agent modifié avec succès !'  );
      } else {
        // await addPersonnel(dataToSubmit);
        onSuccess(dataToSubmit as CreatePersonnelData);
        setSuccess('Agent créé avec succès !');
      }
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 2000);
    } catch (err) {
      console.error('Erreur lors de la soumission:', err);
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

  const handleClose = () => {
    setError(null);
    setSuccess(null);
    onClose();
  };

  // Obtenir les grades disponibles selon la catégorie sélectionnée
  const availableGrades = getGradesByCategorie(formData.categorie);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <User className="w-6 h-6 text-blue-600" />
            {editingPersonnel ? 'Modifier l\'agent' : 'Ajouter un nouvel agent'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-6 h-6" />
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
          {/* Section Informations personnelles */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Informations personnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: MAT001"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Nom de famille"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Post-nom"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Prénom"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ville/Province de naissance"
                />
              </div>

              {/* Nationalité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nationalité
                </label>
                <input
                  type="text"
                  name="nationalite"
                  value={formData.nationalite}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Nationalité"
                />
              </div>
            </div>
          </div>

          {/* Section Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Mail className="w-5 h-5 text-green-600" />
              Informations de contact
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="email@exemple.com"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="+243 XXX XXX XXX"
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner une province</option>
                  {DEFAULT_PROVINCES.map((province) => (
                    <option key={province._id} value={province.designation}>
                      {province.designation}
                    </option>
                  ))}
                </select>
              </div>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Adresse complète"
              />
            </div>
          </div>

          {/* Section Professionnelle */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-purple-600" />
              Informations professionnelles
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie *
                </label>
                <select
                  name="categorie"
                  value={formData.categorie}
                  onChange={handleInputChange}
                  required
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="ACADEMIQUE">Académique</option>
                  <option value="SCIENTIFIQUE">Scientifique</option>
                  <option value="ADMINISTRATIF">Administratif</option>
                  <option value="OUVRIER">Ouvrier</option>
                </select>
              </div>
                
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Grade
                </label>
                <select
                  name="grade"
                  value={formData.grade || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">Sélectionner un grade</option>
                  {availableGrades.map((grade) => (
                    <option key={grade.value} value={grade.value} title={grade.niveauFormation}>
                      {grade.label}
                    </option>
                  ))}
                </select>
                {formData.grade && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Niveau requis: {availableGrades.find(g => g.value === formData.grade)?.niveauFormation}
                  </p>
                )}
              </div>

              {/* Niveau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Niveau d'études
                </label>
                <input
                  type="text"
                  name="niveau"
                  value={formData.niveau}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: Licence, Master, Doctorat"
                />
              </div>

              {/* Mot de passe */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {editingPersonnel ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe *'}
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required={!editingPersonnel}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder={editingPersonnel ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
            >
              {isLoading && (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              <span>{editingPersonnel ? 'Modifier' : 'Créer'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonnelModal;
