"use client";

import React, { useState, useEffect } from 'react';
import { Unite, UniteFormData } from '@/services/UniteService';
import { Cours, CoursFormData } from '@/services/CoursService';
import UniteService from '@/services/UniteService';
import CoursService from '@/services/CoursService';

interface UniteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  unite: Unite;
  onUniteUpdated?: (updatedUnite: Unite) => void;
}

type UniteDataFields = 'mention' | 'code' | 'designation' | 'objectif' | 'competences' | 'approches' | 'evaluation' | 'ressources' | 'bibliographie' | 'videographie';
type CoursDataFields = 'titre' | 'description' | 'contenu' | 'repartition' | 'ressources' | 'penalites' | 'plagiat';

interface CoursEditData {
  titre: string;
  description: string;
  credit: number;
  contenu: string[];
  repartition: string[];
  ressources: string[];
  penalites: string[];
  plagiat: string[];
}

const UniteEditModal: React.FC<UniteEditModalProps> = ({ isOpen, onClose, unite, onUniteUpdated }) => {
  const [activeTab, setActiveTab] = useState<'unite' | 'cours'>('unite');
  const [loading, setLoading] = useState(false);
  const [cours, setCours] = useState<Cours[]>([]);
  const [selectedCours, setSelectedCours] = useState<Cours | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  // États pour l'unité
  const [uniteData, setUniteData] = useState({
    mention: '',
    code: '',
    designation: '',
    credit: 0,
    type: 'Obigatoire' as 'Obigatoire' | 'Optionnelle',
    objectif: [''],
    competences: [''],
    approches: [''],
    evaluation: [''],
    ressources: [''],
    bibliographie: [''],
    videographie: ['']
  });

  // États pour le cours
  const [coursData, setCoursData] = useState<CoursEditData>({
    titre: '',
    description: '',
    credit: 0,
    contenu: [''],
    repartition: [''],
    ressources: [''],
    penalites: [''],
    plagiat: ['']
  });

  useEffect(() => {
    if (isOpen && unite) {
      // Initialiser les données de l'unité
      setUniteData({
        mention: unite.descripteur.mention,
        code: unite.descripteur.code,
        designation: unite.descripteur.designation,
        credit: unite.descripteur.credit,
        type: unite.descripteur.type,
        objectif: unite.descripteur.objectif.length > 0 ? unite.descripteur.objectif : [''],
        competences: unite.descripteur.competences.length > 0 ? unite.descripteur.competences : [''],
        approches: unite.descripteur.approches.length > 0 ? unite.descripteur.approches : [''],
        evaluation: unite.descripteur.evaluation.length > 0 ? unite.descripteur.evaluation : [''],
        ressources: unite.ressources.length > 0 ? unite.ressources : [''],
        bibliographie: unite.bibliographie.length > 0 ? unite.bibliographie : [''],
        videographie: unite.videographie.length > 0 ? unite.videographie : ['']
      });

      // Charger les cours associés
      loadCours();
    }
  }, [isOpen, unite]);

  const loadCours = async () => {
    try {
      if (Array.isArray(unite.cours) && unite.cours.length > 0) {
        console.log(unite.cours);
        // Si les cours sont déjà des objets complets
        if (typeof unite.cours[0] === 'object') {
          setCours(unite.cours as Cours[]);
        } else {
          // Si ce sont des IDs, les charger
          const coursPromises = (unite.cours as string[]).map(id => 
            CoursService.getCours(id).catch(() => null)
          );
          const coursResults = await Promise.all(coursPromises);
          setCours(coursResults.filter(Boolean) as Cours[]);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des cours:', error);
    }
  };

  const handleArrayChange = (
    field: keyof typeof uniteData | keyof typeof coursData,
    index: number,
    value: string,
    isUnite: boolean = true
  ) => {
    if (isUnite) {
      setUniteData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => 
          i === index ? value : item
        )
      }));
    } else {
      setCoursData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => 
          i === index ? value : item
        )
      }));
    }
  };

  const addArrayItem = (field: keyof typeof uniteData | keyof typeof coursData, isUnite: boolean = true) => {
    if (isUnite) {
      setUniteData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), '']
      }));
    } else {
      setCoursData(prev => ({
        ...prev,
        [field]: [...(prev[field as keyof typeof prev] as string[]), '']
      }));
    }
  };

  const removeArrayItem = (field: keyof typeof uniteData | keyof typeof coursData, index: number, isUnite: boolean = true) => {
    if (isUnite) {
      setUniteData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
      }));
    } else {
      setCoursData(prev => ({
        ...prev,
        [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
      }));
    }
  };

  const handleSaveUnite = async () => {
    setLoading(true);
    try {
      const updateData: Partial<UniteFormData> = {
        descripteur: {
          ...unite.descripteur,
          mention: uniteData.mention,
          code: uniteData.code,
          designation: uniteData.designation,
          credit: uniteData.credit,
          type: uniteData.type,
          objectif: uniteData.objectif.filter(item => item.trim() !== ''),
          competences: uniteData.competences.filter(item => item.trim() !== ''),
          approches: uniteData.approches.filter(item => item.trim() !== ''),
          evaluation: uniteData.evaluation.filter(item => item.trim() !== '')
        },
        ressources: uniteData.ressources.filter(item => item.trim() !== ''),
        bibliographie: uniteData.bibliographie.filter(item => item.trim() !== ''),
        videographie: uniteData.videographie.filter(item => item.trim() !== '')
      };

      const updatedUnite = await UniteService.updateUnite(unite._id!, updateData);
      
      // Mettre à jour l'état local si le callback est fourni
      if (onUniteUpdated && updatedUnite) {
        onUniteUpdated(updatedUnite);
      }
      
      // Afficher un message de succès
      setSuccessMessage('Unité d\'enseignement mise à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
      
      onClose();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'unité:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCours = async () => {
    if (!selectedCours) return;
    
    setLoading(true);
    try {
      const updateData: Partial<CoursFormData> = {
        titre: coursData.titre,
        description: coursData.description,
        credit: coursData.credit,
        contenu: coursData.contenu.filter(item => item.trim() !== ''),
        repartition: coursData.repartition.filter(item => item.trim() !== ''),
        ressources: coursData.ressources.filter(item => item.trim() !== ''),
        penalites: coursData.penalites.filter(item => item.trim() !== ''),
        plagiat: coursData.plagiat.filter(item => item.trim() !== '')
      };

      const updatedCours = await CoursService.updateCours(selectedCours._id!, updateData);
      
      // Mettre à jour la liste des cours localement
      if (updatedCours) {
        setCours(prev => prev.map(c => c._id === updatedCours._id ? updatedCours : c));
      }
      
      setSelectedCours(null);
      
      // Afficher un message de succès
      setSuccessMessage('Cours mis à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du cours:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectCours = (cours: Cours) => {
    setSelectedCours(cours);
    setCoursData({
      titre: cours.titre,
      description: cours.description,
      credit: cours.credit,
      contenu: cours.contenu.length > 0 ? cours.contenu : [''],
      repartition: cours.repartition.length > 0 ? cours.repartition : [''],
      ressources: cours.ressources.length > 0 ? cours.ressources : [''],
      penalites: cours.penalites.length > 0 ? cours.penalites : [''],
      plagiat: cours.plagiat.length > 0 ? cours.plagiat : ['']
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Édition - {unite.descripteur.designation}
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

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('unite')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unite'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Unité d'Enseignement
            </button>
            <button
              onClick={() => setActiveTab('cours')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'cours'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Cours Associés ({cours.length})
            </button>
          </nav>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-md">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm text-green-800 dark:text-green-200">{successMessage}</span>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {activeTab === 'unite' ? (
            <UniteEditForm
              data={uniteData}
              setData={setUniteData}
              onArrayChange={handleArrayChange}
              onAddItem={addArrayItem}
              onRemoveItem={removeArrayItem}
            />
          ) : (
            <CoursEditSection
              cours={cours}
              selectedCours={selectedCours}
              coursData={coursData}
              onSelectCours={selectCours}
              onArrayChange={(field: CoursDataFields, index: number, value: string) => handleArrayChange(field, index, value, false)}
              onAddItem={(field: CoursDataFields) => addArrayItem(field, false)}
              onRemoveItem={(field: CoursDataFields, index: number) => removeArrayItem(field, index, false)}
              onSave={handleSaveCours}
              onCancel={() => setSelectedCours(null)}
              loading={loading}
              setCoursData={setCoursData}
            />
          )}
        </div>

        {/* Footer */}
        {activeTab === 'unite' && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              onClick={handleSaveUnite}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Type pour les données de l'unité
type UniteEditData = {
  mention: string;
  code: string;
  designation: string;
  credit: number;
  type: 'Obigatoire' | 'Optionnelle';
  objectif: string[];
  competences: string[];
  approches: string[];
  evaluation: string[];
  ressources: string[];
  bibliographie: string[];
  videographie: string[];
};

// Composant pour l'édition de l'unité
const UniteEditForm: React.FC<{
  data: UniteEditData;
  setData: React.Dispatch<React.SetStateAction<UniteEditData>>;
  onArrayChange: (field: UniteDataFields, index: number, value: string) => void;
  onAddItem: (field: UniteDataFields) => void;
  onRemoveItem: (field: UniteDataFields, index: number) => void;
}> = ({ data, setData, onArrayChange, onAddItem, onRemoveItem }) => {
  return (
    <div className="space-y-6">
      {/* Informations de base */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Mention
          </label>
          <input
            type="text"
            value={data.mention}
            onChange={(e) => setData(prev => ({ ...prev, mention: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Code
          </label>
          <input
            type="text"
            value={data.code}
            onChange={(e) => setData(prev => ({ ...prev, code: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Désignation
        </label>
        <input
          type="text"
          value={data.designation}
          onChange={(e) => setData(prev => ({ ...prev, designation: e.target.value }))}
          className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Crédits
          </label>
          <input
            type="number"
            min="0"
            value={data.credit}
            onChange={(e) => setData(prev => ({ ...prev, credit: parseInt(e.target.value) || 0 }))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <select
            value={data.type}
            onChange={(e) => setData(prev => ({ ...prev, type: e.target.value as 'Obigatoire' | 'Optionnelle' }))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="Obigatoire">Obligatoire</option>
            <option value="Optionnelle">Optionnelle</option>
          </select>
        </div>
      </div>

      {/* Sections avec listes */}
      {([
        { key: 'objectif' as UniteDataFields, label: 'Objectifs' },
        { key: 'competences' as UniteDataFields, label: 'Compétences' },
        { key: 'approches' as UniteDataFields, label: 'Approches pédagogiques' },
        { key: 'evaluation' as UniteDataFields, label: 'Modalités d\'évaluation' },
        { key: 'ressources' as UniteDataFields, label: 'Ressources' },
        { key: 'bibliographie' as UniteDataFields, label: 'Bibliographie' },
        { key: 'videographie' as UniteDataFields, label: 'Vidéographie' }
      ] as const).map(({ key, label }) => (
        <ArrayField
          key={key}
          label={label}
          items={data[key] as string[]}
          onChange={(index, value) => onArrayChange(key, index, value)}
          onAdd={() => onAddItem(key)}
          onRemove={(index) => onRemoveItem(key, index)}
        />
      ))}
    </div>
  );
};

// Composant pour l'édition des cours
const CoursEditSection: React.FC<{
  cours: Cours[];
  selectedCours: Cours | null;
  coursData: CoursEditData;
  onSelectCours: (cours: Cours) => void;
  onArrayChange: (field: CoursDataFields, index: number, value: string) => void;
  onAddItem: (field: CoursDataFields) => void;
  onRemoveItem: (field: CoursDataFields, index: number) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  setCoursData: React.Dispatch<React.SetStateAction<CoursEditData>>;
}> = ({ cours, selectedCours, coursData, onSelectCours, onArrayChange, onAddItem, onRemoveItem, onSave, onCancel, loading, setCoursData }) => {
  if (!selectedCours) {
    return (
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Sélectionner un cours à éditer
        </h3>
        {cours.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">Aucun cours associé à cette unité.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {cours.map((c) => (
              <div
                key={c._id}
                onClick={() => onSelectCours(c)}
                className="p-4 border border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <h4 className="font-medium text-gray-900 dark:text-white">{c.titre}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{c.description}</p>
                <div className="flex items-center mt-2 text-xs text-gray-400">
                  <span>{c.credit} crédits</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Édition du cours: {selectedCours.titre}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Informations de base du cours */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Titre
          </label>
          <input
            type="text"
            value={coursData.titre}
            onChange={(e) => setCoursData(prev => ({ ...prev, titre: e.target.value }))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <textarea
            value={coursData.description}
            onChange={(e) => setCoursData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Crédits
          </label>
          <input
            type="number"
            min="0"
            value={coursData.credit}
            onChange={(e) => setCoursData(prev => ({ ...prev, credit: parseInt(e.target.value) || 0 }))}
            className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      {/* Champs de type array */}
      {([
        { key: 'contenu' as keyof Pick<CoursEditData, 'contenu' | 'repartition' | 'ressources' | 'penalites' | 'plagiat'>, label: 'Contenu du cours' },
        { key: 'repartition' as keyof Pick<CoursEditData, 'contenu' | 'repartition' | 'ressources' | 'penalites' | 'plagiat'>, label: 'Répartition' },
        { key: 'ressources' as keyof Pick<CoursEditData, 'contenu' | 'repartition' | 'ressources' | 'penalites' | 'plagiat'>, label: 'Ressources' },
        { key: 'penalites' as keyof Pick<CoursEditData, 'contenu' | 'repartition' | 'ressources' | 'penalites' | 'plagiat'>, label: 'Pénalités' },
        { key: 'plagiat' as keyof Pick<CoursEditData, 'contenu' | 'repartition' | 'ressources' | 'penalites' | 'plagiat'>, label: 'Politique anti-plagiat' }
      ] as const).map(({ key, label }) => (
        <ArrayField
          key={key}
          label={label}
          items={coursData[key] as string[]}
          onChange={(index, value) => onArrayChange(key as CoursDataFields, index, value)}
          onAdd={() => onAddItem(key as CoursDataFields)}
          onRemove={(index) => onRemoveItem(key as CoursDataFields, index)}
        />
      ))}

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Annuler
        </button>
        <button
          onClick={onSave}
          disabled={loading}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enregistrement...' : 'Enregistrer le cours'}
        </button>
      </div>
    </div>
  );
};

// Composant réutilisable pour les champs de type array
const ArrayField: React.FC<{
  label: string;
  items: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}> = ({ label, items, onChange, onAdd, onRemove }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        >
          + Ajouter
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <input
              type="text"
              value={item}
              onChange={(e) => onChange(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={`${label} ${index + 1}`}
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UniteEditModal;
