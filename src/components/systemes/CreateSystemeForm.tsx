"use client";
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  FileText, 
  Settings, 
  CheckCircle, 
  Plus, 
  X, 
  Edit2,
  Trash2
} from 'lucide-react';
import { SystemeFormData, Cycle, CycleFormData } from '@/types/systemes';

interface CreateSystemeFormProps {
  onSubmit: (data: SystemeFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const steps: Step[] = [
  {
    id: 1,
    title: "Définition du système",
    description: "Informations de base du système",
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 2,
    title: "Définition des cycles",
    description: "Configuration des cycles du système",
    icon: <Settings className="h-5 w-5" />
  },
  {
    id: 3,
    title: "Résumé et soumission",
    description: "Vérification et validation",
    icon: <CheckCircle className="h-5 w-5" />
  }
];

export default function CreateSystemeForm({ onSubmit, onCancel, isLoading = false }: CreateSystemeFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<SystemeFormData>({
    designation: '',
    description: [],
    cycles: [],
    photo: ''
  });

  // États pour l'étape 1
  const [designation, setDesignation] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [descriptionItems, setDescriptionItems] = useState<string[]>([]);
  const [photo, setPhoto] = useState('');

  // États pour l'étape 2
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [isAddingCycle, setIsAddingCycle] = useState(false);
  const [editingCycleIndex, setEditingCycleIndex] = useState<number | null>(null);
  const [cycleForm, setCycleForm] = useState<CycleFormData>({
    designation: '',
    description: [],
    classes: [],
    photo: ''
  });
  const [cycleDescriptionText, setCycleDescriptionText] = useState('');
  const [cycleDescriptionItems, setCycleDescriptionItems] = useState<string[]>([]);

  // Fonctions utilitaires
  const addDescriptionItem = () => {
    if (descriptionText.trim()) {
      setDescriptionItems([...descriptionItems, descriptionText.trim()]);
      setDescriptionText('');
    }
  };

  const removeDescriptionItem = (index: number) => {
    setDescriptionItems(descriptionItems.filter((_, i) => i !== index));
  };

  const addCycleDescriptionItem = () => {
    if (cycleDescriptionText.trim()) {
      setCycleDescriptionItems([...cycleDescriptionItems, cycleDescriptionText.trim()]);
      setCycleDescriptionText('');
    }
  };

  const removeCycleDescriptionItem = (index: number) => {
    setCycleDescriptionItems(cycleDescriptionItems.filter((_, i) => i !== index));
  };

  // Navigation entre les étapes
  const nextStep = () => {
    if (currentStep === 1) {
      // Valider l'étape 1
      if (!designation.trim()) {
        alert('Veuillez saisir une désignation');
        return;
      }
      
      // Sauvegarder les données de l'étape 1
      setFormData(prev => ({
        ...prev,
        designation: designation.trim(),
        description: descriptionItems,
        photo: photo.trim()
      }));
    } else if (currentStep === 2) {
      // Sauvegarder les données de l'étape 2
      setFormData(prev => ({
        ...prev,
        cycles
      }));
    }
    
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // Gestion des cycles
  const startAddingCycle = () => {
    setCycleForm({
      designation: '',
      description: [],
      classes: [],
      photo: ''
    });
    setCycleDescriptionItems([]);
    setCycleDescriptionText('');
    setIsAddingCycle(true);
    setEditingCycleIndex(null);
  };

  const startEditingCycle = (index: number) => {
    const cycle = cycles[index];
    setCycleForm({
      designation: cycle.designation,
      description: cycle.description,
      classes: cycle.classes,
      photo: cycle.photo || ''
    });
    setCycleDescriptionItems(cycle.description);
    setCycleDescriptionText('');
    setIsAddingCycle(true);
    setEditingCycleIndex(index);
  };

  const saveCycle = () => {
    if (!cycleForm.designation.trim()) {
      alert('Veuillez saisir une désignation pour le cycle');
      return;
    }

    const newCycle: Cycle = {
      designation: cycleForm.designation.trim(),
      description: cycleDescriptionItems,
      classes: cycleForm.classes,
      photo: cycleForm.photo?.trim()
    };

    if (editingCycleIndex !== null) {
      // Modifier un cycle existant
      const updatedCycles = [...cycles];
      updatedCycles[editingCycleIndex] = newCycle;
      setCycles(updatedCycles);
    } else {
      // Ajouter un nouveau cycle
      setCycles([...cycles, newCycle]);
    }

    setIsAddingCycle(false);
    setEditingCycleIndex(null);
  };

  const cancelCycleForm = () => {
    setIsAddingCycle(false);
    setEditingCycleIndex(null);
    setCycleForm({
      designation: '',
      description: [],
      classes: [],
      photo: ''
    });
    setCycleDescriptionItems([]);
    setCycleDescriptionText('');
  };

  const deleteCycle = (index: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce cycle ?')) {
      setCycles(cycles.filter((_, i) => i !== index));
    }
  };

  // Soumission finale
  const handleSubmit = async () => {
    const finalData: SystemeFormData = {
      designation: formData.designation,
      description: formData.description,
      cycles: cycles,
      photo: formData.photo
    };

    await onSubmit(finalData);
  };

  // Rendu des étapes
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center ${
            currentStep >= step.id 
              ? 'text-blue-600 dark:text-blue-400' 
              : 'text-gray-400 dark:text-gray-600'
          }`}>
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.id
                ? 'border-blue-600 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20'
                : 'border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800'
            }`}>
              {step.icon}
            </div>
            <div className="ml-3 hidden sm:block">
              <p className="text-sm font-medium">{step.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
            </div>
          </div>
          {index < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-4 ${
              currentStep > step.id 
                ? 'bg-blue-600 dark:bg-blue-400' 
                : 'bg-gray-300 dark:bg-gray-600'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label htmlFor="designation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Désignation du système *
        </label>
        <input
          id="designation"
          type="text"
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="Ex: Système LMD, Système Classique..."
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div>
        <label htmlFor="photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Photo du système (URL)
        </label>
        <input
          id="photo"
          type="url"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          placeholder="https://exemple.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
        />
        {photo && (
          <div className="mt-2">
            <img 
              src={photo} 
              alt="Aperçu" 
              className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description du système
        </label>
        <div className="mt-1 space-y-2">
          <div className="flex gap-2">
            <input
              type="text"
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="Ajouter une description..."
              onKeyPress={(e) => e.key === 'Enter' && addDescriptionItem()}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={addDescriptionItem}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {descriptionItems.length > 0 && (
            <div className="space-y-2">
              {descriptionItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                  <span className="flex-1 text-sm text-gray-900 dark:text-white">{item}</span>
                  <button
                    type="button"
                    onClick={() => removeDescriptionItem(index)}
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Cycles du système</h3>
        <button 
          onClick={startAddingCycle} 
          disabled={isAddingCycle}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un cycle
        </button>
      </div>

      {isAddingCycle && (
        <div className="border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-blue-200 dark:border-blue-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {editingCycleIndex !== null ? 'Modifier le cycle' : 'Nouveau cycle'}
            </h3>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label htmlFor="cycle-designation" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Désignation du cycle *
              </label>
              <input
                id="cycle-designation"
                type="text"
                value={cycleForm.designation}
                onChange={(e) => setCycleForm(prev => ({ ...prev, designation: e.target.value }))}
                placeholder="Ex: Licence, Master, Doctorat..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="cycle-photo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Photo du cycle (URL)
              </label>
              <input
                id="cycle-photo"
                type="url"
                value={cycleForm.photo}
                onChange={(e) => setCycleForm(prev => ({ ...prev, photo: e.target.value }))}
                placeholder="https://exemple.com/image.jpg"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description du cycle
              </label>
              <div className="mt-1 space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cycleDescriptionText}
                    onChange={(e) => setCycleDescriptionText(e.target.value)}
                    placeholder="Ajouter une description..."
                    onKeyPress={(e) => e.key === 'Enter' && addCycleDescriptionItem()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={addCycleDescriptionItem}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                
                {cycleDescriptionItems.length > 0 && (
                  <div className="space-y-2">
                    {cycleDescriptionItems.map((item, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        <span className="flex-1 text-sm text-gray-900 dark:text-white">{item}</span>
                        <button
                          type="button"
                          onClick={() => removeCycleDescriptionItem(index)}
                          className="p-1 text-gray-400 hover:text-red-600 focus:outline-none"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <button 
                onClick={saveCycle} 
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {editingCycleIndex !== null ? 'Modifier' : 'Ajouter'}
              </button>
              <button 
                onClick={cancelCycleForm} 
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {cycles.length > 0 && (
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 dark:text-white">
            Cycles configurés ({cycles.length})
          </h4>
          {cycles.map((cycle, index) => (
            <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {cycle.designation}
                    </h5>
                    {cycle.description.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {cycle.description.map((desc, descIndex) => (
                          <p key={descIndex} className="text-sm text-gray-600 dark:text-gray-400">
                            • {desc}
                          </p>
                        ))}
                      </div>
                    )}
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                        {cycle.classes.length} classe(s)
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => startEditingCycle(index)}
                      disabled={isAddingCycle}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteCycle(index)}
                      disabled={isAddingCycle}
                      className="p-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {cycles.length === 0 && !isAddingCycle && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun cycle configuré</p>
          <p className="text-sm">Cliquez sur "Ajouter un cycle" pour commencer</p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium">Résumé du système</h3>
      
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <FileText className="h-5 w-5" />
            Informations générales
          </h3>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
              Désignation
            </label>
            <p className="text-lg font-medium text-gray-900 dark:text-white">{formData.designation}</p>
          </div>
          
          {formData.description.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Description
              </label>
              <ul className="mt-1 space-y-1">
                {formData.description.map((desc, index) => (
                  <li key={index} className="text-sm text-gray-900 dark:text-white">• {desc}</li>
                ))}
              </ul>
            </div>
          )}

          {formData.photo && (
            <div>
              <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Photo
              </label>
              <img 
                src={formData.photo} 
                alt="Système" 
                className="mt-1 w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
              />
            </div>
          )}
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-white">
            <Settings className="h-5 w-5" />
            Cycles configurés
          </h3>
        </div>
        <div className="p-4">
          {cycles.length > 0 ? (
            <div className="space-y-4">
              {cycles.map((cycle, index) => (
                <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-medium text-gray-900 dark:text-white">{cycle.designation}</h4>
                  {cycle.description.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {cycle.description.map((desc, descIndex) => (
                        <li key={descIndex} className="text-sm text-gray-600 dark:text-gray-400">
                          • {desc}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="mt-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600">
                      {cycle.classes.length} classe(s)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">Aucun cycle configuré</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Créer un nouveau système</h2>
        {renderStepIndicator()}
      </div>
      
      <div className="p-6">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
        
        <div className="flex justify-between pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
          <div>
            {currentStep > 1 && (
              <button 
                onClick={prevStep} 
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Précédent
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={onCancel} 
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Annuler
            </button>
            
            {currentStep < 3 ? (
              <button 
                onClick={nextStep}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Suivant
                <ChevronRight className="h-4 w-4 ml-2" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isLoading ? 'Création...' : 'Créer le système'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
