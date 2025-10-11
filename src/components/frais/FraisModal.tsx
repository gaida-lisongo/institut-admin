"use client";

import { useState, useEffect } from "react";
import { useFraisStore } from "@/stores/fraisStore";
import { Frais, FraisInput, TypeEtablissement } from "@/types/frais";
import { Loader2, Save, X, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface FraisModalProps {
    isOpen: boolean;
    onClose: (shouldRefresh?: boolean) => void;
    frais?: Frais | null;
    mode: 'create' | 'edit' | 'view';
    defaultCategorie?: string;
}

const FraisModal = ({ isOpen, onClose, frais, mode, defaultCategorie }: FraisModalProps) => {
    const { addFrais, updateFrais, isLoading } = useFraisStore();

    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<FraisInput>({
        designation: '',
        categorie: defaultCategorie || '',
        description: '',
        montant: 0,
        etabs: [],
        repartitions: []
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const steps = [
        { number: 1, title: 'Désignation & Montant' },
        { number: 2, title: 'Type & Description' },
        { number: 3, title: 'Résumé & Validation' }
    ];

    // Réinitialisation du formulaire
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            if (mode === 'edit' && frais) {
                setFormData({
                    designation: frais.designation,
                    categorie: frais.categorie,
                    description: frais.description,
                    montant: frais.montant,
                    etabs: frais.etabs,
                    repartitions: frais.repartitions || []
                });
            } else {
                setFormData({
                    designation: '',
                    categorie: defaultCategorie || '',
                    description: '',
                    montant: 0,
                    etabs: [],
                    repartitions: []
                });
            }
            setErrors({});
        }
    }, [isOpen, mode, frais, defaultCategorie]);

    // Validation par étape
    const validateStep = (step: number): boolean => {
        const newErrors: Record<string, string> = {};

        if (step === 1) {
            if (!formData.designation.trim()) {
                newErrors.designation = 'La désignation est requise';
            }
            if (!formData.montant || formData.montant <= 0) {
                newErrors.montant = 'Le montant doit être supérieur à 0';
            }
        }

        if (step === 2) {
            if (!formData.etabs.length) {
                newErrors.etabs = 'Au moins un type d\'établissement doit être sélectionné';
            }
            if (!formData.description.trim()) {
                newErrors.description = 'La description est requise';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Navigation entre les étapes
    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
        setErrors({});
    };

    // Soumission du formulaire
    const handleSubmit = async () => {
        try {
            let result;
            if (mode === 'create') {
                result = await addFrais(formData);
            } else if (mode === 'edit' && frais?._id) {
                result = await updateFrais(frais._id, formData);
            }

            if (result) {
                alert(mode === 'create' 
                    ? "Frais créé avec succès" 
                    : "Frais mis à jour avec succès");
                onClose(true);
            }
        } catch (error) {
            alert("Une erreur est survenue lors de l'opération");
        }
    };

    // Gestion des établissements
    const handleEtabChange = (etab: TypeEtablissement) => {
        const isChecked = formData.etabs.includes(etab);
        setFormData(prev => ({
            ...prev,
            etabs: isChecked 
                ? prev.etabs!.filter(e => e !== etab)
                : [...prev.etabs!, etab]
        }));
        // Effacer l'erreur
        if (errors.etabs) {
            setErrors(prev => ({ ...prev, etabs: '' }));
        }
    };

    // Formatage du montant
    const formatMontant = (montant: number) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'CDF',
            minimumFractionDigits: 0,
        }).format(montant);
    };

    const isReadOnly = mode === 'view';
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-semibold">
                                {mode === 'create' ? 'Nouveau Frais' : mode === 'edit' ? 'Modifier le Frais' : 'Détails du Frais'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">Catégorie: {defaultCategorie}</p>
                        </div>
                        <button 
                            onClick={() => onClose()}
                            className="text-gray-500 hover:text-gray-700"
                            disabled={isLoading}
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    {/* Stepper - Seulement pour create/edit */}
                    {mode !== 'view' && (
                        <div className="mb-8">
                            <div className="flex items-center justify-between">
                                {steps.map((step, index) => (
                                    <div key={step.number} className="flex items-center flex-1">
                                        <div className="flex flex-col items-center flex-1">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                                                currentStep > step.number 
                                                    ? 'bg-green-500 text-white' 
                                                    : currentStep === step.number 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-gray-200 text-gray-600'
                                            }`}>
                                                {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                                            </div>
                                            <span className={`text-xs mt-2 text-center ${
                                                currentStep >= step.number ? 'text-gray-900 font-medium' : 'text-gray-400'
                                            }`}>
                                                {step.title}
                                            </span>
                                        </div>
                                        {index < steps.length - 1 && (
                                            <div className={`h-1 flex-1 mx-2 ${
                                                currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                                            }`} />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex-1">
                        {/* Étape 1: Désignation & Montant */}
                        {currentStep === 1 && (
                            <div className="space-y-6 py-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="designation">
                                        Désignation *
                                    </label>
                                    <input
                                        id="designation"
                                        type="text"
                                        value={formData.designation}
                                        onChange={(e) => {
                                            setFormData({...formData, designation: e.target.value});
                                            if (errors.designation) setErrors({...errors, designation: ''});
                                        }}
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.designation ? 'border-red-500' : ''
                                        }`}
                                        placeholder="Ex: Frais d'inscription L1"
                                        disabled={isReadOnly}
                                    />
                                    {errors.designation && (
                                        <p className="text-sm text-red-500 mt-1">{errors.designation}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="montant">
                                        Montant (CDF) *
                                    </label>
                                    <input
                                        id="montant"
                                        type="number"
                                        value={formData.montant}
                                        onChange={(e) => {
                                            setFormData({...formData, montant: Number(e.target.value)});
                                            if (errors.montant) setErrors({...errors, montant: ''});
                                        }}
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.montant ? 'border-red-500' : ''
                                        }`}
                                        placeholder="0"
                                        min="0"
                                        step="100"
                                        disabled={isReadOnly}
                                    />
                                    {errors.montant && (
                                        <p className="text-sm text-red-500 mt-1">{errors.montant}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Étape 2: Type d'établissement & Description */}
                        {currentStep === 2 && (
                            <div className="space-y-6 py-4">
                                <div>
                                    <label className="block text-sm font-medium mb-3">Type d'établissement *</label>
                                    <div className="space-y-3">
                                        {['public', 'prive', 'tous'].map((etab) => (
                                            <div key={etab} className="flex items-center p-3 border rounded-md hover:bg-gray-50">
                                                <input
                                                    type="checkbox"
                                                    id={`etab-${etab}`}
                                                    checked={formData.etabs.includes(etab as TypeEtablissement)}
                                                    onChange={() => handleEtabChange(etab as TypeEtablissement)}
                                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    disabled={isReadOnly}
                                                />
                                                <label htmlFor={`etab-${etab}`} className="ml-3 text-sm font-medium cursor-pointer">
                                                    {etab === 'public' ? 'Établissements publics' : 
                                                     etab === 'prive' ? 'Établissements privés' : 
                                                     'Tous les établissements'}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.etabs && (
                                        <p className="text-sm text-red-500 mt-2">{errors.etabs}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1" htmlFor="description">
                                        Description *
                                    </label>
                                    <textarea
                                        id="description"
                                        value={formData.description}
                                        onChange={(e) => {
                                            setFormData({...formData, description: e.target.value});
                                            if (errors.description) setErrors({...errors, description: ''});
                                        }}
                                        rows={5}
                                        className={`w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                            errors.description ? 'border-red-500' : ''
                                        }`}
                                        placeholder="Description détaillée du frais..."
                                        disabled={isReadOnly}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-500 mt-1">{errors.description}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Étape 3: Résumé & Validation */}
                        {currentStep === 3 && (
                            <div className="space-y-6 py-4">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-3">Résumé du frais</h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Catégorie:</span>
                                            <span className="font-medium">{formData.categorie}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Désignation:</span>
                                            <span className="font-medium">{formData.designation}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Montant:</span>
                                            <span className="font-medium text-green-600">{formatMontant(formData.montant)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Établissements:</span>
                                            <span className="font-medium">
                                                {formData.etabs.map(e => 
                                                    e === 'public' ? 'Public' : 
                                                    e === 'prive' ? 'Privé' : 
                                                    'Tous'
                                                ).join(', ')}
                                            </span>
                                        </div>
                                        <div className="pt-3 border-t">
                                            <span className="text-gray-600 block mb-2">Description:</span>
                                            <p className="text-sm text-gray-800">{formData.description}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <p className="text-sm text-yellow-800">
                                        <strong>Note:</strong> Les répartitions budgétaires pourront être définies après la création du frais.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Mode View - Affichage des répartitions */}
                        {mode === 'view' && (
                            <div className="space-y-6 py-4">
                                <div className="bg-gray-50 border rounded-lg p-4">
                                    <h3 className="font-semibold mb-3">Informations du frais</h3>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Catégorie:</span>
                                            <span className="font-medium">{formData.categorie}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Désignation:</span>
                                            <span className="font-medium">{formData.designation}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Montant:</span>
                                            <span className="font-medium">{formatMontant(formData.montant)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Établissements:</span>
                                            <span className="font-medium">
                                                {formData.etabs.map(e => 
                                                    e === 'public' ? 'Public' : 
                                                    e === 'prive' ? 'Privé' : 
                                                    'Tous'
                                                ).join(', ')}
                                            </span>
                                        </div>
                                        <div className="pt-2 border-t">
                                            <span className="text-gray-600 block mb-1">Description:</span>
                                            <p className="text-sm">{formData.description}</p>
                                        </div>
                                    </div>
                                </div>

                                {formData.repartitions && formData.repartitions.length > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <h3 className="font-semibold text-green-900 mb-2">Répartitions</h3>
                                        <ul className="space-y-1">
                                            {formData.repartitions.map((rep, index) => (
                                                <li key={index} className="text-sm flex justify-between">
                                                    <span>{rep.entite}</span>
                                                    <span className="font-medium">{rep.quotite}%</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Boutons de navigation */}
                    <div className="flex justify-between items-center pt-6 border-t mt-6">
                        {mode === 'view' ? (
                            <button
                                onClick={() => onClose()}
                                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            >
                                Fermer
                            </button>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    onClick={() => onClose()}
                                    className="px-4 py-2 border rounded-md hover:bg-gray-50"
                                    disabled={isLoading}
                                >
                                    Annuler
                                </button>

                                <div className="flex space-x-3">
                                    {currentStep > 1 && (
                                        <button
                                            type="button"
                                            onClick={handlePrevious}
                                            className="px-4 py-2 border rounded-md hover:bg-gray-50 flex items-center"
                                            disabled={isLoading}
                                        >
                                            <ChevronLeft className="h-4 w-4 mr-1" />
                                            Précédent
                                        </button>
                                    )}

                                    {currentStep < 3 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
                                        >
                                            Suivant
                                            <ChevronRight className="h-4 w-4 ml-1" />
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                                                    Enregistrement...
                                                </>
                                            ) : (
                                                <>
                                                    <Check className="h-4 w-4 mr-2" />
                                                    {mode === 'create' ? 'Créer le frais' : 'Enregistrer'}
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FraisModal;
