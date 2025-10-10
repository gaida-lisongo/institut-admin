'use client';

import { useState, useEffect } from 'react';
import { Classe } from '@/types/systemes';
import ImageUploader from './ImageUploader';

interface ClasseModalProps {
    classe?: Classe;
    isOpen: boolean;
    onClose: () => void;
    onSave: (classe: Classe) => void;
}

const ClasseModal: React.FC<ClasseModalProps> = ({ classe, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState<Classe>({
        niveau: '',
        credit: 0,
        description: [''],
        semestres: [],
        photo: ''
    });

    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        if (classe) {
            setFormData({
                ...classe,
                description: [...classe.description],
                semestres: classe.semestres ? [...classe.semestres] : []
            });
        } else {
            setFormData({
                niveau: '',
                credit: 0,
                description: [''],
                semestres: [],
                photo: ''
            });
        }
        setCurrentStep(1);
    }, [classe, isOpen]);

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    const addDescription = () => {
        setFormData(prev => ({
            ...prev,
            description: [...prev.description, '']
        }));
    };

    const updateDescription = (index: number, value: string) => {
        const newDescriptions = [...formData.description];
        newDescriptions[index] = value;
        setFormData(prev => ({ ...prev, description: newDescriptions }));
    };

    const removeDescription = (index: number) => {
        if (formData.description.length > 1) {
            const newDescriptions = formData.description.filter((_, i) => i !== index);
            setFormData(prev => ({ ...prev, description: newDescriptions }));
        }
    };

    const addSemestre = () => {
        setFormData(prev => ({
            ...prev,
            semestres: [...prev.semestres, {
                designation: '',
                credit: 0,
                description: ['']
            }]
        }));
    };

    const updateSemestre = (index: number, field: string, value: any) => {
        const newSemestres = [...formData.semestres];
        newSemestres[index] = { ...newSemestres[index], [field]: value };
        setFormData(prev => ({ ...prev, semestres: newSemestres }));
    };

    const removeSemestre = (index: number) => {
        const newSemestres = formData.semestres.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, semestres: newSemestres }));
    };

    const updateSemestreDescription = (semestreIndex: number, descIndex: number, value: string) => {
        const newSemestres = [...formData.semestres];
        const newDescriptions = [...newSemestres[semestreIndex].description];
        newDescriptions[descIndex] = value;
        newSemestres[semestreIndex] = { ...newSemestres[semestreIndex], description: newDescriptions };
        setFormData(prev => ({ ...prev, semestres: newSemestres }));
    };

    const addSemestreDescription = (semestreIndex: number) => {
        const newSemestres = [...formData.semestres];
        newSemestres[semestreIndex] = {
            ...newSemestres[semestreIndex],
            description: [...newSemestres[semestreIndex].description, '']
        };
        setFormData(prev => ({ ...prev, semestres: newSemestres }));
    };

    const removeSemestreDescription = (semestreIndex: number, descIndex: number) => {
        const newSemestres = [...formData.semestres];
        if (newSemestres[semestreIndex].description.length > 1) {
            newSemestres[semestreIndex] = {
                ...newSemestres[semestreIndex],
                description: newSemestres[semestreIndex].description.filter((_, i) => i !== descIndex)
            };
            setFormData(prev => ({ ...prev, semestres: newSemestres }));
        }
    };

    if (!isOpen) return null;

    const renderStep1 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Informations de base
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Définissez les informations principales de la classe
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Niveau de la classe *
                    </label>
                    <input
                        type="text"
                        value={formData.niveau}
                        onChange={(e) => setFormData(prev => ({ ...prev, niveau: e.target.value }))}
                        placeholder="Ex: L1, L2, Master 1..."
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Crédits *
                    </label>
                    <input
                        type="number"
                        value={formData.credit}
                        onChange={(e) => setFormData(prev => ({ ...prev, credit: parseInt(e.target.value) || 0 }))}
                        placeholder="60"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
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
                            onChange={(e) => updateDescription(index, e.target.value)}
                            placeholder="Description de la classe..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {formData.description.length > 1 && (
                            <button
                                onClick={() => removeDescription(index)}
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
                    onClick={addDescription}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium"
                >
                    + Ajouter une description
                </button>
            </div>

            <div>
                <ImageUploader
                    currentImageUrl={formData.photo}
                    onImageUploaded={(url) => setFormData(prev => ({ ...prev, photo: url }))}
                    onImageRemoved={() => setFormData(prev => ({ ...prev, photo: '' }))}
                />
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6">
            <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Gestion des semestres
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                    Ajoutez et configurez les semestres de cette classe
                </p>
            </div>

            {formData.semestres.map((semestre, semestreIndex) => (
                <div key={semestreIndex} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900 dark:text-white">
                            Semestre {semestreIndex + 1}
                        </h4>
                        <button
                            onClick={() => removeSemestre(semestreIndex)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 p-1 rounded"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Nom du semestre
                            </label>
                            <input
                                type="text"
                                value={semestre.designation}
                                onChange={(e) => updateSemestre(semestreIndex, 'designation', e.target.value)}
                                placeholder="Ex: Semestre 1, S1..."
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Crédits
                            </label>
                            <input
                                type="number"
                                value={semestre.credit}
                                onChange={(e) => updateSemestre(semestreIndex, 'credit', parseInt(e.target.value) || 0)}
                                placeholder="30"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Descriptions du semestre
                        </label>
                        {semestre.description.map((desc, descIndex) => (
                            <div key={descIndex} className="flex items-center space-x-2 mb-2">
                                <input
                                    type="text"
                                    value={desc}
                                    onChange={(e) => updateSemestreDescription(semestreIndex, descIndex, e.target.value)}
                                    placeholder="Description du semestre..."
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                {semestre.description.length > 1 && (
                                    <button
                                        onClick={() => removeSemestreDescription(semestreIndex, descIndex)}
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
                            onClick={() => addSemestreDescription(semestreIndex)}
                            className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm"
                        >
                            + Ajouter une description
                        </button>
                    </div>
                </div>
            ))}

            <button
                onClick={addSemestre}
                className="w-full p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
            >
                + Ajouter un semestre
            </button>
        </div>
    );

    const canProceedStep1 = formData.niveau.trim() !== '' && formData.credit > 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Progress bar */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {classe ? 'Modifier la classe' : 'Créer une nouvelle classe'}
                        </h2>
                        <div className="flex items-center space-x-2">
                            {[1, 2].map((step) => (
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
                        Étape {currentStep} sur 2
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 max-h-96 overflow-y-auto">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                </div>

                {/* Actions */}
                <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-4 flex items-center justify-between">
                    <button
                        onClick={onClose}
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
                        
                        {currentStep < 2 ? (
                            <button
                                onClick={() => setCurrentStep(currentStep + 1)}
                                disabled={!canProceedStep1}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                Suivant
                            </button>
                        ) : (
                            <button
                                onClick={handleSave}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                            >
                                {classe ? 'Sauvegarder' : 'Créer la classe'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClasseModal;
