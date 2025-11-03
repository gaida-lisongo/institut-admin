'use client';

import { useState } from 'react';
import { Agent, Autorisation } from '@/types/userTypes';
import { useAgentStore } from '@/stores/agentStore';
import { X, Plus, Shield, Edit, Trash2, Save } from 'lucide-react';
import Badge from '../ui/badge/Badge';

interface AutorisationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

interface AutorisationFormData {
  role: string;
  scope: string[];
  isActive: boolean;
}

const initialFormData: AutorisationFormData = {
  role: '',
  scope: [],
  isActive: true
};

const availableRoles = [
  'admin',
  'agent',
  'superviseur',
  'gestionnaire',
  'consultant'
];

const availableScopes = [
  'read',
  'write',
  'delete',
  'manage_users',
  'manage_agents',
  'manage_reports',
  'manage_system'
];

export default function AutorisationManager({ isOpen, onClose, agent }: AutorisationManagerProps) {
  const { updateAgent, agentsLoading } = useAgentStore();
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<AutorisationFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof AutorisationFormData, string>>>({});

  const handleInputChange = (field: keyof AutorisationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleScopeToggle = (scope: string) => {
    setFormData(prev => ({
      ...prev,
      scope: prev.scope.includes(scope)
        ? prev.scope.filter(s => s !== scope)
        : [...prev.scope, scope]
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof AutorisationFormData, string>> = {};
    
    if (!formData.role.trim()) newErrors.role = 'Le rôle est requis';
    if (formData.scope.length === 0) newErrors.scope = 'Au moins une permission est requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || !agent) return;

    try {
      const newAutorisation: Autorisation = {
        role: formData.role,
        scope: formData.scope,
        isActive: formData.isActive
      };

      let updatedAutorisations: Autorisation[];
      
      if (editingIndex !== null) {
        // Modification d'une autorisation existante
        updatedAutorisations = [...agent.autorisations];
        updatedAutorisations[editingIndex] = newAutorisation;
      } else {
        // Ajout d'une nouvelle autorisation
        updatedAutorisations = [...agent.autorisations, newAutorisation];
      }

      const updatedAgent: Agent = {
        ...agent,
        autorisations: updatedAutorisations
      };

      await updateAgent(updatedAgent);
      handleCancel();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleEdit = (index: number) => {
    const autorisation = agent?.autorisations[index];
    if (autorisation) {
      setFormData({
        role: autorisation.role,
        scope: [...autorisation.scope],
        isActive: autorisation.isActive
      });
      setEditingIndex(index);
      setIsAddingNew(true);
    }
  };

  const handleDelete = async (index: number) => {
    if (!agent) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette autorisation ?')) {
      try {
        const updatedAutorisations = agent.autorisations.filter((_, i) => i !== index);
        const updatedAgent: Agent = {
          ...agent,
          autorisations: updatedAutorisations
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
  };

  const handleClose = () => {
    handleCancel();
    onClose();
  };

  if (!isOpen || !agent) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Gestion des Autorisations
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
                Ajouter une autorisation
              </button>
            </div>
          )}

          {/* Add/Edit Form */}
          {isAddingNew && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium mb-4">
                {editingIndex !== null ? 'Modifier l\'autorisation' : 'Nouvelle autorisation'}
              </h3>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rôle *
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.role ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Sélectionnez un rôle</option>
                    {availableRoles.map(role => (
                      <option key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </option>
                    ))}
                  </select>
                  {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
                </div>

                <div>
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
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Permissions *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {availableScopes.map(scope => (
                    <label key={scope} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.scope.includes(scope)}
                        onChange={() => handleScopeToggle(scope)}
                        className="mr-2"
                      />
                      <span className="text-sm">{scope}</span>
                    </label>
                  ))}
                </div>
                {errors.scope && <p className="text-red-500 text-xs mt-1">{errors.scope}</p>}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={agentsLoading}
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

          {/* Autorisations List */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              Autorisations actuelles ({agent.autorisations.length})
            </h3>
            
            {agent.autorisations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Shield className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Aucune autorisation définie</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {agent.autorisations.map((autorisation, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {autorisation.role.charAt(0).toUpperCase() + autorisation.role.slice(1)}
                          </h4>
                          <Badge
                            size="sm"
                            color={autorisation.isActive ? "success" : "error"}
                          >
                            {autorisation.isActive ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {autorisation.scope.map(scope => (
                            <span
                              key={scope}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {scope}
                            </span>
                          ))}
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
