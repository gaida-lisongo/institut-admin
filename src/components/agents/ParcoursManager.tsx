'use client';

import { useState } from 'react';
import { Agent, Parcours } from '@/types/userTypes';
import { useAgentStore } from '@/stores/agentStore';
import { uploadFile } from '@/services/upload';
import { X, Plus, GraduationCap, Edit, Trash2, Save, Upload, FileText, Download } from 'lucide-react';
import Badge from '../ui/badge/Badge';

interface ParcoursManagerProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

interface ParcoursFormData {
  dateObtention: string;
  document: string;
  titre: string;
  url: string;
  isActive: boolean;
}

const initialFormData: ParcoursFormData = {
  dateObtention: '',
  document: '',
  titre: '',
  url: '',
  isActive: true
};

export default function ParcoursManager({ isOpen, onClose, agent }: ParcoursManagerProps) {
  const { updateAgent, agentsLoading } = useAgentStore();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<ParcoursFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<ParcoursFormData>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleInputChange = (field: keyof ParcoursFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({ ...prev, document: file.name }));
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      const fileUrl = await uploadFile(selectedFile);
      setFormData(prev => ({ ...prev, url: fileUrl }));
      console.log('Fichier uploadé avec succès:', fileUrl);
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors du téléchargement du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ParcoursFormData> = {};
    
    if (!formData.titre.trim()) newErrors.titre = 'Le titre est requis';
    if (!formData.dateObtention) newErrors.dateObtention = 'La date d\'obtention est requise';
    if (!formData.document.trim()) newErrors.document = 'Le document est requis';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !agent) return;

    // Upload file if selected but not uploaded yet
    if (selectedFile && !formData.url) {
      await handleFileUpload();
      if (!formData.url) return; // Upload failed
    }

    try {
      const newParcours: Parcours = {
        dateObtention: new Date(formData.dateObtention),
        document: formData.document,
        titre: formData.titre,
        url: formData.url,
        isActive: formData.isActive
      };

      let updatedParcours: Parcours[];
      
      if (editingIndex !== null) {
        // Modification d'un parcours existant
        updatedParcours = [...agent.parcours];
        updatedParcours[editingIndex] = newParcours;
      } else {
        // Ajout d'un nouveau parcours
        updatedParcours = [...agent.parcours, newParcours];
      }

      const updatedAgent: Agent = {
        ...agent,
        parcours: updatedParcours
      };

      await updateAgent(updatedAgent);
      handleCancel();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (index: number) => {
    const parcours = agent?.parcours[index];
    if (parcours) {
      setFormData({
        dateObtention: new Date(parcours.dateObtention).toISOString().split('T')[0],
        document: parcours.document,
        titre: parcours.titre,
        url: parcours.url,
        isActive: parcours.isActive
      });
      setEditingIndex(index);
      setIsAddingNew(true);
      setSelectedFile(null);
    }
  };

  const handleDelete = async (index: number) => {
    if (!agent) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce parcours ?')) {
      try {
        const updatedParcours = agent.parcours.filter((_, i) => i !== index);
        const updatedAgent: Agent = {
          ...agent,
          parcours: updatedParcours
        };
        
        await updateAgent(updatedAgent);
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setEditingIndex(null);
    setIsAddingNew(false);
    setErrors({});
    setSelectedFile(null);
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR');
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des Parcours
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {agent.identites.nom} {agent.identites.postNom}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Add New Button */}
          {!isAddingNew && (
            <div className="mb-6">
              <button
                onClick={() => setIsAddingNew(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Ajouter un parcours
              </button>
            </div>
          )}

          {/* Add/Edit Form */}
          {isAddingNew && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">
                {editingIndex !== null ? 'Modifier le parcours' : 'Nouveau parcours'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titre *
                  </label>
                  <input
                    type="text"
                    value={formData.titre}
                    onChange={(e) => handleInputChange('titre', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.titre ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Ex: Licence en Informatique"
                  />
                  {errors.titre && <p className="text-red-500 text-xs mt-1">{errors.titre}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date d'obtention *
                  </label>
                  <input
                    type="date"
                    value={formData.dateObtention}
                    onChange={(e) => handleInputChange('dateObtention', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.dateObtention ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.dateObtention && <p className="text-red-500 text-xs mt-1">{errors.dateObtention}</p>}
                </div>
              </div>

              {/* File Upload Section */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document *
                </label>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Upload className="h-4 w-4" />
                      Choisir un fichier
                    </label>
                    {selectedFile && (
                      <span className="text-sm text-gray-600">
                        {selectedFile.name}
                      </span>
                    )}
                  </div>

                  {selectedFile && !formData.url && (
                    <button
                      onClick={handleFileUpload}
                      disabled={isUploading}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Upload en cours...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4" />
                          Télécharger le fichier
                        </>
                      )}
                    </button>
                  )}

                  {formData.url && (
                    <div className="flex items-center gap-2 text-green-600">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">Fichier téléchargé avec succès</span>
                    </div>
                  )}
                </div>
                {errors.document && <p className="text-red-500 text-xs mt-1">{errors.document}</p>}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statut
                </label>
                <select
                  value={formData.isActive.toString()}
                  onChange={(e) => handleInputChange('isActive', e.target.value === 'true')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="true">Actif</option>
                  <option value="false">Inactif</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={agentsLoading || isUploading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Save className="h-4 w-4" />
                  {agentsLoading ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Parcours List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Parcours actuels ({agent.parcours.length})
            </h3>
            
            {agent.parcours.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <GraduationCap className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Aucun parcours enregistré</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {agent.parcours.map((parcours, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {parcours.titre}
                          </h4>
                          <Badge
                            size="sm"
                            color={parcours.isActive ? "success" : "error"}
                          >
                            {parcours.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Date d'obtention: {formatDate(parcours.dateObtention)}</p>
                          <p>Document: {parcours.document}</p>
                          {parcours.url && (
                            <a
                              href={parcours.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800"
                            >
                              <Download className="h-3 w-3" />
                              Télécharger le document
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(index)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
