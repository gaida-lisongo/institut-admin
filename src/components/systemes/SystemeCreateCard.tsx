'use client';

import { useState } from 'react';
import { useSystemeStore } from '@/stores/systemeStore';
import { SystemeFormData, Cycle, Classe } from '@/types/systemes';
import ImageUploader from './ImageUploader';

interface SystemeCreateCardProps {
    onSuccess: () => void;
    onCancel: () => void;
}

const SystemeCreateCard: React.FC<SystemeCreateCardProps> = ({ onSuccess, onCancel }) => {
    const { createSysteme, loading } = useSystemeStore();
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<SystemeFormData>({
        designation: '',
        description: [''],
        cycles: [],
        photo: ''
    });

    // Étape 1: Définition du système
    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Définition du système
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Commencez par définir les informations de base de votre système éducatif
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du système *
                </label>
                <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({...formData, designation: e.target.value})}
                    placeholder="Ex: Système LMD, Système Français..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Descriptions
                </label>
                {formData.description.map((desc, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                        <input
                            type="text"
                            value={desc}
                            onChange={(e) => {
                                const newDesc = [...formData.description];
                                newDesc[index] = e.target.value;
                                setFormData({...formData, description: newDesc});
                            }}
                            placeholder="Description du système..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {formData.description.length > 1 && (
                            <button
                                onClick={() => {
                                    const newDesc = formData.description.filter((_, i) => i !== index);
                                    setFormData({...formData, description: newDesc});
                                }}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
                <button
                    onClick={() => setFormData({...formData, description: [...formData.description, '']})}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                >
                    + Ajouter une description
                </button>
            </div>

            <div>
                <ImageUploader
                    currentImageUrl={formData.photo}
                    onImageUploaded={(url) => setFormData({...formData, photo: url})}
                    onImageRemoved={() => setFormData({...formData, photo: ''})}
                />
            </div>
        </div>
    );

    // Étape 2: Définition des cycles
    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Définition des cycles
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Ajoutez les cycles qui composent votre système éducatif
                </p>
            </div>

            {formData.cycles.map((cycle, cycleIndex) => (
                <div key={cycleIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                            Cycle {cycleIndex + 1}
                        </h4>
                        {formData.cycles.length > 1 && (
                            <button
                                onClick={() => {
                                    const newCycles = formData.cycles.filter((_, i) => i !== cycleIndex);
                                    setFormData({...formData, cycles: newCycles});
                                }}
                                className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                    
                    <div className="space-y-3">
                        <input
                            type="text"
                            value={cycle.designation}
                            onChange={(e) => {
                                const newCycles = [...formData.cycles];
                                newCycles[cycleIndex].designation = e.target.value;
                                setFormData({...formData, cycles: newCycles});
                            }}
                            placeholder="Nom du cycle (ex: Licence, Master...)"
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        
                        {cycle.description.map((desc, descIndex) => (
                            <div key={descIndex} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={(e) => {
                                        const newCycles = [...formData.cycles];
                                        newCycles[cycleIndex].description[descIndex] = e.target.value;
                                        setFormData({...formData, cycles: newCycles});
                                    }}
                                    placeholder="Description du cycle..."
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {cycle.description.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const newCycles = [...formData.cycles];
                                            newCycles[cycleIndex].description = cycle.description.filter((_, i) => i !== descIndex);
                                            setFormData({...formData, cycles: newCycles});
                                        }}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        <button
                            onClick={() => {
                                const newCycles = [...formData.cycles];
                                newCycles[cycleIndex].description.push('');
                                setFormData({...formData, cycles: newCycles});
                            }}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                        >
                            + Ajouter une description
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={() => {
                    const newCycle: Cycle = {
                        designation: '',
                        description: [''],
                        classes: []
                    };
                    setFormData({...formData, cycles: [...formData.cycles, newCycle]});
                }}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
                + Ajouter un cycle
            </button>
        </div>
    );

    // Étape 3: Définition des classes
    const renderStep3 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Définition des classes
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Définissez les classes pour chaque cycle
                </p>
            </div>

            {formData.cycles.map((cycle, cycleIndex) => (
                <div key={cycleIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-4">
                        Classes du cycle: {cycle.designation || `Cycle ${cycleIndex + 1}`}
                    </h4>
                    
                    {cycle.classes.map((classe, classeIndex) => (
                        <div key={classeIndex} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Classe {classeIndex + 1}
                                </span>
                                {cycle.classes.length > 1 && (
                                    <button
                                        onClick={() => {
                                            const newCycles = [...formData.cycles];
                                            newCycles[cycleIndex].classes = cycle.classes.filter((_, i) => i !== classeIndex);
                                            setFormData({...formData, cycles: newCycles});
                                        }}
                                        className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    type="text"
                                    value={classe.niveau}
                                    onChange={(e) => {
                                        const newCycles = [...formData.cycles];
                                        newCycles[cycleIndex].classes[classeIndex].niveau = e.target.value;
                                        setFormData({...formData, cycles: newCycles});
                                    }}
                                    placeholder="Niveau (ex: L1, L2, L3...)"
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <input
                                    type="number"
                                    value={classe.credit}
                                    onChange={(e) => {
                                        const newCycles = [...formData.cycles];
                                        newCycles[cycleIndex].classes[classeIndex].credit = parseInt(e.target.value) || 0;
                                        setFormData({...formData, cycles: newCycles});
                                    }}
                                    placeholder="Crédits"
                                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    ))}
                    
                    <button
                        onClick={() => {
                            const newClasse: Classe = {
                                niveau: '',
                                credit: 0,
                                description: [''],
                                semestres: []
                            };
                            const newCycles = [...formData.cycles];
                            newCycles[cycleIndex].classes.push(newClasse);
                            setFormData({...formData, cycles: newCycles});
                        }}
                        className="w-full p-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors text-sm"
                    >
                        + Ajouter une classe
                    </button>
                </div>
            ))}
        </div>
    );

    const handleSubmit = async () => {
        try {
            const result = await createSysteme(formData);
            if (result) {
                onSuccess();
            }
        } catch (error) {
            console.error('Erreur lors de la création:', error);
        }
    };

    const canProceedStep1 = formData.designation.trim() !== '';
    const canProceedStep2 = formData.cycles.length > 0 && formData.cycles.every(c => c.designation.trim() !== '');
    const canSubmit = canProceedStep2 && formData.cycles.every(c => c.classes.length > 0);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Progress bar */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Créer un nouveau système
                    </h2>
                    <div className="flex items-center space-x-2">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                    step === currentStep
                                        ? 'bg-blue-600 text-white'
                                        : step < currentStep
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-400'
                                }`}
                            >
                                {step < currentStep ? '✓' : step}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Étape {currentStep} sur 3
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
                {currentStep === 3 && renderStep3()}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                    Annuler
                </button>
                
                <div className="flex space-x-3">
                    {currentStep > 1 && (
                        <button
                            onClick={() => setCurrentStep(currentStep - 1)}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                        >
                            Précédent
                        </button>
                    )}
                    
                    {currentStep < 3 ? (
                        <button
                            onClick={() => setCurrentStep(currentStep + 1)}
                            disabled={
                                (currentStep === 1 && !canProceedStep1) ||
                                (currentStep === 2 && !canProceedStep2)
                            }
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                        >
                            Suivant
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!canSubmit || loading}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Création...
                                </>
                            ) : (
                                'Créer le système'
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SystemeCreateCard;
