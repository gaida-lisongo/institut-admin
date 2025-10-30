'use client';

import { useState } from 'react';
import { useAgentStore } from '@/stores/agentStore';
import { Agent, Identite, Autorisation } from '@/types/userTypes';
import { X, ChevronLeft, ChevronRight, User, MapPin, Lock } from 'lucide-react';

interface AgentCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  // Étape 1: Identité de base
  nom: string;
  postNom: string;
  preNom: string;
  sexe: string;
  
  // Étape 2: Informations personnelles
  nationalite: string;
  lieuNaissance: string;
  dateNaissance: string;
  etatCivil: string;
  
  // Étape 3: Credentials et contact
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

export default function AgentCreateModal({ isOpen, onClose }: AgentCreateModalProps) {
  const { addAgent, agentsLoading } = useAgentStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<FormData> = {};

    switch (step) {
      case 1:
        if (!formData.nom.trim()) newErrors.nom = 'Le nom est requis';
        if (!formData.postNom.trim()) newErrors.postNom = 'Le post-nom est requis';
        if (!formData.preNom.trim()) newErrors.preNom = 'Le prénom est requis';
        if (!formData.sexe) newErrors.sexe = 'Le sexe est requis';
        break;
      case 2:
        if (!formData.nationalite.trim()) newErrors.nationalite = 'La nationalité est requise';
        if (!formData.lieuNaissance.trim()) newErrors.lieuNaissance = 'Le lieu de naissance est requis';
        if (!formData.dateNaissance) newErrors.dateNaissance = 'La date de naissance est requise';
        if (!formData.etatCivil) newErrors.etatCivil = 'L\'état civil est requis';
        break;
      case 3:
        if (!formData.matricule.trim()) newErrors.matricule = 'Le matricule est requis';
        if (!formData.secure.trim()) newErrors.secure = 'Le mot de passe est requis';
        if (!formData.email.trim()) newErrors.email = 'L\'email est requis';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Format email invalide';
        if (!formData.telephone.trim()) newErrors.telephone = 'Le téléphone est requis';
        if (!formData.adresse.trim()) newErrors.adresse = 'L\'adresse est requise';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    try {
      const identites: Identite = {
        nom: formData.nom,
        postNom: formData.postNom,
        preNom: formData.preNom,
        sexe: formData.sexe,
        nationalite: formData.nationalite,
        lieuNaissance: formData.lieuNaissance,
        dateNaissance: new Date(formData.dateNaissance),
        etatCivil: formData.etatCivil,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse
      };

      const autorisations: Autorisation[] = [{
        role: 'agent',
        scope: ['read'],
        isActive: true
      }];

      const newAgent: Agent = {
        matricule: formData.matricule,
        secure: formData.secure,
        identites,
        autorisations,
        parcours: []
      };

      await addAgent(newAgent);
      handleClose();
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Identité de base</h3>
            </div>
            
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
                  placeholder="Entrez le nom"
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
                  placeholder="Entrez le post-nom"
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
                  placeholder="Entrez le prénom"
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

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Informations personnelles</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nationalité *
                </label>
                <input
                  type="text"
                  value={formData.nationalite}
                  onChange={(e) => handleInputChange('nationalite', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.nationalite ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Congolaise"
                />
                {errors.nationalite && <p className="text-red-500 text-xs mt-1">{errors.nationalite}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lieu de naissance *
                </label>
                <input
                  type="text"
                  value={formData.lieuNaissance}
                  onChange={(e) => handleInputChange('lieuNaissance', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.lieuNaissance ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Kinshasa"
                />
                {errors.lieuNaissance && <p className="text-red-500 text-xs mt-1">{errors.lieuNaissance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de naissance *
                </label>
                <input
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => handleInputChange('dateNaissance', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.dateNaissance ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateNaissance && <p className="text-red-500 text-xs mt-1">{errors.dateNaissance}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  État civil *
                </label>
                <select
                  value={formData.etatCivil}
                  onChange={(e) => handleInputChange('etatCivil', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.etatCivil ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionnez l'état civil</option>
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié(e)">Marié(e)</option>
                  <option value="Divorcé(e)">Divorcé(e)</option>
                  <option value="Veuf(ve)">Veuf(ve)</option>
                </select>
                {errors.etatCivil && <p className="text-red-500 text-xs mt-1">{errors.etatCivil}</p>}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-medium">Credentials et contact</h3>
            </div>
            
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
                  placeholder="Ex: AGT001"
                />
                {errors.matricule && <p className="text-red-500 text-xs mt-1">{errors.matricule}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  value={formData.secure}
                  onChange={(e) => handleInputChange('secure', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.secure ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Mot de passe sécurisé"
                />
                {errors.secure && <p className="text-red-500 text-xs mt-1">{errors.secure}</p>}
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
                  placeholder="agent@exemple.com"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  value={formData.telephone}
                  onChange={(e) => handleInputChange('telephone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.telephone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="+243 xxx xxx xxx"
                />
                {errors.telephone && <p className="text-red-500 text-xs mt-1">{errors.telephone}</p>}
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse *
                </label>
                <textarea
                  value={formData.adresse}
                  onChange={(e) => handleInputChange('adresse', e.target.value)}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.adresse ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Adresse complète"
                />
                {errors.adresse && <p className="text-red-500 text-xs mt-1">{errors.adresse}</p>}
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
              Créer un nouvel agent
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Étape {currentStep} sur 3
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="px-6 py-2">
          <div className="flex items-center">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="h-4 w-4" />
            Précédent
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                Suivant
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={agentsLoading}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {agentsLoading ? 'Création...' : 'Créer l\'agent'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
