'use client';

import { useState, useEffect } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { Agent, Identite } from '@/types/userTypes';
import { X, Save, User, MapPin, Lock } from 'lucide-react';

interface AgentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: Agent | null;
}

interface FormData {
  // Identité de base
  nom: string;
  postNom: string;
  preNom: string;
  sexe: string;
  
  // Informations personnelles
  nationalite: string;
  lieuNaissance: string;
  dateNaissance: string;
  etatCivil: string;
  
  // Credentials et contact
  matricule: string;
  secure: string;
  email: string;
  telephone: string;
  adresse: string;
}

const initialFormData: FormData = {
  nom: '',
  postNom: '',
  preNom: '',
  sexe: '',
  nationalite: '',
  lieuNaissance: '',
  dateNaissance: '',
  etatCivil: '',
  matricule: '',
  secure: '',
  email: '',
  telephone: '',
  adresse: ''
};

export default function AgentEditModal({ isOpen, onClose, agent }: AgentEditModalProps) {
  const { updateAgent, agentsLoading } = useAgentStore();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [activeTab, setActiveTab] = useState('identity');

  // Populate form when agent changes
  useEffect(() => {
    if (agent) {
      setFormData({
        nom: agent.identites.nom || '',
        postNom: agent.identites.postNom || '',
        preNom: agent.identites.preNom || '',
        sexe: agent.identites.sexe || '',
        nationalite: agent.identites.nationalite || '',
        lieuNaissance: agent.identites.lieuNaissance || '',
        dateNaissance: agent.identites.dateNaissance 
          ? new Date(agent.identites.dateNaissance).toISOString().split('T')[0] 
          : '',
        etatCivil: agent.identites.etatCivil || '',
        matricule: agent.matricule || '',
        secure: agent.secure || '',
        email: agent.identites.email || '',
        telephone: agent.identites.telephone || '',
        adresse: agent.identites.adresse || ''
      });
    }
  }, [agent]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    // Validation des champs obligatoires
    if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
    if (!formData.postNom.trim()) newErrors.postNom = 'Le post-nom est requis';
    if (!formData.preNom.trim()) newErrors.preNom = 'Le prénom est requis';
    if (!formData.sexe) newErrors.sexe = 'Le sexe est requis';
    if (!formData.matricule.trim()) newErrors.matricule = 'Le matricule est requis';
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email invalide';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !agent) return;

    try {
      const identites: Identite = {
        nom: formData.nom,
        postNom: formData.postNom,
        preNom: formData.preNom,
        sexe: formData.sexe,
        nationalite: formData.nationalite,
        lieuNaissance: formData.lieuNaissance,
        dateNaissance: formData.dateNaissance ? new Date(formData.dateNaissance) : undefined,
        etatCivil: formData.etatCivil,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse
      };

      const updatedAgent: Agent = {
        ...agent,
        matricule: formData.matricule,
        secure: formData.secure || agent.secure, // Keep existing password if not changed
        identites
      };

      await updateAgent(updatedAgent);
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
    }
  };

  const handleClose = () => {
    setFormData(initialFormData);
    setErrors({});
    setActiveTab('identity');
    onClose();
  };

  if (!isOpen || !agent) return null;

  const tabs = [
    { id: 'identity', label: 'Identité', icon: User },
    { id: 'personal', label: 'Personnel', icon: MapPin },
    { id: 'credentials', label: 'Credentials', icon: Lock }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identity':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom *
                </label>
                <input
                  type="text"
                  value={formData.nom}
                  onChange={(e) => handleInputChange('nom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nom ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.nom && <p className="text-red-500 text-xs mt-1">{errors.nom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Post-nom *
                </label>
                <input
                  type="text"
                  value={formData.postNom}
                  onChange={(e) => handleInputChange('postNom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.postNom ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.postNom && <p className="text-red-500 text-xs mt-1">{errors.postNom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom *
                </label>
                <input
                  type="text"
                  value={formData.preNom}
                  onChange={(e) => handleInputChange('preNom', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.preNom ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.preNom && <p className="text-red-500 text-xs mt-1">{errors.preNom}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sexe *
                </label>
                <select
                  value={formData.sexe}
                  onChange={(e) => handleInputChange('sexe', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sexe ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez le sexe</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </select>
                {errors.sexe && <p className="text-red-500 text-xs mt-1">{errors.sexe}</p>}
              </div>
            </div>
          </div>
        );

      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationalité
                </label>
                <input
                  type="text"
                  value={formData.nationalite}
                  onChange={(e) => handleInputChange('nationalite', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Congolaise"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance
                </label>
                <input
                  type="text"
                  value={formData.lieuNaissance}
                  onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Kinshasa"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance
                </label>
                <input
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  État civil
                </label>
                <select
                  value={formData.etatCivil}
                  onChange={(e) => handleInputChange('etatCivil', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Sélectionnez l'état civil</option>
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf(ve)">Veuf(ve)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'credentials':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Matricule *
                </label>
                <input
                  type="text"
                  value={formData.matricule}
                  onChange={(e) => handleInputChange('matricule', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.matricule ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.matricule && <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  value={formData.secure}
                  onChange={(e) => handleInputChange('secure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Laisser vide pour garder l'ancien"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <textarea
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Modifier l'agent
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {agent.identites.nom} {agent.identites.postNom}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {renderTabContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Annuler
          </button>

          <button
            onClick={handleSubmit}
            disabled={agentsLoading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {agentsLoading ? 'Modification...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}
